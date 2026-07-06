const dns = require('dns');
const validator = require('validator');

const DNS_TIMEOUT_MS = 5000;

/**
 * Performs a DNS MX record lookup with a configurable timeout.
 * Resolves to the array of MX records, or rejects on failure/timeout.
 *
 * @param {string} domain - The domain to look up MX records for.
 * @returns {Promise<import('dns').MxRecord[]>}
 */
const resolveMxWithTimeout = (domain) => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`DNS MX lookup timed out for domain: ${domain}`));
    }, DNS_TIMEOUT_MS);

    dns.promises.resolveMx(domain)
      .then((records) => {
        clearTimeout(timer);
        resolve(records);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
};

/**
 * Validates an email address using format validation and DNS MX record lookup.
 *
 * @param {string} email - The email address to validate.
 * @returns {Promise<{ valid: boolean, message?: string }>}
 */
const validateEmail = async (email) => {
  const sanitized = (email || '').trim().toLowerCase();

  // Step 1: Validate email format
  if (!sanitized || !validator.isEmail(sanitized)) {
    return { valid: false, message: 'Please enter a valid email address.' };
  }

  // Step 2: Extract domain
  const domain = sanitized.split('@')[1];
  if (!domain) {
    return { valid: false, message: 'Please enter a valid email address.' };
  }

  // Step 3: DNS MX record lookup
  try {
    const mxRecords = await resolveMxWithTimeout(domain);

    if (mxRecords && mxRecords.length > 0) {
      return { valid: true };
    }

    return { valid: false, message: 'Please enter a valid email address.' };
  } catch (error) {
    // Log only technical details; never expose to client
    console.error(`Email validation DNS error for domain "${domain}":`, error.message);
    return { valid: false, message: 'Please enter a valid email address.' };
  }
};

module.exports = { validateEmail };
