#!/usr/bin/env node

import 'source-map-support/register';

import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { green } from './ansi';
import { assets } from './assets';
import { buildSolution } from './build';
import { clean, packageFolder, packageParentFolder, rebuild, reset, showHelp, solutionFile } from './cli';
import { copyFiles, deleteDirectory, directoryEmpty, directoryExists, ensureDirectoryExists, fileExists } from './filesystem';
import { apiBinFolder, apiFolder, buildOutputFolder, changelog, internalAssemblyFolder, license, nuget, packageJson, runtimeFolder, temp } from './locations';
import { initPackageMetadata, packageMetadata } from './metadata';
import { downloadFile } from './network';
import { check, errorCount, exit, info, log } from './output';
import { createChangelog, createLicense, createMetaFiles, createPackageJson, packageViaNpm, updateResources, verifyPackageFiles } from './packaging';
import { unzip } from './unpack';

/**
 * Main entry point for the Unity SDK package creation tool.
 * 
 * This function orchestrates the entire process of creating a Unity package from a .NET solution:
 * 1. Cleans up directories if requested
 * 2. Builds the .NET solution
 * 3. Downloads and extracts NuGet dependencies
 * 4. Creates Unity package structure and metadata
 * 5. Packages the result as a .tgz file
 * 
 * @returns A Promise that resolves to a number (exit code) or undefined
 * @throws {Error} If any step in the process fails
 * 
 * @example
 * ```typescript
 * // Run the main process
 * main().then(exitCode => {
 *   if (exitCode === 0) {
 *     console.log('Package created successfully');
 *   } else {
 *     console.error('Package creation failed');
 *   }
 * });
 * ```
 */
async function main(): Promise<number | undefined> {
  try {
    // Check for help flags
    if (process.argv.includes('--help') || process.argv.includes('-h')) {
      const showDetailed = process.argv.includes('--detailed');
      showHelp(showDetailed);
      return 0;
    }

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

    if (!solutionFile) {
      return exit('No solution file provided');
    }
    // since we have a solution, we should be able to find the package project, and harvest some metadata
    await initPackageMetadata();

    if (!await fileExists(solutionFile)) {
      return exit(`Solution file '${solutionFile}' does not exist`);
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
      const { stdout, stderr, exitCode } = await buildSolution(solutionFile);
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
    await updateResources(resolve(__dirname, '..', 'resources'), packageFolder);
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

    log('> verifying package contents');

    await verifyPackageFiles(packageFolder);

    if (errorCount > 0) {
      exit("Errors encountered, package not created.");
    }

    log('> creating .tgz package');
    const { stderr } = await packageViaNpm(packageFolder, packageParentFolder);
    const filename = resolve(packageParentFolder, stderr.match(/npm notice filename:\s+(\S+)/)?.[1]!);
    info(`  ${check} Created '${filename}'`)
    log(`> UPMVERSION: ${green(packageMetadata.version)}`);
    log('> done.');
  } catch (err) {
    return exit(`${err}`);
  }
}

main();
