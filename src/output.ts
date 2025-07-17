import { enableDebug, enableQuiet, enableVerbose } from './cli';


export function exit(message: string | Error, code: number = 1): never {
  error(message.toString());
  process.exit(code);
}

/** normal console output that can be suppressed with --quiet */
export function info(message?: any, ...optionalParams: any[]) {
  if (!enableQuiet) {
    console.log(message, ...optionalParams);
  }
}

/** normal console output */
export function log(message?: any, ...optionalParams: any[]) {
  console.log(message, ...optionalParams);
}

/** console output for messages that are only shown when --debug is enabled (very detailed output) */
export function debug(message?: any, ...optionalParams: any[]) {
  if (enableDebug) {
    console.debug(message, ...optionalParams);
  }
}

/** console output for messages that are only shown when --verbose is enabled (moderate detail) */
export function verbose(message?: any, ...optionalParams: any[]) {
  if (enableVerbose) {
    console.log(message, ...optionalParams);
  }
}

/** console output for errors */
export function error(message?: any, ...optionalParams: any[]) {
  console.error(message, ...optionalParams);
}

/** console output for warnings */
export function warn(message?: any, ...optionalParams: any[]) {
  console.warn(message, ...optionalParams);
}