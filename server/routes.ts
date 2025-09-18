
import type { Express } from "express";
import { storage } from "./storage.js";
import { AuthService, requireAuth, requireAdmin } from "./auth.js";
import { insertCravingEntrySchema, insertExerciseSessionSchema, insertBeckAnalysisSchema, insertUserSchema, insertExerciseSchema, insertPsychoEducationContentSchema, insertAntiCravingStrategySchema } from "../shared/schema.js";
import { z } from "zod";
import { getDB } from './db.js';
import { sql } from 'drizzle-orm';
import { authRateLimiter } from './rate-limiter.js';

export function registerRoutes(app: Express) {

  app.get("/api/test-db", async (_req, res) => {
    try {
      const result = await getDB().execute(sql`SELECT 1 as one`);
      res.json({ ok: true, result: result.rows });
    } catch (e) {
      console.error("Database connection test failed:", e);
      res.status(500).json({ ok: false, error: e instanceof Error ? e.message : String(e) });
    }
  });

  // ========================
  // 🔐 AUTH ROUTES
  // ========================

  app.post("/api/auth/register", async (req, res) => {
    try {
      // Rate limiting basé sur l'IP
      const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
      
      if (authRateLimiter.isRateLimited(`register:${clientIp}`)) {
        const remainingTime = Math.ceil(authRateLimiter.getRemainingTime(`register:${clientIp}`) / 1000 / 60);
        return res.status(429).json({ 
          message: `Trop de tentatives d'inscription. Réessayez dans ${remainingTime} minutes.`
        });
      }

      const { email, password, firstName, lastName, role } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email et mot de passe requis" });
      }

      const user = await AuthService.register({
        email,
        password,
        firstName,
        lastName,
        role,
      });

      req.session.user = user;
      res.json({ user }); // ✅ cohérent avec le frontend
    } catch (error) {
      // Enregistrer la tentative d'inscription échouée
      const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
      authRateLimiter.recordAttempt(`register:${clientIp}`);
      
      console.error("Registration error:", error);
      
      // Améliorer les messages d'erreur pour l'utilisateur
      let statusCode = 400;
      let message = "Erreur lors de l'inscription";
      
      if (error instanceof Error) {
        message = error.message;
        
        // Codes d'erreur spécifiques selon le type d'erreur
        if (message.includes('existe déjà')) {
          statusCode = 409; // Conflict
        } else if (message.includes('non autorisé')) {
          statusCode = 403; // Forbidden
        } else if (message.includes('invalide') || message.includes('requis')) {
          statusCode = 400; // Bad Request
        }
      }
      
      res.status(statusCode).json({ message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      // Rate limiting basé sur l'IP
      const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
      
      if (authRateLimiter.isRateLimited(`login:${clientIp}`)) {
        const remainingTime = Math.ceil(authRateLimiter.getRemainingTime(`login:${clientIp}`) / 1000 / 60);
        return res.status(429).json({ 
          message: `Trop de tentatives de connexion. Réessayez dans ${remainingTime} minutes.`
        });
      }

      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email et mot de passe requis" });
      }

      const user = await AuthService.login(email, password);
      req.session.user = user;
      res.json({ user }); // ✅ cohérent avec le frontend
    } catch (error) {
      // Enregistrer la tentative de connexion échouée
      const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
      authRateLimiter.recordAttempt(`login:${clientIp}`);
      
      console.error("Login error:", error);
      
      let statusCode = 401;
      let message = "Erreur de connexion";
      
      if (error instanceof Error) {
        message = error.message;
        
        // Code d'erreur spécifique pour les comptes désactivés
        if (message.includes('désactivé')) {
          statusCode = 403; // Forbidden
        } else if (message.includes('requis')) {
          statusCode = 400; // Bad Request
        }
      }
      
      res.status(statusCode).json({ message });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Erreur lors de la déconnexion" });
      }
      // Clear session cookie
      res.clearCookie('connect.sid');
      res.json({ message: "Logout successful" }); // ✅ cohérent avec le frontend
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ user: null, message: "Not authenticated" });
    }
    try {
      const user = await AuthService.getUserById(req.session.user.id);
      if (!user) {
        // User was deleted, clear session
        req.session.destroy(() => {});
        return res.status(401).json({ user: null, message: "User not found" });
      }
      res.json({ user });
    } catch (error) {
      res.status(500).json({ user: null, message: "Server error" });
    }
  });

  // ========================
  // 📘 EXERCISES
  // ========================

  app.get("/api/exercises", async (req, res) => {
    try {
      const exercises = await storage.getExercises();
      res.json(exercises);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des exercices" });
    }
  });

  app.get("/api/exercises/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const exercise = await storage.getExerciseById(id);
      if (!exercise) {
        return res.status(404).json({ message: "Exercice non trouvé" });
      }
      res.json(exercise);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération de l'exercice" });
    }
  });

  app.post("/api/exercises", requireAdmin, async (req, res) => {
    try {
      const data = insertExerciseSchema.parse(req.body);
      const exercise = await storage.createExercise(data);
      res.json(exercise);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Validation échouée" });
    }
  });

  // ========================
  // 📚 PSYCHO EDUCATION
  // ========================

  app.get("/api/psycho-education", async (req, res) => {
    try {
      const content = await storage.getPsychoEducationContent();
      res.json(content);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération du contenu" });
    }
  });

  app.post("/api/psycho-education", requireAdmin, async (req, res) => {
    try {
      const data = insertPsychoEducationContentSchema.parse(req.body);
      const content = await storage.createPsychoEducationContent(data);
      res.json(content);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Validation échouée" });
    }
  });

  // ========================
  // ⚙️ ADMIN ROUTES
  // ========================

  app.get("/api/admin/exercises", requireAdmin, async (req, res) => {
    try {
      const exercises = await storage.getAllExercises();
      res.json(exercises);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch all exercises" });
    }
  });

  app.get("/api/admin/psycho-education", requireAdmin, async (req, res) => {
    try {
      const content = await storage.getAllPsychoEducationContent();
      res.json(content);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch all psycho-education content" });
    }
  });

  app.get("/api/admin/psycho-education/:contentId", requireAdmin, async (req, res) => {
    try {
      const { contentId } = req.params;
      const content = await storage.getPsychoEducationContentById(contentId);
      if (!content) {
        return res.status(404).json({ message: "Content not found" });
      }
      res.json(content);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch psycho-education content" });
    }
  });

  // Admin - Gestion des utilisateurs
  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsersWithStats();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.delete("/api/admin/users/:userId", requireAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      await storage.deleteUser(userId);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Admin - Gestion des médias
  app.get("/api/admin/media", requireAdmin, async (req, res) => {
    try {
      const mediaFiles = await storage.getAllMediaFiles();
      res.json(mediaFiles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch media files" });
    }
  });

  app.post("/api/admin/media/upload", requireAdmin, async (req, res) => {
    try {
      // Cette route nécessiterait une implémentation de multer pour le téléchargement de fichiers
      // Pour l'instant, on retourne une erreur indiquant que la fonctionnalité n'est pas encore implémentée
      res.status(501).json({ message: "File upload not yet implemented" });
    } catch (error) {
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  app.delete("/api/admin/media/:mediaId", requireAdmin, async (req, res) => {
    try {
      const { mediaId } = req.params;
      await storage.deleteMediaFile(mediaId);
      res.json({ message: "Media file deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete media file" });
    }
  });

  // ========================
  // 🍫 CRAVINGS
  // ========================

  app.post("/api/cravings", requireAuth, async (req, res) => {
    try {
      if (!req.session?.user) return res.status(401).json({ message: "Session non valide" });
      const data = insertCravingEntrySchema.parse({
        ...req.body,
        userId: req.session.user.id
      });
      const entry = await storage.createCravingEntry(data);
      res.json(entry);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Validation failed" });
    }
  });

  app.get("/api/cravings", requireAuth, async (req, res) => {
    try {
      if (!req.session?.user) return res.status(401).json({ message: "Session non valide" });
      const userId = req.session.user.id;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const entries = await storage.getCravingEntries(userId, limit);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch craving entries" });
    }
  });

  app.get("/api/cravings/stats", requireAuth, async (req, res) => {
    try {
      if (!req.session?.user) return res.status(401).json({ message: "Session non valide" });
      const userId = req.session.user.id;
      const days = req.query.days ? parseInt(req.query.days as string) : undefined;
      const stats = await storage.getCravingStats(userId, days);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch craving stats" });
    }
  });

  // ========================
  // 🏋️ EXERCISE SESSIONS
  // ========================

  app.post("/api/exercise-sessions", requireAuth, async (req, res) => {
    try {
      if (!req.session?.user) return res.status(401).json({ message: "Session non valide" });
      const data = insertExerciseSessionSchema.parse({
        ...req.body,
        userId: req.session.user.id
      });
      const session = await storage.createExerciseSession(data);
      res.json(session);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Validation failed" });
    }
  });

  app.get("/api/exercise-sessions", requireAuth, async (req, res) => {
    try {
      if (!req.session?.user) return res.status(401).json({ message: "Session non valide" });
      const userId = req.session.user.id;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const sessions = await storage.getExerciseSessions(userId, limit);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exercise sessions" });
    }
  });

  app.get("/api/exercise-sessions/detailed", requireAuth, async (req, res) => {
    try {
      if (!req.session?.user) return res.status(401).json({ message: "Session non valide" });
      const userId = req.session.user.id;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const sessions = await storage.getExerciseSessionsWithDetails(userId, limit);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch detailed exercise sessions" });
    }
  });

  // ========================
  // 🧠 BECK ANALYSES
  // ========================

  app.post("/api/beck-analyses", requireAuth, async (req, res) => {
    try {
      if (!req.session?.user) return res.status(401).json({ message: "Session non valide" });
      const data = insertBeckAnalysisSchema.parse({
        ...req.body,
        userId: req.session.user.id
      });
      const analysis = await storage.createBeckAnalysis(data);
      res.json(analysis);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Validation failed" });
    }
  });

  app.get("/api/beck-analyses", requireAuth, async (req, res) => {
    try {
      if (!req.session?.user) return res.status(401).json({ message: "Session non valide" });
      const userId = req.session.user.id;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const analyses = await storage.getBeckAnalyses(userId, limit);
      res.json(analyses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch Beck analyses" });
    }
  });

  // ========================
  // 👤 USER ROUTES
  // ========================

  app.get("/api/users/stats", requireAuth, async (req, res) => {
    try {
      if (!req.session?.user) return res.status(401).json({ message: "Session non valide" });
      const userId = req.session.user.id;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  app.get("/api/users/badges", requireAuth, async (req, res) => {
    try {
      if (!req.session?.user) return res.status(401).json({ message: "Session non valide" });
      const userId = req.session.user.id;
      const badges = await storage.getUserBadges(userId);
      res.json(badges);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user badges" });
    }
  });

  app.get("/api/users/profile", requireAuth, async (req, res) => {
    try {
      if (!req.session?.user) return res.status(401).json({ message: "Session non valide" });
      const userId = req.session.user.id;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.put("/api/users/profile", requireAuth, async (req, res) => {
    try {
      if (!req.session?.user) return res.status(401).json({ message: "Session non valide" });
      const userId = req.session.user.id;
      const { firstName, lastName, email } = req.body;
      const updatedUser = await AuthService.updateUser(userId, { firstName, lastName, email });
      res.json(updatedUser);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Erreur lors de la mise à jour du profil" });
    }
  });

  app.put("/api/users/password", requireAuth, async (req, res) => {
    try {
      if (!req.session?.user) return res.status(401).json({ message: "Session non valide" });
      const userId = req.session.user.id;
      const { oldPassword, newPassword } = req.body;
      await AuthService.updatePassword(userId, oldPassword, newPassword);
      res.json({ message: "Mot de passe mis à jour avec succès" });
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Erreur lors de la mise à jour du mot de passe" });
    }
  });

  app.delete("/api/users/profile", requireAuth, async (req, res) => {
    try {
      if (!req.session?.user) return res.status(401).json({ message: "Session non valide" });
      const userId = req.session.user.id;
      await storage.deleteUser(userId);
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ message: "Erreur lors de la déconnexion après la suppression du compte" });
        }
        res.json({ message: "Compte supprimé avec succès" });
      });
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la suppression du compte" });
    }
  });

  // ========================
  // 🌱 SEED & DEMO
  // ========================

  app.post("/api/demo-user", async (req, res) => {
    try {
      const user = await storage.createUser({
        email: "demo@example.com",
        password: "demo123",
        firstName: "Utilisateur",
        lastName: "Demo",
        role: "patient",
      });
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to create demo user" });
    }
  });

  app.post("/api/seed-data", requireAdmin, async (req, res) => {
    try {
      const { seedData } = await import("./seed-data.js");
      await seedData();
      res.json({ message: "Données d'exemple créées avec succès" });
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la création des données d'exemple" });
    }
  });

  // Admin - Supprimer un exercice
  app.delete("/api/admin/exercises/:exerciseId", requireAdmin, async (req, res) => {
    try {
      const { exerciseId } = req.params;
      await storage.deleteExercise(exerciseId);
      res.json({ message: "Exercise deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete exercise" });
    }
  });

  // Admin - Supprimer du contenu psycho-éducationnel
  app.put("/api/admin/psycho-education/:contentId", requireAdmin, async (req, res) => {
    try {
      const { contentId } = req.params;
      const data = insertPsychoEducationContentSchema.parse(req.body);
      const content = await storage.updatePsychoEducationContent(contentId, data);
      res.json(content);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to update content" });
    }
  });

  app.delete("/api/admin/psycho-education/:contentId", requireAdmin, async (req, res) => {
    try {
      const { contentId } = req.params;
      await storage.deletePsychoEducationContent(contentId);
      res.json({ message: "Content deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete content" });
    }
  });

  // Admin - Gestion des routines d'urgence
  app.get("/api/admin/emergency-routines", requireAdmin, async (req, res) => {
    try {
      const routines = await storage.getAllEmergencyRoutines();
      res.json(routines);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch emergency routines" });
    }
  });

  app.get("/api/admin/emergency-routines/default", requireAdmin, async (req, res) => {
    try {
      const routine = await storage.getDefaultEmergencyRoutine();
      res.json(routine);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch default emergency routine" });
    }
  });

  app.post("/api/admin/emergency-routines", requireAdmin, async (req, res) => {
    try {
      const routine = await storage.createEmergencyRoutine(req.body);
      res.json(routine);
    } catch (error) {
      res.status(500).json({ message: "Failed to create emergency routine" });
    }
  });

  app.put("/api/admin/emergency-routines/:routineId", requireAdmin, async (req, res) => {
    try {
      const { routineId } = req.params;
      const routine = await storage.updateEmergencyRoutine(routineId, req.body);
      res.json(routine);
    } catch (error) {
      res.status(500).json({ message: "Failed to update emergency routine" });
    }
  });

  app.delete("/api/admin/emergency-routines/:routineId", requireAdmin, async (req, res) => {
    try {
      const { routineId } = req.params;
      await storage.deleteEmergencyRoutine(routineId);
      res.json({ message: "Emergency routine deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete emergency routine" });
    }
  });

  app.put("/api/admin/emergency-routines/:routineId/set-default", requireAdmin, async (req, res) => {
    try {
      const { routineId } = req.params;
      await storage.setDefaultEmergencyRoutine(routineId);
      res.json({ message: "Default emergency routine set successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to set default emergency routine" });
    }
  });

  // Admin - Gestion des ressources rapides
  app.get("/api/admin/quick-resources", requireAdmin, async (req, res) => {
    try {
      const resources = await storage.getAllQuickResources();
      res.json(resources);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch quick resources" });
    }
  });

  app.get("/api/admin/quick-resources/pinned", requireAdmin, async (req, res) => {
    try {
      const resources = await storage.getPinnedQuickResources();
      res.json(resources);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pinned quick resources" });
    }
  });

  app.post("/api/admin/quick-resources", requireAdmin, async (req, res) => {
    try {
      const resource = await storage.createQuickResource(req.body);
      res.json(resource);
    } catch (error) {
      res.status(500).json({ message: "Failed to create quick resource" });
    }
  });

  app.put("/api/admin/quick-resources/:resourceId", requireAdmin, async (req, res) => {
    try {
      const { resourceId } = req.params;
      const resource = await storage.updateQuickResource(resourceId, req.body);
      res.json(resource);
    } catch (error) {
      res.status(500).json({ message: "Failed to update quick resource" });
    }
  });

  app.delete("/api/admin/quick-resources/:resourceId", requireAdmin, async (req, res) => {
    try {
      const { resourceId } = req.params;
      await storage.deleteQuickResource(resourceId);
      res.json({ message: "Quick resource deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete quick resource" });
    }
  });

  app.put("/api/admin/quick-resources/:resourceId/toggle-pin", requireAdmin, async (req, res) => {
    try {
      const { resourceId } = req.params;
      await storage.togglePinQuickResource(resourceId);
      res.json({ message: "Quick resource pin status toggled successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to toggle pin status" });
    }
  });

  // ========================
  // 🎯 ANTI-CRAVING STRATEGIES ROUTES
  // ========================

  app.post("/api/strategies", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user!.id;
      const { strategies } = req.body;
      
      console.log('Received strategies request:', { userId, strategiesCount: strategies?.length, body: req.body });
      
      if (!Array.isArray(strategies)) {
        console.error('Invalid strategies format:', { type: typeof strategies, value: strategies });
        return res.status(400).json({ 
          message: "Les stratégies doivent être un tableau",
          received: typeof strategies,
          expected: "array"
        });
      }

      if (strategies.length === 0) {
        return res.status(400).json({ message: "Au moins une stratégie doit être fournie" });
      }

      // Validate strategies structure with detailed logging
      for (let i = 0; i < strategies.length; i++) {
        const strategy = strategies[i];
        console.log(`Validating strategy ${i + 1}:`, strategy);
        
        const requiredFields = ['context', 'exercise', 'effort', 'duration', 'cravingBefore', 'cravingAfter'];
        const missingFields = requiredFields.filter(field => 
          strategy[field] === undefined || strategy[field] === null || strategy[field] === ''
        );
        
        if (missingFields.length > 0) {
          console.error(`Strategy ${i + 1} missing fields:`, missingFields);
          return res.status(400).json({ 
            message: `Stratégie ${i + 1}: champs manquants - ${missingFields.join(', ')}`,
            strategy: strategy,
            missingFields: missingFields
          });
        }

        // Validate data types
        if (typeof strategy.duration !== 'number' || strategy.duration <= 0) {
          return res.status(400).json({ 
            message: `Stratégie ${i + 1}: la durée doit être un nombre positif`,
            received: strategy.duration
          });
        }
        
        if (typeof strategy.cravingBefore !== 'number' || strategy.cravingBefore < 0 || strategy.cravingBefore > 10) {
          return res.status(400).json({ 
            message: `Stratégie ${i + 1}: le craving avant doit être un nombre entre 0 et 10`,
            received: strategy.cravingBefore
          });
        }
        
        if (typeof strategy.cravingAfter !== 'number' || strategy.cravingAfter < 0 || strategy.cravingAfter > 10) {
          return res.status(400).json({ 
            message: `Stratégie ${i + 1}: le craving après doit être un nombre entre 0 et 10`,
            received: strategy.cravingAfter
          });
        }
      }

      const savedStrategies = await storage.createAntiCravingStrategies(userId, strategies);
      
      console.log(`Successfully saved ${savedStrategies.length} strategies for user ${userId}`);
      res.json({ 
        success: true, 
        strategies: savedStrategies,
        message: `${savedStrategies.length} stratégie(s) sauvegardée(s) avec succès`,
        count: savedStrategies.length
      });
    } catch (error) {
      console.error("Error saving anti-craving strategies:", error);
      const errorMessage = error instanceof Error ? error.message : "Erreur lors de la sauvegarde des stratégies";
      res.status(500).json({ 
        message: errorMessage,
        error: error instanceof Error ? error.stack : String(error)
      });
    }
  });

  app.get("/api/strategies", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user!.id;
      console.log(`Fetching strategies for user ${userId}`);
      
      const strategies = await storage.getAntiCravingStrategies(userId);
      
      console.log(`Found ${strategies.length} strategies for user ${userId}`);
      res.json(strategies);
    } catch (error) {
      console.error("Error fetching anti-craving strategies:", error);
      const errorMessage = error instanceof Error ? error.message : "Erreur lors de la récupération des stratégies";
      res.status(500).json({ message: errorMessage });
    }
  });

  // ========================
  // 🎯 NEW THERAPEUTIC FEATURES
  // ========================

  // Timer sessions
  app.post("/api/timer-sessions", requireAuth, async (req, res) => {
    try {
      if (!req.session?.user) return res.status(401).json({ message: "Session non valide" });
      const sessionData = {
        ...req.body,
        userId: req.session.user.id
      };
      const session = await storage.createTimerSession(sessionData);
      res.json(session);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Validation failed" });
    }
  });

  app.get("/api/timer-sessions", requireAuth, async (req, res) => {
    try {
      if (!req.session?.user) return res.status(401).json({ message: "Session non valide" });
      const userId = req.session.user.id;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const sessions = await storage.getTimerSessions(userId, limit);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch timer sessions" });
    }
  });

  // Visualization content
  app.get("/api/visualizations", async (req, res) => {
    try {
      const content = await storage.getVisualizationContent();
      res.json(content);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des visualisations" });
    }
  });

  app.post("/api/visualizations", requireAdmin, async (req, res) => {
    try {
      const content = await storage.createVisualizationContent(req.body);
      res.json(content);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Validation échouée" });
    }
  });

  // Audio content
  app.get("/api/audio-content", async (req, res) => {
    try {
      const content = await storage.getAudioContent();
      res.json(content);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération du contenu audio" });
    }
  });

  app.post("/api/audio-content", requireAdmin, async (req, res) => {
    try {
      const content = await storage.createAudioContent(req.body);
      res.json(content);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Validation échouée" });
    }
  });

  // Professional reports
  app.get("/api/admin/professional-reports", requireAdmin, async (req, res) => {
    try {
      const reports = await storage.getProfessionalReports(req.session.user!.id);
      res.json(reports);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch professional reports" });
    }
  });

  app.post("/api/admin/professional-reports", requireAdmin, async (req, res) => {
    try {
      const reportData = {
        ...req.body,
        therapistId: req.session.user!.id
      };
      const report = await storage.createProfessionalReport(reportData);
      res.json(report);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to create report" });
    }
  });

  app.put("/api/admin/professional-reports/:reportId", requireAdmin, async (req, res) => {
    try {
      const { reportId } = req.params;
      const report = await storage.updateProfessionalReport(reportId, req.body);
      res.json(report);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to update report" });
    }
  });

  app.delete("/api/admin/professional-reports/:reportId", requireAdmin, async (req, res) => {
    try {
      const { reportId } = req.params;
      await storage.deleteProfessionalReport(reportId);
      res.json({ message: "Report deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete report" });
    }
  });

  // Generate automatic reports
  app.post("/api/admin/generate-report", requireAdmin, async (req, res) => {
    try {
      const { patientId, reportType } = req.body;
      
      // Generate report based on type
      let startDate: Date, endDate: Date;
      const now = new Date();
      
      switch (reportType) {
        case 'weekly':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          endDate = now;
          break;
        case 'monthly':
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          endDate = now;
          break;
        default:
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          endDate = now;
      }

      const reportData = await storage.generateUserProgressReport(patientId, startDate, endDate);
      
      // Generate report content
      const title = `Rapport ${reportType} - ${startDate.toLocaleDateString('fr-FR')} au ${endDate.toLocaleDateString('fr-FR')}`;
      const content = `
## Résumé de la période

### Exercices
- Nombre total d'exercices: ${reportData.exerciseStats?.count || 0}
- Durée totale: ${Math.round((reportData.exerciseStats?.totalDuration || 0) / 60)} minutes
- Niveau de craving moyen avant exercice: ${reportData.exerciseStats?.avgCravingBefore?.toFixed(1) || 'N/A'}/10
- Niveau de craving moyen après exercice: ${reportData.exerciseStats?.avgCravingAfter?.toFixed(1) || 'N/A'}/10

### Cravings
- Nombre d'entrées: ${reportData.cravingStats?.count || 0}
- Intensité moyenne: ${reportData.cravingStats?.avgIntensity?.toFixed(1) || 'N/A'}/10

### Observations
${reportData.exerciseStats?.avgCravingBefore && reportData.exerciseStats?.avgCravingAfter 
  ? `Réduction moyenne du craving: ${(reportData.exerciseStats.avgCravingBefore - reportData.exerciseStats.avgCravingAfter).toFixed(1)} points`
  : 'Données insuffisantes pour calculer l\'efficacité des exercices'
}

### Recommandations
- ${reportData.exerciseStats?.count >= 3 ? 'Bonne assiduité dans les exercices' : 'Encourager une pratique plus régulière'}
- ${reportData.cravingStats?.avgIntensity < 5 ? 'Niveau de craving globalement maîtrisé' : 'Focus sur les techniques de réduction du craving'}
      `;

      res.json({ title, content, data: reportData });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate report" });
    }
  });

  // User notes (for therapist)
  app.put("/api/admin/users/:userId/notes", requireAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const { notes } = req.body;
      await storage.updateUserNotes(userId, notes);
      res.json({ message: "Notes updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update user notes" });
    }
  });

  // Inactivity management
  app.get("/api/admin/inactive-users", requireAdmin, async (req, res) => {
    try {
      const threshold = req.query.threshold ? parseInt(req.query.threshold as string) : undefined;
      const users = await storage.getInactiveUsers(threshold);
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inactive users" });
    }
  });

  app.put("/api/admin/users/:userId/inactivity-threshold", requireAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const { threshold } = req.body;
      await storage.setUserInactivityThreshold(userId, threshold);
      res.json({ message: "Inactivity threshold updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update inactivity threshold" });
    }
  });

  // Exercise enhancements
  app.get("/api/exercises/:exerciseId/enhancements", async (req, res) => {
    try {
      const { exerciseId } = req.params;
      const enhancements = await storage.getExerciseEnhancements(exerciseId);
      res.json(enhancements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exercise enhancements" });
    }
  });

  app.post("/api/admin/exercises/:exerciseId/enhancements", requireAdmin, async (req, res) => {
    try {
      const { exerciseId } = req.params;
      const enhancementData = {
        ...req.body,
        exerciseId
      };
      const enhancement = await storage.createExerciseEnhancement(enhancementData);
      res.json(enhancement);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to create enhancement" });
    }
  });

}
