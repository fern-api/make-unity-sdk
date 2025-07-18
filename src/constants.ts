import { platform } from 'node:os';

/**
 * The current operating system platform as detected by Node.js.
 * 
 * This constant stores the platform string returned by `os.platform()`.
 * Possible values: 'win32', 'darwin', 'linux', 'freebsd', 'openbsd', 'sunos', 'aix', 'android', 'cygwin'.
 */
export const OperatingSystem = platform();

/**
 * Indicates whether the current platform is Windows.
 * 
 * @example
 * ```typescript
 * if (isWindows) {
 *   // Windows-specific code
 * }
 * ```
 */
export const isWindows = OperatingSystem === 'win32';

/**
 * Indicates whether the current platform is macOS.
 * 
 * @example
 * ```typescript
 * if (isMacOS) {
 *   // macOS-specific code
 * }
 * ```
 */
export const isMacOS = OperatingSystem === 'darwin';

/**
 * Indicates whether the current platform is Linux.
 * 
 * @example
 * ```typescript
 * if (isLinux) {
 *   // Linux-specific code
 * }
 * ```
 */
export const isLinux = OperatingSystem === 'linux';
