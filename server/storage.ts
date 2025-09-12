import { getDB } from "./db.js";
import {
  users,
  exercises,
  psychoEducationContent,
  cravingEntries,
  exerciseSessions,
  beckAnalyses,
  userBadges,
  userStats,
  type User,
  type InsertUser,
  type Exercise,
  type InsertExercise,
  type PsychoEducationContent,
  type InsertPsychoEducationContent,
  type CravingEntry,
  type InsertCravingEntry,
  type ExerciseSession,
  type InsertExerciseSession,
  type BeckAnalysis,
  type InsertBeckAnalysis,
  type UserBadge,
  type InsertUserBadge,
  type UserStats,
} from "../shared/schema.js";
import { randomUUID } from "crypto";
import { eq, desc, sql, and, gte } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(userId: string, data: Partial<Omit<User, 'id' | 'password' | 'role' | 'createdAt' | 'updatedAt'>>): Promise<User>;
  updatePassword(userId: string, newHashedPassword: string): Promise<User>;
  deleteUser(userId: string): Promise<void>;
  updateUserStats(userId: string, stats: Partial<UserStats>): Promise<UserStats>;

  // Exercise operations
  getExercises(): Promise<Exercise[]>;
  getAllExercises(): Promise<Exercise[]>;
  createExercise(exercise: InsertExercise): Promise<Exercise>;
  deleteExercise(exerciseId: string): Promise<void>;
  
  // Psychoeducation operations
  getPsychoEducationContent(): Promise<PsychoEducationContent[]>;
  getAllPsychoEducationContent(): Promise<PsychoEducationContent[]>;
  createPsychoEducationContent(content: InsertPsychoEducationContent): Promise<PsychoEducationContent>;
  deletePsychoEducationContent(contentId: string): Promise<void>;

  // Craving operations
  createCravingEntry(entry: InsertCravingEntry): Promise<CravingEntry>;
  getCravingEntries(userId: string, limit?: number): Promise<CravingEntry[]>;
  getCravingStats(userId: string, days?: number): Promise<{ average: number; trend: number }>;

  // Exercise session operations
  createExerciseSession(session: InsertExerciseSession): Promise<ExerciseSession>;
  getExerciseSessions(userId: string, limit?: number): Promise<ExerciseSession[]>;
  getUserStats(userId: string): Promise<UserStats | undefined>;

  // Beck analysis operations
  createBeckAnalysis(analysis: InsertBeckAnalysis): Promise<BeckAnalysis>;
  getBeckAnalyses(userId: string, limit?: number): Promise<BeckAnalysis[]>;

  // Badge operations
  getUserBadges(userId: string): Promise<UserBadge[]>;
  awardBadge(badge: InsertUserBadge): Promise<UserBadge>;
  checkAndAwardBadges(userId: string): Promise<UserBadge[]>;
}

