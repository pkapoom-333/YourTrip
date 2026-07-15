const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Use __dirname so this works from Windows Node.js
const sqlFile = path.join(__dirname, 'prisma', 'all_migrations.sql');
const sql = fs.readFileSync(sqlFile, 'utf8');

const client = new Client({
  connectionString: 'postgresql://postgres.wujunlagtipvbzappuwx:pakpoomtee24@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  console.log('Connecting to Supabase...');
  await client.connect();
  console.log('Connected! Running migrations...');
  
  try {
    await client.query(sql);
    console.log('All migrations executed successfully!');
  } catch (err) {
    console.error('Migration error:', err.message);
    throw err;
  } finally {
    await client.end();
  }
}

run().catch(e => { console.error(e); process.exit(1); });
