import { readFileSync } from 'node:fs';
import { parse } from 'dotenv';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    // Tests run with the demo configuration from .env.example.
    env: parse(readFileSync('.env.example')),
    include: ['**/*.e2e-spec.ts'],
  },
});