export class DbStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    return getDB().select().from(users).where(eq(users.id, id)).then(rows => rows[0]);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return getDB().select().from(users).where(eq(users.email, email)).then(rows => rows[0]);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const newUser = await getDB().insert(users).values(insertUser).returning().then(rows => rows[0]);
    // Initialize stats for the new user
    await getDB().insert(userStats).values({ userId: newUser.id });
    return newUser;
  }

  async updateUser(userId: string, data: Partial<Omit<User, 'id' | 'password' | 'role' | 'createdAt' | 'updatedAt'>>): Promise<User> {
    const updatedUser = await getDB().update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser[0];
  }

  async updatePassword(userId: string, newHashedPassword: string): Promise<User> {
    return getDB().update(users)
      .set({ password: newHashedPassword, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning()
      .then(rows => rows[0]);
  }

  async deleteUser(userId: string): Promise<void> {
    await getDB().transaction(async (tx) => {
      await tx.delete(userBadges).where(eq(userBadges.userId, userId));
      await tx.delete(userStats).where(eq(userStats.userId, userId));
      await tx.delete(beckAnalyses).where(eq(beckAnalyses.userId, userId));
      await tx.delete(exerciseSessions).where(eq(exerciseSessions.userId, userId));
      await tx.delete(cravingEntries).where(eq(cravingEntries.userId, userId));
      await tx.delete(users).where(eq(users.id, userId));
    });
  }

  async updateUserStats(userId: string, statsUpdate: Partial<UserStats>): Promise<UserStats> {
    const updated = await getDB().update(userStats)
      .set({ ...statsUpdate, updatedAt: new Date() })
      .where(eq(userStats.userId, userId))
      .returning();
    return updated[0];
  }

  async getExercises(): Promise<Exercise[]> {
    return getDB().select().from(exercises).where(eq(exercises.isActive, true)).orderBy(exercises.title);
  }

  async getAllExercises(): Promise<Exercise[]> {
    return getDB().select().from(exercises).orderBy(exercises.title);
  }

  async createExercise(insertExercise: InsertExercise): Promise<Exercise> {
    return getDB().insert(exercises).values(insertExercise).returning().then(rows => rows[0]);
  }

  async deleteExercise(exerciseId: string): Promise<void> {
    await getDB().delete(exercises).where(eq(exercises.id, exerciseId));
  }

  async getPsychoEducationContent(): Promise<PsychoEducationContent[]> {
    return getDB().select().from(psychoEducationContent).where(eq(psychoEducationContent.isActive, true)).orderBy(psychoEducationContent.title);
  }

  async getAllPsychoEducationContent(): Promise<PsychoEducationContent[]> {
    return getDB().select().from(psychoEducationContent).orderBy(psychoEducationContent.title);
  }

  async createPsychoEducationContent(insertContent: InsertPsychoEducationContent): Promise<PsychoEducationContent> {
    return getDB().insert(psychoEducationContent).values(insertContent).returning().then(rows => rows[0]);
  }

  async deletePsychoEducationContent(contentId: string): Promise<void> {
    await getDB().delete(psychoEducationContent).where(eq(psychoEducationContent.id, contentId));
  }

  async createCravingEntry(insertEntry: InsertCravingEntry): Promise<CravingEntry> {
    const valuesToInsert: {
      userId: string;
      intensity: number;
      triggers?: string[];
      emotions?: string[];
      notes?: string | null;
    } = {
      userId: insertEntry.userId,
      intensity: insertEntry.intensity,
    };

    if (insertEntry.triggers) valuesToInsert.triggers = Array.from(insertEntry.triggers as string[]);
    if (insertEntry.emotions) valuesToInsert.emotions = Array.from(insertEntry.emotions as string[]);
    if (insertEntry.notes) valuesToInsert.notes = insertEntry.notes;

    const newEntry = await getDB().insert(cravingEntries).values(valuesToInsert).returning().then(rows => rows[0]);
    await this.updateAverageCraving(insertEntry.userId);
    return newEntry;
  }

  async getCravingEntries(userId: string, limit = 50): Promise<CravingEntry[]> {
    return getDB().select().from(cravingEntries)
      .where(eq(cravingEntries.userId, userId))
      .orderBy(desc(cravingEntries.createdAt))
      .limit(limit);
  }

  async getCravingStats(userId: string, days = 30): Promise<{ average: number; trend: number }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const entries = await getDB().select().from(cravingEntries)
      .where(and(eq(cravingEntries.userId, userId), gte(cravingEntries.createdAt, cutoffDate)))
      .orderBy(cravingEntries.createdAt);

    if (entries.length === 0) return { average: 0, trend: 0 };

    const average = entries.reduce((sum, entry) => sum + entry.intensity, 0) / entries.length;

    const midPoint = Math.floor(entries.length / 2);
    if (midPoint < 1) return { average: Math.round(average * 10) / 10, trend: 0 };

    const firstHalf = entries.slice(0, midPoint);
    const secondHalf = entries.slice(midPoint);

    const firstAvg = firstHalf.reduce((sum, entry) => sum + entry.intensity, 0) / firstHalf.length || 0;
    const secondAvg = secondHalf.reduce((sum, entry) => sum + entry.intensity, 0) / secondHalf.length || 0;
    const trend = firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;

    return { average: Math.round(average * 10) / 10, trend: Math.round(trend) };
  }

  private async updateAverageCraving(userId: string): Promise<void> {
    const stats = await this.getCravingStats(userId);
    await this.updateUserStats(userId, { averageCraving: Math.round(stats.average) });
  }

  async createExerciseSession(insertSession: InsertExerciseSession): Promise<ExerciseSession> {
    const session = await getDB().insert(exerciseSessions).values(insertSession).returning().then(rows => rows[0]);

    if (session.completed) {
      const currentStats = await this.getUserStats(session.userId);
      if (currentStats) {
        await this.updateUserStats(session.userId, {
          exercisesCompleted: (currentStats.exercisesCompleted || 0) + 1,
          totalDuration: (currentStats.totalDuration || 0) + (session.duration || 0),
        });
      }

      const user = await this.getUser(session.userId);
      if (user) {
        const newPoints = (user.points || 0) + 10;
        const newLevel = Math.floor(newPoints / 100) + 1;
        await getDB().update(users).set({ points: newPoints, level: newLevel, updatedAt: new Date() }).where(eq(users.id, session.userId));
      }
      await this.checkAndAwardBadges(session.userId);
    }
    return session;
  }

  async getExerciseSessions(userId: string, limit = 50): Promise<ExerciseSession[]> {
    return getDB().select().from(exerciseSessions)
      .where(eq(exerciseSessions.userId, userId))
      .orderBy(desc(exerciseSessions.createdAt))
      .limit(limit);
  }

  async getUserStats(userId: string): Promise<UserStats | undefined> {
    return getDB().select().from(userStats).where(eq(userStats.userId, userId)).then(rows => rows[0]);
  }

  async createBeckAnalysis(insertAnalysis: InsertBeckAnalysis): Promise<BeckAnalysis> {
    return getDB().insert(beckAnalyses).values(insertAnalysis).returning().then(rows => rows[0]);
  }

  async getBeckAnalyses(userId: string, limit = 20): Promise<BeckAnalysis[]> {
    return getDB().select().from(beckAnalyses)
      .where(eq(beckAnalyses.userId, userId))
      .orderBy(desc(beckAnalyses.createdAt))
      .limit(limit);
  }

  async getUserBadges(userId: string): Promise<UserBadge[]> {
    return getDB().select().from(userBadges).where(eq(userBadges.userId, userId)).orderBy(desc(userBadges.earnedAt));
  }

  async awardBadge(insertBadge: InsertUserBadge): Promise<UserBadge> {
    const existingBadge = await getDB().select().from(userBadges)
      .where(and(eq(userBadges.userId, insertBadge.userId), eq(userBadges.badgeType, insertBadge.badgeType)))
      .then(rows => rows[0]);

    if (existingBadge) return existingBadge;

    return getDB().insert(userBadges).values(insertBadge).returning().then(rows => rows[0]);
  }

  async checkAndAwardBadges(userId: string): Promise<UserBadge[]> {
    const newBadges: UserBadge[] = [];
    const stats = await this.getUserStats(userId);

    if (!stats) return newBadges;

    // 50 exercises badge
    if ((stats.exercisesCompleted || 0) >= 50) {
      const badge = await this.awardBadge({ userId, badgeType: '50_exercises' });
      if (badge) newBadges.push(badge);
    }
    // Other badge logic can be added here...
    return newBadges;
  }
}

