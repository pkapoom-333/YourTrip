const { Client } = require('./your-trip-web/node_modules/pg');

const client = new Client({
  connectionString: 'postgresql://postgres.wujunlagtipvbzappuwx:pakpoomtee24@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
});

async function main() {
  await client.connect();
  console.log('Connected!');

  // Show current users table columns
  const current = await client.query(`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users'
    ORDER BY ordinal_position
  `);
  console.log('\nCurrent users columns:');
  current.rows.forEach(r => console.log(` - ${r.column_name} (${r.data_type})`));

  // Check if coverImage already exists
  const hasCol = current.rows.some(r => r.column_name === 'coverImage');

  if (hasCol) {
    console.log('\nSUCCESS: coverImage column already exists!');
  } else {
    console.log('\nAdding coverImage column to users table...');
    await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS "coverImage" TEXT');
    console.log('SUCCESS: coverImage column added!');
  }

  await client.end();
}

main().catch(err => {
  console.error('ERROR:', err.message);
  client.end().catch(() => {});
  process.exit(1);
});
