// import type ConsoleStyler from './console-styler';
import { type ConsoleStylerBase } from './console-styler';
import * as Colors from './colors';

export enum Modifier {
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
    OVERLINE         = 0x0400,
    STANDARD         = 0x07FF,

    WIN_TERM         = STANDARD,
    WIN_CON          = STANDARD,
    XTERM            = STANDARD & (~(DOUBLE_UNDERLINE|OVERLINE)),
    DEFAULT          = BOLD | UNDERLINE | INVERSE,

    FINAL            = 0x00010000,
    NOT_MODIFIER     = 0x00020000,
    BACKGROUND       = 0x00040000,
    DARK             = 0x00080000,
    BRIGHT           = 0x00100000,
    COLOR            = BACKGROUND | BRIGHT | DARK,
    SPECIAL          = 0x001F0000,

    RESET            = STANDARD,

    ALL              = STANDARD | SPECIAL,
    FACTOR           = ALL + 1,
}

export interface ModifierSettings {

    ms: number,
    mm: number,
    mr: number
}

export interface State extends ModifierSettings {

    fg?: string;
    bg?: string;
}

export const ANSI_NO_STATE:           State = { ms: 0, mm: 0, mr: 0 };
export const ANSI_NO_STATE_FINAL:     State = { ms: Modifier.FINAL, mm: Modifier.FINAL, mr: 0 };

export interface Settings extends ModifierSettings {

    fg?: string;
    bg?: string;
}

export const ANSI_NO_SETTINGS: Settings = { ms: 0, mm: 0, mr: 0 };
export const ANSI_RESET_SETTINGS: Settings = { fg: '39', bg: '39', ms: 0, mm: 0, mr: Modifier.STANDARD };

