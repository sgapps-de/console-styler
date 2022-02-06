import { ConsoleStyler } from '../console-styler'

const CTRL_NAMES : { [key: string]: string }= {
  '\r': '\\r', 
  '\n': '\\n', 
  '\x1B': '␛', 
}

describe('Chalk Style Formating ...', () => {

  let chalk: ConsoleStyler;

  it('new ConsoleStyler', () => {
    chalk=new ConsoleStyler({ term: 'test', ctrlName: CTRL_NAMES });
    expect(chalk instanceof ConsoleStyler).toBe(true);
    expect(chalk.sgr(chalk.none('None'))).toBe('None');
  })

  it('Red Text', () => {
    expect(chalk.sgr(chalk.red('Red')))
      .toBe('␛[31mRed␛[0m');
  })
  
  it('Orange Text I', () => {
    expect(chalk.sgr(chalk.s['#CC6600']('Orange')))
      .toBe('␛[38;2;204;102;0mOrange␛[0m');
  })
  
  it('Oranger Text II', () => {
    expect(chalk.sgr(chalk.s['#C60']('Orange')))
      .toBe('␛[38;2;204;102;0mOrange␛[0m');
  })
  
  it('Red Text Underlined I', () => {
    expect(chalk.sgr(chalk.underline.red('Red')))
      .toBe('␛[4;31mRed␛[0m');
  })

  it('Red Text Underlined II', () => {
    expect(chalk.sgr(chalk.red.underline('Red')))
      .toBe('␛[4;31mRed␛[0m');
  })

  it('Underlined Text Partly Red', () => {
    expect(chalk.sgr(chalk.underline('Die '+chalk.red('Red')+' Farbe')))
      .toBe('␛[4mDie ␛[31mRed␛[39m Farbe␛[0m');
  })

  it('Red Text Partly Underlined', () => {
    expect(chalk.sgr(chalk.red('Die '+chalk.underline('Red')+' Farbe')))
      .toBe('␛[31mDie ␛[4mRed␛[24m Farbe␛[0m');
  })

  it('Red Text Partly Bold', () => {
    expect(chalk.sgr(chalk.red('Die '+chalk.bold('Red')+' Farbe')))
      .toBe('␛[31mDie ␛[1mRed␛[22m Farbe␛[0m');
  })
  it('Green Background', () => {
    expect(chalk.sgr(chalk.bgGreen('Green')))
      .toBe('␛[42mGreen␛[0m');
  })

})
