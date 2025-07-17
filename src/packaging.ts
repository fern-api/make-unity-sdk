import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { basename, extname, resolve } from 'node:path';
import { internalAsmDefTemplate, runtimeAsmDefTemplate } from './asmdef';
import { run } from './automation';
import { deleteFile, fileExists, pathInfo, writeTextFile } from './filesystem';
import { internalAsmDefFile, runtimeAsmDefFile } from './locations';
import { metadata } from './metadata';
import { exit } from './output';

export async function createPackageJson(packageJsonPath: string) {
  // use the metadata to create/update the package.json file
  await writeTextFile(packageJsonPath, JSON.stringify(metadata, null, 2));
}

export async function createReadme(readme: string) {
  // do not overwrite the readme if it exists
  if (await fileExists(readme)) {
    return;
  }

  await writeTextFile(readme, `# Readme file
    todo: add readme content
    `);
}

export async function createLicense(license: string) {
  // do not overwrite the license if it exists
  if (await fileExists(license)) {
    return;
  }

  await writeTextFile(license, `# License file
    todo: add license content
    `);
}

export async function createChangelog(changelog: string) {
  // do not overwrite the changelog if it exists
  if (await fileExists(changelog)) {
    return;
  }

  await writeTextFile(changelog, `# Changelog file
    todo: add changelog content
    `);
}

export async function createAsmDefFiles(internalFiles: string[], externalFiles: string[]) {
  // create the internal asmdef file
  const internalAsmDef = {
    ...await fileExists(internalAsmDefFile) ? JSON.parse(await readFile(internalAsmDefFile, 'utf8')) : internalAsmDefTemplate,
    name: `${metadata.name}.Internal`,
    precompiledReferences: internalFiles.map(each => basename(each))
  }
  await writeTextFile(internalAsmDefFile, internalAsmDef);

  let runtimeAsmDef =
  {
    ... await fileExists(runtimeAsmDefFile) ? JSON.parse(await readFile(runtimeAsmDefFile, 'utf8')) : runtimeAsmDefTemplate,
    name: metadata.name,
    // add the assembly names 
    precompiledReferences: externalFiles.map(each => basename(each)),
    references: [
      `${metadata.name}.Internal`
    ]
  }
  await writeTextFile(runtimeAsmDefFile, runtimeAsmDef);
}

export async function createMetaFiles(packageFolder: string) {
  // recursively create the meta files in the folder
  const files = await readdir(packageFolder);
  for (const file of files) {
    const path = resolve(packageFolder, file);
    const { kind, exists } = await pathInfo(path);
    if (exists && kind === "directory") {
      await createMetaFiles(path);
    }

    // remove the meta file if it exists, and we'll recreate that if it is needed
    if (extname(file) === ".meta") {
      await deleteFile(file);
      continue;
    }
    // the guid is a hash of the filename
    const hash = createHash('md5').update(file).digest('hex');

    const metaFile = resolve(packageFolder, `${file}.meta`);
    await writeTextFile(metaFile, `fileFormatVersion: 2
guid: ${hash}
          `);

  }

}

export async function packageViaNpm(packageFolder: string, targetLocation: string) {
  // package the folder via npm
  const { stdout, stderr, exitCode } = await run('npm', 'pack', packageFolder, '--pack-destination', targetLocation);
  if (exitCode !== 0) {
    return exit(`✗ Failed to package via npm: \n${stdout}\n${stderr}`);
  }

  return { stdout, stderr, exitCode };
}