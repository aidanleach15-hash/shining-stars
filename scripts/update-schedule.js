#!/usr/bin/env node

// Simple script to trigger schedule update on deployed site
const https = require('https');

const SITE_URL = process.env.VERCEL_URL || 'https://shiningstars-lac.vercel.app';

console.log('🏒 Updating Texas Stars schedule...');
console.log(`Calling: ${SITE_URL}/api/update-schedule`);

const url = new URL('/api/update-schedule', SITE_URL);

https.get(url, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('✅ Schedule updated!');
    console.log(data);
  });
}).on('error', (err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
