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

const CTRL_NAMES : { [key: string]: string }= {
    '\r': '\\r', 
    '\n': '\\n', 
}

function ctrlName(s: string) {

    let r = CTRL_NAMES[s] ?? '';

    if (r) return r;

    const c = s.charCodeAt(0);

    if (c<16)
        return '\\x0'+c.toString(16);
    else if (c<256)
        return '\\x'+c.toString(16);
    else if (c<4096)
        return '\\u0'+c.toString(16);
    else
        return '\\u'+c.toString(16);
}

function replaceCtrlChars(s: string): string {

    let r = '';

    for (;;) {
        const m: RegExpExecArray | null = /^([^\x00-\x1F\x7F]*)([\x00-\x1F\x7F])(.*)$/ms.exec(s);
        if (!m) break;
        r=r+m[1]+ctrlName(m[2]);
        s=m[3];
    }

    return r+s;
}

describe('Formatierung von "\\n" mit cs.s ...', () => {

    let cs: ConsoleStyler;

    it('new ConsoleStyler', () => {
        cs = new ConsoleStyler({});
        expect(cs instanceof ConsoleStyler).toBe(true);
        expect(cs.showEscape(cs.s.none('Rot'))).toBe('Rot');
    })
    it('Roter Text', () => {
        expect(replaceCtrlChars(cs.showEscape(cs.s.red('Roter Text'))))
            .toBe('␛[31mRoter Text␛[0m');
    })

    it('Roter Text mit NewLine', () => {
        expect(replaceCtrlChars(cs.showEscape(cs.s.red('Roter\nText'))))
            .toBe('␛[31mRoter␛[0m\\n␛[31mText␛[0m');
    })

    it('Rotes NewLine', () => {
        expect(replaceCtrlChars(cs.showEscape(cs.s.red('\n'))))
            .toBe('\\n');
    })

    it('Rotes NewLine am Ende', () => {
        expect(replaceCtrlChars(cs.showEscape(cs.s.red('Rot\n'))))
            .toBe('␛[31mRot␛[0m\\n');
    })

    it('Rotes NewLine am Anfang', () => {
        expect(replaceCtrlChars(cs.showEscape(cs.s.red('\nRot'))))
            .toBe('\\n␛[31mRot␛[0m');
    })

    it('Rotes NewLine nach blauem Text', () => {
        expect(replaceCtrlChars(cs.showEscape(cs.f('{{blue|Blau}}{{red|\nRot}}'))))
            .toBe('␛[34mBlau␛[0m\\n␛[31mRot␛[0m');
    })

    it('Rotes NewLine in blauem Text', () => {
        expect(replaceCtrlChars(cs.showEscape(cs.f('{{blue|Blau{{red|\nRot}} wieder blau}}'))))
            .toBe('␛[34mBlau␛[0m\\n␛[31mRot␛[34m wieder blau␛[0m');
    })

    it('Rotes NewLine in blauem Text mit Unterstreichung I', () => {
        expect(replaceCtrlChars(cs.showEscape(cs.f('{{ul.blue|Blau{{red|Rot\n}} wieder blau}}'))))
            .toBe('␛[4;34mBlau␛[31mRot␛[0m\\n␛[4;34m wieder blau␛[0m');
    })

    it('Rotes NewLine in blauem Text mit Unterstreichung I', () => {
        expect(replaceCtrlChars(cs.showEscape(cs.f('{{ul.blue|Blau{{red|Rot\nRot}} wieder blau}}'))))
            .toBe('␛[4;34mBlau␛[31mRot␛[0m\\n␛[4;31mRot␛[34m wieder blau␛[0m');
    })


})