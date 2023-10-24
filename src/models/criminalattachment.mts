import type { Knex } from 'knex';

export interface CriminalAttachment {
    id: number;
    att_id: number;
    path: string;
    mime_type: string;
}

interface ModelOptions {
    db: Knex<CriminalAttachment, CriminalAttachment[]> | Knex.Transaction<CriminalAttachment, CriminalAttachment[]>;
}

export class CriminalAttachmentModel {
    public static readonly tableName = 'criminal_attachments';

    private readonly db: Knex<CriminalAttachment, CriminalAttachment[]>;

    public constructor({ db }: ModelOptions) {
        this.db = db;
    }

    public byIds(ids: number[]): Promise<CriminalAttachment[]> {
        return this.db(CriminalAttachmentModel.tableName)
            .whereIn('id', ids)
            .andWhere('mime_type', 'LIKE', 'image/%')
            .orderBy(['id', 'sort_order']);
    }
}

declare module 'knex/types/tables.js' {
    interface Tables {
        [CriminalAttachmentModel.tableName]: CriminalAttachment;
    }
}
