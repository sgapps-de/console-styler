import { ConsoleStyler } from '../console-styler'

const CTRL_NAMES : { [key: string]: string } = {
  '\r': '\\r', 
  '\n': '\\n', 
  '\x1B': '␛', 
}

const theme = {

    styles: {
        err: 'red',
        warn: '#CC6600',
        msg: 'underline',
    },

    var: 'CONSOLE_THEME',

};

const testEnv = {
    'CONSOLE_THEME': 'msg=green',
}

describe('Formating with a Theme', () => {

  let cs: ConsoleStyler;

  it('new ConsoleStyler', () => {
    cs=new ConsoleStyler({ term: 'test',  ctrlName: CTRL_NAMES, theme });
    expect(cs instanceof ConsoleStyler).toBe(true);
    expect(cs.a.sgr(cs.a.none('None'))).toBe('None');
  })

  it('Error I', () => {
    expect(cs.sgr(cs.a.err('ERROR')))
      .toBe('␛[31mERROR␛[m');
  })
  
  it('Error II', () => {
    expect(cs.sgr(cs.f('{{err|ERROR}}')))
      .toBe('␛[31mERROR␛[m');
  })
  
  it('Warning I', () => {
    expect(cs.sgr(cs.a.warn('Warning')))
      .toBe('␛[38;2;204;102;0mWarning␛[m');
  })
  
  it('Warning II', () => {
    expect(cs.sgr(cs.f('{{warn|Warning}}')))
      .toBe('␛[38;2;204;102;0mWarning␛[m');
  })
  
  it('Message', () => {
    expect(cs.sgr(cs.a.msg('Message')))
      .toBe('␛[4mMessage␛[m');
  })
  
})

describe('Formating with a Theme - Environment Overwrite', () => {

  let cs: ConsoleStyler;

  it('new ConsoleStyler', () => {
    cs=new ConsoleStyler({ term: 'test',  ctrlName: CTRL_NAMES, theme, env: testEnv });
    expect(cs instanceof ConsoleStyler).toBe(true);
    expect(cs.a.sgr(cs.a.none('None'))).toBe('None');
  })

  it('Message', () => {
    expect(cs.sgr(cs.a.msg('Message')))
      .toBe('␛[32mMessage␛[m');
  })
  
})
