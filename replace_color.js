const fs = require('fs');
const path = require('path');

const replacements = [
  { search: /#eab308/gi, replace: '#FFDD00' },
  { search: /#ca8a04/gi, replace: '#D4B800' },
  { search: /#facc15/gi, replace: '#FFEE33' },
  { search: /234,\s*179,\s*8/g, replace: '255, 221, 0' },
  { search: /250,\s*204,\s*21/g, replace: '255, 238, 51' }
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next') {
        processDirectory(fullPath);
      }
    } else if (file.endsWith('.css') || file.endsWith('.js') || file.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      for (const { search, replace } of replacements) {
        if (search.test(content)) {
          content = content.replace(search, replace);
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Updated:', fullPath);
      }
    }
  }
}

processDirectory(path.join(__dirname, 'app'));
console.log('Color replacement complete.');
