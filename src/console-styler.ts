import util from 'util';

import * as Colors from './colors';

import { Modifier, State, Settings, StateStringList,
         ANSI_SGR_REGEXP, ANSI_NO_STATE, ANSI_NO_STATE_FINAL, ANSI_NO_SETTINGS,
         sgrPars2Settings, settingsOverwrite,
        } from './state';

        import { TermInfo } from './terminfo';

import  { EnvironmentOptions, CommandOptions, 
    envGetter, optsGetter, EnvironmentGetter, CommandOptionsGetter
   } from './command-info';

export type ConsoleStyleFunction = (s: string | StateStringList, cs: ConsoleStyler) => string | StateStringList;
export type ConsoleStyleStringFunction = (s: string) => string;
export type ConsoleStyleListFunction = (s: StateStringList) => StateStringList;
export type ConsoleStyleAliasFunction = ConsoleStyleFunction | ConsoleStyleStringFunction | ConsoleStyleListFunction;

type ConsoleStyleSettingsList = (Settings | ConsoleStyleFunction)[];
type ConsoleStyleSettings = Settings | ConsoleStyleSettingsList;

interface ConsoleStyleData {

    styler: ConsoleStyler;
    style:  (n: string, s?: ConsoleStyleSettings) => ConsoleStyle;
    set:    ConsoleStyleSettings;
    prop:   any;
}

const consoleStyleHandler = {

    get: function(sd: ConsoleStyleData, prop: string, recv: any) {

        let p: any;

        if (p=sd.prop[prop]) return p;
//      if (prop==='_SETTINGS') return sd.set;

        return sd.prop[prop]=sd.style(prop,sd.set);
    },

    set: function(sd: ConsoleStyleData, prop: string, val: any) {

        throw Error('unexpected style assignement');
    }
}

interface ConsoleStylesData {

    styler: ConsoleStyler
    styles: ConsoleStyles

    _emptyStyle: ConsoleStyle
}

const consoleStylesHandler = {

    get: function(sd: ConsoleStylesData, prop: string, recv: any) {

        return sd.styler.byName(prop);
    },

    set: function(sd: ConsoleStylesData, prop: string, val: any) {

        throw Error('unexpected style assignement');
    }
}

// export type ConsoleStyleFunction = (s: string | AnsiString) => typeof s;
export type ConsoleStyles        = { [key: string] : ConsoleStyle };
export type ConsoleStyle         = { [key: string] : ConsoleStyle, (s: string): string, (s: StateStringList): StateStringList };

export type ControlName  = string | ((s: string) => string);

export interface ConsoleStylerOptions {

    level?:       number;
    modifier?:    Modifier;

    term?:        TermInfo | string;

    not?:         boolean,
    whiteIsDark?: boolean,

    env?:         EnvironmentOptions,
    cmdOpts?:     CommandOptions,

    alias?:     { [key: string]: ConsoleStyle | string },
    ctrlStyle?: { [key: string]: ConsoleStyle | string },
    ctrlName?:  { [key: string]: ControlName },
}

const CONSOLE_STYLE_COLORS: [string, number][] = [

    [ 'black', 30], [ 'red', 31 ], [ 'green', 32 ], [ 'yellow', 33 ], [ 'blue', 34], 
    [ 'magenta', 35 ], [ 'cyan', 36 ],

];

const CONSOLE_STYLE_MODIFIER: [string, number, number][] = [

    [ 'bold', Modifier.BOLD, 0 ],
    [ 'dim', Modifier.DIM, 0 ],
    [ 'italic', Modifier.ITALIC, 0 ],
    [ 'underline', Modifier.UNDERLINE, 0 ],
    [ 'ul', Modifier.UNDERLINE, 0 ],
    [ 'doubleUnderline', Modifier.DOUBLE_UNDERLINE, 0 ],
    [ 'dblUl', Modifier.DOUBLE_UNDERLINE, 0 ],
    [ 'blink', Modifier.BLINK, 0 ],
    [ 'inverse', Modifier.INVERSE, 0 ],
    [ 'hidden', Modifier.HIDDEN, 0 ],
    [ 'strikethrough', Modifier.STRIKE_THROUGH, 0 ],
    [ 'strike', Modifier.STRIKE_THROUGH, 0 ],
    [ 'overline', Modifier.OVERLINE, 0 ],

    [ 'not', Modifier.NOT_MODIFIER, 0 ],
    [ 'bg',  Modifier.BACKGROUND, 0 ],
    [ 'dark', Modifier.DARK, 0 ],
    [ 'bright', Modifier.BRIGHT, 0 ],

    [ 'final', Modifier.FINAL, 0 ],
    
]