export const ANSI_SGR_REGEXP = /\x1B\[([0-9;]*)m/;
export const ANSI_SGR_REGEXP_GLOBAL = /\x1B\[([0-9;]*)m/g;

const escSeqCache      = new Map<string,Settings>();

// export function escSeqMatch2Settings(match: RegExpExecArray, ff: boolean = false): Settings {
export function sgrPars2Settings(seqPars: string, mx: Modifier = Modifier.STANDARD): Settings {

    let ss = escSeqCache.get(seqPars);
    if (ss) return ss;

    let ms: number = 0;
    let mm: number = 0;
    let mr: number = 0;
    let fg: string | undefined;
    let bg: string | undefined;

    const cc = seqPars.split(';').map(x => Number(x));

    let i,c: number;
    for (i=0;i<cc.length;++i) {
        switch (c=cc[i]) {
            case 0:
                mm = 0;
                ms = 0;
                mr = Modifier.STANDARD;
                fg = '39';
                bg = '49';
                break;
            case 1:
                mm |= Modifier.BOLD_DIM;
                ms = (ms & ~Modifier.DIM) | Modifier.BOLD;
                mr &= (~Modifier.BOLD_DIM);
                break;
            case 2:
                mm |= Modifier.BOLD_DIM;
                ms = (ms & ~Modifier.BOLD) | Modifier.DIM;
                mr &= (~Modifier.BOLD_DIM);
                break;
            case 3:
                mm |= Modifier.ITALIC;
                ms |= Modifier.ITALIC;
                mr &= (~Modifier.ITALIC);
                break;
            case 4:
                mm |= Modifier.ANY_UNDERLINE;
                ms = (ms & ~Modifier.DOUBLE_UNDERLINE) | Modifier.UNDERLINE;
                mr &= (~Modifier.ANY_UNDERLINE);
                break;
            case 5:
                mm |= Modifier.ANY_BLINK;
                ms = (ms & ~Modifier.RAPID_BLINK) | Modifier.BLINK;
                mr &= (~Modifier.ANY_BLINK);
                break;
            case 6:
                mm |= Modifier.ANY_BLINK;
                ms = (ms & ~Modifier.BLINK) | Modifier.RAPID_BLINK;
                mr &= (~Modifier.ANY_BLINK);
                break;
            case 7:
                mm |= Modifier.INVERSE;
                ms |= Modifier.INVERSE;
                mr &= (~Modifier.INVERSE);
                break;
            case 8:
                mm |= Modifier.HIDDEN;
                ms |= Modifier.HIDDEN;
                mr &= (~Modifier.HIDDEN);
                break;
            case 9:
                mm |= Modifier.STRIKE_THROUGH;
                ms |= Modifier.STRIKE_THROUGH;
                mr &= (~Modifier.STRIKE_THROUGH);
                break;
            case 21:
                if (mx & Modifier.DOUBLE_UNDERLINE) {
                    mm |= Modifier.ANY_UNDERLINE;
                    ms = (ms & ~Modifier.UNDERLINE) | Modifier.DOUBLE_UNDERLINE;
                    mr &= (~Modifier.ANY_UNDERLINE);
                }
                else {
                    mm &= (~Modifier.BOLD);
                    ms &= (~Modifier.BOLD);
                    mr |= Modifier.BOLD;
                }
                break;
            case 22:
                mm &= (~Modifier.BOLD_DIM);
                ms &= (~Modifier.BOLD_DIM);
                mr |= Modifier.BOLD_DIM;
                break;
            case 23:
                mm &= (~Modifier.ITALIC);
                ms &= (~Modifier.ITALIC);
                mr |= Modifier.ITALIC;
                break;
            case 24:
                mm &= (~Modifier.ANY_UNDERLINE);
                ms &= (~Modifier.ANY_UNDERLINE);
                mr |= Modifier.ANY_UNDERLINE;
                break;
            case 25:
                mm &= (~Modifier.ANY_BLINK);
                ms &= (~Modifier.ANY_BLINK);
                mr |= Modifier.ANY_BLINK;
                break;
            case 27:
                mm &= (~Modifier.INVERSE);
                ms &= (~Modifier.INVERSE);
                mr |= Modifier.INVERSE;
                break;
            case 28:
                mm &= (~Modifier.HIDDEN);
                ms &= (~Modifier.HIDDEN);
                mr |= Modifier.HIDDEN;
                break;
            case 29:
                mm &= (~Modifier.STRIKE_THROUGH);
                ms &= (~Modifier.STRIKE_THROUGH);
                mr |= Modifier.STRIKE_THROUGH;
                break;
            case 53:
                mm |= Modifier.OVERLINE;
                ms |= Modifier.OVERLINE;
                mr &= (~Modifier.OVERLINE);
                break;
            case 55:
                mm &= (~Modifier.OVERLINE);
                ms &= (~Modifier.OVERLINE);
                mr |= Modifier.OVERLINE;
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
                    fg=`38;2;${cc[i+2]};${cc[i+3]};${cc[i+4]}`;
                    i+=4;
                }
                else {
                    fg=`38;5;${cc[i+2]}`;
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
                    bg=`48;2;${cc[i+2]};${cc[i+3]};${cc[i+4]}`;
                    i+=4;
                }
                else {
                    bg=`48;5;${cc[i+2]}`;
                    i+=2;
                }
                break;
            default:
                if (c>200 && c<=220) {
                    c=Modifier.BOLD<<(c-201);
                    mm |= c;
                    ms &= (~c);
                    mr &= (~c);
                }
        }
    }

    ss={ fg, bg, ms, mm, mr };

    escSeqCache.set(seqPars,ss);
    
    return ss;
}

function settingsColorSpecial(c: string, s: number) {

    if (s&Modifier.BRIGHT)
        return Colors.sgrBright(c);
    else if (s&Modifier.DARK)
        return Colors.sgrDark(c);
    else
        return c;
}

export function settingsOverwrite(s1: Settings, s2: Settings): Settings {

    let s: Settings = { ... s1 };

//  console.log("Over:",stateShow(s1),'+',stateShow(s2))

    if ((s.ms&Modifier.COLOR) && !(s2.ms&Modifier.COLOR)) {
        if (s.ms&Modifier.BACKGROUND) {
            if (s2.fg) s.bg=Colors.sgrBackground(settingsColorSpecial(s2.fg,s.ms));
        }
        else {
            if (s2.fg) s.fg=settingsColorSpecial(s2.fg,s.ms);
            if (s2.bg) s.bg=settingsColorSpecial(s2.bg,s.ms);
        }
        s.ms&=(~Modifier.COLOR);
        s.mm&=(~Modifier.COLOR);
    }
    else {
        if (s2.fg) s.fg=s2.fg;
        if (s2.bg) s.bg=s2.bg;
    }

    if (s.ms&Modifier.NOT_MODIFIER) {
        s.mm=(s.mm | s2.ms) & (~Modifier.NOT_MODIFIER);
        s.ms=(s.ms & (~s2.ms)) & (~Modifier.NOT_MODIFIER);
    }
    else {
        s.mm=s.mm | s2.mm;
        s.ms=(s.ms & (~s2.mm)) | s2.ms;
    }

//  console.log(" ->",stateShow(s))

    return s;
}    

export function settingsUpdate(s1: Settings, s2: Settings): Settings {

    let s: Settings = { ... s1 };

    if (s2.fg && (!s.fg || s.fg==='39')) s.fg=s2.fg;
    if (s2.bg && (!s.bg || s.bg==='49')) s.bg=s2.bg;

    const mm = (s2.mm & (~s.mm | ~s.ms));

    s.mm=s.mm | mm;
    s.ms=(s.ms & ~mm) | (s2.ms & mm);

    return s;
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
    let sr: State = { ms: (s.ms & (~mm)) | (ss.ms & mm), mm: (s.mm & (~mm)) | ss.mm, mr: 0 };
        
    if (!s.fg) {
        if (ss.fg && ss.fg!=='39') sr.fg=ss.fg;
    }
    else if (ss.fg!=='39') {
        sr.fg=s.fg;
    }

    if (!s.bg) {
        if (ss.bg && ss.bg!=='49') sr.bg=ss.bg;
    }
    else if (ss.bg!=='49') {
        sr.bg=s.bg;
    }

    return sr;
}

export function stateModifiersShow(m: number): string {

    let r: string = '';

    if (m&Modifier.BOLD) r+='B';
    if (m&Modifier.DIM) r+='D';
    if (m&Modifier.ITALIC) r+='I';
    if (m&Modifier.UNDERLINE) r+='U';
    if (m&Modifier.DOUBLE_UNDERLINE) r+='Ü';
    if (m&Modifier.BLINK) r+='K';
    if (m&Modifier.INVERSE) r+='V';
    if (m&Modifier.HIDDEN) r+='H';
    if (m&Modifier.STRIKE_THROUGH) r+='S';
    if (m&Modifier.OVERLINE) r+='O';
    if (m&Modifier.FINAL) r+='@';
    if (m&Modifier.NOT_MODIFIER) r+='!';
    if (m&Modifier.BACKGROUND) r+='b';
    if (m&Modifier.BRIGHT) r+='*';
    if (m&Modifier.DARK) r+='.';
    
    return r;
}

export function stateShow(s: State | Settings): string {

    let r:  string = '{';
    let rs: string = '';

    if (s.fg) { r=r+rs+"fg:'"+s.fg+"'"; rs=','; }
    if (s.bg) { r=r+rs+"bg:'"+s.bg+"'"; rs=','; }

    if (s.ms) { r=r+rs+'ms:'+stateModifiersShow(s.ms); rs=','; }
    if (s.mm) { r=r+rs+'mm:'+stateModifiersShow(s.mm); rs=','; }
    if (s.mr) { r=r+rs+'mr:'+stateModifiersShow(s.mr); rs=','; }

    return r+'}';
}

export function stateColor16(s: State): State {

    const fg = s.fg ? Colors.sgrTo16(s.fg) : undefined;
    const bg = s.bg ? Colors.sgrTo16(s.bg) : undefined;

    if (s.fg!==fg || s.bg!==bg) {
        let rs: State = { ms: s.ms, mm: s.mm, mr: s.mr };
        if (fg) rs.fg=fg;
        if (bg) rs.bg=bg;
        return rs;
    }
    else
        return s;
}

export function stateColor256(s: State): State {

    const fg = s.fg ? Colors.sgrTo256(s.fg) : undefined;
    const bg = s.bg ? Colors.sgrTo256(s.bg) : undefined;

    if (s.fg!==fg || s.bg!==bg) {
        let rs: State = { ms: s.ms, mm: s.mm, mr: s.mr };
        if (fg) rs.fg=fg;
        if (bg) rs.bg=bg;
        return rs;
    }
    else
        return s;
}

export type StateStringParts = (State | string)[];

export function sqrSplit(s: string, as?: State, mx: Modifier = Modifier.STANDARD): StateStringParts {

    as = as ?? ANSI_NO_STATE;

    if (s.indexOf('\x1B')<0) {
        if (s) return [ as, s ];
        else   return [];
    }
    else {
        let ss: StateStringParts = [];
        let r: string = s;
        for (;;) {
            const m = ANSI_SGR_REGEXP.exec(r);
            if (!m) break;
            if (m.index>0) ss.push(as,r.slice(0,m.index));
            as=stateUpdate(as,sgrPars2Settings(m[1] ?? '0',mx));
            r=r.slice(m.index+m[0].length);
        }
        if (r) ss.push(as,r);
        return ss;
    }
}

export function sgrMakeState(s: State, ss: State, mx: Modifier = Modifier.STANDARD): string {

    let sr  : string = '';
    let sx  : number;
    let sxx : number;
    let cx  : number;

    sx=(ss.ms ^ s.ms) | (s.mm & (~ss.mm));
    sxx=(ss.ms & Modifier.FINAL) ? 0 : ((ss.mm & (~ss.ms)) & (~s.mm));

    for (let sm=1;sm<=sx;sm<<=1) {
        if (!(sx & sm)) continue;
        switch (sm) {
            case Modifier.BOLD:
            case Modifier.DIM:
                if (ss.ms & Modifier.BOLD) {
                    sr += '1;';
                    sxx &= (~Modifier.BOLD_DIM);
                }
                else if (ss.ms & Modifier.DIM) {
                    sr += '2;';
                    sxx &= (~Modifier.BOLD_DIM);
                }
                else if (mx & Modifier.DOUBLE_UNDERLINE)
                    sr += '22;';
                else
                    sr += '21;';
                sx &= (~Modifier.BOLD_DIM);
                break;
            case Modifier.UNDERLINE:
            case Modifier.DOUBLE_UNDERLINE:
                if (ss.ms & Modifier.UNDERLINE) {
                    sr += ((s.ms & Modifier.DOUBLE_UNDERLINE) ? '24;4;' : '4;');
                    sxx &= (~Modifier.ANY_UNDERLINE);
                }
                else if (ss.ms & Modifier.DOUBLE_UNDERLINE) {
                    sr += '21;';
                    sxx &= (~Modifier.ANY_UNDERLINE);
                }
                else
                    sr += '24;';
                sx &= (~Modifier.ANY_UNDERLINE);
                break;
            case Modifier.ITALIC:
                sr=sr+((ss.ms & Modifier.ITALIC) ? '3;' : '23;');
                break;
            case Modifier.INVERSE:
                sr=sr+((ss.ms & Modifier.INVERSE) ? '7;' : '27;');
                break;
            case Modifier.HIDDEN:
                sr=sr+((ss.ms & Modifier.HIDDEN) ? '8;' : '28;');
                break;
            case Modifier.STRIKE_THROUGH:
                sr=sr+((ss.ms & Modifier.STRIKE_THROUGH) ? '9;' : '29;');
                break;
            case Modifier.BLINK:
            case Modifier.RAPID_BLINK:
                if (ss.ms & Modifier.BLINK) {
                    sr += '5;';
                    sxx &= (~Modifier.ANY_BLINK);
                }
                else if (ss.ms & Modifier.RAPID_BLINK) {
                    sr += '6;';
                    sxx &= (~Modifier.ANY_BLINK);
                }
                else
                    sr += '25;';
                sx &= (~Modifier.ANY_BLINK);
                break;
            case Modifier.OVERLINE:
                sr=sr+((ss.ms & Modifier.OVERLINE) ? '53;' : '55;');
                break;
        }
    }

    cx=201;
    for (let sm=1;sm<=sxx;sm<<=1,cx+=1) {
        if (sxx & sm) sr+=cx+';'; }

    if (ss.fg!==s.fg) {
        if (ss.fg)
            sr=sr+ss.fg+';';
        else if (s.fg)
            sr=sr+'39;';
    }
    if (ss.bg!==s.bg) {
        if (ss.bg)
            sr=sr+ss.bg+';';
        else if (s.bg)
            sr=sr+'49;';
    }

//  console.log('Make:',stateShow(s),'->',stateShow(ss),'->',sr);

    if (sr && !ss.fg && !ss.bg && !(ss.mm & Modifier.STANDARD)) return '\x1B[m';

    return sr ? '\x1B['+sr.slice(0,-1)+'m' : '';
}

export class StateStringList {

    styler: ConsoleStylerBase;
    parts: StateStringParts;

    constructor(s: string, cs: ConsoleStylerBase)

    {   this.styler=cs;
        this._initialState=cs._initialState;
        this.parts=sqrSplit(s,this._initialState,cs.modifier);
    }

    showParts(): string {

        let lx: string = '[';
        let ls: string = '';

        for (const p of this.parts) {
            if (typeof p !== 'string') {
                lx=lx+ls+stateShow(p);
            }
            else {
                lx=lx+ls+"'"+p+"'";
            }
            ls=',';
        }

        return lx+']';
    }

    toString() : string {

//      console.log('toString',this.showParts());

        let s  = ANSI_NO_STATE;
        let ss = ANSI_NO_STATE;
        let r  = '';
        const mx = this.styler.modifier;

        if (this.styler.level<Colors.LEVEL_16M)
            this.colorLevel(this.styler.level);

        for (let x of this.parts) {
            if (typeof x !== 'string')
                ss=x;
            else if (x.indexOf('\n')<0) {
                r=r+sgrMakeState(s,ss,mx)+x;
                s=ss;
            }
            else if (x==='\n' || x==='\r\n') {
                r=r+sgrMakeState(s,ANSI_NO_STATE,mx)+x;
                s=ANSI_NO_STATE;
            }
            else {
                let m: RegExpExecArray | null;
                for (;;) {
                    m=/^([^\r\n]*)(\r?\n)(.*)$/ms.exec(x);
                    if (!m) break;
                    if (m[1]) { r=r+sgrMakeState(s,ss,mx)+m[1]; s=ss; }
                    r=r+sgrMakeState(s,ANSI_NO_STATE,mx)+m[2];
                    s=ANSI_NO_STATE;
                    x=m[3];
                }
                if (x) { r=r+sgrMakeState(s,ss,mx)+x; s=ss; }
            }
        }

//      console.log('toString -> s='+stateShow(s));

        if (s.fg || s.bg)
            r+='\x1B[m';
        else if ((((s.ms & Modifier.FINAL) ? 0 : s.mm) | s.ms) & Modifier.STANDARD)
            r+='\x1B[m';

//      r=r+sgrMakeState(s,ANSI_NO_STATE,mx);

//      console.log('toString ->',r.replace(/\x1B(\[[0-9;]*m)/g,'\x1B[4;31m€$1\x1B[0m'));

        return r;
    }

    reset(): void {

        const s = this.parts.map(x => (typeof x === 'string') ? x : '').join('');
        this.parts=[this._initialState,s];

    }

    finalise(): void {

        const p = this.parts;
        const l = p.length;

        for (let i=0;i<l;++i) {
            if (typeof p[i] !== 'string') {
                (p[i] as State).ms|=Modifier.FINAL;
                (p[i] as State).mm|=Modifier.FINAL;
            }
        }
    }

    colorLevel(l: number) {

        if (l<Colors.LEVEL_16) {
            this.reset();
        }
        else if (l<Colors.LEVEL_256) {
            const p = this.parts;
            const l = p.length;
            for (let i=0;i<l;++i) {
                if (typeof p[i] !== 'string') {
                    p[i]=stateColor16(p[i] as State);
                }
            }
        }
        else if (l<Colors.LEVEL_16M) {
            const p = this.parts;
            const l = p.length;
            for (let i=0;i<l;++i) {
                if (typeof p[i] !== 'string') {
                    p[i]=stateColor256(p[i] as State);
                }
            }
        }
    }

    applySettings(ss: Settings)  {

        const p = this.parts;
        const l = p.length;

//      console.log("Apply: ",this.showParts()," + ",stateShow(ss));

        for (let i=0;i<l;++i) {
            if (typeof p[i] === 'string') continue;
            p[i]=stateApply(p[i] as State,ss);
        }

//      console.log("     ->",this.showParts());
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
            this.parts = [ this._initialState, f, ... this.parts, this._initialState, b ];
        }
        else if (f) {
            this.parts = [ this._initialState, f, ... this.parts ];
        }
        else if (b) {
            this.parts = [ ... this.parts, this._initialState, b ];
        }
    }

    addFront(f: string | undefined) {

        if (f) this.parts = [ this._initialState, f, ... this.parts ];
    }
    
    addBack(b: string | undefined) {

        if (b) this.parts.push(this._initialState, b);
    }

    addBackWithState(s: State, b: string | undefined) {

        if (b) this.parts.push(s,b);
    }

    addFrontSeq(s: string, as?: State) {

        if (!s) return;

        if (s.indexOf('\x1B')>=0) {
            let lx = sqrSplit(s,as);
            this.parts=[...lx,...this.parts];
        }
        else
            this.parts=[as ?? this._initialState, s, ...this.parts];
    }

    addBackSeq(s: string, as?: State) {

        if (!s) return;

        if (s.indexOf('\x1B')>=0) {
            let lx = sqrSplit(s,as ?? this._initialState);
            this.parts=[...this.parts, ...lx];
        }
        else
            this.parts.push(as ?? this._initialState, s);
    }

    addBackList(l2: StateStringList) {

        this.parts=[...this.parts,...l2.parts];

    }

    protected _initialState: State;
}