export const storage = new DbStorage();

// Extension de la classe pour les méthodes d'administration
Object.assign(DbStorage.prototype, {
  // Admin operations
  async getAllUsersWithStats(): Promise<any[]> {
    const db = getDB();
    
    const usersWithStats = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        createdAt: users.createdAt,
        lastLoginAt: users.lastLoginAt,
        isActive: users.isActive,
      })
      .from(users)
      .orderBy(desc(users.createdAt));

    // Pour chaque utilisateur, récupérer ses statistiques
    const usersWithFullStats = await Promise.all(
      usersWithStats.map(async (user) => {
        const [exerciseCount] = await db
          .select({ count: sql<number>`count(*)` })
          .from(exerciseSessions)
          .where(eq(exerciseSessions.userId, user.id));

        const [cravingCount] = await db
          .select({ count: sql<number>`count(*)` })
          .from(cravingEntries)
          .where(eq(cravingEntries.userId, user.id));

        return {
          ...user,
          exerciseCount: exerciseCount?.count || 0,
          cravingCount: cravingCount?.count || 0,
        };
      })
    );

    return usersWithFullStats;
  },

  async getAllMediaFiles(): Promise<any[]> {
    // Pour l'instant, retourner un tableau vide car la table media n'existe pas encore
    // Dans une implémentation complète, on créerait une table media dans le schéma
    return [];
  },

  async deleteMediaFile(mediaId: string): Promise<void> {
    // Pour l'instant, ne rien faire car la table media n'existe pas encore
    // Dans une implémentation complète, on supprimerait le fichier de la table media
    return;
  }
});

