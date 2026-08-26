const crypto = require('crypto');

// Sanitize user input to prevent XSS
function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Recursively sanitize all string values in an object
function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeObject);
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null) {
      result[key] = sanitizeObject(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

// Validate email format
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Validate phone number (Nigerian format)
function isValidPhone(phone) {
  if (!phone) return true; // optional
  return /^(\+234|0)[789][01]\d{8}$/.test(phone.replace(/[\s-]/g, ''));
}

// Generate CSRF token
function generateCsrfToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Rate limit tracker (in-memory)
const rateLimits = new Map();

function rateLimit(key, windowMs = 60000, maxRequests = 30) {
  const now = Date.now();
  const entry = rateLimits.get(key) || { count: 0, resetAt: now + windowMs };

  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + windowMs;
  }

  entry.count++;
  rateLimits.set(key, entry);

  return entry.count <= maxRequests;
}

// Express middleware: sanitize request body
function sanitizeBody(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  next();
}

// Express middleware: rate limiter
function createRateLimiter(windowMs = 60000, maxRequests = 30) {
  return (req, res, next) => {
    const key = `rl:${req.ip}:${req.baseUrl}`;
    if (!rateLimit(key, windowMs, maxRequests)) {
      return res.status(429).json({ error: 'Too many requests' });
    }
    next();
  };
}

// Security headers middleware
function securityHeaders(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
}

module.exports = {
  sanitizeString,
  sanitizeObject,
  isValidEmail,
  isValidPhone,
  generateCsrfToken,
  rateLimit,
  sanitizeBody,
  createRateLimiter,
  securityHeaders,
};
