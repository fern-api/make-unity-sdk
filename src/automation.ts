import { exec } from 'node:child_process';
import { error, verbose } from './output';

/**
 * Executes a shell command asynchronously and returns the result.
 * 
 * This function wraps Node.js child_process.exec in a Promise and provides
 * real-time output streaming through the verbose logger.
 * 
 * @param command - The shell command to execute
 * @returns A Promise that resolves with an object containing stdout, stderr, and exit code
 * @throws {Error} If the command execution fails
 * 
 * @example
 * ```typescript
 * const result = await execAsync('ls -la');
 * console.log(result.stdout);
 * console.log(result.exitCode);
 * ```
 */
export function execAsync(command: string): Promise<{ stdout: string, stderr: string, exitCode: number }> {
  return new Promise((resolve, reject) => {
    const child = exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      }
    });
    let stdout = '';
    let stderr = '';
    child.stdout?.on('data', (data) => {
      verbose(data);
      stdout += data;
    });
    child.stderr?.on('data', (data) => {
      verbose(data);
      stderr += data;
    });
    child.on('close', (code) => {
      resolve({ stdout, stderr, exitCode: code ?? 0 });
    });
  });
}

/**
 * Checks if a string contains special characters that might need shell escaping.
 * 
 * This function uses a regex pattern to detect common special characters
 * that could cause issues in shell commands if not properly quoted.
 * 
 * @param str - The string to check for special characters
 * @returns True if the string contains special characters, false otherwise
 * 
 * @example
 * ```typescript
 * containsSpecialCharacters('hello world'); // true (space)
 * containsSpecialCharacters('hello'); // false
 * containsSpecialCharacters('file.txt'); // true (dot)
 * ```
 */
function containsSpecialCharacters(str: string) {
  return /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(str);
}

/**
 * Executes a command with arguments, automatically handling argument quoting.
 * 
 * This function constructs a shell command from a base command and arguments,
 * automatically quoting arguments that contain spaces or special characters
 * to prevent shell interpretation issues. It also provides error handling
 * and logging through the output module.
 * 
 * @param cmd - The base command to execute (e.g., 'git', 'npm', 'echo')
 * @param args - Variable number of arguments to pass to the command
 * @returns A Promise that resolves with an object containing stdout, stderr, and exit code
 * 
 * @example
 * ```typescript
 * // Simple command
 * const result = await run('echo', 'hello world');
 * 
 * // Command with special characters
 * const result2 = await run('git', 'commit', '-m', 'feat: add new feature!');
 * 
 * // Command with file paths
 * const result3 = await run('cp', 'source file.txt', 'destination folder/');
 * ```
 */
export async function run(cmd: string, ...args: string[]) {
  // quote the arguments if they contains spaces or special characters
  const quotedArgs = args.map(arg => containsSpecialCharacters(arg) ? `"${arg}"` : arg);
  const command = `${cmd} ${quotedArgs.join(' ')}`;

  const { stdout, stderr, exitCode } = await execAsync(command);
  if (exitCode !== 0) {
    error(stderr);
  }
  return { stdout, stderr, exitCode };
}