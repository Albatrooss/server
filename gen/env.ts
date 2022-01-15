#!/usr/bin/env ts-node-transplie-only
import fs from 'fs';
import { resolve } from 'path';
import prettier from 'prettier';

const root = resolve(__dirname, '..');
const envKeys = fs
  .readFileSync(resolve(root, '.env.example'), 'utf8')
  .trim()
  .split('\n')
  .filter(Boolean)
  .filter(line => !line.startsWith('#'))
  .map(line => line.split('=')[0])
  .filter(line => line !== '\r')
  .concat('NODE_ENV')
  .sort();

fs.writeFileSync(
  resolve(root, 'src/config/env.generated.ts'),
  prettier.format(
    /* javascript */ `
        // Automatically generated from .env.example
        export type EnvKey = ${envKeys
          .map(key => JSON.stringify(key))
          .join('|')};

        export const EnvKeys = ${JSON.stringify(envKeys)};
      `,
    { parser: 'typescript' },
  ),
);
