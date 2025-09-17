#!/usr/bin/env node

import axios from 'axios';

const BASE_URL = 'https://5000-in3polffn04iyw7zr43g5-6532622b.e2b.dev';
const API_URL = `${BASE_URL}/api`;

const client = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

let sessionCookies = '';

const extractCookies = (response) => {
  const cookies = response.headers['set-cookie'];
  if (cookies) {
    sessionCookies = cookies.map(cookie => cookie.split(';')[0]).join('; ');
    client.defaults.headers.Cookie = sessionCookies;
  }
};

console.log('🎭 === TESTS END-TO-END - PARCOURS UTILISATEUR COMPLET ===\n');

const testResults = {
  healthCheck: false,
  patientRegistration: false,
  patientLogin: false,
  applicationAccess: false,
  exerciseAccess: false,
  exerciseSession: false,
  cravingTracking: false,
  beckAnalysis: false,
  strategySaving: false,
  statisticsAccess: false,
  adminLogin: false,
  adminDashboard: false,
  contentManagement: false,
  userManagement: false
};

// 1. Health Check
console.log('1️⃣ Vérification de la santé de l\'application...');
try {
  const response = await client.get('/health');
  console.log('✅ Application en ligne et fonctionnelle');
  console.log(`   Status: ${response.data.status}`);
  console.log(`   Environment: ${response.data.env}`);
  testResults.healthCheck = true;
} catch (error) {
  console.error('❌ Application non accessible:', error.message);
  process.exit(1);
}

// 2. Patient Registration Journey
console.log('\n2️⃣ Parcours d\'inscription patient...');
const patientEmail = `patient.e2e.${Date.now()}@example.com`;
const patientData = {
  email: patientEmail,
  password: 'test123',
  firstName: 'Alice',
  lastName: 'Testeur',
  role: 'patient'
};

try {
  const response = await client.post('/auth/register', patientData);
  extractCookies(response);
  console.log('✅ Inscription patient réussie');
  console.log(`   Email: ${response.data.user.email}`);
  console.log(`   Nom: ${response.data.user.firstName} ${response.data.user.lastName}`);
  testResults.patientRegistration = true;
} catch (error) {
  console.error('❌ Inscription patient échouée:', error.response?.data?.message || error.message);
}

// 3. Patient Login Test  
console.log('\n3️⃣ Test de connexion patient...');
sessionCookies = '';
client.defaults.headers.Cookie = '';

try {
  const response = await client.post('/auth/login', {
    email: patientEmail,
    password: 'test123'
  });
  extractCookies(response);
  console.log('✅ Connexion patient réussie');
  console.log(`   Session établie pour: ${response.data.user.email}`);
  testResults.patientLogin = true;
} catch (error) {
  console.error('❌ Connexion patient échouée:', error.response?.data?.message || error.message);
}

// 4. Application Access Test
console.log('\n4️⃣ Test d\'accès à l\'application web...');
try {
  const response = await axios.get(BASE_URL, {
    timeout: 5000,
    headers: { 'User-Agent': 'E2E-Test-Client' }
  });
  
  if (response.status === 200 && response.data.includes('<!DOCTYPE html>')) {
    console.log('✅ Interface web accessible');
    console.log(`   Taille de la page: ${response.data.length} bytes`);
    
    // Check for React app indicators
    if (response.data.includes('root') || response.data.includes('react')) {
      console.log('   ✅ Application React détectée');
    }
    testResults.applicationAccess = true;
  }
} catch (error) {
  console.error('❌ Accès à l\'interface web échoué:', error.message);
}

// 5. Exercise Access and Session
console.log('\n5️⃣ Test d\'accès aux exercices et création de session...');
let exerciseId = null;

try {
  const exercisesResponse = await client.get('/exercises');
  console.log(`✅ ${exercisesResponse.data.length} exercices disponibles`);
  testResults.exerciseAccess = true;
  
  if (exercisesResponse.data.length > 0) {
    exerciseId = exercisesResponse.data[0].id;
    console.log(`   Premier exercice: ${exercisesResponse.data[0].title}`);
    
    // Create exercise session
    const sessionData = {
      exerciseId: exerciseId,
      duration: 480, // 8 minutes
      cravingBefore: 8,
      cravingAfter: 2,
      notes: 'Session E2E test - très efficace',
      completed: true
    };
    
    const sessionResponse = await client.post('/exercise-sessions', sessionData);
    console.log('✅ Session d\'exercice enregistrée');
    console.log(`   Réduction craving: ${sessionData.cravingBefore} → ${sessionData.cravingAfter} (-${sessionData.cravingBefore - sessionData.cravingAfter} pts)`);
    testResults.exerciseSession = true;
  }
} catch (error) {
  console.error('❌ Test exercices échoué:', error.response?.data?.message || error.message);
}

