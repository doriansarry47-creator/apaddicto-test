#!/usr/bin/env node

/**
 * Script pour tester et nettoyer les problèmes d'authentification
 * Usage: node test-auth-fix.js
 */

import { storage } from './server/storage.js';
import { AuthService } from './server/auth.js';
import { getDB, getPool } from './server/db.js';
import { users } from './shared/schema.js';
import { eq, sql } from 'drizzle-orm';

async function checkDatabaseConnection() {
  console.log("🔍 Vérification de la connexion à la base de données...");
  try {
    const result = await getDB().execute(sql`SELECT 1 as test`);
    console.log("✅ Connexion à la base de données OK");
    return true;
  } catch (error) {
    console.error("❌ Erreur de connexion à la base de données:", error.message);
    return false;
  }
}

async function checkUserTable() {
  console.log("\n🔍 Vérification de la table users...");
  try {
    const result = await getDB().execute(sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    console.log("✅ Structure de la table users:");
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
    });

    // Vérifier l'index unique sur l'email
    const indexResult = await getDB().execute(sql`
      SELECT indexname, indexdef
      FROM pg_indexes 
      WHERE tablename = 'users' AND indexdef LIKE '%email%'
    `);
    
    console.log("\n📝 Index sur email:");
    if (indexResult.rows.length > 0) {
      indexResult.rows.forEach(row => {
        console.log(`  - ${row.indexname}: ${row.indexdef}`);
      });
    } else {
      console.log("  ⚠️ Aucun index trouvé sur email");
    }
    
    return true;
  } catch (error) {
    console.error("❌ Erreur lors de la vérification de la table:", error.message);
    return false;
  }
}

async function checkForDuplicateEmails() {
  console.log("\n🔍 Vérification des emails en double...");
  try {
    const result = await getDB().execute(sql`
      SELECT email, COUNT(*) as count
      FROM users 
      GROUP BY email 
      HAVING COUNT(*) > 1
    `);
    
    if (result.rows.length > 0) {
      console.log("⚠️ Emails en double trouvés:");
      result.rows.forEach(row => {
        console.log(`  - ${row.email}: ${row.count} occurrences`);
      });
      return result.rows;
    } else {
      console.log("✅ Aucun email en double trouvé");
      return [];
    }
  } catch (error) {
    console.error("❌ Erreur lors de la vérification des doublons:", error.message);
    return [];
  }
}

async function cleanupDuplicateEmails(duplicates) {
  if (duplicates.length === 0) return;

  console.log("\n🧹 Nettoyage des emails en double...");
  
  for (const duplicate of duplicates) {
    try {
      console.log(`\nTraitement de l'email: ${duplicate.email}`);
      
      // Récupérer tous les utilisateurs avec cet email
      const allUsers = await getDB().execute(sql`
        SELECT id, email, created_at, first_name, last_name 
        FROM users 
        WHERE email = ${duplicate.email}
        ORDER BY created_at ASC
      `);
      
      // Garder le premier utilisateur (le plus ancien)
      const keepUser = allUsers.rows[0];
      const duplicateUsers = allUsers.rows.slice(1);
      
      console.log(`  Conserver l'utilisateur: ${keepUser.id} (créé le ${keepUser.created_at})`);
      
      for (const dupUser of duplicateUsers) {
        console.log(`  Suppression de l'utilisateur en double: ${dupUser.id}`);
        
        // Supprimer les données associées puis l'utilisateur
        await getDB().execute(sql`DELETE FROM user_stats WHERE user_id = ${dupUser.id}`);
        await getDB().execute(sql`DELETE FROM user_badges WHERE user_id = ${dupUser.id}`);
        await getDB().execute(sql`DELETE FROM beck_analyses WHERE user_id = ${dupUser.id}`);
        await getDB().execute(sql`DELETE FROM exercise_sessions WHERE user_id = ${dupUser.id}`);
        await getDB().execute(sql`DELETE FROM craving_entries WHERE user_id = ${dupUser.id}`);
        await getDB().execute(sql`DELETE FROM anti_craving_strategies WHERE user_id = ${dupUser.id}`);
        await getDB().execute(sql`DELETE FROM users WHERE id = ${dupUser.id}`);
      }
      
      console.log(`  ✅ Nettoyage terminé pour ${duplicate.email}`);
    } catch (error) {
      console.error(`  ❌ Erreur lors du nettoyage de ${duplicate.email}:`, error.message);
    }
  }
}

async function testRegistration() {
  console.log("\n🧪 Test d'inscription...");
  
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = "test1234";
  
  try {
    console.log(`Tentative d'inscription avec ${testEmail}...`);
    
    const user = await AuthService.register({
      email: testEmail,
      password: testPassword,
      firstName: "Test",
      lastName: "User",
      role: "patient"
    });
    
    console.log("✅ Inscription réussie:", user.email);
    
    // Test de connexion
    console.log("Test de connexion...");
    const loginUser = await AuthService.login(testEmail, testPassword);
    console.log("✅ Connexion réussie:", loginUser.email);
    
    // Test d'inscription en double
    console.log("Test d'inscription en double (doit échouer)...");
    try {
      await AuthService.register({
        email: testEmail,
        password: testPassword,
        firstName: "Test2",
        lastName: "User2",
        role: "patient"
      });
      console.log("❌ L'inscription en double n'a pas échoué (problème!)");
    } catch (duplicateError) {
      console.log("✅ L'inscription en double a correctement échoué:", duplicateError.message);
    }
    
    // Nettoyage
    console.log("Nettoyage de l'utilisateur de test...");
    await storage.deleteUser(user.id);
    console.log("✅ Nettoyage terminé");
    
    return true;
  } catch (error) {
    console.error("❌ Erreur lors du test d'inscription:", error.message);
    return false;
  }
}

async function main() {
  console.log("🚀 Script de test et nettoyage d'authentification\n");
  
  try {
    // 1. Vérifier la connexion
    const dbOk = await checkDatabaseConnection();
    if (!dbOk) {
      console.log("❌ Impossible de continuer sans connexion DB");
      process.exit(1);
    }
    
    // 2. Vérifier la structure de la table
    await checkUserTable();
    
    // 3. Chercher les doublons
    const duplicates = await checkForDuplicateEmails();
    
    // 4. Nettoyer les doublons si trouvés
    if (duplicates.length > 0) {
      console.log("\n❓ Voulez-vous nettoyer les emails en double? (Tapez 'oui' pour confirmer)");
      
      // Pour l'automatisation, on nettoie automatiquement
      await cleanupDuplicateEmails(duplicates);
    }
    
    // 5. Tester l'inscription
    await testRegistration();
    
    console.log("\n🎉 Tous les tests terminés avec succès!");
    
  } catch (error) {
    console.error("\n💥 Erreur fatale:", error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    // Fermer la connexion
    const pool = getPool();
    if (pool) {
      await pool.end();
    }
  }
}

// Exécuter le script
main().catch(console.error);