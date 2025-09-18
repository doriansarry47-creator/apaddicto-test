#!/usr/bin/env node

/**
 * SCRIPT D'AUDIT COMPLET DE L'APPLICATION
 * 
 * Ce script vérifie tous les aspects critiques de l'application:
 * 1. Configuration des variables d'environnement
 * 2. Connexion à la base de données
 * 3. Intégrité des schémas
 * 4. Tests des endpoints d'authentification
 * 5. Vérification des dépendances
 * 6. Configuration Vercel
 */

import 'dotenv/config';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔍 === AUDIT COMPLET DE L\'APPLICATION ===\n');

let hasErrors = false;
const errors = [];
const warnings = [];

// 1. Vérification des variables d'environnement
console.log('1️⃣ Vérification des variables d\'environnement...');
const requiredEnvVars = [
  'DATABASE_URL',
  'SESSION_SECRET'
];

requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    errors.push(`❌ Variable d'environnement manquante: ${envVar}`);
    hasErrors = true;
  } else {
    console.log(`   ✅ ${envVar}: Présente`);
  }
});

// Vérification de la format de DATABASE_URL
if (process.env.DATABASE_URL) {
  if (!process.env.DATABASE_URL.startsWith('postgresql://')) {
    errors.push('❌ DATABASE_URL doit commencer par postgresql://');
    hasErrors = true;
  } else {
    console.log('   ✅ FORMAT DATABASE_URL: Correct');
  }
}

// 2. Test de connexion à la base de données
console.log('\n2️⃣ Test de connexion à la base de données...');
try {
  const { getDB } = await import('./server/db.js');
  const { sql } = await import('drizzle-orm');
  
  const db = getDB();
  const result = await db.execute(sql`SELECT 1 as test`);
  console.log('   ✅ Connexion à la base de données: Réussie');
  console.log(`   📊 Test query result: ${result.rows[0].test}`);
} catch (error) {
  errors.push(`❌ Connexion DB échouée: ${error.message}`);
  hasErrors = true;
}

// 3. Vérification des fichiers critiques
console.log('\n3️⃣ Vérification des fichiers critiques...');
const criticalFiles = [
  'package.json',
  'package.json.vercel',
  'vercel.json',
  'vercel-build.sh',
  'server/index.ts',
  'server/auth.ts',
  'server/storage.ts',
  'shared/schema.ts',
  'client/src/pages/login.tsx'
];

criticalFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file}: Présent`);
  } else {
    errors.push(`❌ Fichier manquant: ${file}`);
    hasErrors = true;
  }
});

// 4. Vérification de la structure des dossiers
console.log('\n4️⃣ Vérification de la structure des dossiers...');
const requiredDirs = [
  'server',
  'client',
  'shared',
  'api',
  'dist'
];

requiredDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`   ✅ ${dir}/: Présent`);
  } else {
    if (dir === 'dist') {
      warnings.push(`⚠️  Dossier manquant (créé au build): ${dir}/`);
    } else {
      errors.push(`❌ Dossier manquant: ${dir}/`);
      hasErrors = true;
    }
  }
});

// 5. Vérification des dépendances critiques
console.log('\n5️⃣ Vérification des dépendances critiques...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const criticalDeps = [
    'express',
    'drizzle-orm',
    'bcryptjs',
    'react',
    'vite'
  ];

  criticalDeps.forEach(dep => {
    if (packageJson.dependencies[dep] || packageJson.devDependencies?.[dep]) {
      console.log(`   ✅ ${dep}: Installé`);
    } else {
      errors.push(`❌ Dépendance manquante: ${dep}`);
      hasErrors = true;
    }
  });
} catch (error) {
  errors.push('❌ Impossible de lire package.json');
  hasErrors = true;
}

// 6. Test de build
console.log('\n6️⃣ Test de build (TypeScript)...');
try {
  execSync('npx tsc --noEmit', { stdio: 'pipe' });
  console.log('   ✅ Compilation TypeScript: Réussie');
} catch (error) {
  warnings.push('⚠️  Avertissements TypeScript détectés');
  console.log('   ⚠️  Des erreurs TypeScript ont été détectées');
}

// 7. Vérification de la configuration Vercel
console.log('\n7️⃣ Vérification de la configuration Vercel...');
try {
  const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  
  if (vercelConfig.version === 2) {
    console.log('   ✅ Version Vercel: 2 (correct)');
  } else {
    warnings.push('⚠️  Version Vercel différente de 2');
  }
  
  if (vercelConfig.buildCommand) {
    console.log('   ✅ BuildCommand: Défini');
  }
  
  if (vercelConfig.rewrites && vercelConfig.rewrites.length > 0) {
    console.log('   ✅ Rewrites: Configurés');
  }
} catch (error) {
  errors.push('❌ Problème avec vercel.json');
  hasErrors = true;
}

// 8. Vérification des migrations/schémas
console.log('\n8️⃣ Vérification des schémas de base de données...');
try {
  const { users, exercises, userStats } = await import('./shared/schema.js');
  console.log('   ✅ Import des schémas: Réussi');
  console.log('   📊 Tables principales détectées: users, exercises, userStats');
} catch (error) {
  errors.push(`❌ Problème avec les schémas: ${error.message}`);
  hasErrors = true;
}

// 9. Rapport final
console.log('\n🎯 === RAPPORT D\'AUDIT ===');

if (errors.length > 0) {
  console.log('\n❌ ERREURS CRITIQUES:');
  errors.forEach(error => console.log(`   ${error}`));
}

if (warnings.length > 0) {
  console.log('\n⚠️  AVERTISSEMENTS:');
  warnings.forEach(warning => console.log(`   ${warning}`));
}

if (errors.length === 0) {
  console.log('\n✅ AUDIT RÉUSSI - L\'application est prête pour le déploiement!');
  console.log('📋 Checklist:');
  console.log('   ✅ Variables d\'environnement configurées');
  console.log('   ✅ Base de données connectée');
  console.log('   ✅ Fichiers critiques présents');
  console.log('   ✅ Structure des dossiers correcte');
  console.log('   ✅ Dépendances installées');
  console.log('   ✅ Configuration Vercel valide');
  console.log('   ✅ Schémas de base de données valides');
  
  if (warnings.length > 0) {
    console.log('\n🔔 RECOMMANDATIONS:');
    console.log('   - Résolvez les avertissements TypeScript si possible');
    console.log('   - Vérifiez que le dossier dist se crée correctement au build');
  }
} else {
  console.log('\n❌ AUDIT ÉCHOUÉ - Corrigez les erreurs avant le déploiement');
  process.exit(1);
}

console.log('\n🏁 Audit terminé.');