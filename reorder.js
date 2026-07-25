const fs = require('fs');

const path = 'app/page.js';
let content = fs.readFileSync(path, 'utf8');

// 1. Add imports
if (!content.includes('import Feedbacks')) {
    content = content.replace(
        "import Typewriter from '@/components/Typewriter';",
        "import Typewriter from '@/components/Typewriter';\nimport Feedbacks from '@/components/Feedbacks';\nimport Partners from '@/components/Partners';\nimport Cases from '@/components/Cases';\nimport Contacts from '@/components/Contacts';\nimport FAQ from '@/components/FAQ';"
    );
}

// 2. Extract sections
const getSection = (startMarker, endMarker) => {
    const startIndex = content.indexOf(startMarker);
    const endIndex = content.indexOf(endMarker, startIndex);
    if (startIndex === -1 || endIndex === -1) return '';
    return content.substring(startIndex, endIndex);
};

// We will replace the entire return ( ... ); of Home component.
const returnStart = content.indexOf('return (\n    <div className="page-wrapper">');
const returnEnd = content.lastIndexOf('  );\n}');

if (returnStart !== -1 && returnEnd !== -1) {
    const returnBlock = content.substring(returnStart, returnEnd);

    // Extract individual blocks
    const navbar = '      <Navbar />\n';
    
    // Aurora Hero
    const heroStart = returnBlock.indexOf('{/* ===== PREMIUM AURORA HERO ===== */}');
    const bentoStart = returnBlock.indexOf('{/* ===== PREMIUM BENTO BOX ADVANTAGES ===== */}');
    const hero = returnBlock.substring(heroStart, bentoStart);

    // Bento Box
    const bentoEnd = returnBlock.indexOf('{/* ===== FEATURED EVENTS (Former Hero Slider) ===== */}');
    const bento = returnBlock.substring(bentoStart, bentoEnd);

    // Featured Events (Skip, don't use)
    
    // Stats
    const statsStart = returnBlock.indexOf('{/* ===== STATS ===== */}');
    const upcomingStart = returnBlock.indexOf('{/* ===== UPCOMING EVENTS ===== */}');
    const stats = returnBlock.substring(statsStart, upcomingStart);

    // Upcoming Events (Skip)
    
    // Hall Showcase
    const hallStart = returnBlock.indexOf('{/* ===== HALL SHOWCASE ===== */}');
    const amenStart = returnBlock.indexOf('{/* ===== AMENITIES ===== */}');
    const hall = returnBlock.substring(hallStart, amenStart);

    // Amenities
    const amenEnd = returnBlock.indexOf('{/* ===== PRICING ===== */}');
    const amen = returnBlock.substring(amenStart, amenEnd);

    // We will strip the complex Pricing section to just a CTA.
    const rentSection = `
      {/* ===== RENT THE HALL CTA ===== */}
      <section style={{ padding: '120px 24px', background: 'var(--bg-primary)', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div className="badge badge-gold" style={{ marginBottom: '16px', display: 'inline-flex' }}>✨ Ready to host?</div>
          <h2 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, marginBottom: '40px', color: 'var(--text-primary)' }}>
            Book the <span className="gradient-text-gold">Grand Hall</span> Today
          </h2>
          <Link href="/rent" className="btn btn-primary" style={{ padding: '16px 48px', fontSize: '18px', fontWeight: 700, borderRadius: '100px', boxShadow: '0 10px 30px rgba(255, 221, 0, 0.3)' }}>
            Rent the Hall
          </Link>
        </div>
      </section>\n`;

    const newSections = `
      <Feedbacks />
      <Partners />
      <Cases />
      <Contacts />
      <FAQ />
`;
    
    const footer = `      <Footer />\n    </div>`;

    const newReturnBlock = `return (
    <div className="page-wrapper">
${navbar}
${hero}
${hall}
${amen}
${bento}
${stats}
${rentSection}
${newSections}
${footer}`;

    content = content.substring(0, returnStart) + newReturnBlock + content.substring(returnEnd);
}

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully reordered page.js');
