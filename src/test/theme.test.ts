import { ConsoleStyler } from '../console-styler';

const ESCAPE = { '\x1B': '␛' };

const theme = {

    styles: {
        err: 'red',
        warn: '#CC6600',
        msg: 'underline',
    },

    var: 'CONSOLE_THEME',

};

const TEST_ENV = {
    'CONSOLE_THEME': 'msg=green',
    'TERM': 'test'
};

describe('Formating with alias', () => {

  let cs: ConsoleStyler;

  it('new ConsoleStyler', () => {
    cs=new ConsoleStyler({ ctrlName: ESCAPE });
    expect(cs('None')).toBe('None');
    cs.alias('orange','#CC6600');
    cs.err=cs.red.underline;
  });

  it('Orange Text', () => {
    expect(cs.sgr(cs.orange('Orange')))
      .toBe('␛[38;2;204;102;0mOrange␛[m');
  });
  
  it('Error', () => {
    expect(cs.sgr(cs.err('ERROR')))
      .toBe('␛[4;31mERROR␛[m');
  });
})

describe('Formating with a Theme', () => {

  let cs: ConsoleStyler;

  it('new ConsoleStyler', () => {
    cs=new ConsoleStyler({ ctrlName: ESCAPE, theme });
    expect(cs('None')).toBe('None');
  });

  it('Error I', () => {
    expect(cs.sgr(cs.err('ERROR')))
      .toBe('␛[31mERROR␛[m');
  });
  
  it('Error II', () => {
    expect(cs.sgr(cs.f('{{err|ERROR}}')))
      .toBe('␛[31mERROR␛[m');
  });
  
  it('Warning I', () => {
    expect(cs.sgr(cs.warn('Warning')))
      .toBe('␛[38;2;204;102;0mWarning␛[m');
  });
  
  it('Warning II', () => {
    expect(cs.sgr(cs.f('{{warn|Warning}}')))
      .toBe('␛[38;2;204;102;0mWarning␛[m');
  });
  
  it('Message I', () => {
    expect(cs.sgr(cs.msg('Message')))
      .toBe('␛[4mMessage␛[m');
  });
  
  it('Message II', () => {
    expect(cs.sgr(cs.f('{{msg|Message}}')))
      .toBe('␛[4mMessage␛[m');
  });
});

describe('Formating with a Theme - Environment Overwrite', () => {

  let cs: ConsoleStyler;

  it('new ConsoleStyler', () => {
    cs=new ConsoleStyler({ ctrlName: ESCAPE, theme, env: TEST_ENV });
    expect(cs('None')).toBe('None');
  });

  it('Message', () => {
    expect(cs.sgr(cs.msg('Message')))
      .toBe('␛[32mMessage␛[m');
  });
  
  it('Message II', () => {
    expect(cs.sgr(cs.f('{{msg|Message}}')))
      .toBe('␛[32mMessage␛[m');
  });
});
