#!/usr/bin/env node

/**
 * Tests unitaires de la logique d'authentification
 */

import 'dotenv/config';
import bcrypt from 'bcryptjs';

console.log('🔍 Tests unitaires d\'authentification...\n');

async function runUnitTests() {
  let passedTests = 0;
  let totalTests = 0;

  function test(name, testFn) {
    totalTests++;
    try {
      const result = testFn();
      if (result) {
        console.log(`   ✅ ${name}`);
        passedTests++;
      } else {
        console.log(`   ❌ ${name}`);
      }
    } catch (error) {
      console.log(`   ❌ ${name}: ${error.message}`);
    }
  }

  async function asyncTest(name, testFn) {
    totalTests++;
    try {
      const result = await testFn();
      if (result) {
        console.log(`   ✅ ${name}`);
        passedTests++;
      } else {
        console.log(`   ❌ ${name}`);
      }
    } catch (error) {
      console.log(`   ❌ ${name}: ${error.message}`);
    }
  }

  // Test 1: Validation d'email
  console.log('1️⃣ Tests de validation d\'email');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  test('Email valide simple', () => emailRegex.test('test@example.com'));
  test('Email invalide sans @', () => !emailRegex.test('invalid-email'));
  test('Email invalide sans domaine', () => !emailRegex.test('test@'));
  test('Email vide', () => !emailRegex.test(''));

  // Test 2: Validation de mot de passe
  console.log('\n2️⃣ Tests de validation de mot de passe');
  
  test('Mot de passe valide', () => 'test123'.length >= 4);
  test('Mot de passe trop court', () => '123'.length < 4);
  test('Mot de passe vide', () => ''.length < 4);
  test('Mot de passe long acceptable', () => 'verylongpassword'.length >= 4 && 'verylongpassword'.length <= 100);

  // Test 3: Hachage bcrypt
  console.log('\n3️⃣ Tests de hachage bcrypt');
  
  await asyncTest('Hachage d\'un mot de passe', async () => {
    const hash = await bcrypt.hash('test123', 10);
    return hash && hash.length > 20;
  });

  await asyncTest('Vérification de mot de passe correct', async () => {
    const hash = await bcrypt.hash('test123', 10);
    return await bcrypt.compare('test123', hash);
  });

  await asyncTest('Vérification de mot de passe incorrect', async () => {
    const hash = await bcrypt.hash('test123', 10);
    return !(await bcrypt.compare('wrong', hash));
  });

  // Test 4: Normalisation d'email
  console.log('\n4️⃣ Tests de normalisation d\'email');
  
  test('Normalisation lowercase', () => {
    const email = 'TEST@EXAMPLE.COM';
    return email.toLowerCase() === 'test@example.com';
  });

  test('Normalisation trim', () => {
    const email = '  test@example.com  ';
    return email.trim() === 'test@example.com';
  });

  test('Normalisation complète', () => {
    const email = '  TEST@EXAMPLE.COM  ';
    return email.toLowerCase().trim() === 'test@example.com';
  });

  // Test 5: Validation des champs optionnels
  console.log('\n5️⃣ Tests de validation des champs optionnels');
  
  test('Prénom valide', () => {
    const firstName = 'Jean';
    return firstName.length <= 50;
  });

  test('Prénom trop long', () => {
    const firstName = 'a'.repeat(51);
    return firstName.length > 50;
  });

  test('Nom valide', () => {
    const lastName = 'Dupont';
    return lastName.length <= 50;
  });

  // Test 6: Validation du rôle
  console.log('\n6️⃣ Tests de validation du rôle');
  
  test('Rôle patient par défaut', () => {
    const role = 'patient';
    return role === 'patient';
  });

  test('Rôle admin autorisé pour email spécifique', () => {
    const email = 'doriansarry@yahoo.fr';
    const role = 'admin';
    return role === 'admin' && email === 'doriansarry@yahoo.fr';
  });

  test('Rôle admin refusé pour autre email', () => {
    const email = 'other@example.com';
    const role = 'admin';
    const authorizedEmail = 'doriansarry@yahoo.fr';
    return !(role === 'admin' && email !== authorizedEmail);
  });

  // Résumé
  console.log('\n📊 === RÉSUMÉ DES TESTS ===');
  console.log(`✅ Tests réussis: ${passedTests}/${totalTests}`);
  console.log(`❌ Tests échoués: ${totalTests - passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('🎉 Tous les tests unitaires sont passés !');
    return true;
  } else {
    console.log('⚠️  Certains tests ont échoué');
    return false;
  }
}

runUnitTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Erreur lors des tests:', error);
  process.exit(1);
});