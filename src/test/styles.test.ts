import { ConsoleStyler } from '../console-styler'

const CTRL_NAMES : { [key: string]: string }= {
  '\r': '\\r', 
  '\n': '\\n', 
  '\x1B': '␛', 
}

describe('Formating with cs.s ...', () => {

  let cs: ConsoleStyler;

  it('new ConsoleStyler', () => {
    cs=new ConsoleStyler({ ctrlName: CTRL_NAMES });
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
    expect(cs.s.sgr(cs.s.underline('Die '+cs.s.red('Red')+' Farbe')))
      .toBe('␛[4mDie ␛[31mRed␛[39m Farbe␛[0m');
  })

  it('Red Text Partly Underlined', () => {
    expect(cs.s.sgr(cs.s.red('Die '+cs.s.underline('Red')+' Farbe')))
      .toBe('␛[31mDie ␛[4mRed␛[24m Farbe␛[0m');
  })

  it('Red Text Partly Bold', () => {
    expect(cs.s.sgr(cs.s.red('Die '+cs.s.bold('Red')+' Farbe')))
      .toBe('␛[31mDie ␛[1mRed␛[22m Farbe␛[0m');
  })

})
