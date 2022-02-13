import { ConsoleStyler } from '../console-styler';
import { Modifier } from '../state';

const CTRL_NAMES : { [key: string]: string }= {
  '\r': '\\r', 
  '\n': '\\n', 
  '\x1B': '␛', 
};

describe('Formating with all Modifiers ...', () => {

  let cs: ConsoleStyler;

  it('new ConsoleStyler', () => {
    cs=new ConsoleStyler({ term: 'test', modifier: Modifier.STANDARD, ctrlName: CTRL_NAMES });
    expect(cs instanceof ConsoleStyler).toBe(true);
    expect(cs.sgr(cs.none('None'))).toBe('None');
  });

  it('Blue with Bold Part', () => {
    expect(cs.sgr(cs.blue('Foo '+cs.bold('Bar')+' Baz')))
      .toBe('␛[34mFoo ␛[1mBar␛[22m Baz␛[m');
  });

  it('Blue with Dim Part', () => {
    expect(cs.sgr(cs.blue('Foo '+cs.dim('Bar')+' Baz')))
      .toBe('␛[34mFoo ␛[2mBar␛[22m Baz␛[m');
  });

  it('Blue with Italic Part', () => {
    expect(cs.sgr(cs.blue('Foo '+cs.italic('Bar')+' Baz')))
      .toBe('␛[34mFoo ␛[3mBar␛[23m Baz␛[m');
  });

  it('Blue with Underlined Part', () => {
    expect(cs.sgr(cs.blue('Foo '+cs.underline('Bar')+' Baz')))
      .toBe('␛[34mFoo ␛[4mBar␛[24m Baz␛[m');
  });

  it('Blue with Double Underlined Part', () => {
    expect(cs.sgr(cs.blue('Foo '+cs.doubleUnderline('Bar')+' Baz')))
      .toBe('␛[34mFoo ␛[21mBar␛[24m Baz␛[m');
  });

  it('Underline -> Double Underline', () => {
    expect(cs.sgr(cs.none(cs.underline('Foo ')+cs.doubleUnderline('Bar'))))
      .toBe('␛[4mFoo ␛[21mBar␛[m');
  });

  it('Double Underline -> Underline', () => {
    expect(cs.sgr(cs.none(cs.doubleUnderline('Foo ')+cs.underline('Bar'))))
      .toBe('␛[21mFoo ␛[24;4mBar␛[m');
  });

  it('Blue with Underline -> Double Underline Part', () => {
    expect(cs.sgr(cs.blue('Baz '+cs.underline('Foo ')+cs.doubleUnderline('Bar')+' Baz')))
      .toBe('␛[34mBaz ␛[4mFoo ␛[21mBar␛[24m Baz␛[m');
  });

  it('Blue with Double Underline -> Underline Part', () => {
    expect(cs.sgr(cs.blue('Baz '+cs.doubleUnderline('Foo ')+cs.underline('Bar')+' Baz')))
      .toBe('␛[34mBaz ␛[21mFoo ␛[24;4mBar␛[24m Baz␛[m');
  });

  it('Blue with Slow Blinking Part', () => {
    expect(cs.sgr(cs.blue('Foo '+cs.blink('Bar')+' Baz')))
      .toBe('␛[34mFoo ␛[5mBar␛[25m Baz␛[m');
  });

  it('Blue with Inverse Part', () => {
    expect(cs.sgr(cs.blue('Foo '+cs.inverse('Bar')+' Baz')))
      .toBe('␛[34mFoo ␛[7mBar␛[27m Baz␛[m');
  });

  it('Blue with Hidden Part', () => {
    expect(cs.sgr(cs.blue('Foo '+cs.hidden('Bar')+' Baz')))
      .toBe('␛[34mFoo ␛[8mBar␛[28m Baz␛[m');
  });

  it('Blue with Strikethrough Part', () => {
    expect(cs.sgr(cs.blue('Foo '+cs.strikethrough('Bar')+' Baz')))
      .toBe('␛[34mFoo ␛[9mBar␛[29m Baz␛[m');
  });

  it('Blue with Overline Part', () => {
    expect(cs.sgr(cs.blue('Foo '+cs.overline('Bar')+' Baz')))
      .toBe('␛[34mFoo ␛[53mBar␛[55m Baz␛[m');
  });
});
  
describe('Formating without Double Underline ...', () => {

    let cs: ConsoleStyler;
  
    it('new ConsoleStyler', () => {
      cs=new ConsoleStyler({ term: 'test', modifier: (Modifier.STANDARD & ~Modifier.DOUBLE_UNDERLINE), ctrlName: CTRL_NAMES });
      expect(cs instanceof ConsoleStyler).toBe(true);
      expect(cs.sgr(cs.none('None'))).toBe('None');
    });
  
    it('Blue with Double Underlined Part', () => {
        expect(cs.sgr(cs.blue('Foo '+cs.doubleUnderline('Bar')+' Baz')))
          .toBe('␛[34mFoo ␛[4mBar␛[24m Baz␛[m');
    });

    it('Underline -> Double Underline', () => {
        expect(cs.sgr(cs.none(cs.underline('Foo ')+cs.doubleUnderline('Bar'))))
            .toBe('␛[4mFoo Bar␛[m');
    });

    it('Double Underline -> Underline', () => {
        expect(cs.sgr(cs.none(cs.doubleUnderline('Foo ')+cs.underline('Bar'))))
            .toBe('␛[4mFoo Bar␛[m');
    });

    it('Blue with Underline -> Double Underline Part', () => {
        expect(cs.sgr(cs.blue('Baz '+cs.underline('Foo ')+cs.doubleUnderline('Bar')+' Baz')))
            .toBe('␛[34mBaz ␛[4mFoo Bar␛[24m Baz␛[m');
    });

    it('Blue with Double Underline -> Underline Part', () => {
        expect(cs.sgr(cs.blue('Baz '+cs.doubleUnderline('Foo ')+cs.underline('Bar')+' Baz')))
            .toBe('␛[34mBaz ␛[4mFoo Bar␛[24m Baz␛[m');
    });
});

describe('Formating with "not" ...', () => {

    let cs: ConsoleStyler;
  
    it('new ConsoleStyler', () => {
      cs=new ConsoleStyler({ term: 'test', modifier: Modifier.STANDARD, ctrlName: CTRL_NAMES });
      expect(cs instanceof ConsoleStyler).toBe(true);
      expect(cs.sgr(cs.none('None'))).toBe('None');
    });
  
    it('Not Underlined', () => {
        expect(cs.sgr(cs.not.underline('Foo')))
            .toBe('␛[204mFoo␛[m');
    });

    it('Not Underlined Final', () => {
        expect(cs.sgr(cs.not.underline.final('Foo')))
            .toBe('Foo');
    });

    it('Not Underlined Part', () => {
        expect(cs.sgr(cs.underline('Foo '+cs.not.underline('Bar')+' Baz')))
            .toBe('␛[4mFoo ␛[24mBar␛[4m Baz␛[m');
    });

    it('Not Underlined (cs.fx)', () => {
        expect(cs.sgr(cs.fx('{{not.underline|Foo}}')))
            .toBe('␛[204mFoo␛[m');
    });

    it('Not Underlined (cs.f)', () => {
        expect(cs.sgr(cs.f('{{not.underline|Foo}}')))
            .toBe('Foo');
    });
});