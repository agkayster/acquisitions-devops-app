#!/usr/bin/env node

/**
 * Test script to verify Arcjet protection is working
 * Run this while your server is running: node test-arcjet.js
 */

import fetch from 'node-fetch';

const PORT = process.env.PORT || 8000;
const BASE_URL = `http://localhost:${PORT}`;

async function testEndpoint(endpoint, options = {}) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': options.userAgent || 'ArcjetTestBot/1.0',
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    console.log(`${options.method || 'GET'} ${endpoint}: ${response.status} ${response.statusText}`);
    
    if (response.status === 429) {
      console.log('  ✓ Rate limiting is working!');
    } else if (response.status === 403) {
      console.log('  ✓ Bot protection or security rules are working!');
    } else if (response.status === 400 && endpoint.includes('sign-up')) {
      console.log('  ✓ Email validation might be working!');
    } else if (response.status === 200) {
      console.log('  ✓ Request allowed');
    }

    return response;
  } catch (error) {
    console.error(`Error testing ${endpoint}:`, error.message);
    return null;
  }
}

async function runTests() {
  console.log('🔍 Testing Arcjet integration...\n');

  // Test 1: Basic health check (should work)
  console.log('1. Testing health endpoint:');
  await testEndpoint('/health');

  // Test 2: API documentation (should work)
  console.log('\n2. Testing API documentation:');
  await testEndpoint('/api');

  // Test 3: Auth endpoint with suspicious user agent (might be blocked)
  console.log('\n3. Testing auth endpoint with bot user agent:');
  await testEndpoint('/api/auth/sign-up', {
    method: 'POST',
    userAgent: 'curl/7.68.0', // This might be detected as automated
    body: {
      email: 'test@example.com',
      password: 'testpassword123'
    }
  });

  // Test 4: Auth endpoint with invalid email (should be blocked)
  console.log('\n4. Testing auth endpoint with invalid email:');
  await testEndpoint('/api/auth/sign-up', {
    method: 'POST',
    userAgent: 'Mozilla/5.0 (compatible; Test)',
    body: {
      email: 'invalid-email',
      password: 'testpassword123'
    }
  });

  // Test 5: Rate limiting test (make multiple requests)
  console.log('\n5. Testing rate limiting (making 6 requests to auth endpoint):');
  for (let i = 1; i <= 6; i++) {
    console.log(`  Request ${i}:`);
    await testEndpoint('/api/auth/sign-up', {
      method: 'POST',
      userAgent: 'Mozilla/5.0 (compatible; Test)',
      body: {
        email: `test${i}@example.com`,
        password: 'testpassword123'
      }
    });
    
    if (i < 6) {
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  console.log('\n✅ Test completed! Check the logs above to see how Arcjet is protecting your endpoints.');
  console.log('\nNote: Some tests might pass if your Arcjet key is in test mode or if the specific rules are not triggered.');
}

runTests().catch(console.error);