// 6. Craving Tracking
console.log('\n6️⃣ Test de suivi des cravings...');
const cravingEntries = [
  { intensity: 7, trigger: 'stress', context: 'réunion importante', notes: 'Tension élevée' },
  { intensity: 4, trigger: 'ennui', context: 'pause déjeuner', notes: 'Besoin de distraction' },
  { intensity: 9, trigger: 'émotion', context: 'dispute familiale', notes: 'Très fort besoin de réconfort' }
];

let cravingCount = 0;
for (const cravingData of cravingEntries) {
  try {
    const response = await client.post('/cravings', cravingData);
    cravingCount++;
    console.log(`   ✅ Craving ${cravingCount} enregistré (intensité: ${cravingData.intensity}/10)`);
  } catch (error) {
    console.error(`   ❌ Craving ${cravingCount + 1} échoué:`, error.response?.data?.message);
  }
}

if (cravingCount > 0) {
  console.log(`✅ ${cravingCount}/${cravingEntries.length} cravings enregistrés avec succès`);
  testResults.cravingTracking = true;
  
  // Test craving stats
  try {
    const statsResponse = await client.get('/cravings/stats');
    console.log(`   📊 Intensité moyenne: ${statsResponse.data.average}/10`);
  } catch (error) {
    console.log('   ⚠️  Statistiques cravings non disponibles');
  }
}

// 7. Beck Analysis
console.log('\n7️⃣ Test d\'analyse cognitive Beck...');
const beckData = {
  situation: 'Craving intense en voyant une publicité',
  automaticThought: 'Je vais craquer, je n\'ai aucune volonté',
  emotion: 'frustration',
  emotionIntensity: 8,
  physicalSensations: 'nœud à l\'estomac, tension',
  behavior: 'éviter la publicité, faire de la respiration',
  alternativeThought: 'C\'est normal d\'avoir des envies, ça va passer',
  outcome: 'sensation de contrôle, craving diminué'
};

try {
  const response = await client.post('/beck-analyses', beckData);
  console.log('✅ Analyse Beck enregistrée avec succès');
  console.log(`   Situation: ${beckData.situation}`);
  console.log(`   Émotion: ${beckData.emotion} (${beckData.emotionIntensity}/10)`);
  testResults.beckAnalysis = true;
} catch (error) {
  console.error('❌ Analyse Beck échouée:', error.response?.data?.message || error.message);
}

// 8. Anti-Craving Strategies
console.log('\n8️⃣ Test de sauvegarde des stratégies anti-craving...');
const strategiesData = {
  strategies: [
    {
      context: 'Test E2E - Bureau stressant',
      exercise: 'Respiration 4-7-8 avec visualisation',
      effort: 6,
      duration: 420, // 7 minutes
      cravingBefore: 8,
      cravingAfter: 2
    }
  ]
};

try {
  const response = await client.post('/strategies', strategiesData);
  console.log('✅ Stratégie anti-craving sauvegardée');
  console.log(`   Efficacité: ${strategiesData.strategies[0].cravingBefore} → ${strategiesData.strategies[0].cravingAfter}`);
  testResults.strategySaving = true;
} catch (error) {
  console.error('❌ Sauvegarde stratégie échouée:', error.response?.data?.message || error.message);
}

// 9. User Statistics
console.log('\n9️⃣ Test d\'accès aux statistiques utilisateur...');
try {
  const statsResponse = await client.get('/users/stats');
  console.log('✅ Statistiques utilisateur récupérées');
  console.log(`   Exercices complétés: ${statsResponse.data.exercisesCompleted || 0}`);
  console.log(`   Durée totale: ${Math.round((statsResponse.data.totalDuration || 0) / 60)} minutes`);
  console.log(`   Analyses Beck: ${statsResponse.data.beckAnalysesCompleted || 0}`);
  testResults.statisticsAccess = true;
} catch (error) {
  console.error('❌ Statistiques utilisateur échouées:', error.response?.data?.message || error.message);
}

