const fs = require('fs');
const files = [
  'app/layout.js',
  'app/page.js',
  'components/Footer.js',
  'components/Navbar.js',
  'components/sections/DynamicSections.js',
  'lib/data.js',
  'lib/translations.js'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/Tashkent's/g, "Samarkand's");
    content = content.replace(/TASHKENT'S/g, "SAMARKAND'S");
    content = content.replace(/Tashkent/g, 'Samarkand');
    content = content.replace(/TASHKENT/g, 'SAMARKAND');
    
    // Additional precision replacements
    if (file === 'lib/data.js') {
      content = content.replace('address: "Samarkand, Uzbekistan"', 'address: "Oxford International School, Samarkand"');
    }
    if (file === 'components/Footer.js') {
      content = content.replace('Samarkand, Uzbekistan', 'Oxford International School, Samarkand');
    }
    
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
