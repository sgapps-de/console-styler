import { ConsoleStyler } from '../console-styler'

const CTRL_NAMES : { [key: string]: string }= {
  '\r': '\\r', 
  '\n': '\\n', 
  '\x1B': '␛', 
}

describe('Formating with cs.s ...', () => {

  let cs: ConsoleStyler;

  it('new ConsoleStyler', () => {
    cs=new ConsoleStyler({ term: 'test',  ctrlName: CTRL_NAMES });
    expect(cs instanceof ConsoleStyler).toBe(true);
    expect(cs.a.sgr(cs.a.none('None'))).toBe('None');
  })

  it('Red Text', () => {
    expect(cs.a.sgr(cs.a.red('Red')))
      .toBe('␛[31mRed␛[m');
  })
  
  it('Orange Text I', () => {
    expect(cs.a.sgr(cs.a['#CC6600']('Orange')))
      .toBe('␛[38;2;204;102;0mOrange␛[m');
  })
  
  it('Orange Text II', () => {
    expect(cs.a.sgr(cs.a['#C60']('Orange')))
      .toBe('␛[38;2;204;102;0mOrange␛[m');
  })
  
  it('Orange Text III', () => {
    expect(cs.a.sgr(cs.hex('#C60')('Orange')))
      .toBe('␛[38;2;204;102;0mOrange␛[m');
  })
  
  it('Orange Text IV', () => {
    expect(cs.a.sgr(cs.ansi256(172)('Orange')))
      .toBe('␛[38;5;172mOrange␛[m');
  })
  
  it('Orange Text V', () => {
    expect(cs.a.sgr(cs.rgb(204,102,0)('Orange')))
      .toBe('␛[38;2;204;102;0mOrange␛[m');
  })
  
  it('Red Text Underlined I', () => {
    expect(cs.a.sgr(cs.a.underline.red('Red')))
      .toBe('␛[4;31mRed␛[m');
  })

  it('Red Text Underlined II', () => {
    expect(cs.a.sgr(cs.a.red.underline('Red')))
      .toBe('␛[4;31mRed␛[m');
  })

  it('Underlined Text Partly Red', () => {
    expect(cs.a.sgr(cs.a.underline('The '+cs.a.red('Red')+' Color')))
      .toBe('␛[4mThe ␛[31mRed␛[39m Color␛[m');
  })

  it('Red Text Partly Underlined', () => {
    expect(cs.a.sgr(cs.a.red('The '+cs.a.underline('Red')+' Color')))
      .toBe('␛[31mThe ␛[4mRed␛[24m Color␛[m');
  })

  it('Red Text Partly Bold', () => {
    expect(cs.a.sgr(cs.a.red('The '+cs.a.bold('Red')+' Color')))
      .toBe('␛[31mThe ␛[1mRed␛[22m Color␛[m');
  })

  it('Bright Black I', () => {
    expect(cs.a.sgr(cs.a.bright.black('Bright Black')))
      .toBe('␛[90mBright Black␛[m');
  })
  
  it('Bright Black II', () => {
    expect(cs.a.sgr(cs.a.blackBright('Bright Black')))
      .toBe('␛[90mBright Black␛[m');
  })
  
  it('Dark White', () => {
    expect(cs.a.sgr(cs.a.dark.white('Dark White')))
      .toBe('␛[37mDark White␛[m');
  })
  
  it('Green Background I', () => {
    expect(cs.a.sgr(cs.a.bgGreen('Green')))
      .toBe('␛[42mGreen␛[m');
  })

  it('Green Background II', () => {
    expect(cs.a.sgr(cs.a.bg.green('Green')))
      .toBe('␛[42mGreen␛[m');
  })

  it('Green Background III', () => {
    expect(cs.a.sgr(cs.a['bg.green']('Green')))
      .toBe('␛[42mGreen␛[m');
  })

  it('Orange Background I', () => {
    expect(cs.a.sgr(cs.bgHex('#C60')('Orange')))
      .toBe('␛[48;2;204;102;0mOrange␛[m');
  })

  it('Orange Background II', () => {
    expect(cs.a.sgr(cs.bg.hex('#C60')('Orange')))
      .toBe('␛[48;2;204;102;0mOrange␛[m');
  })

  it('Orange Background III', () => {
    expect(cs.a.sgr(cs.bgRgb(204,102,0)('Orange')))
      .toBe('␛[48;2;204;102;0mOrange␛[m');
  })

  it('Orange Background IV', () => {
    expect(cs.a.sgr(cs.bg.rgb(204,102,0)('Orange')))
      .toBe('␛[48;2;204;102;0mOrange␛[m');
  })

  it('Orange Background V', () => {
    expect(cs.a.sgr(cs.bgAnsi256(172)('Orange')))
      .toBe('␛[48;5;172mOrange␛[m');
  })

  it('Orange Background VI', () => {
    expect(cs.a.sgr(cs.bg.ansi256(172)('Orange')))
      .toBe('␛[48;5;172mOrange␛[m');
  })

})
