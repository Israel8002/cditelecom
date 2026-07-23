/**
 * Utility module for cleaning and extracting serial numbers from barcodes and OCR text outputs.
 */

// Blacklisted words that often appear in OCR or asset labels
const NOISE_WORDS = [
  'MADE', 'IN', 'CHINA', 'TAIWAN', 'MEXICO', 'VIETNAM',
  'MODEL', 'MODELO', 'INPUT', 'OUTPUT', 'VOLTS', 'AMPS',
  'HTTP', 'HTTPS', 'WWW', 'REV', 'REVISION', 'PART', 'NUMBER',
  'MAC', 'ADDRESS', 'FCC', 'CE', 'ROHS', 'PATENT', 'SYSTEM'
];

/**
 * Sanitizes a candidate serial string into uppercase clean format.
 */
export function cleanSerial(raw) {
  if (!raw) return '';
  return raw
    .trim()
    .replace(/[^A-Za-z0-9\-_.]/g, '')
    .toUpperCase();
}

/**
 * Parses raw text (from barcode decoder or OCR) to extract a clean Serial Number.
 * @param {string} text - Raw text from scan or OCR.
 * @returns {string|null} - Cleaned serial number or null if invalid.
 */
export function extractSerial(text) {
  if (!text || typeof text !== 'string') return null;

  const sanitizedInput = text.replace(/\r?\n/g, ' ').trim();

  // 1. Try Prefix Matching (e.g. S/N: CN123456789, SN: ABCD123456, Serial Number: FOC98765432)
  const prefixRegex = /(?:S\/N|S\/N|SN|SERIAL\s*NUMBER|SERIAL\s*NO|SERIAL|NO\.\s*SERIE|SERIE)\s*[:#=\-\s]*([A-Z0-9\-_]{4,32})/gi;
  let match = prefixRegex.exec(sanitizedInput);
  if (match && match[1]) {
    const candidate = cleanSerial(match[1]);
    if (isValidSerialCandidate(candidate)) {
      return candidate;
    }
  }

  // 2. Direct string check if it's already a clean barcode output without prefix
  const cleanDirect = cleanSerial(sanitizedInput);
  if (isValidSerialCandidate(cleanDirect)) {
    return cleanDirect;
  }

  // 3. Line-by-line or word tokens inspection for OCR outputs
  const words = sanitizedInput.split(/\s+/);
  for (let i = 0; i < words.length; i++) {
    const word = words[i];

    // Check if word starts with SN/SN: directly attached
    const prefixMatch = word.match(/^(?:S\/N|SN|SERIAL|SERIE)[:#=\-]?([A-Z0-9\-_]{4,32})/i);
    if (prefixMatch && prefixMatch[1]) {
      const candidate = cleanSerial(prefixMatch[1]);
      if (isValidSerialCandidate(candidate)) {
        return candidate;
      }
    }

    // Check standalone word
    const cleaned = cleanSerial(word);
    if (isValidSerialCandidate(cleaned)) {
      return cleaned;
    }
  }

  return null;
}

/**
 * Validates if a string matches standard telecom asset serial number heuristics.
 */
export function isValidSerialCandidate(str) {
  if (!str || typeof str !== 'string') return false;
  const upper = str.toUpperCase();

  // Serial length range (telecom equipment serials are usually 5-32 chars)
  if (upper.length < 5 || upper.length > 32) return false;

  // Rejects noise words
  if (NOISE_WORDS.some((word) => upper === word || upper.includes(word))) {
    return false;
  }

  // Must contain at least one digit or letter
  if (!/[A-Z0-9]/.test(upper)) return false;

  // Must not be all repetitive characters (e.g. "000000", "AAAAAA")
  if (/^(.)\1+$/.test(upper)) return false;

  // Rejects pure low-entropy numeric sequences shorter than 6 digits unless formatted
  if (/^\d{1,5}$/.test(upper)) return false;

  return true;
}
