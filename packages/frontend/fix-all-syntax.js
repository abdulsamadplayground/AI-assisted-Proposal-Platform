/**
 * Script to fix all syntax errors from broken replacements
 */

const fs = require('fs');
const path = require('path');

function getAllTsxFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllTsxFiles(filePath, fileList);
    } else if (file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Fix pattern: `${API_URL}/...' (backtick start, single quote end)
  if (content.includes("`${API_URL}/") && content.match(/`\$\{API_URL\}[^`]*'/)) {
    console.log(`Fixing mixed quotes in: ${filePath}`);
    // Replace `${API_URL}/...' with `${API_URL}/...`
    content = content.replace(/(`\$\{API_URL\}[^`']*)'(?=[,\s\)])/g, '$1`');
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${filePath}`);
    return true;
  }
  
  return false;
}

// Main execution
const srcDir = path.join(__dirname, 'src');
const files = getAllTsxFiles(srcDir);

console.log(`Found ${files.length} .tsx files`);
console.log('Fixing syntax errors...\n');

let fixedCount = 0;
files.forEach(file => {
  if (fixFile(file)) {
    fixedCount++;
  }
});

console.log(`\n✅ Fixed ${fixedCount} files!`);
