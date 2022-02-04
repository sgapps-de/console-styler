import util from 'util';

export enum modifier {
    BOLD             = 0x0001,
    DIM              = 0x0002,
    BOLD_DIM         = BOLD | DIM,
    ITALIC           = 0x0004,
    UNDERLINE        = 0x0008,
    BLINK            = 0x0010,
    RAPID_BLINK      = 0x0020,
    ANY_BLINK        = BLINK | RAPID_BLINK,
    INVERSE          = 0x0040,
    HIDDEN           = 0x0080,
    STRIKE_THROUGH   = 0x0100,
    DOUBLE_UNDERLINE = 0x0200,
    ANY_UNDERLINE    = UNDERLINE | DOUBLE_UNDERLINE,
    STANDARD         = 0x03FF,

    FINAL            = 0x00010000,
    SPECIAL          = 0x00010000,

    ALL              = 0x000101FF
};

export interface ModifierSettings {

    ms: number,
    mm: number,
    mr: number
}

export interface State extends ModifierSettings {

    fg?: string;
    bg?: string;
}

const ANSI_NO_STATE:       State = { ms: 0, mm: 0, mr: 0 }
const ANSI_NO_STATE_FINAL: State = { ms: modifier.FINAL, mm: modifier.FINAL, mr: 0 }

export interface Settings extends ModifierSettings {

    fg?: string;
    bg?: string;
}

const ANSI_NO_SETTINGS: Settings = { ms: 0, mm: 0, mr: 0 }
const ANSI_RESET_SETTINGS: Settings = { fg: '39', bg: '39', ms: 0, mm: 0, mr: modifier.STANDARD }

export type AnsiStringParts = (State | string)[];

/*
const ANSI_SEQ_MODIFIER = '(?:0|1|2|3|4|5|6|7|8|9|21|22|23|24|201|204)';

const ANSI_SEQ_REGEX = `
    \x1B\\[
    (?<mod>${ANSI_SEQ_MODIFIER}(?:;${ANSI_SEQ_MODIFIER})*)? ;?
    (?<fg>(?:30|31|32|33|34|35|36|37|90|91|92|93|94|95|96|97|(?:38;5;[0-9]+)|(?:38;2;[0-9]+;[0-9]+;[0-9]+)|39))? ;?
    (?<bg>(?:40|41|42|43|44|45|46|47|100|101|102|103|104|105|106|107|(?:48;5;[0-9]+)|(?:48;2;[0-9]+;[0-9]+;[0-9]+)|49))? ;?
    m
`
*/

const ANSI_SEQ_REGEX = '\x1B\\[([?0-9]+(?:;[0-9]+)*)?m'

export const ansiSeqRegExp = new RegExp(ANSI_SEQ_REGEX.replace(/\s+/g,''),'i')

