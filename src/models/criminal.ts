import { Model, Modifiers, QueryBuilder } from 'objection';

export default class Criminal extends Model {
    public id!: number;
    public slug!: string;
    public name!: string;
    public nname!: string;
    public dob!: string;
    public country!: string;
    public address!: string;
    public description!: string;

    public static tableName = 'criminals';

    // eslint-disable-next-line no-use-before-define
    public static modifiers: Modifiers<QueryBuilder<Criminal>> = {
        searchByName(builder, s: string, n: number): void {
            // eslint-disable-next-line no-void
            void builder
                .where('active', 1)
                .andWhereRaw('MATCH (sname) AGAINST (? IN BOOLEAN MODE)', s)
                .orderByRaw(`MATCH (sname) AGAINST (? IN BOOLEAN MODE) DESC`, s)
                .limit(n);
        },
    };

    public get link(): string {
        return `https://myrotvorets.center/criminal/${this.slug}/`;
    }
}
