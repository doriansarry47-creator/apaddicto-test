#!/usr/bin/env node

/**
 * Script pour exécuter toutes les migrations et s'assurer de la cohérence de la base de données
 */

import dotenv from 'dotenv';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
import * as schema from '../shared/schema.js';
import { ensureAntiCravingTable } from './ensure-anti-craving-table.js';

// Charger les variables d'environnement
dotenv.config();

const { Pool } = pkg;

async function runMigrations() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL must be set');
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db = drizzle(pool, { schema });

  try {
    console.log('🚀 Démarrage des migrations...');
    
    // Exécuter les migrations Drizzle
    console.log('📦 Exécution des migrations Drizzle...');
    await migrate(db, { migrationsFolder: './migrations' });
    console.log('✅ Migrations Drizzle terminées');
    
    // S'assurer que la table anti_craving_strategies existe
    console.log('🔧 Vérification de la table anti_craving_strategies...');
    await ensureAntiCravingTable();
    
    console.log('🎉 Toutes les migrations sont terminées avec succès');
    
  } catch (error) {
    console.error('❌ Erreur pendant les migrations:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Exécuter les migrations si le script est appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations()
    .then(() => {
      console.log('✨ Migrations terminées avec succès');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Échec des migrations:', error);
      process.exit(1);
    });
}

export { runMigrations };