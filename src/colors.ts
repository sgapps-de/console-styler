export const LEVEL_NONE = 0;
export const LEVEL_16   = 1;
export const LEVEL_256  = 2;
export const LEVEL_16M  = 3;

export function sgrBackground(fg: string): string {

    switch (fg.charAt(0)) {
        case '3':
            return '4'+fg.slice(1);
        case '9':
            return '10'+fg.slice(1);
        default:
            return fg;
    }
}

function sgrBrightSpecial(c: string) {

    const ca: number[] = c.split(';').map(x => parseInt(x));

    if (ca[1]===5)
        return `${ca[0]};5;${c256Bright(ca[2])}`;
    else if (ca[1]===2) 
        return `${ca[0]};2;${rgbBright(ca[2],ca[3],ca[4]).join(';')}`;
    else
        return c;
}

export function sgrBright(c: string): string {

    switch (c.charAt(0)) {
        case '3':
            if (c.charAt(1)==='8')
                return sgrBrightSpecial(c);
            else
                return '9'+c.slice(1);
        case '4':
            if (c.charAt(1)==='8')
                return sgrBrightSpecial(c);
            else
                return '10'+c.slice(1);
        default:
            return c;
    }
}

function sgrDarkSpecial(c: string) {

    const ca: number[] = c.split(';').map(x => parseInt(x));

    if (ca[1]===5)
        return `${ca[0]};5;${c256Dark(ca[2])}`;
    else if (ca[1]===2) 
        return `${ca[0]};2;${rgbDark(ca[2],ca[3],ca[4]).join(';')}`;
    else
        return c;
}

export function sgrDark(c: string): string {

    switch (c.charAt(0)) {
        case '3':
            if (c.charAt(1)==='8')
                return sgrDarkSpecial(c);
            else
                return c;
        case '4':
            if (c.charAt(1)==='8')
                return sgrDarkSpecial(c);
            else
                return c;
        case '9':
            return '3'+c.slice(1);
        case '1':
            return '9'+c.slice(2);
        default:
            return c;
    }
}

function sgrSpecialTo16(c: string): string {

    const ca: number[] = c.split(';').map(x => parseInt(x));

    if (ca[1]===5) {
        const c16 = c256ToC16(ca[2]);
        const cs = ca[0]-8+(c16<8 ? c16 : (c16+52));        
        return ''+cs;
    }
    else if (ca[1]===2) {
        const c16 = rgbToC16(ca[2],ca[3],ca[4]);
        const cs = ca[0]-8+(c16<8 ? c16 : (c16+52));        
        return ''+cs;
    }
    else
        return '31';
}

export function sgrTo16(c: string): string {

    if (c.charAt(1)==='8')
        return sgrSpecialTo16(c);
    else
        return c;
}

function sgrSpecialTo256(c: string): string {

    if (c.startsWith('38;2;') || c.startsWith('48;2;')) {
        const ca: number[] = c.split(';').map(x => parseInt(x));
        const c256 = rgbToC256(ca[2],ca[3],ca[4]);
        return c.slice(0,3)+'5;'+c256;        
    }
    else
        return c;
}

export function sgrTo256(c: string): string {

    if (c.charAt(1)=='8')
        return sgrSpecialTo256(c);
    else
        return c;
}

export function sgrFromRgb(r: number, g: number, b: number, bg: boolean = false): string {

    return `${bg ? 48 : 38};2;${r};${g};${b}`;
}

export function sgrFromHex(hx: string, bg: boolean = false): string {

    const c: [ number, number, number ] | null = hexToRgb(hx);
    return c ? sgrFromRgb(c[0],c[1],c[2],bg) : (bg ? '46' : '36');
}

export function sgrFromC256(c: number, bg: boolean = false): string {

    return `${bg ? 48 : 38};5;${c}`;
}

export function sgrFromC16(c: number, bg: boolean = false): string {

    return ''+(bg ? 40 : 30)+(c<8 ? c : (c+52));        
}

