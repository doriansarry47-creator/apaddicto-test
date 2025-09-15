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
  emergencyRoutines,
  quickResources,
  antiCravingStrategies,
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
  type EmergencyRoutine,
  type InsertEmergencyRoutine,
  type QuickResource,
  type InsertQuickResource,
  type AntiCravingStrategy,
  type InsertAntiCravingStrategy,
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
  getPsychoEducationContentById(contentId: string): Promise<PsychoEducationContent | undefined>;
  createPsychoEducationContent(content: InsertPsychoEducationContent): Promise<PsychoEducationContent>;
  updatePsychoEducationContent(contentId: string, data: Partial<InsertPsychoEducationContent>): Promise<PsychoEducationContent>;
  deletePsychoEducationContent(contentId: string): Promise<void>;

  // Craving operations
  createCravingEntry(entry: InsertCravingEntry): Promise<CravingEntry>;
  getCravingEntries(userId: string, limit?: number): Promise<CravingEntry[]>;
  getCravingStats(userId: string, days?: number): Promise<{ average: number; trend: number }>;

  // Exercise session operations
  createExerciseSession(session: InsertExerciseSession): Promise<ExerciseSession>;
  getExerciseSessions(userId: string, limit?: number): Promise<ExerciseSession[]>;
  getExerciseSessionsWithDetails(userId: string, limit?: number): Promise<any[]>;
  getUserStats(userId: string): Promise<UserStats | undefined>;

  // Beck analysis operations
  createBeckAnalysis(analysis: InsertBeckAnalysis): Promise<BeckAnalysis>;
  getBeckAnalyses(userId: string, limit?: number): Promise<BeckAnalysis[]>;

  // Badge operations
  getUserBadges(userId: string): Promise<UserBadge[]>;
  
  // Emergency routine operations
  getAllEmergencyRoutines(): Promise<EmergencyRoutine[]>;
  getEmergencyRoutine(routineId: string): Promise<EmergencyRoutine | undefined>;
  createEmergencyRoutine(routine: InsertEmergencyRoutine): Promise<EmergencyRoutine>;
  updateEmergencyRoutine(routineId: string, routine: Partial<InsertEmergencyRoutine>): Promise<EmergencyRoutine>;
  deleteEmergencyRoutine(routineId: string): Promise<void>;
  getDefaultEmergencyRoutine(): Promise<EmergencyRoutine | undefined>;
  setDefaultEmergencyRoutine(routineId: string): Promise<void>;
  
  // Quick resource operations
  getAllQuickResources(): Promise<QuickResource[]>;
  getQuickResource(resourceId: string): Promise<QuickResource | undefined>;
  createQuickResource(resource: InsertQuickResource): Promise<QuickResource>;
  updateQuickResource(resourceId: string, resource: Partial<InsertQuickResource>): Promise<QuickResource>;
  deleteQuickResource(resourceId: string): Promise<void>;
  getPinnedQuickResources(): Promise<QuickResource[]>;
  togglePinQuickResource(resourceId: string): Promise<void>;
  
  // Anti-craving strategies operations
  createAntiCravingStrategies(userId: string, strategies: InsertAntiCravingStrategy[]): Promise<AntiCravingStrategy[]>;
  getAntiCravingStrategies(userId: string): Promise<AntiCravingStrategy[]>;
  
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
      await tx.delete(antiCravingStrategies).where(eq(antiCravingStrategies.userId, userId));
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

  async getPsychoEducationContentById(contentId: string): Promise<PsychoEducationContent | undefined> {
    const result = await getDB().select().from(psychoEducationContent).where(eq(psychoEducationContent.id, contentId));
    return result[0];
  }

  async createPsychoEducationContent(insertContent: InsertPsychoEducationContent): Promise<PsychoEducationContent> {
    return getDB().insert(psychoEducationContent).values(insertContent).returning().then(rows => rows[0]);
  }

  async updatePsychoEducationContent(contentId: string, data: Partial<InsertPsychoEducationContent>): Promise<PsychoEducationContent> {
    const result = await getDB().update(psychoEducationContent)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(psychoEducationContent.id, contentId))
      .returning();
    
    if (result.length === 0) {
      throw new Error("Content not found");
    }
    
    return result[0];
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

  async getExerciseSessionsWithDetails(userId: string, limit = 50): Promise<any[]> {
    const sessions = await getDB()
      .select({
        id: exerciseSessions.id,
        userId: exerciseSessions.userId,
        exerciseId: exerciseSessions.exerciseId,
        duration: exerciseSessions.duration,
        completed: exerciseSessions.completed,
        cravingBefore: exerciseSessions.cravingBefore,
        cravingAfter: exerciseSessions.cravingAfter,
        createdAt: exerciseSessions.createdAt,
        exerciseTitle: exercises.title,
        exerciseCategory: exercises.category,
      })
      .from(exerciseSessions)
      .leftJoin(exercises, eq(exerciseSessions.exerciseId, exercises.id))
      .where(eq(exerciseSessions.userId, userId))
      .orderBy(desc(exerciseSessions.createdAt))
      .limit(limit);
    
    return sessions;
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

  // Admin operations
  async getAllUsersWithStats(): Promise<any[]> {
    const db = getDB();
    
    const allUsers = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        createdAt: users.createdAt,
        isActive: users.isActive,
      })
      .from(users);

    const usersWithFullStats = await Promise.all(
      allUsers.map(async (user) => {
        const stats = await this.getUserStats(user.id);
        return {
          ...user,
          stats: stats || {
            exercisesCompleted: 0,
            totalDuration: 0,
            currentStreak: 0,
            longestStreak: 0,
            averageCraving: null,
          },
        };
      })
    );

    return usersWithFullStats;
  }

  async getAllMediaFiles(): Promise<any[]> {
    return [];
  }

  async deleteMediaFile(mediaId: string): Promise<void> {
    return;
  }

  // Emergency routine operations
  async getAllEmergencyRoutines(): Promise<EmergencyRoutine[]> {
    return getDB().select().from(emergencyRoutines).where(eq(emergencyRoutines.isActive, true)).orderBy(emergencyRoutines.title);
  }

  async getEmergencyRoutine(routineId: string): Promise<EmergencyRoutine | undefined> {
    const result = await getDB().select().from(emergencyRoutines).where(eq(emergencyRoutines.id, routineId));
    return result[0];
  }

  async createEmergencyRoutine(insertRoutine: InsertEmergencyRoutine): Promise<EmergencyRoutine> {
    return getDB().insert(emergencyRoutines).values(insertRoutine).returning().then(rows => rows[0]);
  }

  async updateEmergencyRoutine(routineId: string, updateData: Partial<InsertEmergencyRoutine>): Promise<EmergencyRoutine> {
    const result = await getDB()
      .update(emergencyRoutines)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(emergencyRoutines.id, routineId))
      .returning();
    return result[0];
  }

  async deleteEmergencyRoutine(routineId: string): Promise<void> {
    await getDB().delete(emergencyRoutines).where(eq(emergencyRoutines.id, routineId));
  }

  async getDefaultEmergencyRoutine(): Promise<EmergencyRoutine | undefined> {
    const result = await getDB()
      .select()
      .from(emergencyRoutines)
      .where(and(eq(emergencyRoutines.isActive, true), eq(emergencyRoutines.isDefault, true)));
    return result[0];
  }

  async setDefaultEmergencyRoutine(routineId: string): Promise<void> {
    await getDB()
      .update(emergencyRoutines)
      .set({ isDefault: false })
      .where(eq(emergencyRoutines.isDefault, true));

    await getDB()
      .update(emergencyRoutines)
      .set({ isDefault: true })
      .where(eq(emergencyRoutines.id, routineId));
  }

  // Quick resource operations
  async getAllQuickResources(): Promise<QuickResource[]> {
    return getDB().select().from(quickResources).where(eq(quickResources.isActive, true)).orderBy(quickResources.title);
  }

  async getQuickResource(resourceId: string): Promise<QuickResource | undefined> {
    const result = await getDB().select().from(quickResources).where(eq(quickResources.id, resourceId));
    return result[0];
  }

  async createQuickResource(insertResource: InsertQuickResource): Promise<QuickResource> {
    return getDB().insert(quickResources).values(insertResource).returning().then(rows => rows[0]);
  }

  async updateQuickResource(resourceId: string, updateData: Partial<InsertQuickResource>): Promise<QuickResource> {
    const result = await getDB()
      .update(quickResources)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(quickResources.id, resourceId))
      .returning();
    return result[0];
  }

  async deleteQuickResource(resourceId: string): Promise<void> {
    await getDB().delete(quickResources).where(eq(quickResources.id, resourceId));
  }

  async getPinnedQuickResources(): Promise<QuickResource[]> {
    return getDB()
      .select()
      .from(quickResources)
      .where(and(eq(quickResources.isActive, true), eq(quickResources.isPinned, true)))
      .orderBy(quickResources.title);
  }

  async togglePinQuickResource(resourceId: string): Promise<void> {
    const resource = await this.getQuickResource(resourceId);
    if (resource) {
      await getDB()
        .update(quickResources)
        .set({ isPinned: !resource.isPinned })
        .where(eq(quickResources.id, resourceId));
    }
  }

  // Anti-craving strategies operations
  async createAntiCravingStrategies(userId: string, strategies: InsertAntiCravingStrategy[]): Promise<AntiCravingStrategy[]> {
    const db = getDB();
    
    // Validate input
    if (!Array.isArray(strategies) || strategies.length === 0) {
      throw new Error("Au moins une stratégie doit être fournie");
    }

    // Validate each strategy
    for (const strategy of strategies) {
      if (!strategy.context || !strategy.exercise || !strategy.effort || 
          typeof strategy.duration !== 'number' || 
          typeof strategy.cravingBefore !== 'number' || 
          typeof strategy.cravingAfter !== 'number') {
        throw new Error("Tous les champs de stratégie sont requis");
      }
    }
    
    const strategiesWithUserId = strategies.map(strategy => ({
      ...strategy,
      userId,
      // Ensure proper data types
      duration: Number(strategy.duration),
      cravingBefore: Number(strategy.cravingBefore),
      cravingAfter: Number(strategy.cravingAfter)
    }));
    
    try {
      const result = await db
        .insert(antiCravingStrategies)
        .values(strategiesWithUserId)
        .returning();
      
      console.log(`Successfully saved ${result.length} anti-craving strategies for user ${userId}`);
      return result;
    } catch (error) {
      console.error('Error saving anti-craving strategies:', error);
      
      // Vérifier si l'erreur est due à une table manquante
      if (error instanceof Error && error.message.includes('relation "anti_craving_strategies" does not exist')) {
        console.error('Table anti_craving_strategies manquante. Tentative de création...');
        
        try {
          // Essayer de créer la table directement via SQL
          const pool = getPool();
          await pool.query(`
            CREATE TABLE IF NOT EXISTS "anti_craving_strategies" (
              "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
              "user_id" varchar NOT NULL,
              "context" varchar NOT NULL,
              "exercise" text NOT NULL,
              "effort" varchar NOT NULL,
              "duration" integer NOT NULL,
              "craving_before" integer NOT NULL,
              "craving_after" integer NOT NULL,
              "created_at" timestamp DEFAULT now(),
              "updated_at" timestamp DEFAULT now()
            );
          `);
          
          // Ajouter la contrainte de clé étrangère si elle n'existe pas
          await pool.query(`
            DO $$ 
            BEGIN
              IF NOT EXISTS (
                SELECT 1 FROM information_schema.table_constraints 
                WHERE constraint_name = 'anti_craving_strategies_user_id_users_id_fk'
              ) THEN
                ALTER TABLE "anti_craving_strategies" 
                ADD CONSTRAINT "anti_craving_strategies_user_id_users_id_fk" 
                FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") 
                ON DELETE cascade ON UPDATE no action;
              END IF;
            END $$;
          `);
          
          console.log('Table anti_craving_strategies créée avec succès. Nouvelle tentative de sauvegarde...');
          
          // Réessayer la sauvegarde
          const retryResult = await db
            .insert(antiCravingStrategies)
            .values(strategiesWithUserId)
            .returning();
            
          console.log(`Successfully saved ${retryResult.length} anti-craving strategies for user ${userId} après création de table`);
          return retryResult;
          
        } catch (createError) {
          console.error('Erreur lors de la création de la table:', createError);
          throw new Error(`Erreur lors de la sauvegarde des stratégies : la table anti_craving_strategies n'existe pas.`);
        }
      }
      
      throw new Error(`Erreur lors de la sauvegarde des stratégies: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  async getAntiCravingStrategies(userId: string): Promise<AntiCravingStrategy[]> {
    return getDB()
      .select()
      .from(antiCravingStrategies)
      .where(eq(antiCravingStrategies.userId, userId))
      .orderBy(desc(antiCravingStrategies.createdAt));
  }
}

export const storage = new DbStorage();
