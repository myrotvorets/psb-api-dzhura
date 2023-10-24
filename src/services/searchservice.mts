import { autoP, makeClickable } from '../lib/textutils.mjs';
import { Criminal } from '../models/criminal.mjs';
import { CriminalAttachment } from '../models/criminalattachment.mjs';
import { ModelService } from './modelservice.mjs';
import type { SearchItem, SearchServiceInterface } from './searchserviceinterface.mjs';

export type { SearchItem };

interface SearchServiceOptions {
    modelService: ModelService;
    cdnPrefix: string;
    urlPrefix: string;
}

export class SearchService implements SearchServiceInterface {
    private readonly cdnPrefix: string;
    private readonly modelService: ModelService;
    private readonly urlPrefix: string;

    public constructor({ cdnPrefix, modelService, urlPrefix }: SearchServiceOptions) {
        this.cdnPrefix = cdnPrefix;
        this.modelService = modelService;
        this.urlPrefix = urlPrefix;
    }

    public async search(name: string): Promise<SearchItem[] | null> {
        const n = SearchService.prepareName(name);
        if (!n) {
            return null;
        }

        const [rows, atts] = await this.modelService.transaction<[Criminal[], CriminalAttachment[]]>(
            async (_trx, { criminal, criminalAttachment }) => {
                const criminals = await criminal.searchByName(n, 10);
                if (!criminals.length) {
                    return [[], []];
                }

                const ids = criminals.map((x) => x.id);
                const attachments = await criminalAttachment.byIds(ids);
                return [criminals, attachments];
            },
            { readOnly: true },
        );

        if (rows.length) {
            const thumbs = SearchService.getThumbnails(atts);
            return this.prepareResult(rows, thumbs);
        }

        return [];
    }

    private prepareResult(criminals: Criminal[], thumbs: Record<number, string>): SearchItem[] {
        return criminals.map((item) => {
            const entry: SearchItem = {
                id: item.id,
                name: item.name,
                nname: item.nname,
                link: `${this.urlPrefix}${item.slug}/`,
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
                entry.thumbnail = `${this.cdnPrefix}${thumbs[item.id]}`;
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
