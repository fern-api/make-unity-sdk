import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { sln, targetFolder } from './cli';
import { barename } from './filesystem';
import { exit } from './output';

export const cwd = process.cwd();

export const temp = resolve(tmpdir(), './make-unity-sdk/');
export const nuget = resolve(temp, './nuget/');


export const runtimeFolder = resolve(targetFolder, './Runtime/');
export const runtimeAsmDefFile = resolve(runtimeFolder, './Runtime.asmdef');
export const internalAssemblyFolder = resolve(runtimeFolder, './Internal/');
export const internalAsmDefFile = resolve(internalAssemblyFolder, './Internal.asmdef');
export const packageJson = resolve(targetFolder, './package.json');
export const readme = resolve(targetFolder, './README.md');
export const license = resolve(targetFolder, './LICENSE');
export const changelog = resolve(targetFolder, './CHANGELOG.md');
export const editorFolder = resolve(targetFolder, './Editor/');
export const testFolder = resolve(targetFolder, './Tests/');
export const sampleFolder = resolve(targetFolder, './Samples~/');
export const documentationFolder = resolve(targetFolder, './Documentation~/');
export const notices = resolve(targetFolder, './Third Party Notices.md');

// the build output should be in the <slnFolder>/<barename>/bin/release/netstandard2.0/
const slnFolder = dirname(sln);
const apiName = barename(sln);
if (!apiName) {
  exit(`✗ Failed to determine API name: '${sln}'`);
}
export const apiFolder = resolve(slnFolder, apiName);
export const apiBinFolder = resolve(apiFolder, 'bin');
export const buildOutputFolder = resolve(apiBinFolder, 'release', 'netstandard2.0');
