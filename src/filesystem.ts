import { copyFile as copy, mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { basename, extname, resolve } from 'node:path';
import { debug, error, info } from './output';

export function barename(filePath: string) {
  return basename(filePath, extname(filePath));
}

export async function ensureDirectoryExists(dirPath: string): Promise<void> {
  if (await directoryExists(dirPath)) {
    debug(` ✓ '${dirPath}' exists`);
    return;
  }

  try {
    await mkdir(dirPath, { recursive: true });
    debug(` ✓ Created '${dirPath}'`);
  } catch (err) {
    error(`Failed to create directory ${dirPath}:`, err);
    throw err;
  }
}

export async function pathInfo(path: string) {
  try {
    const stats = await stat(path);
    return { kind: stats.isFile() ? "file" : stats.isDirectory() ? "directory" : undefined, exists: true, isSymbolicLink: stats.isSymbolicLink() };
  } catch (err) {
    return { kind: undefined, exists: false, isSymbolicLink: false };
  }
}

export async function exists(path: string): Promise<boolean> {
  try {
    return !! await stat(path);
  } catch (err) {
    return false;
  }
}

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    return (await stat(filePath))?.isFile();
  } catch (err) {
    return false;
  }
}

export async function directoryExists(dirPath: string): Promise<boolean> {
  try {
    return (await stat(dirPath))?.isDirectory();
  } catch (err) {
    return false;
  }
}

export async function directoryEmpty(dirPath: string): Promise<boolean> {
  if (await directoryExists(dirPath)) {
    const files = await readdir(dirPath);
    return files.length === 0;
  }
  return true;
}

export async function deleteDirectory(dirPath: string): Promise<void> {
  try {
    const { kind, exists } = await pathInfo(dirPath);
    if (exists) {
      switch (kind) {
        case "directory":
          await rm(dirPath, { recursive: true });
          debug(` ✓ Deleted '${dirPath}'`);
          break;
        case "file":
          throw new Error(`Path '${dirPath}' is a file, not a directory`);
        default:
          throw new Error(`Path '${dirPath}' exists, but is not a file or directory`);
      }
    }
  } catch (err) {
    if (await exists(dirPath)) {
      error(`Failed to delete directory '${dirPath}':`, err);
      throw err;
    }
    // ignore if the path does not exist at this point
  }
}

export async function deleteFile(filePath: string): Promise<void> {
  try {
    const { kind, exists } = await pathInfo(filePath);
    if (exists) {
      switch (kind) {
        case "file":
          await rm(filePath);
          debug(` ✓ Deleted '${filePath}'`);
          break;
        case "directory":
          throw new Error(`Path '${filePath}' is a directory, not a file`);
        default:
          throw new Error(`Path '${filePath}' exists, but is not a file or directory`);
      }
    }
  } catch (err) {
    if (await exists(filePath)) {
      error(`Failed to delete file '${filePath}':`, err);
      throw err;
    }
    // ignore if the path does not exist at this point
  }
}

export async function compareFiles(sourcePath: string, targetPath: string) {
  const source = readFile(sourcePath, 'binary');
  const target = readFile(targetPath, 'binary');
  return await source === await target;
}

export async function copyFile(sourcePath: string, targetPath: string) {
  if (await fileExists(targetPath)) {
    const source = readFile(sourcePath, 'binary');
    const target = readFile(targetPath, 'binary');
    if (await source === await target) {
      debug(` ✓ '${sourcePath}' unchanged.`);
      return;
    }

    await copy(sourcePath, targetPath);
    info(` ✓ Replaced '${sourcePath}' with '${targetPath}'`);
    return;
  }


  await copy(sourcePath, targetPath);
  info(` ✓ Copied '${sourcePath}' to '${targetPath}'`);
}

export async function copyFiles(sourcePath: string, targetDirectory: string) {

  const { kind, exists } = await pathInfo(sourcePath);

  if (exists) {

    if (!await directoryExists(targetDirectory)) {
      throw new Error(`Target directory '${targetDirectory}' does not exist`);
    }

    switch (kind) {
      case "file":
        const targetFilename = resolve(targetDirectory, basename(sourcePath));
        await copyFile(sourcePath, targetFilename);
        break;

      case "directory":
        debug('  ✓ copying directory', sourcePath, targetDirectory);
        for (const file of await readdir(sourcePath)) {
          const source = resolve(sourcePath, file);
          const target = resolve(targetDirectory, file);
          await copyFile(source, target);
        }
        break;
      default:
        throw new Error(`Path '${sourcePath}' is not a file or directory`);
    }
  }
}

export async function writeTextFile(filePath: string, content: string | Record<string, any>) {
  if (typeof content !== "string") {
    content = JSON.stringify(content, null, 2);
  }

  // if there is an existing file, read it and compare the content
  if (await fileExists(filePath)) {
    const existing = await readFile(filePath, 'utf8');
    if (existing === content) {
      debug(`  ✓ '${filePath}' unchanged.`);
      return;
    }
    await writeFile(filePath, content);
    info(`  ✓ Updated '${filePath}'`);
    return;
  }

  // write the file out to disk 
  await writeFile(filePath, content);
  info(`  ✓ Created '${filePath}'`);
}
