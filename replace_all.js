const fs = require('fs');
const path = require('path');

const colorsToReplace = [
  /#D4B800/gi, /#FFEE33/gi, /#eab308/gi, /#facc15/gi, /#ca8a04/gi,
  /#f59e0b/gi, /#fbbf24/gi, /#d97706/gi, /#b45309/gi, /#92400e/gi,
  /rgba\(234,\s*179,\s*8/g, /rgba\(245,\s*158,\s*11/g, /rgba\(250,\s*204,\s*21/g,
  /rgb\(234,\s*179,\s*8/g, /rgb\(245,\s*158,\s*11/g, /rgb\(250,\s*204,\s*21/g,
  /linear-gradient\([^)]+\)/gi // Be careful with this, let's only replace specific gradients
];

const exactColors = [
  '#D4B800', '#FFEE33', '#eab308', '#facc15', '#ca8a04',
  '#f59e0b', '#fbbf24', '#d97706', '#b45309', '#92400e'
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!['node_modules', '.next'].includes(file)) {
        processDirectory(fullPath);
      }
    } else if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.css')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      // Replace hex codes
      exactColors.forEach(color => {
        const regex = new RegExp(color, 'gi');
        if (regex.test(content)) {
          content = content.replace(regex, '#FFDD00');
          changed = true;
        }
      });

      // Replace rgba
      const rgbaRegexes = [
        /rgba\(\s*234\s*,\s*179\s*,\s*8\s*,/g,
        /rgba\(\s*245\s*,\s*158\s*,\s*11\s*,/g,
        /rgba\(\s*250\s*,\s*204\s*,\s*21\s*,/g,
        /rgba\(\s*255\s*,\s*221\s*,\s*0\s*,/g
      ];
      rgbaRegexes.forEach(regex => {
        if (regex.test(content)) {
          // Replace with hex isn't straightforward because of alpha, let's just replace the rgb part
          // #FFDD00 is 255, 221, 0
          content = content.replace(regex, 'rgba(255, 221, 0,');
          changed = true;
        }
      });

      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Updated colors in:', fullPath);
      }
    }
  }
}

processDirectory(path.join(__dirname, 'app'));
if (fs.existsSync(path.join(__dirname, 'components'))) {
  processDirectory(path.join(__dirname, 'components'));
}
console.log('Done deep replacing colors!');
