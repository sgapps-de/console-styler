import benny from 'benny';
import ConsoleStyler from '../console-styler';
import chalk from 'chalk';

let cs: ConsoleStyler = new ConsoleStyler({});

async function bench() {

    let cs: ConsoleStyler = new ConsoleStyler({});

    await (() =>

        benny.suite(
        'Benchmark 2',

        benny.add('Chalk', () => {
            let s = chalk.underline('Hallo '+chalk.red('Silvan'));
        }),

        benny.add('Console styler', () => {
            let s = cs.a.underline('Hallo '+cs.a.red('Silvan'));
        }),

        benny.cycle(),
        benny.complete(),
        )
    )();

}

bench();
