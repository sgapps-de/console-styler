import ConsoleStyler from '../console-styler';

describe('Formating Multiple Arguments ...', () => {

    let cs: ConsoleStyler;

    it('New ConsoleStyler', () => {
        cs=new ConsoleStyler({});
        expect(cs instanceof ConsoleStyler).toBe(true);
        expect(cs.sgr(cs.none('None'))).toBe('None');
    });

    it('Single Argument (mf=false)', () => {
        cs.multiFmt=false;
        expect(cs.none('Foo')).toBe('Foo');
    });

    it('Multiple Arguments Without % (mf=false) ', () => {
        cs.multiFmt=false;
        expect(cs.none('Foo','Bar','Baz')).toBe('Foo Bar Baz');
    });

    it('Multiple Arguments WITH % (mf=false) ', () => {
        cs.multiFmt=false;
        expect(cs.none('Foo x=%i y=%i x+y=%i',3,4,7)).toBe('Foo x=%i y=%i x+y=%i 3 4 7');
    });

    it('Single Argument (mf=true)', () => {
        cs.multiFmt=true;
        expect(cs.none('Foo')).toBe('Foo');
    });

    it('Multiple Arguments Without % (mf=true) ', () => {
        cs.multiFmt=true;
        expect(cs.none('Foo','Bar','Baz')).toBe('Foo Bar Baz');
    });

    it('Multiple Arguments WITH % (mf=true) ', () => {
        cs.multiFmt=true;
        expect(cs.none('Foo x=%i y=%i x+y=%i',3,4,7)).toBe('Foo x=3 y=4 x+y=7');
    });
});