import AdmZip from 'adm-zip';
import { writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { directoryExists, ensureDirectoryExists, fileExists } from './filesystem';
import { error, info, verbose } from './output';

function matchesPattern(filePath: string, pattern: string): boolean {
  // Convert glob pattern to regex
  const regexPattern = pattern
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.');

  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(filePath);
}

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
          verbose(`  ✓ Skipped '${outputPath}' - file exists`);
          continue;
        }

        try {
          const fileData = entry.getData();
          await writeFile(outputPath, fileData);
          info(`  ✓ Extracted ${fileName}`);
          extractedCount++;
        } catch (err) {
          error(`  ✗ Failed to extract ${fileName}:`, err);
          throw err;
        }
      }
    }

  } catch (err) {
    error(`Failed to extract files from ${zipPath}:`, err);
    throw err;
  }
}