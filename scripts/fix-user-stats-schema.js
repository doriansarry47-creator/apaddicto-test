#!/usr/bin/env node

/**
 * Script pour corriger le schéma de la table user_stats
 * Ajoute les colonnes manquantes si nécessaire
 */

import dotenv from 'dotenv';
import pkg from 'pg';

// Charger les variables d'environnement
dotenv.config();

const { Client } = pkg;

async function fixUserStatsSchema() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    console.log('🔧 Connexion à la base de données...');
    await client.connect();
    
    // Vérifier si la colonne beck_analyses_completed existe
    console.log('📊 Vérification de la colonne beck_analyses_completed...');
    
    const beckColumnExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'user_stats' 
        AND column_name = 'beck_analyses_completed'
      );
    `);
    
    if (!beckColumnExists.rows[0].exists) {
      console.log('➕ Ajout de la colonne beck_analyses_completed...');
      await client.query(`
        ALTER TABLE "user_stats" 
        ADD COLUMN "beck_analyses_completed" integer DEFAULT 0;
      `);
      console.log('✅ Colonne beck_analyses_completed ajoutée');
    } else {
      console.log('✅ La colonne beck_analyses_completed existe déjà');
    }

    // Vérifier si la table beck_analyses existe
    console.log('🧠 Vérification de la table beck_analyses...');
    
    const beckTableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'beck_analyses'
      );
    `);
    
    if (!beckTableExists.rows[0].exists) {
      console.log('⚠️ La table beck_analyses n\'existe pas, création...');
      
      // Créer la table beck_analyses
      await client.query(`
        CREATE TABLE IF NOT EXISTS "beck_analyses" (
          "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
          "user_id" varchar NOT NULL,
          "situation" text,
          "automatic_thoughts" text,
          "emotions" text,
          "emotion_intensity" integer,
          "rational_response" text,
          "new_feeling" text,
          "new_intensity" integer,
          "created_at" timestamp DEFAULT now()
        );
      `);
      
      // Ajouter la clé étrangère
      await client.query(`
        ALTER TABLE "beck_analyses" 
        ADD CONSTRAINT "beck_analyses_user_id_users_id_fk" 
        FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") 
        ON DELETE cascade;
      `);
      
      console.log('✅ Table beck_analyses créée avec succès');
    } else {
      console.log('✅ La table beck_analyses existe déjà');
    }

    // Afficher la structure finale de user_stats
    console.log('📋 Structure actuelle de user_stats:');
    const userStatsColumns = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'user_stats' 
      ORDER BY ordinal_position;
    `);
    
    userStatsColumns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : ''} ${col.column_default ? `(default: ${col.column_default})` : ''}`);
    });

    // Afficher la structure de beck_analyses
    console.log('📋 Structure actuelle de beck_analyses:');
    const beckColumns = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'beck_analyses' 
      ORDER BY ordinal_position;
    `);
    
    beckColumns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : ''} ${col.column_default ? `(default: ${col.column_default})` : ''}`);
    });
    
    console.log('🎉 Correction du schéma terminée avec succès');
    
  } catch (error) {
    console.error('❌ Erreur lors de la correction du schéma:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Exécuter le script si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  fixUserStatsSchema()
    .then(() => {
      console.log('✨ Script terminé avec succès');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Échec du script:', error);
      process.exit(1);
    });
}

export { fixUserStatsSchema };