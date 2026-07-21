// Direct ALTER TABLE using postgres client (already installed in node_modules)
const { default: postgres } = require('./your-trip-web/node_modules/postgres');

const connectionString = process.env.DATABASE_URL ||
  'postgresql://postgres.wujunlagtipvbzappuwx:pakpoomtee24@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres';

console.log('Connecting to:', connectionString.split('@')[1]);

const sql = postgres(connectionString, {
  max: 1,
  idle_timeout: 10,
  connect_timeout: 15,
  ssl: 'require'
});

async function main() {
  try {
    // Check if column exists
    const check = await sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'User'
        AND column_name = 'coverImage'
    `;

    if (check.length > 0) {
      console.log('SUCCESS: coverImage column already exists in User table!');
    } else {
      console.log('Column not found, adding it...');
      await sql`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "coverImage" TEXT`;
      console.log('SUCCESS: coverImage column added to User table!');
    }

    // Verify
    const verify = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'User'
      ORDER BY ordinal_position
    `;
    console.log('\nCurrent User columns:');
    verify.forEach(col => console.log(` - ${col.column_name} (${col.data_type}, nullable: ${col.is_nullable})`));

  } catch (err) {
    console.error('ERROR:', err.message);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main();
