const fs = require('fs');

const path = 'app/page.js';
let content = fs.readFileSync(path, 'utf8');

// 1. Add imports for Hero and OurHalls
if (!content.includes('import Hero')) {
    content = content.replace(
        "import FAQ from '@/components/FAQ';",
        "import FAQ from '@/components/FAQ';\nimport Hero from '@/components/Hero';\nimport OurHalls from '@/components/OurHalls';"
    );
}

// 2. Replace the old Aurora Hero and Hall Showcase with the new components
const returnStart = content.indexOf('return (\n    <div className="page-wrapper">');
const returnEnd = content.lastIndexOf('  );\n}');

if (returnStart !== -1 && returnEnd !== -1) {
    let returnBlock = content.substring(returnStart, returnEnd);
    
    // Replace the old Aurora Hero section
    const heroStart = returnBlock.indexOf('{/* ===== PREMIUM AURORA HERO ===== */}');
    const heroEnd = returnBlock.indexOf('{/* ===== HALL SHOWCASE ===== */}');
    if (heroStart !== -1 && heroEnd !== -1) {
        returnBlock = returnBlock.substring(0, heroStart) + '{/* ===== NEW HERO ===== */}\n      <Hero />\n\n      ' + returnBlock.substring(heroEnd);
    }
    
    // Replace the old Hall Showcase and Amenities
    const hallStart = returnBlock.indexOf('{/* ===== HALL SHOWCASE ===== */}');
    const bentoStart = returnBlock.indexOf('{/* ===== PREMIUM BENTO BOX ADVANTAGES ===== */}');
    if (hallStart !== -1 && bentoStart !== -1) {
        returnBlock = returnBlock.substring(0, hallStart) + '{/* ===== OUR HALLS ===== */}\n      <OurHalls />\n\n      ' + returnBlock.substring(bentoStart);
    }

    content = content.substring(0, returnStart) + returnBlock + content.substring(returnEnd);
}

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully updated page.js with Hero and OurHalls');
