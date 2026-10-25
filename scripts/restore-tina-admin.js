#!/usr/bin/env node
/**
 * Restores production Tina admin index.html that loads /admin/assets/*.
 * `tinacms dev` overwrites this with Vite localhost URLs, which break when
 * Next.js is serving /admin without Tina's Vite middleware.
 */
const fs = require('fs');
const path = require('path');

const adminDir = path.join(__dirname, '..', 'public', 'admin');
const assetsDir = path.join(adminDir, 'assets');
const indexPath = path.join(adminDir, 'index.html');

function pickAsset(prefix, ext) {
  if (!fs.existsSync(assetsDir)) return null;
  const files = fs.readdirSync(assetsDir).filter((f) => f.startsWith(prefix) && f.endsWith(ext));
  // Prefer the largest bundle for index-*.js (main app)
  if (ext === '.js' && prefix === 'index-') {
    files.sort((a, b) => {
      const sa = fs.statSync(path.join(assetsDir, a)).size;
      const sb = fs.statSync(path.join(assetsDir, b)).size;
      return sb - sa;
    });
  }
  return files[0] || null;
}

const js = pickAsset('index-', '.js');
const css = pickAsset('index-', '.css');

if (!js || !css) {
  console.error('❌ Missing production Tina assets in public/admin/assets');
  console.error('   Run: npx tinacms build   (requires NEXT_PUBLIC_TINA_CLIENT_ID + TINA_TOKEN)');
  process.exit(1);
}

const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TinaCMS</title>
    <script type="module" crossorigin src="/admin/assets/${js}"></script>
    <link rel="stylesheet" href="/admin/assets/${css}">
  </head>
  <body class="tina-tailwind">
    <div id="root"></div>
    <script>
      function handleLoadError() {
        console.error('Failed to load assets');
        document.getElementById('root').innerHTML =
          '<style type="text/css">#no-assets-placeholder{max-width:600px;margin:40px auto;padding:40px;text-align:center;font-family:sans-serif;background:#fff;box-shadow:0 0 20px rgba(0,0,0,.1)}#no-assets-placeholder h1{font-size:24px;margin-bottom:20px}#no-assets-placeholder a{color:#0077cc}</style><div id="no-assets-placeholder"><h1>Failed loading TinaCMS assets</h1><p>Run <code>npm run tina:restore</code> or <code>npx tinacms build</code>, then refresh.</p><p>Site admin: <a href="/adminpanel">/adminpanel</a></p></div>';
      }
      setTimeout(function () {
        var root = document.getElementById('root');
        if (root && !root.children.length) handleLoadError();
      }, 3000);
    </script>
  </body>
</html>
`;

fs.mkdirSync(adminDir, { recursive: true });
fs.writeFileSync(indexPath, html);
console.log(`✅ Restored production Tina admin → /admin/assets/${js} + ${css}`);
console.log('   Open http://localhost:3000/admin/index.html');