export function escSeqMatch2Settings(match: RegExpExecArray, ff: boolean = false): Settings {

    let ms: number = 0;
    let mm: number = 0;
    let mr: number = 0;
    let fg: string | undefined;
    let bg: string | undefined;

    const cc = (match[1] ?? '0').split(';').map(x => Number(x))
    let i,c: number;
    for (i=0;i<cc.length;++i) {
        switch (c=cc[i]) {
            case 0:
                mm = 0;
                ms = 0;
                mr = modifier.STANDARD;
                fg = '39';
                bg = '49';
                break;
            case 1:
                mm |= modifier.BOLD_DIM;
                ms = (ms & ~modifier.DIM) | modifier.BOLD;
                break;
            case 2:
                mm |= modifier.BOLD_DIM;
                ms = (ms & ~modifier.BOLD) | modifier.DIM;
                break;
            case 3:
                mm |= modifier.ITALIC;
                ms |= modifier.ITALIC;
                break;
            case 4:
                mm |= modifier.ANY_UNDERLINE;
                ms = (ms & ~modifier.DOUBLE_UNDERLINE) | modifier.UNDERLINE;
                break;
            case 5:
                mm |= modifier.ANY_BLINK;
                ms = (ms & ~modifier.RAPID_BLINK) | modifier.BLINK;
                break;
            case 6:
                mm |= modifier.ANY_BLINK;
                ms = (ms & ~modifier.BLINK) | modifier.RAPID_BLINK;
                break;
            case 7:
                mm |= modifier.INVERSE;
                ms |= modifier.INVERSE;
                break;
            case 8:
                mm |= modifier.HIDDEN;
                ms |= modifier.HIDDEN;
                break;
            case 9:
                mm |= modifier.STRIKE_THROUGH;
                ms |= modifier.STRIKE_THROUGH;
                break;
            case 21:
                mm |= modifier.ANY_UNDERLINE;
                ms = (ms & ~modifier.UNDERLINE) | modifier.DOUBLE_UNDERLINE;
                break;
            case 22:
                if (ff) {
                    mm &= (~modifier.BOLD_DIM);
                    ms &= (~modifier.BOLD_DIM);
                    mr |= modifier.BOLD_DIM;
                }
                else {
                    mm |= modifier.BOLD_DIM;
                    ms &= (~modifier.BOLD_DIM);
                }
                break;
            case 23:
                if (ff) {
                    mm &= (~modifier.ITALIC);
                    ms &= (~modifier.ITALIC);
                    mr |= modifier.ITALIC;
                }
                else {
                    mm |= modifier.ITALIC;
                    ms &= (~modifier.ITALIC);
                }
                break;
                break;
            case 24:
                if (ff) {
                    mm &= (~modifier.ANY_UNDERLINE);
                    ms &= (~modifier.ANY_UNDERLINE);
                    mr |= modifier.ANY_UNDERLINE;
                }
                else {
                    mm |= modifier.ANY_UNDERLINE;
                    ms &= (~modifier.ANY_UNDERLINE);
                }
                break;
            case 25:
                if (ff) {
                    mm &= (~modifier.ANY_BLINK);
                    ms &= (~modifier.ANY_BLINK);
                    mr |= modifier.ANY_BLINK;
                }
                else {
                    mm |= modifier.ANY_BLINK;
                    ms &= (~modifier.ANY_BLINK);
                }
                break;
            case 27:
                if (ff) {
                    mm &= (~modifier.INVERSE);
                    ms &= (~modifier.INVERSE);
                    mr |= modifier.INVERSE;
                }
                else {
                    mm |= modifier.INVERSE;
                    ms &= (~modifier.INVERSE);
                }
                break;
            case 28:
                if (ff) {
                    mm &= (~modifier.HIDDEN);
                    ms &= (~modifier.HIDDEN);
                    mr |= modifier.HIDDEN;
                }
                else {
                    mm |= modifier.HIDDEN;
                    ms &= (~modifier.HIDDEN);
                }
                break;
            case 29:
                if (ff) {
                    mm &= (~modifier.STRIKE_THROUGH);
                    ms &= (~modifier.STRIKE_THROUGH);
                    mr |= modifier.STRIKE_THROUGH;
                }
                else {
                    mm |= modifier.STRIKE_THROUGH;
                    ms &= (~modifier.STRIKE_THROUGH);
                }
                break;
            case 30:
            case 31:
            case 32:
            case 33:
            case 34:
            case 35:
            case 36:
            case 37:
            case 39:
            case 90:
            case 91:
            case 92:
            case 93:
            case 94:
            case 95:
            case 96:
            case 97:
                fg=''+c;
                break;
            case 38:
                if (cc[i+1]===2) {
                    fg=`38;2;${cc[i+2]};${cc[i+3]};${cc[i+4]}`
                    i+=4;
                }
                else {
                    fg=`38;5;${cc[i+2]}`
                    i+=2;
                }
                break;
            case 40:
            case 41:
            case 42:
            case 43:
            case 44:
            case 45:
            case 46:
            case 47:
            case 49:
            case 100:
            case 101:
            case 102:
            case 103:
            case 104:
            case 105:
            case 106:
            case 107:
                bg=''+c;
                break;
            case 48:
                if (cc[i+1]===2) {
                    bg=`48;2;${cc[i+2]};${cc[i+3]};${cc[i+4]}`
                    i+=4;
                }
                else {
                    bg=`48;5;${cc[i+2]}`
                    i+=2;
                }
                break;
            case 202:
                mm &= (~modifier.BOLD_DIM);
                ms &= (~modifier.BOLD_DIM);
                mr |= modifier.BOLD_DIM;
                break;
            case 203:
                mm &= (~modifier.ITALIC);
                ms &= (~modifier.ITALIC);
                mr |= modifier.ITALIC;
                break;
            case 204:
                mm &= (~modifier.ANY_UNDERLINE);
                ms &= (~modifier.ANY_UNDERLINE);
                mr |= modifier.ANY_UNDERLINE;
                break;
            case 205:
                mm &= (~modifier.ANY_BLINK);
                ms &= (~modifier.ANY_BLINK);
                mr |= modifier.ANY_BLINK;
                break;
            case 207:
                mm &= (~modifier.INVERSE);
                ms &= (~modifier.INVERSE);
                mr |= modifier.INVERSE;
                break;
            case 208:
                mm &= (~modifier.HIDDEN);
                ms &= (~modifier.HIDDEN);
                mr |= modifier.HIDDEN;
                break;
            case 209:
                mm &= (~modifier.STRIKE_THROUGH);
                ms &= (~modifier.STRIKE_THROUGH);
                mr |= modifier.STRIKE_THROUGH;
                break;
        }
    }

//  console.log('SEQ:',match[0].replace('\x1B','€'),'->',ansiStateShow({fg, bg, ms, mm, mr}));

    return { fg, bg, ms, mm, mr };
}    

