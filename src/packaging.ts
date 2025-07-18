import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { basename, extname, relative, resolve } from 'node:path';
import { bold, cyan, green, red } from './ansi';
import { internalAsmDefTemplate, runtimeAsmDefTemplate } from './asmdef';
import { run } from './automation';
import { metadata, packageFolder } from './cli';
import { copyFile, deleteFile, ensureDirectoryExists, exists, fileExists, isTextFile, pathInfo, writeTextFile } from './filesystem';
import { internalAsmDefFile, runtimeAsmDefFile } from './locations';
import { packageMetadata } from './metadata';
import { debug, error, exit, info, note } from './output';

/**
 * Creates or updates the package.json file for the Unity package.
 * 
 * This function writes the package metadata (including name, version, description,
 * etc.) to the package.json file in JSON format with proper indentation.
 * 
 * @param packageJsonPath - The path where the package.json file should be created
 * @returns A Promise that resolves when the file is written
 * 
 * @example
 * ```typescript
 * await createPackageJson('./output/package.json');
 * ```
 */
export async function createPackageJson(packageJsonPath: string) {
  // use the metadata to create/update the package.json file
  await writeTextFile(packageJsonPath, JSON.stringify(packageMetadata, null, 2));
}

/**
 * Creates a LICENSE file if it doesn't already exist.
 * 
 * This function checks if a LICENSE file exists at the specified path. If it doesn't
 * exist, it creates a basic license template. If it already exists, the function
 * does nothing to preserve existing content.
 * 
 * @param license - The path where the LICENSE file should be created
 * @returns A Promise that resolves when the file is created or skipped
 * 
 * @example
 * ```typescript
 * await createLicense('./output/LICENSE');
 * ```
 */
export async function createLicense(license: string) {
  // do not overwrite the license if it exists
  if (await fileExists(license)) {
    return;
  }

  await writeTextFile(license, `# License file
    todo: add license content
    `);
}

/**
 * Creates a CHANGELOG.md file if it doesn't already exist.
 * 
 * This function checks if a CHANGELOG file exists at the specified path. If it doesn't
 * exist, it creates a basic changelog template. If it already exists, the function
 * does nothing to preserve existing content.
 * 
 * @param changelog - The path where the CHANGELOG.md file should be created
 * @returns A Promise that resolves when the file is created or skipped
 * 
 * @example
 * ```typescript
 * await createChangelog('./output/CHANGELOG.md');
 * ```
 */
export async function createChangelog(changelog: string) {
  // do not overwrite the changelog if it exists
  if (await fileExists(changelog)) {
    return;
  }

  await writeTextFile(changelog, `# Changelog file
    todo: add changelog content
    `);
}

/**
 * Creates Unity assembly definition files for internal and runtime assemblies.
 * 
 * This function generates .asmdef files that define how Unity should handle the
 * compiled assemblies. It creates separate definitions for internal (non-public)
 * assemblies and runtime (public) assemblies, with proper references between them.
 * 
 * CURRENTLY NOT REQUIRED - Unity will give a warning if you don't have any .cs files
 * 
 * @param internalFiles - Array of internal DLL filenames
 * @param externalFiles - Array of runtime DLL filenames
 * @returns A Promise that resolves when both asmdef files are created
 * 
 */
export async function createAsmDefFiles(internalFiles: string[], externalFiles: string[]) {
  // create the internal asmdef file
  const internalAsmDef = {
    ...await fileExists(internalAsmDefFile) ? JSON.parse(await readFile(internalAsmDefFile, 'utf8')) : internalAsmDefTemplate,
    name: `${packageMetadata.name}.Internal`,
    precompiledReferences: internalFiles.map(each => basename(each))
  }
  await writeTextFile(internalAsmDefFile, internalAsmDef);

  let runtimeAsmDef =
  {
    ... await fileExists(runtimeAsmDefFile) ? JSON.parse(await readFile(runtimeAsmDefFile, 'utf8')) : runtimeAsmDefTemplate,
    name: packageMetadata.name,
    // add the assembly names 
    precompiledReferences: externalFiles.map(each => basename(each)),
    references: [
      `${packageMetadata.name}.Internal`
    ]
  }
  await writeTextFile(runtimeAsmDefFile, runtimeAsmDef);
}

/**
 * Creates a Unity .meta file for a given file path.
 * 
 * Unity uses .meta files to store metadata about assets. This function generates
 * a basic .meta file with a unique GUID based on the file's relative path from
 * the package folder. If a .meta file already exists, it will not be overwritten.
 * 
 * @param fullPath - The full path to the file that needs a .meta file
 * @returns A Promise that resolves when the .meta file is created or skipped
 * 
 * @example
 * ```typescript
 * await createMetaFile('/path/to/package/Runtime/MyScript.cs');
 * // Creates /path/to/package/Runtime/MyScript.cs.meta
 * ```
 */
export async function createMetaFile(fullPath: string) {
  const relativePath = relative(packageFolder, fullPath);
  const metaFile = `${fullPath}.meta`;

  if (await fileExists(metaFile)) {
    // don't overwrite the meta file if it already exists
    return;
  }

  // write a basic meta file
  await writeTextFile(metaFile, `
fileFormatVersion: 2
guid: ${createHash('md5').update(relativePath).digest('hex')}`);

}

/**
 * Recursively creates Unity .meta files for all files in a folder.
 * 
 * This function walks through a directory tree and creates .meta files for all
 * files that don't already have them. It also removes orphaned .meta files
 * that no longer have corresponding source files.
 * 
 * @param folder - The folder path to process recursively
 * @returns A Promise that resolves when all .meta files are processed
 * 
 * @example
 * ```typescript
 * await createMetaFiles('./output/Runtime');
 * ```
 */
