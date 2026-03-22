import { randomBytes, scryptSync, createCipheriv, createDecipheriv } from 'node:crypto'

const toB64 = (v: Buffer) => v.toString('base64url')
const fromB64 = (v: string) => Buffer.from(v, 'base64url')

export function encryptString(plain: string, passcode: string): string {
  const salt = randomBytes(16)
  const iv = randomBytes(12)
  const key = scryptSync(passcode, salt, 32)
  const cipher = createCipheriv('aes-256-gcm', key, iv)
  const ciphertext = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return [toB64(salt), toB64(iv), toB64(tag), toB64(ciphertext)].join('.')
}

export function decryptString(payload: string, passcode: string): string {
  const [saltB64, ivB64, tagB64, ciphertextB64] = payload.split('.')
  if (saltB64 === undefined || ivB64 === undefined || tagB64 === undefined || ciphertextB64 === undefined) throw new Error('Invalid payload')
  const salt = fromB64(saltB64)
  const iv = fromB64(ivB64)
  const tag = fromB64(tagB64)
  const ciphertext = fromB64(ciphertextB64)
  const key = scryptSync(passcode, salt, 32)
  const decipher = createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(tag)
  const plain = Buffer.concat([decipher.update(ciphertext), decipher.final()])
  return plain.toString('utf8')
}
