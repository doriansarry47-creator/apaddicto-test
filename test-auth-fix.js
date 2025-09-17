import pkg from 'pg';
import { readFileSync } from 'fs';
const { Pool } = pkg;

// Lecture manuelle du fichier .env
const envFile = readFileSync('.env', 'utf8');
const envVars = {};
envFile.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    envVars[key] = valueParts.join('=').replace(/"/g, '');
  }
});

process.env.DATABASE_URL = envVars.DATABASE_URL || process.env.DATABASE_URL;

async function checkAndFixDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔍 Vérification de la structure de la base de données...');

    // Vérifier les tables existantes
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('Tables trouvées:', tablesResult.rows.map(r => r.table_name));

    // Vérifier la structure de la table users
    const usersColumnsResult = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'users'
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `);

    console.log('📊 Structure de la table users:');
    usersColumnsResult.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });

    // Test d'insertion d'un utilisateur
    console.log('\n🧪 Test d\'inscription...');
    
    // Supprimer l'utilisateur test s'il existe
    await pool.query('DELETE FROM users WHERE email = $1', ['test@example.com']);

    // Essayer d'insérer un nouvel utilisateur
    const insertResult = await pool.query(`
      INSERT INTO users (email, password, first_name, last_name, role, created_at, updated_at)
      VALUES ($1, crypt($2, gen_salt('bf')), $3, $4, $5, NOW(), NOW())
      RETURNING id, email, first_name, last_name, role
    `, ['test@example.com', 'password123', 'Test', 'User', 'patient']);

    console.log('✅ Utilisateur créé avec succès:', insertResult.rows[0]);

    // Test d'authentification
    console.log('\n🔐 Test d\'authentification...');
    const authResult = await pool.query(`
      SELECT id, email, first_name, last_name, role 
      FROM users 
      WHERE email = $1 AND password = crypt($2, password)
    `, ['test@example.com', 'password123']);

    if (authResult.rows.length > 0) {
      console.log('✅ Authentification réussie:', authResult.rows[0]);
    } else {
      console.log('❌ Échec de l\'authentification');
    }

    // Nettoyage
    await pool.query('DELETE FROM users WHERE email = $1', ['test@example.com']);
    console.log('🧹 Nettoyage terminé');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error('Détails:', error);
  } finally {
    await pool.end();
  }
}

console.log('🚀 Début du test d\'authentification...');
checkAndFixDatabase().then(() => {
  console.log('✅ Test terminé');
}).catch(error => {
  console.error('💥 Erreur fatale:', error);
});
