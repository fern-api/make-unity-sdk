import { resolve } from 'path';
import { cwd } from 'process';
import { exit } from './output';

export function getValue(prefix: string) {
  const index = process.argv.findIndex(each => each === prefix);
  return index !== -1 ? process.argv[index + 1] : undefined;
}

export function getValues(prefix: string) {
  const index = process.argv.findIndex(each => each === prefix);
  // get all the following arguments until the next argument that starts with --
  const values = [];
  for (let i = index + 1; i < process.argv.length && !process.argv[i].startsWith('--'); i++) {
    values.push(process.argv[i]);
  }
  return values;
}


export const enableVerbose = process.argv.includes('--verbose');

export const enableDebug = process.argv.includes('--debug');

export const enableQuiet = process.argv.includes('--quiet');

// --clean: Clean up the output and temp folders before running
export const clean = process.argv.includes('--clean');

// --reset: Clean up the output and temp folders and exit
export const reset = process.argv.includes('--reset');

// --sln <slnPath> : The path to the solution file to use for the package
export const sln = getValue('--sln') || exit('No solution file provided (--sln <slnPath>)');

// --rebuild: forcibly rebuild the solution before running
export const rebuild = process.argv.includes('--rebuild');

// --target <outputPath> : The path to the output folder where the package contents will be laid out.
export const targetFolder = resolve(cwd(), getValue('--target') || './output');

// --package <packagePath> 
export const packageParentFolder = resolve(cwd(), getValue('--package') || `${targetFolder}/..`);