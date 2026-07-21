const { Client } = require('./your-trip-web/node_modules/pg');

const client = new Client({
  connectionString: 'postgresql://postgres.wujunlagtipvbzappuwx:pakpoomtee24@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
});

async function main() {
  await client.connect();
  console.log('Connected!');

  // List all tables in public schema
  const tables = await client.query(`
    SELECT table_name, table_type
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name
  `);
  console.log('\nTables in public schema:');
  tables.rows.forEach(r => console.log(` - "${r.table_name}" (${r.table_type})`));

  await client.end();
}

main().catch(err => {
  console.error('ERROR:', err.message);
  client.end().catch(() => {});
  process.exit(1);
});