export async function createMetaFiles(folder: string) {
  // recursively create the meta files in the folder
  const files = await readdir(folder);
  const metaFiles = new Set<string>(files.filter(each => extname(each) === ".meta"));
  const normalFiles = new Set<string>(files.filter(each => extname(each) !== ".meta"));

  for (const filename of normalFiles) {
    const fullPath = resolve(folder, filename);
    const { kind } = await pathInfo(fullPath);
    if (kind === "directory") {
      await createMetaFiles(fullPath);
    }

    await createMetaFile(fullPath);
    // remove the meta file from the set
    metaFiles.delete(`${filename}.meta`);
  }

  // remove the meta files that are no longer needed
  for (const metaFile of metaFiles) {
    await deleteFile(resolve(folder, metaFile));
  }
}

/**
 * Creates a .tgz package using npm pack.
 * 
 * This function uses the npm pack command to create a compressed tar.gz package
 * from the Unity package folder. The resulting package will be placed in the
 * specified target location.
 * 
 * @param packageFolder - The folder containing the Unity package to package
 * @param targetLocation - The directory where the .tgz file should be created
 * @returns A Promise that resolves with the npm pack result
 * @throws {Error} If the npm pack command fails
 * 
 * @example
 * ```typescript
 * const result = await packageViaNpm('./output', './packages');
 * console.log('Package created:', result.stderr);
 * ```
 */
export async function packageViaNpm(packageFolder: string, targetLocation: string) {
  // package the folder via npm
  const { stdout, stderr, exitCode } = await run('npm', 'pack', packageFolder, '--pack-destination', targetLocation);
  if (exitCode !== 0) {
    return exit(`✗ Failed to package via npm: \n${stdout}\n${stderr}`);
  }

  return { stdout, stderr, exitCode };
}

/** replaces ${key} with the value of the key in the data object */
function updatePlaceholders(text: string, ...data: Record<string, string>[]) {
  return text.replace(/\$\{([^}]+)\}/g, (match, p1) => data.find(d => d[p1])?.[p1] || match);
}

/**
 * Recursively copies files from a source folder to a target folder, replacing placeholders in text files.
 * 
 * This function copies all files and directories from the source to the target folder.
 * For text files, it replaces placeholder strings (${key}) with values from the metadata.
 * If a target file already exists and is a text file, it will be updated with new placeholder values.
 * 
 * @param sourceFolder - The source folder containing files to copy
 * @param targetFolder - The target folder where files should be copied
 * @returns A Promise that resolves when all files are copied and processed
 * 
 * @example
 * ```typescript
 * await updateResources('./resources', './output');
 * ```
 */
export async function updateResources(sourceFolder: string, targetFolder: string) {
  await ensureDirectoryExists(targetFolder);

  for (const name of await readdir(sourceFolder)) {
    const sourcePath = resolve(sourceFolder, name);
    const targetPath = resolve(targetFolder, name);

    const { kind } = await pathInfo(sourcePath);
    switch (kind) {
      case 'directory':
        await updateResources(sourcePath, targetPath);
        continue;

      case 'file':
        // if the target file already exists, and it is a text file, then see if it needs to be updated.
        if (await isTextFile(targetPath)) {
          const content = await readFile(targetPath, 'utf8');
          await writeTextFile(targetPath, updatePlaceholders(content, packageMetadata, metadata));
          continue;
        }

        // if the source file is a text file, then read it and create the target file
        if (await isTextFile(sourcePath)) {
          // if the file already exists, read it from the target so we can update 
          const content = await readFile(sourcePath, 'utf8');
          await writeTextFile(targetPath, updatePlaceholders(content, packageMetadata, metadata));
          continue;
        }

        // if the file already exists, skip it.
        if (await exists(targetPath)) {
          continue;
        }

        // copy the file otherwise
        await copyFile(sourcePath, targetPath);
        break;
    }
  }
}

/**
 * Verifies that all placeholder values in package files have been resolved.
 * 
 * This function recursively scans all text files in the package folder and checks
 * for any unresolved placeholder strings (${key}). If any are found, it reports
 * them as errors and suggests the command line argument to set them.
 * 
 * @param folderPath - The folder path to scan for unresolved placeholders
 * @returns A Promise that resolves when verification is complete
 * 
 * @example
 * ```typescript
 * await verifyPackageFiles('./output');
 * ```
 */
export async function verifyPackageFiles(folderPath: string) {
  // verify the files in the package
  const files = await readdir(folderPath);
  for (const file of files) {
    const filePath = resolve(folderPath, file);
    const { kind } = await pathInfo(filePath);

    if (kind === 'directory') {
      debug(`  ${note} verifying directory ${filePath}`);
      await verifyPackageFiles(filePath);
      continue;
    }

    debug(`  ${note} verifying file ${filePath}`);

    // if it is a text file, then see if there are any placeholders in it
    if (await isTextFile(filePath)) {
      const content = await readFile(filePath, 'utf8');
      // get the placeholders in the file
      const placeholders = content.match(/\$\{([^}]+?)\}/g);
      if (placeholders) {
        for (const placeholder of placeholders) {
          const key = placeholder.slice(2, -1);

          error(`  ${red('✗')} Unresolved placeholder '${red(bold(placeholder))}' found in '${cyan(filePath)}'`);
          info(`     use ${green`--${key} <value>`} to set it.`);
        }

      }
    }
  }
}