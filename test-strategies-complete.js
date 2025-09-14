#!/usr/bin/env node

// Test complet des stratégies avec gestion de session

import fetch from 'node-fetch';
import tough from 'tough-cookie';
import { wrapper } from 'axios-cookiejar-support';
import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

// Configuration d'un client avec gestion des cookies
const { CookieJar } = tough;
const cookieJar = new CookieJar();
const client = wrapper(axios.create({ 
  baseURL: BASE_URL,
  jar: cookieJar,
  withCredentials: true 
}));

async function testCompleteFlow() {
  console.log('🚀 Test complet du flux de stratégies avec session...\n');
  
  try {
    // Étape 1: Connexion
    console.log('🔑 Connexion...');
    const loginResponse = await client.post('/api/auth/login', {
      email: 'demo@example.com',
      password: 'demo123'
    });
    
    const user = loginResponse.data.user;
    console.log('✅ Connecté:', user.email);
    
    // Étape 2: Sauvegarder des stratégies
    console.log('\n💾 Sauvegarde de stratégies...');
    const testStrategies = [
      {
        context: 'leisure',
        exercise: 'Course à pied avec musique motivante',
        effort: 'modéré',
        duration: 25,
        cravingBefore: 9,
        cravingAfter: 3
      },
      {
        context: 'home',
        exercise: 'Séance de yoga avec vidéo YouTube',
        effort: 'faible',
        duration: 20,
        cravingBefore: 7,
        cravingAfter: 2
      }
    ];
    
    const saveResponse = await client.post('/api/strategies', {
      strategies: testStrategies
    });
    
    console.log('✅ Stratégies sauvegardées:', saveResponse.data.length);
    
    // Étape 3: Récupérer les stratégies
    console.log('\n📋 Récupération des stratégies...');
    const getResponse = await client.get('/api/strategies');
    const strategies = getResponse.data;
    
    console.log('✅ Stratégies récupérées:', strategies.length);
    
    // Étape 4: Afficher les détails
    if (strategies.length > 0) {
      console.log('\n📊 Détail des stratégies:');
      strategies.forEach((strategy, index) => {
        const efficacite = strategy.cravingBefore - strategy.cravingAfter;
        const contexte = {
          'leisure': 'Loisirs',
          'home': 'Domicile', 
          'work': 'Travail'
        }[strategy.context];
        
        console.log(`  ${index + 1}. ${contexte} - ${strategy.exercise.substring(0, 40)}...`);
        console.log(`     Durée: ${strategy.duration}min | Effort: ${strategy.effort}`);
        console.log(`     Craving: ${strategy.cravingBefore} → ${strategy.cravingAfter} (${efficacite > 0 ? '-' : '+'}${Math.abs(efficacite)} pts)`);
        console.log(`     Créé le: ${new Date(strategy.createdAt).toLocaleString('fr-FR')}\n`);
      });
    }
    
    // Étape 5: Test des statistiques utilisateur
    console.log('📈 Vérification des statistiques...');
    const statsResponse = await client.get('/api/users/stats');
    const stats = statsResponse.data;
    
    console.log('✅ Statistiques utilisateur récupérées');
    console.log(`   - Exercices complétés: ${stats.exercisesCompleted || 0}`);
    console.log(`   - Série actuelle: ${stats.currentStreak || 0} jours`);
    console.log(`   - Craving moyen: ${stats.averageCraving || 'N/A'}`);
    
    console.log('\n🎉 Tous les tests sont passés avec succès!');
    console.log('✅ Le système de stratégies fonctionne correctement avec l\'authentification.');
    
    return true;
    
  } catch (error) {
    console.error('\n❌ Erreur dans le test:', error.response ? {
      status: error.response.status,
      statusText: error.response.statusText,
      data: error.response.data
    } : error.message);
    
    return false;
  }
}

async function testWithoutLogin() {
  console.log('\n🔒 Test sans authentification (doit échouer)...');
  
  try {
    const response = await client.get('/api/strategies');
    console.log('❌ ERREUR: La requête a réussi alors qu\'elle devrait échouer');
    return false;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log('✅ Bon: La requête échoue comme attendu (401 Unauthorized)');
      return true;
    } else {
      console.error('❌ Erreur inattendue:', error.message);
      return false;
    }
  }
}

// Fonction principale
async function main() {
  console.log('='.repeat(60));
  console.log('🧪 TEST COMPLET DU SYSTÈME DE STRATÉGIES ANTI-CRAVING');
  console.log('='.repeat(60));
  
  // Test 1: Sans authentification
  const unauthTest = await testWithoutLogin();
  
  console.log('\n' + '-'.repeat(60));
  
  // Test 2: Avec authentification complète
  const completeTest = await testCompleteFlow();
  
  console.log('\n' + '='.repeat(60));
  
  if (unauthTest && completeTest) {
    console.log('🎉 RÉSULTAT: TOUS LES TESTS SONT PASSÉS');
    console.log('✅ Le système de stratégies anti-craving fonctionne correctement!');
    
    console.log('\n💡 Instructions pour l\'utilisateur:');
    console.log('   1. Connectez-vous à l\'application');
    console.log('   2. Utilisez la "Boîte à Stratégies Anti-Craving" depuis l\'accueil');
    console.log('   3. Remplissez les stratégies et cliquez "Sauvegarder dans l\'onglet Suivi"');
    console.log('   4. Vérifiez dans l\'onglet "Suivi" > "Stratégies"');
    
  } else {
    console.log('❌ RÉSULTAT: CERTAINS TESTS ONT ÉCHOUÉ');
    console.log('🔍 Vérifiez les erreurs ci-dessus pour diagnostiquer le problème');
  }
  
  console.log('='.repeat(60));
}

main().catch(console.error);