export function escSeq2Settings(seq: string, ff: boolean = false): Settings {

    const m = ansiSeqRegExp.exec(seq);

    if (m) return escSeqMatch2Settings(m,ff);
    else   return { ms: 0, mm: 0, mr: 0};

}

export function settingsOverwrite(s1: Settings, s2: Settings): Settings {

    let s: Settings = { ... s1 };

    if (s2.fg) s.fg=s2.fg;
    if (s2.bg) s.bg=s2.bg;

    s.mm=s.mm | s2.mm;
    s.ms=(s.ms & (~s2.mm)) | s2.ms;

    return s;
}    

export function settingsUpdate(s1: Settings, s2: Settings): Settings {

    let s: Settings = { ... s1 };

    if (s2.fg && (!s.fg || s.fg==='39')) s.fg=s2.fg;
    if (s2.bg && (!s.bg || s.bg==='49')) s.bg=s2.bg;

    const mm = (s2.mm & (~s.mm | ~s.ms))

    s.mm=s.mm | mm;
    s.ms=(s.ms & ~mm) | (s2.ms & mm);

    return s;
}

function settingsBG(ss: Settings) {

    let s: Settings = { ms: ss.ms, mm: ss.mm, mr: ss.mr };

    if (ss.fg) {
        switch (ss.fg.charAt(0)) {
            case '3':
                s.bg='4'+ss.fg.slice(1);
                break;
            case '9':
                s.bg='10'+ss.fg.slice(1);
                break;
        }
    }

    return ss;
}

export function stateUpdate(s: State, ss: Settings): State {

    let sr: State = { ms: (s.ms & (~(ss.mm|ss.mr))) | ss.ms, mm: (s.mm | ss.mm) & (~ss.mr), mr: 0 };
            
    if (!ss.fg) {
        if (s.fg) sr.fg=s.fg;
    }
    else if (ss.fg!=='39') {
        sr.fg=ss.fg;
    }

    if (!ss.bg) {
        if (s.bg) sr.bg=s.bg;
    }
    else if (ss.bg!=='49') {
        sr.bg=ss.bg;
    }

    sr.mm=(s.mm | ss.mm) & (~ss.mr);
    sr.ms=(s.ms & (~(ss.mm|ss.mr))) | ss.ms;

    return sr;
}    

export function stateApply(s: State, ss: Settings): State {

    const mm = (ss.mm & (~s.mm)) | ss.mr;
    let sr: State = { ms: (s.ms & (~mm)) | ss.ms, mm: (s.mm & (~mm)) | ss.mm, mr: 0 };
        
    if (!s.fg) {
        if (ss.fg && ss.fg!=='39') sr.fg=ss.fg;
    }
    else if (ss.fg!=='39') {
        sr.fg=s.fg
    }

    if (!s.bg) {
        if (ss.bg && ss.bg!=='49') sr.bg=ss.bg;
    }
    else if (ss.bg!=='49') {
        sr.bg=s.bg
    }

    return sr;
}

function stateModifiersShow(m: number): string {

    let r: string = '';

    if (m&modifier.BOLD) r=r+'B';
    if (m&modifier.DIM) r=r+'D';
    if (m&modifier.ITALIC) r=r+'I';
    if (m&modifier.UNDERLINE) r=r+'U';
    if (m&modifier.BLINK) r=r+'K';
    if (m&modifier.INVERSE) r=r+'V';
    if (m&modifier.HIDDEN) r=r+'H';
    if (m&modifier.STRIKE_THROUGH) r=r+'S';
    if (m&modifier.FINAL) r=r+'F';
    
    return r;
}

function stateShow(s: State | Settings): string {

    let r:  string = '{';
    let rs: string = '';

    if (s.fg) { r=r+rs+"fg:'"+s.fg+"'"; rs=',' }
    if (s.bg) { r=r+rs+"bg:'"+s.bg+"'"; rs=',' }

    if (s.ms) { r=r+rs+'ms:'+stateModifiersShow(s.ms); rs=',' };
    if (s.mm) { r=r+rs+'mm:'+stateModifiersShow(s.ms); rs=',' };
    if ((s as Settings).mr) { r=r+rs+'mr:'+stateModifiersShow(s.ms); rs=',' };

    return r+'}';
}

