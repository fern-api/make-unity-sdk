import { isMacOS } from './constants';
import { is, Printable } from './guards';

/**
 * Global flag controlling whether ANSI color codes should be used.
 * 
 * This is automatically set based on whether the terminal supports colors
 * (isTTY) and whether colors are explicitly disabled via FORCE_COLOR=0.
 */
let useColor = process.stdout.isTTY && process.env.FORCE_COLOR !== '0';

/**
 * Sets whether ANSI color codes should be used in output.
 * 
 * This function allows manual control over color output, overriding the
 * automatic detection based on terminal capabilities.
 * 
 * @param enabled - Whether to enable or disable color output
 * 
 * @example
 * ```typescript
 * setColor(false); // Disable colors
 * setColor(true);  // Enable colors
 * ```
 */
export function setColor(enabled: boolean) {
  useColor = enabled;
}

const customInspectSymbol = Symbol.for('nodejs.util.inspect.custom');

/**
 * Creates ANSI escape sequences using template literals.
 * 
 * This function generates ANSI escape codes that can be used to control
 * terminal formatting and colors.
 * 
 * @param literals - Template string literals
 * @param values - Values to interpolate into the template
 * @returns ANSI escape sequence string
 */
function ansi(literals: TemplateStringsArray, ...values: Array<string | number | boolean | undefined | Date>) {
  return `\u001b${String.raw(literals, ...values)}`;
}

/**
 * Creates CSI (Control Sequence Introducer) ANSI sequences.
 * 
 * CSI sequences are used for cursor movement, screen clearing, and other
 * terminal control operations.
 * 
 * @param literals - Template string literals
 * @param values - Values to interpolate into the template
 * @returns CSI escape sequence string
 */
function csi(literals: TemplateStringsArray, ...values: Array<string | number | boolean | undefined | Date>) {
  return ansi`[${String.raw(literals, ...values)}`;
}

/**
 * Creates SGR (Select Graphic Rendition) ANSI sequences.
 * 
 * SGR sequences control text formatting like colors, bold, italic, etc.
 * 
 * @param values - Array of SGR parameter values
 * @returns SGR escape sequence string
 */
function sgr(...values: Array<number>) {
  return csi`${values.join(';')}m`;
}

/**
 * Creates a 256-color foreground color sequence.
 * 
 * @param foreground - Color index (0-255)
 * @returns ANSI color sequence for foreground
 */
function fg256(foreground: number) {
  return sgr(38, 5, foreground);
}

/**
 * Creates a 256-color background color sequence.
 * 
 * @param background - Color index (0-255)
 * @returns ANSI color sequence for background
 */
function bg256(background: number) {
  return sgr(48, 5, background);
}

/**
 * Creates an RGB foreground color sequence.
 * 
 * @param r - Red component (0-255)
 * @param g - Green component (0-255)
 * @param b - Blue component (0-255)
 * @returns ANSI RGB color sequence for foreground
 */
function fgRGB(r: number, g: number, b: number) {
  return sgr(38, 2, r, g, b);
}

/**
 * Creates an RGB background color sequence.
 * 
 * @param r - Red component (0-255)
 * @param g - Green component (0-255)
 * @param b - Blue component (0-255)
 * @returns ANSI RGB color sequence for background
 */
function bgRGB(r: number, g: number, b: number) {
  return sgr(48, 2, r, g, b);
}

const findSgr10 = new RegExp(`(\\u001b\\[10m)`, 'g');

/**
 * ANSI escape code constants for common formatting operations.
 * 
 * These constants provide easy access to standard ANSI escape sequences
 * for text formatting, cursor control, and screen manipulation.
 */
const codes = {
  reset: sgr(0),
  bold: sgr(1),
  dim: sgr(2),
  italic: sgr(3),
  underline: sgr(4),
  blink: sgr(5),
  fastBlink: sgr(6),
  reverse: sgr(7),
  conceal: sgr(8),
  crossedout: sgr(9),
  notUnderline: sgr(24),
  notBlink: sgr(25),
  notReverse: sgr(27),
  notConceal: sgr(28),
  notCrossedout: sgr(29),
  superScript: sgr(73),
  subScript: sgr(74),

  sgr10: sgr(10),
};

