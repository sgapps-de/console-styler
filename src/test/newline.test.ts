import { ConsoleStyler } from '../console-styler';

const CTRL_NAMES : { [key: string]: string }= {
  '\r': '\\r', 
  '\n': '\\n', 
  '\x1B': '␛', 
};

describe('Formating of "\\n"...', () => {

    let cs: ConsoleStyler;

    it('new ConsoleStyler', () => {
        cs = new ConsoleStyler({ term: 'test',  ctrlName: CTRL_NAMES });
        expect(cs instanceof ConsoleStyler).toBe(true);
        expect(cs.a.sgr(cs.a.none('None'))).toBe('None');
    });

    it('Red Text', () => {
        expect(cs.a.ctrl(cs.a.sgr(cs.a.red('Red Text'))))
            .toBe('␛[31mRed Text␛[m');
    });

    it('Red Text with NewLine', () => {
        expect(cs.a.ctrl(cs.a.sgr(cs.a.red('Red\nText'))))
            .toBe('␛[31mRed␛[m\\n␛[31mText␛[m');
    });

    it('Red NewLine', () => {
        expect(cs.a.ctrl(cs.a.sgr(cs.a.red('\n'))))
            .toBe('\\n');
    });

    it('Red NewLine at the End', () => {
        expect(cs.a.ctrl(cs.a.sgr(cs.a.red('Red\n'))))
            .toBe('␛[31mRed␛[m\\n');
    });

    it('Red NewLine at the Start', () => {
        expect(cs.a.ctrl(cs.a.sgr(cs.a.red('\nRed'))))
            .toBe('\\n␛[31mRed␛[m');
    });

    it('Red NewLine After Blue Text', () => {
        expect(cs.a.ctrl(cs.a.sgr(cs.f('{{blue|Blue - }}{{red|\nRed}}'))))
            .toBe('␛[34mBlue - ␛[m\\n␛[31mRed␛[m');
    });

    it('Red NewLine in Blue Text', () => {
        expect(cs.a.ctrl(cs.a.sgr(cs.f('{{blue|Blue - {{red|\nRed}} - Back to Blue}}'))))
            .toBe('␛[34mBlue - ␛[m\\n␛[31mRed␛[34m - Back to Blue␛[m');
    });

    it('Red NewLine in Blue Underlined Text I', () => {
        expect(cs.a.ctrl(cs.a.sgr(cs.f('{{ul.blue|Blue - {{red|Red\n}} - Back to Blue}}'))))
            .toBe('␛[4;34mBlue - ␛[31mRed␛[m\\n␛[4;34m - Back to Blue␛[m');
    });

    it('Red NewLine in Blue Underlined Text II', () => {
        expect(cs.a.ctrl(cs.a.sgr(cs.f('{{ul.blue|Blue - {{red|Red\nRed}} - Back to Blue}}'))))
            .toBe('␛[4;34mBlue - ␛[31mRed␛[m\\n␛[4;31mRed␛[34m - Back to Blue␛[m');
    });
});