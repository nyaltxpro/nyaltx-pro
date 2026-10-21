#!/usr/bin/env node

/**
 * Optionally rebuild TinaCMS admin into public/admin.
 * Never overwrite a committed production admin with a placeholder —
 * that caused /admin/index.html to show "TinaCMS Admin unavailable" on Vercel.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const adminPath = path.join(__dirname, '..', 'public', 'admin');
const indexPath = path.join(adminPath, 'index.html');
const assetsPath = path.join(adminPath, 'assets');

const clientId = process.env.NEXT_PUBLIC_TINA_CLIENT_ID || '';
const token = process.env.TINA_TOKEN || '';
const forceEnabled = process.env.TINA_CLOUD_ENABLED === 'true';
const forceRebuild = process.env.TINA_FORCE_BUILD === 'true';

const hasCredentials =
  Boolean(clientId) &&
  clientId !== 'dummy-client-id' &&
  Boolean(token) &&
  token !== 'dummy-token';

function hasProductionAdmin() {
  if (!fs.existsSync(indexPath)) return false;
  try {
    const html = fs.readFileSync(indexPath, 'utf8');
    // Real Tina build references /admin/assets/*.js — placeholder does not
    const hasAssetScript =
      html.includes('/admin/assets/') && html.includes('type="module"');
    const hasAssetsDir =
      fs.existsSync(assetsPath) && fs.readdirSync(assetsPath).some(f => f.endsWith('.js'));
    return hasAssetScript && hasAssetsDir;
  } catch {
    return false;
  }
}

function writePlaceholder(message) {
  fs.mkdirSync(adminPath, { recursive: true });
  fs.mkdirSync(assetsPath, { recursive: true });
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

const productionAdminPresent = hasProductionAdmin();

// Prefer committed production admin unless explicitly rebuilding
if (productionAdminPresent && !forceRebuild) {
  if (!hasCredentials && !forceEnabled) {
    console.log('✅ Using committed TinaCMS admin at public/admin (skip rebuild — no Tina credentials)');
    process.exit(0);
  }
  // Credentials exist: still try rebuild, but keep committed admin if rebuild fails
  console.log('📝 Tina credentials found — attempting admin rebuild (committed admin kept on failure)…');
} else if (!hasCredentials && !forceEnabled) {
  console.log('⏭️ Skipping TinaCMS build (no credentials). No production admin found — writing placeholder.');
  writePlaceholder(
    'Configure <code>NEXT_PUBLIC_TINA_CLIENT_ID</code> and <code>TINA_TOKEN</code> in the deployment environment, then redeploy. Or commit a production <code>public/admin</code> build.',
  );
  process.exit(0);
} else {
  console.log('📝 Building TinaCMS admin…');
}

try {
  execSync('npx tinacms build', { stdio: 'inherit', env: process.env });
  if (!hasProductionAdmin()) {
    throw new Error('tinacms build finished but production public/admin assets are missing');
  }
  console.log('✅ TinaCMS admin ready at public/admin/index.html');
} catch (error) {
  console.warn('⚠️ TinaCMS build failed:', error instanceof Error ? error.message : String(error));
  if (productionAdminPresent || hasProductionAdmin()) {
    console.warn('✅ Keeping existing committed TinaCMS admin — /admin/index.html will still work');
    process.exit(0);
  }
  console.warn('⚠️ No production admin available — writing placeholder');
  writePlaceholder(
    'TinaCMS build failed during deployment and no committed admin was found. Check build logs and Tina credentials, then redeploy.',
  );
  process.exit(0);
}
