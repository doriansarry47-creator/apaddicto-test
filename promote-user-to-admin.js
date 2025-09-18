#!/usr/bin/env node

// Script pour promouvoir un utilisateur en admin en utilisant le même système que le serveur
import pkg from 'pg';
const { Pool } = pkg;
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL non définie');
  process.exit(1);
}

async function promoteUserToAdmin() {
  console.log('🔧 Promotion de l\'utilisateur en admin...');
  
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
  });
  
  try {
    const client = await pool.connect();
    
    // D'abord, vérifions les utilisateurs existants
    const usersResult = await client.query('SELECT id, email, role FROM users ORDER BY created_at DESC LIMIT 10');
    console.log('👥 Utilisateurs récents:');
    usersResult.rows.forEach(user => {
      console.log(`  - ${user.email} (${user.role}) [ID: ${user.id}]`);
    });
    
    // Trouver notre utilisateur créé récemment
    const targetUser = usersResult.rows.find(u => u.email === 'admin@apaddicto.com');
    
    if (!targetUser) {
      console.log('❌ Utilisateur admin@apaddicto.com non trouvé');
      
      // Créer directement l'utilisateur admin
      console.log('🔨 Création directe de l\'utilisateur admin...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await client.query(`
        INSERT INTO users (email, password, first_name, last_name, role, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        ON CONFLICT (email) DO UPDATE SET
        password = EXCLUDED.password,
        role = EXCLUDED.role,
        is_active = EXCLUDED.is_active,
        updated_at = NOW()
      `, ['admin@apaddicto.com', hashedPassword, 'Admin', 'User', 'admin', true]);
      
      console.log('✅ Utilisateur admin créé/mis à jour directement');
    } else {
      console.log(`📝 Promotion de ${targetUser.email} en admin...`);
      
      // Promouvoir en admin et s'assurer qu'il est actif
      await client.query(`
        UPDATE users 
        SET role = 'admin', is_active = true, updated_at = NOW()
        WHERE id = $1
      `, [targetUser.id]);
      
      console.log('✅ Utilisateur promu en admin avec succès');
    }
    
    // Vérification
    const verifyResult = await client.query('SELECT email, role, is_active FROM users WHERE email = $1', ['admin@apaddicto.com']);
    if (verifyResult.rows.length > 0) {
      const user = verifyResult.rows[0];
      console.log('🔍 Vérification:', user.email, '- Role:', user.role, '- Active:', user.is_active);
    }
    
    client.release();
    
  } catch (error) {
    console.error('❌ Erreur lors de la promotion:', error.message);
  } finally {
    await pool.end();
  }
}

promoteUserToAdmin().catch(console.error);