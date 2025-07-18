import AdmZip from 'adm-zip';
import { writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { cyan } from './ansi';
import { directoryExists, ensureDirectoryExists, fileExists } from './filesystem';
import { check, cross, error, info, verbose } from './output';

/**
 * Checks if a file path matches a glob pattern.
 * 
 * This function converts a glob pattern (using * and ? wildcards) to a regular
 * expression and tests if the given file path matches the pattern.
 * 
 * @param filePath - The file path to test against the pattern
 * @param pattern - The glob pattern to match against (supports * and ? wildcards)
 * @returns True if the file path matches the pattern, false otherwise
 * 
 * @example
 * ```typescript
 * matchesPattern('file.txt', '*.txt'); // true
 * matchesPattern('image.jpg', '*.png'); // false
 * matchesPattern('test.js', 'test.*'); // true
 * matchesPattern('config.json', 'config.???.json'); // false
 * ```
 */
function matchesPattern(filePath: string, pattern: string): boolean {
  // Convert glob pattern to regex
  const regexPattern = pattern
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.');

  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(filePath);
}

/**
 * Extracts files from a ZIP archive that match a specific pattern.
 * 
 * This function opens a ZIP file and extracts only the files that match the
 * specified glob pattern. It provides detailed logging of the extraction process
 * and skips files that already exist in the target directory.
 * 
 * @param zipPath - The path to the ZIP file to extract from
 * @param pattern - The glob pattern to match files for extraction (e.g., '*.dll', 'lib/*.so')
 * @param outputDir - The directory where matching files should be extracted
 * @returns A Promise that resolves when extraction is complete
 * @throws {Error} If the ZIP file cannot be read or files cannot be written
 * 
 * @example
 * ```typescript
 * // Extract all DLL files
 * await unzip('package.zip', '*.dll', './output/');
 * 
 * // Extract files from a specific directory
 * await unzip('package.zip', 'lib/*.so', './libs/');
 * 
 * // Extract files with specific extension
 * await unzip('package.zip', '*.json', './config/');
 * ```
 */
export async function unzip(zipPath: string, pattern: string, outputDir: string) {
  try {
    const zip = new AdmZip(zipPath);
    const zipEntries = zip.getEntries();

    // Ensure output directory exists
    if (!await directoryExists(outputDir)) {
      await ensureDirectoryExists(outputDir);
    }

    let extractedCount = 0;

    for (const entry of zipEntries) {
      if (entry.isDirectory) continue;

      const entryPath = entry.entryName.replace(/\\/g, '/'); // Normalize path separators

      // Check if this file matches any of our patterns
      const matchesAnyPattern = matchesPattern(entryPath, pattern);

      if (matchesAnyPattern) {
        const fileName = basename(entryPath);
        const outputPath = join(outputDir, fileName);

        if (await fileExists(outputPath)) {
          verbose(`  ${check} Skipped '${cyan(outputPath)}' - file exists`);
          continue;
        }

        try {
          const fileData = entry.getData();
          await writeFile(outputPath, fileData);
          info(`  ${check} Extracted '${cyan(outputPath)}'`);
          extractedCount++;
        } catch (err) {
          error(`  ${cross} Failed to extract ${cyan(fileName)}:`, err);
          throw err;
        }
      }
    }

  } catch (err) {
    error(`Failed to extract files from ${zipPath}:`, err);
    throw err;
  }
}