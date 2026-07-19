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

  // 1. Table rows hover state
  content = content.replace(/hover:bg-default-50\/50 dark:hover:bg-zinc-800\/30/g, 'hover:bg-default-100 dark:hover:bg-zinc-800 cursor-pointer');

  // Also catch tr without classes in mapping
  // e.g., <tr key={tx.id}> or <tr key={recipe.id}> => change to <tr key={...} className="hover:bg-default-100 dark:hover:bg-zinc-800 transition-smooth cursor-pointer">
  // We can use a regex to inject className if it doesn't exist, but it's simpler to just let it be if it's already updated for some, or add a global pass for `<tr key={`
  content = content.replace(/<tr key={([^}]+)}>/g, '<tr key={$1} className="hover:bg-default-100 dark:hover:bg-zinc-800 transition-smooth cursor-pointer">');
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated table rows in ${filePath}`);
  }
}

walkDir(dashboardDir, processFile);
console.log('Table refactoring complete.');
