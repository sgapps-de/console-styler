import * as os from 'os';

import  { EnvironmentOptions, CommandOptions, 
         envGetter, optsGetter, EnvironmentGetter, CommandOptionsGetter
        } from './command-info';

import { Modifier } from './state';        

export interface TermInfoOptions {

    termType?: string;
    env?:      EnvironmentOptions;
    cmdOpts?:  CommandOptions;
    level?:    number;
}

export interface TermInfoCtorData {

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

        this.termType=this._getTermType(cd);

        this._level=this._getColorLevel(cd);

        if (opts.level!==undefined || this.termType==='test')
            this.level=this._levelForce.bind(this);
        else
            this.level=this._levelTTY.bind(this);

        this.modifier=this._getModifier();        
    }

    protected _levelForce(s: NodeJS.WriteStream): number {

        return this._level;
    }

    protected _levelTTY(s: NodeJS.WriteStream): number {

        return s.isTTY ? this._level : 0;
    }

    protected _level: number;

    protected _getTermType(cd: TermInfoCtorData): string {

        let v:  string | undefined;
        let ct: string | undefined;

        if (cd.opts.termType) return cd.opts.termType.toLowerCase();

        if (process.platform === 'win32') {
            if (v=cd.env('CONEMUANSI'))
                return (v==='ON') ? 'conemu-ansi' : 'conemu-dumb';

            return (cd.env('SESSIONNAME')==='Console') ? 'windows-console' : 'windows-terminal';
        }

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

        return ct || 'dumb';
    }

    protected _getColorLevel(cd: TermInfoCtorData): number {

        if (cd.opts.level)
            return cd.opts.level;

        else if (this._level)
            return this._level;

        const tt = this.termType;
        console.log('tt',tt)

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

        else if (/truecolor|24bit/i.test(this.termType))
            return 3;

        else if (/256/.test(this.termType))
            return 2;

        else if (/color/i.test(this.termType))
            return 1;

        else
            return 0;
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

        else if (tt.startsWith('terminator') || tt.startsWith('xterm'))
            return Modifier.XTERM;

        else
            return Modifier.DEFAULT;
    }
}