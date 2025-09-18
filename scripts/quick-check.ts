import 'dotenv/config';
import pkg from 'pg';
const { Pool } = pkg;

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL manquant');
    process.exit(1);
  }
  const pool = new Pool({ connectionString: url });
  try {
    const now = await pool.query('SELECT NOW() AS now');
    console.log('✅ Connexion OK:', now.rows[0].now);
    const tables = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema='public'
      ORDER BY table_name;
    `);
    console.log('Tables:', tables.rows.map((r: any) => r.table_name).join(', ') || '(aucune)');
  } catch (e) {
    console.error('❌ Erreur quick-check', e);
    process.exit(1);
  } finally {
    await pool.end();
  }
}
main();