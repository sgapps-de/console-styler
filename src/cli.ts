/*

import { ansiSeq2Settings, ansiSplit, AnsiString } from './console-styler'

function testSeq(seq: string) {

    let s = ansiSeq2Settings(seq.replace(/€/g,'\x1b'));
    console.log('Seq:',seq,'->',s);
}

function testSplit(str: string) {

    let s = ansiSplit(str.replace(/€/g,'\x1b'));
    console.log('Split:',str,'->\n      ',s);
}

console.log("******* Sequences *******")
testSeq('€[31m')
testSeq('€[31;45m')
testSeq('€[41m')
testSeq('€[1;41m')
testSeq('€[4m')
console.log('--------------------------')

console.log("******* Split ***********")
testSplit('abc€[31mRED€[39mdef')
testSplit('abc€[31mRED€[39mdef€[34mBLUE€[39m€[42mBG-GREEN')
testSplit('abc€[31mRED€[39mdef€[34mBLUE€[39;42mBG-GREEN')
console.log('--------------------------')

console.log("******* AnsiString ***********")
let a = new AnsiString('Greverus');
console.log("a instanceof AnsiString:",a instanceof AnsiString)
console.log(a.parts)
a.applySettings({ ms:4, mm:4, mr:0 });
console.log(a.parts)
a.addFront('Silvan ');
console.log(a.parts)
a.applySettings({ fg: '31', ms:0, mm:0, mr:0 });
console.log(a.parts)
a.add('Rolf ',' aus München');
console.log(a.parts)
a.applySettings({ fg: '34', ms:0, mm:0, mr:0 });
console.log(a.parts)
console.log(a.toString())

*/

// type ChalkerFunction = (... args: unknown[]) =>  string;

// type ChalkerStyles = { [key: string] : ChalkerStyle }
// type ChalkerProps = {
//     fmt: (... args: unknown[]) =>  string;
//     alias: (n: string, sx: any) => void;
// }

// type ChalkerStyle = ChalkerStyles & ChalkerFunction & ChalkerProps;

// let x: ChalkerStyle = {} as unknown as ChalkerStyle;

// let s: string = x.fmt('Emil');


import { ConsoleStyler, ConsoleStyle } from './console-styler'
import { Modifier } from './state'
import util from 'util';

const CTRL_NAMES : { [key: string]: string }= {
    '\r': '\\r', 
    '\n': '\\n', 
    '\x1B': '␛', 
}  

const CTRL_STYLES = {
    'sgr': 'bgRed.white',
    '?': 'bgGreen.white',
}

