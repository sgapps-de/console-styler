import { ConsoleStyler, ConsoleStyle } from './console-styler'

describe('Formatierung mit cs.s ...', () => {

  let cs: ConsoleStyler;

  it('new ConsoleStyler', () => {
    cs=new ConsoleStyler({});
    expect(cs instanceof ConsoleStyler).toBe(true);
    expect(cs.showEscape(cs.s.none('Rot'))).toBe('Rot');
  })

  it('Roter Text', () => {
    expect(cs.showEscape(cs.s.red('Rot')))
      .toBe('␛[31mRot␛[0m');
  })
  
  it('Oranger Text I', () => {
    expect(cs.showEscape(cs.s['#CC6600']('Rot')))
      .toBe('␛[38;2;204;102;0mRot␛[0m');
  })
  
  it('Oranger Text II', () => {
    expect(cs.showEscape(cs.s['#C60']('Rot')))
      .toBe('␛[38;2;204;102;0mRot␛[0m');
  })
  
  it('Roter Text unterstrichen I', () => {
    expect(cs.showEscape(cs.s.underline.red('Rot')))
      .toBe('␛[4;31mRot␛[0m');
  })

  it('Roter Text unterstrichen II', () => {
    expect(cs.showEscape(cs.s.red.underline('Rot')))
      .toBe('␛[4;31mRot␛[0m');
  })

  it('Teilweise roter Text unterstrichen', () => {
    expect(cs.showEscape(cs.s.underline('Die '+cs.s.red('rote')+' Farbe')))
      .toBe('␛[4mDie ␛[31mrote␛[39m Farbe␛[0m');
  })

  it('Roter Text teilweise unterstrichen', () => {
    expect(cs.showEscape(cs.s.red('Die '+cs.s.underline('rote')+' Farbe')))
      .toBe('␛[31mDie ␛[4mrote␛[24m Farbe␛[0m');
  })

  it('Roter Text teilweise hell', () => {
    expect(cs.showEscape(cs.s.red('Die '+cs.s.bold('rote')+' Farbe')))
      .toBe('␛[31mDie ␛[1mrote␛[22m Farbe␛[0m');
  })

})

describe('Formatierung mit cs.f ...', () => {

  let cs: ConsoleStyler;

  it('new ConsoleStyler', () => {
    cs=new ConsoleStyler({});
    expect(cs instanceof ConsoleStyler).toBe(true);
    expect(cs.showEscape(cs.s.none('Rot'))).toBe('Rot');
  })

  it('Roter Text', () => {
    expect(cs.showEscape(cs.f('{{red|Rot}}')))
      .toBe('␛[31mRot␛[0m');
  })
  
  it('Oranger Text I', () => {
    expect(cs.showEscape(cs.f('{{#CC6600|Rot}}')))
      .toBe('␛[38;2;204;102;0mRot␛[0m');
  })
  
  it('Oranger Text II', () => {
    expect(cs.showEscape(cs.f('{{#C60|Rot}}')))
      .toBe('␛[38;2;204;102;0mRot␛[0m');
  })
  
  it('Roter Text unterstrichen I', () => {
    expect(cs.showEscape(cs.f('{{underline.red|Rot}}')))
      .toBe('␛[4;31mRot␛[0m');
  })

  it('Roter Text unterstrichen II', () => {
    expect(cs.showEscape(cs.f('{{red.underline|Rot}}')))
      .toBe('␛[4;31mRot␛[0m');
  })

  it('Teilweise roter Text unterstrichen', () => {
    expect(cs.showEscape(cs.f('{{underline|Die {{red|rote}} Farbe}}')))
      .toBe('␛[4mDie ␛[31mrote␛[39m Farbe␛[0m');
  })

  it('Roter Text teilweise unterstrichen', () => {
    expect(cs.showEscape(cs.f('{{red|Die {{underline|rote}} Farbe}}')))
      .toBe('␛[31mDie ␛[4mrote␛[24m Farbe␛[0m');
  })

  it('Roter Text teilweise hell', () => {
    expect(cs.showEscape(cs.f('{{red|Die {{bold|rote}} Farbe}}')))
      .toBe('␛[31mDie ␛[1mrote␛[22m Farbe␛[0m');
  })

  it('Mehrfache Verschachtelung I', () => {
    expect(cs.showEscape(cs.f('{{underline|Die {{red|ro{{bold|t}}e}} Farbe}}')))
      .toBe('␛[4mDie ␛[31mro␛[1mt␛[22me␛[39m Farbe␛[0m');
  })

  it('Mehrfache Verschachtelung II', () => {
    expect(cs.showEscape(cs.f('Text: {{underline|Die {{red|ro{{bold|t}}e}} Farbe}}')))
      .toBe('Text: ␛[4mDie ␛[31mro␛[1mt␛[22me␛[39m Farbe␛[0m');
  })

  it('Mehrfache Verschachtelung III', () => {
    expect(cs.showEscape(cs.f('Text: "{{underline|Die {{red|ro{{bold|t}}e}} Farbe}}"')))
      .toBe('Text: "␛[4mDie ␛[31mro␛[1mt␛[22me␛[39m Farbe␛[0m"');
  })

  it('Mehrfache Verschachtelung IV', () => {
    expect(cs.showEscape(cs.f('{{blue|Text: "{{underline|Die {{red|ro{{bold|t}}e}} Farbe}}"}}')))
      .toBe('␛[34mText: "␛[4mDie ␛[31mro␛[1mt␛[22me␛[34m Farbe␛[24m"␛[0m');
  })

})
