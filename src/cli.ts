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

import { ConsoleStyler, ConsoleStyle } from './console-styler'

let cs = new ConsoleStyler({});
let s1: string;

/*
console.log(cs.s.red('Silvan'))
console.log(cs.s.underline('Silvan'))
console.log(cs.s.underline(cs.s.red('Silvan')))
console.log(cs.s.red.underline('Silvan'))
console.log(cs.s.underline.red('Silvan'))
console.log(cs.s['underline.blue']('Silvan'))
console.log(cs.s['#804000']('Silvan'))
*/


/*
s1=cs.s.red('Silvan')
s1=cs.s.underline('Rolf '+s1+' Greverus')
console.log(s1);
console.log(cs.showEscape(s1))
console.log(cs.showEscape(s1,'red'))
*/

/*
s1=cs.f("{{underline|Rolf {{red|Si{{bold|lv}}an}} Greverus}}");
console.log(s1);
console.log(cs.showEscape(s1,'red'))
*/

/*
s1=cs.s.underline(`Rolf ${cs.s.red(`Si${cs.s.bold('lv')}an`)} Greverus`);
console.log(s1);
console.log(cs.showEscape(s1,'red'))

cs = new ConsoleStyler({ notModifiers: true });
s1=cs.s.blink.gray(`Rolf ${cs.s.red.notBlink(`Si${cs.s.blue('lv')}an`)} Greverus`);
console.log(s1);
console.log(cs.showEscape(s1,'red'))
*/

/*
cs.alias('err','underline+red');
s1=cs.s.err('FEHLER');
console.log(s1);
console.log(cs.showEscape(s1,'red'))
*/

s1=cs.f('Text: "{{underline|Die {{red|r{{strike|ot}}e}} Farbe}}"')
console.log(s1);
console.log(cs.showEscape(s1))
console.log(cs.showEscape(s1,'red'))

// s1=cs.f('{{blue|Text: "{{underline|Die {{red|r{{strike|ot}}e}} Farbe}}"}}')
// console.log(s1);
// console.log(cs.showEscape(s1))
// console.log(cs.showEscape(s1,'red'))

// s1=cs.f('{{blue|Text: "{{underline|Die {{red|r{{dul|ot}}e}} Farbe}}"}}')
// console.log(s1);
// console.log(cs.showEscape(s1))
// console.log(cs.showEscape(s1,'red'))
