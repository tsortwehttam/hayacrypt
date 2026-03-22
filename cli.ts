#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs'
import { encryptString, decryptString } from './lib.js'

function parseArgs(args: string[]): Record<string, string> {
  const result: Record<string, string> = {}
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--') && i + 1 < args.length) {
      result[args[i].slice(2)] = args[i + 1]
      i++
    }
  }
  return result
}

const [command] = process.argv.slice(2)
const flags = parseArgs(process.argv.slice(3))

if (!command || !['encrypt', 'decrypt'].includes(command)) {
  console.error('Usage: hayacrypt <encrypt|decrypt> --infile PATH --passphrase TEXT --outfile PATH')
  process.exit(1)
}

const { infile, passphrase, outfile } = flags
if (!infile || !passphrase || !outfile) {
  console.error('Missing required flags: --infile, --passphrase, --outfile')
  process.exit(1)
}

const input = readFileSync(infile, 'utf8')

if (command === 'encrypt') {
  writeFileSync(outfile, encryptString(input, passphrase), 'utf8')
} else {
  writeFileSync(outfile, decryptString(input, passphrase), 'utf8')
}
