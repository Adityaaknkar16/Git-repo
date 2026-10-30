const crypto = require('crypto');

// Derive or retrieve 256-bit encryption key
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96-bit IV recommended for GCM
const PREFIX = 'enc:v1:';

function getEncryptionKey() {
  const secretSource = process.env.ENCRYPTION_KEY || 
                       process.env.JWT_SECRET || 
                       process.env.SESSION_SECRET || 
                       'git-visualizer-secure-fallback-encryption-key-2026';
  // Use SHA-256 to ensure exact 32 bytes (256 bits) key length
  return crypto.createHash('sha256').update(secretSource).digest();
}

/**
 * Encrypt any text, token, or object using AES-256-GCM
 * @param {string|object} data - Data to encrypt
 * @returns {string} Formatted ciphertext with IV and Auth Tag
 */
function encrypt(data) {
  if (data === null || data === undefined) return data;
  
  const text = typeof data === 'object' ? JSON.stringify(data) : String(data);
  if (!text.trim()) return text;

  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag().toString('hex');
    
    // Format: enc:v1:<iv_hex>:<authTag_hex>:<ciphertext_hex>
    return `${PREFIX}${iv.toString('hex')}:${authTag}:${encrypted}`;
  } catch (err) {
    console.error('Data Encryption Error:', err.message);
    return text;
  }
}

/**
 * Decrypt AES-256-GCM ciphertext
 * @param {string} cipherString - Encrypted string with enc:v1 prefix
 * @returns {string} Decrypted original plaintext
 */
function decrypt(cipherString) {
  if (!cipherString || typeof cipherString !== 'string') return cipherString;
  
  // If not encrypted, return as is (backwards compatible with existing plaintext data)
  if (!cipherString.startsWith(PREFIX)) return cipherString;

  try {
    const raw = cipherString.slice(PREFIX.length);
    const parts = raw.split(':');
    if (parts.length !== 3) return cipherString;

    const [ivHex, authTagHex, encryptedHex] = parts;
    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (err) {
    console.warn('Data Decryption / Integrity Verification Warning:', err.message);
    return null;
  }
}

/**
 * Blind Index (HMAC) for querying encrypted fields without decrypting the entire database
 * @param {string} value 
 * @returns {string} HMAC SHA-256 hex string
 */
function hashBlindIndex(value) {
  if (!value) return '';
  const key = getEncryptionKey();
  return crypto.createHmac('sha256', key).update(String(value).trim().toLowerCase()).digest('hex');
}

/**
 * Mask sensitive tokens to prevent accidental data leaks in logs and responses
 * @param {string} token 
 * @returns {string} e.g. ghp_1234...ef12
 */
function maskToken(token) {
  if (!token || typeof token !== 'string') return '';
  const clean = token.trim();
  if (clean.length <= 8) return '****';
  return `${clean.slice(0, 4)}...${clean.slice(-4)}`;
}

/**
 * Mask email address to protect PII
 * @param {string} email 
 * @returns {string} e.g. a***a@example.com
 */
function maskEmail(email) {
  if (!email || typeof email !== 'string' || !email.includes('@')) return email;
  const [user, domain] = email.split('@');
  if (user.length <= 2) return `${user[0]}*@${domain}`;
  return `${user[0]}***${user[user.length - 1]}@${domain}`;
}

/**
 * Redact tokens, passwords, and sensitive keys from any string or error message
 * @param {string} text 
 * @returns {string} Sanitized string
 */
function sanitizeSensitiveString(text) {
  if (typeof text !== 'string') return text;
  
  return text
    // GitHub PAT tokens
    .replace(/(ghp_[a-zA-Z0-9_]{30,40})/g, 'ghp_REDACTED_TOKEN')
    .replace(/(github_pat_[a-zA-Z0-9_]{50,100})/g, 'github_pat_REDACTED_TOKEN')
    // Generic Bearer tokens and JWTs
    .replace(/(Bearer\s+[a-zA-Z0-9._-]+)/gi, 'Bearer REDACTED_TOKEN')
    .replace(/(eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,})/g, 'REDACTED_JWT_TOKEN')
    // Database credentials in URIs
    .replace(/(mongodb(\+srv)?:\/\/[^:]+:)[^@]+(@)/gi, '$1***:***$3')
    // API keys in query params or strings
    .replace(/([?&](?:token|key|secret|apiKey)=)[^&]+/gi, '$1REDACTED');
}

module.exports = {
  encrypt,
  decrypt,
  hashBlindIndex,
  maskToken,
  maskEmail,
  sanitizeSensitiveString
};
