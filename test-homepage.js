#!/usr/bin/env node

/**
 * Test utilisateur pour vérifier que la page d'accueil fonctionne
 * Ce script teste l'accès à la page d'accueil de l'application
 */

const axios = require('axios');

async function testHomepage(baseUrl = 'http://localhost:3000') {
  console.log('🧪 Test de la page d\'accueil de l\'application');
  console.log(`🔗 URL de test: ${baseUrl}`);
  
  try {
    // Test 1: Vérifier que l'application répond
    console.log('\n1️⃣ Test de connectivité...');
    const response = await axios.get(baseUrl, {
      timeout: 10000,
      validateStatus: () => true // Accept all status codes
    });
    
    console.log(`   ✅ Status: ${response.status}`);
    console.log(`   📄 Content-Type: ${response.headers['content-type']}`);
    
    // Test 2: Vérifier le contenu HTML
    console.log('\n2️⃣ Test du contenu de la page...');
    const html = response.data;
    
    if (typeof html === 'string') {
      const checks = [
        { name: 'Document HTML', test: html.includes('<html'), critical: true },
        { name: 'Titre de la page', test: html.includes('<title>'), critical: true },
        { name: 'Root div React', test: html.includes('id="root"'), critical: true },
        { name: 'Scripts JS', test: html.includes('<script'), critical: true },
        { name: 'Meta charset', test: html.includes('charset'), critical: false },
        { name: 'Meta viewport', test: html.includes('viewport'), critical: false }
      ];
      
      let criticalPassed = 0;
      let totalCritical = 0;
      
      checks.forEach(check => {
        const status = check.test ? '✅' : '❌';
        const critical = check.critical ? '(CRITIQUE)' : '(optionnel)';
        console.log(`   ${status} ${check.name} ${critical}`);
        
        if (check.critical) {
          totalCritical++;
          if (check.test) criticalPassed++;
        }
      });
      
      // Test 3: Vérifier la structure de base
      console.log('\n3️⃣ Test de la structure de l\'application...');
      
      if (criticalPassed === totalCritical) {
        console.log('   ✅ Tous les tests critiques réussis');
        
        // Test bonus: vérifier s'il y a des erreurs évidentes
        const hasErrors = html.toLowerCase().includes('error') || 
                         html.toLowerCase().includes('cannot') ||
                         html.toLowerCase().includes('undefined');
        
        if (!hasErrors) {
          console.log('   ✅ Aucune erreur évidente détectée');
        } else {
          console.log('   ⚠️  Erreurs potentielles détectées dans le HTML');
        }
        
        // Résumé final
        console.log('\n🎉 RÉSULTAT DU TEST');
        console.log('================');
        console.log('✅ L\'application est accessible');
        console.log('✅ La page d\'accueil se charge correctement');
        console.log('✅ La structure HTML de base est présente');
        console.log('\n📝 Instructions pour l\'utilisateur:');
        console.log(`   1. Ouvrez votre navigateur`);
        console.log(`   2. Allez à l'adresse: ${baseUrl}`);
        console.log(`   3. Vous devriez voir la page d'accueil de l'application`);
        
        return true;
      } else {
        console.log(`   ❌ ${totalCritical - criticalPassed}/${totalCritical} tests critiques échoués`);
        return false;
      }
      
    } else {
      console.log('   ❌ La réponse n\'est pas du HTML valide');
      return false;
    }
    
  } catch (error) {
    console.log('\n❌ ERREUR LORS DU TEST');
    console.log('====================');
    
    if (error.code === 'ECONNREFUSED') {
      console.log('🔌 Connexion refusée - L\'application n\'est pas démarrée');
      console.log('\n📝 Solutions possibles:');
      console.log('   1. Démarrez l\'application avec: npm run dev');
      console.log('   2. Ou avec PM2: pm2 start ecosystem.config.js');
      console.log('   3. Vérifiez que le port 3000 est libre');
    } else if (error.code === 'ENOTFOUND') {
      console.log('🌐 Hôte non trouvé - Vérifiez l\'URL');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('⏰ Timeout - L\'application met trop de temps à répondre');
    } else {
      console.log(`❌ Erreur: ${error.message}`);
    }
    
    return false;
  }
}

// Test en ligne de commande
if (require.main === module) {
  const baseUrl = process.argv[2] || 'http://localhost:3000';
  testHomepage(baseUrl)
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Erreur inattendue:', error);
      process.exit(1);
    });
}

module.exports = { testHomepage };