export const COLOR16_RGB: [ number, number, number ][] = [
    [ 0, 0, 0       ], // 0 = Black
    [ 197, 15, 31   ], // 1 = Red
    [ 19, 161, 14   ], //  2 = Green
    [ 193, 156, 0   ], //  3 = Yellow
    [ 0, 55, 218    ], //  4 = Blue
    [ 136, 23, 152  ], //  5 = Magenta
    [ 58, 150, 221  ], //  6 = Cyan
    [ 204, 204, 204 ], //  7 = Dark White
    [ 118, 118, 118 ], //  8 = Bright Black 
    [ 231, 72, 86   ], //  9 = Bright Red
    [ 22, 198, 12   ], // 10 = Bright Green
    [ 249, 241, 165 ], // 11 = Bright Yellow
    [ 59, 120, 255  ], // 12 = Bright Blue
    [ 180, 0, 158   ], // 13 = Bright Magenta
    [ 97, 214, 214  ], // 14 = Bright Cyan
    [ 242, 242, 242 ], // 15 = Bright White
];

export function c256ToRgb(c: number): [ number, number, number ] {

    if (c<16)
        return COLOR16_RGB[c];
    else if (c<232) {
        c-=16;
        return [ 51*Math.floor(c/36), 51*(Math.floor(c/6)%6), 51*(c%6) ];
    }
    else {
        c=Math.min((c-232)*16,255);
        return [c, c, c];
    }
}

export function c16ToRgb(c: number): [ number, number, number ] {

    return COLOR16_RGB[c<16 ? c : 15];

}

export function rgbToC256(r: number, g: number, b: number): number {

    const c1 = Math.min(r,g,b);
    const c2 = Math.max(r,g,b);

    if (c2-c1<=50) // Gray
        return 232+Math.floor((r+g+b)/48);
    else
        return 36*Math.round(r/51)+6*Math.round(g/51)+Math.round(b/51)+16;
}

function grayToC16(g: number): number {

    return (g<50) ? 0 : (g<150) ? 8 : (g<230) ? 7 : 15;
}

function colorToC16(c1: number, c2: number, r1: number, r2: number): number {

    if (c2>0.75*c1) 
        return (c1>160) ? r2+8 : r2;
    else
        return (c1>160) ? r1+8 : r1;
}

export function rgbToC16(r: number, g: number, b: number): number {

    if (r>=g) {
        if (g>=b) {
            if (b>0.75*r) return grayToC16((r+g+b)/3);
            else          return colorToC16(r,g,1,3);
        }
        else if (r>=b) {
            if (g>0.75*r) return grayToC16((r+g+b)/3);
            else          return colorToC16(r,b,1,5);
        }
        else {
            if (g>0.75*b) return grayToC16((r+g+b)/3);
            else          return colorToC16(b,r,4,5);
        }
    }
    else {
        if (r>=b) {
            if (b>0.75*g) return grayToC16((r+g+b)/3);
            else          return colorToC16(g,r,2,3);
        }
        else if (g>=b) {
            if (r>0.75*g) return grayToC16((r+g+b)/3);
            else          return colorToC16(g,b,2,6);
        }
        else {
            if (r>0.75*b) return grayToC16((r+g+b)/3);
            else          return colorToC16(b,g,4,6);
        }
    }
}

export function c256ToC16(c: number): number {

    if (c<16) return c;

    const [ r, g, b ] = c256ToRgb(c);
    return rgbToC16(r,g,b);
}

export function rgbDark(r: number, g: number, b: number) {

    return [ Math.round(0.75*r), Math.round(0.75*g), Math.round(0.75*b) ];
}

export function rgbBright(r: number, g: number, b: number) {

    return [ Math.min(Math.round(1.333*r),255), Math.min(Math.round(1.333*g),255), Math.min(Math.round(1.333*b),255) ];
}

export function c256Dark(c: number): number {

    const [ r1, g1, b1 ] = c256ToRgb(c);
    const [ r2, g2, b2 ] = rgbDark(r1,g1,b1);

    return rgbToC256(r2,g2,b2);
}

export function c256Bright(c: number): number {

    const [ r1, g1, b1 ] = c256ToRgb(c);
    const [ r2, g2, b2 ] = rgbBright(r1,g1,b1);

    return rgbToC256(r2,g2,b2);
}

export function hexToRgb(hx: string): [ number, number, number ] | null {

    let r,g,b: number;

    hx=hx.replace(/[#,]/g,'');
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
    else {
        return [ 255, 0, 255 ];
    }

    return [ r,g,b ];
}

