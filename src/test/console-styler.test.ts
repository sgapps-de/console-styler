import { ConsoleStyler, ConsoleStyle } from '../console-styler'

const CTRL_NAMES : { [key: string]: string }= {
  '\r': '\\r', 
  '\n': '\\n', 
  '\x1B': '␛', 
}

describe('Formatierung mit cs.s ...', () => {

  let cs: ConsoleStyler;

  it('new ConsoleStyler', () => {
    cs=new ConsoleStyler({ ctrlName: CTRL_NAMES });
    expect(cs instanceof ConsoleStyler).toBe(true);
    expect(cs.s.sgr(cs.s.none('Rot'))).toBe('Rot');
  })

  it('Roter Text', () => {
    expect(cs.s.sgr(cs.s.red('Rot')))
      .toBe('␛[31mRot␛[0m');
  })
  
  it('Oranger Text I', () => {
    expect(cs.s.sgr(cs.s['#CC6600']('Rot')))
      .toBe('␛[38;2;204;102;0mRot␛[0m');
  })
  
  it('Oranger Text II', () => {
    expect(cs.s.sgr(cs.s['#C60']('Rot')))
      .toBe('␛[38;2;204;102;0mRot␛[0m');
  })
  
  it('Roter Text unterstrichen I', () => {
    expect(cs.s.sgr(cs.s.underline.red('Rot')))
      .toBe('␛[4;31mRot␛[0m');
  })

  it('Roter Text unterstrichen II', () => {
    expect(cs.s.sgr(cs.s.red.underline('Rot')))
      .toBe('␛[4;31mRot␛[0m');
  })

  it('Teilweise roter Text unterstrichen', () => {
    expect(cs.s.sgr(cs.s.underline('Die '+cs.s.red('rote')+' Farbe')))
      .toBe('␛[4mDie ␛[31mrote␛[39m Farbe␛[0m');
  })

  it('Roter Text teilweise unterstrichen', () => {
    expect(cs.s.sgr(cs.s.red('Die '+cs.s.underline('rote')+' Farbe')))
      .toBe('␛[31mDie ␛[4mrote␛[24m Farbe␛[0m');
  })

  it('Roter Text teilweise hell', () => {
    expect(cs.s.sgr(cs.s.red('Die '+cs.s.bold('rote')+' Farbe')))
      .toBe('␛[31mDie ␛[1mrote␛[22m Farbe␛[0m');
  })

})

describe('Formatierung mit cs.f ...', () => {

  let cs: ConsoleStyler;

  it('new ConsoleStyler', () => {
    cs=new ConsoleStyler({ ctrlName: CTRL_NAMES });
    expect(cs instanceof ConsoleStyler).toBe(true);
    expect(cs.s.sgr(cs.s.none('Rot'))).toBe('Rot');
  })

  it('Roter Text', () => {
    expect(cs.s.sgr(cs.f('{{red|Rot}}')))
      .toBe('␛[31mRot␛[0m');
  })
  
  it('Oranger Text I', () => {
    expect(cs.s.sgr(cs.f('{{#CC6600|Rot}}')))
      .toBe('␛[38;2;204;102;0mRot␛[0m');
  })
  
  it('Oranger Text II', () => {
    expect(cs.s.sgr(cs.f('{{#C60|Rot}}')))
      .toBe('␛[38;2;204;102;0mRot␛[0m');
  })
  
  it('Roter Text unterstrichen I', () => {
    expect(cs.s.sgr(cs.f('{{underline.red|Rot}}')))
      .toBe('␛[4;31mRot␛[0m');
  })

  it('Roter Text unterstrichen II', () => {
    expect(cs.s.sgr(cs.f('{{red.underline|Rot}}')))
      .toBe('␛[4;31mRot␛[0m');
  })

  it('Teilweise roter Text unterstrichen', () => {
    expect(cs.s.sgr(cs.f('{{underline|Die {{red|rote}} Farbe}}')))
      .toBe('␛[4mDie ␛[31mrote␛[39m Farbe␛[0m');
  })

  it('Roter Text teilweise unterstrichen', () => {
    expect(cs.s.sgr(cs.f('{{red|Die {{underline|rote}} Farbe}}')))
      .toBe('␛[31mDie ␛[4mrote␛[24m Farbe␛[0m');
  })

  it('Roter Text teilweise hell', () => {
    expect(cs.s.sgr(cs.f('{{red|Die {{bold|rote}} Farbe}}')))
      .toBe('␛[31mDie ␛[1mrote␛[22m Farbe␛[0m');
  })

  it('Mehrfache Verschachtelung I', () => {
    expect(cs.s.sgr(cs.f('{{underline|Die {{red|ro{{bold|t}}e}} Farbe}}')))
      .toBe('␛[4mDie ␛[31mro␛[1mt␛[22me␛[39m Farbe␛[0m');
  })

  it('Mehrfache Verschachtelung II', () => {
    expect(cs.s.sgr(cs.f('Text: {{underline|Die {{red|ro{{bold|t}}e}} Farbe}}')))
      .toBe('Text: ␛[4mDie ␛[31mro␛[1mt␛[22me␛[39m Farbe␛[0m');
  })

  it('Mehrfache Verschachtelung III', () => {
    expect(cs.s.sgr(cs.f('Text: "{{underline|Die {{red|ro{{bold|t}}e}} Farbe}}"')))
      .toBe('Text: "␛[4mDie ␛[31mro␛[1mt␛[22me␛[39m Farbe␛[0m"');
  })

  it('Mehrfache Verschachtelung IV', () => {
    expect(cs.s.sgr(cs.f('{{blue|Text: "{{underline|Die {{red|ro{{bold|t}}e}} Farbe}}"}}')))
      .toBe('␛[34mText: "␛[4mDie ␛[31mro␛[1mt␛[22me␛[34m Farbe␛[24m"␛[0m');
  })

})

