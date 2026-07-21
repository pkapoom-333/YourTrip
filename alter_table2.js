// Use pg (CommonJS) to ALTER TABLE directly via pooler
const { Client } = require('./your-trip-web/node_modules/pg');

// Session pooler: port 5432 on pooler host (supports more operations than transaction pooler)
const connectionString =
  'postgresql://postgres.wujunlagtipvbzappuwx:pakpoomtee24@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres';

console.log('Connecting to:', connectionString.split('@')[1]);

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
  query_timeout: 30000,
});

async function main() {
  console.log('Attempting connection...');
  await client.connect();
  console.log('Connected!');

  // Check if coverImage column exists
  const check = await client.query(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'User'
      AND column_name = 'coverImage'
  `);

  if (check.rowCount > 0) {
    console.log('SUCCESS: coverImage column already exists!');
  } else {
    console.log('Adding coverImage column...');
    await client.query('ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "coverImage" TEXT');
    console.log('SUCCESS: coverImage column added!');
  }

  // Show all User columns
  const cols = await client.query(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'User'
    ORDER BY ordinal_position
  `);
  console.log('\nUser table columns:');
  cols.rows.forEach(r => console.log(` - ${r.column_name} (${r.data_type})`));

  await client.end();
}

main().catch(err => {
  console.error('ERROR:', err.message);
  client.end().catch(() => {});
  process.exit(1);
});
