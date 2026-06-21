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
const BUILD_VERSION = 'v_' + Math.floor(Date.now() / 1000);

console.log('--- Starting HCVerse Built-In Compiler ---');
console.log('Build version:', BUILD_VERSION);

// Ensure a fallback firebase-applet-config.json exists for CI and build resilience
const configPath = path.join(PROJECT_ROOT, 'firebase-applet-config.json');
if (!fs.existsSync(configPath)) {
  console.log('No firebase-applet-config.json found. Writing a placeholder config to prevent build failures...');
  const placeholderConfig = {
    apiKey: "placeholder-api-key",
    authDomain: "placeholder-auth.firebaseapp.com",
    projectId: "placeholder-project-id",
    storageBucket: "placeholder-storage.appspot.com",
    messagingSenderId: "000000000000",
    appId: "1:000000000000:web:0000000000000000000000"
  };
  fs.writeFileSync(configPath, JSON.stringify(placeholderConfig, null, 2), 'utf8');
}

// 1. Recreate clean distribution target
if (fs.existsSync(DIST_DIR)) {
  fs.rmSync(DIST_DIR, { recursive: true, force: true });
}
fs.mkdirSync(DIST_DIR, { recursive: true });

// Create .nojekyll in dist and root to prevent GitHub Pages Jekyll processing issues
fs.writeFileSync(path.join(DIST_DIR, '.nojekyll'), '', 'utf8');
fs.writeFileSync(path.join(PROJECT_ROOT, '.nojekyll'), '', 'utf8');
console.log('Created .nojekyll in root and dist to bypass GitHub Pages Jekyll rendering issues.');

// 2. Compile CSS via Tailwind CLI
console.log('Compiling stylesheet via Tailwind CLI...');
try {
  execSync('npx @tailwindcss/cli -i src/index.css -o dist/bundle.css --minify', { stdio: 'inherit' });
  fs.copyFileSync(path.join(DIST_DIR, 'bundle.css'), path.join(PROJECT_ROOT, 'bundle.css'));
  console.log('Tailwind compiled successfully.');
} catch (error) {
  console.error('Tailwind compilation failed, continuing with fallback:', error);
}

// 3. Bundle client-side script with esbuild resolving all firebase/libraries
console.log('Bundling client-side scripts via esbuild...');
try {
  esbuild.buildSync({
    entryPoints: [path.join(PROJECT_ROOT, 'src', 'main.js')],
    bundle: true,
    minify: true,
    sourcemap: true,
    outfile: path.join(DIST_DIR, 'bundle.js'),
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
  fs.copyFileSync(path.join(DIST_DIR, 'bundle.js'), path.join(PROJECT_ROOT, 'bundle.js'));
  if (fs.existsSync(path.join(DIST_DIR, 'bundle.js.map'))) {
    fs.copyFileSync(path.join(DIST_DIR, 'bundle.js.map'), path.join(PROJECT_ROOT, 'bundle.js.map'));
  }
  console.log('Client-side script bundled successfully.');
} catch (error) {
  console.error('Client compilation failed:', error);
  process.exit(1);
}

// 4. Bundle backend server code
console.log('Bundling backend server code...');
try {
  esbuild.buildSync({
    entryPoints: [path.join(PROJECT_ROOT, 'src', 'server.js')],
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

// 5. Preprocess index.html to load dist sources (with cache-busting params)
console.log('Preprocessing index.html...');
try {
  let html = fs.readFileSync(path.join(PROJECT_ROOT, 'index.html'), 'utf8');
  
  // Dynamically replace with the current BUILD_VERSION to force browsers/caches to reload the new bundles
  html = html.replace(/href="\.\/bundle\.css(\?v=[^"]+)?"/g, `href="./bundle.css?v=${BUILD_VERSION}"`);
  html = html.replace(/src="\.\/bundle\.js(\?v=[^"]+)?"/g, `src="./bundle.js?v=${BUILD_VERSION}"`);
  
  // Save the preprocessed index.html globally and to dist
  fs.writeFileSync(path.join(PROJECT_ROOT, 'index.html'), html, 'utf8');
  fs.writeFileSync(path.join(DIST_DIR, 'index.html'), html, 'utf8');
  console.log('index.html integrated and cache-busted successfully with:', BUILD_VERSION);
} catch (error) {
  console.error('HTML preprocessing failed:', error);
  process.exit(1);
}

console.log('--- HCVerse Build Complete ---');
