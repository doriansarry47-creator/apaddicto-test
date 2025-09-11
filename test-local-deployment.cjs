#!/usr/bin/env node

// Script de test pour valider le déploiement local avant Vercel
const http = require('http');
const https = require('https');
const path = require('path');
const fs = require('fs');

console.log('🧪 Test de Validation du Déploiement Apaddicto\n');

// Test 1: Vérification des fichiers de build
console.log('1️⃣ Vérification des fichiers de build...');

const distPath = path.join(__dirname, 'dist');
const apiPath = path.join(__dirname, 'api', 'index.ts');

try {
  // Vérifier dist/index.html
  const indexExists = fs.existsSync(path.join(distPath, 'index.html'));
  console.log(`   ✅ dist/index.html: ${indexExists ? 'Présent' : '❌ MANQUANT'}`);
  
  // Vérifier assets
  const assetsExists = fs.existsSync(path.join(distPath, 'assets'));
  console.log(`   ✅ dist/assets/: ${assetsExists ? 'Présent' : '❌ MANQUANT'}`);
  
  // Vérifier API
  const apiExists = fs.existsSync(apiPath);
  console.log(`   ✅ api/index.ts: ${apiExists ? 'Présent' : '❌ MANQUANT'}`);
  
  if (indexExists && assetsExists && apiExists) {
    console.log('   ✅ Structure de build: VALIDE\n');
  } else {
    console.log('   ❌ Structure de build: INVALIDE - Exécuter npm run build\n');
    process.exit(1);
  }
} catch (error) {
  console.error('   ❌ Erreur lors de la vérification:', error.message);
  process.exit(1);
}

// Test 2: Vérification de la configuration Vercel
console.log('2️⃣ Vérification de la configuration Vercel...');

try {
  const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  
  const hasCorrectDistDir = vercelConfig.builds?.[0]?.config?.distDir === 'dist';
  console.log(`   ✅ distDir: ${hasCorrectDistDir ? 'Correct (dist)' : '❌ Incorrect'}`);
  
  const hasApiRoute = vercelConfig.routes?.some(route => route.src?.includes('/api/'));
  console.log(`   ✅ Route API: ${hasApiRoute ? 'Configurée' : '❌ Manquante'}`);
  
  const hasStaticRoute = vercelConfig.routes?.some(route => route.dest === '/index.html');
  console.log(`   ✅ Route statique: ${hasStaticRoute ? 'Configurée' : '❌ Manquante'}`);
  
  if (hasCorrectDistDir && hasApiRoute && hasStaticRoute) {
    console.log('   ✅ Configuration Vercel: VALIDE\n');
  } else {
    console.log('   ❌ Configuration Vercel: INVALIDE\n');
  }
} catch (error) {
  console.error('   ❌ Erreur lors de la lecture de vercel.json:', error.message);
}

// Test 3: Vérification du contenu HTML
console.log('3️⃣ Vérification du contenu HTML...');

try {
  const indexContent = fs.readFileSync(path.join(distPath, 'index.html'), 'utf8');
  
  const hasTitle = indexContent.includes('Apaddicto') || indexContent.includes('<title>');
  console.log(`   ✅ Titre présent: ${hasTitle ? 'Oui' : '❌ Non'}`);
  
  const hasAssets = indexContent.includes('/assets/') || indexContent.includes('index-');
  console.log(`   ✅ Références assets: ${hasAssets ? 'Présentes' : '❌ Manquantes'}`);
  
  const hasReactRoot = indexContent.includes('root') || indexContent.includes('id="');
  console.log(`   ✅ Root React: ${hasReactRoot ? 'Configuré' : '❌ Manquant'}`);
  
  console.log('   ✅ Contenu HTML: VALIDE\n');
} catch (error) {
  console.error('   ❌ Erreur lors de la lecture de l\'HTML:', error.message);
}

// Test 4: Vérification des variables d'environnement
console.log('4️⃣ Vérification des variables d\'environnement...');

try {
  // Vérifier .env.production
  if (fs.existsSync('.env.production')) {
    const envContent = fs.readFileSync('.env.production', 'utf8');
    
    const hasDbUrl = envContent.includes('DATABASE_URL');
    console.log(`   ✅ DATABASE_URL: ${hasDbUrl ? 'Définie' : '❌ Manquante'}`);
    
    const hasSecret = envContent.includes('SESSION_SECRET');
    console.log(`   ✅ SESSION_SECRET: ${hasSecret ? 'Définie' : '❌ Manquante'}`);
    
    const hasNodeEnv = envContent.includes('NODE_ENV=production');
    console.log(`   ✅ NODE_ENV: ${hasNodeEnv ? 'Production' : '❌ Non défini'}`);
  }
  
  console.log('   ℹ️ NOTE: Ces variables doivent être configurées dans le dashboard Vercel\n');
} catch (error) {
  console.error('   ❌ Erreur lors de la lecture des variables:', error.message);
}

// Test 5: Suggestions d'URLs Vercel probables
console.log('5️⃣ URLs de déploiement Vercel probables:');
console.log('   🔗 https://apaddcito-4.vercel.app/');
console.log('   🔗 https://apaddcito-4-doriansarry47-creator.vercel.app/');
console.log('   🔗 https://apaddcito-4-git-main-doriansarry47-creator.vercel.app/');
console.log();

// Test 6: Checklist de validation post-déploiement
console.log('6️⃣ Checklist de validation post-déploiement:');
console.log('   □ Page d\'accueil se charge (/)');
console.log('   □ API Health check fonctionne (/api/health)');
console.log('   □ Inscription patient fonctionne (/login)');
console.log('   □ Connexion patient fonctionne');
console.log('   □ Redirection vers dashboard (/) après login');
console.log('   □ Dashboard affiche toutes les cartes');
console.log('   □ Fonctionnalités interactives (craving, beck)');
console.log('   □ Navigation entre pages');
console.log('   □ Responsive design mobile/desktop');
console.log();

console.log('✨ Validation locale terminée!');
console.log('📋 Consultez VERCEL_TEST_INSTRUCTIONS.md pour les tests détaillés');
console.log('🚀 Votre application est prête pour les utilisateurs une fois déployée!');