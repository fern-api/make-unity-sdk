import { blue, green, red, yellow } from './ansi';
import { enableDebug, enableQuiet, enableVerbose } from './cli';

/**
 * Global counter for tracking the number of errors encountered during execution.
 * This counter is incremented each time the error() function is called.
 */
export let errorCount = 0;

/**
 * Unicode check mark symbol in green color for success messages.
 */
export const check = green('✓');

/**
 * Unicode cross symbol in red color for error messages.
 */
export const cross = red('✗');

/**
 * Unicode warning symbol in yellow color for warning messages.
 */
export const warning = yellow('⚠');

/**
 * Unicode information symbol in blue color for informational messages.
 */
export const note = blue('ℹ');

/**
 * Exits the process with an error message and optional exit code.
 * 
 * This function displays the error message in red and then terminates
 * the process with the specified exit code (defaults to the current error count).
 * 
 * @param message - The error message or Error object to display
 * @param code - The exit code to use (defaults to errorCount)
 * @throws {never} This function never returns as it terminates the process
 * 
 * @example
 * ```typescript
 * if (criticalError) {
 *   exit('Critical error occurred', 1);
 * }
 * ```
 */
export function exit(message: string | Error, code: number = errorCount): never {
  error(`\n${red(message.toString())}`);
  process.exit(code);
}

/**
 * Outputs informational messages that can be suppressed with the --quiet flag.
 * 
 * This function displays messages to the console unless quiet mode is enabled.
 * It's used for normal operational messages that users typically want to see.
 * 
 * @param message - The message to display
 * @param optionalParams - Additional parameters to pass to console.log
 * 
 * @example
 * ```typescript
 * info('Processing file:', filename);
 * info('Build completed successfully');
 * ```
 */
export function info(message?: any, ...optionalParams: any[]) {
  if (!enableQuiet) {
    console.log(message, ...optionalParams);
  }
}

/**
 * Outputs messages that are always displayed regardless of quiet mode.
 * 
 * This function displays messages to the console even when quiet mode is enabled.
 * Use this for critical messages that should always be visible.
 * 
 * @param message - The message to display
 * @param optionalParams - Additional parameters to pass to console.log
 * 
 * @example
 * ```typescript
 * log('Starting build process...');
 * log('Version:', version);
 * ```
 */
export function log(message?: any, ...optionalParams: any[]) {
  console.log(message, ...optionalParams);
}

/**
 * Outputs debug messages that are only shown when --debug is enabled.
 * 
 * This function displays very detailed debug information that is useful for
 * troubleshooting but not typically needed for normal operation.
 * 
 * @param message - The debug message to display
 * @param optionalParams - Additional parameters to pass to console.debug
 * 
 * @example
 * ```typescript
 * debug('File contents:', fileData);
 * debug('Processing step:', stepNumber);
 * ```
 */
export function debug(message?: any, ...optionalParams: any[]) {
  if (enableDebug) {
    console.debug(message, ...optionalParams);
  }
}

/**
 * Outputs verbose messages that are only shown when --verbose is enabled.
 * 
 * This function displays moderate detail information that provides insight
 * into the process flow without being as detailed as debug messages.
 * 
 * @param message - The verbose message to display
 * @param optionalParams - Additional parameters to pass to console.log
 * 
 * @example
 * ```typescript
 * verbose('Creating directory:', dirPath);
 * verbose('File processed:', filename);
 * ```
 */
export function verbose(message?: any, ...optionalParams: any[]) {
  if (enableVerbose) {
    console.log(message, ...optionalParams);
  }
}

/**
 * Outputs error messages and increments the error counter.
 * 
 * This function displays error messages to stderr and increments the global
 * error count. It's used for all error conditions during execution.
 * 
 * @param message - The error message to display
 * @param optionalParams - Additional parameters to pass to console.error
 * 
 * @example
 * ```typescript
 * error('Failed to read file:', filename);
 * error('Invalid configuration:', config);
 * ```
 */
export function error(message?: any, ...optionalParams: any[]) {
  errorCount++;
  console.error(message, ...optionalParams);
}

/**
 * Outputs warning messages to the console.
 * 
 * This function displays warning messages that indicate potential issues
 * but don't necessarily prevent the process from continuing.
 * 
 * @param message - The warning message to display
 * @param optionalParams - Additional parameters to pass to console.warn
 * 
 * @example
 * ```typescript
 * warn('Deprecated feature used:', feature);
 * warn('File not found, using default:', filename);
 * ```
 */
export function warn(message?: any, ...optionalParams: any[]) {
  console.warn(message, ...optionalParams);
}