/**
 * Type definition for ANSI sequence functions.
 * 
 * These functions can be called either as template literals or with a single value.
 */
type ansiSequence = { (literals: TemplateStringsArray, ...args: any[]): string; (text: Printable): string; };

/**
 * Factory function that creates ANSI formatting functions.
 * 
 * This function creates formatting functions that can be used both as
 * template literals and as regular functions. The functions automatically
 * handle color enabling/disabling based on the global useColor flag.
 * 
 * @param parts - ANSI escape sequences to combine
 * @returns A function that applies the formatting
 */
function styleFactory(...parts: Array<string>): ansiSequence {
  const combination = parts.join('');
  return function (arg1: Printable | TemplateStringsArray, ...values: Array<Printable>): string {
    return useColor ?
      /** with color */
      is.templateStringsArray(arg1) ?
        combination + String.raw(arg1, ...values.map(each => String(each) + codes.sgr10 + combination)).replace(/\\n/g, '\n').replace(/\\\$/g, '$') + codes.reset + codes.sgr10 :
        // Handle newlines properly by splitting into lines and applying color to each
        // Also convert literal \n sequences to actual newlines and \$ to $
        String(arg1).replace(/\\n/g, '\n').replace(/\\\$/g, '$').split('\n').map(line =>
          combination + line.replace(findSgr10, `$1${combination}`) + codes.reset + codes.sgr10
        ).join('\n') :
      /** without color */
      is.templateStringsArray(arg1) ?
        String.raw(arg1, ...values.map(each => String(each))).replace(/\\n/g, '\n').replace(/\\\$/g, '$') :
        String(arg1);
  };
}

/**
 * Factory function that creates parameterized ANSI functions.
 * 
 * This function creates ANSI functions that accept parameters (like cursor
 * movement functions that need coordinates). The functions automatically
 * handle color enabling/disabling.
 * 
 * @param fn - The base function that generates ANSI sequences
 * @returns A function that applies the parameterized formatting
 */
function parameterizedFactory<T extends (...args: any[]) => string>(fn: T): (...args: Parameters<T>) => ansiSequence {
  return (...args: Parameters<T>) => {
    const result = function (arg1: Printable | TemplateStringsArray, ...values: Array<Printable>): string {
      return useColor ?
        /** with color */
        is.templateStringsArray(arg1) ?
          fn(...args) + String.raw(arg1, ...values).replace(/\\n/g, '\n').replace(/\\\$/g, '$') :
          // Handle newlines properly by converting literal \n sequences to actual newlines
          fn(...args) + String(arg1).replace(/\\n/g, '\n').replace(/\\\$/g, '$') :
        /** without color */
        is.templateStringsArray(arg1) ?
          String.raw(arg1, ...values).replace(/\\n/g, '\n').replace(/\\\$/g, '$') :
          String(arg1);
    }
    result.toString = () => fn(...args);
    (result as any)[customInspectSymbol] = () => fn(...args);
    return result;
  }
}

// Text formatting functions
export const underline = styleFactory(codes.underline);
export const bold = styleFactory(codes.bold);
export const dim = styleFactory(codes.dim);
export const italic = styleFactory(codes.italic);
export const reverse = styleFactory(codes.reverse);
export const notUnderline = styleFactory(codes.notUnderline);
export const notBlink = styleFactory(codes.notBlink);
export const notReverse = styleFactory(codes.notReverse);

export const reset = styleFactory(codes.reset);

