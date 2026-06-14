/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import * as esbuild from 'esbuild';

const PROJECT_ROOT = process.cwd();
const DIST_DIR = path.join(PROJECT_ROOT, 'dist');

console.log('--- Starting HCVerse Built-In Compiler ---');

// 1. Recreate clean distribution target
if (fs.existsSync(DIST_DIR)) {
  fs.rmSync(DIST_DIR, { recursive: true, force: true });
}
fs.mkdirSync(DIST_DIR, { recursive: true });

// 2. Compile CSS via Tailwind CLI
console.log('Compiling stylesheet via Tailwind CLI...');
try {
  execSync('npx @tailwindcss/cli -i src/index.css -o dist/index.css --minify', { stdio: 'inherit' });
  console.log('Tailwind compiled successfully.');
} catch (error) {
  console.error('Tailwind compilation failed, continuing with fallback:', error);
}

// 3. Bundle client-side script with esbuild resolving all firebase/libraries
console.log('Bundling client-side scripts via esbuild...');
try {
  esbuild.buildSync({
    entryPoints: [path.join(PROJECT_ROOT, 'src/main.js')],
    bundle: true,
    minify: true,
    sourcemap: true,
    outfile: path.join(DIST_DIR, 'main.js'),
    format: 'esm',
    target: ['es2020', 'chrome80', 'safari12'],
    external: ['*.css'],
    loader: {
      '.json': 'json',
      '.png': 'dataurl',
      '.svg': 'text'
    },
    define: {
      'process.env.NODE_ENV': '"production"'
    }
  });
  console.log('Client-side script bundled successfully.');
} catch (error) {
  console.error('Client compilation failed:', error);
  process.exit(1);
}

// 4. Bundle backend server code
console.log('Bundling backend server code...');
try {
  esbuild.buildSync({
    entryPoints: [path.join(PROJECT_ROOT, 'server.js')],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    packages: 'external',
    sourcemap: true,
    outfile: path.join(DIST_DIR, 'server.cjs')
  });
  console.log('Backend server bundled successfully.');
} catch (error) {
  console.error('Backend compilation failed:', error);
  process.exit(1);
}

// 5. Copy direct static PWA assets
console.log('Deploying static PWA modules...');
try {
  fs.copyFileSync(
    path.join(PROJECT_ROOT, 'src/manifest.json'),
    path.join(DIST_DIR, 'manifest.json')
  );
  fs.copyFileSync(
    path.join(PROJECT_ROOT, 'src/sw.js'),
    path.join(DIST_DIR, 'sw.js')
  );
  console.log('Copied manifest.json and sw.js to dist/');
} catch (error) {
  console.error('PWA assets transfer failed:', error);
}

// 6. Preprocess index.html to load dist sources & register Service Worker
console.log('Preprocessing index.html into dist...');
try {
  let html = fs.readFileSync(path.join(PROJECT_ROOT, 'index.html'), 'utf8');
  
  // Replace the module entry point link with the single bundled main.js resource
  html = html.replace('/src/main.js', '/main.js');

  // Inject CSS reference tag and PWA Manifest in head tag
  const injectHead = `
    <!-- Compiled responsive CSS styles -->
    <link rel="stylesheet" href="/index.css" />
    <link rel="manifest" href="/manifest.json" />
    
    <!-- PWA Registration support -->
    <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('[PWA] ServiceWorker registered scope:', reg.scope))
            .catch(err => console.warn('[PWA] ServiceWorker register failed:', err));
        });
      }
    </script>
  </head>
  `;
  html = html.replace('</head>', injectHead);

  fs.writeFileSync(path.join(DIST_DIR, 'index.html'), html, 'utf8');
  console.log('index.html integrated into dist/ successfully.');
} catch (error) {
  console.error('HTML preprocessing failed:', error);
  process.exit(1);
}

console.log('--- HCVerse Build Complete ---');