export function ansiSplit(s: string, as?: State): AnsiStringParts {

    as = as ?? ANSI_NO_STATE;

    if (s.indexOf('\x1B')<0) {
        if (s) return [ as, s ];
        else   return [];
    }
    else {
        let ss: AnsiStringParts = []
        let r: string = s;
        const ff = (as.ms & modifier.FINAL)>0;
        for (;;) {
            const m = ansiSeqRegExp.exec(r);
            if (!m) break;
            if (m.index>0) ss.push(as,r.slice(0,m.index));
            as=stateUpdate(as,escSeqMatch2Settings(m,ff));
            r=r.slice(m.index+m[0].length);
        }
        if (r) ss.push(as,r);
        return ss;
    }
}

function settingsName(ss: Settings)

{  const mmm = ss.mr*65535+(ss.mm^ss.ms)*256+ss.ms;
   return `${(ss.fg ?? '?')}/${(ss.bg ?? '?')}/${mmm}`
}

export function ansiMakeState(s: State, ss: State): string {

    let sr: string = '';
    let sx;

    sx=(s.ms ^ ss.ms);
    for (let sm=1;sm<=sx;sm<<=1) {
        if (!(sx & sm)) continue;
        switch (sm) {
            case modifier.BOLD:
            case modifier.DIM:
                sr=sr+((ss.ms & modifier.DIM) ? '2;' :
                       (ss.ms & modifier.BOLD) ? '1;' :
                       '22;');
                sx &= (~modifier.BOLD_DIM);
                break;
            case modifier.UNDERLINE:
            case modifier.DOUBLE_UNDERLINE:
                sr=sr+((ss.ms & modifier.DOUBLE_UNDERLINE) ? '21;' :
                (ss.ms & modifier.UNDERLINE) ? '4;' :
                '24;');
                sx &= (~modifier.ANY_UNDERLINE);
                break;
            case modifier.ITALIC:
                sr=sr+((ss.ms & modifier.ITALIC) ? '3;' : '23;');
                break;
            case modifier.INVERSE:
                sr=sr+((ss.ms & modifier.INVERSE) ? '7;' : '27;');
                break;
            case modifier.HIDDEN:
                sr=sr+((ss.ms & modifier.HIDDEN) ? '8;' : '28;');
                break;
            case modifier.STRIKE_THROUGH:
                sr=sr+((ss.ms & modifier.STRIKE_THROUGH) ? '9;' : '29;');
                break;
            case modifier.BLINK:
            case modifier.RAPID_BLINK:
                sr=sr+((ss.ms & modifier.RAPID_BLINK) ? '6;' :
                        (ss.ms & modifier.BLINK) ? '5;' :
                        '25;');
                sx &= (~modifier.ANY_BLINK);
                break;
        }
    }

    sx=(ss.ms & modifier.FINAL) ? 0 : (s.mm & ss.mr);
    for (let sm=1;sm<=sx;sm<<=1) {
        if (!(sx & sm)) continue;
        switch (sm) {
            case modifier.BOLD:
            case modifier.DIM:
                sr=sr+'202;'
                sx &= (modifier.BOLD_DIM);
                break;
            case modifier.UNDERLINE:
            case modifier.DOUBLE_UNDERLINE:
                sr=sr+'204;'
                sx &= (modifier.ANY_UNDERLINE);
                break;
            case modifier.BLINK:
            case modifier.RAPID_BLINK:
                sr=sr+'205;'
                sx &= (modifier.ANY_BLINK);
                break;
            case modifier.ITALIC:
                sr=sr+'203;';
                break;
            case modifier.INVERSE:
                sr=sr+'207;'
                break;
            case modifier.HIDDEN:
                sr=sr+'208;';
                break;
            case modifier.STRIKE_THROUGH:
                sr=sr+'209;';
                break;
        }
    }

    if (ss.fg!==s.fg) {
        if (ss.fg)
            sr=sr+ss.fg+';'
        else if (s.fg)
            sr=sr+'39;'
    }
    if (ss.bg!==s.bg) {
        if (ss.bg)
            sr=sr+ss.bg+';'
        else if (s.bg)
            sr=sr+'49;'
    }

//  console.log('Make:',ansiStateShow(s),'->',ansiStateShow(ss),'->',sr);

    if (sr && !ss.fg && !ss.bg && !(ss.mm & modifier.STANDARD)) return '\x1B[0m';

    return sr ? '\x1B['+sr.slice(0,-1)+'m' : ''
}

export class AnsiStringList {

    parts: AnsiStringParts;

    constructor(s: string, as?: State)

    {   this.parts=ansiSplit(s,as);
    }

    showParts(): string {

        let lx: string = '['
        let ls: string = ''

        for (const p of this.parts) {
            if (typeof p !== 'string') {
                lx=lx+ls+stateShow(p);
            }
            else {
                lx=lx+ls+"'"+p+"'";
            }
            ls=','
        }

        return lx+']';
    }

