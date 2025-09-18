#!/usr/bin/env node

import 'dotenv/config';
import pkg from 'pg';

const { Pool } = pkg;

console.log('🔍 Test de connexion à la base de données...');
console.log('DATABASE_URL présente:', !!process.env.DATABASE_URL);
console.log('DATABASE_URL (masquée):', process.env.DATABASE_URL?.slice(0, 20) + '...');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function testConnection() {
  try {
    console.log('Tentative de connexion...');
    const client = await pool.connect();
    console.log('✅ Connexion établie');
    
    const result = await client.query('SELECT 1 as test, NOW() as timestamp');
    console.log('✅ Query réussie:', result.rows[0]);
    
    client.release();
    await pool.end();
    
    console.log('✅ Test de connexion réussi !');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    console.error('Code:', error.code);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testConnection();