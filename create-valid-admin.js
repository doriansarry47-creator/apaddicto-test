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

console.log('👨‍⚕️ Création d\'un administrateur valide...\n');

// Essayer de créer un admin avec un email autorisé
const adminEmails = [
  'admin@apaddicto.com',
  'admin@therapy.com',
  'therapist@apaddicto.com',
  'dr.admin@apaddicto.com',
  'admin.test@apaddicto.com'
];

for (const email of adminEmails) {
  try {
    console.log(`Tentative de création avec: ${email}`);
    
    const response = await client.post('/auth/register', {
      email: email,
      password: 'admin123',
      firstName: 'Dr. Admin',
      lastName: 'System',
      role: 'admin'
    });
    
    console.log('✅ Admin créé avec succès !');
    console.log('   Email:', response.data.user.email);
    console.log('   Role:', response.data.user.role);
    console.log('   ID:', response.data.user.id);
    
    // Test login
    try {
      const loginResponse = await client.post('/auth/login', {
        email: email,
        password: 'admin123'
      });
      console.log('✅ Login admin testé avec succès !');
      process.exit(0);
    } catch (loginError) {
      console.log('❌ Échec du test de login:', loginError.response?.data?.message);
    }
    
    break;
    
  } catch (error) {
    if (error.response?.data?.message?.includes('existe déjà')) {
      console.log('⚠️  Compte déjà existant, test du login...');
      
      try {
        const loginResponse = await client.post('/auth/login', {
          email: email,
          password: 'admin123'
        });
        console.log('✅ Login réussi avec compte existant !');
        console.log('   Email:', loginResponse.data.user.email);
        console.log('   Role:', loginResponse.data.user.role);
        process.exit(0);
      } catch (loginError) {
        console.log('❌ Échec du login avec:', email);
      }
    } else {
      console.log('❌ Erreur:', error.response?.data?.message || error.message);
    }
  }
}

console.log('❌ Impossible de créer ou accéder à un compte admin');
console.log('Vérification des comptes existants...');

// Essayer de récupérer des informations sur les comptes via l'API publique
try {
  const tablesResponse = await client.get('/tables');
  console.log('📋 Tables disponibles:', tablesResponse.data);
  
  const dataResponse = await client.get('/data');
  if (dataResponse.data.users) {
    console.log(`👥 Nombre d'utilisateurs en base: ${dataResponse.data.users.length}`);
    
    const admins = dataResponse.data.users.filter(u => u.role === 'admin');
    console.log(`👨‍⚕️ Nombre d'admins: ${admins.length}`);
    
    if (admins.length > 0) {
      console.log('📧 Emails des admins existants:');
      admins.forEach(admin => {
        console.log(`   - ${admin.email} (ID: ${admin.id})`);
      });
    }
  }
} catch (error) {
  console.log('❌ Impossible d\'accéder aux données:', error.message);
}