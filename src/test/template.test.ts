import { ConsoleStyler } from '../console-styler';

const ESCAPE = { '\x1B': '␛' };

describe('Formating with cs.f`...`', () => {

  let cs: ConsoleStyler;

  it('new ConsoleStyler', () => {
    cs=new ConsoleStyler({ ctrlName: ESCAPE });
    expect(cs.level).toBe(3);
    expect(cs('None')).toBe('None');
  });

  it('Red Text', () => {
    expect(cs.sgr(cs.f`{{red|Red}}`))
      .toBe('␛[31mRed␛[m');
  });
  
  it('Orange Text I', () => {
    expect(cs.sgr(cs.f`{{#CC6600|Orange}}`))
      .toBe('␛[38;2;204;102;0mOrange␛[m');
  });
  
  it('Orange Text II', () => {
    expect(cs.sgr(cs.f`{{#C60|Orange}}`))
      .toBe('␛[38;2;204;102;0mOrange␛[m');
  });
  
  it('Orange Text III', () => {
    expect(cs.sgr(cs.f`{{hex(C60)|Orange}}`))
      .toBe('␛[38;2;204;102;0mOrange␛[m');
  });
  
  it('Orange Text IV', () => {
    expect(cs.sgr(cs.f`{{rgb(204,102,0)|Orange}}`))
      .toBe('␛[38;2;204;102;0mOrange␛[m');
  });
  
  it('Red Text underlined I', () => {
    expect(cs.sgr(cs.f`{{underline.red|Rot}}`))
      .toBe('␛[4;31mRot␛[m');
  });

  it('Red Text underlined II', () => {
    expect(cs.sgr(cs.f`{{red.underline|Red}}`))
      .toBe('␛[4;31mRed␛[m');
  });

  it('Partly Red Text underlined', () => {
    expect(cs.sgr(cs.f`{{underline|The {{red|Red}} Text}}`))
      .toBe('␛[4mThe ␛[31mRed␛[39m Text␛[m');
  });

  it('Red Text partly underlined', () => {
    expect(cs.sgr(cs.f`{{red|The {{underline|Red}} Text}}`))
      .toBe('␛[31mThe ␛[4mRed␛[24m Text␛[m');
  });

  it('Red Text partly bold', () => {
    expect(cs.sgr(cs.f`{{red|The {{bold|Red}} Text}}`))
      .toBe('␛[31mThe ␛[1mRed␛[22m Text␛[m');
  });

  it('Multiple Nesting I', () => {
    expect(cs.sgr(cs.f`{{underline|The {{red|R{{bold|e}}d}} Text}}`))
      .toBe('␛[4mThe ␛[31mR␛[1me␛[22md␛[39m Text␛[m');
  });

  it('Multiple Nesting II', () => {
    expect(cs.sgr(cs.f`Text: {{underline|The {{red|R{{bold|e}}d}} Text}}`))
      .toBe('Text: ␛[4mThe ␛[31mR␛[1me␛[22md␛[39m Text␛[m');
  });

  it('Multiple Nesting III', () => {
    expect(cs.sgr(cs.f`Text: "{{underline|The {{red|R{{bold|e}}d}} Text}}"`))
      .toBe('Text: "␛[4mThe ␛[31mR␛[1me␛[22md␛[39m Text␛[m"');
  });

  it('Multiple Nesting IV', () => {
    expect(cs.sgr(cs.f`{{blue|Text: "{{underline|The {{red|R{{bold|e}}d}} Text}}"}}`))
      .toBe('␛[34mText: "␛[4mThe ␛[31mR␛[1me␛[22md␛[34m Text␛[24m"␛[m');
  });

  it('Arguments I', () => {
    const x = 1;
    const y = 2;
    expect(cs.sgr(cs.f`x={{blue|${x}}} y={{red|${y}}}`))
      .toBe('x=␛[34m1␛[m y=␛[31m2␛[m');
  });

  it('Argument with Format I', () => {
    const x = '{{red|1}}';
    expect(cs.sgr(cs.f`x={{blue|${x}}}`))
      .toBe('x=␛[34m{{red|1}}␛[m');
  });

  it('Argument with Format II', () => {
    const x = '{{red|1}}';
    expect(cs.sgr(cs.f(`x={{blue|${x}}}`)))
      .toBe('x=␛[31m1␛[m');
  });
});

