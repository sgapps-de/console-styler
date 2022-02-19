import { ConsoleStyler } from '../console-styler';

const ESCAPE = { '\x1B': '␛' };

describe('Formating with cs...', () => {

  let cs: ConsoleStyler;

  it('new ConsoleStyler', () => {
    cs=new ConsoleStyler({ ctrlName: ESCAPE });
    expect(cs.sgr(cs('None'))).toBe('None');
    expect(cs.sgr(cs.none('None'))).toBe('None');
  });

  it('Red Text', () => {
    expect(cs.sgr(cs.red('Red')))
      .toBe('␛[31mRed␛[m');
  });
  
  it('Red Text II', () => {
    expect(cs.red.sgr('Red'))
      .toBe('␛[31mRed␛[m');
  });
  
  it('Orange Text I', () => {
    expect(cs.sgr(cs.n('#CC6600')('Orange')))
      .toBe('␛[38;2;204;102;0mOrange␛[m');
  });
  
  it('Orange Text II', () => {
    expect(cs.sgr(cs.n('#C60')('Orange')))
      .toBe('␛[38;2;204;102;0mOrange␛[m');
  });

  it('Orange Text III', () => {
    expect(cs.sgr(cs.hex('#C60')('Orange')))
      .toBe('␛[38;2;204;102;0mOrange␛[m');
  });
  
  it('Orange Text IV', () => {
    expect(cs.sgr(cs.ansi256(172)('Orange')))
      .toBe('␛[38;5;172mOrange␛[m');
  });
  
  it('Orange Text V', () => {
    expect(cs.sgr(cs.rgb(204,102,0)('Orange')))
      .toBe('␛[38;2;204;102;0mOrange␛[m');
  });
  
  it('Red Text Underlined I', () => {
    expect(cs.sgr(cs.underline.red('Red')))
      .toBe('␛[4;31mRed␛[m');
  });

  it('Red Text Underlined II', () => {
    expect(cs.sgr(cs.red.underline('Red')))
      .toBe('␛[4;31mRed␛[m');
  });

  it('Underlined Text Partly Red', () => {
    expect(cs.sgr(cs.underline('The '+cs.red('Red')+' Color')))
      .toBe('␛[4mThe ␛[31mRed␛[39m Color␛[m');
  });

  it('Red Text Partly Underlined', () => {
    expect(cs.sgr(cs.red('The '+cs.underline('Red')+' Color')))
      .toBe('␛[31mThe ␛[4mRed␛[24m Color␛[m');
  });

  it('Red Text Partly Bold', () => {
    expect(cs.sgr(cs.red('The '+cs.bold('Red')+' Color')))
      .toBe('␛[31mThe ␛[1mRed␛[22m Color␛[m');
  });

  it('Bright Black I', () => {
    expect(cs.sgr(cs.bright.black('Bright Black')))
      .toBe('␛[90mBright Black␛[m');
  });
  
  it('Bright Black II', () => {
    expect(cs.sgr(cs.blackBright('Bright Black')))
      .toBe('␛[90mBright Black␛[m');
  });
  
  it('Dark White', () => {
    expect(cs.sgr(cs.dark.white('Dark White')))
      .toBe('␛[37mDark White␛[m');
  });
  
  it('Green Background I', () => {
    expect(cs.sgr(cs.bgGreen('Green')))
      .toBe('␛[42mGreen␛[m');
  });

  it('Green Background II', () => {
    expect(cs.sgr(cs.bg.green('Green')))
      .toBe('␛[42mGreen␛[m');
  });

  it('Green Background III', () => {
    expect(cs.sgr(cs.n('bg.green')('Green')))
      .toBe('␛[42mGreen␛[m');
  });

  it('Orange Background I', () => {
    expect(cs.sgr(cs.bgHex('#C60')('Orange')))
      .toBe('␛[48;2;204;102;0mOrange␛[m');
  });

  it('Orange Background II', () => {
    expect(cs.sgr(cs.bg.hex('#C60')('Orange')))
      .toBe('␛[48;2;204;102;0mOrange␛[m');
  });

  it('Orange Background III', () => {
    expect(cs.sgr(cs.bgRgb(204,102,0)('Orange')))
      .toBe('␛[48;2;204;102;0mOrange␛[m');
  });

  it('Orange Background IV', () => {
    expect(cs.sgr(cs.bg.rgb(204,102,0)('Orange')))
      .toBe('␛[48;2;204;102;0mOrange␛[m');
  });

  it('Orange Background V', () => {
    expect(cs.sgr(cs.bgAnsi256(172)('Orange')))
      .toBe('␛[48;5;172mOrange␛[m');
  });

  it('Orange Background VI', () => {
    expect(cs.sgr(cs.bg.ansi256(172)('Orange')))
      .toBe('␛[48;5;172mOrange␛[m');
  });

  it('Reset I', () => {
    expect(cs.sgr(cs.reset(cs.red('Foo'))))
      .toBe('Foo');
  });

  it('Reset II', () => {
    expect(cs.sgr(cs.red.reset('Foo')))
      .toBe('Foo');
  });

  it('Reset III', () => {
    expect(cs.sgr(cs.reset.blue(cs.red('Foo'))))
      .toBe('␛[34mFoo␛[m');
  });

  it('Reset IV', () => {
    expect(cs.sgr(cs.blue.reset(cs.red('Foo'))))
      .toBe('Foo');
  });

  it('Empty String', () => {
    expect(cs.sgr(cs.red('')))
      .toBe('');
  });
});
