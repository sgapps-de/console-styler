import { ConsoleStyler } from '../console-styler';

const CTRL_NAMES : { [key: string]: string }= {
  '\r': '\\r', 
  '\n': '\\n', 
  '\x1B': '␛', 
};

describe('Formating With Color Level 0 ...', () => {

    let cs: ConsoleStyler;

    it('new ConsoleStyler', () => {
        cs=new ConsoleStyler({ term: 'test', level: 0, ctrlName: CTRL_NAMES });
        expect(cs instanceof ConsoleStyler).toBe(true);
        expect(cs.a.sgr(cs.a.none('None'))).toBe('None');
    });

    it('Red Text', () => {
        expect(cs.a.sgr(cs.a.red('Red')))
            .toBe('Red');
    });

    it('Orange Text I', () => {
        expect(cs.a.sgr(cs.a['#CC6600']('Orange')))
            .toBe('Orange');
    });

    it('Orange Text II', () => {
        expect(cs.a.sgr(cs.ansi256(172)('Orange')))
            .toBe('Orange');
    });

    it('Red Background', () => {
        expect(cs.a.sgr(cs.a.bg.red('Red')))
            .toBe('Red');
    });
    
    it('Orange Background', () => {
        expect(cs.a.sgr(cs.a.bg.a['#CC6600']('Orange')))
            .toBe('Orange');
    });

    it('Visible', () => {
        expect(cs.a.visible('Visible'))
            .toBe('');
    });
});

describe('Formating With Color Level 1 ...', () => {

    let cs: ConsoleStyler;
  
    it('new ConsoleStyler', () => {
        cs=new ConsoleStyler({ term: 'test', level: 1, ctrlName: CTRL_NAMES });
        expect(cs instanceof ConsoleStyler).toBe(true);
        expect(cs.a.sgr(cs.a.none('None'))).toBe('None');
    });
  
    it('Red Text', () => {
        expect(cs.a.sgr(cs.a.red('Red')))
            .toBe('␛[31mRed␛[m');
    });
    
    it('Orange Text I', () => {
        expect(cs.a.sgr(cs.a['#CC6600']('Orange')))
            .toBe('␛[91mOrange␛[m');
    });

    it('Orange Text II', () => {
        expect(cs.a.sgr(cs.ansi256(172)('Orange')))
            .toBe('␛[91mOrange␛[m');
    });

    it('Red Background', () => {
        expect(cs.a.sgr(cs.a.bg.red('Red')))
            .toBe('␛[41mRed␛[m');
    });
    
    it('Orange Background', () => {
        expect(cs.a.sgr(cs.bg.a['#CC6600']('Orange')))
            .toBe('␛[101mOrange␛[m');
    });

    it('Visible', () => {
        expect(cs.a.visible('Visible'))
            .toBe('Visible');
    });
});
  
describe('Formating With Color Level 2 ...', () => {

    let cs: ConsoleStyler;
  
    it('new ConsoleStyler', () => {
        cs=new ConsoleStyler({ term: 'test', level: 2, ctrlName: CTRL_NAMES });
        expect(cs instanceof ConsoleStyler).toBe(true);
        expect(cs.a.sgr(cs.a.none('None'))).toBe('None');
    });
  
    it('Red Text', () => {
        expect(cs.a.sgr(cs.a.red('Red')))
            .toBe('␛[31mRed␛[m');
    });
    
    it('Orange Text I', () => {
        expect(cs.a.sgr(cs.a['#CC6600']('Orange')))
          .toBe('␛[38;5;172mOrange␛[m');
    });

    it('Orange Text II', () => {
        expect(cs.a.sgr(cs.ansi256(172)('Orange')))
            .toBe('␛[38;5;172mOrange␛[m');
    });

    it('Red Background', () => {
        expect(cs.a.sgr(cs.a.bg.red('Red')))
            .toBe('␛[41mRed␛[m');
    });

    it('Orange Background', () => {
        expect(cs.a.sgr(cs.bg.a['#CC6600']('Orange')))
            .toBe('␛[48;5;172mOrange␛[m');
    });

    it('Visible', () => {
        expect(cs.a.visible('Visible'))
            .toBe('Visible');
    });
});

describe('Formating With Color Level 3 ...', () => {

    let cs: ConsoleStyler;
  
    it('new ConsoleStyler', () => {
        cs=new ConsoleStyler({ term: 'test', level: 3, ctrlName: CTRL_NAMES });
        expect(cs instanceof ConsoleStyler).toBe(true);
        expect(cs.a.sgr(cs.a.none('None'))).toBe('None');
    });
  
    it('Red Text', () => {
        expect(cs.a.sgr(cs.a.red('Red')))
            .toBe('␛[31mRed␛[m');
    });
    
    it('Orange Text I', () => {
        expect(cs.a.sgr(cs.a['#CC6600']('Orange')))
            .toBe('␛[38;2;204;102;0mOrange␛[m');
    });

    it('Orange Text II', () => {
        expect(cs.a.sgr(cs.ansi256(172)('Orange')))
            .toBe('␛[38;5;172mOrange␛[m');
    });

    it('Red Background', () => {
        expect(cs.a.sgr(cs.a.bg.red('Red')))
            .toBe('␛[41mRed␛[m');
    });

    it('Orange Background', () => {
        expect(cs.a.sgr(cs.bg.a['#CC6600']('Orange')))
            .toBe('␛[48;2;204;102;0mOrange␛[m');
    });

    it('Visible', () => {
        expect(cs.a.visible('Visible'))
            .toBe('Visible');
    });
});
