import { dirname, resolve } from 'node:path';
import { sln } from './cli';
import { barename } from './filesystem';
import { exit } from './output';

export const cwd = process.cwd();

export const temp = resolve(cwd, './temp/');
export const nuget = resolve(temp, './nuget/');

export const packageFolder = resolve(cwd, './output/');
export const runtimeFolder = resolve(packageFolder, './Runtime/');
export const runtimeAsmDefFile = resolve(runtimeFolder, './Runtime.asmdef');
export const internalAssemblyFolder = resolve(runtimeFolder, './Internal/');
export const internalAsmDefFile = resolve(internalAssemblyFolder, './Internal.asmdef');
export const packageJson = resolve(packageFolder, './package.json');
export const readme = resolve(packageFolder, './README.md');
export const license = resolve(packageFolder, './LICENSE');
export const changelog = resolve(packageFolder, './CHANGELOG.md');
export const editorFolder = resolve(packageFolder, './Editor/');
export const testFolder = resolve(packageFolder, './Tests/');
export const sampleFolder = resolve(packageFolder, './Samples~/');
export const documentationFolder = resolve(packageFolder, './Documentation~/');
export const notices = resolve(packageFolder, './Third Party Notices.md');

// the build output should be in the <slnFolder>/<barename>/bin/release/netstandard2.0/
const slnFolder = dirname(sln);
const apiName = barename(sln);
if (!apiName) {
  exit(`✗ Failed to determine API name: '${sln}'`);
}
export const apiFolder = resolve(slnFolder, apiName);
export const apiBinFolder = resolve(apiFolder, 'bin');
export const buildOutputFolder = resolve(apiBinFolder, 'release', 'netstandard2.0');
