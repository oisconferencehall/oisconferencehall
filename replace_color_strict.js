const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'app', 'globals.css');
let css = fs.readFileSync(cssPath, 'utf8');

// Replace all orange/gold/amber variations with the exact yellow requested.
css = css.replace(/#D4B800/gi, '#FFDD00');
css = css.replace(/#FFEE33/gi, '#FFDD00');
css = css.replace(/#eab308/gi, '#FFDD00');
css = css.replace(/#facc15/gi, '#FFDD00');
css = css.replace(/#ca8a04/gi, '#FFDD00');
css = css.replace(/#f59e0b/gi, '#FFDD00');
css = css.replace(/#fbbf24/gi, '#FFDD00');
css = css.replace(/#d97706/gi, '#FFDD00');
css = css.replace(/#b45309/gi, '#FFDD00');
css = css.replace(/#92400e/gi, '#FFDD00');

// Replace gradients with solid color so it matches the image perfectly
css = css.replace(/linear-gradient\(135deg,\s*#FFDD00,\s*#FFDD00\)/gi, '#FFDD00');
css = css.replace(/var\(--gradient-accent\)/g, '#FFDD00');
css = css.replace(/var\(--gradient-gold\)/g, '#FFDD00');
css = css.replace(/var\(--gradient-violet\)/g, '#FFDD00');

fs.writeFileSync(cssPath, css);
console.log('done updating globals.css');
