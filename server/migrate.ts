import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pkg from 'pg';
import fs from 'fs';

const { Pool } = pkg;

async function run() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL manquant');
    return;
  }
  if (!fs.existsSync('migrations')) {
    console.log('ℹ️ Dossier migrations/ absent, exécution ignorée.');
    return;
  }
  console.log('🔧 Migration runner: démarrage');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);
  try {
    await migrate(db, { migrationsFolder: 'migrations' });
    console.log('✅ Migrations appliquées (ou déjà à jour)');
  } catch (e) {
    console.error('❌ Erreur migrations:', e);
  } finally {
    await pool.end();
  }
}

run();