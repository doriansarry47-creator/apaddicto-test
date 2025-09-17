#!/usr/bin/env node

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const BASE_URL = 'http://localhost:5000';
const ADMIN_EMAIL = 'admin@apaddicto.com';
const ADMIN_PASSWORD = 'admin123';

let sessionCookie = null;

// Fonction pour effectuer des requêtes avec cookies
async function apiRequest(method, url, data = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(sessionCookie && { 'Cookie': sessionCookie })
    }
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  const response = await fetch(`${BASE_URL}${url}`, options);
  
  // Capturer le cookie de session
  if (response.headers.get('set-cookie')) {
    sessionCookie = response.headers.get('set-cookie');
  }
  
  return response;
}

async function authenticateAdmin() {
  console.log('🔐 Connexion admin...');
  
  const loginResponse = await apiRequest('POST', '/api/auth/login', {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD
  });
  
  if (!loginResponse.ok) {
    throw new Error(`Login failed: ${loginResponse.status} ${await loginResponse.text()}`);
  }
  
  const loginResult = await loginResponse.json();
  console.log('✅ Connexion réussie:', loginResult.user?.email, 'Role:', loginResult.user?.role);
  
  return loginResult.user;
}

async function createRelaxationExercises() {
  console.log('💪 Création des exercices de relaxation...');
  
  const exercisesToCreate = [
    {
      title: 'Cohérence Cardiaque Guidée',
      category: 'relaxation',
      difficulty: 'beginner',
      duration: 6,
      description: 'Exercice de cohérence cardiaque avec animation visuelle guidée pour synchroniser votre respiration et votre rythme cardiaque. Idéal pour réduire le stress et l\'anxiété.',
      instructions: 'Suivez le mouvement de la balle qui grandit et rétrécit. Inspirez quand elle grandit, expirez quand elle rétrécit. Maintenez un rythme régulier de 5 respirations par minute.',
      benefits: 'Réduction du stress, amélioration de la variabilité cardiaque, diminution de l\'anxiété, meilleure régulation émotionnelle, amélioration de la concentration'
    },
    {
      title: 'Respiration Carrée Interactive',
      category: 'relaxation',
      difficulty: 'beginner',
      duration: 5,
      description: 'Technique de respiration carrée (4-4-4-4) avec visualisation animée. La balle suit le parcours d\'un carré pour guider votre respiration à travers les 4 phases.',
      instructions: 'Suivez la balle le long du carré. Inspirez sur le côté gauche (4 sec), retenez en haut (4 sec), expirez sur le côté droit (4 sec), pausez en bas (4 sec).',
      benefits: 'Calme mental, réduction de l\'hyperventilation, amélioration du contrôle respiratoire, stabilisation de l\'humeur, diminution du stress'
    },
    {
      title: 'Respiration Triangle Équilibrée',
      category: 'relaxation',
      difficulty: 'beginner',
      duration: 4,
      description: 'Exercice de respiration triangulaire (inspiration, rétention, expiration) avec animation apaisante. Parfait pour équilibrer le système nerveux.',
      instructions: 'Suivez la balle le long du triangle. Inspirez en montant vers le sommet, retenez votre souffle en suivant la descente droite, expirez en revenant à la base.',
      benefits: 'Équilibrage du système nerveux, amélioration de la qualité du sommeil, réduction de l\'anxiété, augmentation de la capacité pulmonaire, détente profonde'
    }
  ];
  
  const createdExercises = [];
  
  for (const exercise of exercisesToCreate) {
    try {
      console.log(`📝 Création: ${exercise.title}`);
      
      const createResponse = await apiRequest('POST', '/api/exercises', exercise);
      
      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        console.error(`❌ Erreur pour ${exercise.title}:`, errorText);
        continue;
      }
      
      const result = await createResponse.json();
      createdExercises.push(result);
      console.log(`✅ Créé: ${result.title} (ID: ${result.id})`);
      
    } catch (error) {
      console.error(`❌ Erreur lors de la création de ${exercise.title}:`, error.message);
    }
  }
  
  return createdExercises;
}

async function listExistingExercises() {
  console.log('\n📋 Liste des exercices existants:');
  
  try {
    const response = await apiRequest('GET', '/api/admin/exercises');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch exercises: ${response.status}`);
    }
    
    const exercises = await response.json();
    
    console.log(`\n📊 Total: ${exercises.length} exercices`);
    
    // Grouper par catégorie
    const byCategory = exercises.reduce((acc, ex) => {
      if (!acc[ex.category]) acc[ex.category] = [];
      acc[ex.category].push(ex);
      return acc;
    }, {});
    
    for (const [category, exs] of Object.entries(byCategory)) {
      console.log(`\n📂 ${category.toUpperCase()} (${exs.length})`);
      exs.forEach(ex => {
        console.log(`  - ${ex.title} (${ex.difficulty}, ${ex.duration}min)`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des exercices:', error.message);
  }
}

async function main() {
  try {
    console.log('🚀 Création des exercices de relaxation interactifs\n');
    
    // Authentification
    const user = await authenticateAdmin();
    if (user.role !== 'admin') {
      throw new Error('Permissions administrateur requises');
    }
    
    // Créer les exercices
    const createdExercises = await createRelaxationExercises();
    
    console.log(`\n🎯 Résumé:`);
    console.log(`✅ ${createdExercises.length} exercices de relaxation créés`);
    
    // Afficher la liste complète
    await listExistingExercises();
    
    console.log('\n🌟 Les nouveaux exercices de relaxation sont maintenant disponibles !');
    console.log('📱 Accédez-y via la page "Relaxation" dans l\'application');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);