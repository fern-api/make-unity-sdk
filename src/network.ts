import { createWriteStream } from 'node:fs';
import { basename } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { cyan } from './ansi';
import { fileExists } from './filesystem';
import { check, cross, info, verbose } from './output';

/**
 * Downloads a file from a URL to a local target path.
 * 
 * This function downloads a file using the Fetch API and streams it directly to the
 * target file. It includes built-in checks to avoid re-downloading existing files
 * and provides detailed logging of the download process.
 * 
 * @param url - The URL of the file to download
 * @param target - The local file path where the downloaded file should be saved
 * @returns A Promise that resolves when the download is complete
 * @throws {Error} If the download fails, the response has no body, or the file cannot be written
 * 
 * @example
 * ```typescript
 * try {
 *   await downloadFile('https://example.com/file.zip', './downloads/file.zip');
 *   console.log('Download completed successfully');
 * } catch (error) {
 *   console.error('Download failed:', error.message);
 * }
 * ```
 */
export async function downloadFile(url: string, target: string): Promise<void> {
  if (!await fileExists(target)) {
    const filename = basename(target);
    // use fetch to download the package and stream it to the target file
    const response = await fetch(url);
    if (!response.body) {
      throw new Error(`  ${cross} No response body for ${cyan(url)}`);
    }
    const writer = createWriteStream(target);
    await pipeline(response.body, writer);
    writer.close();

    if (await fileExists(target)) {
      info(`  ${check} Downloaded '${cyan(target)}'`);
      return;
    } else {
      throw new Error(`  ${cross} Failed to download ${cyan(filename)}`);
    }
  }
  verbose(`  ${check} Skipped '${cyan(target)}' - file exists`);
}