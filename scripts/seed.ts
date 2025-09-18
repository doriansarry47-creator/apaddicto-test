import 'dotenv/config';
import pkg from 'pg';
const { Pool } = pkg;

async function run() {
  if (process.env.NODE_ENV === 'production') {
    console.error('⛔ Seed refusé en production');
    process.exit(1);
  }
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL manquant');
    process.exit(1);
  }
  const pool = new Pool({ connectionString: url });
  try {
    console.log('🚀 Seed start');
    // Exemple :
    // await pool.query(`INSERT INTO example (label) VALUES ($1)`, ['demo']);
    console.log('✅ Seed terminé (aucune insertion par défaut)');
  } catch (e) {
    console.error('❌ Seed erreur', e);
  } finally {
    await pool.end();
  }
}
run();