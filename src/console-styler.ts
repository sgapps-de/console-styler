export enum modifier {
    BOLD             = 0x0001,
    DIM              = 0x0002,
    BOLD_DIM         = 0x0003,
    ITALIC           = 0x0004,
    UNDERLINE        = 0x0008,
    BLINK            = 0x0010,
    RAPID_BLINK      = 0x0020,
    ANY_BLINK        = 0x0030,
    INVERSE          = 0x0040,
    HIDDEN           = 0x0080,
    STRIKE_THROUGH   = 0x0100,
    DOUBLE_UNDERLINE = 0x0200,
    ANY_UNDERLINE    = 0x0208,
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

export interface AnsiState extends ModifierSettings {

    fg?: string;
    bg?: string;
}

const ANSI_NO_STATE:       AnsiState = { ms: 0, mm: 0, mr: 0 }
const ANSI_NO_STATE_FINAL: AnsiState = { ms: modifier.FINAL, mm: modifier.FINAL, mr: 0 }

export interface AnsiSettings {

    fg?: string;
    bg?: string;

    ms:  number;
    mm:  number;
    mr:  number;

}

const ANSI_NO_SETTINGS: AnsiSettings = { ms: 0, mm: 0, mr: 0 }
const ANSI_RESET_SETTINGS: AnsiSettings = { fg: '39', bg: '39', ms: 0, mm: 0, mr: modifier.STANDARD }

export type AnsiStringParts = (AnsiState | string)[];

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

export function ansiSeqMatch2Settings(match: RegExpExecArray, ff: boolean = false): AnsiSettings {

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

export function ansiSeq2Settings(seq: string, ff: boolean = false): AnsiSettings {

    const m = ansiSeqRegExp.exec(seq);

    if (m) return ansiSeqMatch2Settings(m,ff);
    else   return { ms: 0, mm: 0, mr: 0};

}

export function ansiSettingsOverwrite(s1: AnsiSettings, s2: AnsiSettings): AnsiSettings {

    let s: AnsiSettings = { ... s1 };

    if (s2.fg) s.fg=s2.fg;
    if (s2.bg) s.bg=s2.bg;

    s.mm=s.mm | s2.mm;
    s.ms=(s.ms & (~s2.mm)) | s2.ms;

    return s;
}    

export function ansiSettingsUpdate(s1: AnsiSettings, s2: AnsiSettings): AnsiSettings {

    let s: AnsiSettings = { ... s1 };

    if (s2.fg && (!s.fg || s.fg==='39')) s.fg=s2.fg;
    if (s2.bg && (!s.bg || s.bg==='49')) s.bg=s2.bg;

    const mm = (s2.mm & (~s.mm | ~s.ms))

    s.mm=s.mm | mm;
    s.ms=(s.ms & ~mm) | (s2.ms & mm);

    return s;
}

function ansiSettingsBG(ss: AnsiSettings) {

    let s: AnsiSettings = { ms: ss.ms, mm: ss.mm, mr: ss.mr };

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

export function ansiStateUpdate(s: AnsiState, ss: AnsiSettings): AnsiState {

    let sr: AnsiState = { ms: (s.ms & (~(ss.mm|ss.mr))) | ss.ms, mm: (s.mm | ss.mm) & (~ss.mr), mr: 0 };
            
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

export function ansiStateApply(s: AnsiState, ss: AnsiSettings): AnsiState {

    const mm = (ss.mm & (~s.mm)) | ss.mr;
    let sr: AnsiState = { ms: (s.ms & (~mm)) | ss.ms, mm: (s.mm & (~mm)) | ss.mm, mr: 0 };
        
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

function ansiStateModifiersShow(m: number): string {

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

function ansiStateShow(s: AnsiState | AnsiSettings): string {

    let r:  string = '{';
    let rs: string = '';

    if (s.fg) { r=r+rs+"fg:'"+s.fg+"'"; rs=',' }
    if (s.bg) { r=r+rs+"bg:'"+s.bg+"'"; rs=',' }

    if (s.ms) { r=r+rs+'ms:'+ansiStateModifiersShow(s.ms); rs=',' };
    if (s.mm) { r=r+rs+'mm:'+ansiStateModifiersShow(s.ms); rs=',' };
    if ((s as AnsiSettings).mr) { r=r+rs+'mr:'+ansiStateModifiersShow(s.ms); rs=',' };

    return r+'}';
}

export function ansiSplit(s: string, as?: AnsiState): AnsiStringParts {

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
            as=ansiStateUpdate(as,ansiSeqMatch2Settings(m,ff));
            r=r.slice(m.index+m[0].length);
        }
        if (r) ss.push(as,r);
        return ss;
    }
}

function ansiSettingsName(ss: AnsiSettings)

{  const mmm = ss.mr*65535+(ss.mm^ss.ms)*256+ss.ms;
   return `${(ss.fg ?? '?')}/${(ss.bg ?? '?')}/${mmm}`
}

export function ansiMakeState(s: AnsiState, ss: AnsiState): string {

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

export class AnsiString {

    parts: AnsiStringParts;

    constructor(s: string, as?: AnsiState)

    {   this.parts=ansiSplit(s,as);
    }

    showParts(): string {

        let lx: string = '['
        let ls: string = ''

        for (const p of this.parts) {
            if (typeof p !== 'string') {
                lx=lx+ls+ansiStateShow(p);
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

        let s = ANSI_NO_STATE;
        let l = this.parts.map(x => {
            if (typeof x !== 'string') {
                const e = ansiMakeState(s,x);
                s=x;
                return e;
            }
            else
                return x;
        })
        l.push(ansiMakeState(s,ANSI_NO_STATE));

//      console.log('toString ->',l.join('').replace(/\x1B(\[[0-9;]*m)/g,'\x1B[4;31m€$1\x1B[0m'));

        return l.join('');
    }

    applySettings(ss: AnsiSettings)  {

        const p = this.parts;
        const l = p.length;

        for (let i=0;i<l;++i) {
            if (typeof p[i] === 'string') continue;
            p[i]=ansiStateApply(p[i] as AnsiState,ss);
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

    addBackWithState(s: AnsiState, b: string | undefined) {

        if (b) this.parts.push(s,b);
    }

}

function applyStyle(sx: any, as: AnsiState, ss: AnsiSettings) {

//  console.log("ApplyStyle('"+sx+"',"+ansiStateShow(as)+","+ansiStateShow(ss)+")");

    let asl=new AnsiString(''+sx,as)
//  console.log("ASI",asl.showParts());

    asl.applySettings(ss);

    return asl.toString();
}

interface ConsoleStyleData {

    styler: ConsoleStyler
    set:    AnsiSettings

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
export type ConsoleStyle         = { [key: string] : ConsoleStyle, (s: string): string, (s: AnsiString): AnsiString };

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

        sd.styles['none']=sd.styles[ansiSettingsName(ANSI_NO_SETTINGS)]=sd._emptyStyle;

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

        this.setFormat(['{{','}}','|'])
    }

    f(s: string, final: boolean = true): string {

        let asl = new AnsiString('');

        const as = final ? ANSI_NO_STATE_FINAL : this._initialState;

        this._format(asl,as,s,undefined)

        // console.log(asl.showParts());
        
        return asl.toString();
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
            this._fmtRex=new RegExp(rx,'i')
        }
        else
            this._fmtRex=fx
    }

    byName(nn: string, ss?: AnsiSettings): ConsoleStyle {

        let s:  ConsoleStyle;

        s=this._sd.styles[nn];
        if (s) {
            if (!ss) return s;
            ss=ansiSettingsOverwrite(ss,this._styleSettings(s))
            return this._settingsStyle(ss);
        }

        ss=this._byName(nn,ss);
        return this._settingsStyle(ss);
    }

    alias(n: string, s: ConsoleStyle | string): void {

        if (typeof s === 'string') s=this.byName(s);

        this._sd.styles[n]=this._sd.styles[ansiSettingsName(this._styleSettings(s))]=s;
    }

    showEscape(s: string, sx?: ConsoleStyle | string): string {

        let ss: AnsiSettings;

        s=s.replace(/\x1B/g,'␛');

        if (!sx) return s;

        if (typeof sx === 'string')
            ss=this._byName(sx);
        else 
            ss=this._styleSettings(sx);

        const as = ansiStateApply(ANSI_NO_STATE,ss);
        const e1 = ansiMakeState(ANSI_NO_STATE,as);
        const e2 = ansiMakeState(as,ANSI_NO_STATE);

        return s.replace(/␛\[[0-9;]*m/g,e1+'$&'+e2);
    }

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    protected _sd: ConsoleStylesData;

    protected _notModifiers: boolean;
    protected _initialState: AnsiState;

    // @ts-expect-error
    protected _fmtRex: RegExp

    protected _ctorStyle(n: string, ss: AnsiSettings): void {

        const cs = this._createStyle(ss);
        this._sd.styles[n]=this._sd.styles[ansiSettingsName(ss)]=cs;
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

    protected _createStyle(ss: AnsiSettings): ConsoleStyle {

        const as = this._initialState;
        const sd = function(sx: any) { return applyStyle(sx,as,ss); }
    
        sd.styler=this;
        sd.set=ss;

        return new Proxy<ConsoleStyleData>(sd,consoleStyleHandler) as unknown as ConsoleStyle;
    }

    protected _styleSettings(s: ConsoleStyle): AnsiSettings {

        return (s as any)._SETTINGS;
    }

    protected _settingsStyle(ss: AnsiSettings): ConsoleStyle {

        const n = ansiSettingsName(ss);
        let s: ConsoleStyle = this._sd.styles[n];

        if (!s) this._sd.styles[n]=s=this._createStyle(ss);

        return s;
    }

    protected _byName(nn: string, ss?: AnsiSettings): AnsiSettings {

        let s:  ConsoleStyle;
        let sx: AnsiSettings;
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
                if (bg) sx=ansiSettingsBG(ss);
            }
            else if (n.charAt(0)==='#')
                sx=this._ansiHexSettings(n,bg);
            else if (n.charAt(0)==='@')
                sx=this._ansiC256Settings(n,bg);
            else if (n.replace(/[0-9]+/g,'')==='')
                sx=this._ansiC256Settings(n,bg);
            else
                throw Error(`unknown console style '${n}'`)

            ss=ansiSettingsOverwrite(ss,sx);
        }

        return ss;
    }

    protected _ansiC256Settings(n: string, bg: boolean = false): AnsiSettings {

        if (n.charAt(0)==='@') n=n.slice(1)
        const c = Number(n.slice(1));

        if (c<0 || c>255) throw Error(`invalid console style '@${n}'`)
        if (bg) return { bg:'48;5;'+c, ms: 0, mm: 0, mr:0}
        else    return { fg:'38;5;'+c, ms: 0, mm: 0, mr:0}
    }

    protected _ansiC16Settings(n: string, bg: boolean = false): AnsiSettings {

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

    protected _ansiHexSettings(hx: string, bg: boolean = false): AnsiSettings {

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

    protected _ansiRgbSettings(r: number, g: number, b: number, bg: boolean = false): AnsiSettings {

        if (bg) return { bg: `48;2;${r};${g};${b}`, ms: 0, mm: 0, mr: 0 };
        else    return { fg: `38;2;${r};${g};${b}`, ms: 0, mm: 0, mr: 0 };
    }

    protected _escapeRegExp(str: string): string {

        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    }

    protected _format(asl: AnsiString, as: AnsiState, str: string, asx: AnsiState | undefined): void {

        const m:any = str.match(this._fmtRex)

        // console.log("_format:")
        // console.log("  asl:",asl.showParts());
        // console.log("  as: ",ansiStateShow(as));
        // console.log("  str:",str);
        // if (asx) console.log("  asx:",ansiStateShow(asx));

        if (!m)
            asl.addBackWithState(as,str);

        else if (m.groups.name) {
            const ss  = this._byName(m.groups.name);
            // console.log("  nm: ",m.groups.name);
            // console.log("  ss: ",ansiStateShow(ss));
            if (!asx) {
                asl.addBackWithState(as,m.groups.pre);
                this._format(asl,as,m.groups.post,ansiStateUpdate(as,ss));
            }
            else {
                asl.addBackWithState(asx,m.groups.pre);
                this._formatNesting(asl,as,m.groups.post,[ansiStateUpdate(asx,ss),asx])
            }
        }
        else if (asx) {
            asl.addBackWithState(asx,m.groups.pre);
            this._format(asl,as,m.groups.post,undefined)
        }
        else {
            asl.addBackWithState(as,m.groups.pre);
            this._format(asl,as,m.groups.post,undefined)
        }
    }

    protected _formatNesting(asl: AnsiString, as: AnsiState, str: string, asx: AnsiState[]): void {

        const m:any = str.match(this._fmtRex)

        // console.log("_formatNesting:")
        // console.log("  asl:",asl.showParts());
        // console.log("  as: ",ansiStateShow(as));
        // console.log("  str:",str);
        // let spc: string = "  asx:"
        // for (const asxx of asx) {
        //     console.log(spc,ansiStateShow(asxx));
        //     spc=' '+spc.replace(/[a-z:]/g,' ');
        // }

        if (!m)
            asl.addBackWithState(asx[0],str);

        else if (m.groups.name) {
            const ss = this._byName(m.groups.name);
            // console.log("  nm: ",m.groups.name);
            // console.log("  ss: ",ansiStateShow(ss));
            asl.addBackWithState(asx[0],m.groups.pre);
            this._formatNesting(asl,as,m.groups.post,[ansiStateUpdate(asx[0],ss),...asx]);
        }
        else {
            asl.addBackWithState(asx[0],m.groups.pre);
            if (asx.length==2) this._format(asl,as,m.groups.post,asx[1]);
            else               this._formatNesting(asl,as,m.groups.post,asx.slice(1));
        }            
    }
}