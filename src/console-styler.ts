import * as util from 'util';
import * as Colors from './colors.js';
import  { type EnvironmentOptions, type CommandOptions } from './command-info.js';
import { Modifier, State, Settings, StateStringList,
         ANSI_SGR_REGEXP_GLOBAL, ANSI_NO_STATE, ANSI_NO_STATE_FINAL, ANSI_NO_SETTINGS,
         sgrPars2Settings, settingsOverwrite,
        } from './state.js';
import { TermInfo, type TermInfoOptions } from './terminfo.js';
import { ConsoleStylerSetupTheme, type ConsoleStylerThemeOptions } from './theme.js';

export type ConsoleStyleFunction = (s: string | StateStringList, cs: ConsoleStylerBase) => string | StateStringList;
export type ConsoleStyleStringFunction = (s: string) => string;
export type ConsoleStyleListFunction = (s: StateStringList) => StateStringList;
export type ConsoleStyleAliasFunction = ConsoleStyleFunction | ConsoleStyleStringFunction | ConsoleStyleListFunction;

export type consoleStyleApply = (... args: any) => string;
export type ConsoleStyles = { [key: string]: ConsoleStyle };

export type ConsoleStyleExtraInterface = {

    level: number;

    n(sn:string): ConsoleStyle;

    rgb(r: number, g:number, b: number): ConsoleStyle;
    hex(h: string): ConsoleStyle;
    ansi256(c: number): ConsoleStyle;
    ansi16(c: number): ConsoleStyle;

    bgRgb(r: number, g:number, b: number): ConsoleStyle;
    bgHex(h: string): ConsoleStyle;
    bgAnsi256(c: number): ConsoleStyle;
    bgAnsi16(c: number): ConsoleStyle;

}

export type ConsoleStyle = consoleStyleApply & ConsoleStyles & ConsoleStyleExtraInterface

export type ConsoleStylerExtraInterface = ConsoleStyleExtraInterface & {

    modifier: Modifier;
    multiFmt: boolean;

    alias(n: string | { [key: string]: ConsoleStyle | string }, s?: ConsoleStyle | string | ConsoleStyleAliasFunction, fType?: string): void;

    setFormat(fx: string | [ string, string ] | [ string, string, string ] | RegExp, fxb?: string, fxc?: string): void;

    ctrlStyle(n: string | { [key: string]: ConsoleStyle | string }, s?: ConsoleStyle | string | ConsoleStyleAliasFunction, fType?: string): void;
    ctrlName(n: string | { [key: string]: ControlName }, cn?: ControlName): void;
}

export type ConsoleStyler = ConsoleStyle & ConsoleStylerExtraInterface;

export type ConsoleStylerConstructor = new (opts?: any) => ConsoleStyler;

type ConsoleStyleSettingsList = (Settings | ConsoleStyleFunction)[];
type ConsoleStyleSettings = Settings | ConsoleStyleSettingsList;
type ConsoleStyleSpecialFactory = (nn: string, ss: ConsoleStyleSettings) => ConsoleStyle;

interface ConsoleStyleData {

    styler: ConsoleStylerBase;
    style:  (n: string) => ConsoleStyle;
    set:    ConsoleStyleSettings;
    prop:   any;

}

const __SETTINGS = Symbol('__SETTINGS');
const __STYLER   = Symbol('__STYLER');

class ConsoleStyleHandler {

    get(sd: ConsoleStyleData, pn: string) {

        let v: any;

        if ((v=sd.prop[pn])!==undefined) return v;

        return sd.prop[pn]=sd.style(pn);
    }

    set(sd: ConsoleStyleData, pn: string, val: any): boolean {

        switch(pn) {
            case 'level':
                sd.styler.level=val;
                return true;
        }

        throw new Error(`unexpected assignment to property '${pn}'`);
    }
}

const consoleStyleHandler = new ConsoleStyleHandler;

type StandardStyleFunctionEx = { f: Function; bg: boolean; };

type StandardStyleFunction   = { f: ConsoleStyleAliasFunction; ft: string; };
type StandardStyleDefinition = Settings | (Settings | number)[] | StandardStyleFunction | string | number;

const STANDARD_UNDERLINE     = [ { ms:Modifier.UNDERLINE, mm: Modifier.ANY_UNDERLINE, mr: 0 }, Modifier.UNDERLINE ];
const STANDARD_DBL_UNDERLINE = [ { ms:Modifier.DOUBLE_UNDERLINE, mm: Modifier.ANY_UNDERLINE, mr: 0 }, Modifier.UNDERLINE ];

