import { exec } from 'node:child_process';
import { error, verbose } from './output';

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

function containsSpecialCharacters(str: string) {
  return /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(str);
}
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