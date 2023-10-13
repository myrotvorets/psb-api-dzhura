import { Model, type Modifiers, type QueryBuilder } from 'objection';

export class CriminalAttachment extends Model {
    public id!: number;
    public att_id!: number;
    public path!: string;
    public mime_type!: string;

    public static override tableName = 'criminal_attachments';

    public static override modifiers: Modifiers<QueryBuilder<CriminalAttachment>> = {
        findByIds(builder, ids: number[]): void {
            void builder.whereIn('id', ids).andWhere('mime_type', 'LIKE', 'image/%').orderBy(['id', 'sort_order']);
        },
    };
}
