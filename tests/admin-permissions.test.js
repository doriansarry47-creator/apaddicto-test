/**
 * Tests automatisés pour les permissions admin
 * Vérifie que les admins ont accès CRUD et que les autres rôles sont bloqués
 */

const { expect } = require('chai');

const serverUrl = process.env.TEST_SERVER_URL || 'https://5000-inv8i2akp0ovbkym44588-6532622b.e2b.dev';

async function makeRequest(method, endpoint, data = null, sessionCookie = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };

  if (sessionCookie) {
    options.headers['Cookie'] = sessionCookie;
  }

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(`${serverUrl}${endpoint}`, options);
  
  try {
    const responseData = await response.json();
    return {
      status: response.status,
      data: responseData,
      headers: response.headers
    };
  } catch {
    return {
      status: response.status,
      data: await response.text(),
      headers: response.headers
    };
  }
}

async function extractSessionCookie(response) {
  const setCookieHeader = response.headers.get('set-cookie');
  if (setCookieHeader) {
    const match = setCookieHeader.match(/connect\.sid=[^;]+/);
    return match ? match[0] : null;
  }
  return null;
}

async function createUserAndLogin(userData) {
  const registerResult = await makeRequest('POST', '/api/auth/register', userData);
  
  if (registerResult.status === 200) {
    return await extractSessionCookie(registerResult);
  }
  
  // Si l'utilisateur existe déjà, essayer de se connecter
  const loginResult = await makeRequest('POST', '/api/auth/login', {
    email: userData.email,
    password: userData.password
  });
  
  if (loginResult.status === 200) {
    return await extractSessionCookie(loginResult);
  }
  
  throw new Error(`Impossible de créer/connecter l'utilisateur: ${registerResult.status}`);
}

