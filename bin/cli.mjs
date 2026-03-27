#!/usr/bin/env node

const [major, minor] = process.versions.node.split('.').map(Number)
if (major < 23 || (major === 23 && minor < 6)) {
  console.error('@koumoul/doc requires Node.js >= 23.6.0 (native TypeScript support)')
  console.error(`Current version: ${process.version}`)
  process.exit(1)
}

import('../src/cli/index.ts')
