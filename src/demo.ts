import ConsoleStyler from './console-styler';
import { inspect } from 'util';

const cs=new ConsoleStyler({ format: ['(', ')', ':' ] });

function log(s: string): void {

    console.log((inspect(cs.fx(s))+'                                    ').slice(0,44),cs.f(s));
}

if (process.argv.length>2) {
    for (const s of process.argv.slice(2))
        log(s);
}
else {
    log('(red:Red Text)');
    log('(#CC6600:Orange Text)');
    log('(@170:Green Text)');
    log('Normal (bold:Bold)');
    log('Normal (dim:Dim)');
    log('Normal (underline:Underlined)');
    log('(underline:UL (not.underline:Norm) UL)');
    log('(not.underline:Normal)');
    log('Normal (doubleUnderline:Double Underlined)');
    log('Normal (strikethrough:Strike Through)');
    log('Normal (overline:Overlined)');
    log('Normal (bright.blue.blink:Blinking)');
    log('Normal (bright.blue.rapidBlink:Rapid Blinking)');
    log('Normal (hidden:Hidden)');
    log('Normal (inverse:Inverse)');
}