import arcjet, {
  detectBot,
  fixedWindow,
  shield,
  validateEmail,
} from '@arcjet/node';

// Base Arcjet configuration with comprehensive protection
export const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    // Global rate limiting - 100 requests per minute per IP
    fixedWindow({
      mode: 'LIVE',
      characteristics: ['ip.src'],
      window: '60s',
      max: 100,
    }),
    // Bot detection - block automated requests
    detectBot({
      mode: 'LIVE',
      deny: ['AUTOMATED'],
    }),
    // Shield protection against common attacks
    shield({
      mode: 'LIVE',
    }),
  ],
});

// Authentication specific rules - stricter rate limiting
export const ajAuth = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    // Strict rate limiting for auth endpoints - 5 attempts per 15 minutes
    fixedWindow({
      mode: 'LIVE',
      characteristics: ['ip.src'],
      window: '15m',
      max: 5,
    }),
    // Block all bots on auth endpoints
    detectBot({
      mode: 'LIVE',
      deny: ['AUTOMATED'],
    }),
    // Email validation for sign-up
    validateEmail({
      mode: 'LIVE',
      block: ['INVALID', 'DISPOSABLE'],
    }),
    // Enhanced shield protection
    shield({
      mode: 'LIVE',
    }),
  ],
});

// API endpoints with moderate rate limiting
export const ajAPI = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    // API rate limiting - 60 requests per minute
    fixedWindow({
      mode: 'LIVE',
      characteristics: ['ip.src'],
      window: '60s',
      max: 60,
    }),
    // Block automated attacks but allow search engines
    detectBot({
      mode: 'LIVE',
      deny: ['AUTOMATED'],
    }),
    shield({
      mode: 'LIVE',
    }),
  ],
});

// Health check endpoints - very permissive
export const ajHealth = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    // Generous rate limiting for health checks
    fixedWindow({
      mode: 'LIVE',
      characteristics: ['ip.src'],
      window: '60s',
      max: 300,
    }),
    // Allow monitoring and search engine bots
    detectBot({
      mode: 'LIVE',
      allow: ['SEARCH_ENGINE', 'MONITOR'],
    }),
  ],
});