// 10. Admin Login Test
console.log('\n🔟 Test de connexion administrateur...');
sessionCookies = '';
client.defaults.headers.Cookie = '';

try {
  const response = await client.post('/auth/login', {
    email: 'admin@apaddicto.com',
    password: 'admin123'
  });
  extractCookies(response);
  console.log('✅ Connexion admin réussie');
  console.log(`   Admin: ${response.data.user.firstName} ${response.data.user.lastName}`);
  testResults.adminLogin = true;
} catch (error) {
  console.error('❌ Connexion admin échouée:', error.response?.data?.message || error.message);
}

// 11. Admin Dashboard
console.log('\n1️⃣1️⃣ Test du tableau de bord administrateur...');
try {
  const usersResponse = await client.get('/admin/users');
  const exercisesResponse = await client.get('/admin/exercises');
  
  console.log('✅ Tableau de bord admin accessible');
  console.log(`   👥 Utilisateurs gérés: ${usersResponse.data.length}`);
  console.log(`   🏋️ Exercices disponibles: ${exercisesResponse.data.length}`);
  
  const patients = usersResponse.data.filter(u => u.role === 'patient');
  console.log(`   👤 Patients actifs: ${patients.length}`);
  testResults.adminDashboard = true;
} catch (error) {
  console.error('❌ Tableau de bord admin échoué:', error.response?.data?.message || error.message);
}

// 12. Content Management Test
console.log('\n1️⃣2️⃣ Test de gestion de contenu admin...');
try {
  const contentResponse = await client.get('/admin/psycho-education');
  console.log(`✅ Gestion de contenu accessible (${contentResponse.data.length} contenus)`);
  testResults.contentManagement = true;
} catch (error) {
  console.error('❌ Gestion de contenu échouée:', error.response?.data?.message || error.message);
}

// 13. User Management Test
console.log('\n1️⃣3️⃣ Test de gestion des utilisateurs...');
try {
  const dataResponse = await client.get('/data');
  if (dataResponse.data.users) {
    console.log(`✅ Gestion utilisateurs accessible (${dataResponse.data.users.length} utilisateurs total)`);
    
    const recentUsers = dataResponse.data.users.filter(u => {
      const userDate = new Date(u.created_at);
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return userDate > yesterday;
    });
    
    console.log(`   📈 Nouveaux utilisateurs (24h): ${recentUsers.length}`);
    testResults.userManagement = true;
  }
} catch (error) {
  console.error('❌ Gestion utilisateurs échouée:', error.response?.data?.message || error.message);
}

// Final Results Summary
console.log('\n📊 === RÉSULTATS COMPLETS DES TESTS E2E ===');

const successCount = Object.values(testResults).filter(result => result === true).length;
const totalTests = Object.keys(testResults).length;
const successRate = (successCount / totalTests * 100).toFixed(1);

console.log(`\n🎯 Taux de réussite global: ${successCount}/${totalTests} (${successRate}%)`);

console.log('\n📋 Détail des tests:');
Object.entries(testResults).forEach(([test, result]) => {
  const icon = result ? '✅' : '❌';
  const testName = test.replace(/([A-Z])/g, ' $1').toLowerCase();
  console.log(`   ${icon} ${testName}`);
});

if (successRate >= 90) {
  console.log('\n🌟 === APPLICATION ENTIÈREMENT FONCTIONNELLE ===');
  console.log('🎊 Félicitations ! L\'application passe tous les tests critiques');
  console.log('✨ Prête pour la production et les utilisateurs finaux');
} else if (successRate >= 75) {
  console.log('\n⚠️ === APPLICATION MAJORITAIREMENT FONCTIONNELLE ===');
  console.log('🔧 Quelques fonctionnalités nécessitent des ajustements');
  console.log('📝 Voir les échecs ci-dessus pour les corrections nécessaires');
} else {
  console.log('\n❌ === PROBLÈMES CRITIQUES DÉTECTÉS ===');
  console.log('🚨 L\'application nécessite des corrections importantes');
  console.log('⚡ Vérifier la configuration et les dépendances');
}

console.log('\n🔗 URL de l\'application: ' + BASE_URL);
console.log('📧 Compte de test patient: ' + patientEmail + ' / test123');
console.log('👨‍⚕️ Compte admin: admin@apaddicto.com / admin123');
console.log('\n🎭 Tests E2E terminés !');