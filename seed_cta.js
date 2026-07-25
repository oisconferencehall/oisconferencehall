const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase URL or Key");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  const { data: existing, error: fetchErr } = await supabase
    .from('page_sections')
    .select('id')
    .eq('type', 'cta_banner');

  if (fetchErr) {
    console.error("Error fetching existing sections:", fetchErr);
    process.exit(1);
  }

  if (existing && existing.length > 0) {
    console.log("CTA CMS section already exists!");
    process.exit(0);
  }

  const newSections = [
    {
      page_slug: 'home',
      type: 'cta_banner',
      order_index: 30,
      data: {
        bgImage1: 'https://images.unsplash.com/photo-1511578314322-379a95053c5b?w=1600&q=80',
      }
    }
  ];

  const { error } = await supabase.from('page_sections').insert(newSections);
  if (error) {
    console.error("Failed to insert CTA cms data:", error);
  } else {
    console.log("CTA CMS section added successfully!");
  }
}

seed();
