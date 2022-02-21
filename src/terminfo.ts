import * as os from 'os';
import { inspect } from 'util';

import  { type EnvironmentOptions, type CommandOptions, 
          envGetter, optsGetter, EnvironmentGetter, CommandOptionsGetter
        } from './command-info.js';

import { Modifier } from './state.js';        

export interface TermInfoOptions {

    term?:      string;
    env?:       EnvironmentOptions;
    cmdOpts?:   CommandOptions;
    level?:     number;
    levelOpts?: string | string[]; 
    levelVars?: string | string[]; 
}

interface TermInfoCtorData {

    opts:    TermInfoOptions;
    env:     EnvironmentGetter;
    cmdOpts: CommandOptionsGetter;
}

export class TermInfo {

    termType: string;

    level: (s: NodeJS.WriteStream) => number;

    modifier: Modifier;

    constructor(opts: TermInfoOptions) {

        const cd: TermInfoCtorData = {
            opts: opts ?? {},
            env: envGetter(opts.env),
            cmdOpts: optsGetter(opts.cmdOpts),
        };

        this._level=-1;

        this.termType=this._getTermType(cd);

        this._level=this._getColorLevel(cd);

        if (opts.level!==undefined || this.termType==='test')
            this.level=this._levelSet.bind(this);
        else
            this.level=this._levelStream.bind(this);

        this.modifier=this._getModifier();        
    }

    protected _levelSet(s?: NodeJS.WriteStream): number {

        return this._level;
    }

    protected _levelStream(s?: NodeJS.WriteStream): number {

        return (!s || s.isTTY) ? this._level : 0;
    }

    protected _level: number;

    protected _getTermType(cd: TermInfoCtorData): string {

        let v:  string | undefined;
        let ct: string | undefined;

        if (cd.opts.term) return cd.opts.term.toLowerCase();

        ct=cd.env('COLORTERM')?.toLowerCase();

        if (cd.env('TERMINATOR_UUID')) return 'terminator'+(ct ? '-'+ct : '');

        if (v=cd.env('TERM')) {
            v=v.toLowerCase();
            if (ct) {
                if (v.startsWith('xterm'))
                    v='xterm-'+ct;
                else if (!/color|bit/i.test(v))
                    v=v+'-'+ct;
            }
            return v;
        }

        if (ct) return ct;

        if (process.platform === 'win32') {
            if (v=cd.env('ConEmuANSI'))
                return (v==='ON') ? 'conemu-ansi' : 'conemu-dumb';

            return (cd.env('SESSIONNAME')==='Console') ? 'windows-console' : 'windows-terminal';
        }

        return 'dumb';
    }

    protected _levelForce(v: string, d: number = 0): number {

        if (/^[0-3]$/.test(v))
            return parseInt(v);
        else if (/truecolor|16m|24bit/i.test(v))
            return 3;
        else if (/256|8bit/i.test(v))
            return 2;
        else if (/color|4bit/i.test(v))
            return 1;
        else if (/no/i.test(v))
            return 0;
        else
            return d;
    }

    protected _nameArray(nx: string | string[] | undefined, d: string, dt: string): string[] {

        let nn = nx ?? (this.termType==='test' ? dt : d);

        if (Array.isArray(nn))
            return nn;
        else
            return nn.split(/[,\s]\s*/g).filter(n => !!n);
    }

    protected _getColorFromEnv(cd: TermInfoCtorData): number {

        let va = this._nameArray(cd.opts.levelVars,'FORCE_COLOR', 'TEST_FORCE_COLOR');

        for (let i = va.length-1;i>=0;--i) {
            let vn: string = va[i];
            let vt: string;
            let p: number;
            if ((p=vn.indexOf('='))>=0) { vt=vn.slice(p+1); vn=vn.slice(0,p); }
            else                          vt=vn;
            const vv = cd.env(vn);
            if (!vv) continue;
            if (/force/i.test(vt))
                return this._levelForce(vv);
            else if (/no/i.test(vt))
                return 0;
            else
                return -1;
        }
        
        return -1;
    }

    protected _getColorFromOpts(cd: TermInfoCtorData): number {

        let oa = this._nameArray(cd.opts.levelOpts,'np-color color', 'test-no-color test-color');

        for (let i = oa.length-1;i>=0;--i) {
            let on: string = oa[i];
            let ot: string;
            let p: number;
            if ((p=on.indexOf('='))>=0) { ot=on.slice(p+1); on=on.slice(0,p); }
            else                          ot=on;
            const ov = cd.cmdOpts(on);
            if (ov===undefined || ov===null || ov===false) continue;
            console.log("Opt:",on,inspect(ov)," ot="+ot);
            if (/no/i.test(ot))
                return 0;
            else if (ot==='?')
                return -1;
            else
                return this._levelForce(ov.toString());
        }
        
        return -1;
    }

    protected _getColorLevel(cd: TermInfoCtorData): number {

        let lv: number;

        if (cd.opts.level)
            return cd.opts.level;

        else if ((lv=this._getColorFromOpts(cd))>=0)
            return lv;

        else if ((lv=this._getColorFromEnv(cd))>=0)
            return lv;

        else if (this._level>=0)
            return this._level;

        const tt = this.termType;

        if (tt==='test')
            return 3;
    
        else if (tt==='windows-terminal')
            return 3;

        else if (tt==='windows-console') {
            const osr = os.release().split('.');
            if (Number(osr[0]) >= 10 && Number(osr[2]) >= 10586)
                return Number(osr[2]) >= 14931 ? 3 : 2;
            else
                return 1;
        }
        else if (tt==='terminator' || tt=='xterm')
            return 3;

        else if (tt==='conemu-ansi')
            return 1;

        else
            return this._levelForce(tt);
    }

    protected _getModifier() {

        if (this.modifier)
            return this.modifier;

        const tt = this.termType;

        if (tt==='test')
            return Modifier.STANDARD;

        else if (tt==='windows-terminal')
            return Modifier.WIN_TERM;

        else if (tt==='windows-console')
            return Modifier.WIN_CON;

        else if (tt==='conemu-ansi')
            return Modifier.CON_EMU;

        else if (tt.startsWith('terminator') || tt.startsWith('xterm'))
            return Modifier.XTERM;

        else
            return Modifier.DEFAULT;
    }
}