import { resolve } from 'path';
import { cwd } from 'process';
import { bold, cyan, green, yellow } from './ansi';
import { exit } from './output';

/**
 * Displays comprehensive help information for the Unity SDK package creation tool.
 * 
 * This function shows all available command line switches, their purposes,
 * and all known placeholders that can be used in resource files. It provides
 * detailed examples and explanations for each option.
 * 
 * @param showDetailed - Whether to show detailed placeholder information
 */
export function showHelp(showDetailed: boolean = false) {
  console.log(bold`Unity SDK Package Creation Tool`);
  console.log(`A tool for creating Unity packages from .NET solutions with NuGet dependencies.\n`);

  console.log(bold`USAGE:`);
  console.log(`  node main.js --sln <solution-file> [options]\n`);

  console.log(bold`REQUIRED ARGUMENTS:`);
  console.log(`  ${cyan`--sln <path>`}          Path to the .NET solution file (.sln) to build and package`);
  console.log(`                        Example: --sln ./MyProject.sln\n`);

  console.log(bold`OPTIONAL ARGUMENTS:`);
  console.log(`  ${cyan`--target <path>`}      Output directory for the Unity package (default: ./output)`);
  console.log(`                        Example: --target ./my-unity-package\n`);

  console.log(`  ${cyan`--package <path>`}     Parent directory for the final .tgz package (default: <target>/..)`);
  console.log(`                        Example: --package ./packages\n`);

  console.log(`  ${cyan`--rebuild`}            Force rebuild the solution even if build output exists`);
  console.log(`                        Use this when you want to ensure a fresh build\n`);

  console.log(`  ${cyan`--clean`}              Clean output and temp folders before running`);
  console.log(`                        Removes all previous build artifacts\n`);

  console.log(`  ${cyan`--reset`}              Clean output and temp folders, then exit`);
  console.log(`                        Useful for cleaning up without running the full process\n`);

  console.log(`  ${cyan`--verbose`}            Enable verbose output (moderate detail)`);
  console.log(`                        Shows additional information about the build process\n`);

  console.log(`  ${cyan`--debug`}              Enable debug output (very detailed)`);
  console.log(`                        Shows all internal operations and file operations\n`);

  console.log(`  ${cyan`--quiet`}              Suppress normal output messages`);
  console.log(`                        Only shows errors and critical information\n`);

  console.log(bold`PACKAGE METADATA ARGUMENTS:`);
  console.log(`  These arguments set metadata for the Unity package. If not provided,`);
  console.log(`  default values or placeholders will be used.\n`);

  console.log(`  ${cyan`--name <name>`}        Package name (default: derived from solution file)`);
  console.log(`                       Example: --name com.mycompany.mypackage\n`);

  console.log(`  ${cyan`--version <version>`}  Package version (default: 0.0.1)`);
  console.log(`                       Example: --version 1.2.3\n`);

  console.log(`  ${cyan`--company <company>`}  Company name for the package`);
  console.log(`                       Example: --company "My Company Inc."\n`);

  console.log(`  ${cyan`--displayName <name>`} Display name shown in Unity Package Manager`);
  console.log(`                       Example: --displayName "My Awesome Package"\n`);

  console.log(`  ${cyan`--description <text>`} Package description`);
  console.log(`                       Example: --description "A powerful Unity package for..."\n`);

  console.log(`  ${cyan`--author <author>`}    Package author`);
  console.log(`                       Example: --author "John Doe <john@example.com>"\n`);

  console.log(`  ${cyan`--license <license>`}  License type or text`);
  console.log(`                       Example: --license "MIT"\n`);

  console.log(`  ${cyan`--changelogUrl <url>`} URL to the changelog`);
  console.log(`                       Example: --changelogUrl "https://github.com/user/repo/blob/main/CHANGELOG.md"\n`);

  console.log(`  ${cyan`--documentationUrl <url>`} URL to the documentation`);
  console.log(`                       Example: --documentationUrl "https://docs.example.com"\n`);

  if (showDetailed) {
    console.log(bold`\nPLACEHOLDERS IN RESOURCE FILES:`);
    console.log(`  The following placeholders can be used in resource files (README.md, etc.)`);
    console.log(`  and will be replaced with actual values during package creation:\n`);

    console.log(`  ${yellow`\${name}`}              Package name (e.g., com.mycompany.mypackage)`);
    console.log(`  ${yellow`\${displayName}`}       Display name shown in Unity Package Manager`);
    console.log(`  ${yellow`\${version}`}           Package version`);
    console.log(`  ${yellow`\${company}`}           Company name`);
    console.log(`  ${yellow`\${description}`}       Package description`);
    console.log(`  ${yellow`\${author}`}            Package author`);
    console.log(`  ${yellow`\${license}`}           License information`);
    console.log(`  ${yellow`\${changelogUrl}`}      URL to changelog`);
    console.log(`  ${yellow`\${documentationUrl}`}  URL to documentation`);
    console.log(`  ${yellow`\${packageName}`}       Package name for OpenUPM (derived from name)`);
    console.log(`  ${yellow`\${packageScope}`}      Package scope for OpenUPM (derived from name)`);
    console.log(`  ${yellow`\${repoUrl}`}           Repository URL (if provided)`);

    console.log(bold`\nEXAMPLE RESOURCE FILES:`);
    console.log(`  README.md template:`);
    console.log(`    # \${displayName}`);
    console.log(`    ## Installing`);
    console.log(`    Requires Unity 2021.3 LTS or higher.`);
    console.log(`    \`\`\`bash`);
    console.log(`    openupm add \${name}`);
    console.log(`    \`\`\``);

    console.log(`  CHANGELOG.md template:`);
    console.log(`    # Changelog for the \${displayName} package`);
    console.log(`    ## [1.0.0] - 2024-01-01`);
    console.log(`    - Initial release`);
  }

  console.log(bold`\nEXAMPLES:`);
  console.log(`  Basic usage:`);
  console.log(`    node main.js --sln ./MyProject.sln\n`);

  console.log(`  With custom metadata:`);
  console.log(`    node main.js --sln ./MyProject.sln \\`);
  console.log(`      --name com.mycompany.mypackage \\`);
  console.log(`      --version 1.0.0 \\`);
  console.log(`      --company "My Company" \\`);
  console.log(`      --displayName "My Package" \\`);
  console.log(`      --description "A powerful Unity package" \\`);
  console.log(`      --author "John Doe <john@example.com>" \\`);
  console.log(`      --license "MIT" \\`);
  console.log(`      --changelogUrl "https://github.com/user/repo/blob/main/CHANGELOG.md" \\`);
  console.log(`      --documentationUrl "https://docs.example.com"\n`);

  console.log(`  Clean build with verbose output:`);
  console.log(`    node main.js --sln ./MyProject.sln --clean --rebuild --verbose\n`);

  console.log(`  Just clean up without building:`);
  console.log(`    node main.js --reset\n`);

  console.log(bold`\nWORKFLOW:`);
  console.log(`  1. Builds the .NET solution using 'dotnet build -c release'`);
  console.log(`  2. Downloads required NuGet packages from the assets list`);
  console.log(`  3. Extracts specific files from NuGet packages to Internal/ folder`);
  console.log(`  4. Copies build output to Runtime/ folder`);
  console.log(`  5. Creates Unity package structure with metadata files`);
  console.log(`  6. Processes resource files, replacing placeholders`);
  console.log(`  7. Creates Unity .meta files for all assets`);
  console.log(`  8. Verifies all placeholders are resolved`);
  console.log(`  9. Packages everything as a .tgz file using npm pack\n`);

  console.log(bold`OUTPUT:`);
  console.log(`  The tool creates a Unity package with the following structure:`);
  console.log(`  ${cyan`Runtime/`}           - Main runtime assemblies and code`);
  console.log(`  ${cyan`Internal/`}          - Internal assemblies (not exposed to public API)`);
  console.log(`  ${cyan`Editor/`}            - Unity Editor-specific scripts (if any)`);
  console.log(`  ${cyan`Tests/`}             - Unit tests (if any)`);
  console.log(`  ${cyan`Samples~/`}          - Example projects (not included in package)`);
  console.log(`  ${cyan`Documentation~/`}    - Documentation (not included in package)`);
  console.log(`  ${cyan`package.json`}       - Unity package metadata`);
  console.log(`  ${cyan`README.md`}          - Package documentation`);
  console.log(`  ${cyan`LICENSE`}            - License file`);
  console.log(`  ${cyan`CHANGELOG.md`}       - Version history`);
  console.log(`  ${cyan`Third Party Notices.md`} - Third-party acknowledgments\n`);

  console.log(bold`TROUBLESHOOTING:`);
  console.log(`  - Use ${cyan`--verbose`} or ${cyan`--debug`} for more detailed output`);
  console.log(`  - Use ${cyan`--clean`} to remove all previous build artifacts`);
  console.log(`  - Check that the solution file exists and builds successfully`);
  console.log(`  - Ensure all required placeholders are provided via command line arguments`);
  console.log(`  - Verify that the target directory is writable\n`);

  console.log(bold`ENVIRONMENT VARIABLES:`);
  console.log(`  ${cyan`FORCE_COLOR=0`}       Disable colored output`);
  console.log(`  ${cyan`FORCE_COLOR=1`}       Force colored output\n`);

  if (!showDetailed) {
    console.log(`Use ${green`--help --detailed`} to see placeholder information and examples.\n`);
  }

  console.log(bold`VERSION:`);
  console.log(`  Unity SDK Package Creation Tool v1.0.0\n`);
}

