const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (!fullPath.includes('node_modules') && !fullPath.includes('.next') && !fullPath.includes('.git')) {
        results = results.concat(walk(fullPath));
      }
    } else {
      if (fullPath.endsWith('.js') || fullPath.endsWith('.css') || fullPath.endsWith('.jsx')) {
        results.push(fullPath);
      }
    }
  });
  return results;
}

const files = walk('.');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  // Replace purple variations with yellow/gold variations
  content = content
    .replace(/#eab308/gi, '#eab308') // Primary purple -> Yellow 500
    .replace(/#ca8a04/gi, '#ca8a04') // Indigo 600 -> Yellow 600
    .replace(/124,\s*58,\s*237/g, '234, 179, 8') // Primary RGB -> Yellow RGB
    .replace(/234, 179, 8/g, '234,179,8') // Primary RGB (no spaces)
    .replace(/#facc15/gi, '#facc15') // Violet 500 -> Yellow 400
    .replace(/#fde047/gi, '#fde047'); // Violet 400 (dark mode accent) -> Yellow 300
    
  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Updated:', file);
  }
});