export class ConsoleStyler {

    s: ConsoleStyles;

    level: number;
    modifier: Modifier;

    term:  TermInfo;
    
    black!: ConsoleStyle;
    red!: ConsoleStyle;
    green!: ConsoleStyle;
    yellow!: ConsoleStyle;
    blue!: ConsoleStyle;
    magenta!: ConsoleStyle;
    cyan!: ConsoleStyle;
    grey!: ConsoleStyle;
    gray!: ConsoleStyle;
    white!: ConsoleStyle;

    blackBright!: ConsoleStyle;
    redBright!: ConsoleStyle;
    greenBright!: ConsoleStyle;
    yellowBright!: ConsoleStyle;
    blueBright!: ConsoleStyle;
    magentaBright!: ConsoleStyle;
    cyanBright!: ConsoleStyle;
    greyBright!: ConsoleStyle;
    grayBright!: ConsoleStyle;
    whiteBright!: ConsoleStyle;

    bgBlack!: ConsoleStyle;
    bgRed!: ConsoleStyle;
    bgGreen!: ConsoleStyle;
    bgYellow!: ConsoleStyle;
    bgBlue!: ConsoleStyle;
    bgMagenta!: ConsoleStyle;
    bgCyan!: ConsoleStyle;
    bgGrey!: ConsoleStyle;
    bgGray!: ConsoleStyle;
    bgWhite!: ConsoleStyle;

    bgBlackBright!: ConsoleStyle;
    bgRedBright!: ConsoleStyle;
    bgGreenBright!: ConsoleStyle;
    bgYellowBright!: ConsoleStyle;
    bgBlueBright!: ConsoleStyle;
    bgMagentaBright!: ConsoleStyle;
    bgCyanBright!: ConsoleStyle;
    bgGreyBright!: ConsoleStyle;
    bgGrayBright!: ConsoleStyle;
    bgWhiteBright!: ConsoleStyle;

    bg!: ConsoleStyle;

    bold!: ConsoleStyle;
    dim!: ConsoleStyle;
    italic!: ConsoleStyle;
    underline!: ConsoleStyle;
    ul!: ConsoleStyle;
    doubleUnderline!: ConsoleStyle;
    dblUl!: ConsoleStyle;
    blink!: ConsoleStyle;
    inverse!: ConsoleStyle;
    hidden!: ConsoleStyle;
    strikethrough!: ConsoleStyle;
    strike!: ConsoleStyle;
    overline!: ConsoleStyle;
    not!: ConsoleStyle;

    reset!: ConsoleStyle;

    none!: ConsoleStyle;

    visible!: ConsoleStyle;

    sgr!: ConsoleStyle;
    ctrl!: ConsoleStyle;

    lower!: ConsoleStyle;
    upper!: ConsoleStyle;

    /* protected */ _initialState: State;

    constructor(opts?: ConsoleStylerOptions) {

        opts=opts ?? {};

        if (opts.term instanceof TermInfo)
            this.term=opts.term;
        else {
            const tio = {
                termType: opts.term,
                env: opts.env,
                cmdOpts: opts.cmdOpts,
            };
            this.term=new TermInfo(tio);
        }

        this.level=opts.level ?? this.term.level;
        this.modifier=opts.modifier ?? this.term.modifier;

        this.byName=this.byName.bind(this);

        this._notModifiers=!!opts.not;
        this._initialState=this._notModifiers ? ANSI_NO_STATE : ANSI_NO_STATE_FINAL;

        let sd: any = { styler: this, styles: {} }

        this.s=new Proxy<ConsoleStylesData>(sd,consoleStylesHandler) as unknown as ConsoleStyles;
        sd._emptyStyle=this._createStyle(ANSI_NO_SETTINGS);
        this._sd=sd as ConsoleStylesData;

        this._byNameCache = new Map<string, ConsoleStyleSettings>();
        this._styleCache = new Map<string, ConsoleStyle>();

        (this as any)['none']=sd.styles['none']=sd._emptyStyle;
        this._styleCache.set(this._settingsName(ANSI_NO_SETTINGS),sd._emptyStyle);

        for (const [ n, c ] of CONSOLE_STYLE_COLORS)
            this._ctorColor(n,c);

        if (opts.whiteIsDark) {
            this._ctorColor('white',37);
            this._ctorColor('gray',90);
            this._ctorColor('grey',90);
        }
        else {
            this._ctorColor('white',97);
            this._ctorColor('gray',37);
            this._ctorColor('grey',37);
        }

        for (const [ n, ms, mm ] of CONSOLE_STYLE_MODIFIER) {
            this._ctorModifier(n,ms,mm);
        }

        this._ctorFunctionStyle('reset',this._resetFunc.bind(this),'X');
        this._ctorFunctionStyle('visible',this._visibleFunc.bind(this),'X');
        this._ctorFunctionStyle('upper',(x: string) => x.toUpperCase(),'SS');
        this._ctorFunctionStyle('lower',(x: string) => x.toLowerCase(),'SS');
        this._ctorFunctionStyle('sgr',this._sgrFunc.bind(this),'X');
        this._ctorFunctionStyle('ctrl',this._ctrlFunc.bind(this),'X');

        this._ctrlStyle={};
        this._ctrlName={ '\n': '\\n', '\r': '\\r',  '?': this._ctrlNameStd };
        this._ctrlNameCache={};

        this.setFormat(['{{','}}','|']);

        if (opts.alias) this.alias(opts.alias);
        if (opts.ctrlStyle) this.ctrlStyle(opts.ctrlStyle);
        if (opts.ctrlName) this.ctrlName(opts.ctrlName);
    }

