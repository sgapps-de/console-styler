# Console-Styler

> An alternative console styler library

## Highlights

- Ability to nest styles
- [256/Truecolor color support](#256-and-truecolor-color-support)
- Auto-detects color support
- Does not extend `String.prototype`
- Creates optimized ANSI escape codes
- No dependencies
- Compatible with EcmaScript Modules (`import`) and commonJS (`require`)
- Mostly compatible with the great library [chalk](https://www.npmjs.com/package/chalk)
- Written in [Typescript](https://www.typescriptlang.org)

## Install

```sh
npm install console-styler
```

## Usage

```js
import ConsoleStyler from 'console-styler';
const cs = new ConsoleStyler;
const log = console.log;

log(cs.green('Hello world!'));
```

Or with `require`:
```js
const ConsoleStyler = require('console-styler');
const cs = new ConsoleStyler;
const log = console.log;

log(cs.green('Hello world!'));
```

To apply more than one style, they may be chained:
```js
log(cs.green.underline('Hello world!'));
```

Styled and unstyled strings may be combined:
```js
log('Hello '+cs.green('world!'));
```

Nesting is also possible:
```js
log(cs.underline('Hello '+cs.green('world!')));
```

String formatting is integrated:
```js
log(cs.f('{{underline|Hello {{green|world!}}}}')));
```
Template strings are also supported:
```js
log(cs.f`{{underline|Hello {{green|world!}}}}`));

const w1 = 'world'
log(cs.f`{{underline|Hello {{green|${w1}!}}}}`));

const w2 = '{{green|world}}'
log(cs.f`{{underline|Hello ${w1}!}}`));
log(cs.f(`{{underline|Hello ${w1}!}}`)));
```

Special styles may be defined:
```js
cs.alias('err','red.underline');
cs.alias('warn','#CC6600');

log(cs.a.err('ERROR'));
log(cs.f`{{err|ERROR}}`);

log(cs.a.warn('Warning'));
log(cs.underline.a.warn('Warning'));
log(cs.a.warn.underline('Warning'));
log(cs.f`{{warn|Warning}}`);
```

View generated ANSI escape codes:
```js
log(cs.red.sgr('Red'))
// Output: \x1B[31mRed\x1B[m
```

## API

### Constructor

```js
import ConsoleStyler from 'console-styler';
const csOpts = {...};
const cs = new ConsoleStyler(csOpts);
```
The object `csOpts` may by a combination of the following options:

#### Option `level`

Type: one of 0, 1, 2 or 3.

Overwrite color support detection:

- `0` = All colors disabled
- `1` = Basic color support (16 colors)
- `2` = 256 color support
- `3` = Truecolor support (16 million colors)

#### Option `format`

Type: string or array of strings

Overwrite the default formatting delimiters. See `setFormat` below

#### Option 'stderr'

Type: boolean

Specifies, if the `ConsoleStyler` object will be used with `stderr` or `stdout`.

When the intended output stream is redirected, the color support will be disabled.

### ConsoleStyler.\<style>[.\<style>...](string, [string...])`
```js
cs.red.bold.underline('Hello', 'world');`
```
Chain [styles](#styles) and call the last one as a method with a string argument. Order doesn't matter, and later styles take precedent in case of a conflict. This simply means that `cs.red.yellow.green` is equivalent to `cs.green`.

Multiple arguments will be separated by space.

Styles defined with alias must be prefixed with `a.`:

```js
cs.alias('err',cs.red);
log(cs.a.err('ERROR'));
```

### ConsoleStyler.f(string, [string...])

Formatting a string with inline styles:

```js
log(cs.f('{{underline|Underlined Text}}'));
```

Or with template strings:
```js
log(cs.f`{{underline|Underlined Text}}`);
```

Formatting instructions in template arguments are ignored:
```js
const text = '{{red|Text}}';
log(cs.f`{{underline|Underlined ${text}}}`);
```

But when calling `cs.f` as a function, the nested format is taken into account:
```js
const text = '{{red|Text}}';
log(cs.f(`{{underline|Underlined ${text}}}`);
```

The formatting delimiters may be redefined:
```js
cs.setFormat('<< >> :');
log(cs.f`<<underline:Underlined>>`);

cs.setFormat('{','}',' ');
log(cs.f`{underline Underlined}`);

cs.setFormat(/(?:{([^=}]+)=)|}/);
log(cs.f`{underline=Underlined}`);
```

When using a regular Expression it must match the start and the end of a format with the first matched group being the style.

### ConsoleStyler.alias(name, style)

With the help of `alias` one can define own styles. These may be accessed via `cs.a...` or with `cs.f`.

```js
cs.alias('orange','#CC6600');

log(cs.a.orange('Hello!'));
cs.f`{{orange.underline|Hello again!}}`);

cs.alias('warning','orange.blink');
log(cs.a.warning('Hello!'));
```

Multiple Styles may be defined at once:
```js
cs.alias({
    'orange': '#CC6600',
    'lime':   '#BFFF00'
})
```

### ConsoleStyler.alias(name, function, type = 'S')

Also string conversion functions can be defined as style:
```js
import emoji from 'node-emoji';
cs.alias('emoji',emoji.emojify);
log(cs.f`{{emoji|I :heart: :coffee:!}}`);
```

The parameter `type` may be one of the following:

- `'S'` - (string) => string - the function is applied to the whole string including ANSI escape codes which must be left intact.
- `'SS'` - (string) => string - the condition `f(s1+s2)===f(s1)+f(s2)` must be satisfied. It must also leave ANSI escape codes intact.
- `'SL'` - (string) => string - the function is applied to all substrings between ANSI escape codes.

Example:
```js
cs.alias('myUpper',x => x.toUpperCase(),'SL');
// '\x1B[31m'.toUpperCase() => '\x1B[31M'
// This would be an invalid escape code!

cs.alias('myLower',x => x.toLowerCase(),'SS');
// '\x1B[31m'.toLowerCase() => '\x1B[31m' Ok
```

## Predefined Styles

### Modifiers

- `none` - No style.
- `reset` - Reset the current style.
- `bold` - Make the text bold.
- `dim` - Make the text have lower opacity.
- `blink` - Make the text blinking. *(Not widely supported)*
- `rapidBlink` - Make the text rapidly blinking. *(Anywhere supported?)*
- `italic` - Make the text italic. *(Not widely supported)*
- `underline` - Put a horizontal line below the text. *(Not widely supported)*
- `ul` - Short for `underline`
- `doubleUnderline` - Put two horizontal lines below the text. *(Not widely supported)*
- `dblUl` - Short for `doubleUnderline`
- `overline` - Put a horizontal line above the text. *(Not widely supported)*
- `strikeThrough` - Puts a horizontal line through the center of the text. *(Not widely supported)*
- `strikethrough` - Alias for `chalk` compatibility
- `strike` - Short for `strikeThrough`
- `inverse`- Invert background and foreground colors.
- `hidden` - Print the text but make it invisible.
- `visible` - Print the text only for a color level above zero. Can be useful for things that are purely cosmetic.
- `not` - turn the following modifier off - may be used in nested styles.

### Colors

- `black`
- `red`
- `green`
- `yellow`
- `blue`
- `magenta`
- `cyan`
- `white`
- `gray`
- `grey` (Same as `gray`)
- `bright` - Brighten the following color - e.g. `bright.red`
- `dark` - Darken the following color

Bright colors in *chalk* style:

- `blackBright` (same as `gray` and `grey`)
- `redBright`
- `greenBright`
- `yellowBright`
- `blueBright`
- `magentaBright`
- `cyanBright`
- `whiteBright`

### Background colors

- `bg.black`
- `bg.red`

    ...

- `bg.grey`
- `bg.bright.black`
- `bg.bright.red`

    ...

Or in *chalk* style:

- `bgBlack`
- `bgRed`

    ...

- `bgGrey`
- `bgBlackBright`
- `bgRedBright`

    ...

### Special Styles

- `lower` - Convert text to lower case
- `upper` - Convert text to upper case
- `sgr` - Convert ANSI escape codes to visible characters - optional with styling
- `ctrl` - Convert all control codes to visible characters - optional with styling
- `final` - Finalise ANSI escape codes - remove special codes `200` ...

### 256 and Truecolor color support

`Console-styler` supports 256 colors and Truecolor (16 million colors).

- `hex(h)` - Hex Color like `'#CC6600'`
- `rgb(r,g,b)` - RGB color - components `0` ... `255`.
- `ansi256(c)` - One of 256 predefined colors - `0 <= c <= 255`.
- `ansi16(c)` - One of the 16 standard colors - `0 <= c <= 15`.

Colors are downsampled from 16 million RGB values to an ANSI color format that is supported by the terminal emulator (or by specifying `{level: n}` as an option). For example, when runing at level 1 (basic color support), the RGB value of #FF0000 (bright red) will be replaced by the 16 color code `91`.

Examples:
```js
// Chained styles
cs.hex('#DEADED').underline('Hello, world!')
cs.rgb(15,100,204).inverse('Hello!')
// Format strings
cs.f('{{#CC6600|Hello again!}}')
cs.f('{{rgb(204,102,0)|And hello again!}}')
```

Background colors are generated with

- `bg.hex(h)`
- `bg.rgb(r,g,b)`
- `bg.ansi256(c)`
- `bg.ansi16(c)`

or in *chalk* style:

- `bgHex(h)`
- `bgRgb(r,g,b)`
- `bgAnsi256(c)`
- `bgAnsi16(c)`

## Chalk compatibility

```js
import chalk,
       { chalkStderr,
         supportsColor,
         supportsColorStdErr
       } from 'console-styler/chalk'

console.log(chalk.blue('Hello world!'));
```

`Console-styler` should be mostly compatible with [chalk](https://www.npmjs.com/package/chalk).

The main difference is, that a `ConsoleStyler` object ist not callable:
```js
import chalk1 from 'chalk'
import chalk2 from 'console-styler/chalk'

chalk1('Hello');      // => 'Hello'
chalk2('Hello');      // ERROR
chalk2.none('Hello'); // => 'Hello'
```

The generated ANSI escape codes are not the same - but should look the same.

This library is somewhat slower than chalk - if you do not need the special features you might be better off with the original.

## Windows

`Console-styler` is compatible with the [Windows Terminal](https://github.com/microsoft/terminal), the [Windows 10 console](https://docs.microsoft.com/en-us/windows/console/console-virtual-terminal-sequences) and also [ConEmu](https://conemu.github.io/)

## Linux

Linux is not very well tested at the moment. When `COLORTERM` is set it should be recognized correctly. Color specifications in the value of `TERM` are also considered:

- `TERM=...truecolor...` -> level=3 - full RGB support
- `TERM=...24bit...` -> level=3 - full RGB support
- `TERM=...256color...`  -> level=2 - 256 color support
- `TERM=...color...`     -> level=1 - 16 color support

## Browser

Using `console-styler` in the browser is not supported.