import { Model } from 'objection';
import { autoP, makeClickable } from '../lib/textutils.mjs';
import Criminal from '../models/criminal.mjs';
import CriminalAttachment from '../models/criminalattachment.mjs';

export interface SearchItem {
    id: number;
    link: string;
    name: string;
    nname: string;
    dob?: string;
    country?: string;
    address?: string;
    description: string;
    thumbnail?: string;
}

export default class SearchService {
    public static async search(name: string): Promise<SearchItem[] | null> {
        const n = SearchService.prepareName(name);
        if (!n) {
            return null;
        }

        const [rows, atts] = await Model.transaction(async (trx) => {
            const criminals = await Criminal.query(trx).modify('searchByName', n, 10);
            if (!criminals.length) {
                return [null, null];
            }

            const ids = criminals.map((x) => x.id);
            const attachments = await CriminalAttachment.query(trx).modify('findByIds', ids);
            return [criminals, attachments];
        });

        if (rows) {
            const thumbs = SearchService.getThumbnails(atts);
            return SearchService.prepareResult(rows, thumbs);
        }

        return [];
    }

    private static prepareResult(criminals: Criminal[], thumbs: Record<number, string>): SearchItem[] {
        return criminals.map((item) => {
            const entry: SearchItem = {
                id: item.id,
                name: item.name,
                nname: item.nname,
                link: item.link,
                description: autoP(makeClickable(item.description)),
            };

            if (item.dob !== '0000-00-00') {
                entry.dob = item.dob;
            }

            if (item.country && item.address) {
                entry.country = item.country;
                entry.address = item.address;
            }

            if (typeof thumbs[item.id] !== 'undefined') {
                entry.thumbnail = `https://cdn.myrotvorets.center/m/${thumbs[item.id]}`;
            }

            return entry;
        });
    }

    protected static prepareName(s: string): string | null {
        s = s
            .replace(/[^\p{L}]/gu, ' ')
            .replace(/\s+/gu, ' ')
            .trim()
            .toLowerCase();

        const parts: string[] = [...new Set(s.split(' '))];
        if (parts.length < 2) {
            return null;
        }

        let name = `>"${parts.join(' ')}"`;
        if (parts.length > 2) {
            name += ` "${parts[0]} ${parts[1]}"`;
        }

        parts[0] = `+${parts[0]}`;
        parts[1] = `+${parts[1]}`;
        name += ` ${parts.join(' ')}`;

        return name;
    }

    protected static getThumbnails(atts: readonly CriminalAttachment[]): Record<number, string> {
        return atts.reduce<Record<number, string>>((result, { id, path }) => {
            if (result[id] === undefined) {
                result[id] = path.replace(/(\.[a-z]+)$/u, '-150x150$1');
            }

            return result;
        }, {});
    }
}