const STANDARD_STYLES : { [key: string]: StandardStyleDefinition } = {

    none:       { ms: 0, mm: 0, mr: 0},

    bold:       [ { ms:Modifier.BOLD, mm: Modifier.BOLD_DIM, mr: 0 }, Modifier.BOLD ],
    dim:        [ { ms:Modifier.DIM, mm: Modifier.BOLD_DIM, mr: 0 } ],
    italic:     Modifier.ITALIC,
    underline:  STANDARD_UNDERLINE,
    ul:         STANDARD_UNDERLINE,
    doubleUnderline: STANDARD_DBL_UNDERLINE,
    dblUl:      STANDARD_DBL_UNDERLINE,
    blink:      [ { ms: Modifier.BLINK, mm: Modifier.ANY_BLINK, mr: 0 }, Modifier.BLINK ],
    rapidBlink: [ { ms: Modifier.RAPID_BLINK, mm: Modifier.ANY_BLINK, mr: 0 }, Modifier.BLINK ],
    strikeThrough: [ Modifier.STRIKE_THROUGH ],
    strikethrough: Modifier.STRIKE_THROUGH,
    strike:     Modifier.STRIKE_THROUGH,
    inverse:    Modifier.INVERSE,
    hidden:     Modifier.HIDDEN,
    overline:   Modifier.OVERLINE,

    not:        Modifier.NOT_MODIFIER,
    bg:         Modifier.BACKGROUND,
    dark:       Modifier.DARK,
    bright:     Modifier.BRIGHT,

    final:      Modifier.FINAL,

    black: '30', red: '31', green: '32', yellow: '33', blue: '34', 
    magenta: '35', cyan: '36', white: '37', gray: '90', grey: '90',

    blackBright: '90', redBright: '91', greenBright: '92', yellowBright: '93', blueBright: '94', 
    magentaBright: '95', cyanBright: '96', whiteBright: '97',

    bgBlack: '40', bgRed: '41', bgGreen: '42', bgYellow: '43', bgBlue: '44', 
    bgMagenta: '45', bgCyan: '46', bgWhite: '47', bgGray: '100', bgGrey: '100',

    bgBlackBright: '100', bgRedBright: '101', bgGreenBright: '102', bgYellowBright: '103', bgBlueBright: '104', 
    bgMagentaBright: '105', bgCyanBright: '106', bgWhiteBright: '107',

    upper:     { f: (s:string) => s.toUpperCase(), ft: 'SL' },
    lower:     { f: (s:string) => s.toLowerCase(), ft: 'SS' },

}

export type ControlName  = string | ((s: string) => string);

export interface ConsoleStylerOptions {

    level?:       number;

    term?:        TermInfo | TermInfoOptions | string;
    modifier?:    Modifier;

    stderr?:      boolean,

    multiFmt?:    boolean,

    format?:      RegExp | [ string, string, string] | [string, string],

    env?:         EnvironmentOptions,
    cmdOpts?:     CommandOptions,

    alias?:     { [key: string]: ConsoleStyle | string },
    ctrlStyle?: { [key: string]: ConsoleStyle | string },
    ctrlName?:  { [key: string]: ControlName },

    theme?:       ConsoleStylerThemeOptions,
}

export class ConsoleStylerBase {

    level!: number;

    multiFmt!: boolean;

    term!: TermInfo;    
    modifier!: Modifier;

    out!: NodeJS.WriteStream;
    stderr!: boolean;

    constructor() {
    }

    Setup(opts?: ConsoleStylerOptions) {

        opts=opts ?? {};

        if (opts.term instanceof TermInfo)
            this.term=opts.term;
        else {
            let tio: TermInfoOptions;
            if (typeof opts.term === 'string')
                tio={ term: opts.term };
            else if (typeof opts.term === 'object')
                tio={ ...opts.term };
            else
                tio={};
            if (!tio.env) tio.env=opts.env;
            if (!tio.cmdOpts) tio.cmdOpts=opts.cmdOpts;
            this.term=new TermInfo(tio);
        }

        this.stderr=!!opts.stderr;
        this.out=this.stderr ? process.stderr : process.stdout;

        this.level=opts.level ?? this.term.level(this.out);
        this.modifier=opts.modifier ?? this.term.modifier;

        this.multiFmt=opts.multiFmt ?? false;

        this._initialState = ANSI_NO_STATE;

        this._byNameCache=new Map<string, Settings>();
        this._styleCache=new Map<string, ConsoleStyle>();

        this._ctrlStyle={};
        this._ctrlName={ '\n': '\\n', '\r': '\\r',  '?': this._ctrlNameStd };
        this._ctrlNameCache={};

        this.alias=this.alias.bind(this);
        this.setFormat=this.setFormat.bind(this);
        this.ctrlName=this.ctrlName.bind(this);
        this.ctrlStyle=this.ctrlStyle.bind(this);
        this.n=this.n.bind(this);
        this.f=this.f.bind(this);
        this.fx=this.fx.bind(this);
    
        this._emptyStyle=this._settingsStyle(ANSI_NO_SETTINGS);

        if (!STANDARD_STYLES.visible) this._standardFunctions();

        this.setFormat(opts.format ?? ['{{','}}','|']);

        if (opts.alias) this.alias(opts.alias);
        if (opts.ctrlStyle) this.ctrlStyle(opts.ctrlStyle);
        if (opts.ctrlName) this.ctrlName(opts.ctrlName);

        if (opts.theme) ConsoleStylerSetupTheme(this,opts);
    }

