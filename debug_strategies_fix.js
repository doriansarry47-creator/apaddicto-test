#!/usr/bin/env node

/**
 * Script de diagnostic et correction du système de stratégies anti-craving
 * Ce script vérifie et corrige les problèmes potentiels avec la sauvegarde des stratégies
 */

console.log('🔧 DIAGNOSTIC DES STRATÉGIES ANTI-CRAVING');
console.log('=========================================');

// 1. Vérification du schéma de données
console.log('\n📋 1. Vérification du schéma de la base de données...');

const fs = require('fs');
const path = require('path');

// Vérifier le schéma des stratégies dans shared/schema.ts
const schemaPath = path.join(__dirname, 'shared/schema.ts');
if (!fs.existsSync(schemaPath)) {
    console.error('❌ Fichier schema.ts introuvable');
    process.exit(1);
}

const schemaContent = fs.readFileSync(schemaPath, 'utf8');

// Vérifier que la table antiCravingStrategies est bien définie
if (!schemaContent.includes('antiCravingStrategies')) {
    console.error('❌ Table antiCravingStrategies non trouvée dans le schéma');
    process.exit(1);
}

console.log('✅ Table antiCravingStrategies trouvée dans le schéma');

// 2. Vérification de l'API backend
console.log('\n🔌 2. Vérification des routes API...');

const routesPath = path.join(__dirname, 'server/routes.ts');
if (!fs.existsSync(routesPath)) {
    console.error('❌ Fichier routes.ts introuvable');
    process.exit(1);
}

const routesContent = fs.readFileSync(routesPath, 'utf8');

// Vérifier les routes strategies
if (!routesContent.includes('/api/strategies') || !routesContent.includes('POST')) {
    console.error('❌ Route POST /api/strategies non trouvée');
    process.exit(1);
}

console.log('✅ Routes API strategies trouvées');

// 3. Vérification du composant client
console.log('\n⚛️  3. Vérification du composant StrategiesBox...');

const strategiesBoxPath = path.join(__dirname, 'client/src/components/strategies-box.tsx');
if (!fs.existsSync(strategiesBoxPath)) {
    console.error('❌ Composant strategies-box.tsx introuvable');
    process.exit(1);
}

const strategiesBoxContent = fs.readFileSync(strategiesBoxPath, 'utf8');

// Vérifier la mutation de sauvegarde
if (!strategiesBoxContent.includes('saveStrategiesMutation') || !strategiesBoxContent.includes('mutationFn')) {
    console.error('❌ Mutation de sauvegarde non trouvée dans StrategiesBox');
    process.exit(1);
}

console.log('✅ Composant StrategiesBox trouvé et configuré');

// 4. Vérification de l'intégration dans le dashboard
console.log('\n🏠 4. Vérification de l\'intégration dans le dashboard...');

const dashboardPath = path.join(__dirname, 'client/src/pages/dashboard.tsx');
if (!fs.existsSync(dashboardPath)) {
    console.error('❌ Dashboard non trouvé');
    process.exit(1);
}

const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');

if (!dashboardContent.includes('StrategiesBox') || !dashboardContent.includes('showStrategiesBox')) {
    console.error('❌ StrategiesBox non intégré dans le dashboard');
    process.exit(1);
}

console.log('✅ StrategiesBox bien intégré dans le dashboard');

// 5. Vérification de l'affichage dans le tracking
console.log('\n📊 5. Vérification de l\'affichage dans le tracking...');

const trackingPath = path.join(__dirname, 'client/src/pages/tracking.tsx');
if (!fs.existsSync(trackingPath)) {
    console.error('❌ Page tracking non trouvée');
    process.exit(1);
}

const trackingContent = fs.readFileSync(trackingPath, 'utf8');

if (!trackingContent.includes('antiCravingStrategies') || !trackingContent.includes('/api/strategies')) {
    console.error('❌ Stratégies non affichées dans le tracking');
    process.exit(1);
}

console.log('✅ Stratégies bien affichées dans l\'onglet tracking');

console.log('\n🔍 DIAGNOSTIC TERMINÉ - TOUS LES COMPOSANTS SONT PRÉSENTS');
console.log('\n🛠️  CORRECTIONS POTENTIELLES À APPLIQUER...');
