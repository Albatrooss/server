#!/usr/bin/env ts-node-transplie-only
import fs from 'fs';
import { resolve } from 'path';
import prettier from 'prettier';

const root = resolve(__dirname, '..');
const types = fs
  .readFileSync(resolve(root, 'types.d.ts'), 'utf8');

fs.writeFileSync(
  resolve(root, '../web/types.d.ts'),
  prettier.format(
    /* javascript */ `
        // Automatically generated from server
        
        ${types}
      `,
    { parser: 'typescript' },
  ),
);
