import ConsoleStyler from '../console-styler';

const ESCAPE = { '\x1B': '␛' };

describe('Formating of "\\n"...', () => {

    let cs: ConsoleStyler;

    it('new ConsoleStyler', () => {
        cs = new ConsoleStyler({ ctrlName: ESCAPE });
        expect(cs instanceof ConsoleStyler).toBe(true);
        expect(cs.sgr(cs.none('None'))).toBe('None');
    });

    it('Red Text', () => {
        expect(cs.ctrl(cs.sgr(cs.red('Red Text'))))
            .toBe('␛[31mRed Text␛[m');
    });

    it('Red Text with NewLine', () => {
        expect(cs.ctrl(cs.sgr(cs.red('Red\nText'))))
            .toBe('␛[31mRed␛[m\\n␛[31mText␛[m');
    });

    it('Red NewLine', () => {
        expect(cs.ctrl(cs.sgr(cs.red('\n'))))
            .toBe('\\n');
    });

    it('Red NewLine at the End', () => {
        expect(cs.ctrl(cs.sgr(cs.red('Red\n'))))
            .toBe('␛[31mRed␛[m\\n');
    });

    it('Red NewLine at the Start', () => {
        expect(cs.ctrl(cs.sgr(cs.red('\nRed'))))
            .toBe('\\n␛[31mRed␛[m');
    });

    it('Red NewLine After Blue Text', () => {
        expect(cs.ctrl(cs.sgr(cs.f('{{blue|Blue - }}{{red|\nRed}}'))))
            .toBe('␛[34mBlue - ␛[m\\n␛[31mRed␛[m');
    });

    it('Red NewLine in Blue Text', () => {
        expect(cs.ctrl(cs.sgr(cs.f('{{blue|Blue - {{red|\nRed}} - Back to Blue}}'))))
            .toBe('␛[34mBlue - ␛[m\\n␛[31mRed␛[34m - Back to Blue␛[m');
    });

    it('Red NewLine in Blue Underlined Text I', () => {
        expect(cs.ctrl(cs.sgr(cs.f('{{ul.blue|Blue - {{red|Red\n}} - Back to Blue}}'))))
            .toBe('␛[4;34mBlue - ␛[31mRed␛[m\\n␛[4;34m - Back to Blue␛[m');
    });

    it('Red NewLine in Blue Underlined Text II', () => {
        expect(cs.ctrl(cs.sgr(cs.f('{{ul.blue|Blue - {{red|Red\nRed}} - Back to Blue}}'))))
            .toBe('␛[4;34mBlue - ␛[31mRed␛[m\\n␛[4;31mRed␛[34m - Back to Blue␛[m');
    });
});

describe('Formating of "\\r\\n"...', () => {

    let cs: ConsoleStyler;

    it('new ConsoleStyler', () => {
        cs = new ConsoleStyler({ ctrlName: ESCAPE });
        expect(cs instanceof ConsoleStyler).toBe(true);
        expect(cs.sgr(cs.none('None'))).toBe('None');
    });

    it('Red Text', () => {
        expect(cs.ctrl(cs.sgr(cs.red('Red Text'))))
            .toBe('␛[31mRed Text␛[m');
    });

    it('Red Text with NewLine', () => {
        expect(cs.ctrl(cs.sgr(cs.red('Red\r\nText'))))
            .toBe('␛[31mRed␛[m\\r\\n␛[31mText␛[m');
    });

    it('Red NewLine', () => {
        expect(cs.ctrl(cs.sgr(cs.red('\r\n'))))
            .toBe('\\r\\n');
    });

    it('Red NewLine at the End', () => {
        expect(cs.ctrl(cs.sgr(cs.red('Red\r\n'))))
            .toBe('␛[31mRed␛[m\\r\\n');
    });

    it('Red NewLine at the Start', () => {
        expect(cs.ctrl(cs.sgr(cs.red('\r\nRed'))))
            .toBe('\\r\\n␛[31mRed␛[m');
    });

    it('Red NewLine After Blue Text', () => {
        expect(cs.ctrl(cs.sgr(cs.f('{{blue|Blue - }}{{red|\r\nRed}}'))))
            .toBe('␛[34mBlue - ␛[m\\r\\n␛[31mRed␛[m');
    });

    it('Red NewLine in Blue Text', () => {
        expect(cs.ctrl(cs.sgr(cs.f('{{blue|Blue - {{red|\r\nRed}} - Back to Blue}}'))))
            .toBe('␛[34mBlue - ␛[m\\r\\n␛[31mRed␛[34m - Back to Blue␛[m');
    });

    it('Red NewLine in Blue Underlined Text I', () => {
        expect(cs.ctrl(cs.sgr(cs.f('{{ul.blue|Blue - {{red|Red\r\n}} - Back to Blue}}'))))
            .toBe('␛[4;34mBlue - ␛[31mRed␛[m\\r\\n␛[4;34m - Back to Blue␛[m');
    });

    it('Red NewLine in Blue Underlined Text II', () => {
        expect(cs.ctrl(cs.sgr(cs.f('{{ul.blue|Blue - {{red|Red\r\nRed}} - Back to Blue}}'))))
            .toBe('␛[4;34mBlue - ␛[31mRed␛[m\\r\\n␛[4;31mRed␛[34m - Back to Blue␛[m');
    });
});