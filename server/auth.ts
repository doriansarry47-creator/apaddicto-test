import bcrypt from 'bcryptjs';
import { storage } from './storage.js';
import type { InsertUser, User } from '../shared/schema.js';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string | null;
}

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  static async register(userData: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    role?: string;
  }): Promise<AuthUser> {
    try {
      // Normaliser l'email
      const normalizedEmail = userData.email.toLowerCase().trim();
      
      // Validation de base de l'email
      if (!normalizedEmail || !normalizedEmail.includes('@')) {
        throw new Error('Format d\'email invalide');
      }

      // Validation robuste de l'email avec regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(normalizedEmail)) {
        throw new Error('Format d\'email invalide');
      }

      // Validation du mot de passe
      if (!userData.password || userData.password.length < 4) {
        throw new Error('Le mot de passe doit contenir au moins 4 caractères');
      }

      // Validation plus stricte du mot de passe
      if (userData.password.length > 100) {
        throw new Error('Le mot de passe est trop long (maximum 100 caractères)');
      }

      // VÉRIFICATION ROBUSTE ANTI-RACE CONDITION
      // Double vérification avec délai micro pour éviter les conditions de course
      const firstCheck = await storage.getUserByEmail(normalizedEmail);
      if (firstCheck) {
        throw new Error('Un utilisateur avec cet email existe déjà');
      }

      // Micro délai pour éviter les race conditions
      await new Promise(resolve => setTimeout(resolve, 10));

      // Seconde vérification pour sécurité supplémentaire
      const secondCheck = await storage.getUserByEmail(normalizedEmail);
      if (secondCheck) {
        throw new Error('Un utilisateur avec cet email existe déjà');
      }

      // SÉCURITÉ: Empêcher l'inscription en tant qu'admin sauf pour l'email autorisé
      const authorizedAdminEmail = 'doriansarry@yahoo.fr';
      const requestedRole = userData.role || 'patient';
      
      if (requestedRole === 'admin' && normalizedEmail !== authorizedAdminEmail.toLowerCase()) {
        throw new Error('Accès administrateur non autorisé pour cet email');
      }

      // Validation des autres champs
      if (userData.firstName && userData.firstName.length > 50) {
        throw new Error('Le prénom ne peut pas dépasser 50 caractères');
      }
      if (userData.lastName && userData.lastName.length > 50) {
        throw new Error('Le nom ne peut pas dépasser 50 caractères');
      }

      // Hacher le mot de passe
      const hashedPassword = await this.hashPassword(userData.password);

      // Créer l'utilisateur avec l'email normalisé
      const newUser: InsertUser = {
        email: normalizedEmail,
        password: hashedPassword,
        firstName: userData.firstName ? userData.firstName.trim() : null,
        lastName: userData.lastName ? userData.lastName.trim() : null,
        role: requestedRole,
      };

      // Tentative de création avec gestion d'erreur robuste
      let user;
      try {
        user = await storage.createUser(newUser);
      } catch (dbError) {
        // Gestion spécifique des erreurs de base de données
        if (dbError instanceof Error) {
          if (dbError.message.includes('duplicate key value') || 
              dbError.message.includes('unique constraint') ||
              dbError.message.includes('users_email_unique') ||
              dbError.message.includes('UNIQUE constraint failed')) {
            throw new Error('Un utilisateur avec cet email existe déjà');
          }
          if (dbError.message.includes('connection') || 
              dbError.message.includes('timeout')) {
            throw new Error('Problème de connexion à la base de données. Veuillez réessayer.');
          }
        }
        throw dbError; // Re-lancer l'erreur si ce n'est pas un problème d'unicité
      }
      
      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      };
    } catch (error) {
      // Améliorer la gestion des erreurs de base de données
      if (error instanceof Error) {
        // Détecter les erreurs de contrainte d'unicité de la base de données
        if (error.message.includes('duplicate key value') || 
            error.message.includes('unique constraint') ||
            error.message.includes('users_email_unique') ||
            error.message.includes('UNIQUE constraint failed')) {
          throw new Error('Un utilisateur avec cet email existe déjà');
        }
        
        // Réthrow l'erreur avec le message original si c'est une erreur connue
        throw error;
      }
      
      // Erreur générique pour les cas inconnus
      throw new Error('Erreur lors de l\'inscription. Veuillez réessayer.');
    }
  }

  static async login(email: string, password: string): Promise<AuthUser> {
    try {
      // Normaliser l'email pour la recherche
      const normalizedEmail = email.toLowerCase().trim();
      
      // Validation de base
      if (!normalizedEmail || !password) {
        throw new Error('Email et mot de passe requis');
      }

      // Trouver l'utilisateur par email
      const user = await storage.getUserByEmail(normalizedEmail);
      if (!user) {
        throw new Error('Email ou mot de passe incorrect');
      }

      // Vérifier le mot de passe
      const isValidPassword = await this.verifyPassword(password, user.password);
      if (!isValidPassword) {
        throw new Error('Email ou mot de passe incorrect');
      }

      // Vérifier si l'utilisateur est actif
      if (!user.isActive) {
        throw new Error('Compte désactivé');
      }

      // Mettre à jour la dernière connexion
      await storage.updateUserLastLogin(user.id);

      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      };
    } catch (error) {
      // Améliorer la gestion des erreurs de login
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erreur lors de la connexion. Veuillez réessayer.');
    }
  }

  static async getUserById(id: string): Promise<AuthUser | null> {
    const user = await storage.getUser(id);
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };
  }

  static async updateUser(userId: string, data: {
    firstName?: string;
    lastName?: string;
    email?: string;
  }): Promise<AuthUser> {
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    if (data.email && data.email !== user.email) {
      const existing = await storage.getUserByEmail(data.email);
      if (existing) {
        throw new Error("Cet email est déjà utilisé par un autre compte.");
      }
    }

    const updatedUser = await storage.updateUser(userId, {
      firstName: data.firstName ?? user.firstName,
      lastName: data.lastName ?? user.lastName,
      email: data.email ?? user.email,
    });

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      role: updatedUser.role,
    };
  }

  static async updatePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    if (!oldPassword || !newPassword) {
      throw new Error("L'ancien et le nouveau mot de passe sont requis.");
    }
    if (newPassword.length < 6) {
      throw new Error("Le nouveau mot de passe doit contenir au moins 6 caractères.");
    }

    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error("Utilisateur non trouvé.");
    }

    const isMatch = await this.verifyPassword(oldPassword, user.password);
    if (!isMatch) {
      throw new Error("L'ancien mot de passe est incorrect.");
    }

    const hashedNewPassword = await this.hashPassword(newPassword);
    await storage.updatePassword(userId, hashedNewPassword);
  }
}

// Middleware pour vérifier l'authentification
export function requireAuth(req: any, res: any, next: any) {
  if (!req.session?.user) {
    return res.status(401).json({ message: 'Authentification requise' });
  }
  next();
}

// Middleware pour vérifier le rôle admin
export function requireAdmin(req: any, res: any, next: any) {
  if (!req.session?.user) {
    return res.status(401).json({ message: 'Authentification requise' });
  }
  
  if (req.session.user.role !== 'admin') {
    return res.status(403).json({ message: 'Accès administrateur requis' });
  }
  
  next();
}

