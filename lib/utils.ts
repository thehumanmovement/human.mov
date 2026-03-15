import crypto from 'crypto'

export function generateCode(): string {
  return crypto.randomInt(100000, 999999).toString()
}
