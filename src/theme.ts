import * as fs from 'fs';
import { type ConsoleStylerBase, type ConsoleStylerOptions } from './console-styler.js';
import  { type EnvironmentOptions, 
          envGetter, type EnvironmentGetter
        } from './command-info.js';

export interface ConsoleStylerThemeOptions {

    var?: string | string[];

    styles?: { [key: string]: string | null } | string[];
    
    env?:       EnvironmentOptions;

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

function nameArray(nx: string | string[] | undefined, d: string | string[]): string[] {

    let nn = nx ?? d;

    if (Array.isArray(nn))
        return nn;
    else
        return nn.split(/[,\s]\s*/g).filter(n => !!n);
}

export function ConsoleStylerSetupTheme(cs: ConsoleStylerBase, cso: ConsoleStylerOptions): void {

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
        const env: EnvironmentGetter = envGetter(tOpts.env ?? cso.env);
        const vv = nameArray(tOpts.var,[]);
        for (const v of vv) {
            themeVarStyles(styles,v,env);
        }
    }

    for (const s in styles) {
        const v: any = styles[s];
        cs.alias(s,v ? v.toString() : 'none');
    }
}