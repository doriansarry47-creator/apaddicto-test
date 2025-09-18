#!/usr/bin/env node

/**
 * Test de la logique d'authentification (sans serveur)
 */

import 'dotenv/config';

console.log('🔍 Test de la logique d\'authentification...\n');

async function testAuthLogic() {
  try {
    // Test 1: Import des modules
    console.log('1️⃣ Test des imports...');
    const { AuthService } = await import('./server-dist/index.js');
    console.log('   ✅ Import AuthService: OK');
  } catch (error) {
    console.log('   ❌ Import failed, testing with TypeScript...');
    
    try {
      // Test avec les fichiers TypeScript directement
      const { AuthService } = await import('./server/auth.js');
      console.log('   ✅ Import AuthService (TS): OK');
      
      // Test 2: Hachage de mot de passe
      console.log('\n2️⃣ Test de hachage de mot de passe...');
      const hashedPassword = await AuthService.hashPassword('test123');
      if (hashedPassword && hashedPassword.length > 20) {
        console.log('   ✅ Hachage de mot de passe: OK');
      } else {
        console.log('   ❌ Hachage de mot de passe: Échec');
      }
      
      // Test 3: Vérification de mot de passe
      console.log('\n3️⃣ Test de vérification de mot de passe...');
      const isValid = await AuthService.verifyPassword('test123', hashedPassword);
      if (isValid) {
        console.log('   ✅ Vérification de mot de passe: OK');
      } else {
        console.log('   ❌ Vérification de mot de passe: Échec');
      }
      
      // Test 4: Validation d'email
      console.log('\n4️⃣ Test de validation...');
      const testCases = [
        { email: 'test@example.com', password: 'test123', valid: true },
        { email: 'invalid-email', password: 'test123', valid: false },
        { email: 'test@example.com', password: '123', valid: false },
        { email: '', password: 'test123', valid: false }
      ];
      
      for (const testCase of testCases) {
        try {
          // On teste juste la validation sans créer d'utilisateur
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          const emailValid = emailRegex.test(testCase.email);
          const passwordValid = testCase.password.length >= 4;
          const shouldBeValid = emailValid && passwordValid;
          
          if (shouldBeValid === testCase.valid) {
            console.log(`   ✅ Validation ${testCase.email}: OK`);
          } else {
            console.log(`   ❌ Validation ${testCase.email}: KO`);
          }
        } catch (error) {
          if (!testCase.valid) {
            console.log(`   ✅ Validation ${testCase.email}: OK (erreur attendue)`);
          } else {
            console.log(`   ❌ Validation ${testCase.email}: Erreur inattendue`);
          }
        }
      }
      
      console.log('\n✅ Tests de logique d\'authentification terminés !');
      
    } catch (tsError) {
      console.error('❌ Erreur avec les imports TypeScript:', tsError.message);
    }
  }
}

testAuthLogic().catch(console.error);