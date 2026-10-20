#!/usr/bin/env node

/**
 * Build TinaCMS admin SPA into public/admin when credentials are available.
 * Falls back to a small placeholder so /admin/index.html never 404s.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const adminPath = path.join(__dirname, '..', 'public', 'admin');
const indexPath = path.join(adminPath, 'index.html');

const clientId = process.env.NEXT_PUBLIC_TINA_CLIENT_ID || '';
const token = process.env.TINA_TOKEN || '';
const forceEnabled = process.env.TINA_CLOUD_ENABLED === 'true';

const hasCredentials =
  Boolean(clientId) &&
  clientId !== 'dummy-client-id' &&
  Boolean(token) &&
  token !== 'dummy-token';

const shouldBuildTina = forceEnabled || hasCredentials;

function writePlaceholder(message) {
  fs.mkdirSync(adminPath, { recursive: true });
  // Keep assets dir so relative paths do not explode if referenced
  fs.mkdirSync(path.join(adminPath, 'assets'), { recursive: true });
  fs.writeFileSync(
    indexPath,
    `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TinaCMS Admin</title>
    <style>
      body { font-family: system-ui, sans-serif; background: #0b1220; color: #e5e7eb; margin: 0; min-height: 100vh; display: grid; place-items: center; }
      .card { max-width: 520px; padding: 2rem; border: 1px solid rgba(255,255,255,.1); border-radius: 1rem; background: rgba(255,255,255,.04); }
      a { color: #00d4aa; }
      code { background: rgba(255,255,255,.08); padding: .15rem .4rem; border-radius: .35rem; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>TinaCMS Admin unavailable</h1>
      <p>${message}</p>
      <p>Site admin (non-CMS): <a href="/adminpanel">/adminpanel</a></p>
    </div>
  </body>
</html>
`,
  );
}

if (!shouldBuildTina) {
  console.log('⏭️ Skipping TinaCMS build (set NEXT_PUBLIC_TINA_CLIENT_ID + TINA_TOKEN, or TINA_CLOUD_ENABLED=true)');
  writePlaceholder(
    'Configure <code>NEXT_PUBLIC_TINA_CLIENT_ID</code> and <code>TINA_TOKEN</code> in the deployment environment, then redeploy.',
  );
  process.exit(0);
}

console.log('📝 Building TinaCMS admin…');
try {
  execSync('npx tinacms build', { stdio: 'inherit', env: process.env });
  if (!fs.existsSync(indexPath)) {
    throw new Error('tinacms build finished but public/admin/index.html is missing');
  }
  console.log('✅ TinaCMS admin built at public/admin/index.html');
} catch (error) {
  console.warn('⚠️ TinaCMS build failed; writing placeholder so /admin does not 404');
  console.warn(error instanceof Error ? error.message : String(error));
  writePlaceholder(
    'TinaCMS build failed during deployment. Check build logs and Tina credentials, then redeploy.',
  );
  // Do not fail the whole Next.js build for CMS admin generation issues
  process.exit(0);
}
