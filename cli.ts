#!/usr/bin/env node
import { readFileSync, writeFileSync, statSync, mkdirSync, readdirSync } from 'node:fs'
import { join, relative } from 'node:path'
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

function walkFiles(dir: string): string[] {
  const results: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) results.push(...walkFiles(full))
    else results.push(full)
  }
  return results
}

function processFile(inPath: string, outPath: string, passphrase: string, command: string) {
  const input = readFileSync(inPath, 'utf8')
  const output = command === 'encrypt' ? encryptString(input, passphrase) : decryptString(input, passphrase)
  writeFileSync(outPath, output, 'utf8')
}

const [command] = process.argv.slice(2)
const flags = parseArgs(process.argv.slice(3))

if (!command || !['encrypt', 'decrypt'].includes(command)) {
  console.error('Usage: hayacrypt <encrypt|decrypt> --in PATH --passphrase TEXT --out PATH')
  process.exit(1)
}

const inPath = flags['in']
const passphrase = flags['passphrase']
const outPath = flags['out']

if (!inPath || !passphrase || !outPath) {
  console.error('Missing required flags: --in, --passphrase, --out')
  process.exit(1)
}

const inStat = statSync(inPath)

if (inStat.isDirectory()) {
  const files = walkFiles(inPath)
  for (const file of files) {
    const rel = relative(inPath, file)
    const dest = join(outPath, rel)
    mkdirSync(join(dest, '..'), { recursive: true })
    processFile(file, dest, passphrase, command)
  }
} else {
  processFile(inPath, outPath, passphrase, command)
}
