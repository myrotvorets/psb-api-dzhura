import type { Knex } from 'knex';

const seedData = [
    {
        id: 1,
        att_id: 2,
        path: 'criminals/00/37/41/КТО-СКАЗАЛ-ЧТО-ПУТИН-СУМАСШЕДШИЙ-2.jpg',
        mime_type: 'image/jpeg',
        sort_order: 13,
    },
    {
        id: 1,
        att_id: 3,
        path: 'criminals/00/37/41/8080697A-7B9B-492D-87C4-4EF55F1546A5_mw1024_n_s.jpg',
        mime_type: 'image/jpeg',
        sort_order: 4,
    },
    { id: 1, att_id: 4, path: 'criminals/00/37/41/npy5cznk8mvo.jpg', mime_type: 'image/jpeg', sort_order: 14 },
    { id: 1, att_id: 5, path: 'criminals/00/37/41/Screenshot_108.png', mime_type: 'image/jpeg', sort_order: 16 },
    {
        id: 1,
        att_id: 6,
        path: 'criminals/00/37/41/criminals/00/37/41/543aefe08dd8d_5425033dcb00e_zakonoproekt-ne-predusmatrivaet-perechen-netsenzurnih-slov-kotorie-zapreshchaetsya-ispolzovat-v-SMI.jpg',
        mime_type: 'image/jpeg',
        sort_order: 6,
    },
    { id: 1, att_id: 7, path: 'criminals/00/37/41/680_5702b61622d86.jpg', mime_type: 'image/jpeg', sort_order: 7 },
    { id: 1, att_id: 8, path: 'criminals/00/37/41/1451525755_putin.jpg', mime_type: 'image/jpeg', sort_order: 8 },
    { id: 1, att_id: 9, path: 'criminals/00/37/41/f_7696.jpg', mime_type: 'image/jpeg', sort_order: 9 },
    { id: 1, att_id: 10, path: 'criminals/00/37/41/hqdefault.jpg', mime_type: 'image/jpeg', sort_order: 5 },
    { id: 1, att_id: 11, path: 'criminals/00/37/41/img_50247fffa5534dc.jpg', mime_type: 'image/jpeg', sort_order: 1 },
    {
        id: 1,
        att_id: 12,
        path: 'criminals/00/37/41/0_9acf5_10c20f0c_L_zpsbbf9285b.jpg',
        mime_type: 'image/jpeg',
        sort_order: 2,
    },
    { id: 1, att_id: 13, path: 'criminals/00/37/41/1E76206_1.jpg', mime_type: 'image/jpeg', sort_order: 3 },
    {
        id: 1,
        att_id: 14,
        path: 'criminals/00/37/41/ai-231835-aux-head-20161121_putin_360.jpg',
        mime_type: 'image/jpeg',
        sort_order: 11,
    },
    { id: 1, att_id: 15, path: 'criminals/00/37/41/Путин-идиот.jpg', mime_type: 'image/jpeg', sort_order: 10 },
    { id: 1, att_id: 16, path: 'criminals/00/37/41/putin_34_1.jpg', mime_type: 'image/jpeg', sort_order: 12 },
    {
        id: 1,
        att_id: 17,
        path: 'criminals/00/37/41/50475-cbeffd4b02aab18f6f4064e3b816f56e.jpg',
        mime_type: 'image/jpeg',
        sort_order: 15,
    },

    {
        id: 2,
        att_id: 18,
        path: 'criminals/00/25/b9/19-zaharchenko-010.jpg',
        mime_type: 'image/jpeg',
        sort_order: 1,
    },
    {
        id: 2,
        att_id: 19,
        path: 'criminals/00/25/b9/mvs-14227362120309.jpg',
        mime_type: 'image/jpeg',
        sort_order: 2,
    },
    {
        id: 2,
        att_id: 20,
        path: 'criminals/00/25/b9/psb-archive-9657.zip',
        mime_type: 'application/zip',
        sort_order: 3,
    },
];

export async function seed(knex: Knex): Promise<void> {
    if (!['test', 'development'].includes(process.env['NODE_ENV'] ?? '')) {
        throw new Error(`Refusing to run this in ${process.env['NODE_ENV']} environment`);
    }

    await knex('criminal_attachments').del();
    await knex('criminal_attachments').insert(seedData);
}
