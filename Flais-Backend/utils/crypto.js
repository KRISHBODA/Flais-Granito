const crypto = require('crypto');

// The encryption key must be 32 bytes (256 bits) for AES-256-GCM
// Expecting a 64-character hex string in the environment variable.
const getEncryptionKey = () => {
  const keyHex = process.env.TOTP_ENCRYPTION_KEY;
  if (!keyHex) {
    throw new Error('TOTP_ENCRYPTION_KEY environment variable is not set.');
  }
  const key = Buffer.from(keyHex, 'hex');
  if (key.length !== 32) {
    throw new Error('TOTP_ENCRYPTION_KEY must be exactly 32 bytes (64 hex characters).');
  }
  return key;
};

/**
 * Encrypts data using AES-256-GCM.
 * @param {string} text - The plaintext to encrypt.
 * @returns {string} - Base64 encoded JSON string containing iv, ciphertext, and authTag.
 */
exports.encryptData = (text) => {
  if (!text) return null;
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12); // Recommended 96-bit IV for GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  const serialized = JSON.stringify({
    iv: iv.toString('hex'),
    ciphertext: encrypted,
    authTag: authTag.toString('hex')
  });

  return Buffer.from(serialized).toString('base64');
};

/**
 * Decrypts data using AES-256-GCM.
 * @param {string} encryptedBase64 - Base64 encoded JSON string from encryptData.
 * @returns {string} - The decrypted plaintext.
 */
exports.decryptData = (encryptedBase64) => {
  if (!encryptedBase64) return null;
  try {
    const key = getEncryptionKey();
    const serialized = Buffer.from(encryptedBase64, 'base64').toString('utf8');
    const { iv, ciphertext, authTag } = JSON.parse(serialized);

    const decipher = crypto.createDecipheriv(
      'aes-256-gcm', 
      key, 
      Buffer.from(iv, 'hex')
    );
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));

    let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error("Decryption failed:", error.message);
    throw new Error("Failed to decrypt data.");
  }
};

/**
 * Hashes data using SHA-256. Useful for storing recovery codes.
 * @param {string} data - The data to hash.
 * @returns {string} - The hex encoded hash.
 */
exports.hashData = (data) => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

/**
 * Compares data with a stored hash.
 * @param {string} data - The plaintext data.
 * @param {string} hash - The stored hex hash.
 * @returns {boolean} - True if they match.
 */
exports.compareHash = (data, hash) => {
  return exports.hashData(data) === hash;
};
