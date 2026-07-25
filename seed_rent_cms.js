const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase URL or Key in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  const { data: existing, error: fetchErr } = await supabase
    .from('page_sections')
    .select('id')
    .eq('type', 'rent_gallery');

  if (fetchErr) {
    console.error("Error fetching existing sections:", fetchErr);
    process.exit(1);
  }

  if (existing && existing.length > 0) {
    console.log("Rent CMS sections already exist!");
    process.exit(0);
  }

  const newSections = [
    {
      page_slug: 'home', // using home since it already exists in custom_pages
      type: 'rent_gallery',
      order_index: 20,
      data: {
        title: 'Venue Rental',
        subtitle: 'Host your next big event at our Grand Hall with state-of-the-art facilities.',
        bgImage1: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80',
        bgImage2: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400&q=80',
        bgImage3: 'https://images.unsplash.com/photo-1568992688065-536aad8a12f6?w=400&q=80'
      }
    }
  ];

  const { error } = await supabase.from('page_sections').insert(newSections);
  if (error) {
    console.error("Failed to insert rent cms data:", error);
  } else {
    console.log("Rent CMS sections added successfully!");
  }
}

seed();
