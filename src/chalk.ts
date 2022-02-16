/********************************************************************/
/*                                                                  */
/*  chalk style import                                              */
/*                                                                  */
/********************************************************************/

import ConsoleStyler, { type ConsoleStylerOptions } from './console-styler'

export type ColorSupport = false | { hasBasic: boolean, has256: boolean, has16m: boolean }

function level2ColorSupport(level: number): ColorSupport {

    if (level<1) return false;

    return { hasBasic: true, has256: level>=2, has16m: level>=3 };
}

export class Chalk extends ConsoleStyler {

    constructor(opts: ConsoleStylerOptions) {
        super(opts);
    }
}

const chalk = new ConsoleStyler();
export const chalkStderr = new ConsoleStyler({stderr: true});

export const supportsColor = level2ColorSupport(chalk.level);
export const supportsColorStderr = level2ColorSupport(chalkStderr.level);

export default chalk;