import { resolve } from 'node:path';
import { run } from './automation';

/**
 * Builds a .NET solution using the dotnet CLI with Release configuration.
 * 
 * This function executes `dotnet build -c Release` on the specified solution file.
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
  const result = await run('dotnet', 'build', '-c', 'Release', '--framework', 'netstandard2.0', slnPath);
  if (result.exitCode !== 0) {
    throw new Error(`Failed to build solution: ${result.stderr}`);
  }
  return result;
}

/**
 * Retrieves and analyzes all projects within a .NET solution file.
 * 
 * This function parses the solution file to extract project information and then
 * analyzes each project file to determine its properties including whether it's
 * a test project, its package URL, and version information.
 * 
 * @param slnPath - The path to the .NET solution file (.sln) to analyze
 * @returns A Promise that resolves to an array of project objects containing:
 *   - csprojFile: Full path to the project file
 *   - isValid: Whether the project could be successfully parsed
 *   - isTestProject: Whether this is a test project (based on IsTestProject property)
 *   - packageProjectUrl: The package project URL if available
 *   - version: The project version if available
 * @throws {Error} If the solution file cannot be listed or parsed
 * 
 * @example
 * ```typescript
 * try {
 *   const projects = await getProjects('./MySolution.sln');
 *   projects.forEach(project => {
 *     if (project.isValid && !project.isTestProject) {
 *       console.log(`Main project: ${project.csprojFile}, Version: ${project.version}`);
 *     }
 *   });
 * } catch (error) {
 *   console.error('Failed to get projects:', error.message);
 * }
 * ```
 */
export async function getProjects(slnPath: string) {
  // Execute 'dotnet sln list' to get all projects in the solution
  const result = await run('dotnet', 'sln', slnPath, 'list');
  if (result.exitCode !== 0) {
    throw new Error(`Failed to list projects: ${result.stderr}`);
  }

  // Parse the output: skip first 2 lines (header), then process each project
  // resolve the full paths of the project files and get the properties for each one
  return await Promise.all(result.stdout.trim().split('\n').slice(2).map(async (each) => {
    // Construct the full path to the project file relative to the solution
    const csprojFile = resolve(slnPath, '..', each);

    // Use MSBuild to extract specific properties from the project file
    const { exitCode, stdout } = await run('dotnet', 'msbuild', csprojFile, '--getProperty:IsTestProject,PackageProjectUrl,Version');

    // If MSBuild fails, return an invalid project object
    if (exitCode) {
      return {
        csprojFile,
        isValid: false,
        isTestProject: false,
        packageProjectUrl: '',
        version: ''
      }
    }

    // Parse the MSBuild JSON output to extract properties
    const { Properties } = JSON.parse(stdout);
    return {
      csprojFile,
      isValid: true,
      isTestProject: Properties.IsTestProject === 'true',
      packageProjectUrl: Properties.PackageProjectUrl,
      version: Properties.Version
    };
  }));
}

/**
 * Extracts SDK properties from the main project in a .NET solution.
 * 
 * This function filters the solution's projects to find the primary SDK project
 * (excluding test projects) and returns its properties. It ensures there is exactly
 * one valid main project in the solution.
 * 
 * @param slnPath - The path to the .NET solution file (.sln) to analyze
 * @returns A Promise that resolves to the SDK project object containing:
 *   - csprojFile: Full path to the main project file
 *   - isValid: Always true for returned projects
 *   - isTestProject: Always false for returned projects
 *   - packageProjectUrl: The package project URL
 *   - version: The project version
 * @throws {Error} If no valid projects are found, multiple valid projects are found,
 *                 or if the solution cannot be parsed
 * 
 * @example
 * ```typescript
 * try {
 *   const sdkProps = await getSDKProperties('./MySolution.sln');
 *   console.log(`SDK Project: ${sdkProps.csprojFile}`);
 *   console.log(`Version: ${sdkProps.version}`);
 *   console.log(`Package URL: ${sdkProps.packageProjectUrl}`);
 * } catch (error) {
 *   console.error('Failed to get SDK properties:', error.message);
 * }
 * ```
 */
export async function getSDKProperties(slnPath: string) {
  // Get all projects and filter to find the main SDK project
  // filter out any projects that have a "IsTestProject" property
  const projects = (await getProjects(slnPath)).filter(project =>
    project.isValid &&
    !project.isTestProject &&
    project.packageProjectUrl &&
    project.version
  );

  // Ensure exactly one valid main project exists
  switch (projects.length) {
    case 0:
      throw new Error('No valid projects found');
    case 1:
      return projects[0];
    default:
      throw new Error('Multiple valid projects found');
  }

}