    alias(n: string | { [key: string]: ConsoleStyle | string }, s?: ConsoleStyle | string | ConsoleStyleAliasFunction, fType: string = 'S'): void {

        if (typeof n !== 'string') {
            for (const sn in n) this.alias(sn,n[sn]);
            return;
        }

        if (typeof s === 'string')
            (this as any)[n]=this._styleByName(undefined,s);
        else if ((s as any)[__STYLER]===this)
            (this as any)[n]=s;
        else if ((s as any)[__STYLER]!==undefined)
            throw new Error(`alias(${n}) - style from wrong styler`)
        else if (typeof s === 'function')
            s=this._functionStyle(s,fType);
        else
            throw new Error(`alias(${n}) - invalid style`)
    }

    n(sn: string): ConsoleStyle {

        const sx: ConsoleStyleSettings = this._byName(sn);

        return this._settingsStyle(sx);
    }

    f(... sx: any[]): string {

        if (sx[0].raw) return this._tFormat(sx[0],sx.slice(1),ANSI_NO_STATE_FINAL);
        else           return this._format(this._applyArgs(sx),ANSI_NO_STATE_FINAL);
    }

    fx(... sx: any[]): string {

        if (sx[0].raw) return this._tFormat(sx[0],sx.slice(1),ANSI_NO_STATE);
        else           return this._format(this._applyArgs(sx),ANSI_NO_STATE);
    }

    setFormat(fx: string | [ string, string ] | [ string, string, string ] | RegExp, fxb?: string, fxc?: string) {

        if (typeof fx==='string') {
            if (fxb) fx=[fx, fxb, fxc ?? '|'];
            else     fx=fx.split(' ') as [ string, string, string];
        }

        if (Array.isArray(fx)) {
            const fx2 = fx[2] ?? '|';
            const fxx = fx[1].split('').reduce((r,x) => r.indexOf(x)<0 ? r+x : r,fx2);
            const rx = '(?:' +
                       this._escapeRegExp(fx[0]) +
                       '([^'+this._escapeRegExpGroup(fxx)+']+)' + 
                       this._escapeRegExp(fx2) +
                       ')|' +
                       this._escapeRegExp(fx[1]) +
                       '';
            this._fmtRex=new RegExp(rx);
        }
        else
            this._fmtRex=fx;
    }

    ctrlStyle(n: string | { [key: string]: ConsoleStyle | string }, s?: ConsoleStyle | string | ConsoleStyleAliasFunction, fType: string = 'S'): void {

        if (typeof n !== 'string') {
            for (const sn in n) this.ctrlStyle(sn,n[sn]);
            return;
        }

        if (typeof s === 'string')
            s=this.n(s);
        else if (typeof s === 'function')
            s=this._functionStyle(s,fType);

        if (s && s!==this._emptyStyle)
            this._ctrlStyle[n]=s as ConsoleStyle;
        else
            delete this._ctrlStyle[n];

        if (n==='?')
            this._ctrlNameCache={};
        else 
            delete this._ctrlNameCache[n];
    }

    ctrlName(n: string | { [key: string]: ControlName }, cn?: ControlName): void {

        if (typeof n !== 'string') {
            for (const sn in n) this.ctrlName(sn,n[sn]);
            return;
        }
    
        if (cn)
            this._ctrlName[n]=cn;
        else
            delete this._ctrlName[n];

        if (n==='?')
            this._ctrlNameCache={};
        else 
            delete this._ctrlNameCache[n];
    }

/********************************** PROTECTED ************************************************/    

    /* protected */ _initialState!: State;
    protected _emptyStyle!: ConsoleStyle;