    f(s: string, final: boolean = true): string {

        if (this._notModifiers && final) {
            const is = this._initialState;
            this._initialState=ANSI_NO_STATE_FINAL;
            const r = this.f(s,false);
            this._initialState=is;
            return r;
        }

        let   stk: any[] = ['']
        let   i: number = 0

        for (;;) {
            const m:any = this._fmtRex.exec(s)
            if (!m) {
                if (s) stk[i]=this._fAppend(stk[i],s);
                break;
            }
            if (m.index>0) stk[i]=this._fAppend(stk[i],s.slice(0,m.index));
            if (m[1]) {
                stk[++i]=this._byName(m[1])
                stk[++i]='';
            }
            else if (i>0) {
                i-=2;
                stk[i]=this._fAppend(stk[i],this._fApplyEx(stk[i+1],stk[i+2]));
            }
            s=s.slice(m.index+m[0].length)
        }

        while (i>0) {
            i-=2;
            stk[i]=this._fAppend(stk[i],this._fApplyEx(stk[i+1],stk[i+2]));
        }

        return stk[0].toString();
    }

    setFormat(fx: [ string, string ] | [ string, string, string ] | RegExp) {

        if (Array.isArray(fx)) {
            const fx2 = fx[2] ?? '|'
            const fxx = fx[1].split('').reduce((r,x) => r.indexOf(x)<0 ? r+x : r,fx2)
            const rx = '(?:(?:' +
                       this._escapeRegExp(fx[0]) +
                       '([^'+fxx+']+)' + 
                       this._escapeRegExp(fx2) +
                       ')|(?:' +
                       this._escapeRegExp(fx[1]) +
                       '))'
            this._fmtRex=new RegExp(rx,'ms')
        }
        else
            this._fmtRex=fx
    }

    byName(nn: string, ss?: ConsoleStyleSettings): ConsoleStyle {

        let s:  ConsoleStyle;

        s=this._sd.styles[nn];
        if (s) {
            if (!ss) return s;
            ss=this._settingsOverwrite(ss,this._styleSettings(s))
            return this._settingsStyle(ss);
        }

        if (ss)
            ss=this._settingsOverwrite(ss,this._byName(nn))
        else
            ss=this._byName(nn);

        return this._settingsStyle(ss);
    }

    alias(n: string | { [key: string]: ConsoleStyle | string }, s?: ConsoleStyle | string | ConsoleStyleAliasFunction, fType: string = 'S'): void {

        if (typeof n !== 'string') {
            for (const sn in n) this.alias(sn,n[sn]);
            return;
        }

        if (typeof s === 'string')
            s=this.byName(s);
        else if (typeof s === 'function')
            s=this._styleFromFunction(s,fType);

        if (s)
            this._sd.styles[n]=s as ConsoleStyle;
        else
            delete this._sd.styles[n];
    }

    ctrlStyle(n: string | { [key: string]: ConsoleStyle | string }, s?: ConsoleStyle | string | ConsoleStyleAliasFunction, fType: string = 'S'): void {

        if (typeof n !== 'string') {
            for (const sn in n) this.ctrlStyle(sn,n[sn]);
            return;
        }

        if (typeof s === 'string')
            s=this.byName(s);
        else if (typeof s === 'function')
            s=this._styleFromFunction(s,fType);

        if (s && s!==this._sd._emptyStyle)
            this._ctrlStyle[n]=s as ConsoleStyle;
        else
            delete this._ctrlStyle[n];

        if (n==='?')
            this._ctrlNameCache={}
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
            this._ctrlNameCache={}
        else 
            delete this._ctrlNameCache[n];
    }

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    protected _sd: ConsoleStylesData;

