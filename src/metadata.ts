import { existsSync, readFileSync } from 'fs';
import { clean, getValue, sln } from './cli';
import { barename } from './filesystem';
import { packageJson } from './locations';

function trim(obj: Record<string, any>) {
  for (const key in obj) {
    if (obj[key] === undefined) {
      delete obj[key];
    }
  }
  return obj;
}


function loadPackageJson(packageJsonPath: string) {
  if (!existsSync(packageJsonPath) || clean) {
    // default values before command line arguments are processed
    return {
      displayName: barename(sln),
      version: "0.0.1",
      description: "todo: add package description",
      author: "todo: add author",
      license: "todo: add license",
      changelogUrl: "todo: add changelog url",
      documentationUrl: "todo: add documentation url",
      unity: "6000.0",
    };
  }
  return JSON.parse(readFileSync(packageJsonPath, 'utf8'));
}
const company = getValue('--company');

// the package.json metadata is a combination of the package.json file and the command line arguments
export const metadata = trim({
  // load the package.json file first if it exists
  name: `com.${company}.${barename(sln)}`.toLowerCase(), // default name
  ...loadPackageJson(packageJson),
  ...trim({
    name: getValue('--name'),
    version: getValue('--version'),

    company,
    displayName: getValue('--displayName') || getValue('--display-name'),
    description: getValue('--description'),

    author: getValue('--author'),
    license: getValue('--license'),
    changelogUrl: getValue('--changelogUrl') || getValue('--changelog-url'),
    documentationUrl: getValue('--documentationUrl') || getValue('--documentation-url'),
  })
});

