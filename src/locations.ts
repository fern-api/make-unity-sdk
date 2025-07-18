import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { packageFolder, solutionFile } from './cli';
import { barename } from './filesystem';
import { exit } from './output';

/**
 * The current working directory where the script is being executed.
 */
export const cwd = process.cwd();

/**
 * Temporary directory for storing intermediate files during the build process.
 * Located in the system's temp directory under 'make-unity-sdk'.
 */
export const temp = resolve(tmpdir(), './make-unity-sdk/');

/**
 * Directory for storing NuGet packages and related files.
 * Located within the temp directory.
 */
export const nuget = resolve(temp, './nuget/');

/**
 * The Runtime folder within the Unity package structure.
 * Contains the main runtime assembly and code that will be included in builds.
 */
export const runtimeFolder = resolve(packageFolder, './Runtime/');

/**
 * The main runtime assembly definition file.
 * Defines the primary assembly for the Unity package.
 */
export const runtimeAsmDefFile = resolve(runtimeFolder, './Runtime.asmdef');

/**
 * The Internal folder within the Runtime directory.
 * Contains internal assemblies that are not exposed to the public API.
 */
export const internalAssemblyFolder = resolve(runtimeFolder, './Internal/');

/**
 * The internal assembly definition file.
 * Defines the internal assembly for non-public code.
 */
export const internalAsmDefFile = resolve(internalAssemblyFolder, './Internal.asmdef');

/**
 * The package.json file path within the Unity package.
 * Contains metadata about the Unity package.
 */
export const packageJson = resolve(packageFolder, './package.json');

/**
 * The README.md file path within the Unity package.
 * Contains documentation for the package.
 */
export const readme = resolve(packageFolder, './README.md');

/**
 * The LICENSE file path within the Unity package.
 * Contains the license information for the package.
 */
export const license = resolve(packageFolder, './LICENSE');

/**
 * The CHANGELOG.md file path within the Unity package.
 * Contains the version history and changes for the package.
 */
export const changelog = resolve(packageFolder, './CHANGELOG.md');

/**
 * The Editor folder within the Unity package structure.
 * Contains Unity Editor-specific scripts and assets.
 */
export const editorFolder = resolve(packageFolder, './Editor/');

/**
 * The Tests folder within the Unity package structure.
 * Contains unit tests and test assets for the package.
 */
export const testFolder = resolve(packageFolder, './Tests/');

/**
 * The Samples folder within the Unity package structure.
 * Contains example projects and sample code (tilde suffix indicates it's not included in package).
 */
export const sampleFolder = resolve(packageFolder, './Samples~/');

/**
 * The Documentation folder within the Unity package structure.
 * Contains detailed documentation (tilde suffix indicates it's not included in package).
 */
export const documentationFolder = resolve(packageFolder, './Documentation~/');

/**
 * The Third Party Notices file path within the Unity package.
 * Contains acknowledgments for third-party libraries and dependencies.
 */
export const notices = resolve(packageFolder, './Third Party Notices.md');

// the build output should be in the <slnFolder>/<barename>/bin/release/netstandard2.0/
const slnFolder = dirname(solutionFile);
const apiName = barename(solutionFile);
if (!apiName) {
  exit(`✗ Failed to determine API name: '${solutionFile}'`);
}

/**
 * The API folder path derived from the solution file name.
 * This is where the compiled .NET API will be located.
 */
export const apiFolder = resolve(slnFolder, apiName);

/**
 * The bin folder within the API directory.
 * Contains the compiled binaries and build artifacts.
 */
export const apiBinFolder = resolve(apiFolder, 'bin');

/**
 * The final build output folder for the .NET API.
 * Contains the release build targeting .NET Standard 2.0.
 */
export const buildOutputFolder = resolve(apiBinFolder, 'release', 'netstandard2.0');
