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

    termType: string

    level: number;

    modifier: Modifier;

    constructor(opts: TermInfoOptions) {

        const cd: TermInfoCtorData = {
            opts: opts ?? {},
            env: envGetter(opts.env),
            cmdOpts: optsGetter(opts.cmdOpts),
        }

        this.termType=this._getTermType(cd);

        this.level=opts.level ?? this._getColorLevel(cd);

        this.modifier=this._getModifier();        
    }

    protected _getTermType(cd: TermInfoCtorData): string {

        let v: string | undefined;

        if (cd.opts.termType) return cd.opts.termType.toLowerCase();

        if (v=cd.env('TERM')) {
            v=v.toLowerCase();
            return 'color';
        }

        if (process.platform === 'win32') {
            if (v=cd.env('CONEMUANSI'))
                return (v==='ON') ? 'conemu-ansi' : 'conemu-dumb';

            return (cd.env('SESSIONNAME')==='Console') ?
                        'windows-console'
                    :
                        'windows-terminal';
        }

        return 'dumb';
    }

    protected _getColorLevel(cd: TermInfoCtorData): number {

        if (cd.opts.level)
            return cd.opts.level;

        else if (this.level)
            return this.level;

        else if (this.termType==='test')
            return 3;

        else if (this.termType==='windows-terminal')
            return 3;

        else if (this.termType==='windows-console') {
            const osr = os.release().split('.');
            if (Number(osr[0]) >= 10 && Number(osr[2]) >= 10586)
                return Number(osr[2]) >= 14931 ? 3 : 2;
            else
                return 1;
        }

        else if (this.termType==='conemu-ansi')
            return 1;
        
        else if (this.termType==='truecolor')
            return 3;

        else if (this.termType==='color256')
            return 2;
        
        else if (this.termType==='color')
            return 1;

        else
            return 0;
    }

    protected _getModifier() {

        if (this.modifier)
            return this.modifier;

        else if (this.termType==='test')
            return Modifier.STANDARD;

        else if (this.termType==='windows-terminal')
            return Modifier.WIN_TERM;

        else if (this.termType==='windows-console')
            return Modifier.WIN_CON;
       
        else
            return Modifier.DEFAULT;
    }
}