describe('Formatierung von "\\n" mit cs.s ...', () => {

    let cs: ConsoleStyler;

    it('new ConsoleStyler', () => {
        cs = new ConsoleStyler({ ctrlName: CTRL_NAMES });
        expect(cs instanceof ConsoleStyler).toBe(true);
        expect(cs.s.sgr(cs.s.none('Rot'))).toBe('Rot');
    })
    it('Roter Text', () => {
        expect(cs.s.ctrl(cs.s.sgr(cs.s.red('Roter Text'))))
            .toBe('␛[31mRoter Text␛[0m');
    })

    it('Roter Text mit NewLine', () => {
        expect(cs.s.ctrl(cs.s.sgr(cs.s.red('Roter\nText'))))
            .toBe('␛[31mRoter␛[0m\\n␛[31mText␛[0m');
    })

    it('Rotes NewLine', () => {
        expect(cs.s.ctrl(cs.s.sgr(cs.s.red('\n'))))
            .toBe('\\n');
    })

    it('Rotes NewLine am Ende', () => {
        expect(cs.s.ctrl(cs.s.sgr(cs.s.red('Rot\n'))))
            .toBe('␛[31mRot␛[0m\\n');
    })

    it('Rotes NewLine am Anfang', () => {
        expect(cs.s.ctrl(cs.s.sgr(cs.s.red('\nRot'))))
            .toBe('\\n␛[31mRot␛[0m');
    })

    it('Rotes NewLine nach blauem Text', () => {
        expect(cs.s.ctrl(cs.s.sgr(cs.f('{{blue|Blau}}{{red|\nRot}}'))))
            .toBe('␛[34mBlau␛[0m\\n␛[31mRot␛[0m');
    })

    it('Rotes NewLine in blauem Text', () => {
        expect(cs.s.ctrl(cs.s.sgr(cs.f('{{blue|Blau{{red|\nRot}} wieder blau}}'))))
            .toBe('␛[34mBlau␛[0m\\n␛[31mRot␛[34m wieder blau␛[0m');
    })

    it('Rotes NewLine in blauem Text mit Unterstreichung I', () => {
        expect(cs.s.ctrl(cs.s.sgr(cs.f('{{ul.blue|Blau{{red|Rot\n}} wieder blau}}'))))
            .toBe('␛[4;34mBlau␛[31mRot␛[0m\\n␛[4;34m wieder blau␛[0m');
    })

    it('Rotes NewLine in blauem Text mit Unterstreichung I', () => {
        expect(cs.s.ctrl(cs.s.sgr(cs.f('{{ul.blue|Blau{{red|Rot\nRot}} wieder blau}}'))))
            .toBe('␛[4;34mBlau␛[31mRot␛[0m\\n␛[4;31mRot␛[34m wieder blau␛[0m');
    })


})