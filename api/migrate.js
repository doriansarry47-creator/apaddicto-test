import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export async function runMigrations() {
  try {
    console.log('🔄 Exécution des migrations...');
    
    // Créer la table users si elle n'existe pas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        role VARCHAR(50) DEFAULT 'patient',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Créer la table craving_entries si elle n'existe pas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS craving_entries (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        intensity INTEGER NOT NULL,
        trigger_type VARCHAR(255),
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Créer la table user_stats si elle n'existe pas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_stats (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        total_exercises INTEGER DEFAULT 0,
        completed_exercises INTEGER DEFAULT 0,
        current_streak INTEGER DEFAULT 0,
        total_points INTEGER DEFAULT 0,
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    console.log('✅ Migrations terminées avec succès');
    
  } catch (error) {
    console.error('❌ Erreur lors des migrations:', error);
    throw error;
  }
}

// Exécuter les migrations si ce fichier est appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

