#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting build process...');

// Check if TinaCMS should be built
const shouldBuildTina = process.env.NEXT_PUBLIC_TINA_CLIENT_ID && 
                       process.env.NEXT_PUBLIC_TINA_CLIENT_ID !== 'dummy-client-id' &&
                       process.env.TINA_TOKEN && 
                       process.env.TINA_TOKEN !== 'dummy-token';

if (shouldBuildTina) {
  console.log('📝 Building TinaCMS...');
  try {
    execSync('npx tinacms build', { stdio: 'inherit' });
    console.log('✅ TinaCMS build completed successfully');
  } catch (error) {
    console.warn('⚠️ TinaCMS build failed, continuing without it...');
    console.warn(error.message);
  }
} else {
  console.log('⏭️ Skipping TinaCMS build (environment variables not configured)');
  
  // Create a minimal admin folder to prevent build issues
  const adminPath = path.join(__dirname, '..', 'public', 'admin');
  if (!fs.existsSync(adminPath)) {
    fs.mkdirSync(adminPath, { recursive: true });
    fs.writeFileSync(
      path.join(adminPath, 'index.html'), 
      '<!DOCTYPE html><html><head><title>Admin</title></head><body><h1>TinaCMS Admin</h1><p>Configure TinaCMS environment variables to enable admin panel.</p></body></html>'
    );
  }
}

// Build Next.js
console.log('🏗️ Building Next.js application...');
try {
  execSync('NODE_OPTIONS=--max-old-space-size=4096 next build', { stdio: 'inherit' });
  console.log('✅ Next.js build completed successfully');
} catch (error) {
  console.error('❌ Next.js build failed');
  console.error(error.message);
  process.exit(1);
}

console.log('🎉 Build process completed successfully!');
