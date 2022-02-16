import * as fs from 'fs';
import ConsoleStyler, { type ConsoleStylerOptions } from './console-styler';
import  { envGetter, EnvironmentGetter } from './command-info';

export interface ConsoleStylerThemeOptions {

    var?: string | string[];

    styles?: { [key: string]: string | null } | string[];
    
}

function themeFileStyles(styles: any, f: string) {

    const ft = fs.readFileSync(f,"utf-8");
    const jd = JSON.parse(ft);

    for (const s in jd) {
        const v = jd[s];
        if (typeof v==='string')
            styles[s]=v;
    }
}

function themeVarStyles(styles: any, v: string, env: EnvironmentGetter ): void {

    const vvv: string | undefined = env(v);
    
    if (!vvv) return;

    if (vvv.charAt(0)==='@') {
        themeFileStyles(styles,vvv.slice(1));
    }
    else {
        const va = vvv.split(vvv.indexOf(':')>=0 ? ':' : ';');

        for (let vv of va) {
            vv=vv.trim();
            if (vv.indexOf('=')>=0) {
                const va = vv.split('=');
                styles[va[0]]=va[1];
            }
        }
    }
}

export function ConsoleStylerSetupTheme(cs: ConsoleStyler, cso: ConsoleStylerOptions): void {

    if (!cso.theme) return;

    let tOpts:ConsoleStylerThemeOptions = cso.theme;
    let styles: any = {};

    if (Array.isArray(tOpts.styles)) {
        for (const s of tOpts.styles) {
            if (s.indexOf('=')>=0) {
                const sa = s.split('=');
                styles[sa[0]]=sa[1];
            }
            else {
                styles[s]=null;
            }
        }
    }
    else {
        styles={... tOpts.styles};
    }

    if (tOpts.var) {
        const env: EnvironmentGetter = envGetter(cso.env);
        if (Array.isArray(tOpts.var)) {
            for (const v of tOpts.var)
                themeVarStyles(styles,v,env);
        }
        else
            themeVarStyles(styles,tOpts.var,env);
    }

    for (const s in styles) {
        const v: any = styles[s];
        cs.alias(s,v ? v.toString() : 'none');
    }
}