    protected static _styleFunction : { [key: string]: StandardStyleFunctionEx  } = {

        rgb:       { f:ConsoleStylerBase._rgbStyleFunc, bg: false },
        bgRgb:     { f:ConsoleStylerBase._rgbStyleFunc, bg: true },
        hex:       { f:ConsoleStylerBase._hexStyleFunc, bg: false },
        bgHex:     { f:ConsoleStylerBase._hexStyleFunc, bg: true },
        ansi256:   { f:ConsoleStylerBase._ansi256StyleFunc, bg: false },
        bgAnsi256: { f:ConsoleStylerBase._ansi256StyleFunc, bg: true },
        ansi16:    { f:ConsoleStylerBase._ansi16StyleFunc, bg: false },
        bgAnsi16:  { f:ConsoleStylerBase._ansi16StyleFunc, bg: true },

    }

    /* protected */ _styleByName(ss: ConsoleStyleSettings | undefined, n: string): ConsoleStyle {

        const fx: StandardStyleFunctionEx | undefined = ConsoleStylerBase._styleFunction[n];
        
        if (fx) return fx.f.bind(this,this,fx.bg,ss) as unknown as ConsoleStyle;

        const sx: ConsoleStyleSettings = this._byName(n);

        if (ss) {
            const sxx : ConsoleStyleSettings = this._settingsOverwrite(ss,sx);
            return this._settingsStyle(sxx);
        }
        else
            return this._settingsStyle(sx);
    }

    protected _styleCache!: Map<string, ConsoleStyle>;

    protected _settingsStyle2(s1: ConsoleStyleSettings, s2: ConsoleStyleSettings): ConsoleStyle {

        switch ((s1 ? 1 : 0) | (s2 ? 2 : 0)) {
            case 1:
                return this._settingsStyle(s1);
            case 2:
                return this._settingsStyle(s2);
            case 3:
                return this._settingsStyle(this._settingsOverwrite(s1,s2));
            default:
                return this._emptyStyle;
        }
    }        

    protected _settingsStyle(ss: ConsoleStyleSettings): ConsoleStyle {

        if (Array.isArray(ss)) {
            return this._createStyle(ss);
        }
        else {
            const n = this._settingsCacheName(ss);
            let s: ConsoleStyle | undefined = this._styleCache.get(n);

            if (!s) this._styleCache.set(n,s=this._createStyle(ss));

            return s;  }
    }

    protected _functionStyle(f: ConsoleStyleAliasFunction, fType: string): ConsoleStyle {

        return this._createStyle(this._settingsFromFunction(f,fType));
    }

    protected _settingsCacheName(ss: Settings)

    {  return `${(ss.fg ?? '?')}/${(ss.bg ?? '?')}/${ss.ms.toString(16)}:${(ss.ms^ss.mm).toString(16)}:${ss.mr.toString(16)}`;
    }

    protected _createStyle(ss: ConsoleStyleSettings): ConsoleStyle {

        const cs: ConsoleStylerBase = this;

        let f;

        if (Array.isArray(ss))
            f=function (...x:any[]) { return cs._applyList(ss,cs._applyArgs(x)); };
        else
            f=function (...x:any[]) { return cs._apply(ss,cs._applyArgs(x)); };

        const sd: ConsoleStyleData = f as unknown as ConsoleStyleData;

        sd.styler=this;
        sd.style=this._styleByName.bind(this,ss);
        sd.set=ss;
        sd.prop={ n: sd.style };
        sd.prop[__SETTINGS]=ss;
        sd.prop[__STYLER]=this;
        Object.defineProperty(sd.prop,'level',{
            enumerable: true,
            get: () => cs.level
        });

        return new Proxy<ConsoleStyleData>(sd,consoleStyleHandler) as unknown as ConsoleStyle;
    }

    _applyArgs(sx: any): string {

        if (Array.isArray(sx)) {
            if (sx.length===1)
                sx=sx[0].toString();
            else if (!this.multiFmt || sx[0].indexOf('%')<0)
                sx=sx.join(' ');
            else
                sx=util.format.apply(null,sx);
            return sx;
        }
        else
            return sx.toString();
    }

    protected _applyList(ss: ConsoleStyleSettingsList, sx: string | StateStringList) {

        for (const sss of ss) {
            if (typeof sss === 'function')
                sx=sss(sx,this);
            else {
                if (typeof sx === 'string') sx=new StateStringList(sx,this);
                sx.applySettings(sss); }
            }

        return sx.toString();
    }

    protected _apply(ss: Settings, sx: string | StateStringList) {

        if (typeof sx === 'string') sx=new StateStringList(sx,this);
        sx.applySettings(ss);

        return sx.toString();
    }

