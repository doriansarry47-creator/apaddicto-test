/**
 * Tests unitaires pour les permissions admin
 * Vérifie que le rôle admin a un accès complet aux contenus
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { spawn } from 'child_process';
import fetch from 'node-fetch';

const SERVER_URL = 'http://localhost:5001';

describe('Admin Content Access Tests', () => {
  let serverProcess;
  let adminSession;

  beforeAll(async () => {
    // Démarrer le serveur pour les tests (sur un port différent)
    serverProcess = spawn('npm', ['run', 'dev'], {
      env: { ...process.env, PORT: '5001' },
      stdio: 'pipe'
    });

    // Attendre que le serveur démarre
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Créer et connecter un admin
    const registerResponse = await fetch(`${SERVER_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test-admin@example.com',
        password: 'test123',
        firstName: 'Test',
        lastName: 'Admin',
        role: 'admin'
      })
    });

    if (registerResponse.ok) {
      const setCookieHeader = registerResponse.headers.get('set-cookie');
      adminSession = setCookieHeader?.match(/connect\.sid=[^;]+/)?.[0];
    }
  });

  afterAll(async () => {
    // Arrêter le serveur
    if (serverProcess) {
      serverProcess.kill();
    }
  });

  it('should allow admin to access psycho-education content list', async () => {
    const response = await fetch(`${SERVER_URL}/api/admin/psycho-education`, {
      headers: adminSession ? { 'Cookie': adminSession } : {}
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it('should allow admin to create psycho-education content', async () => {
    const newContent = {
      title: 'Test Content',
      category: 'addiction',
      type: 'article',
      difficulty: 'beginner',
      content: 'Test content body',
      estimatedReadTime: 5,
      description: 'Test description'
    };

    const response = await fetch(`${SERVER_URL}/api/psycho-education`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': adminSession || ''
      },
      body: JSON.stringify(newContent)
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.title).toBe(newContent.title);
  });

  it('should block non-authenticated users from admin routes', async () => {
    const response = await fetch(`${SERVER_URL}/api/admin/psycho-education`);
    expect(response.status).toBe(401);
  });

  it('should allow admin to access exercise management', async () => {
    const response = await fetch(`${SERVER_URL}/api/admin/exercises`, {
      headers: adminSession ? { 'Cookie': adminSession } : {}
    });

    expect(response.status).toBe(200);
  });

  it('should allow admin to create exercises', async () => {
    const newExercise = {
      title: 'Test Exercise',
      description: 'Test exercise description',
      category: 'cardio',
      difficulty: 'beginner',
      duration: 30,
      instructions: 'Test instructions'
    };

    const response = await fetch(`${SERVER_URL}/api/exercises`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': adminSession || ''
      },
      body: JSON.stringify(newExercise)
    });

    expect(response.status).toBe(200);
  });

  it('should verify admin middleware works correctly', async () => {
    // Test avec session admin
    const adminResponse = await fetch(`${SERVER_URL}/api/admin/users`, {
      headers: adminSession ? { 'Cookie': adminSession } : {}
    });
    expect(adminResponse.status).toBe(200);

    // Test sans session
    const noSessionResponse = await fetch(`${SERVER_URL}/api/admin/users`);
    expect(noSessionResponse.status).toBe(401);
  });
});