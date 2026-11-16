const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://yxsogwdxqnmzppuafhqx.supabase.co";
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

const supabaseClient = createClient(supabaseUrl, supabaseKey);

module.exports = supabaseClient;