    protected _settingsFromFunction(f: ConsoleStyleAliasFunction, fType: string): ConsoleStyleSettings {

        let fx: ConsoleStyleFunction;

        switch (fType.toUpperCase()) {
            case 'X':
                fx=f as ConsoleStyleFunction;
                break;
            case 'L':
                fx=function(sx: string | StateStringList, cs: ConsoleStylerBase) {
                    if (typeof sx === 'string') sx=new StateStringList(sx,cs);
                    return (f as ConsoleStyleListFunction)(sx);
                };
                break;
            case 'SL':
                fx=function(sx: string | StateStringList, cs: ConsoleStylerBase) {
                    if (typeof sx === 'string') sx=new StateStringList(sx,cs);
                    sx.applyStringFunction(f as ConsoleStyleStringFunction);
                    return sx;
                };
                break;
            case 'SS':
                fx=function(sx: string | StateStringList, cs: ConsoleStylerBase) {
                    if (typeof sx === 'string') {
                        return (f as ConsoleStyleStringFunction)(sx);
                    }
                    else {
                        sx.applyStringFunction(f as ConsoleStyleStringFunction);
                        return sx;
                    }
                };
                break;
            default:
                fx=function(sx: string | StateStringList, cs: ConsoleStylerBase) {
                    return ((f as ConsoleStyleStringFunction)(sx.toString()));
                };
        }

        return [fx];
    }

    protected _byNameCache!: Map<string, ConsoleStyleSettings>;

    protected _byName(nn: string): ConsoleStyleSettings {

        let s:  ConsoleStyle;
        let sx: ConsoleStyleSettings;
        let sxx: StandardStyleDefinition | undefined;
        let ss: ConsoleStyleSettings | undefined;
        
        if (ss=this._byNameCache.get(nn)) return ss;

        ss=ANSI_NO_SETTINGS;

        for (let n of nn.split(/[.+ ] */)) {
            if (s=(this as any)[n])
                sx=this._styleSettings(s);
            else if (sxx=STANDARD_STYLES[n])
                sx=this._standardStyle(sxx);
            else if (n.indexOf('(')>=0) {
                const m: RegExpMatchArray | null = n.match(/^([^(]+)\(([^)]*)\)$/);
                if (!m) throw Error(`unknown console style '${n}'`);
                sx=this._byNameFunc(m[1],m[2]);
            }
            else if (n.charAt(0)==='#')
                sx=this._hexSettings(n);
            else if (n.charAt(0)==='@')
                sx=this._c256Settings(n);
            else if (n.charAt(0)==='%')
                sx=this._c16Settings(n);
            else if (/[0-9;]+/.test(n))
                sx=sgrPars2Settings(n,this.modifier);
            else
                throw Error(`unknown console style '${n}'`);

            ss=this._settingsOverwrite(ss,sx);
        }

        this._byNameCache.set(nn,ss);

        return ss;
    }

    protected _standardStyle(sxx: StandardStyleDefinition): ConsoleStyleSettings {

        if (Array.isArray(sxx)) {
            for (const ss of sxx) {
                if (typeof ss === 'number') {
                    if (this.modifier&ss) return { ms:ss, mm: ss, mr: 0 }
                }
                else {
                    if ((this.modifier&(ss.ms|ss.mm)) === (ss.ms|ss.mm)) return ss;
                }
            }
            return ANSI_NO_SETTINGS;
        }
        else if (typeof sxx === 'string') { // Color
            if (sxx.charAt(0)==='4' || sxx.charAt(0)==='1')
                return { bg: sxx, ms: 0, mm: 0, mr: 0 };
            else 
                return { fg: sxx, ms: 0, mm: 0, mr: 0 };
        }
        else if (typeof sxx === 'number') { // modifier style
            if (sxx<Modifier.STANDARD && (sxx&this.modifier)==0) return ANSI_NO_SETTINGS;
            return { ms: sxx, mm: sxx, mr: 0 };
        }
        else if ('f' in sxx) { // function
            return this._settingsFromFunction(sxx.f,sxx.ft);
        }
        else
            return sxx as Settings;
    }

    protected _settingsOverwrite(ss: ConsoleStyleSettings, sx: ConsoleStyleSettings) : ConsoleStyleSettings {

        if (Array.isArray(ss)) {
            const i = ss.length-1;
            if (typeof ss[i] === 'object' && typeof sx === 'object') {
                ss[i]=settingsOverwrite(ss[i] as Settings,sx as Settings);
                return ss;
            }
            else
                return ss.concat(sx);
        }
        else if (Array.isArray(sx))
            return [ss,...sx];
        else
            return settingsOverwrite(ss,sx);
    }

    protected _styleSettings(s: ConsoleStyle): ConsoleStyleSettings {

        return (s as any)[__SETTINGS];
    }

