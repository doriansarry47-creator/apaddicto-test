import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pkg from 'pg';
import { sql } from 'drizzle-orm';

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

async function forceMigrations() {
  try {
    console.log('🔄 Nettoyage des anciennes tables...');
    
    // Supprimer les tables existantes pour éviter les conflits
    await db.execute(sql`DROP TABLE IF EXISTS user_badges CASCADE;`);
    await db.execute(sql`DROP TABLE IF EXISTS beck_analyses CASCADE;`);
    await db.execute(sql`DROP TABLE IF EXISTS exercise_sessions CASCADE;`);
    await db.execute(sql`DROP TABLE IF EXISTS craving_entries CASCADE;`);
    await db.execute(sql`DROP TABLE IF EXISTS user_stats CASCADE;`);
    await db.execute(sql`DROP TABLE IF EXISTS exercises CASCADE;`);
    await db.execute(sql`DROP TABLE IF EXISTS psycho_education_content CASCADE;`);
    await db.execute(sql`DROP TABLE IF EXISTS users CASCADE;`);
    
    console.log('✅ Anciennes tables supprimées');
    
    // Créer les nouvelles tables
    console.log('🔄 Création des nouvelles tables...');
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR UNIQUE NOT NULL,
        password VARCHAR NOT NULL,
        first_name VARCHAR,
        last_name VARCHAR,
        profile_image_url VARCHAR,
        role VARCHAR DEFAULT 'patient',
        level INTEGER DEFAULT 1,
        points INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
      );
    `);
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS exercises (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR NOT NULL,
        description TEXT,
        category VARCHAR NOT NULL,
        difficulty VARCHAR DEFAULT 'beginner',
        duration INTEGER,
        instructions TEXT,
        benefits TEXT,
        image_url VARCHAR,
        video_url VARCHAR,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
      );
    `);
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS psycho_education_content (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR NOT NULL,
        type VARCHAR DEFAULT 'article',
        difficulty VARCHAR DEFAULT 'beginner',
        estimated_read_time INTEGER,
        image_url VARCHAR,
        video_url VARCHAR,
        audio_url VARCHAR,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
      );
    `);
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS user_stats (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        exercises_completed INTEGER DEFAULT 0,
        total_duration INTEGER DEFAULT 0,
        current_streak INTEGER DEFAULT 0,
        longest_streak INTEGER DEFAULT 0,
        average_craving INTEGER,
        updated_at TIMESTAMP DEFAULT now()
      );
    `);
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS craving_entries (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        intensity INTEGER NOT NULL,
        triggers JSONB DEFAULT '[]',
        emotions JSONB DEFAULT '[]',
        notes TEXT,
        created_at TIMESTAMP DEFAULT now()
      );
    `);
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS exercise_sessions (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        exercise_id VARCHAR NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
        duration INTEGER,
        completed BOOLEAN DEFAULT false,
        craving_before INTEGER,
        craving_after INTEGER,
        created_at TIMESTAMP DEFAULT now()
      );
    `);
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS beck_analyses (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        situation TEXT,
        automatic_thoughts TEXT,
        emotions TEXT,
        emotion_intensity INTEGER,
        rational_response TEXT,
        new_feeling TEXT,
        new_intensity INTEGER,
        created_at TIMESTAMP DEFAULT now()
      );
    `);
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS user_badges (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        badge_type VARCHAR NOT NULL,
        earned_at TIMESTAMP DEFAULT now()
      );
    `);
    
    console.log('✅ Tables créées avec succès');
    
    await pool.end();
    console.log('🎉 Migrations terminées !');
    
  } catch (error) {
    console.error('❌ Erreur lors des migrations:', error);
    process.exit(1);
  }
}

forceMigrations();