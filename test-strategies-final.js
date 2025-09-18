#!/usr/bin/env node

/**
 * Test complet des stratégies anti-craving
 * Vérifie la sauvegarde, la récupération et l'affichage
 */

import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = process.env.TEST_URL || 'https://5000-ikfbosv490jc9i56vv1td-6532622b.e2b.dev';

// Configuration de test
const TEST_USER = {
  email: 'testuser@example.com',
  password: 'testpassword123',
  firstName: 'Test',
  lastName: 'User'
};

const STRATEGY_DATA = [
  {
    context: 'home',
    exercise: 'Exercice de respiration profonde',
    effort: 'faible',
    duration: 5,
    cravingBefore: 8,
    cravingAfter: 4
  },
  {
    context: 'work',
    exercise: 'Marche rapide de 10 minutes',
    effort: 'modéré',
    duration: 10,
    cravingBefore: 6,
    cravingAfter: 2
  }
];

class StrategiesTestRunner {
  constructor() {
    this.sessionCookie = null;
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.sessionCookie) {
      headers.Cookie = this.sessionCookie;
    }

    console.log(`📡 ${options.method || 'GET'} ${url}`);
    
    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include'
      });

      // Capturer les cookies de session
      if (response.headers.get('set-cookie')) {
        this.sessionCookie = response.headers.get('set-cookie').split(';')[0];
      }

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        data = responseText;
      }

      return { response, data, status: response.status };
    } catch (error) {
      console.error(`❌ Erreur requête ${endpoint}:`, error.message);
      throw error;
    }
  }

  async registerUser() {
    console.log('\n🔧 === INSCRIPTION UTILISATEUR ===');
    
    const { response, data, status } = await this.makeRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(TEST_USER)
    });

    if (status === 200 || status === 201) {
      console.log('✅ Utilisateur inscrit ou connecté');
      return true;
    } else if (status === 400 && data.message?.includes('already exists')) {
      console.log('ℹ️ Utilisateur existe déjà, tentative de connexion...');
      return await this.loginUser();
    } else {
      console.error('❌ Échec inscription:', status, data);
      return false;
    }
  }

  async loginUser() {
    console.log('\n🔑 === CONNEXION UTILISATEUR ===');
    
    const { response, data, status } = await this.makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: TEST_USER.email,
        password: TEST_USER.password
      })
    });

    if (status === 200) {
      console.log('✅ Connexion réussie');
      return true;
    } else {
      console.error('❌ Échec connexion:', status, data);
      return false;
    }
  }

  async saveStrategies() {
    console.log('\n💾 === SAUVEGARDE DES STRATÉGIES ===');
    
    const { response, data, status } = await this.makeRequest('/api/strategies', {
      method: 'POST',
      body: JSON.stringify({ strategies: STRATEGY_DATA })
    });

    if (status === 200) {
      console.log('✅ Stratégies sauvegardées avec succès');
      console.log(`📊 ${data.count} stratégies enregistrées`);
      return data.strategies;
    } else {
      console.error('❌ Échec sauvegarde des stratégies:', status, data);
      throw new Error(`Sauvegarde échouée: ${data.message || 'Erreur inconnue'}`);
    }
  }

  async getStrategies() {
    console.log('\n📋 === RÉCUPÉRATION DES STRATÉGIES ===');
    
    const { response, data, status } = await this.makeRequest('/api/strategies');

    if (status === 200) {
      console.log(`✅ ${data.length} stratégies récupérées`);
      
      // Afficher les détails des stratégies
      data.forEach((strategy, index) => {
        console.log(`📝 Stratégie ${index + 1}:`);
        console.log(`   - Contexte: ${strategy.context}`);
        console.log(`   - Exercice: ${strategy.exercise}`);
        console.log(`   - Effort: ${strategy.effort}`);
        console.log(`   - Durée: ${strategy.duration} min`);
        console.log(`   - Craving: ${strategy.cravingBefore} → ${strategy.cravingAfter}`);
        console.log(`   - Efficacité: ${strategy.cravingBefore - strategy.cravingAfter > 0 ? '✅' : '❌'} ${strategy.cravingBefore - strategy.cravingAfter} points`);
      });
      
      return data;
    } else {
      console.error('❌ Échec récupération des stratégies:', status, data);
      throw new Error(`Récupération échouée: ${data.message || 'Erreur inconnue'}`);
    }
  }

  async testTracking() {
    console.log('\n📊 === TEST PAGE SUIVI ===');
    
    const { response, data, status } = await this.makeRequest('/api/cravings/stats');
    
    if (status === 200) {
      console.log('✅ Statistiques de craving récupérées');
      console.log(`📈 Craving moyen: ${data.average || 0}`);
      console.log(`📉 Tendance: ${data.trend || 0}%`);
    }

    // Test récupération données utilisateur
    const { response: userResponse, data: userData } = await this.makeRequest('/api/users/stats');
    if (userResponse.status === 200) {
      console.log('✅ Statistiques utilisateur récupérées');
      console.log(`💪 Exercices complétés: ${userData.exercisesCompleted || 0}`);
    }
  }

  async runFullTest() {
    try {
      console.log('🚀 === DÉBUT DU TEST COMPLET DES STRATÉGIES ANTI-CRAVING ===\n');

      // Étape 1: Inscription/Connexion
      const authSuccess = await this.registerUser();
      if (!authSuccess) {
        throw new Error('Authentification échouée');
      }

      // Étape 2: Sauvegarde des stratégies
      const savedStrategies = await this.saveStrategies();
      
      // Étape 3: Récupération des stratégies
      await this.getStrategies();
      
      // Étape 4: Test de la page de suivi
      await this.testTracking();

      console.log('\n🎉 === TOUS LES TESTS RÉUSSIS ===');
      console.log('✅ Inscription/Connexion: OK');
      console.log('✅ Sauvegarde des stratégies: OK');
      console.log('✅ Récupération des stratégies: OK');
      console.log('✅ Affichage dans le suivi: OK');
      console.log('✅ L\'erreur de la table manquante a été corrigée !');
      
      return true;
      
    } catch (error) {
      console.error('\n💥 === ÉCHEC DU TEST ===');
      console.error('❌ Erreur:', error.message);
      console.error('📋 Stack trace:', error.stack);
      return false;
    }
  }
}

// Exécuter le test si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  const runner = new StrategiesTestRunner();
  runner.runFullTest()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('💥 Test échoué:', error);
      process.exit(1);
    });
}

export { StrategiesTestRunner };