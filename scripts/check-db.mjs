// Verifies the app can reach Supabase and that the `applications` table exists.
// Run with:  npm run db:check   (loads .env via node --env-file)
import { createClient } from "@supabase/supabase-js";

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error(
    "✗ Missing env. Copy .env.example to .env and fill in " +
      "VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
  );
  process.exit(1);
}

const supabase = createClient(url, key);

// head + count: no rows transferred, just checks the table is reachable.
const { count, error } = await supabase
  .from("applications")
  .select("*", { count: "exact", head: true });

if (error) {
  console.error(`✗ Could not query 'applications': ${error.message}`);
  console.error(
    "  If this says the table is missing, run the SQL in " +
      "supabase/migrations/0001_init.sql in the Supabase SQL Editor.",
  );
  process.exit(1);
}

console.log(`✓ Connected to Supabase. 'applications' table OK (${count} rows).`);