    protected _notModifiers: boolean;

    protected _styleCache: Map<string, ConsoleStyle>;

    protected _fmtRex!: RegExp

    protected _ctorStyle(n: string, ss: Settings): void {

        const cs = this._createStyle(ss);
        (this as any)[n]=this._sd.styles[n]=cs;
        this._styleCache.set(this._settingsName(ss),cs);
    }

    protected _ctorFunctionStyle(n: string, f: ConsoleStyleAliasFunction, fType: string = 'S'): void {

        const s: ConsoleStyle = this._styleFromFunction(f,fType);

        (this as any)[n]=this._sd.styles[n]=s;
    }

    protected _ctorColor(n: string, c: number): void {

        this._ctorStyle(n, { ms: 0, mm: 0, mr:0, fg:''+c });
        this._ctorStyle(this._bgName(n), { ms: 0, mm: 0, mr:0, bg:''+(c+10) });

        if (c<90) {
            this._ctorStyle(n+'Bright', { ms: 0, mm: 0, mr:0, fg:''+(c+60) });
            this._ctorStyle(this._bgName(n)+'Bright', { ms: 0, mm: 0, mr:0, bg:''+(c+70) });
        }
    }

    protected _ctorModifier(n: string, ms: number, mm: number, mr: number = 0): void {

        if (mr=0 && ms<Modifier.STANDARD && !(this.modifier&ms))
            ms=mm=0;
        else
            mm|=ms;
    
        this._ctorStyle(n,{ ms, mm, mr });
    }

    protected _bgName(n: string): string {

        return 'bg'+n.charAt(0).toUpperCase()+n.slice(1);
    }

    protected _createStyle(ss: ConsoleStyleSettings): ConsoleStyle {

        const sd: ConsoleStyleData = (Array.isArray(ss) ?
                        this._applyList.bind(this,ss)
                        :
                        this._apply.bind(this,ss)) as unknown as ConsoleStyleData;

        sd.styler=this;
        sd.style=this.byName;
        sd.set=ss;
        sd.prop={ '_SETTINGS': ss };

        return new Proxy<ConsoleStyleData>(sd,consoleStyleHandler) as unknown as ConsoleStyle;
    }

