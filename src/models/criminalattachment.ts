import { Model, Modifiers, QueryBuilder } from 'objection';

export default class CriminalAttachment extends Model {
    public id!: number;
    public att_id!: number;
    public path!: string;
    public mime_type!: string;

    public static tableName = 'criminal_attachments';

    // eslint-disable-next-line no-use-before-define
    public static modifiers: Modifiers<QueryBuilder<CriminalAttachment>> = {
        findByIds(builder, ids: number[]): void {
            // eslint-disable-next-line no-void
            void builder.whereIn('id', ids).andWhere('mime_type', 'LIKE', 'image/%').orderBy(['id', 'sort_order']);
        },
    };
}
