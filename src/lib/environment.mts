import { cleanEnv, port, str, url } from 'envalid';

export interface Environment {
    NODE_ENV: string;
    PORT: number;
    IMAGE_CDN_PREFIX: string;
}

let environ: Environment | null = null;

export function environment(reset = false): Environment {
    if (!environ || reset) {
        environ = cleanEnv(process.env, {
            NODE_ENV: str({ default: 'development' }),
            PORT: port({ default: 3000 }),
            IMAGE_CDN_PREFIX: url({ default: 'https://cdn.myrotvorets.center/m/' }),
        });
    }

    return environ;
}
