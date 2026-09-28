import crypto from 'crypto';

// AES-256-GCM field-level encryption for sensitive data at rest (bank account
// numbers). Key must be a 32-byte value provided as base64 or hex in
// BANKING_ENCRYPTION_KEY. Generate one with: openssl rand -base64 32

function getKey() {
  const raw = process.env.BANKING_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error('BANKING_ENCRYPTION_KEY is not configured on the server.');
  }
  const key = raw.length === 44 && raw.endsWith('=')
    ? Buffer.from(raw, 'base64')
    : Buffer.from(raw, 'hex');
  if (key.length !== 32) {
    throw new Error('BANKING_ENCRYPTION_KEY must decode to exactly 32 bytes (base64 or hex).');
  }
  return key;
}

// Returns "iv:authTag:ciphertext" (all base64) for storage in a single TEXT column.
export function encryptField(plaintext) {
  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(String(plaintext), 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv.toString('base64'), authTag.toString('base64'), ciphertext.toString('base64')].join(':');
}

export function decryptField(encoded) {
  const key = getKey();
  const [ivB64, tagB64, dataB64] = String(encoded).split(':');
  if (!ivB64 || !tagB64 || !dataB64) {
    throw new Error('Malformed encrypted field.');
  }
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(ivB64, 'base64'));
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(dataB64, 'base64')),
    decipher.final(),
  ]);
  return plaintext.toString('utf8');
}
