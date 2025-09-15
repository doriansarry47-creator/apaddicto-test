#!/usr/bin/env node

import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function fixDatabaseSchema() {
  const client = await pool.connect();
  
  try {
    console.log('Fixing database schema...');
    
    // Add missing columns to users table
    const alterQueries = [
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at timestamp;',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS inactivity_threshold integer DEFAULT 30;',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS notes text;'
    ];
    
    for (const query of alterQueries) {
      console.log(`Executing: ${query}`);
      await client.query(query);
    }
    
    console.log('✅ Database schema fixed successfully!');
    
    // Verify the columns exist
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('last_login_at', 'inactivity_threshold', 'notes')
      ORDER BY column_name;
    `);
    
    console.log('\nVerification - Users table columns:');
    result.rows.forEach(row => {
      console.log(`- ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable}, default: ${row.column_default})`);
    });
    
  } catch (error) {
    console.error('❌ Error fixing database schema:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

fixDatabaseSchema().catch(console.error);