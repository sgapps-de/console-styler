import ConsoleStyler from '../console-styler';

const ESCAPE = { '\x1B': '␛' };

describe('Formating With Color Level 0 ...', () => {

    let cs: ConsoleStyler;

    it('new ConsoleStyler', () => {
        cs=new ConsoleStyler({ level: 0, ctrlName: ESCAPE });
        expect(cs instanceof ConsoleStyler).toBe(true);
        expect(cs.sgr(cs.none('None'))).toBe('None');
    });

    it('Red Text', () => {
        expect(cs.sgr(cs.red('Red')))
            .toBe('Red');
    });

    it('Orange Text I', () => {
        expect(cs.sgr(cs.a['#CC6600']('Orange')))
            .toBe('Orange');
    });

    it('Orange Text II', () => {
        expect(cs.sgr(cs.ansi256(172)('Orange')))
            .toBe('Orange');
    });

    it('Red Background', () => {
        expect(cs.sgr(cs.bg.red('Red')))
            .toBe('Red');
    });
    
    it('Orange Background', () => {
        expect(cs.sgr(cs.bg.a['#CC6600']('Orange')))
            .toBe('Orange');
    });

    it('Visible', () => {
        expect(cs.visible('Visible'))
            .toBe('');
    });
});

describe('Formating With Color Level 1 ...', () => {

    let cs: ConsoleStyler;
  
    it('new ConsoleStyler', () => {
        cs=new ConsoleStyler({ level: 1, ctrlName: ESCAPE });
        expect(cs instanceof ConsoleStyler).toBe(true);
        expect(cs.sgr(cs.none('None'))).toBe('None');
    });
  
    it('Red Text', () => {
        expect(cs.sgr(cs.red('Red')))
            .toBe('␛[31mRed␛[m');
    });
    
    it('Orange Text I', () => {
        expect(cs.sgr(cs.a['#CC6600']('Orange')))
            .toBe('␛[91mOrange␛[m');
    });

    it('Orange Text II', () => {
        expect(cs.sgr(cs.ansi256(172)('Orange')))
            .toBe('␛[91mOrange␛[m');
    });

    it('Red Background', () => {
        expect(cs.sgr(cs.bg.red('Red')))
            .toBe('␛[41mRed␛[m');
    });
    
    it('Orange Background', () => {
        expect(cs.sgr(cs.bg.a['#CC6600']('Orange')))
            .toBe('␛[101mOrange␛[m');
    });

    it('Visible', () => {
        expect(cs.visible('Visible'))
            .toBe('Visible');
    });
});
  
describe('Formating With Color Level 2 ...', () => {

    let cs: ConsoleStyler;
  
    it('new ConsoleStyler', () => {
        cs=new ConsoleStyler({ level: 2, ctrlName: ESCAPE });
        expect(cs instanceof ConsoleStyler).toBe(true);
        expect(cs.sgr(cs.none('None'))).toBe('None');
    });
  
    it('Red Text', () => {
        expect(cs.sgr(cs.red('Red')))
            .toBe('␛[31mRed␛[m');
    });
    
    it('Orange Text I', () => {
        expect(cs.sgr(cs.a['#CC6600']('Orange')))
          .toBe('␛[38;5;172mOrange␛[m');
    });

    it('Orange Text II', () => {
        expect(cs.sgr(cs.ansi256(172)('Orange')))
            .toBe('␛[38;5;172mOrange␛[m');
    });

    it('Red Background', () => {
        expect(cs.sgr(cs.bg.red('Red')))
            .toBe('␛[41mRed␛[m');
    });

    it('Orange Background', () => {
        expect(cs.sgr(cs.bg.a['#CC6600']('Orange')))
            .toBe('␛[48;5;172mOrange␛[m');
    });

    it('Visible', () => {
        expect(cs.visible('Visible'))
            .toBe('Visible');
    });
});

describe('Formating With Color Level 3 ...', () => {

    let cs: ConsoleStyler;
  
    it('new ConsoleStyler', () => {
        cs=new ConsoleStyler({ level: 3, ctrlName: ESCAPE });
        expect(cs instanceof ConsoleStyler).toBe(true);
        expect(cs.sgr(cs.none('None'))).toBe('None');
    });
  
    it('Red Text', () => {
        expect(cs.sgr(cs.red('Red')))
            .toBe('␛[31mRed␛[m');
    });
    
    it('Orange Text I', () => {
        expect(cs.sgr(cs.a['#CC6600']('Orange')))
            .toBe('␛[38;2;204;102;0mOrange␛[m');
    });

    it('Orange Text II', () => {
        expect(cs.sgr(cs.ansi256(172)('Orange')))
            .toBe('␛[38;5;172mOrange␛[m');
    });

    it('Red Background', () => {
        expect(cs.sgr(cs.bg.red('Red')))
            .toBe('␛[41mRed␛[m');
    });

    it('Orange Background', () => {
        expect(cs.sgr(cs.bg.a['#CC6600']('Orange')))
            .toBe('␛[48;2;204;102;0mOrange␛[m');
    });

    it('Visible', () => {
        expect(cs.visible('Visible'))
            .toBe('Visible');
    });
});
