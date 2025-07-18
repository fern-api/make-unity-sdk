import { copyFile as copy, mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { basename, extname, resolve } from 'node:path';
import { cyan } from './ansi';
import { check, cross, debug, error, info, note } from './output';

/**
 * Extracts the base name of a file without its extension.
 * 
 * @param filePath - The full path to the file
 * @returns The file name without the extension
 * 
 * @example
 * ```typescript
 * barename('/path/to/file.txt') // returns 'file'
 * barename('document.pdf') // returns 'document'
 * ```
 */
export function barename(filePath: string) {
  return basename(filePath, extname(filePath));
}

/**
 * Ensures that a directory exists, creating it recursively if necessary.
 * 
 * This function checks if the directory already exists. If it does, it logs
 * a debug message and returns. If it doesn't exist, it creates the directory
 * and all necessary parent directories using recursive creation.
 * 
 * @param dirPath - The path to the directory to ensure exists
 * @throws {Error} If directory creation fails
 * 
 * @example
 * ```typescript
 * await ensureDirectoryExists('./output/logs');
 * // Creates ./output/logs if it doesn't exist, including ./output if needed
 * ```
 */
export async function ensureDirectoryExists(dirPath: string): Promise<void> {
  if (await directoryExists(dirPath)) {
    debug(`  ${note} '${cyan(dirPath)}' exists`);
    return;
  }

  try {
    await mkdir(dirPath, { recursive: true });
    debug(`  ${note} Created '${cyan(dirPath)}'`);
  } catch (err) {
    error(`  ${cross} Failed to create directory ${cyan(dirPath)}:`, err);
    throw err;
  }
}

/**
 * Gets information about a file system path.
 * 
 * Returns an object containing the type of the path (file, directory, or undefined),
 * whether it exists, and whether it's a symbolic link.
 * 
 * @param path - The file system path to examine
 * @returns An object with path information:
 *   - `kind`: 'file' | 'directory' | undefined
 *   - `exists`: boolean indicating if the path exists
 *   - `isSymbolicLink`: boolean indicating if the path is a symbolic link
 * 
 * @example
 * ```typescript
 * const info = await pathInfo('./some/path');
 * if (info.exists && info.kind === 'file') {
 *   console.log('Path is an existing file');
 * }
 * ```
 */
export async function pathInfo(path: string) {
  try {
    const stats = await stat(path);
    return { kind: stats.isFile() ? "file" : stats.isDirectory() ? "directory" : undefined, exists: true, isSymbolicLink: stats.isSymbolicLink() };
  } catch (err) {
    return { kind: undefined, exists: false, isSymbolicLink: false };
  }
}

/**
 * Checks if a file system path exists.
 * 
 * @param path - The file system path to check
 * @returns `true` if the path exists, `false` otherwise
 * 
 * @example
 * ```typescript
 * if (await exists('./config.json')) {
 *   console.log('Config file exists');
 * }
 * ```
 */
export async function exists(path: string): Promise<boolean> {
  try {
    return !! await stat(path);
  } catch (err) {
    return false;
  }
}

/**
 * Checks if a file exists at the specified path.
 * 
 * @param filePath - The path to the file to check
 * @returns `true` if the path exists and is a file, `false` otherwise
 * 
 * @example
 * ```typescript
 * if (await fileExists('./data.json')) {
 *   console.log('Data file exists');
 * }
 * ```
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    return (await stat(filePath))?.isFile();
  } catch (err) {
    return false;
  }
}

/**
 * Checks if a directory exists at the specified path.
 * 
 * @param dirPath - The path to the directory to check
 * @returns `true` if the path exists and is a directory, `false` otherwise
 * 
 * @example
 * ```typescript
 * if (await directoryExists('./output')) {
 *   console.log('Output directory exists');
 * }
 * ```
 */
export async function directoryExists(dirPath: string): Promise<boolean> {
  try {
    return (await stat(dirPath))?.isDirectory();
  } catch (err) {
    return false;
  }
}

/**
 * Checks if a directory is empty (contains no files or subdirectories).
 * 
 * @param dirPath - The path to the directory to check
 * @returns `true` if the directory is empty or doesn't exist, `false` if it contains files
 * 
 * @example
 * ```typescript
 * if (await directoryEmpty('./temp')) {
 *   console.log('Temp directory is empty');
 * }
 * ```
 */
export async function directoryEmpty(dirPath: string): Promise<boolean> {
  if (await directoryExists(dirPath)) {
    const files = await readdir(dirPath);
    return files.length === 0;
  }
  return true;
}

/**
 * Deletes a directory and all its contents recursively.
 * 
 * This function safely deletes a directory by first checking its type.
 * If the path is a file, it throws an error. If the directory doesn't exist,
 * it silently succeeds. If deletion fails, it throws an error.
 * 
 * @param dirPath - The path to the directory to delete
 * @throws {Error} If the path is a file or if deletion fails
 * 
 * @example
 * ```typescript
 * await deleteDirectory('./temp/output');
 * // Deletes the entire output directory and all its contents
 * ```
 */
export async function deleteDirectory(dirPath: string): Promise<void> {
  try {
    const { kind, exists } = await pathInfo(dirPath);
    if (exists) {
      switch (kind) {
        case "directory":
          await rm(dirPath, { recursive: true });
          debug(`  ${check} Deleted '${cyan(dirPath)}'`);
          break;
        case "file":
          throw new Error(`  ${cross} '${cyan(dirPath)}' is a file, not a directory`);
        default:
          throw new Error(`  ${cross} '${cyan(dirPath)}' exists, but is not a file or directory`);
      }
    }
  } catch (err) {
    if (await exists(dirPath)) {
      error(`  ${cross} Failed to delete directory '${cyan(dirPath)}':`, err);
      throw err;
    }
    // ignore if the path does not exist at this point
  }
}

/**
 * Deletes a file from the file system.
 * 
 * This function safely deletes a file by first checking its type.
 * If the path is a directory, it throws an error. If the file doesn't exist,
 * it silently succeeds. If deletion fails, it throws an error.
 * 
 * @param filePath - The path to the file to delete
 * @throws {Error} If the path is a directory or if deletion fails
 * 
 * @example
 * ```typescript
 * await deleteFile('./temp/log.txt');
 * // Deletes the log.txt file
 * ```
 */
export async function deleteFile(filePath: string): Promise<void> {
  try {
    const { kind, exists } = await pathInfo(filePath);
    if (exists) {
      switch (kind) {
        case "file":
          await rm(filePath);
          debug(`  ${check} Deleted '${cyan(filePath)}'`);
          break;
        case "directory":
          throw new Error(`  ${cross} '${cyan(filePath)}' is a directory, not a file`);
        default:
          throw new Error(`  ${cross} '${cyan(filePath)}' exists, but is not a file or directory`);
      }
    }
  } catch (err) {
    if (await exists(filePath)) {
      error(`  ${cross} Failed to delete file '${cyan(filePath)}':`, err);
      throw err;
    }
    // ignore if the path does not exist at this point
  }
}

/**
 * Compares two files for binary equality.
 * 
 * Reads both files as binary data and compares them byte-for-byte.
 * 
 * @param sourcePath - Path to the first file
 * @param targetPath - Path to the second file
 * @returns `true` if the files are identical, `false` otherwise
 * 
 * @example
 * ```typescript
 * const areIdentical = await compareFiles('./original.txt', './copy.txt');
 * if (areIdentical) {
 *   console.log('Files are identical');
 * }
 * ```
 */
export async function compareFiles(sourcePath: string, targetPath: string) {
  const source = readFile(sourcePath, 'binary');
  const target = readFile(targetPath, 'binary');
  return await source === await target;
}

/**
 * Copies a file from source to target, with intelligent handling of existing files.
 * 
 * If the target file already exists, this function compares the files first.
 * If they are identical, no copy is performed. If they differ, the target
 * is replaced with the source file.
 * 
 * @param sourcePath - Path to the source file
 * @param targetPath - Path to the target file
 * 
 * @example
 * ```typescript
 * await copyFile('./source/config.json', './target/config.json');
 * // Copies only if files are different
 * ```
 */
export async function copyFile(sourcePath: string, targetPath: string) {
  if (await fileExists(targetPath)) {
    const source = readFile(sourcePath, 'binary');
    const target = readFile(targetPath, 'binary');
    if (await source === await target) {
      debug(`  ${note} '${cyan(sourcePath)}' unchanged.`);
      return;
    }

    await copy(sourcePath, targetPath);
    info(`  ${check} Replaced '${cyan(sourcePath)}' with '${cyan(targetPath)}'`);
    return;
  }

  await copy(sourcePath, targetPath);
  info(`  ${check} Copied '${cyan(sourcePath)}' to '${cyan(targetPath)}'`);
}

/**
 * Copies files or directories from source to target directory.
 * 
 * This function can handle both individual files and entire directories.
 * For files, it copies the file to the target directory with the same name.
 * For directories, it recursively copies all files within the directory.
 * 
 * @param sourcePath - Path to the source file or directory
 * @param targetDirectory - Path to the target directory
 * @throws {Error} If the target directory doesn't exist or if the source path is invalid
 * 
 * @example
 * ```typescript
 * // Copy a single file
 * await copyFiles('./config.json', './backup/');
 * 
 * // Copy an entire directory
 * await copyFiles('./src/', './dist/');
 * ```
 */
export async function copyFiles(sourcePath: string, targetDirectory: string) {

  const { kind, exists } = await pathInfo(sourcePath);

  if (exists) {

    if (!await directoryExists(targetDirectory)) {
      throw new Error(`  ${cross} Target directory '${cyan(targetDirectory)}' does not exist`);
    }

    switch (kind) {
      case "file":
        const targetFilename = resolve(targetDirectory, basename(sourcePath));
        await copyFile(sourcePath, targetFilename);
        break;

      case "directory":
        debug(`  ${note} copying directory '${cyan(sourcePath)}' to '${cyan(targetDirectory)}'`);
        for (const file of await readdir(sourcePath)) {
          const source = resolve(sourcePath, file);
          const target = resolve(targetDirectory, file);
          await copyFile(source, target);
        }
        break;
      default:
        throw new Error(`  ${cross} Path '${cyan(sourcePath)}' is not a file or directory`);
    }
  }
}

/**
 * Writes content to a text file with intelligent change detection.
 * 
 * This function can accept either a string or an object. Objects are automatically
 * converted to JSON with pretty formatting. If the target file already exists,
 * the function compares the content and only writes if there are changes.
 * 
 * @param filePath - Path to the file to write
 * @param content - The content to write (string or object to be JSON stringified)
 * 
 * @example
 * ```typescript
 * // Write a string
 * await writeTextFile('./config.txt', 'Hello World');
 * 
 * // Write an object as JSON
 * await writeTextFile('./config.json', { port: 3000, host: 'localhost' });
 * ```
 */
export async function writeTextFile(filePath: string, content: string | Record<string, any>) {
  if (typeof content !== "string") {
    content = JSON.stringify(content, null, 2);
  }

  // if there is an existing file, read it and compare the content
  if (await fileExists(filePath)) {
    const existing = await readFile(filePath, 'utf8');
    if (existing === content) {
      debug(`  ${note} '${cyan(filePath)}' unchanged.`);
      return;
    }
    await writeFile(filePath, content);
    info(`  ${check} Updated '${cyan(filePath)}'`);
    return;
  }

  // write the file out to disk 
  await writeFile(filePath, content);
  info(`  ${check} Created '${cyan(filePath)}'`);
}

/**
 * Determines if a file is a text file by analyzing its content.
 * 
 * This function uses a two-step approach to detect text files:
 * 1. Checks for null bytes (0x00) which are common in binary files but never
 *    appear in valid UTF-8 text
 * 2. Attempts to decode the file as UTF-8 and verifies the encoding is valid
 *    by comparing the re-encoded length with the original
 * 
 * Note: This is a heuristic approach and may not be 100% accurate for all
 * edge cases, but it works well for most common scenarios.
 * 
 * @param filePath - Path to the file to analyze
 * @returns `true` if the file appears to be a valid UTF-8 text file, `false` otherwise
 * 
 * @example
 * ```typescript
 * if (await isTextFile('./data.txt')) {
 *   console.log('File is a text file');
 * } else {
 *   console.log('File is likely binary');
 * }
 * ```
 */
export async function isTextFile(filePath: string): Promise<boolean> {
  try {
    const buffer = await readFile(filePath);

    // Check for null bytes (common in binary files)
    for (let i = 0; i < buffer.length; i++) {
      if (buffer[i] === 0) {
        return false;
      }
    }

    // Try to decode as UTF-8
    const text = buffer.toString('utf8');

    // Check if the decoded text has the same byte length
    // (invalid UTF-8 sequences might get replaced)
    return Buffer.from(text, 'utf8').length === buffer.length;
  } catch {
    return false;
  }
}