import { cleanEnv, port, str } from 'envalid';

export interface Environment {
    NODE_ENV: string;
    PORT: number;
}

let environ: Environment | null = null;

export function environment(reset = false): Environment {
    if (!environ || reset) {
        environ = cleanEnv(process.env, {
            NODE_ENV: str({ default: 'development' }),
            PORT: port({ default: 3000 }),
        });
    }

    return environ;
}
