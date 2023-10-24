import type { Knex } from 'knex';
import { CriminalModel } from '../models/criminal.mjs';
import { CriminalAttachmentModel } from '../models/criminalattachment.mjs';

interface ModelServiceOptions {
    db: Knex;
}

export interface Models {
    criminal: CriminalModel;
    criminalAttachment: CriminalAttachmentModel;
}

export class ModelService {
    private readonly _db: Knex;
    private readonly _criminal: CriminalModel;
    private readonly _criminalAttachment: CriminalAttachmentModel;

    public constructor({ db }: ModelServiceOptions) {
        this._db = db;
        this._criminal = new CriminalModel({ db });
        this._criminalAttachment = new CriminalAttachmentModel({ db });
    }

    public get criminal(): CriminalModel {
        return this._criminal;
    }

    public get criminalAttachment(): CriminalAttachmentModel {
        return this._criminalAttachment;
    }

    public transaction<T = unknown>(
        callback: (trx: Knex.Transaction, models: Models) => void | Promise<T>, // eslint-disable-line @typescript-eslint/no-invalid-void-type
        config?: Knex.TransactionConfig,
    ): Promise<T> {
        return this._db.transaction<T>((trx) => {
            const models: Models = {
                criminal: new CriminalModel({ db: trx }),
                criminalAttachment: new CriminalAttachmentModel({ db: trx }),
            };

            return callback(trx, models);
        }, config);
    }
}
