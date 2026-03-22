import assert from 'node:assert/strict'
import { execSync } from 'node:child_process'
import { writeFileSync, readFileSync, mkdtempSync, rmSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

const cli = join(__dirname, '..', 'cli.ts')
const dir = mkdtempSync(join(tmpdir(), 'hayacrypt-test-'))
const run = (cmd: string) => execSync(cmd, { encoding: 'utf8', cwd: dir })

try {
  const pass = 'my-secret'

  // --- single file round-trip ---
  const original = 'the quick brown fox jumps over the lazy dog 🦊'
  const plainFile = join(dir, 'plain.txt')
  const encFile = join(dir, 'encrypted.txt')
  const decFile = join(dir, 'decrypted.txt')

  writeFileSync(plainFile, original, 'utf8')

  run(`npx tsx ${cli} encrypt --in ${plainFile} --passphrase ${pass} --out ${encFile}`)
  assert.notEqual(readFileSync(encFile, 'utf8'), original)

  run(`npx tsx ${cli} decrypt --in ${encFile} --passphrase ${pass} --out ${decFile}`)
  assert.equal(readFileSync(decFile, 'utf8'), original)

  console.log('  single file: ok')

  // --- directory round-trip ---
  const srcDir = join(dir, 'src')
  const subDir = join(srcDir, 'nested')
  const encDir = join(dir, 'enc')
  const decDir = join(dir, 'dec')
  mkdirSync(subDir, { recursive: true })

  const files: Record<string, string> = {
    'a.txt': 'file a content',
    'b.txt': 'file b content 🔑',
    'nested/c.txt': 'deeply nested file',
  }
  for (const [name, content] of Object.entries(files)) {
    writeFileSync(join(srcDir, name), content, 'utf8')
  }

  run(`npx tsx ${cli} encrypt --in ${srcDir} --passphrase ${pass} --out ${encDir}`)

  // encrypted files should exist but differ from originals
  for (const [name, content] of Object.entries(files)) {
    const enc = readFileSync(join(encDir, name), 'utf8')
    assert.notEqual(enc, content)
  }

  run(`npx tsx ${cli} decrypt --in ${encDir} --passphrase ${pass} --out ${decDir}`)

  // decrypted files should match originals
  for (const [name, content] of Object.entries(files)) {
    assert.equal(readFileSync(join(decDir, name), 'utf8'), content)
  }

  console.log('  directory: ok')
  console.log('cli tests passed')
} finally {
  rmSync(dir, { recursive: true, force: true })
}