// Cursor movement functions
export const up = parameterizedFactory((lines: number) => csi`${lines}A`);
export const down = parameterizedFactory((lines: number) => csi`${lines}B`);
export const right = parameterizedFactory((lines: number) => csi`${lines}C`);
export const left = parameterizedFactory((lines: number) => csi`${lines}D`);
export const nextLine = parameterizedFactory((lines: number) => csi`${lines}E`);
export const previousLine = parameterizedFactory((lines: number) => csi`${lines}F`);
export const horizontalAbsolute = parameterizedFactory((lines: number) => csi`${lines}G`);
export const verticalAbsolute = parameterizedFactory((lines: number) => csi`${lines}d`);
export const to = parameterizedFactory((x: number, y: number) => csi`${y};${x}H`);

// Color functions - using 256-color on macOS and RGB on other platforms for better compatibility
export const black = isMacOS ? styleFactory(fg256(0)) : styleFactory(fgRGB(0, 0, 0));
export const red = isMacOS ? styleFactory(fg256(9)) : styleFactory(fgRGB(255, 0, 0));
export const green = isMacOS ? styleFactory(fg256(10)) : styleFactory(fgRGB(0, 255, 0));
export const yellow = isMacOS ? styleFactory(fg256(11)) : styleFactory(fgRGB(255, 255, 85));
export const blue = isMacOS ? styleFactory(fg256(12)) : styleFactory(fgRGB(0, 0, 255));
export const magenta = isMacOS ? styleFactory(fg256(13)) : styleFactory(fgRGB(255, 0, 255));
export const cyan = isMacOS ? styleFactory(fg256(14)) : styleFactory(fgRGB(0, 255, 255));
export const white = isMacOS ? styleFactory(fg256(15)) : styleFactory(fgRGB(255, 255, 255));
export const grey = isMacOS ? styleFactory(fg256(7)) : styleFactory(fgRGB(128, 128, 128));
export const darkRed = isMacOS ? styleFactory(fg256(1)) : styleFactory(fgRGB(128, 0, 0));
export const darkGreen = isMacOS ? styleFactory(fg256(2)) : styleFactory(fgRGB(0, 128, 0));
export const darkYellow = isMacOS ? styleFactory(fg256(3)) : styleFactory(fgRGB(128, 128, 45));
export const darkBlue = isMacOS ? styleFactory(fg256(4)) : styleFactory(fgRGB(0, 0, 128));
export const darkMagenta = isMacOS ? styleFactory(fg256(5)) : styleFactory(fgRGB(128, 0, 128));
export const darkCyan = isMacOS ? styleFactory(fg256(6)) : styleFactory(fgRGB(0, 128, 128));
export const darkGrey = isMacOS ? styleFactory(fg256(8)) : styleFactory(fgRGB(65, 65, 65));

// Background color functions
export const bgBlack = isMacOS ? styleFactory(bg256(0)) : styleFactory(bgRGB(0, 0, 0));
export const bgRed = isMacOS ? styleFactory(bg256(9)) : styleFactory(bgRGB(255, 0, 0));
export const bgGreen = isMacOS ? styleFactory(bg256(10)) : styleFactory(bgRGB(0, 255, 0));
export const bgYellow = isMacOS ? styleFactory(bg256(11)) : styleFactory(bgRGB(255, 255, 85));
export const bgBlue = isMacOS ? styleFactory(bg256(12)) : styleFactory(bgRGB(0, 0, 255));
export const bgMagenta = isMacOS ? styleFactory(bg256(13)) : styleFactory(bgRGB(255, 0, 255));
export const bgCyan = isMacOS ? styleFactory(bg256(14)) : styleFactory(bgRGB(0, 255, 255));
export const bgWhite = isMacOS ? styleFactory(bg256(15)) : styleFactory(bgRGB(255, 255, 255));
export const bgGrey = isMacOS ? styleFactory(bg256(7)) : styleFactory(bgRGB(128, 128, 128));
export const bgDarkRed = isMacOS ? styleFactory(bg256(1)) : styleFactory(bgRGB(128, 0, 0));
export const bgDarkGreen = isMacOS ? styleFactory(bg256(2)) : styleFactory(bgRGB(0, 128, 0));
export const bgDarkYellow = isMacOS ? styleFactory(bg256(3)) : styleFactory(bgRGB(128, 128, 45));
export const bgDarkBlue = isMacOS ? styleFactory(bg256(4)) : styleFactory(bgRGB(0, 0, 128));
export const bgDarkMagenta = isMacOS ? styleFactory(bg256(5)) : styleFactory(bgRGB(128, 0, 128));
export const bgDarkCyan = isMacOS ? styleFactory(bg256(6)) : styleFactory(bgRGB(0, 128, 128));
export const bgDarkGrey = isMacOS ? styleFactory(bg256(8)) : styleFactory(bgRGB(65, 65, 65));

