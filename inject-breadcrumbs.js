const fs = require('fs');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('page.tsx')) results.push(file);
    }
  });
  return results;
}

const files = walk('src/app');
let modifiedCount = 0;

for (const file of files) {
  if (file.includes('login') || file.includes('register') || file.includes('payment') || file.includes('checkout')) continue;
  if (file === 'src/app/page.tsx') continue;
  
  let content = fs.readFileSync(file, 'utf8');
  
  // Skip if already contains DynamicBreadcrumb inside the page
  if (content.includes('<DynamicBreadcrumb')) continue;
  
  // Find h1 and insert DynamicBreadcrumb above it
  if (content.includes('<h1 className="text-3xl')) {
    // Add import if not present
    if (!content.includes('DynamicBreadcrumb')) {
      // Find the last import and insert after it
      const lastImportIndex = content.lastIndexOf('import ');
      if (lastImportIndex !== -1) {
          const endOfLine = content.indexOf('\n', lastImportIndex);
          content = content.slice(0, endOfLine + 1) + 'import { DynamicBreadcrumb } from "@/components/shared/DynamicBreadcrumb";\n' + content.slice(endOfLine + 1);
      } else {
          content = 'import { DynamicBreadcrumb } from "@/components/shared/DynamicBreadcrumb";\n' + content;
      }
    }
    
    // Inject component
    content = content.replace(/<h1 className="text-3xl/g, '<DynamicBreadcrumb />\n          <h1 className="text-3xl');
    
    fs.writeFileSync(file, content);
    modifiedCount++;
    console.log('Updated: ' + file);
  }
}
console.log('Total modified: ' + modifiedCount);