    toString() : string {

//      console.log('toString',this.showParts());

        let s  = ANSI_NO_STATE;
        let ss = ANSI_NO_STATE;
        let r  = '';

        for (let x of this.parts) {
            if (typeof x !== 'string')
                ss=x;
            else if (x.indexOf('\n')<0) {
                r=r+ansiMakeState(s,ss)+x;
                s=ss;
            }
            else if (x==='\n' || x==='\r\n') {
                r=r+ansiMakeState(s,ANSI_NO_STATE)+x;
                s=ANSI_NO_STATE;
            }
            else {
                let m: RegExpExecArray | null;
                for (;;) {
                    m=/^([^\r\n]*)(\r?\n)(.*)$/ms.exec(x);
                    if (!m) break;
                    if (m[1]) { r=r+ansiMakeState(s,ss)+m[1]; s=ss; }
                    r=r+ansiMakeState(s,ANSI_NO_STATE)+m[2];
                    s=ANSI_NO_STATE
                    x=m[3];
                }
                if (x) { r=r+ansiMakeState(s,ss)+x; s=ss; }
            }
        }

        r=r+ansiMakeState(s,ANSI_NO_STATE);

//      console.log('toString ->',r.replace(/\x1B(\[[0-9;]*m)/g,'\x1B[4;31m€$1\x1B[0m'));

        return r;
    }

    applySettings(ss: Settings)  {

        const p = this.parts;
        const l = p.length;

        for (let i=0;i<l;++i) {
            if (typeof p[i] === 'string') continue;
            p[i]=stateApply(p[i] as State,ss);
        }
    }

    applyStringFunction(f: (s: string) => string)  {

        const p = this.parts;
        const l = p.length;

        for (let i=0;i<l;++i) {
            if (typeof p[i] === 'string') p[i]=f(p[i] as string);
        }
    }

    add(f: string | undefined, b: string | undefined ) {

        if (f && b) {
            this.parts = [ ANSI_NO_STATE, f, ... this.parts, ANSI_NO_STATE, b ];
        }
        else if (f) {
            this.parts = [ ANSI_NO_STATE, f, ... this.parts ];
        }
        else if (b) {
            this.parts = [ ... this.parts, ANSI_NO_STATE, b ];
        }
    }

    addFront(f: string | undefined) {

        if (f) this.parts = [ ANSI_NO_STATE, f, ... this.parts ];
    }
    
    addBack(b: string | undefined) {

        if (b) this.parts.push(ANSI_NO_STATE,b);
    }

    addBackWithState(s: State, b: string | undefined) {

        if (b) this.parts.push(s,b);
    }

    addFrontSeq(s: string, as?: State) {

        if (!s) return;

        if (s.indexOf('\x1B')>=0) {
            let lx = ansiSplit(s,as);
            this.parts=[...lx,...this.parts];
        }
        else
            this.parts=[as ?? ANSI_NO_STATE, s, ...this.parts];
    }

    addBackSeq(s: string, as?: State) {

        if (!s) return;

        if (s.indexOf('\x1B')>=0) {
            let lx = ansiSplit(s,as);
            this.parts=[...this.parts, ...lx];
        }
        else
            this.parts.push(as ?? ANSI_NO_STATE, s);
    }

    addBackList(l2: AnsiStringList) {

        this.parts=[...this.parts,...l2.parts];

    }
}

function applyStyle(sx: any, as: State, ss: Settings) {

//  console.log("ApplyStyle('"+sx+"',"+ansiStateShow(as)+","+ansiStateShow(ss)+")");

    let asl=new AnsiStringList(''+sx,as)
//  console.log("ASI",asl.showParts());

    asl.applySettings(ss);

    return asl.toString();
}

export type ConsoleStyleFunction = (s: string | AnsiStringList, as?: State) => string | AnsiStringList;
export type ConsoleStyleStringFunction = (s: string) => string;
export type ConsoleStyleListFunction = (s: AnsiStringList) => AnsiStringList;
type ConsoleStyleSettings = Settings | (Settings | ConsoleStyleFunction)[];
export type ConsoleStyleAliasFunction = ConsoleStyleFunction | ConsoleStyleStringFunction | ConsoleStyleListFunction;

function applyStyleEx(sx: any, as: State, sss: (Settings | ConsoleStyleFunction)[]) {

    let asl: string | AnsiStringList = ''+sx;

    for (const ss of sss) {
        if (typeof ss === 'function') {
            asl=ss(asl,as);
        }
        else {
            if (typeof asl === 'string') asl=new AnsiStringList(asl,as);
            asl.applySettings(ss);
        }
    }

    return asl.toString();
}

