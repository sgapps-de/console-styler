import benny from 'benny';
import ConsoleStyler from '../console-styler';
import chalk from 'chalk';

async function bench() {

    let cs: ConsoleStyler = new ConsoleStyler({});

    await (() =>

        benny.suite(
        'Benchmark 1',

        benny.add('Chalk', () => {
            let s = chalk.underline('Hallo Silvan');
        }),

        benny.add('Console styler', () => {
            let s = cs.a.underline('Hallo Silvan');
        }),

        benny.cycle(),
        benny.complete(),
        )
    )();

}

bench();

