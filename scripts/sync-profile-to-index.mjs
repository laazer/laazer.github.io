#!/usr/bin/env node
/**
 * Copies data/profile.json (minified) into index.html #profile-data.
 * Run after editing profile.json so the inline fallback matches (file://, fetch failures).
 *
 *   node scripts/sync-profile-to-index.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const profilePath = path.join(root, 'data', 'profile.json');
const indexPath = path.join(root, 'index.html');

const profile = JSON.stringify(JSON.parse(fs.readFileSync(profilePath, 'utf8')));
let html = fs.readFileSync(indexPath, 'utf8');
const replaced = html.replace(
  /<script type="application\/json" id="profile-data">[\s\S]*?<\/script>/m,
  `<script type="application/json" id="profile-data">\n  ${profile}\n  </script>`
);
if (replaced === html) {
  console.error('Could not find #profile-data block in index.html');
  process.exit(1);
}
fs.writeFileSync(indexPath, replaced);
console.log('Synced data/profile.json → index.html (#profile-data)');
