#!/usr/bin/env node

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const BASE_URL = 'http://localhost:5000';
const ADMIN_EMAIL = 'doriansarry@yahoo.fr';
const ADMIN_PASSWORD = 'admin123';

async function createAdminUser() {
  console.log('👤 Création du compte administrateur...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin'
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      if (errorText.includes('existe déjà')) {
        console.log('✅ Le compte admin existe déjà');
        
        // Essayer de se connecter
        const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD
          })
        });
        
        if (loginResponse.ok) {
          const loginResult = await loginResponse.json();
          console.log('✅ Connexion admin réussie:', loginResult.user?.email, 'Role:', loginResult.user?.role);
        } else {
          console.log('❌ Connexion échouée, mot de passe incorrect');
          
          // Essayer avec un autre mot de passe courant
          const loginResponse2 = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email: ADMIN_EMAIL,
              password: 'password123'
            })
          });
          
          if (loginResponse2.ok) {
            const loginResult2 = await loginResponse2.json();
            console.log('✅ Connexion admin réussie avec password123:', loginResult2.user?.email);
          } else {
            console.log('❌ Aucun mot de passe ne fonctionne');
          }
        }
        
        return;
      }
      
      throw new Error(`Registration failed: ${response.status} ${errorText}`);
    }
    
    const result = await response.json();
    console.log('✅ Compte admin créé avec succès:', result.user?.email, 'Role:', result.user?.role);
    
  } catch (error) {
    console.error('❌ Erreur lors de la création du compte admin:', error.message);
  }
}

createAdminUser().catch(console.error);