interface ConsoleStyleData {

    styler: ConsoleStyler;
    set:    ConsoleStyleSettings;
}

const consoleStyleHandler = {

    get: function(sd: ConsoleStyleData, prop: string, recv: any) {

        if (prop==='_SETTINGS') return sd.set;

        return sd.styler.byName(prop,sd.set);
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
export type ConsoleStyle         = { [key: string] : ConsoleStyle, (s: string): string, (s: AnsiStringList): AnsiStringList };

export interface ConsoleStylerOptions {

    notModifiers?: boolean,
    whiteIsDark?: boolean,

}

const CONSOLE_STYLE_COLORS: [string, number][] = [

    [ 'black', 30], [ 'red', 31 ], [ 'green', 32 ], [ 'yellow', 33 ], [ 'blue', 34], 
    [ 'magenta', 35 ], [ 'cyan', 36 ],

];

const CONSOLE_STYLE_MODIFIER: [string, number][] = [

    [ 'bold', modifier.BOLD ],
    [ 'dim', modifier.DIM ],
    [ 'italic', modifier.ITALIC ],
    [ 'underline', modifier.UNDERLINE ],
    [ 'ul', modifier.UNDERLINE ],
    [ 'doubleUnderline', modifier.DOUBLE_UNDERLINE ],
    [ 'dul', modifier.DOUBLE_UNDERLINE ],
    [ 'blink', modifier.BLINK ],
    [ 'inverse', modifier.INVERSE ],
    [ 'hidden', modifier.HIDDEN ],
    [ 'strikethrough', modifier.STRIKE_THROUGH ],
    [ 'strike', modifier.STRIKE_THROUGH ],

]    

export const CONSOLE_STYLE_NAME_SPECIAL_CHARS = '-=:!.,#@()'

export class ConsoleStyler {

    s: ConsoleStyles;

    constructor(opts: ConsoleStylerOptions) {

        this._notModifiers=!!opts.notModifiers;
        this._initialState=this._notModifiers ? ANSI_NO_STATE : ANSI_NO_STATE_FINAL;

        let sd: any = { styler: this, styles: {} }

        this.s=new Proxy<ConsoleStylesData>(sd,consoleStylesHandler) as unknown as ConsoleStyles;
        sd._emptyStyle=this._createStyle(ANSI_NO_SETTINGS);
        this._sd=sd as ConsoleStylesData;

        sd.styles['none']=sd.styles[settingsName(ANSI_NO_SETTINGS)]=sd._emptyStyle;

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

        for (const [ n, m ] of CONSOLE_STYLE_MODIFIER) {
            this._ctorModifier(n,m);
        }

        this._ctorStyle('reset',{ ms: 0, mm: 0, mr: modifier.STANDARD});
        this._ctorStyle('final',{ ms: modifier.FINAL, mm: modifier.FINAL, mr: 0});

        this.alias('upper',(x: string) => x.toUpperCase(),'SS');
        this.alias('lower',(x: string) => x.toLowerCase(),'SS');
        this.alias('sgr',this._sgrFunc.bind(this,'?'),'X');

        this.setFormat(['{{','}}','|'])
    }

    f(s: string, final: boolean = true): string {

        const as = final ? ANSI_NO_STATE_FINAL : ANSI_NO_STATE;
        let   stk: any[] = ['']
        let   i: number = 0

        for (;;) {
            const m:any = s.match(this._fmtRex)
            if (!m) {
                if (s) stk[i]=this._fAppend(stk[i],s);
                break;
            }
            if (m.groups.pre) stk[i]=this._fAppend(stk[i],m.groups.pre);
            if (m.groups.name) {
                stk[++i]=this._byName(m.groups.name)
                stk[++i]='';
            }
            else if (i>0) {
                i-=2;
                stk[i]=this._fAppend(stk[i],this._fApply(stk[i+2],stk[i+1],as),as);
            }
            s=m.groups.post
        }

        while (i>0) {
            i-=2;
            stk[i]=this._fAppend(stk[i],this._fApply(stk[i+2],stk[i+1]),as);
        }

        return stk[0].toString();
    }

    setFormat(fx: [ string, string ] | [ string, string, string ] | RegExp) {

        if (Array.isArray(fx)) {
            const fx2 = fx[2] ?? '|'
            const sc = CONSOLE_STYLE_NAME_SPECIAL_CHARS.replace(fx2,'');
            const rx = '^(?<pre>.*?)(?:(?:' +
                       this._escapeRegExp(fx[0]) +
                       '(?<name>[' + sc + 'a-zA-Z0-9_]*)' + 
                       this._escapeRegExp(fx2) +
                       ')|(?:' +
                       this._escapeRegExp(fx[1]) +
                       '))(?<post>.*)$'
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

        ss=this._byName(nn,ss);
        return this._settingsStyle(ss);
    }

    alias(n: string, s: ConsoleStyle | string | ConsoleStyleAliasFunction, fType: string = 'S'): void {

        if (typeof s === 'string')
            s=this.byName(s);
        else if (typeof s === 'function')
            s=this._styleFromFunction(s,fType);

        this._sd.styles[n]=s as ConsoleStyle;
    }

    showEscape(s: string, sx?: ConsoleStyle | string): string {

        let ss: ConsoleStyleSettings;

        s=s.replace(/\x1B/g,'␛');

        if (sx==='?') sx=undefined;

        if (sx) {
            let r = s;
            let m: RegExpExecArray | null;
            if (typeof sx === 'string') sx=this.byName(sx);
            for (s='';;) {
                m=/^(.*?)(␛\[[0-9;]*m)(.*)$/ms.exec(r);
                if (!m) break;
                s+=m[1]+sx(m[2]);
                r=m[3];
            }
            s+=r;
        }
        
        return s;
    }

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    protected _sd: ConsoleStylesData;

    protected _notModifiers: boolean;
    protected _initialState: State;

    // @ts-expect-error
    protected _fmtRex: RegExp

    protected _ctorStyle(n: string, ss: Settings): void {

        const cs = this._createStyle(ss);
        this._sd.styles[n]=this._sd.styles[settingsName(ss)]=cs;
    }

    protected _ctorColor(n: string, c: number): void {

        this._ctorStyle(n, { ms: 0, mm: 0, mr:0, fg:''+c });
        this._ctorStyle(this._bgName(n), { ms: 0, mm: 0, mr:0, bg:''+(c+10) });

        if (c<90) {
            this._ctorStyle(n+'Bright', { ms: 0, mm: 0, mr:0, fg:''+(c+60) });
            this._ctorStyle(this._bgName(n)+'Bright', { ms: 0, mm: 0, mr:0, bg:''+(c+70) });
        }
    }        

    protected _ctorModifier(n: string, m: number): void {

        this._ctorStyle(n, { ms: m, mm: m, mr: 0});
        if (this._notModifiers) {
            this._ctorStyle('!'+n, { ms: 0, mm: m, mr: 0});
            this._ctorStyle(this._notName(n), { ms: 0, mm: m, mr: 0});
        }
    }

    protected _bgName(n: string): string {

        return 'bg'+n.charAt(0).toUpperCase()+n.slice(1);
    }

    protected _notName(n: string): string {

        return 'not'+n.charAt(0).toUpperCase()+n.slice(1);
    }

    protected _createStyle(ss: ConsoleStyleSettings): ConsoleStyle {

        const as = this._initialState;
        const sd: ConsoleStyleData =
                    (Array.isArray(ss) ?
                        (function(sx: any) { return applyStyleEx(sx,as,ss); })
                        :
                        (function(sx: any) { return applyStyle(sx,as,ss); })) as unknown as ConsoleStyleData;

        sd.styler=this;
        sd.set=ss;

        return new Proxy<ConsoleStyleData>(sd,consoleStyleHandler) as unknown as ConsoleStyle;
    }

    protected _styleFromFunction(f: ConsoleStyleAliasFunction, fType: string): ConsoleStyle {

        let fx: ConsoleStyleFunction;

        switch (fType.toUpperCase()) {
            case 'X':
                fx=f as ConsoleStyleFunction;
                break;
            case 'L':
                fx=function(sx: string | AnsiStringList, as?: State) {
                    if (typeof sx === 'string') sx=new AnsiStringList(sx,as);
                    return (f as ConsoleStyleListFunction)(sx);
                };
                break;
            case 'SS':
                fx=function(sx: string | AnsiStringList, as?: State) {
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
                fx=function(sx: string | AnsiStringList, as?: State) {
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
            const n = settingsName(ss);
            let s: ConsoleStyle = this._sd.styles[n];

            if (!s) this._sd.styles[n]=s=this._createStyle(ss);

            return s;  }
    }

    protected _byName(nn: string, ss?: ConsoleStyleSettings): ConsoleStyleSettings {

        let s:  ConsoleStyle;
        let sx: ConsoleStyleSettings;
        let bg: boolean

        ss=ss ?? ANSI_NO_SETTINGS;
        for (let n of nn.split(/[.+ ] */)) {
            if (n.startsWith('bg=') || n.startsWith('bg:')) {
                    bg=true
                n=n.slice(3)
            }
            else if (n.startsWith('fg=') || n.startsWith('fg:')) {
                bg=false
                n=n.slice(3)
            }
            else
                bg=false

            s=this._sd.styles[n];
            if (s) {
                sx=this._styleSettings(s);
                if (bg) sx=this._settingsBG(ss);
            }
            else if (n.charAt(0)==='#')
                sx=this._ansiHexSettings(n,bg);
            else if (n.charAt(0)==='@')
                sx=this._ansiC256Settings(n,bg);
            else if (n.replace(/[0-9]+/g,'')==='')
                sx=this._ansiC256Settings(n,bg);
            else
                throw Error(`unknown console style '${n}'`)

            ss=this._settingsOverwrite(ss,sx);
        }

        return ss;
    }

    protected _settingsOverwrite(ss: ConsoleStyleSettings, sx: ConsoleStyleSettings)

    {   if (Array.isArray(ss))
            return ss.concat(sx);
        else if (Array.isArray(sx))
            return [ss,...sx]
        else
            return settingsOverwrite(ss,sx);
    }

    protected _settingsBG(ss: ConsoleStyleSettings): ConsoleStyleSettings {

        if (Array.isArray(ss))
            return ss.map(x => (typeof x !== 'function') ? settingsBG(x) : x);
        else
            return settingsBG(ss);
    }

    protected _ansiC256Settings(n: string, bg: boolean = false): Settings {

        if (n.charAt(0)==='@') n=n.slice(1)
        const c = Number(n.slice(1));

        if (c<0 || c>255) throw Error(`invalid console style '@${n}'`)
        if (bg) return { bg:'48;5;'+c, ms: 0, mm: 0, mr:0}
        else    return { fg:'38;5;'+c, ms: 0, mm: 0, mr:0}
    }

    protected _ansiC16Settings(n: string, bg: boolean = false): Settings {

        if (n.charAt(0)==='%') n=n.slice(1)
        let c = Number(n);

        if (c<30)       c=0;
        else if (c<38)  c=bg ? c+10 : c;
        else if (c<40)  c=0;
        else if (c<48)  bg=true;
        else if (c<90)  c=0;
        else if (c<98)  c=bg ? c+10 : c;
        else if (c<100) c=0;
        else if (c<108) bg=true;
        else            c=0;

        if (c<1) throw Error(`invalid console style '%${n}'`)

        if (bg) return { bg:''+c, ms: 0, mm: 0, mr:0}
        else    return { fg:''+c, ms: 0, mm: 0, mr:0}
    }

    protected _ansiHexSettings(hx: string, bg: boolean = false): Settings {

        let r: number;
        let g: number;        
        let b: number;        

        hx=hx.replace(/[#\,]/g,'')
        if (hx.length===3) {
            r=parseInt(hx.slice(0,1),16); r=r*16+r;
            g=parseInt(hx.slice(1,2),16); g=g*16+g;
            b=parseInt(hx.slice(2,3),16); b=b*16+b;
        }
        else if (hx.length===6) {
            r=parseInt(hx.slice(0,2),16);
            g=parseInt(hx.slice(2,4),16);
            b=parseInt(hx.slice(4,6),16);
        }
        else
            throw Error(`invalid hex color '${hx}'`)

        return this._ansiRgbSettings(r,g,b,bg)
    }

    protected _ansiRgbSettings(r: number, g: number, b: number, bg: boolean = false): Settings {

        if (bg) return { bg: `48;2;${r};${g};${b}`, ms: 0, mm: 0, mr: 0 };
        else    return { fg: `38;2;${r};${g};${b}`, ms: 0, mm: 0, mr: 0 };
    }

    protected _escapeRegExp(str: string): string {

        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    }

    protected _fAppend(s1: string | AnsiStringList, s2: string | AnsiStringList, as?: State) {

        if (!s1) return s2;
        if (!s2) return s1;

        if (typeof s1 === 'string') {
            if (typeof s2 === 'string') return s1+s2;
            s2.addFrontSeq(s1,as);
            return s2;
        }
        else if (typeof s2 === 'string') {
            s1.addBackSeq(s2,as);
            return s1;
        }
        else {
            s1.addBackList(s2)
            return s1;
        }
    }

    protected _fApply(sx: string | AnsiStringList, ss: ConsoleStyleSettings, as?: State) {

        if (Array.isArray(ss)) {
            for (const sss of ss) {
                if (typeof sss === 'function')
                    sx=sss(sx,as);
                else {
                    if (typeof sx === 'string') sx=new AnsiStringList(sx,as);
                    sx.applySettings(sss);
                }
            }
        }
        else {
            if (typeof sx === 'string') sx=new AnsiStringList(sx,as);
            sx.applySettings(ss);
        }

        return sx;
    }

    protected _sgrFunc(sx: string | ConsoleStyle, s: string | AnsiStringList, as?: State): string {

        return this.showEscape(s.toString(),sx);

    }
}