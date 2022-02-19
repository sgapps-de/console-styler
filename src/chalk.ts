/********************************************************************/
/*                                                                  */
/*  chalk style import                                              */
/*                                                                  */
/********************************************************************/

import { ConsoleStyler, type ConsoleStylerOptions } from './console-styler'

export type ColorSupport = false | { hasBasic: boolean, has256: boolean, has16m: boolean }

function level2ColorSupport(level: number): ColorSupport {

    if (level<1) return false;

    return { hasBasic: true, has256: level>=2, has16m: level>=3 };
}

const CONSOLE_STYLER_CHALK_OPTIONS : ConsoleStylerOptions = {
    format: [ '{', '}', ' ' ]
};

export class Chalk extends ConsoleStyler {

    constructor(opts: ConsoleStylerOptions) {
        const sOpts = { ... CONSOLE_STYLER_CHALK_OPTIONS, ...opts }
        super(sOpts);
    }
}

const chalk = new ConsoleStyler(CONSOLE_STYLER_CHALK_OPTIONS);
export const chalkStderr = new ConsoleStyler({... CONSOLE_STYLER_CHALK_OPTIONS, stderr: true});

export const supportsColor = level2ColorSupport(chalk.level);
export const supportsColorStderr = level2ColorSupport(chalkStderr.level);

export default chalk;