    protected _styleFromFunction(f: ConsoleStyleAliasFunction, fType: string): ConsoleStyle {

        let fx: ConsoleStyleFunction;

        switch (fType.toUpperCase()) {
            case 'X':
                fx=f as ConsoleStyleFunction;
                break;
            case 'L':
                fx=function(sx: string | StateStringList, cs: ConsoleStyler) {
                    if (typeof sx === 'string') sx=new StateStringList(sx,cs);
                    return (f as ConsoleStyleListFunction)(sx);
                };
                break;
            case 'SS':
                fx=function(sx: string | StateStringList, cs: ConsoleStyler) {
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
                fx=function(sx: string | StateStringList, cs: ConsoleStyler) {
                    return ((f as ConsoleStyleStringFunction)(sx.toString()));
                };
        }

        return this._createStyle([fx]);
    }

    protected _styleSettings(s: ConsoleStyle): ConsoleStyleSettings {

        return (s as any)._SETTINGS;
    }

    protected _settingsStyle(ss: ConsoleStyleSettings): ConsoleStyle {

        if (Array.isArray(ss)) {
            return this._createStyle(ss);
        }
        else {
            const n = this._settingsName(ss);
            let s: ConsoleStyle | undefined = this._styleCache.get(n);

            if (!s) this._styleCache.set(n,s=this._createStyle(ss));

            return s;  }
    }

    protected _byNameCache: Map<string, ConsoleStyleSettings>;

    protected _byName(nn: string): ConsoleStyleSettings {

        let s:  ConsoleStyle;
        let sx: ConsoleStyleSettings;
        let ss: ConsoleStyleSettings | undefined;
        
        if (ss=this._byNameCache.get(nn)) return ss;

        ss=ANSI_NO_SETTINGS;

        for (let n of nn.split(/[.+ ] */)) {
            if (s=this._sd.styles[n])
                sx=this._styleSettings(s);
            else if (n.charAt(0)==='#')
                sx=this._ansiHexSettings(n);
            else if (n.charAt(0)==='@')
                sx=this._c256Settings(n);
            else if (n.charAt(0)==='%')
                sx=this._c16Settings(n);
            else if (/[0-9;]+/.test(n))
                sx=sgrPars2Settings(n,!this._notModifiers);
            else
                throw Error(`unknown console style '${n}'`)

            ss=this._settingsOverwrite(ss,sx);
        }

        this._byNameCache.set(nn,ss);

        return ss;
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
            return [ss,...sx]
        else
            return settingsOverwrite(ss,sx);
    }

    protected _c256Settings(n: string): Settings {

        if (n.charAt(0)==='@') n=n.slice(1)
        const c = Number(n.slice(1));

        if (c<0 || c>255) throw Error(`invalid console style '@${n}'`)

        return this._colorSettings(Colors.sgrFromC256(c))
    }

    protected _c16Settings(n: string): Settings {

        let bg: boolean = false;

        if (n.charAt(0)==='%') n=n.slice(1)
        let c = Number(n);

        if (c<30)       c=0;
        else if (c<38)  c=c;
        else if (c<40)  c=0;
        else if (c<48)  bg=true;
        else if (c<90)  c=0;
        else if (c<98)  c=c;
        else if (c<100) c=0;
        else if (c<108) bg=true;
        else            c=0;

        if (c<1) throw Error(`invalid console style '%${n}'`)

        if (bg) return { bg:''+c, ms: 0, mm: 0, mr:0}
        else    return { fg:''+c, ms: 0, mm: 0, mr:0}
    }

    protected _ansiHexSettings(hx: string): Settings {

        let fg,bg: string | undefined;
        let s: number;

        if ((s=hx.indexOf(':'))>=0) {
            if (s>0) fg=Colors.sgrFromHex(hx.slice(0,s));
            if (s+1<hx.length) bg=Colors.sgrFromHex(hx.slice(s+1));
        }
        else
            fg=Colors.sgrFromHex(hx);

        return this._colorSettings(fg,bg);
    }

    protected _colorSettings(fg?: string, bg?: string): Settings {

        let ss: Settings = { ms: 0, mm: 0, mr: 0 };
        if (fg) ss.fg=fg;
        if (bg) ss.bg=bg;

        return ss;
    }

    protected _escapeRegExp(str: string): string {

        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    }

    protected _fAppend(s1: string | StateStringList, s2: string | StateStringList) {

        if (!s1) return s2;
        if (!s2) return s1;

        if (typeof s1 === 'string') {
            if (typeof s2 === 'string') return s1+s2;
            s2.addFrontSeq(s1,this._initialState);
            return s2;
        }
        else if (typeof s2 === 'string') {
            s1.addBackSeq(s2,this._initialState);
            return s1;
        }
        else {
            s1.addBackList(s2)
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

    protected _resetFunc(s: string | StateStringList, cs: ConsoleStyler): string | StateStringList {

        if (typeof s === 'string') {
            s=s.replace(ANSI_SGR_REGEXP,'');
        }
        else {
            s.reset();
        }

        return s;
    }

    protected _visibleFunc(s: string | StateStringList, cs: ConsoleStyler): string | StateStringList {

        if (cs.level>0) return s;
        else            return '';
    }

    protected _ctrlStyle:       { [key: string]: ConsoleStyle };
    protected _ctrlName:        { [key: string]: string | ((c: string) => string) };
    protected _ctrlNameCache:   { [key: string]: string };

    protected _sgrFunc(s: string | StateStringList, cs: ConsoleStyler): string {

        s=s.toString();
        
        s=s.replace(/\x1B/g,'␛');
        
        let sx: ConsoleStyle | undefined;

        if (sx = this._ctrlStyle.sgr) {
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
        else if (sx = this._ctrlStyle['\x1B'] ?? this._ctrlStyle['?']) {
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

        const esc=this._ctrlUnstyledName('\x1B');
        if (esc!=='␛') s=s.replace('␛',esc);
            
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

    protected _ctrlFunc(s: string | StateStringList, cs: ConsoleStyler): string {

        let m: RegExpExecArray | null;
        let cn: string | undefined;
        let esc: string | undefined;

        const css = this._ctrlStyle;
    
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
                if (!esc) esc=this._ctrlUnstyledName('\x1B')
                cn=css['sgr'](esc+m[2].slice(1));
            }
            else {
                cn=this._ctrlStyledName(m[2]);
            }
            r+=m[1]+cn;
            s=m[3];
        }

        return r+s;
    }

    protected _settingsName(ss: Settings)

    {  const mmm = ss.mr*65535+(ss.mm^ss.ms)*256+ss.ms;
       return `${(ss.fg ?? '?')}/${(ss.bg ?? '?')}/${mmm}`
    }
    
}