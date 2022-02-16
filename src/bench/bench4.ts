import benny from 'benny';
import ConsoleStyler from '../console-styler';

let cs: ConsoleStyler = new ConsoleStyler({});

async function bench() {

    let cs: ConsoleStyler = new ConsoleStyler({});

    await (() =>

        benny.suite(
        'Benchmark 4',

        benny.add('Console styler format 1', () => {
            let s = cs.f('{{underline.red|Hallo Silvan}}');
        }),

        benny.add('Console styler format 2', () => {
            let s = cs.f('{{underline|Hallo {{red|Silvan}}}}');
        }),

        benny.cycle(),
        benny.complete(),
        )
    )();

}

bench();
