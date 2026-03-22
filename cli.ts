#!/usr/bin/env node
import { readFileSync, writeFileSync, statSync, mkdirSync, readdirSync } from 'node:fs'
import { join, relative } from 'node:path'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { encryptString, decryptString } from './lib.js'

function walkFiles(dir: string): string[] {
  const results: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) results.push(...walkFiles(full))
    else results.push(full)
  }
  return results
}

function processFile(inPath: string, outPath: string, passphrase: string, encrypt: boolean) {
  const input = readFileSync(inPath, 'utf8')
  const output = encrypt ? encryptString(input, passphrase) : decryptString(input, passphrase)
  writeFileSync(outPath, output, 'utf8')
}

function processPath(inPath: string, outPath: string, passphrase: string, encrypt: boolean) {
  if (statSync(inPath).isDirectory()) {
    for (const file of walkFiles(inPath)) {
      const dest = join(outPath, relative(inPath, file))
      mkdirSync(join(dest, '..'), { recursive: true })
      processFile(file, dest, passphrase, encrypt)
    }
  } else {
    processFile(inPath, outPath, passphrase, encrypt)
  }
}

const sharedOptions = {
  in: { type: 'string' as const, demandOption: true, describe: 'Input file or directory' },
  out: { type: 'string' as const, demandOption: true, describe: 'Output file or directory' },
  passphrase: { type: 'string' as const, demandOption: true, describe: 'Encryption passphrase' },
}

yargs(hideBin(process.argv))
  .scriptName('hayacrypt')
  .usage('$0 <command> --in PATH --passphrase TEXT --out PATH')
  .command('encrypt', 'Encrypt a file or directory', sharedOptions, (argv) => {
    processPath(argv.in!, argv.out!, argv.passphrase!, true)
  })
  .command('decrypt', 'Decrypt a file or directory', sharedOptions, (argv) => {
    processPath(argv.in!, argv.out!, argv.passphrase!, false)
  })
  .demandCommand(1, 'Specify encrypt or decrypt')
  .strict()
  .help()
  .parseSync()
