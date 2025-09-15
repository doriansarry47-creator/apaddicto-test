#!/usr/bin/env node

/**
 * Script pour s'assurer que la table anti_craving_strategies existe
 * Peut être exécuté en production pour réparer la base de données
 */

import dotenv from 'dotenv';
import pkg from 'pg';

// Charger les variables d'environnement
dotenv.config();

const { Client } = pkg;

async function ensureAntiCravingTable() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    console.log('🔧 Connexion à la base de données...');
    await client.connect();
    
    // Vérifier si la table existe
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'anti_craving_strategies'
      );
    `);
    
    if (tableExists.rows[0].exists) {
      console.log('✅ La table anti_craving_strategies existe déjà');
    } else {
      console.log('⚠️ La table anti_craving_strategies n\'existe pas, création...');
      
      // Créer la table
      await client.query(`
        CREATE TABLE IF NOT EXISTS "anti_craving_strategies" (
          "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
          "user_id" varchar NOT NULL,
          "context" varchar NOT NULL,
          "exercise" text NOT NULL,
          "effort" varchar NOT NULL,
          "duration" integer NOT NULL,
          "craving_before" integer NOT NULL,
          "craving_after" integer NOT NULL,
          "created_at" timestamp DEFAULT now(),
          "updated_at" timestamp DEFAULT now()
        );
      `);
      
      // Ajouter la clé étrangère si elle n'existe pas
      await client.query(`
        DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'anti_craving_strategies_user_id_users_id_fk'
          ) THEN
            ALTER TABLE "anti_craving_strategies" 
            ADD CONSTRAINT "anti_craving_strategies_user_id_users_id_fk" 
            FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") 
            ON DELETE cascade ON UPDATE no action;
          END IF;
        END $$;
      `);
      
      console.log('✅ Table anti_craving_strategies créée avec succès');
    }
    
    // Vérifier la structure de la table
    const columns = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'anti_craving_strategies' 
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Structure de la table :');
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
    });
    
    console.log('🎉 Vérification terminée avec succès');
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification/création de la table:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Exécuter le script si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  ensureAntiCravingTable()
    .then(() => {
      console.log('✨ Script terminé avec succès');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Échec du script:', error);
      process.exit(1);
    });
}

export { ensureAntiCravingTable };