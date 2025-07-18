import { run } from './automation';

/**
 * Builds a .NET solution using the dotnet CLI with release configuration.
 * 
 * This function executes `dotnet build -c release` on the specified solution file.
 * It throws an error if the build fails, providing the stderr output for debugging.
 * 
 * @param slnPath - The path to the .NET solution file (.sln) to build
 * @returns A Promise that resolves with the build result containing stdout, stderr, and exit code
 * @throws {Error} If the build process fails with a non-zero exit code
 * 
 * @example
 * ```typescript
 * try {
 *   const result = await buildSolution('./MyProject.sln');
 *   console.log('Build successful:', result.stdout);
 * } catch (error) {
 *   console.error('Build failed:', error.message);
 * }
 * ```
 */
export async function buildSolution(slnPath: string) {
  const result = await run('dotnet', 'build', '-c', 'release', slnPath);
  if (result.exitCode !== 0) {
    throw new Error(`Failed to build solution: ${result.stderr}`);
  }
  return result;
}