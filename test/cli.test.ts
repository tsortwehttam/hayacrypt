import assert from 'node:assert/strict'
import { execSync } from 'node:child_process'
import { writeFileSync, readFileSync, mkdtempSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

const dir = mkdtempSync(join(tmpdir(), 'hayacrypt-test-'))
const run = (cmd: string) => execSync(cmd, { encoding: 'utf8', cwd: dir })

try {
  const original = 'the quick brown fox jumps over the lazy dog 🦊'
  const pass = 'my-secret'
  const plainFile = join(dir, 'plain.txt')
  const encFile = join(dir, 'encrypted.txt')
  const decFile = join(dir, 'decrypted.txt')

  writeFileSync(plainFile, original, 'utf8')

  // encrypt
  run(`npx tsx ${join(__dirname, '..', 'cli.ts')} encrypt --infile ${plainFile} --passphrase ${pass} --outfile ${encFile}`)
  const encrypted = readFileSync(encFile, 'utf8')
  assert.notEqual(encrypted, original)

  // decrypt
  run(`npx tsx ${join(__dirname, '..', 'cli.ts')} decrypt --infile ${encFile} --passphrase ${pass} --outfile ${decFile}`)
  const decrypted = readFileSync(decFile, 'utf8')
  assert.equal(decrypted, original)

  console.log('cli tests passed')
} finally {
  rmSync(dir, { recursive: true, force: true })
}