    protected _byNameFunc(fn: string, px: string): ConsoleStyleSettings {

        const bg = fn.startsWith('bg');

        switch(fn) {
            case "hex":
            case "bgHex":
                return this._hexSettings(px,bg);
            case "ansi256":
            case "bgAnsi256":
                return this._c256Settings(px,bg);
            case "ansi16":
            case "bgAnsi16":
                return this._c16Settings(px,bg);
            case "rgb":
            case "bgRgb": {
                const rgb = px.split(',').map(x => parseInt(x));
                return this._colorSettings(Colors.sgrFromRgb(rgb[0] || 0,rgb[1] || 0,rgb[2] || 0,bg));
            }
        }

        throw Error(`unknown console style ${fn}(${px})`);
    }

    protected _c256Settings(n: string, bf?: boolean): Settings {

        if (n.charAt(0)==='@') n=n.slice(1);
        const c = Number(n.slice(1));

        if (c<0 || c>255) throw Error(`invalid console style '@${n}'`);

        return this._colorSettings(Colors.sgrFromC256(c,bf));
    }

    protected _c16Settings(n: string, bf?: boolean): Settings {

        if (n.charAt(0)==='%') n=n.slice(1);
        let c = Number(n);

        if (c<0 || c>15) throw Error(`invalid console style '@${n}'`);

        return this._colorSettings(Colors.sgrFromC16(c,bf));
    }

    protected _hexSettings(hx: string, bf: boolean = false): Settings {

        let fg,bg: string | undefined;
        let s: number;

        if ((s=hx.indexOf(':'))>=0) {
            if (s>0) fg=Colors.sgrFromHex(hx.slice(0,s));
            if (s+1<hx.length) bg=Colors.sgrFromHex(hx.slice(s+1),true);
        }
        else if (bf)
            bg=Colors.sgrFromHex(hx,true);
        else
            fg=Colors.sgrFromHex(hx);

        return this._colorSettings(fg,bg);
    }

    protected _colorSettings(fg?: string, bg?: string): Settings {

        let ss: Settings = { ms: 0, mm: 0, mr: 0 };
    
        if (fg && (fg.charAt(0)==='4' || fg.charAt(0)==='1')) {
            ss.bg=fg;
            if (bg && (bg.charAt(0)==='3' || bg.charAt(0)==='9')) ss.fg=bg;
        }
        else if (bg && (bg.charAt(0)==='3' || bg.charAt(0)==='9'))
            ss.fg=bg;
        else {
            if (fg) ss.fg=fg;
            if (bg) ss.bg=bg;
        }

        return ss;
    }

// - - - - - - - - - - - - - - Formatting - - - - - - - - - - - - - - - - - - - - - -     

    protected _fmtRex!: RegExp;

