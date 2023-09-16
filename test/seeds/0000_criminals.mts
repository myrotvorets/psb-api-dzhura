import { Knex } from 'knex';

const seedData = [
    {
        id: 1,
        slug: 'putin-vladimir-vladimirovich',
        name: 'Путин Владимир Владимирович',
        nname: 'Путін Володимир Володимирович',
        tname: 'Putin Vladimir Vladimirovich',
        sname: 'Путин Владимир Владимирович Путін Володимир Володимирович Putin Vladimir Vladimirovich',
        dob: '1952-10-07',
        country: 'Россия',
        address: 'г. Москва',
        phone: '',
        description: 'ХУЙЛО',
        comments: '',
        active: 1,
        last_modified: '2019-01-01 00:00:00',
    },
    {
        id: 2,
        slug: 'zakharchenko-aleksandr-vladimirovich-2',
        name: 'Захарченко Александр Владимирович',
        nname: 'Захарченко Олександр Володимирович',
        tname: 'Zaharchenko Aleksandr Vladimirovich',
        sname: 'Захарченко Александр Владимирович Захарченко Олександр Володимирович Zaharchenko Aleksandr Vladimirovich',
        dob: '1976-06-26',
        country: 'Украина',
        address: 'Донецкая обл., г. Донецк,',
        phone: '',
        description: 'Курмаршал',
        comments: 'Дошёл до Киева с грунтовыми водами',
        active: 0,
        last_modified: '2019-01-01 00:00:00',
    },
    {
        id: 3,
        slug: 'andreo-sergej-vladimirovich',
        name: 'Андрео Сергей Владимирович',
        nname: 'Андрео Сергій Володимирович; Андрєо Сергій Володимирович',
        tname: 'Andreo Sergej Vladimirovich',
        sname: 'Андрео Сергей Владимирович Андрео Сергій Володимирович Андрєо Сергій Володимирович Andreo Sergej Vladimirovich',
        dob: '0000-00-00',
        country: '',
        address: '',
        phone: '+79780584807',
        description:
            'Активный участник операции российских спецслужб, проводимой весной 2014 года на территории АР Крым',
        comments: '',
        active: 1,
        last_modified: '2019-01-01 00:00:00',
    },
];

export async function seed(knex: Knex): Promise<void> {
    if (!['test', 'development'].includes(process.env.NODE_ENV || '')) {
        throw new Error(`Refusing to run this in ${process.env.NODE_ENV} environment`);
    }

    await knex('criminals').del();
    await knex('criminals').insert(seedData);
}
