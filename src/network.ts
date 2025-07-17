import { createWriteStream } from 'node:fs';
import { basename } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { fileExists } from './filesystem';
import { info, verbose } from './output';

export async function downloadFile(url: string, target: string): Promise<void> {
  if (!await fileExists(target)) {
    const filename = basename(target);
    // use fetch to download the package and stream it to the target file
    const response = await fetch(url);
    if (!response.body) {
      throw new Error(`No response body for ${url}`);
    }
    const writer = createWriteStream(target);
    await pipeline(response.body, writer);
    writer.close();

    if (await fileExists(target)) {
      info(`  ✓ Downloaded ${target}`);
      return;
    } else {
      throw new Error(`Failed to download ${filename}`);
    }
  }
  verbose(`  ✓ Skipped '${target}' - file exists`);
}