    protected _escapeRegExp(str: string): string {

        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    protected _escapeRegExpGroup(str: string): string {

        return str.replace(/[-[\]\\]/g, '\\$&');
    }

    protected _tFormat(str:TemplateStringsArray, args: any[], s: State): string {

        let sf:string = str.join('\uE233');

        sf=this._format(sf,s);

        return sf.split('\uE233').reduce((r: string, s:string, i: number) => {
            return r+s+(args[i]?.toString() ?? '');
        },'');
    }

    protected _format(str: string, s: State): string {

        let   stk: any[] = [''];
        let   i: number = 0;

        const is = this._initialState;
        this._initialState=s;

        for (;;) {
            const m:any = this._fmtRex.exec(str);
            if (!m) {
                if (str) stk[i]=this._fAppend(stk[i],str);
                break;
            }
            if (m.index>0) stk[i]=this._fAppend(stk[i],str.slice(0,m.index));
            if (m[1]) {
                stk[++i]=this._byName(m[1]);
                stk[++i]='';
            }
            else if (i>0) {
                i-=2;
                stk[i]=this._fAppend(stk[i],this._fApplyEx(stk[i+1],stk[i+2]));
            }
            str=str.slice(m.index+m[0].length);
        }

        while (i>0) {
            i-=2;
            stk[i]=this._fAppend(stk[i],this._fApplyEx(stk[i+1],stk[i+2]));
        }

        this._initialState=is;

        return stk[0].toString();
    }

    protected _fAppend(s1: string | StateStringList, s2: string | StateStringList) {

        if (!s1) return s2;
        if (!s2) return s1;

        if (typeof s1 === 'string') {
            if (typeof s2 === 'string') return s1+s2;
            s2.addFront(s1);
            return s2;
        }
        else if (typeof s2 === 'string') {
            s1.addBack(s2);
            return s1;
        }
        else {
            s1.addBackList(s2);
            return s1;
        }
    }

    protected _fApplyEx(ss: ConsoleStyleSettings, sx: string | StateStringList) {

        if (Array.isArray(ss)) {
            for (const sss of ss) {
                if (typeof sss === 'function')
                    sx=sss(sx,this);
                else {
                    if (typeof sx === 'string') sx=new StateStringList(sx,this);
                    sx.applySettings(sss);
                }
            }
        }
        else {
            if (typeof sx === 'string') sx=new StateStringList(sx,this);
            sx.applySettings(ss);
        }

        return sx;
    }

    _standardFunctions() {

        STANDARD_STYLES.reset={ f: ConsoleStylerBase._resetFunc, ft: 'X' };
        STANDARD_STYLES.visible={ f: ConsoleStylerBase._visibleFunc, ft: 'X' };
        STANDARD_STYLES.sgr={ f: ConsoleStylerBase._sgrFunc, ft: 'X' };
        STANDARD_STYLES.ctrl={ f: ConsoleStylerBase._ctrlFunc, ft: 'X' };
    }

// - - - - - - - - - - - - - - - - - - reset - - - - - - - - - - - - - - - - - - - - - - - - - - - -    

    protected static _resetFunc(s: string | StateStringList, cs: ConsoleStylerBase): string | StateStringList {

        if (typeof s === 'string') {
            s=s.replace(ANSI_SGR_REGEXP_GLOBAL,'');
        }
        else {
            s.reset();
        }

        return s;
    }

// - - - - - - - - - - - - - - - - - - visible - - - - - - - - - - - - - - - - - - - - - - - - - - - -    

    protected static _visibleFunc(s: string | StateStringList, cs: ConsoleStylerBase): string | StateStringList {

        if (cs.level>0) return s;
        else            return '';
    }

// - - - - - - - - - - - - - - - - - - sgr / ctrl  - - - - - - - - - - - - - - - - - - - - - - - - - -    

    protected _ctrlStyle!:       { [key: string]: ConsoleStyle };
    protected _ctrlName!:        { [key: string]: string | ((c: string) => string) };
    protected _ctrlNameCache!:   { [key: string]: string };

    protected static _sgrFunc(s: string | StateStringList, cs: ConsoleStylerBase): string {

        s=s.toString();
        
        s=s.replace(/\x1B/g,'␛');
        
        let sx: ConsoleStyle | undefined;

        if (sx = cs._ctrlStyle.sgr) {
            let r = s;
            let m: RegExpExecArray | null;
            for (s='';;) {
                m=/^(.*?)(␛\[[0-9;]*m)(.*)$/ms.exec(r);
                if (!m) break;
                s+=m[1]+sx(m[2]);
                r=m[3];
            }
            s+=r;
        }
        else if (sx = cs._ctrlStyle['\x1B'] ?? cs._ctrlStyle['?']) {
            let r = s;
            let m: RegExpExecArray | null;
            for (s='';;) {
                m=/^(.*?)␛(.*)$/ms.exec(r);
                if (!m) break;
                s+=m[1]+sx('␛');
                r=m[2];
            }
            s+=r;
        }

        const esc=cs._ctrlUnstyledName('\x1B');
        if (esc!=='␛') s=s.replace(/␛/g,esc);
            
        return s;
    }

    protected _ctrlNameStd(cs: string): string {

        const c = cs.charCodeAt(0);
        const h = c.toString(16).toUpperCase();

        if (c<16)
            return '\\x0'+h;
        else if (c<256)
            return '\\x'+h;
        else if (c<4096)
            return '\\u0'+h;
        else
            return '\\u'+h;
    }

    protected _ctrlUnstyledName(cs: string): string {

        let cnx: string | ((c: string) => string) =
            this._ctrlName[cs] ?? this._ctrlName['?'] ?? this._ctrlNameStd;

        return (typeof cnx === 'function') ? cnx(cs) : cnx;
    }

    protected _ctrlStyledName(cs: string): string {

        let cn: string | undefined = this._ctrlNameCache[cs];
        let cnx: string | ((c: string) => string)  | undefined;
        let css: ConsoleStyle | undefined;

        if (cn) return cn;

        cnx=this._ctrlName[cs];

        if (!cnx) {
            if (cs.length>1) {
                if (css=this._ctrlStyle[cs]) {
                    cn=cs.split('').map(s => this._ctrlUnstyledName(s)).join('');
                    cnx=css(cn);
                }
                else {
                    cnx=cs.split('').map(s => this._ctrlStyledName(s)).join('');
                }
                this._ctrlNameCache[cs]=cnx;
                return cnx;
            }
            cnx=this._ctrlName['?'] ?? this._ctrlNameStd;
        }

        if (typeof cnx === 'function') cnx=cnx(cs);

        css=this._ctrlStyle[cs] ?? this._ctrlStyle['?'];
        if (css) cnx=css(cnx);

        this._ctrlNameCache[cs]=cnx;

        return cnx;
    }

    protected static _ctrlFunc(s: string | StateStringList, cs: ConsoleStylerBase): string {

        let m: RegExpExecArray | null;
        let cn: string | undefined;
        let esc: string | undefined;

        const css = cs._ctrlStyle;
    
        const rx = (css['\r\n']) ?
                    ((css['sgr']) ? /^([^\x00-\x1F\x7F]*)((?:\x1B\[[0-9;]*m)|(?:\r\n)|[\x00-\x1F\x7F])(.*)$/ms :
                                    /^([^\x00-\x1F\x7F]*)((?:\r\n)|[\x00-\x1F\x7F])(.*)$/ms)
                    :
                    ((css['sgr']) ? /^([^\x00-\x1F\x7F]*)((?:\x1B\[[0-9;]*m)|[\x00-\x1F\x7F])(.*)$/ms :
                                    /^([^\x00-\x1F\x7F]*)([\x00-\x1F\x7F])(.*)$/ms);
    
        // console.log("----",util.inspect(s),"----");
        // console.log(rx.source);

        s=s.toString();

        let r = '';
        for (;;) {
            m=rx.exec(s);
            if (!m) break;
            if (m[2].charAt(1)==='[') { // SGR
                if (!esc) esc=cs._ctrlUnstyledName('\x1B');
                cn=css['sgr'](esc+m[2].slice(1));
            }
            else {
                cn=cs._ctrlStyledName(m[2]);
            }
            r+=m[1]+cn;
            s=m[3];
        }

        return r+s;
    }

// - - - - - - - - - - - - - Color Style Functions - - - - - - - - - - - - - - - - - - - - - -     

    protected static _hexStyleFunc(cs: ConsoleStylerBase, bg: boolean, ss: ConsoleStyleSettings, hx: string): ConsoleStyle {

        const sc: Settings = cs._hexSettings(hx,bg);

        return cs._settingsStyle2(ss,sc);
    }

    protected static _rgbStyleFunc(cs: ConsoleStylerBase, bg: boolean, ss: ConsoleStyleSettings, r: number, g: number, b: number): ConsoleStyle {

        const sc = cs._colorSettings(Colors.sgrFromRgb(r,g,b,bg));

        return cs._settingsStyle2(ss,sc);
    }

    protected static _ansi256StyleFunc(cs: ConsoleStylerBase, bg: boolean, ss: ConsoleStyleSettings, c: number): ConsoleStyle {

        const sc = cs._colorSettings(Colors.sgrFromC256(c,bg));

        return cs._settingsStyle2(ss,sc);
    }

    protected static _ansi16StyleFunc(cs: ConsoleStylerBase, bg: boolean, ss: ConsoleStyleSettings, c: number): ConsoleStyle {

        const sc = cs._colorSettings(Colors.sgrFromC16(c,bg));

        return cs._settingsStyle2(ss,sc);
    }
}

class ConsoleStylerHandler {

    get(sd: ConsoleStylerBase, pn: string) {

        let v: any;

        if (pn==='multiFmt') console.log("get('multiFmt') ...");

        if ((v=(sd as any)[pn])!==undefined) return v;

        return (sd as any)[pn]=sd._styleByName(undefined,pn);
    }

    set(sd: ConsoleStylerBase, pn: string, val: any): boolean {

        switch(pn) {
            case 'level':
                sd.level=val;
                return true;
            case 'multiFmt':
                sd.multiFmt=val;
                return true;
        }

        const v: any = (sd as any)[pn];
        if ((v===undefined || v[__STYLER]===sd) && (typeof val==='string' || val[__STYLER]===sd)) {
            sd.alias(pn,val as ConsoleStyle);
            return true;
        }            
        else
            throw new Error(`unexpected assignment to property '${pn}'`);
    }
}

const consoleStylerHandler = new ConsoleStylerHandler;

function consoleStylerFactory(opts?: any) {

    const cs = new ConsoleStylerBase();
    const fx: any = (...args:any) => fx._applyArgs(args);

    Object.setPrototypeOf(fx,Object.getPrototypeOf(cs));
    Object.assign(fx,cs);

    fx.Setup(opts);

    return new Proxy<ConsoleStylerBase>(fx as ConsoleStylerBase,consoleStylerHandler)
}

class ConsoleStylerClass {

    constructor(opts?: any) {

        return consoleStylerFactory(opts);
    }

}

export const ConsoleStyler: ConsoleStylerConstructor = ConsoleStylerClass as ConsoleStylerConstructor;
