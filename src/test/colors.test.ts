import { ConsoleStyler } from '../console-styler'

const CTRL_NAMES : { [key: string]: string }= {
  '\r': '\\r', 
  '\n': '\\n', 
  '\x1B': '␛', 
}

describe('Formating With Color Level 0 ...', () => {

    let cs: ConsoleStyler;

    it('new ConsoleStyler', () => {
        cs=new ConsoleStyler({ term: 'test', level: 0, ctrlName: CTRL_NAMES });
        expect(cs instanceof ConsoleStyler).toBe(true);
        expect(cs.s.sgr(cs.s.none('None'))).toBe('None');
    })

    it('Red Text', () => {
        expect(cs.s.sgr(cs.s.red('Red')))
            .toBe('Red');
    })

    it('Orange Text I', () => {
        expect(cs.s.sgr(cs.s['#CC6600']('Orange')))
            .toBe('Orange');
    })

    it('Red Background', () => {
        expect(cs.s.sgr(cs.s.bg.red('Red')))
            .toBe('Red');
    })
    
    it('Orange Background', () => {
        expect(cs.s.sgr(cs.s.bg['#CC6600']('Orange')))
            .toBe('Orange');
    })

    it('Visible', () => {
        expect(cs.s.visible('Visible'))
            .toBe('');
    })
})

describe('Formating With Color Level 1 ...', () => {

    let cs: ConsoleStyler;
  
    it('new ConsoleStyler', () => {
        cs=new ConsoleStyler({ term: 'test', level: 1, ctrlName: CTRL_NAMES });
        expect(cs instanceof ConsoleStyler).toBe(true);
        expect(cs.s.sgr(cs.s.none('None'))).toBe('None');
    })
  
    it('Red Text', () => {
        expect(cs.s.sgr(cs.s.red('Red')))
            .toBe('␛[31mRed␛[0m');
    })
    
    it('Orange Text I', () => {
        expect(cs.s.sgr(cs.s['#CC6600']('Orange')))
            .toBe('␛[91mOrange␛[0m');
    })

    it('Red Background', () => {
        expect(cs.s.sgr(cs.s.bg.red('Red')))
            .toBe('␛[41mRed␛[0m');
    })
    
    it('Orange Background', () => {
        expect(cs.s.sgr(cs.s.bg['#CC6600']('Orange')))
            .toBe('␛[101mOrange␛[0m');
    })

    it('Visible', () => {
        expect(cs.s.visible('Visible'))
            .toBe('Visible');
    })
})
  
describe('Formating With Color Level 2 ...', () => {

    let cs: ConsoleStyler;
  
    it('new ConsoleStyler', () => {
        cs=new ConsoleStyler({ term: 'test', level: 2, ctrlName: CTRL_NAMES });
        expect(cs instanceof ConsoleStyler).toBe(true);
        expect(cs.s.sgr(cs.s.none('None'))).toBe('None');
    })
  
    it('Red Text', () => {
        expect(cs.s.sgr(cs.s.red('Red')))
            .toBe('␛[31mRed␛[0m');
    })
    
    it('Orange Text', () => {
        expect(cs.s.sgr(cs.s['#CC6600']('Orange')))
          .toBe('␛[38;5;172mOrange␛[0m');
    })

    it('Red Background', () => {
        expect(cs.s.sgr(cs.s.bg.red('Red')))
            .toBe('␛[41mRed␛[0m');
    })

    it('Orange Background', () => {
        expect(cs.s.sgr(cs.s.bg['#CC6600']('Orange')))
            .toBe('␛[48;5;172mOrange␛[0m');
    })

    it('Visible', () => {
        expect(cs.s.visible('Visible'))
            .toBe('Visible');
    })
})

describe('Formating With Color Level 3 ...', () => {

    let cs: ConsoleStyler;
  
    it('new ConsoleStyler', () => {
        cs=new ConsoleStyler({ term: 'test', level: 3, ctrlName: CTRL_NAMES });
        expect(cs instanceof ConsoleStyler).toBe(true);
        expect(cs.s.sgr(cs.s.none('None'))).toBe('None');
    })
  
    it('Red Text', () => {
        expect(cs.s.sgr(cs.s.red('Red')))
            .toBe('␛[31mRed␛[0m');
    })
    
    it('Orange Text', () => {
        expect(cs.s.sgr(cs.s['#CC6600']('Orange')))
            .toBe('␛[38;2;204;102;0mOrange␛[0m');
    })

    it('Red Background', () => {
        expect(cs.s.sgr(cs.s.bg.red('Red')))
            .toBe('␛[41mRed␛[0m');
    })

    it('Orange Background', () => {
        expect(cs.s.sgr(cs.s.bg['#CC6600']('Orange')))
            .toBe('␛[48;2;204;102;0mOrange␛[0m');
    })

    it('Visible', () => {
        expect(cs.s.visible('Visible'))
            .toBe('Visible');
    })
})
