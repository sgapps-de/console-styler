import benny from 'benny';
import { ConsoleStyler } from '../console-styler';
import chalk from 'chalk';

let cs: ConsoleStyler = new ConsoleStyler({});

async function bench() {

    let cs: ConsoleStyler = new ConsoleStyler({});

    await (() =>

        benny.suite(
        'Benchmark 3',

        benny.add('Chalk', () => {
            let s = chalk.underline.red('Hallo Silvan');
        }),

        benny.add('Console styler', () => {
            let s = cs.s.underline.red('Hallo Silvan');
        }),

        benny.cycle(),
        benny.complete(),
        )
    )();

}

bench();
