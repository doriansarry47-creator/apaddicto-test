import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pkg from 'pg';
import fs from 'fs';

const { Pool, Client } = pkg;

async function ensureAntiCravingTable() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
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
      console.log('✅ Table anti_craving_strategies existe');
    } else {
      console.log('⚠️ Création de la table anti_craving_strategies...');
      
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
      
      console.log('✅ Table anti_craving_strategies créée');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification de la table anti_craving_strategies:', error);
  } finally {
    await client.end();
  }
}

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
    console.log('✅ Migrations Drizzle appliquées (ou déjà à jour)');
    
    // Vérifier et créer la table anti_craving_strategies si nécessaire
    await ensureAntiCravingTable();
    
  } catch (e) {
    console.error('❌ Erreur migrations:', e);
  } finally {
    await pool.end();
  }
}

run();