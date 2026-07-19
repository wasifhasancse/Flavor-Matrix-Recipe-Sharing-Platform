const fs = require('fs');
const path = require('path');

const dashboardDir = path.join(__dirname, 'src/app/dashboard');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

function processFile(filePath) {
  if (!filePath.endsWith('.tsx')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // 1. Replace large container classes with glass-panel and ambient-glow-orange
  content = content.replace(/bg-white\/70 dark:bg-zinc-900\/70 backdrop-blur-xl border border-default-100 dark:border-zinc-800/g, 'glass-panel');
  content = content.replace(/border border-default-100 dark:border-zinc-800 bg-white\/70 dark:bg-zinc-900\/70 backdrop-blur-xl/g, 'glass-panel');
  
  // Shadows
  content = content.replace(/shadow-xl/g, 'ambient-glow-orange');
  content = content.replace(/shadow-lg/g, 'ambient-glow-orange');
  content = content.replace(/shadow-2xl/g, 'ambient-glow-orange');

  // 2. Gradients for headers
  content = content.replace(/bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500/g, 'text-gradient-primary');
  content = content.replace(/bg-clip-text text-transparent bg-gradient-to-r from-rose-500 via-pink-500 to-orange-500/g, 'text-gradient-rose');

  // 3. Modals / specific white backgrounds
  content = content.replace(/bg-white dark:bg-zinc-950 border border-default-100 dark:border-zinc-800/g, 'glass-panel');
  content = content.replace(/bg-white dark:bg-zinc-950 border border-rose-500\/30/g, 'glass-panel border-rose-500/30');

  // 4. Transitions
  content = content.replace(/transition-all duration-300/g, 'transition-smooth');
  content = content.replace(/transition-all duration-500/g, 'transition-smooth');
  content = content.replace(/transition-colors/g, 'transition-smooth');
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

walkDir(dashboardDir, processFile);
console.log('Refactoring complete.');
