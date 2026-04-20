require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const identifier = 'the-great-flip-how-agile-policy-and-targeted-investment-propelled-the-uk-past-india-into-5th-global-economy-in-2026';

supabase.from('articles').select('slug').or(`id.eq.${identifier},slug.eq.${identifier}`).single().then(console.log).catch(console.error);
