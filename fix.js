const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

let modifiedFiles = 0;

walkDir('d:/ProgrammingHero/EJP/A4/flavor-matrix/src', function(filePath) {
    if (filePath.endsWith('.tsx')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let changed = false;
        
        let pieces = content.split('className="btn-secondary"');
        if (pieces.length > 1) {
             let finalContent = pieces[0];
             for (let i = 1; i < pieces.length; i++) {
                 let piece = pieces[i];
                 let idx = piece.indexOf('className="');
                 
                 if (idx !== -1) {
                     let before = piece.substring(0, idx);
                     // Using a distance heuristic (e.g. 500 chars) instead of looking for '>'
                     // since arrow functions contain '>'
                     if (idx < 500 && !before.includes('</Button>') && !before.includes('<Button')) {
                         let after = piece.substring(idx + 'className="'.length);
                         finalContent += before + 'className="btn-secondary ' + after;
                         changed = true;
                     } else {
                         finalContent += 'className="btn-secondary"' + piece;
                     }
                 } else {
                     finalContent += 'className="btn-secondary"' + piece;
                 }
             }
             if (changed) {
                 fs.writeFileSync(filePath, finalContent, 'utf8');
                 console.log("Fixed", filePath);
                 modifiedFiles++;
             }
        }
    }
});

console.log("Modified", modifiedFiles, "files");
