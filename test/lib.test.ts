import assert from 'node:assert/strict'
import { encryptString, decryptString } from '../lib.ts'

// round-trip
const plain = 'hello world 🔐'
const pass = 'test-passphrase'
const encrypted = encryptString(plain, pass)
assert.equal(decryptString(encrypted, pass), plain)

// format: 4 base64url segments separated by dots
assert.equal(encrypted.split('.').length, 4)

// wrong passphrase throws
assert.throws(() => decryptString(encrypted, 'wrong'))

// empty string round-trips
assert.equal(decryptString(encryptString('', pass), pass), '')

console.log('lib tests passed')
