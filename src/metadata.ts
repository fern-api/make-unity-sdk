import { existsSync, readFileSync } from 'fs';
import { getSDKProperties } from './build';
import { clean, metadata, solutionFile } from './cli';
import { barename } from './filesystem';
import { packageJson } from './locations';

/**
 * Removes undefined properties from an object.
 * 
 * This utility function iterates through an object and removes any properties
 * that have undefined values, returning a clean object without undefined fields.
 * 
 * @param obj - The object to clean of undefined properties
 * @returns A new object with undefined properties removed
 * 
 * @example
 * ```typescript
 * const dirty = { a: 1, b: undefined, c: 'hello' };
 * const clean = trim(dirty); // { a: 1, c: 'hello' }
 * ```
 */
function trim(obj: Record<string, any>) {
  for (const key in obj) {
    if (obj[key] === undefined) {
      delete obj[key];
    }
  }
  return obj;
}

/**
 * Loads and parses the package.json file or returns default values.
 * 
 * This function attempts to load the package.json file from the specified path.
 * If the file doesn't exist or if the --clean flag is set, it returns default
 * metadata values with placeholder strings that can be replaced later.
 * 
 * @param packageJsonPath - The path to the package.json file to load
 * @returns An object containing package metadata, either from the file or default values
 * 
 * @example
 * ```typescript
 * const metadata = loadPackageJson('./package.json');
 * console.log(metadata.name); // Either from file or default
 * ```
 */
function loadPackageJson(packageJsonPath: string) {
  if (!existsSync(packageJsonPath) || clean) {
    // default values before command line arguments are processed
    return {
      name: `com.${metadata.company || "${company}"}.${barename(solutionFile)}`.toLowerCase(),
      displayName: barename(solutionFile),
      version: "0.0.1",
      description: "${description}",
      author: "${author}",
      license: "${license}",
      changelogUrl: "${changelogUrl}",
      documentationUrl: "${documentationUrl}",
      unity: "6000.0",
    };
  }
  return JSON.parse(readFileSync(packageJsonPath, 'utf8'));
}

/**
 * The final package metadata combining file data and command line arguments.
 * 
 * This object represents the complete package metadata after merging the
 * package.json file contents with any command line arguments that override
 * the file values. Undefined values are automatically removed.
 * 
 * The metadata includes standard Unity package fields like name, version,
 * company, displayName, description, author, license, and URLs.
 */
export let packageMetadata: Record<string, any> = {};

/**
 * Initializes and populates the package metadata by merging multiple sources.
 * 
 * This function orchestrates the creation of the final package metadata by:
 * 1. Extracting SDK properties from the .NET solution (version, project info)
 * 2. Loading existing package.json file (if it exists and --clean is not set)
 * 3. Merging command line arguments that override file values
 * 4. Applying default values for missing fields
 * 5. Cleaning up undefined properties
 * 
 * The function prioritizes values in this order:
 * 1. Command line arguments (highest priority)
 * 2. SDK properties from .csproj file (for version)
 * 3. Existing package.json file values
 * 4. Default placeholder values (lowest priority)
 * 
 * @returns A Promise that resolves when the package metadata has been initialized
 * @throws {Error} If the SDK properties cannot be extracted from the solution file
 * 
 * @example
 * ```typescript
 * try {
 *   await initPackageMetadata();
 *   console.log('Package name:', packageMetadata.name);
 *   console.log('Version:', packageMetadata.version);
 *   console.log('Company:', packageMetadata.company);
 * } catch (error) {
 *   console.error('Failed to initialize package metadata:', error.message);
 * }
 * ```
 */
export async function initPackageMetadata() {
  // Extract SDK properties from the .NET solution file
  // This provides version information and validates the solution structure
  const sdkProperties = await getSDKProperties(solutionFile);

  // Merge all metadata sources with proper precedence
  packageMetadata = trim({
    // Start with existing package.json file (if it exists and --clean is not set)
    ...loadPackageJson(packageJson),

    // Override with command line arguments and SDK properties
    ...trim({
      name: metadata.name,
      // the version will be always overridden with the command line or what is in the SDK .csproj file.
      version: metadata.version || sdkProperties.version,

      company: metadata.company,
      displayName: metadata.displayName,
      description: metadata.description,

      author: metadata.author,
      license: metadata.license,
      changelogUrl: metadata.changelogUrl,
      documentationUrl: metadata.documentationUrl,
    })
  });
}