export const yellow2 = styleFactory(fg256(11));

// Screen control functions
export const scrollUp = parameterizedFactory((lines: number) => csi`${lines}S`);
export const scrollDown = parameterizedFactory((lines: number) => csi`${lines}T`);
export const scrollLeft = parameterizedFactory((lines: number) => csi`${lines}D`);
export const scrollRight = parameterizedFactory((lines: number) => csi`${lines}C`);
export const scrollTo = parameterizedFactory((x: number, y: number) => csi`${y};${x}H`);
export const clearLines = parameterizedFactory((lines: number) => csi`${lines}J`);
export const clearCharacters = parameterizedFactory((lines: number) => csi`${lines}G`);

// Common screen control sequences
export const scrollToTop = csi`H`;
export const scrollToBottom = csi`f`;
export const clearScreen = csi`2J`;
export const clearLine = csi`2K`;

export const windowTitle = parameterizedFactory((title: string) => ansi`]0;${title}\u0007`);

// run this file alone to see some adhoc testing
if (require.main === module) {
  console.log(clearScreen);

  console.log(to(20, 0) + red`+ operator`);
  console.log(to(40, 0)`can use as a ttl.`);
  console.log(to(60, 0)(blue`or a function.`));
  console.log(to(80, 20));
  console.log('or nothing at all.');
  console.log(green(to(100, 0)`this works too.`));
  console.log(up(4));

  console.log(green`some text`);
  console.log(white`this is white`);
  console.log(grey`this is grey`);
  console.log(darkGrey`this is dark grey`);

  console.log(yellow2`this is yellow text`);
  console.log(darkYellow`this is yellow text`);

  console.log(bgBlue(red`this is red with bg blue(${bgGreen`this is ${blue`bg`} green`})`));
  console.log(bgBlue(red`${bgBlack`this`} ${bgGreen(yellow`is`)} red text`));

  console.log(bgBlue`this is blue background`);
  console.log(red`this is red`);

  console.log(bgBlue(red`blue background with red text`));
  console.log(green(red`this is red foreground only`));
  console.log(red(bgBlue`this is red with blue background`));
  console.log(underline`this is underlined text`);
  console.log(reverse`this is reverse text`);
  console.log(bold`this is bold text`);
  console.log(red(bold`this is red bold text`));
  console.log(dim(red`this is red dim text`));
  console.log(dim(darkRed`this is red dim text`));
  console.log(italic`this is italic text`);

  console.log(red(bgBlue`this is red with blue (${bgBlack(green`but green ${bgRed(yellow`${100}`)}!`)}) background`));
  console.log(red(123));
  console.log(codes.reset);

  console.log('back to normal');

  // Test newline handling
  console.log('\n' + bold`Testing newline handling:`);
  console.log(red`Line 1\nLine 2\nLine 3`);
  console.log(green`Multi-line\ntext with\ncolors`);
  console.log(blue`This should be blue\nand this too\nand this as well`);

  // Test dollar sign escaping
  console.log('\n' + bold`Testing dollar sign escaping:`);
  console.log(red`Price: \$10.99`);
  console.log(green`Cost: \$25.50`);
  console.log(blue`Total: \$100.00`);

  // Test parameterized functions with newlines
  console.log('\n' + bold`Testing parameterized functions with newlines:`);
  console.log(up(2)`Moving up\nwith newlines`);
  console.log(down(1)`Moving down\nwith newlines`);
  console.log(right(10)`Moving right\nwith newlines`);
  console.log(left(5)`Moving left\nwith newlines`);

}