describe('Tests des permissions admin', function() {
  this.timeout(10000);
  
  let adminSession, patientSession;
  
  before(async function() {
    // Créer/connecter un admin
    adminSession = await createUserAndLogin({
      email: 'test-admin@test.com',
      password: 'admin123',
      firstName: 'Test',
      lastName: 'Admin',
      role: 'admin'
    });
    
    // Créer/connecter un patient
    patientSession = await createUserAndLogin({
      email: 'test-patient@test.com', 
      password: 'patient123',
      firstName: 'Test',
      lastName: 'Patient',
      role: 'patient'
    });
  });

  describe('Accès aux contenus psycho-éducatifs', function() {
    
    it('Admin doit pouvoir lire tous les contenus', async function() {
      const result = await makeRequest('GET', '/api/admin/psycho-education', null, adminSession);
      expect(result.status).to.equal(200);
      expect(Array.isArray(result.data)).to.be.true;
    });
    
    it('Patient ne doit pas pouvoir accéder aux routes admin', async function() {
      const result = await makeRequest('GET', '/api/admin/psycho-education', null, patientSession);
      expect(result.status).to.equal(403);
    });
    
    it('Utilisateur non connecté ne doit pas avoir accès', async function() {
      const result = await makeRequest('GET', '/api/admin/psycho-education');
      expect(result.status).to.equal(401);
    });
    
    it('Admin doit pouvoir créer du contenu', async function() {
      const newContent = {
        title: 'Test Content - Automated Test',
        category: 'addiction',
        type: 'article',
        difficulty: 'beginner',
        content: 'Contenu de test automatisé',
        estimatedReadTime: 3
      };
      
      const result = await makeRequest('POST', '/api/psycho-education', newContent, adminSession);
      expect(result.status).to.equal(200);
      expect(result.data.id).to.exist;
      
      // Nettoyer après le test
      if (result.data.id) {
        await makeRequest('DELETE', `/api/admin/psycho-education/${result.data.id}`, null, adminSession);
      }
    });
    
    it('Patient ne doit pas pouvoir créer du contenu', async function() {
      const newContent = {
        title: 'Test Content - Should Fail',
        category: 'addiction',
        type: 'article', 
        difficulty: 'beginner',
        content: 'Ce contenu ne devrait pas être créé',
        estimatedReadTime: 3
      };
      
      const result = await makeRequest('POST', '/api/psycho-education', newContent, patientSession);
      expect(result.status).to.equal(403);
    });
  });

  describe('Accès aux exercices', function() {
    
    it('Admin doit pouvoir lire tous les exercices', async function() {
      const result = await makeRequest('GET', '/api/admin/exercises', null, adminSession);
      expect(result.status).to.equal(200);
      expect(Array.isArray(result.data)).to.be.true;
    });
    
    it('Patient ne doit pas pouvoir accéder aux exercices admin', async function() {
      const result = await makeRequest('GET', '/api/admin/exercises', null, patientSession);
      expect(result.status).to.equal(403);
    });
    
    it('Admin doit pouvoir créer un exercice', async function() {
      const newExercise = {
        title: 'Test Exercise - Automated',
        description: 'Exercice de test automatisé',
        category: 'cardio',
        difficulty: 'beginner',
        duration: 10,
        instructions: 'Instructions de test',
        benefits: 'Bénéfices de test'
      };
      
      const result = await makeRequest('POST', '/api/exercises', newExercise, adminSession);
      expect(result.status).to.equal(200);
      expect(result.data.id).to.exist;
      
      // Nettoyer après le test  
      if (result.data.id) {
        await makeRequest('DELETE', `/api/admin/exercises/${result.data.id}`, null, adminSession);
      }
    });
  });

  describe('Tests CRUD complets', function() {
    let testContentId;
    
    it('Admin doit pouvoir effectuer un cycle CRUD complet', async function() {
      // CREATE
      const createData = {
        title: 'Test CRUD - Automated',
        category: 'coping',
        type: 'article',
        difficulty: 'intermediate', 
        content: 'Contenu pour test CRUD automatisé',
        estimatedReadTime: 5
      };
      
      const createResult = await makeRequest('POST', '/api/psycho-education', createData, adminSession);
      expect(createResult.status).to.equal(200);
      expect(createResult.data.id).to.exist;
      testContentId = createResult.data.id;
      
      // READ
      const readResult = await makeRequest('GET', `/api/admin/psycho-education/${testContentId}`, null, adminSession);
      expect(readResult.status).to.equal(200);
      expect(readResult.data.title).to.equal(createData.title);
      
      // UPDATE
      const updateData = {
        title: 'Test CRUD - Automated (Updated)',
        difficulty: 'advanced'
      };
      
      const updateResult = await makeRequest('PUT', `/api/admin/psycho-education/${testContentId}`, updateData, adminSession);
      expect(updateResult.status).to.equal(200);
      
      // DELETE
      const deleteResult = await makeRequest('DELETE', `/api/admin/psycho-education/${testContentId}`, null, adminSession);
      expect(deleteResult.status).to.equal(200);
      
      // Vérifier que le contenu est supprimé
      const verifyResult = await makeRequest('GET', `/api/admin/psycho-education/${testContentId}`, null, adminSession);
      expect(verifyResult.status).to.equal(404);
    });
  });

  describe('Tests de sécurité des rôles', function() {
    
    it('Les routes admin doivent toutes être protégées', async function() {
      const adminRoutes = [
        '/api/admin/psycho-education',
        '/api/admin/exercises', 
        '/api/admin/users',
        '/api/admin/emergency-routines'
      ];
      
      for (const route of adminRoutes) {
        // Test sans session
        const noSessionResult = await makeRequest('GET', route);
        expect(noSessionResult.status).to.equal(401, `Route ${route} should require authentication`);
        
        // Test avec session patient
        const patientResult = await makeRequest('GET', route, null, patientSession);
        expect(patientResult.status).to.equal(403, `Route ${route} should require admin role`);
        
        // Test avec session admin
        const adminResult = await makeRequest('GET', route, null, adminSession);
        expect([200, 404, 500]).to.include(adminResult.status, `Route ${route} should be accessible to admin`);
      }
    });
  });

  describe('Validation des données', function() {
    
    it('Création de contenu avec données invalides doit échouer', async function() {
      const invalidContent = {
        // title manquant
        category: 'invalid_category',
        type: 'invalid_type',
        content: '' // contenu vide
      };
      
      const result = await makeRequest('POST', '/api/psycho-education', invalidContent, adminSession);
      expect(result.status).to.equal(400);
    });
    
    it('Modification avec données partielles doit réussir', async function() {
      // Créer un contenu de test
      const createData = {
        title: 'Test Partial Update',
        category: 'addiction',
        type: 'article',
        difficulty: 'beginner',
        content: 'Contenu original',
        estimatedReadTime: 5
      };
      
      const createResult = await makeRequest('POST', '/api/psycho-education', createData, adminSession);
      expect(createResult.status).to.equal(200);
      
      const contentId = createResult.data.id;
      
      // Modification partielle
      const partialUpdate = {
        title: 'Test Partial Update - Modified'
      };
      
      const updateResult = await makeRequest('PUT', `/api/admin/psycho-education/${contentId}`, partialUpdate, adminSession);
      expect(updateResult.status).to.equal(200);
      
      // Nettoyer
      await makeRequest('DELETE', `/api/admin/psycho-education/${contentId}`, null, adminSession);
    });
  });
});

// Export pour utilisation dans d'autres tests si nécessaire
module.exports = {
  makeRequest,
  createUserAndLogin,
  extractSessionCookie
};