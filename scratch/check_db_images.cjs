const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY);

async function checkLatestArticle() {
  const { data, error } = await supabase
    .from('articles')
    .select('id, title, image, category, status')
    .order('createdAt', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Supabase Error:', error);
    return;
  }

  console.log('--- Latest 5 Articles ---');
  console.log(JSON.stringify(data, null, 2));
}

checkLatestArticle();