// load the command line arguments into a key/value object
const cliArgs = process.argv.slice(2);

/**
 * Parsed command line arguments as key-value pairs.
 * 
 * This object contains all command line arguments that were parsed from the
 * process.argv array. Arguments starting with '--' are converted to camelCase
 * keys, and their values are stored as strings, arrays, or booleans.
 */
export const metadata: Record<string, any> = {};

let key: string | undefined;
for (let i = 0; i < cliArgs.length; i++) {
  const arg = cliArgs[i];

  if (arg.startsWith('--')) {
    key = arg.slice(2);
    // if the key has dashes in it, then change it to camel case
    key = key.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());

    // Special handling for help flags
    if (key === 'help' || key === 'h') {
      metadata[key] = true;
      continue;
    }

    metadata[key] = true;
    continue;
  }

  if (arg.startsWith('-')) {
    // Special handling for short help flag
    if (arg === '-h') {
      metadata.h = true;
      continue;
    }
    exit(`Unknown command line argument: ${arg} (expected --key <value>)`);
  }

  if (key) {
    switch (typeof metadata[key]) {
      case 'undefined':
      case 'boolean':
        metadata[key] = arg;
        break;

      case 'string':
        metadata[key] = [metadata[key], arg];
        break;

      case 'object':
        metadata[key].push(arg);
        break;
    }
    continue;
  }
  // if we don't have a key, then this is not correct.
  exit(`Unknown command line argument: ${arg}`);
}

