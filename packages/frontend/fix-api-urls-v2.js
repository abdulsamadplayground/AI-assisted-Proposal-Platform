/**
 * Script to replace hardcoded localhost URLs with proper API_URL usage
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
  
  // Check if file has localhost:3001 or broken ${API_URL}
  if (content.includes('localhost:3001') || content.includes("'${API_URL}") || content.includes('${API_URL}`')) {
    console.log(`Fixing: ${filePath}`);
    
    // Fix broken replacements first
    content = content.replace(/'?\$\{API_URL\}`?/g, '${API_URL}');
    
    // Check if API_URL is already imported
    const hasApiImport = content.includes("from '@/lib/api'");
    
    // Add import if not present
    if (!hasApiImport && content.includes("'use client'")) {
      content = content.replace(
        /'use client';/,
        "'use client';\n\nimport { API_URL } from '@/lib/api';"
      );
      modified = true;
    } else if (!hasApiImport) {
      // Add import at the top after other imports
      const lines = content.split('\n');
      let lastImportIndex = -1;
      
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('import ')) {
          lastImportIndex = i;
        }
      }
      
      if (lastImportIndex >= 0) {
        lines.splice(lastImportIndex + 1, 0, "import { API_URL } from '@/lib/api';");
        content = lines.join('\n');
        modified = true;
      }
    }
    
    // Replace all variations of localhost:3001 URLs
    // Handle template literals: `http://localhost:3001...`
    content = content.replace(/`http:\/\/localhost:3001([^`]*)`/g, '`${API_URL}$1`');
    
    // Handle string literals: 'http://localhost:3001...' or "http://localhost:3001..."
    content = content.replace(/['"]http:\/\/localhost:3001([^'"]*)['"]/g, '`${API_URL}$1`');
    
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
console.log('Fixing hardcoded localhost URLs...\n');

let fixedCount = 0;
files.forEach(file => {
  if (fixFile(file)) {
    fixedCount++;
  }
});

console.log(`\n✅ Fixed ${fixedCount} files!`);
