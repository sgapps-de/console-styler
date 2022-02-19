import chalk from '../chalk';

describe('Chalk Style Formating ...', () => {

  it('Red Text', () => {
    expect(chalk.sgr(chalk.red('Red')))
      .toBe('\\x1B[31mRed\\x1B[m');
  });
  
  it('Orange Text I', () => {
    expect(chalk.sgr(chalk.hex('#CC6600')('Orange')))
      .toBe('\\x1B[38;2;204;102;0mOrange\\x1B[m');
  });
  
  it('Orange Text II', () => {
    expect(chalk.sgr(chalk.hex('#C60')('Orange')))
      .toBe('\\x1B[38;2;204;102;0mOrange\\x1B[m');
  });
  
  it('Orange Text III', () => {
    expect(chalk.sgr(chalk.rgb(204,102,0)('Orange')))
      .toBe('\\x1B[38;2;204;102;0mOrange\\x1B[m');
  });
  
  it('Red Text Underlined I', () => {
    expect(chalk.sgr(chalk.underline.red('Red')))
      .toBe('\\x1B[4;31mRed\\x1B[m');
  });

  it('Red Text Underlined II', () => {
    expect(chalk.sgr(chalk.red.underline('Red')))
      .toBe('\\x1B[4;31mRed\\x1B[m');
  });

  it('Underlined Text Partly Red', () => {
    expect(chalk.sgr(chalk.underline('Die '+chalk.red('Red')+' Farbe')))
      .toBe('\\x1B[4mDie \\x1B[31mRed\\x1B[39m Farbe\\x1B[m');
  });

  it('Red Text Partly Underlined', () => {
    expect(chalk.sgr(chalk.red('Die '+chalk.underline('Red')+' Farbe')))
      .toBe('\\x1B[31mDie \\x1B[4mRed\\x1B[24m Farbe\\x1B[m');
  });

  it('Red Text Partly Bold', () => {
    expect(chalk.sgr(chalk.red('Die '+chalk.bold('Red')+' Farbe')))
      .toBe('\\x1B[31mDie \\x1B[1mRed\\x1B[22m Farbe\\x1B[m');
  });

  it('Green Background', () => {
    expect(chalk.sgr(chalk.bgGreen('Green')))
      .toBe('\\x1B[42mGreen\\x1B[m');
  });

  it('Orange Background I', () => {
    expect(chalk.sgr(chalk.bgHex('#CC6600')('Orange')))
      .toBe('\\x1B[48;2;204;102;0mOrange\\x1B[m');
  });

  it('Orange Background II', () => {
    expect(chalk.sgr(chalk.bgRgb(204,102,0)('Orange')))
      .toBe('\\x1B[48;2;204;102;0mOrange\\x1B[m');
  });
});
