/* eslint-disable jest/no-export */
/* eslint-disable jest/valid-title */
/* eslint-disable jest/no-disabled-tests */

import wpautop from 'wpautop';

function replaceCallback(_match: string, p1: string, p2: string): string {
    let ret = '';
    let url = p2;
    if (/[.,;:]/u.test(url.slice(-1))) {
        ret = url.slice(-1);
        url = url.slice(0, -1);
        if (url.endsWith('://')) {
            return p2;
        }
    }

    return `${p1}<a href="${url}">${url}</a>${ret}`;
}

export function makeClickable(s: string): string {
    return ` ${s}`
        .replace(/([\s>])(https?:\/\/[\w\x80-\xff#$%&~/.\-;:=,?@[\]+]+)/gisu, replaceCallback)
        .replace(/(<a( [^>]+?>|>))<a [^>]+?>([^>]+?)<\/a><\/a>/giu, '$1$3</a>')
        .trim();
}

export function autoP(s: string): string {
    return wpautop(s);
}