/**
 * Flag indicating whether verbose output is enabled.
 * Set to true when --verbose is provided as a command line argument.
 */
export const enableVerbose = !!metadata.verbose;

/**
 * Flag indicating whether debug output is enabled.
 * Set to true when --debug is provided as a command line argument.
 */
export const enableDebug = !!metadata.debug;

/**
 * Flag indicating whether quiet mode is enabled.
 * Set to true when --quiet is provided as a command line argument.
 */
export const enableQuiet = !!metadata.quiet;

/**
 * Flag indicating whether to clean output and temp folders before running.
 * Set to true when --clean is provided as a command line argument.
 */
export const clean = !!metadata.clean;

/**
 * Flag indicating whether to clean output and temp folders and exit.
 * Set to true when --reset is provided as a command line argument.
 */
export const reset = !!metadata.reset;

/**
 * The path to the solution file to use for the package.
 * Resolved relative to the current working directory.
 * Required argument: --sln <slnPath>
 */
export const solutionFile = metadata.sln ? resolve(cwd(), metadata.sln) : exit('No solution file provided (--sln <slnPath>)');

/**
 * Flag indicating whether to forcibly rebuild the solution before running.
 * Set to true when --rebuild is provided as a command line argument.
 */
export const rebuild = !!metadata.rebuild;

/**
 * The path to the output folder where the package contents will be laid out.
 * Resolved relative to the current working directory.
 * Optional argument: --target <outputPath> (defaults to './output')
 */
export const packageFolder = resolve(cwd(), metadata.target || './output');

/**
 * The path to the parent folder of the package.
 * Resolved relative to the current working directory.
 * Optional argument: --package <packagePath> (defaults to packageFolder parent)
 */
export const packageParentFolder = resolve(cwd(), metadata.package || `${packageFolder}/..`);