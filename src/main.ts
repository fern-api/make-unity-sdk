import 'source-map-support/register';

import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { assets } from './assets';
import { buildSolution } from './build';
import { clean, rebuild, reset, sln } from './cli';
import { copyFiles, deleteDirectory, directoryEmpty, directoryExists, ensureDirectoryExists, fileExists } from './filesystem';
import { apiBinFolder, apiFolder, buildOutputFolder, changelog, internalAssemblyFolder, license, nuget, packageFolder, packageJson, readme, runtimeFolder, temp } from './locations';
import { downloadFile } from './network';
import { exit, info, log } from './output';
import { createChangelog, createLicense, createMetaFiles, createPackageJson, createReadme, packageViaNpm } from './packaging';
import { unzip } from './unpack';

async function main(): Promise<number | undefined> {
  try {
    if (clean || reset) {
      log('> Cleaning up folders');
      await Promise.all([
        deleteDirectory(temp),
        deleteDirectory(packageFolder),
        deleteDirectory(apiBinFolder)
      ]);
    }

    if (reset) {
      log('> Exiting without running');
      return;
    }

    if (!sln) {
      return exit('No solution file provided');
    }

    if (!await fileExists(sln)) {
      return exit(`Solution file '${sln}' does not exist`);
    }

    // create required directories
    log('> Creating folder structure');
    await Promise.all([
      ensureDirectoryExists(temp),
      ensureDirectoryExists(packageFolder),
      ensureDirectoryExists(nuget),
      ensureDirectoryExists(runtimeFolder),
      ensureDirectoryExists(internalAssemblyFolder)
    ]);

    log('> Building solution');
    if (rebuild || await directoryEmpty(buildOutputFolder)) {
      const { stdout, stderr, exitCode } = await buildSolution(sln);
      if (exitCode !== 0) {
        return exit(`✗ Failed to build solution: \n${stdout}\n${stderr}`);
      }
    }


    if (!await directoryExists(apiFolder)) {
      return exit(`Failed to find API folder: '${apiFolder}'`);
    }

    if (!await directoryExists(buildOutputFolder)) {
      return exit(`Failed to find build output folder: '${buildOutputFolder}'`);
    }

    // copy the files in the build output to the runtime folder
    log('> Copying build output to runtime folder');
    await copyFiles(buildOutputFolder, runtimeFolder);

    // Step 1: Download all packages
    log('> Downloading NuGet packages');
    const acquisition = assets.map(async (asset) => {
      // download the package to the nuget directory
      const target = resolve(nuget, asset.filename);
      await downloadFile(asset.packageUrl, target);
      return { ...asset, target };
    });

    const downloads = await Promise.all(acquisition);

    log('> Extracting required files');
    // Step 2: Extract specified files from each package
    for (const each of downloads) {
      await unzip(each.target, each.files, internalAssemblyFolder);
    }

    log('> Creating required package assets');
    await createPackageJson(packageJson);
    await createReadme(readme);
    await createLicense(license);
    await createChangelog(changelog);

    // find all the dlls in assembly folders
    const internalDlls = (await readdir(internalAssemblyFolder)).filter(each => each.endsWith('.dll'));
    const runtimeDlls = (await readdir(runtimeFolder)).filter(each => each.endsWith('.dll'));

    // turns out asmdef files are not needed unless you have .cs files in the package. 
    // (Unity will give a warning if you don't have any .cs files)
    // await createAsmDefFiles(internalDlls, runtimeDlls);

    // must be last step before creating the npm
    await createMetaFiles(packageFolder);

    log('> creating .tgz package');
    const { stderr } = await packageViaNpm(packageFolder);
    const filename = stderr.match(/npm notice filename:\s+(\S+)/)?.[1];
    info(`  ✓ Created '${filename}'`)

    log('> done.');
  } catch (err) {
    return exit(`${err}`);
  }
}

main();