function showSGR(r: string) {

   return r.replace(/\x1B(\[[0-9;]*m)/g,'\x1B[4;31m€$1\x1B[0m');
}

// let cs = new ConsoleStyler({ level:3, not: true, ctrlName: CTRL_NAMES, ctrlStyle: CTRL_STYLES });
let cs = new ConsoleStyler({ term: 'windows-terminal', modifier: Modifier.DEFAULT, ctrlName: CTRL_NAMES, ctrlStyle: CTRL_STYLES });
let s1: string;

cs.alias('ru','red.underline');
s1=cs.f('{{ru|Silvan}}');
console.log(s1);
console.log(showSGR(s1));

// let redUnderline = cs.red.underline;
// s1=redUnderline('Silvan');
// console.log(s1);
// console.log(showSGR(s1));

// const CSF = cs.t;
// s1=CSF`{{red|${'Silvan'}}} {{blue|${'Greverus'}}}${'!'}`
// console.log(s1);
// console.log(showSGR(s1));
// s1=cs.s.underline('Die '+s1+' Farbe')
// console.log(s1);
// console.log(showSGR(s1));

// s1=cs.f('{{blue|Das {{bold|blaue}} Wunder}}');
// console.log(s1);
// console.log(cs.s.ctrl(s1));

// s1=cs.s.bg['#CC6600']('Red');
// console.log(s1);
// console.log(cs.s.ctrl(s1));

// s1=cs.red('Red');
// console.log(s1);
// console.log(cs.s.ctrl(s1));

// s1=cs.s.bg.green('Green');
// console.log(s1);
// console.log(cs.s.ctrl(s1));

// s1=cs.f('{{!underline|Silvan}}')
// console.log(s1);
// console.log(cs.s.ctrl(s1));

// s1=cs.s.underline('Hallo '+s1+' Greverus')
// console.log(s1);
// console.log(cs.s.ctrl(s1));

// s1=cs.f('{{underline|Hallo {{!underline|Silvan}} Greverus')
// console.log(s1);
// console.log(cs.s.ctrl(s1));

// console.log(cs.s.sgr(cs.f('SGR:  {{red|Silvan}}!')));


// console.log(cs.s.sgr(cs.f('SGR:  {{red|Silvan}}!')));
// cs.ctrlStyle('sgr',cs.s.red.underline);
// console.log(cs.s.sgr(cs.f('SGR:  {{red|Silvan}}!')));
// console.log(cs.s.ctrl(cs.f('CTRL: {{red|Silvan}}!')));
// cs.ctrlStyle('?',cs.s.bgGreen.white);
// console.log(cs.s.ctrl(cs.f('CTRL: {{red|Silvan}} Greverus\nMünchen')));
// cs.ctrlStyle('sgr');
// console.log(cs.s.sgr(cs.f('SGR:  {{red|Silvan}}!')));
// console.log(cs.s.ctrl(cs.f('CTRL: {{red|Silvan}}!')));
// console.log(cs.s.sgr(cs.f('SGR:  {{red|Silvan}} Greverus\nMünchen')));
// console.log(cs.s.ctrl(cs.f('CTRL: {{red|Silvan}} Greverus\nMünchen')));

// console.log(cs.f('Hallo {{red|Silvan}}!'))
// console.log(cs.showEscape(cs.f('{{underline|Die {{red|ro{{bold|te}}}} Farbe}}')));

// console.log(cs.s.red.upper.ul('Silvan'));
// console.log(cs.f('Hallo {{upper|Silvan}} Greverus'));
// console.log(cs.f('{{ul|Hallo {{red.upper|Silvan}} Greverus}}'));
// console.log(cs.s.sgr(cs.f('{{ul|Hallo {{red.upper|Silvan}} Greverus}}')));
// console.log(cs.f('{{sgr|{{ul|Hallo {{red.upper|Silvan}} Greverus}}}}'));
// console.log(cs.f('{{ul.sgr|Hallo {{red.upper|Silvan}} Greverus}}'));

// console.log(cs.s.red('Silvan'))
// console.log(cs.s.underline('Silvan'))
// console.log(cs.s.underline(cs.s.red('Silvan')))
// console.log(cs.s.red.underline('Silvan'))
// console.log(cs.s.underline.red('Silvan'))
// console.log(cs.s['underline.blue']('Silvan'))
// console.log(cs.s['#804000']('Silvan'))

// s1=cs.s.red('Silvan')
// s1=cs.s.underline('Rolf '+s1+' Greverus')
// console.log(s1);
// console.log(cs.showEscape(s1))
// console.log(cs.showEscape(s1,'red'))

// s1=cs.f("{{underline|Rolf {{red|Si{{bold|lv}}an}} Greverus}}");
// console.log(s1);
// console.log(cs.showEscape(s1,'red'))

// s1=cs.s.underline(`Rolf ${cs.s.red(`Si${cs.s.bold('lv')}an`)} Greverus`);
// console.log(s1);
// console.log(cs.showEscape(s1,'red'))

// cs = new ConsoleStyler({ notModifiers: true });
// s1=cs.s.blink.gray(`Rolf ${cs.s.red.notBlink(`Si${cs.s.blue('lv')}an`)} Greverus`);
// console.log(s1);
// console.log(cs.showEscape(s1,'red'))

// cs.alias('err','underline+red');
// s1=cs.s.err('FEHLER');
// console.log(s1);
// console.log(cs.showEscape(s1,'red'))

// s1=cs.f('Text: "{{underline|Die {{red|r{{strike|ot}}e}} Farbe}}"')
// console.log(s1);
// console.log(cs.showEscape(s1))
// console.log(cs.showEscape(s1,'red'))

// s1=cs.f('{{blue|Text: "{{underline|Die {{red|r{{strike|ot}}e}} Farbe}}"}}')
// console.log(s1);
// console.log(cs.showEscape(s1))
// console.log(cs.showEscape(s1,'red'))

// s1=cs.f('{{blue|Text: "{{underline|Die {{red|r{{dul|ot}}e}} Farbe}}"}}')
// console.log(s1);
// console.log(cs.showEscape(s1))
// console.log(cs.showEscape(s1,'red'))
