import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const getDistPath = () => {
  const filename = fileURLToPath(import.meta.url);

  return dirname(filename);
};

export const getPkgJsonPath = () => join(getDistPath(), '..', '..', 'package.json');

interface PackageJson {
  version: string;
}

export const getGhxPkgJson = () => {
  return JSON.parse(readFileSync(getPkgJsonPath(), 'utf8')) as PackageJson;
};
