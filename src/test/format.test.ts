import { ConsoleStyler } from '../console-styler'

const CTRL_NAMES : { [key: string]: string }= {
  '\r': '\\r', 
  '\n': '\\n', 
  '\x1B': '␛', 
}

describe('Formating with cs.f ...', () => {

  let cs: ConsoleStyler;

  it('new ConsoleStyler', () => {
    cs=new ConsoleStyler({ ctrlName: CTRL_NAMES });
    expect(cs instanceof ConsoleStyler).toBe(true);
    expect(cs.s.sgr(cs.s.none('None'))).toBe('None');
  })

  it('Red Text', () => {
    expect(cs.s.sgr(cs.f('{{red|Red}}')))
      .toBe('␛[31mRed␛[0m');
  })
  
  it('Orange Text I', () => {
    expect(cs.s.sgr(cs.f('{{#CC6600|Orange}}')))
      .toBe('␛[38;2;204;102;0mOrange␛[0m');
  })
  
  it('Orange Text II', () => {
    expect(cs.s.sgr(cs.f('{{#C60|Orange}}')))
      .toBe('␛[38;2;204;102;0mOrange␛[0m');
  })
  
  it('Red Text underlined I', () => {
    expect(cs.s.sgr(cs.f('{{underline.red|Rot}}')))
      .toBe('␛[4;31mRot␛[0m');
  })

  it('Red Text underlined II', () => {
    expect(cs.s.sgr(cs.f('{{red.underline|Red}}')))
      .toBe('␛[4;31mRed␛[0m');
  })

  it('Partly Red Text underlined', () => {
    expect(cs.s.sgr(cs.f('{{underline|The {{red|Red}} Text}}')))
      .toBe('␛[4mThe ␛[31mRed␛[39m Text␛[0m');
  })

  it('Red Text partly underlined', () => {
    expect(cs.s.sgr(cs.f('{{red|The {{underline|Red}} Text}}')))
      .toBe('␛[31mThe ␛[4mRed␛[24m Text␛[0m');
  })

  it('Red Text partly bold', () => {
    expect(cs.s.sgr(cs.f('{{red|The {{bold|Red}} Text}}')))
      .toBe('␛[31mThe ␛[1mRed␛[22m Text␛[0m');
  })

  it('Multiple Nesting I', () => {
    expect(cs.s.sgr(cs.f('{{underline|The {{red|R{{bold|e}}d}} Text}}')))
      .toBe('␛[4mThe ␛[31mR␛[1me␛[22md␛[39m Text␛[0m');
  })

  it('Multiple Nesting II', () => {
    expect(cs.s.sgr(cs.f('Text: {{underline|The {{red|R{{bold|e}}d}} Text}}')))
      .toBe('Text: ␛[4mThe ␛[31mR␛[1me␛[22md␛[39m Text␛[0m');
  })

  it('Multiple Nesting III', () => {
    expect(cs.s.sgr(cs.f('Text: "{{underline|The {{red|R{{bold|e}}d}} Text}}"')))
      .toBe('Text: "␛[4mThe ␛[31mR␛[1me␛[22md␛[39m Text␛[0m"');
  })

  it('Multiple Nesting IV', () => {
    expect(cs.s.sgr(cs.f('{{blue|Text: "{{underline|The {{red|R{{bold|e}}d}} Text}}"}}')))
      .toBe('␛[34mText: "␛[4mThe ␛[31mR␛[1me␛[22md␛[34m Text␛[24m"␛[0m');
  })

})
