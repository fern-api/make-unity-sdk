import { run } from './automation';


export async function buildSolution(slnPath: string) {
  const result = await run('dotnet', 'build', '-c', 'release', slnPath);
  if (result.exitCode !== 0) {
    throw new Error(`Failed to build solution: ${result.stderr}`);
  }
  return result;
}