export type EnvironmentFunction = (v:string) => string | undefined;
export type EnvironmentObject   = { [key: string]: (string | EnvironmentFunction) };
export type EnvironmentOptions  = EnvironmentObject | EnvironmentFunction;
export type EnvironmentGetter   = (v:string) => string | undefined;

export type CommandOptionsFunction = (o:string) => any;
export type CommandOptionsObject   = { [key: string]: (string | boolean | CommandOptionsFunction) };
export type CommandOptions         = object | CommandOptionsFunction;
export type CommandOptionsGetter   = (o:string) => string | boolean;

function splitGetter(f: (d:any, n: string) => any, d: any, n: string): any {

    if (n.indexOf(',')>=0) {
        for (const sn of n.split(',')) {
            const v=f(undefined,sn);
            if (v!==undefined) return v;
        }
        return d;
    }

    return f(d,n);
}

function envObjectGetter(env: EnvironmentObject | typeof process.env, def: any, vn: string): string | undefined {

    let vv: string | EnvironmentFunction | undefined = env[vn];

    if (vv===undefined) vv=env[vn.toUpperCase()];
    if (vv===undefined) vv=env[vn.toLowerCase()];
    if (vv===undefined) vv=env['?'];

    if (typeof vv === 'function') vv=vv(vn);

    return (vv !== undefined) ? vv.toString() : def;
}

function envFunctionGetter(f: EnvironmentFunction, def: any, vn: string): string | undefined {

    let vv: any = f(vn);

    if (vv===undefined) vv=f(vn.toUpperCase());
    if (vv===undefined) vv=f(vn.toLowerCase());

    return (vv !== undefined) ? vv.toString() : def;
}

export function envGetter(env: EnvironmentOptions | undefined): EnvironmentGetter {

    const f = (typeof env === 'function') ?
                   envFunctionGetter.bind(null,env)
              : 
                   envObjectGetter.bind(null,env ?? process.env);

    return splitGetter.bind(null,f,undefined) as EnvironmentGetter;
}

function optsObjectGetter(opts: CommandOptionsObject, def: boolean | undefined, on: string): string | boolean | undefined {

    if (on.charAt(0)==='-') on=on.slice(on.charAt(1)==='-' ? 2 : 1);

    let ov: any = opts[on];

    if (typeof ov === 'function') ov=ov(on);

    if (typeof ov === 'string' || ov === true)
        return ov;
    else if (ov)
        return (ov as any).toString();
    else
        return def;
}

function optsFunctionGetter(opts: CommandOptionsFunction, def: boolean | undefined, on: string): string | boolean | undefined {

    if (on.charAt(0)==='-') on=on.slice(on.charAt(1)==='-' ? 2 : 1);

    let ov: any = opts(on);

    if (typeof ov === 'string' || typeof ov === 'boolean')
        return ov;
    else if (ov!==undefined && ov!==null)
        return (ov as any).toString();
    else
        return def;
}

function optsStandardGetter(def: boolean | undefined, on: string): string | boolean | undefined {

    if (on.charAt(0)==='-') on=on.slice(on.charAt(1)==='-' ? 2 : 1);

    for (let i = 2;i<process.argv.length;++i) {
        let a = process.argv[i];
        if (a.charAt(0)!=='-') continue;
        const m = /^-+([^=]+)(=.*)?$/.exec(a);
        if (m && m[1]===on) return m[2] || true;
    }

    return def;
}

interface CommanderInterface { opts: () => object; }

export function optsGetter(opts: CommandOptions | undefined): CommandOptionsGetter {

    const f = (typeof opts === 'function') ?
                    optsFunctionGetter.bind(null,opts as CommandOptionsFunction)
              : (typeof opts !== 'object') ?
                    optsStandardGetter.bind(null)
              : (opts.constructor.name === 'Commander') ?
                    optsObjectGetter.bind(null,(opts as CommanderInterface).opts() as CommandOptionsObject)
              :
                    optsObjectGetter.bind(null,opts as CommandOptionsObject);

    return splitGetter.bind(null,f,false) as CommandOptionsGetter;
}