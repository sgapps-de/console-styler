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
    expect(cs.s.sgr(cs.s.none('None'))).toBe('None');
  })

  it('Red Text', () => {
    expect(cs.s.sgr(cs.s.red('Red')))
      .toBe('␛[31mRed␛[0m');
  })
  
  it('Orange Text I', () => {
    expect(cs.s.sgr(cs.s['#CC6600']('Orange')))
      .toBe('␛[38;2;204;102;0mOrange␛[0m');
  })
  
  it('Oranger Text II', () => {
    expect(cs.s.sgr(cs.s['#C60']('Orange')))
      .toBe('␛[38;2;204;102;0mOrange␛[0m');
  })
  
  it('Red Text Underlined I', () => {
    expect(cs.s.sgr(cs.s.underline.red('Red')))
      .toBe('␛[4;31mRed␛[0m');
  })

  it('Red Text Underlined II', () => {
    expect(cs.s.sgr(cs.s.red.underline('Red')))
      .toBe('␛[4;31mRed␛[0m');
  })

  it('Underlined Text Partly Red', () => {
    expect(cs.s.sgr(cs.s.underline('The '+cs.s.red('Red')+' Color')))
      .toBe('␛[4mThe ␛[31mRed␛[39m Color␛[0m');
  })

  it('Red Text Partly Underlined', () => {
    expect(cs.s.sgr(cs.s.red('The '+cs.s.underline('Red')+' Color')))
      .toBe('␛[31mThe ␛[4mRed␛[24m Color␛[0m');
  })

  it('Red Text Partly Bold', () => {
    expect(cs.s.sgr(cs.s.red('The '+cs.s.bold('Red')+' Color')))
      .toBe('␛[31mThe ␛[1mRed␛[22m Color␛[0m');
  })

  it('Bright Black I', () => {
    expect(cs.s.sgr(cs.s.bright.black('Bright Black')))
      .toBe('␛[90mBright Black␛[0m');
  })
  
  it('Bright Black II', () => {
    expect(cs.s.sgr(cs.s.blackBright('Bright Black')))
      .toBe('␛[90mBright Black␛[0m');
  })
  
  it('Dark White', () => {
    expect(cs.s.sgr(cs.s.dark.white('Dark White')))
      .toBe('␛[37mDark White␛[0m');
  })
  
  it('Green Background I', () => {
    expect(cs.s.sgr(cs.s.bgGreen('Green')))
      .toBe('␛[42mGreen␛[0m');
  })

  it('Green Background II', () => {
    expect(cs.s.sgr(cs.s.bg.green('Green')))
      .toBe('␛[42mGreen␛[0m');
  })

  it('Green Background III', () => {
    expect(cs.s.sgr(cs.s['bg.green']('Green')))
      .toBe('␛[42mGreen␛[0m');
  })

})
