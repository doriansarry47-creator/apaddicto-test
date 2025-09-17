var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  antiCravingStrategies: () => antiCravingStrategies,
  audioContent: () => audioContent,
  beckAnalyses: () => beckAnalyses,
  cravingEntries: () => cravingEntries,
  emergencyRoutines: () => emergencyRoutines,
  exerciseEnhancements: () => exerciseEnhancements,
  exerciseSessions: () => exerciseSessions,
  exercises: () => exercises,
  insertAntiCravingStrategySchema: () => insertAntiCravingStrategySchema,
  insertAudioContentSchema: () => insertAudioContentSchema,
  insertBeckAnalysisSchema: () => insertBeckAnalysisSchema,
  insertCravingEntrySchema: () => insertCravingEntrySchema,
  insertEmergencyRoutineSchema: () => insertEmergencyRoutineSchema,
  insertExerciseEnhancementSchema: () => insertExerciseEnhancementSchema,
  insertExerciseSchema: () => insertExerciseSchema,
  insertExerciseSessionSchema: () => insertExerciseSessionSchema,
  insertProfessionalReportSchema: () => insertProfessionalReportSchema,
  insertPsychoEducationContentSchema: () => insertPsychoEducationContentSchema,
  insertQuickResourceSchema: () => insertQuickResourceSchema,
  insertTimerSessionSchema: () => insertTimerSessionSchema,
  insertUserBadgeSchema: () => insertUserBadgeSchema,
  insertUserSchema: () => insertUserSchema,
  insertVisualizationContentSchema: () => insertVisualizationContentSchema,
  professionalReports: () => professionalReports,
  psychoEducationContent: () => psychoEducationContent,
  quickResources: () => quickResources,
  timerSessions: () => timerSessions,
  userBadges: () => userBadges,
  userStats: () => userStats,
  users: () => users,
  visualizationContent: () => visualizationContent
});
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users, exercises, psychoEducationContent, cravingEntries, exerciseSessions, beckAnalyses, userBadges, userStats, insertUserSchema, insertExerciseSchema, insertPsychoEducationContentSchema, insertCravingEntrySchema, insertExerciseSessionSchema, insertBeckAnalysisSchema, insertUserBadgeSchema, emergencyRoutines, insertEmergencyRoutineSchema, quickResources, insertQuickResourceSchema, antiCravingStrategies, insertAntiCravingStrategySchema, timerSessions, professionalReports, visualizationContent, audioContent, exerciseEnhancements, insertTimerSessionSchema, insertProfessionalReportSchema, insertVisualizationContentSchema, insertAudioContentSchema, insertExerciseEnhancementSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    users = pgTable("users", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      email: varchar("email").unique().notNull(),
      password: varchar("password").notNull(),
      firstName: varchar("first_name"),
      lastName: varchar("last_name"),
      profileImageUrl: varchar("profile_image_url"),
      role: varchar("role").default("patient"),
      // 'patient' or 'admin'
      level: integer("level").default(1),
      points: integer("points").default(0),
      isActive: boolean("is_active").default(true),
      lastLoginAt: timestamp("last_login_at"),
      inactivityThreshold: integer("inactivity_threshold").default(30),
      // jours avant considéré inactif
      notes: text("notes"),
      // notes du thérapeute sur le patient
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    exercises = pgTable("exercises", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      title: varchar("title").notNull(),
      description: text("description"),
      category: varchar("category").notNull(),
      // 'cardio', 'strength', 'flexibility', 'mindfulness'
      difficulty: varchar("difficulty").default("beginner"),
      // 'beginner', 'intermediate', 'advanced'
      duration: integer("duration"),
      // in minutes
      instructions: text("instructions"),
      benefits: text("benefits"),
      imageUrl: varchar("image_url"),
      videoUrl: varchar("video_url"),
      isActive: boolean("is_active").default(true),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    psychoEducationContent = pgTable("psycho_education_content", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      title: varchar("title").notNull(),
      content: text("content").notNull(),
      category: varchar("category").notNull(),
      // 'addiction', 'motivation', 'coping', 'relapse_prevention'
      type: varchar("type").default("article"),
      // 'article', 'video', 'audio', 'interactive'
      difficulty: varchar("difficulty").default("beginner"),
      estimatedReadTime: integer("estimated_read_time"),
      // in minutes
      imageUrl: varchar("image_url"),
      videoUrl: varchar("video_url"),
      audioUrl: varchar("audio_url"),
      isActive: boolean("is_active").default(true),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    cravingEntries = pgTable("craving_entries", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      intensity: integer("intensity").notNull(),
      // 0-10 scale
      triggers: jsonb("triggers").$type().default([]),
      emotions: jsonb("emotions").$type().default([]),
      notes: text("notes"),
      createdAt: timestamp("created_at").defaultNow()
    });
    exerciseSessions = pgTable("exercise_sessions", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      exerciseId: varchar("exercise_id").notNull().references(() => exercises.id, { onDelete: "cascade" }),
      duration: integer("duration"),
      // in seconds
      completed: boolean("completed").default(false),
      cravingBefore: integer("craving_before"),
      // 0-10 scale
      cravingAfter: integer("craving_after"),
      // 0-10 scale
      createdAt: timestamp("created_at").defaultNow()
    });
    beckAnalyses = pgTable("beck_analyses", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      situation: text("situation"),
      automaticThoughts: text("automatic_thoughts"),
      emotions: text("emotions"),
      emotionIntensity: integer("emotion_intensity"),
      rationalResponse: text("rational_response"),
      newFeeling: text("new_feeling"),
      newIntensity: integer("new_intensity"),
      createdAt: timestamp("created_at").defaultNow()
    });
    userBadges = pgTable("user_badges", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      badgeType: varchar("badge_type").notNull(),
      // '7_days', '50_exercises', 'craving_reduction'
      earnedAt: timestamp("earned_at").defaultNow()
    });
    userStats = pgTable("user_stats", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
      exercisesCompleted: integer("exercises_completed").default(0),
      totalDuration: integer("total_duration").default(0),
      // in seconds
      currentStreak: integer("current_streak").default(0),
      longestStreak: integer("longest_streak").default(0),
      averageCraving: integer("average_craving"),
      // calculated average
      beckAnalysesCompleted: integer("beck_analyses_completed").default(0),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertUserSchema = createInsertSchema(users).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertExerciseSchema = createInsertSchema(exercises).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertPsychoEducationContentSchema = createInsertSchema(psychoEducationContent).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertCravingEntrySchema = createInsertSchema(cravingEntries).omit({
      id: true,
      createdAt: true
    });
    insertExerciseSessionSchema = createInsertSchema(exerciseSessions).omit({
      id: true,
      createdAt: true
    });
    insertBeckAnalysisSchema = createInsertSchema(beckAnalyses).omit({
      id: true,
      createdAt: true
    });
    insertUserBadgeSchema = createInsertSchema(userBadges).omit({
      id: true,
      earnedAt: true
    });
    emergencyRoutines = pgTable("emergency_routines", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      title: varchar("title").notNull(),
      description: text("description"),
      steps: jsonb("steps").notNull(),
      // Array of steps for the routine
      duration: integer("duration"),
      // in minutes
      category: varchar("category").default("general"),
      // 'breathing', 'grounding', 'distraction', 'general'
      isActive: boolean("is_active").default(true),
      isDefault: boolean("is_default").default(false),
      // One routine can be marked as default
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertEmergencyRoutineSchema = createInsertSchema(emergencyRoutines).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    quickResources = pgTable("quick_resources", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      title: varchar("title").notNull(),
      description: text("description"),
      content: text("content").notNull(),
      category: varchar("category").notNull(),
      // 'coping', 'motivation', 'emergency', 'relaxation'
      type: varchar("type").default("tip"),
      // 'tip', 'technique', 'reminder', 'affirmation'
      icon: varchar("icon"),
      // Icon name for UI
      color: varchar("color").default("blue"),
      // Color theme
      isActive: boolean("is_active").default(true),
      isPinned: boolean("is_pinned").default(false),
      // Pinned resources appear first
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertQuickResourceSchema = createInsertSchema(quickResources).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    antiCravingStrategies = pgTable("anti_craving_strategies", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      context: varchar("context").notNull(),
      // 'leisure', 'home', 'work'
      exercise: text("exercise").notNull(),
      effort: varchar("effort").notNull(),
      // 'faible', 'modéré', 'intense'
      duration: integer("duration").notNull(),
      // in minutes
      cravingBefore: integer("craving_before").notNull(),
      // 0-10 scale
      cravingAfter: integer("craving_after").notNull(),
      // 0-10 scale
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertAntiCravingStrategySchema = createInsertSchema(antiCravingStrategies).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    timerSessions = pgTable("timer_sessions", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      exerciseId: varchar("exercise_id").notNull().references(() => exercises.id, { onDelete: "cascade" }),
      type: varchar("type").notNull(),
      // 'interval', 'continuous', 'breathing'
      duration: integer("duration").notNull(),
      // in seconds
      intervals: jsonb("intervals"),
      // for interval timers
      audioUrl: varchar("audio_url"),
      // background audio/music
      completed: boolean("completed").default(false),
      heartRateBefore: integer("heart_rate_before"),
      heartRateAfter: integer("heart_rate_after"),
      stressLevelBefore: integer("stress_level_before"),
      // 1-10 scale
      stressLevelAfter: integer("stress_level_after"),
      // 1-10 scale
      notes: text("notes"),
      createdAt: timestamp("created_at").defaultNow()
    });
    professionalReports = pgTable("professional_reports", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      patientId: varchar("patient_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      therapistId: varchar("therapist_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      reportType: varchar("report_type").notNull(),
      // 'weekly', 'monthly', 'session', 'progress'
      title: varchar("title").notNull(),
      content: text("content").notNull(),
      data: jsonb("data"),
      // structured data (charts, stats, etc.)
      startDate: timestamp("start_date"),
      endDate: timestamp("end_date"),
      isPrivate: boolean("is_private").default(true),
      tags: jsonb("tags").$type().default([]),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    visualizationContent = pgTable("visualization_content", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      title: varchar("title").notNull(),
      description: text("description"),
      type: varchar("type").notNull(),
      // 'guided_imagery', 'meditation', 'breathing', 'visualization'
      category: varchar("category").notNull(),
      // 'relaxation', 'stress_reduction', 'pain_management', 'emotional_regulation'
      difficulty: varchar("difficulty").default("beginner"),
      duration: integer("duration"),
      // in minutes
      audioUrl: varchar("audio_url"),
      videoUrl: varchar("video_url"),
      imageUrl: varchar("image_url"),
      script: text("script"),
      // text script for the visualization
      instructions: text("instructions"),
      benefits: text("benefits"),
      isActive: boolean("is_active").default(true),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    audioContent = pgTable("audio_content", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      title: varchar("title").notNull(),
      description: text("description"),
      type: varchar("type").notNull(),
      // 'relaxation', 'nature_sounds', 'meditation', 'breathing_guide', 'asmr'
      category: varchar("category").notNull(),
      duration: integer("duration"),
      // in seconds
      audioUrl: varchar("audio_url").notNull(),
      thumbnailUrl: varchar("thumbnail_url"),
      isLoopable: boolean("is_loopable").default(false),
      volumeRecommendation: varchar("volume_recommendation").default("medium"),
      tags: jsonb("tags").$type().default([]),
      isActive: boolean("is_active").default(true),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    exerciseEnhancements = pgTable("exercise_enhancements", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      exerciseId: varchar("exercise_id").notNull().references(() => exercises.id, { onDelete: "cascade" }),
      audioUrls: jsonb("audio_urls").$type().default([]),
      // multiple audio tracks
      videoUrls: jsonb("video_urls").$type().default([]),
      imageUrls: jsonb("image_urls").$type().default([]),
      timerSettings: jsonb("timer_settings"),
      // interval timer configuration
      breathingPattern: jsonb("breathing_pattern"),
      // for breathing exercises
      visualizationScript: text("visualization_script"),
      isActive: boolean("is_active").default(true),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insertTimerSessionSchema = createInsertSchema(timerSessions).omit({
      id: true,
      createdAt: true
    });
    insertProfessionalReportSchema = createInsertSchema(professionalReports).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertVisualizationContentSchema = createInsertSchema(visualizationContent).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertAudioContentSchema = createInsertSchema(audioContent).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertExerciseEnhancementSchema = createInsertSchema(exerciseEnhancements).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
  }
});

// server/db.ts
import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
function getDB() {
  if (!db) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
    }
    pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });
    db = drizzle(pool, { schema: schema_exports });
  }
  return db;
}
function getPool() {
  if (!pool) {
    getDB();
  }
  return pool;
}
var Pool, pool, db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    ({ Pool } = pkg);
    pool = null;
    db = null;
  }
});

// server/storage.ts
import { eq, desc, sql as sql2, and, gte } from "drizzle-orm";
var DbStorage, storage;
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    init_db();
    init_schema();
    DbStorage = class {
      // Utilitaire pour s'assurer que la colonne beck_analyses_completed existe
      async ensureBeckAnalysesColumn() {
        try {
          const pool3 = getPool();
          if (!pool3) return;
          const checkResult = await pool3.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'user_stats' 
          AND column_name = 'beck_analyses_completed'
        );
      `);
          if (!checkResult.rows[0].exists) {
            console.log("\u26A0\uFE0F Ajout automatique de la colonne beck_analyses_completed...");
            await pool3.query(`
          ALTER TABLE "user_stats" 
          ADD COLUMN "beck_analyses_completed" integer DEFAULT 0;
        `);
            console.log("\u2705 Colonne beck_analyses_completed ajout\xE9e automatiquement");
          }
        } catch (error) {
          console.error("Erreur lors de la v\xE9rification de la colonne beck_analyses_completed:", error);
        }
      }
      async updateUserStatsForBeckAnalysis(userId) {
        await this.ensureBeckAnalysesColumn();
        const stats = await this.getUserStats(userId);
        if (stats) {
          try {
            await this.updateUserStats(userId, {
              beckAnalysesCompleted: (stats.beckAnalysesCompleted || 0) + 1,
              updatedAt: /* @__PURE__ */ new Date()
            });
          } catch (error) {
            console.log("\u26A0\uFE0F Erreur mise \xE0 jour stats Beck, ignor\xE9e:", error instanceof Error ? error.message : error);
          }
        }
      }
      async getUser(id) {
        return getDB().select().from(users).where(eq(users.id, id)).then((rows) => rows[0]);
      }
      async getUserByEmail(email) {
        return getDB().select().from(users).where(eq(users.email, email)).then((rows) => rows[0]);
      }
      async createUser(insertUser) {
        const newUser = await getDB().insert(users).values(insertUser).returning().then((rows) => rows[0]);
        await this.ensureBeckAnalysesColumn();
        try {
          await getDB().insert(userStats).values({
            userId: newUser.id,
            exercisesCompleted: 0,
            totalDuration: 0,
            currentStreak: 0,
            longestStreak: 0,
            beckAnalysesCompleted: 0
          });
        } catch (error) {
          console.log("\u26A0\uFE0F Tentative d'insertion sans beck_analyses_completed...");
          await getDB().insert(userStats).values({
            userId: newUser.id,
            exercisesCompleted: 0,
            totalDuration: 0,
            currentStreak: 0,
            longestStreak: 0
          });
        }
        return newUser;
      }
      async updateUser(userId, data) {
        const updatedUser = await getDB().update(users).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, userId)).returning();
        return updatedUser[0];
      }
      async updatePassword(userId, newHashedPassword) {
        return getDB().update(users).set({ password: newHashedPassword, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, userId)).returning().then((rows) => rows[0]);
      }
      async deleteUser(userId) {
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
      async updateUserStats(userId, statsUpdate) {
        const updated = await getDB().update(userStats).set({ ...statsUpdate, updatedAt: /* @__PURE__ */ new Date() }).where(eq(userStats.userId, userId)).returning();
        return updated[0];
      }
      async getExercises() {
        return getDB().select().from(exercises).where(eq(exercises.isActive, true)).orderBy(exercises.title);
      }
      async getAllExercises() {
        return getDB().select().from(exercises).orderBy(exercises.title);
      }
      async getExerciseById(exerciseId) {
        const result = await getDB().select().from(exercises).where(eq(exercises.id, exerciseId));
        return result[0];
      }
      async createExercise(insertExercise) {
        return getDB().insert(exercises).values(insertExercise).returning().then((rows) => rows[0]);
      }
      async deleteExercise(exerciseId) {
        await getDB().delete(exercises).where(eq(exercises.id, exerciseId));
      }
      async getPsychoEducationContent() {
        return getDB().select().from(psychoEducationContent).where(eq(psychoEducationContent.isActive, true)).orderBy(psychoEducationContent.title);
      }
      async getAllPsychoEducationContent() {
        return getDB().select().from(psychoEducationContent).orderBy(psychoEducationContent.title);
      }
      async getPsychoEducationContentById(contentId) {
        const result = await getDB().select().from(psychoEducationContent).where(eq(psychoEducationContent.id, contentId));
        return result[0];
      }
      async createPsychoEducationContent(insertContent) {
        return getDB().insert(psychoEducationContent).values(insertContent).returning().then((rows) => rows[0]);
      }
      async updatePsychoEducationContent(contentId, data) {
        const result = await getDB().update(psychoEducationContent).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(psychoEducationContent.id, contentId)).returning();
        if (result.length === 0) {
          throw new Error("Content not found");
        }
        return result[0];
      }
      async deletePsychoEducationContent(contentId) {
        await getDB().delete(psychoEducationContent).where(eq(psychoEducationContent.id, contentId));
      }
      async createCravingEntry(insertEntry) {
        const valuesToInsert = {
          userId: insertEntry.userId,
          intensity: insertEntry.intensity
        };
        if (insertEntry.triggers) valuesToInsert.triggers = Array.from(insertEntry.triggers);
        if (insertEntry.emotions) valuesToInsert.emotions = Array.from(insertEntry.emotions);
        if (insertEntry.notes) valuesToInsert.notes = insertEntry.notes;
        const newEntry = await getDB().insert(cravingEntries).values(valuesToInsert).returning().then((rows) => rows[0]);
        await this.updateAverageCraving(insertEntry.userId);
        return newEntry;
      }
      async getCravingEntries(userId, limit = 50) {
        return getDB().select().from(cravingEntries).where(eq(cravingEntries.userId, userId)).orderBy(desc(cravingEntries.createdAt)).limit(limit);
      }
      async getCravingStats(userId, days = 30) {
        const cutoffDate = /* @__PURE__ */ new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        const entries = await getDB().select().from(cravingEntries).where(and(eq(cravingEntries.userId, userId), gte(cravingEntries.createdAt, cutoffDate))).orderBy(cravingEntries.createdAt);
        if (entries.length === 0) return { average: 0, trend: 0 };
        const average = entries.reduce((sum, entry) => sum + entry.intensity, 0) / entries.length;
        const midPoint = Math.floor(entries.length / 2);
        if (midPoint < 1) return { average: Math.round(average * 10) / 10, trend: 0 };
        const firstHalf = entries.slice(0, midPoint);
        const secondHalf = entries.slice(midPoint);
        const firstAvg = firstHalf.reduce((sum, entry) => sum + entry.intensity, 0) / firstHalf.length || 0;
        const secondAvg = secondHalf.reduce((sum, entry) => sum + entry.intensity, 0) / secondHalf.length || 0;
        const trend = firstAvg > 0 ? (secondAvg - firstAvg) / firstAvg * 100 : 0;
        return { average: Math.round(average * 10) / 10, trend: Math.round(trend) };
      }
      async updateAverageCraving(userId) {
        const stats = await this.getCravingStats(userId);
        await this.updateUserStats(userId, { averageCraving: Math.round(stats.average) });
      }
      async createExerciseSession(insertSession) {
        const session2 = await getDB().insert(exerciseSessions).values(insertSession).returning().then((rows) => rows[0]);
        if (session2.completed) {
          const currentStats = await this.getUserStats(session2.userId);
          if (currentStats) {
            await this.updateUserStats(session2.userId, {
              exercisesCompleted: (currentStats.exercisesCompleted || 0) + 1,
              totalDuration: (currentStats.totalDuration || 0) + (session2.duration || 0)
            });
          }
          const user = await this.getUser(session2.userId);
          if (user) {
            const newPoints = (user.points || 0) + 10;
            const newLevel = Math.floor(newPoints / 100) + 1;
            await getDB().update(users).set({ points: newPoints, level: newLevel, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, session2.userId));
          }
          await this.checkAndAwardBadges(session2.userId);
        }
        return session2;
      }
      async getExerciseSessions(userId, limit = 50) {
        return getDB().select().from(exerciseSessions).where(eq(exerciseSessions.userId, userId)).orderBy(desc(exerciseSessions.createdAt)).limit(limit);
      }
      async getExerciseSessionsWithDetails(userId, limit = 50) {
        const sessions = await getDB().select({
          id: exerciseSessions.id,
          userId: exerciseSessions.userId,
          exerciseId: exerciseSessions.exerciseId,
          duration: exerciseSessions.duration,
          completed: exerciseSessions.completed,
          cravingBefore: exerciseSessions.cravingBefore,
          cravingAfter: exerciseSessions.cravingAfter,
          createdAt: exerciseSessions.createdAt,
          exerciseTitle: exercises.title,
          exerciseCategory: exercises.category
        }).from(exerciseSessions).leftJoin(exercises, eq(exerciseSessions.exerciseId, exercises.id)).where(eq(exerciseSessions.userId, userId)).orderBy(desc(exerciseSessions.createdAt)).limit(limit);
        return sessions;
      }
      async getUserStats(userId) {
        return getDB().select().from(userStats).where(eq(userStats.userId, userId)).then((rows) => rows[0]);
      }
      async createBeckAnalysis(insertAnalysis) {
        const analysis = await getDB().insert(beckAnalyses).values(insertAnalysis).returning().then((rows) => rows[0]);
        await this.updateUserStatsForBeckAnalysis(analysis.userId);
        return analysis;
      }
      async getBeckAnalyses(userId, limit = 20) {
        return getDB().select().from(beckAnalyses).where(eq(beckAnalyses.userId, userId)).orderBy(desc(beckAnalyses.createdAt)).limit(limit);
      }
      async getUserBadges(userId) {
        return getDB().select().from(userBadges).where(eq(userBadges.userId, userId)).orderBy(desc(userBadges.earnedAt));
      }
      async awardBadge(insertBadge) {
        const existingBadge = await getDB().select().from(userBadges).where(and(eq(userBadges.userId, insertBadge.userId), eq(userBadges.badgeType, insertBadge.badgeType))).then((rows) => rows[0]);
        if (existingBadge) return existingBadge;
        return getDB().insert(userBadges).values(insertBadge).returning().then((rows) => rows[0]);
      }
      async checkAndAwardBadges(userId) {
        const newBadges = [];
        const stats = await this.getUserStats(userId);
        if (!stats) return newBadges;
        if ((stats.exercisesCompleted || 0) >= 50) {
          const badge = await this.awardBadge({ userId, badgeType: "50_exercises" });
          if (badge) newBadges.push(badge);
        }
        return newBadges;
      }
      // Admin operations - method removed (duplicate, see below)
      async getAllMediaFiles() {
        return [];
      }
      async deleteMediaFile(mediaId) {
        return;
      }
      // Emergency routine operations
      async getAllEmergencyRoutines() {
        return getDB().select().from(emergencyRoutines).where(eq(emergencyRoutines.isActive, true)).orderBy(emergencyRoutines.title);
      }
      async getEmergencyRoutine(routineId) {
        const result = await getDB().select().from(emergencyRoutines).where(eq(emergencyRoutines.id, routineId));
        return result[0];
      }
      async createEmergencyRoutine(insertRoutine) {
        return getDB().insert(emergencyRoutines).values(insertRoutine).returning().then((rows) => rows[0]);
      }
      async updateEmergencyRoutine(routineId, updateData) {
        const result = await getDB().update(emergencyRoutines).set({ ...updateData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(emergencyRoutines.id, routineId)).returning();
        return result[0];
      }
      async deleteEmergencyRoutine(routineId) {
        await getDB().delete(emergencyRoutines).where(eq(emergencyRoutines.id, routineId));
      }
      async getDefaultEmergencyRoutine() {
        const result = await getDB().select().from(emergencyRoutines).where(and(eq(emergencyRoutines.isActive, true), eq(emergencyRoutines.isDefault, true)));
        return result[0];
      }
      async setDefaultEmergencyRoutine(routineId) {
        await getDB().update(emergencyRoutines).set({ isDefault: false }).where(eq(emergencyRoutines.isDefault, true));
        await getDB().update(emergencyRoutines).set({ isDefault: true }).where(eq(emergencyRoutines.id, routineId));
      }
      // Quick resource operations
      async getAllQuickResources() {
        return getDB().select().from(quickResources).where(eq(quickResources.isActive, true)).orderBy(quickResources.title);
      }
      async getQuickResource(resourceId) {
        const result = await getDB().select().from(quickResources).where(eq(quickResources.id, resourceId));
        return result[0];
      }
      async createQuickResource(insertResource) {
        return getDB().insert(quickResources).values(insertResource).returning().then((rows) => rows[0]);
      }
      async updateQuickResource(resourceId, updateData) {
        const result = await getDB().update(quickResources).set({ ...updateData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(quickResources.id, resourceId)).returning();
        return result[0];
      }
      async deleteQuickResource(resourceId) {
        await getDB().delete(quickResources).where(eq(quickResources.id, resourceId));
      }
      async getPinnedQuickResources() {
        return getDB().select().from(quickResources).where(and(eq(quickResources.isActive, true), eq(quickResources.isPinned, true))).orderBy(quickResources.title);
      }
      async togglePinQuickResource(resourceId) {
        const resource = await this.getQuickResource(resourceId);
        if (resource) {
          await getDB().update(quickResources).set({ isPinned: !resource.isPinned }).where(eq(quickResources.id, resourceId));
        }
      }
      // Anti-craving strategies operations
      async createAntiCravingStrategies(userId, strategies) {
        const db2 = getDB();
        if (!Array.isArray(strategies) || strategies.length === 0) {
          throw new Error("Au moins une strat\xE9gie doit \xEAtre fournie");
        }
        for (const strategy of strategies) {
          if (!strategy.context || !strategy.exercise || !strategy.effort || typeof strategy.duration !== "number" || typeof strategy.cravingBefore !== "number" || typeof strategy.cravingAfter !== "number") {
            throw new Error("Tous les champs de strat\xE9gie sont requis");
          }
        }
        const strategiesWithUserId = strategies.map((strategy) => ({
          ...strategy,
          userId,
          // Ensure proper data types
          duration: Number(strategy.duration),
          cravingBefore: Number(strategy.cravingBefore),
          cravingAfter: Number(strategy.cravingAfter)
        }));
        try {
          const result = await db2.insert(antiCravingStrategies).values(strategiesWithUserId).returning();
          console.log(`Successfully saved ${result.length} anti-craving strategies for user ${userId}`);
          return result;
        } catch (error) {
          console.error("Error saving anti-craving strategies:", error);
          if (error instanceof Error && error.message.includes('relation "anti_craving_strategies" does not exist')) {
            console.error("Table anti_craving_strategies manquante. Tentative de cr\xE9ation...");
            try {
              const pool3 = getPool();
              if (!pool3) {
                throw new Error("Impossible d'obtenir la connexion \xE0 la base de donn\xE9es");
              }
              await pool3.query(`
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
              await pool3.query(`
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
              console.log("Table anti_craving_strategies cr\xE9\xE9e avec succ\xE8s. Nouvelle tentative de sauvegarde...");
              const retryResult = await db2.insert(antiCravingStrategies).values(strategiesWithUserId).returning();
              console.log(`Successfully saved ${retryResult.length} anti-craving strategies for user ${userId} apr\xE8s cr\xE9ation de table`);
              return retryResult;
            } catch (createError) {
              console.error("Erreur lors de la cr\xE9ation de la table:", createError);
              throw new Error(`Erreur lors de la sauvegarde des strat\xE9gies : la table anti_craving_strategies n'existe pas.`);
            }
          }
          throw new Error(`Erreur lors de la sauvegarde des strat\xE9gies: ${error instanceof Error ? error.message : "Erreur inconnue"}`);
        }
      }
      async getAntiCravingStrategies(userId) {
        return getDB().select().from(antiCravingStrategies).where(eq(antiCravingStrategies.userId, userId)).orderBy(desc(antiCravingStrategies.createdAt));
      }
      // ============================
      // NEW THERAPEUTIC FEATURES
      // ============================
      // Update last login for user activity tracking
      async updateUserLastLogin(userId) {
        await getDB().update(users).set({ lastLoginAt: /* @__PURE__ */ new Date() }).where(eq(users.id, userId));
      }
      // Timer sessions
      async createTimerSession(session2) {
        return getDB().insert(timerSessions).values(session2).returning().then((rows) => rows[0]);
      }
      async getTimerSessions(userId, limit = 20) {
        return getDB().select().from(timerSessions).where(eq(timerSessions.userId, userId)).orderBy(desc(timerSessions.createdAt)).limit(limit);
      }
      // Professional reports
      async createProfessionalReport(report) {
        const reportData = {
          ...report,
          tags: Array.isArray(report.tags) ? report.tags : []
        };
        return getDB().insert(professionalReports).values(reportData).returning().then((rows) => rows[0]);
      }
      async getProfessionalReports(therapistId) {
        const query = getDB().select({
          id: professionalReports.id,
          patientId: professionalReports.patientId,
          therapistId: professionalReports.therapistId,
          reportType: professionalReports.reportType,
          title: professionalReports.title,
          content: professionalReports.content,
          data: professionalReports.data,
          startDate: professionalReports.startDate,
          endDate: professionalReports.endDate,
          isPrivate: professionalReports.isPrivate,
          tags: professionalReports.tags,
          createdAt: professionalReports.createdAt,
          updatedAt: professionalReports.updatedAt,
          patient: {
            id: users.id,
            email: users.email,
            firstName: users.firstName,
            lastName: users.lastName,
            lastLoginAt: users.lastLoginAt
          }
        }).from(professionalReports).leftJoin(users, eq(professionalReports.patientId, users.id)).orderBy(desc(professionalReports.createdAt));
        if (therapistId) {
          query.where(eq(professionalReports.therapistId, therapistId));
        }
        return query;
      }
      async updateProfessionalReport(reportId, data) {
        const updateData = {
          ...data,
          tags: Array.isArray(data.tags) ? data.tags : data.tags || [],
          updatedAt: /* @__PURE__ */ new Date()
        };
        return getDB().update(professionalReports).set(updateData).where(eq(professionalReports.id, reportId)).returning().then((rows) => rows[0]);
      }
      async deleteProfessionalReport(reportId) {
        await getDB().delete(professionalReports).where(eq(professionalReports.id, reportId));
      }
      // Visualization content
      async getVisualizationContent() {
        return getDB().select().from(visualizationContent).where(eq(visualizationContent.isActive, true)).orderBy(visualizationContent.category, visualizationContent.title);
      }
      async createVisualizationContent(content) {
        return getDB().insert(visualizationContent).values(content).returning().then((rows) => rows[0]);
      }
      async updateVisualizationContent(contentId, data) {
        return getDB().update(visualizationContent).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(visualizationContent.id, contentId)).returning().then((rows) => rows[0]);
      }
      async deleteVisualizationContent(contentId) {
        await getDB().delete(visualizationContent).where(eq(visualizationContent.id, contentId));
      }
      // Audio content
      async getAudioContent() {
        return getDB().select().from(audioContent).where(eq(audioContent.isActive, true)).orderBy(audioContent.category, audioContent.title);
      }
      async createAudioContent(content) {
        const audioData = {
          ...content,
          tags: Array.isArray(content.tags) ? content.tags : []
        };
        return getDB().insert(audioContent).values(audioData).returning().then((rows) => rows[0]);
      }
      async updateAudioContent(contentId, data) {
        const updateData = {
          ...data,
          tags: Array.isArray(data.tags) ? data.tags : data.tags || [],
          updatedAt: /* @__PURE__ */ new Date()
        };
        return getDB().update(audioContent).set(updateData).where(eq(audioContent.id, contentId)).returning().then((rows) => rows[0]);
      }
      async deleteAudioContent(contentId) {
        await getDB().delete(audioContent).where(eq(audioContent.id, contentId));
      }
      // Exercise enhancements
      async getExerciseEnhancements(exerciseId) {
        return getDB().select().from(exerciseEnhancements).where(and(eq(exerciseEnhancements.exerciseId, exerciseId), eq(exerciseEnhancements.isActive, true))).then((rows) => rows[0]);
      }
      async createExerciseEnhancement(enhancement) {
        const enhancementData = {
          ...enhancement,
          audioUrls: Array.isArray(enhancement.audioUrls) ? enhancement.audioUrls : []
        };
        return getDB().insert(exerciseEnhancements).values(enhancementData).returning().then((rows) => rows[0]);
      }
      async updateExerciseEnhancement(exerciseId, data) {
        const updateData = {
          ...data,
          audioUrls: Array.isArray(data.audioUrls) ? data.audioUrls : data.audioUrls || [],
          updatedAt: /* @__PURE__ */ new Date()
        };
        return getDB().update(exerciseEnhancements).set(updateData).where(eq(exerciseEnhancements.exerciseId, exerciseId)).returning().then((rows) => rows[0]);
      }
      // User management with inactivity tracking
      async getAllUsersWithStats() {
        return getDB().select({
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          role: users.role,
          isActive: users.isActive,
          lastLoginAt: users.lastLoginAt,
          inactivityThreshold: users.inactivityThreshold,
          notes: users.notes,
          createdAt: users.createdAt,
          exerciseCount: sql2`COALESCE((SELECT COUNT(*) FROM ${exerciseSessions} WHERE ${exerciseSessions.userId} = ${users.id}), 0)`,
          cravingCount: sql2`COALESCE((SELECT COUNT(*) FROM ${cravingEntries} WHERE ${cravingEntries.userId} = ${users.id}), 0)`
        }).from(users).orderBy(desc(users.createdAt));
      }
      async updateUserNotes(userId, notes) {
        await getDB().update(users).set({ notes, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, userId));
      }
      async setUserInactivityThreshold(userId, threshold) {
        await getDB().update(users).set({ inactivityThreshold: threshold, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, userId));
      }
      async getInactiveUsers(threshold) {
        const thresholdDays = threshold || 30;
        const cutoffDate = /* @__PURE__ */ new Date();
        cutoffDate.setDate(cutoffDate.getDate() - thresholdDays);
        return getDB().select().from(users).where(
          and(
            eq(users.role, "patient"),
            eq(users.isActive, true),
            sql2`${users.lastLoginAt} < ${cutoffDate.toISOString()} OR ${users.lastLoginAt} IS NULL`
          )
        ).orderBy(users.lastLoginAt);
      }
      // Generate automatic reports based on user data
      async generateUserProgressReport(patientId, startDate, endDate) {
        const exerciseStats = await getDB().select({
          count: sql2`COUNT(*)`,
          totalDuration: sql2`SUM(${exerciseSessions.duration})`,
          avgCravingBefore: sql2`AVG(${exerciseSessions.cravingBefore})`,
          avgCravingAfter: sql2`AVG(${exerciseSessions.cravingAfter})`
        }).from(exerciseSessions).where(
          and(
            eq(exerciseSessions.userId, patientId),
            gte(exerciseSessions.createdAt, startDate),
            sql2`${exerciseSessions.createdAt} <= ${endDate}`
          )
        ).then((rows) => rows[0]);
        const cravingStats = await getDB().select({
          count: sql2`COUNT(*)`,
          avgIntensity: sql2`AVG(${cravingEntries.intensity})`
        }).from(cravingEntries).where(
          and(
            eq(cravingEntries.userId, patientId),
            gte(cravingEntries.createdAt, startDate),
            sql2`${cravingEntries.createdAt} <= ${endDate}`
          )
        ).then((rows) => rows[0]);
        return {
          exerciseStats,
          cravingStats,
          period: { startDate, endDate }
        };
      }
    };
    storage = new DbStorage();
  }
});

// server/seed-data.ts
var seed_data_exports = {};
__export(seed_data_exports, {
  seedData: () => seedData
});
async function seedData() {
  const exercises2 = [
    {
      title: "\xC9tirements Doux Anti-Stress",
      description: "S\xE9quence d'\xE9tirements simples pour apaiser le syst\xE8me nerveux et r\xE9duire les tensions.",
      category: "flexibility",
      difficulty: "beginner",
      duration: 5,
      instructions: "Asseyez-vous confortablement ou tenez-vous debout. Roulez lentement les \xE9paules vers l'arri\xE8re 5 fois. \xC9tirez doucement le cou de chaque c\xF4t\xE9. Levez les bras au-dessus de la t\xEAte et \xE9tirez-vous. Penchez-vous l\xE9g\xE8rement vers l'avant pour \xE9tirer le dos.",
      benefits: "R\xE9duction du stress physique, diminution des tensions musculaires, am\xE9lioration de la circulation, effet calmant sur le syst\xE8me nerveux",
      imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200"
    },
    {
      title: "Respiration Coh\xE9rence Cardiaque",
      description: "Technique de respiration guid\xE9e pour r\xE9guler le syst\xE8me nerveux et r\xE9duire l'anxi\xE9t\xE9.",
      category: "mindfulness",
      difficulty: "beginner",
      duration: 6,
      instructions: "Installez-vous confortablement, dos droit. Inspirez lentement par le nez pendant 5 secondes. Expirez doucement par la bouche pendant 5 secondes. R\xE9p\xE9tez ce rythme pendant 6 minutes. Focalisez-vous sur votre c\u0153ur pendant l'exercice.",
      benefits: "R\xE9gulation du rythme cardiaque, r\xE9duction de l'anxi\xE9t\xE9, am\xE9lioration de la concentration, activation du syst\xE8me parasympathique",
      imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200"
    },
    {
      title: "Circuit Cardio Doux",
      description: "Encha\xEEnement de mouvements pour activer la circulation et lib\xE9rer les endorphines.",
      category: "cardio",
      difficulty: "intermediate",
      duration: 8,
      instructions: "\xC9chauffement : marchez sur place 1 minute. 30 secondes de mont\xE9es de genoux. 30 secondes de talons-fesses. 1 minute de squats l\xE9gers. 30 secondes d'\xE9tirements pour r\xE9cup\xE9rer.",
      benefits: "Lib\xE9ration d'endorphines, am\xE9lioration de l'humeur, r\xE9duction du stress, activation m\xE9tabolique",
      imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200"
    },
    {
      title: "Yoga Relaxation Progressive",
      description: "Encha\xEEnement de postures douces pour la d\xE9tente musculaire et mentale profonde.",
      category: "flexibility",
      difficulty: "beginner",
      duration: 10,
      instructions: "Commencez en position debout, pieds parall\xE8les. Passez en posture de l'enfant pendant 2 minutes. Encha\xEEnez avec la posture du chat-vache. Terminez par la posture du cadavre. Respirez profond\xE9ment tout au long de l'exercice.",
      benefits: "Relaxation musculaire profonde, r\xE9duction du stress mental, am\xE9lioration de la flexibilit\xE9, centrage et ancrage",
      imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200"
    },
    {
      title: "HIIT Anti-Craving",
      description: "Entra\xEEnement intensif pour une lib\xE9ration maximale d'endorphines et r\xE9duction rapide du craving.",
      category: "strength",
      difficulty: "advanced",
      duration: 12,
      instructions: "\xC9chauffement : 2 minutes de cardio l\xE9ger. 30 secondes de burpees, 30 secondes de repos. 30 secondes de jumping jacks, 30 secondes de repos. 30 secondes de mountain climbers, 30 secondes de repos. R\xE9p\xE9tez le circuit 3 fois, puis r\xE9cup\xE9ration.",
      benefits: "Lib\xE9ration massive d'endorphines, r\xE9duction rapide du craving, am\xE9lioration de la condition physique, effet antid\xE9presseur naturel",
      imageUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200"
    },
    {
      title: "Routine Urgence Anti-Craving",
      description: "S\xE9quence rapide et efficace pour casser imm\xE9diatement un pic de craving intense.",
      category: "cardio",
      difficulty: "intermediate",
      duration: 3,
      instructions: "10 respirations profondes et rapides. 30 secondes de sautillements sur place. 20 squats rapides. 10 respirations de r\xE9cup\xE9ration. \xC9valuation de votre \xE9tat.",
      benefits: "Interruption imm\xE9diate du craving, lib\xE9ration rapide d'endorphines, recentrage mental, activation du syst\xE8me nerveux sympathique",
      imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200"
    },
    {
      title: "R\xE9veil \xC9nergisant",
      description: "Routine matinale pour commencer la journ\xE9e avec \xE9nergie et motivation.",
      category: "cardio",
      difficulty: "intermediate",
      duration: 7,
      instructions: "R\xE9veil articulaire : rotation des articulations. 1 minute de marche dynamique. 20 squats avec bras lev\xE9s. 30 secondes de jumping jacks. \xC9tirements dynamiques pour finir.",
      benefits: "Activation m\xE9tabolique, am\xE9lioration de l'humeur, boost d'\xE9nergie naturel, pr\xE9paration mentale positive",
      imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200"
    },
    {
      title: "Gestion de l'Anxi\xE9t\xE9",
      description: "Combinaison de mouvements et respiration pour g\xE9rer l'anxi\xE9t\xE9 et les \xE9motions difficiles.",
      category: "mindfulness",
      difficulty: "beginner",
      duration: 8,
      instructions: "Position confortable, yeux ferm\xE9s. 3 minutes de respiration 4-7-8. Visualisation d'un lieu s\xFBr. Mouvements doux des bras et du corps. Affirmations positives.",
      benefits: "R\xE9duction de l'anxi\xE9t\xE9, r\xE9gulation \xE9motionnelle, am\xE9lioration de l'estime de soi, d\xE9veloppement de la r\xE9silience",
      imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200"
    },
    {
      title: "Relaxation Musculaire Progressive",
      description: "Technique de Jacobson pour rel\xE2cher toutes les tensions du corps.",
      category: "mindfulness",
      difficulty: "beginner",
      duration: 15,
      instructions: "Allongez-vous confortablement. Contractez et rel\xE2chez chaque groupe musculaire. Commencez par les pieds, remontez jusqu'\xE0 la t\xEAte. Maintenez la contraction 5 secondes, rel\xE2chez 10 secondes. Terminez par une relaxation compl\xE8te.",
      benefits: "Rel\xE2chement des tensions physiques, am\xE9lioration du sommeil, r\xE9duction du stress chronique, conscience corporelle accrue",
      imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200"
    }
  ];
  const psychoEducationContent2 = [
    {
      title: "Comprendre l'addiction",
      content: `L'addiction est une maladie chronique du cerveau qui affecte les circuits de r\xE9compense, de motivation et de m\xE9moire. Elle se caract\xE9rise par l'incapacit\xE9 de s'abstenir de mani\xE8re constante d'un comportement ou d'une substance, malgr\xE9 les cons\xE9quences n\xE9gatives.

## Les m\xE9canismes de l'addiction

L'addiction modifie la chimie du cerveau, particuli\xE8rement dans les zones responsables de :
- **La prise de d\xE9cision** : Alt\xE9ration du cortex pr\xE9frontal
- **Le contr\xF4le des impulsions** : Dysfonctionnement du syst\xE8me inhibiteur
- **La gestion du stress** : D\xE9s\xE9quilibre hormonal
- **La r\xE9gulation \xE9motionnelle** : Impact sur l'amygdale et l'hippocampe

## Facteurs de risque

### Biologiques
- Pr\xE9disposition g\xE9n\xE9tique (40-60% du risque)
- D\xE9s\xE9quilibres neurochimiques
- Troubles mentaux concomitants

### Psychologiques  
- Traumatismes pass\xE9s non r\xE9solus
- Strat\xE9gies d'adaptation inad\xE9quates
- Faible estime de soi

### Environnementaux
- Stress chronique
- Environnement social permissif
- Accessibilit\xE9 des substances/comportements

## L'importance de la compr\xE9hension

Comprendre que l'addiction est une **maladie** et non un manque de volont\xE9 est crucial pour :
- \u2705 R\xE9duire la culpabilit\xE9 et la honte
- \u2705 D\xE9velopper de la compassion envers soi-m\xEAme
- \u2705 Accepter l'aide professionnelle
- \u2705 Maintenir la motivation pour le r\xE9tablissement`,
      category: "addiction",
      type: "article",
      difficulty: "beginner",
      estimatedReadTime: 8,
      imageUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200"
    },
    {
      title: "Techniques de gestion du stress avanc\xE9es",
      content: `Le stress est souvent un d\xE9clencheur majeur dans les processus addictifs. Voici des techniques scientifiquement prouv\xE9es pour g\xE9rer le stress de mani\xE8re saine.

## \u{1F6A8} Techniques de gestion imm\xE9diate

### Technique 5-4-3-2-1 (Ancrage sensoriel)
1. **5 choses** que vous pouvez voir
2. **4 choses** que vous pouvez toucher
3. **3 choses** que vous pouvez entendre
4. **2 choses** que vous pouvez sentir
5. **1 chose** que vous pouvez go\xFBter

### Respiration Box (4-4-4-4)
- Inspirez pendant 4 secondes
- Retenez pendant 4 secondes  
- Expirez pendant 4 secondes
- Pause pendant 4 secondes
- R\xE9p\xE9tez 8-10 cycles

### Auto-massage express
- Massez les tempes en mouvements circulaires
- Pression sur les points d'acupression (poignet, main)
- \xC9tirement doux du cou et des \xE9paules

## \u{1F3C3}\u200D\u2642\uFE0F Strat\xE9gies \xE0 long terme

### HIIT pour la gestion du stress
- **3x par semaine**, 15-20 minutes
- Lib\xE8re des endorphines pour 24-48h
- Am\xE9liore la r\xE9sistance au stress

### Pratique m\xE9ditative quotidienne
- **Minimum 10 minutes** par jour
- Applications recommand\xE9es : Headspace, Calm, Insight Timer
- Focus sur la **pleine conscience** et l'**auto-compassion**

### Optimisation du sommeil
- **Temp\xE9rature** : 18-19\xB0C optimal
- **\xC9crans** : Arr\xEAt 1h avant coucher
- **Routine** : M\xEAme horaire chaque jour
- **Environnement** : Noir complet, silencieux`,
      category: "stress_management",
      type: "article",
      difficulty: "intermediate",
      estimatedReadTime: 12,
      imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200"
    },
    {
      title: "Psychologie de la motivation : M\xE9thodes scientifiques",
      content: `La motivation n'est pas un sentiment constant. C'est une comp\xE9tence qui se d\xE9veloppe avec des techniques \xE9prouv\xE9es par la recherche en psychologie comportementale.

## \u{1F3AF} Syst\xE8me d'objectifs hi\xE9rarchique

### Objectifs SMART-ER
- **S**p\xE9cifique - **M**esurable - **A**tteignable - **R**elevant - **T**emporel
- **E**motionnellement connect\xE9 - **R**\xE9visable

### Exemple concret
\u274C "Je veux arr\xEAter de boire"
\u2705 "Je vais rester sobre pendant 30 jours, en rempla\xE7ant l'alcool par du th\xE9, parce que je veux \xEAtre pr\xE9sent pour ma famille"

## \u{1F9E0} Techniques de neuroscience motivationnelle

### Dopamine Stacking
1. **Activit\xE9 agr\xE9able** avant l'objectif difficile
2. **R\xE9compense imm\xE9diate** apr\xE8s accomplissement
3. **C\xE9l\xE9bration** des petites victoires

### Visualisation bas\xE9e sur les r\xE9sultats
- **10 minutes** de visualisation quotidienne
- **Ressentir** les \xE9motions du succ\xE8s
- **Ancrer** physiquement les sensations positives

### Accountability sociale
- **Partenaire** de responsabilit\xE9
- **Check-ins** r\xE9guliers (quotidiens/hebdomadaires)
- **Engagement public** de vos objectifs

## \u{1F4CA} Syst\xE8me de tracking motivationnel

### M\xE9triques quotidiennes
- Score de motivation (1-10)
- Activit\xE9s accomplies
- Obstacles rencontr\xE9s
- Solutions trouv\xE9es

### Analyse hebdomadaire
- Patterns de motivation faible
- D\xE9clencheurs positifs identifi\xE9s
- Ajustements n\xE9cessaires`,
      category: "motivation",
      type: "article",
      difficulty: "advanced",
      estimatedReadTime: 15,
      imageUrl: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200"
    },
    {
      title: "Plan complet de pr\xE9vention des rechutes",
      content: `Un plan de pr\xE9vention des rechutes robuste est votre bouclier contre les moments difficiles. Voici un syst\xE8me complet bas\xE9 sur les meilleures pratiques cliniques.

## \u{1F6A8} Syst\xE8me d'alerte pr\xE9coce

### Signaux physiques
- \u26A0\uFE0F Fatigue inhabituelle
- \u26A0\uFE0F Changements d'app\xE9tit
- \u26A0\uFE0F Troubles du sommeil
- \u26A0\uFE0F Tensions musculaires

### Signaux \xE9motionnels
- \u{1F624} Irritabilit\xE9 croissante  
- \u{1F614} Sentiment de vide
- \u{1F630} Anxi\xE9t\xE9 persistante
- \u{1F644} Cynisme envers le r\xE9tablissement

### Signaux comportementaux
- \u{1F4F5} Isolement social
- \u{1F3AF} Abandon des routines saines
- \u{1F91D} \xC9vitement du soutien
- \u{1F4AD} Romantisation du pass\xE9

### Signaux cognitifs
- \u{1F9E0} Pens\xE9es "tout ou rien"
- \u{1F3AD} Minimisation des cons\xE9quences
- \u{1F504} Rumination excessive
- \u2753 Remise en question du r\xE9tablissement

## \u{1F6E1}\uFE0F Strat\xE9gies de protection

### Niveau 1 : Pr\xE9vention quotidienne
- **Morning routine** : M\xE9ditation + exercice + intentions
- **Evening review** : Gratitude + challenges + solutions
- **Connections** : 1 interaction sociale positive par jour

### Niveau 2 : Intervention pr\xE9coce  
- **HALT Check** : Am-I Hungry/Angry/Lonely/Tired?
- **Emergency contacts** : 3 personnes disponibles 24/7
- **Safe spaces** : Lieux physiques de r\xE9cup\xE9ration

### Niveau 3 : Crise management
- **Emergency protocol** : Actions sp\xE9cifiques minute par minute
- **Professional help** : Th\xE9rapeute, m\xE9decin, hotline
- **Damage control** : Plan si rechute partielle

## \u{1F504} Apr\xE8s une rechute : Recovery protocol

### Phase 1 : S\xE9curit\xE9 (0-24h)
1. **Stop** imm\xE9diatement la substance/comportement
2. **Seek** aide professionnelle si n\xE9cessaire
3. **Stabilize** environnement physique et \xE9motionnel

### Phase 2 : Analyse (24-72h)
- **What** s'est pass\xE9 exactement?
- **When** les signaux d'alarme ont-ils commenc\xE9?
- **Where** \xE9tais-je? (lieu, contexte)
- **Why** mes strat\xE9gies n'ont-elles pas fonctionn\xE9?

### Phase 3 : Reconstruction (72h+)
- **Ajuster** le plan de pr\xE9vention
- **Renforcer** les strat\xE9gies faibles
- **Ajouter** nouvelles techniques apprises
- **Recommit** publiquement aux objectifs`,
      category: "relapse_prevention",
      type: "article",
      difficulty: "advanced",
      estimatedReadTime: 18,
      imageUrl: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200"
    },
    {
      title: "Neuroscience des \xE9motions et r\xE9gulation",
      content: `Comprendre le fonctionnement de vos \xE9motions au niveau neurologique vous donne un pouvoir extraordinaire sur votre bien-\xEAtre mental.

## \u{1F9E0} Anatomie \xE9motionnelle

### Le trio d\xE9cisionnel
1. **Amygdale** : D\xE9tection des menaces (\xE9motions primaires)
2. **Cortex pr\xE9frontal** : Analyse rationnelle (pens\xE9es logiques)  
3. **Syst\xE8me limbique** : M\xE9moire \xE9motionnelle (associations pass\xE9es)

### Processus de d\xE9clenchement \xE9motionnel
**Stimulus** \u2192 **\xC9valuation automatique** \u2192 **R\xE9action physiologique** \u2192 **\xC9motion consciente** \u2192 **Action**

## \u{1F39B}\uFE0F Techniques de r\xE9gulation avanc\xE9es

### Window of Tolerance
- **Zone optimale** : Vous pouvez penser clairement et g\xE9rer les \xE9motions
- **Hyperactivation** : Anxi\xE9t\xE9, col\xE8re, panique - besoin de calmer
- **Hypoactivation** : D\xE9pression, vide, d\xE9connexion - besoin d'activer

### STOP Technique am\xE9lior\xE9e
- **S**top : Pause physique imm\xE9diate
- **T**ake a breath : 3 respirations profondes conscientes  
- **O**bserve : "Que se passe-t-il dans mon corps/esprit?"
- **P**roceed : Action consciente bas\xE9e sur valeurs

### Technique RAIN pour \xE9motions difficiles
- **R**ecognize : "Je remarque de la col\xE8re/tristesse..."
- **A**llow : "C'est ok de ressentir cela"
- **I**nvestigate : "O\xF9 est-ce dans mon corps? Que dit cette \xE9motion?"
- **N**urture : Auto-compassion et bienveillance

## \u{1F527} Outils pratiques quotidiens

### Emotional Check-ins
**3x par jour**, demandez-vous :
- \xC9motion principale en ce moment?
- Intensit\xE9 (1-10)?
- Message de cette \xE9motion?
- Action n\xE9cessaire?

### Emotion Surfing
1. **Identifier** la vague \xE9motionnelle qui arrive
2. **Respirer** avec l'\xE9motion (ne pas r\xE9sister)
3. **Observer** comment elle monte puis redescend
4. **Naviguer** sans \xEAtre submerg\xE9`,
      category: "emotional_regulation",
      type: "article",
      difficulty: "intermediate",
      estimatedReadTime: 14,
      imageUrl: "https://images.unsplash.com/photo-1559757260-6dd0cd4bce18?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200"
    }
  ];
  const quickResources2 = [
    {
      title: "Technique 5-4-3-2-1",
      description: "Ancrage sensoriel rapide en cas de panique ou craving intense",
      content: "5 choses que je vois, 4 que je touche, 3 que j'entends, 2 que je sens, 1 que je go\xFBte",
      category: "emergency",
      type: "technique",
      icon: "eye",
      color: "red",
      isActive: true,
      isPinned: true
    },
    {
      title: "Respiration Box 4-4-4-4",
      description: "Technique de respiration pour calmer le syst\xE8me nerveux rapidement",
      content: "Inspire 4 sec \u2192 Retiens 4 sec \u2192 Expire 4 sec \u2192 Pause 4 sec. R\xE9p\xE8te 8 fois.",
      category: "coping",
      type: "technique",
      icon: "wind",
      color: "blue",
      isActive: true,
      isPinned: true
    },
    {
      title: "Cette \xE9motion va passer",
      description: "Rappel que toutes les \xE9motions sont temporaires",
      content: "Les \xE9motions sont comme des vagues - elles montent, atteignent un pic, puis redescendent naturellement. Cette intensit\xE9 ne va pas durer.",
      category: "motivation",
      type: "reminder",
      icon: "waves",
      color: "green",
      isActive: true,
      isPinned: false
    },
    {
      title: "Je suis plus fort que ce craving",
      description: "Affirmation de force personnelle",
      content: "J'ai d\xE9j\xE0 surmont\xE9 des difficult\xE9s. Ce craving ne me d\xE9finit pas. Je choisis ma r\xE9ponse.",
      category: "motivation",
      type: "affirmation",
      icon: "zap",
      color: "yellow",
      isActive: true,
      isPinned: true
    },
    {
      title: "Auto-massage express",
      description: "Technique rapide pour r\xE9duire les tensions physiques",
      content: "Masse tes tempes en cercles, presse les points entre pouce/index, \xE9tire doucement le cou. 2 minutes suffisent.",
      category: "relaxation",
      type: "technique",
      icon: "hand",
      color: "purple",
      isActive: true,
      isPinned: false
    },
    {
      title: "Mes 3 raisons principales",
      description: "Rappel de tes motivations fondamentales pour le r\xE9tablissement",
      content: "1. Ma sant\xE9 et mon bien-\xEAtre - 2. Mes relations importantes - 3. Mes objectifs et r\xEAves futurs",
      category: "motivation",
      type: "reminder",
      icon: "target",
      color: "orange",
      isActive: true,
      isPinned: true
    }
  ];
  for (const exercise of exercises2) {
    try {
      await storage.createExercise(exercise);
      console.log(`Exercice cr\xE9\xE9: ${exercise.title}`);
    } catch (error) {
      console.error(`Erreur lors de la cr\xE9ation de l'exercice ${exercise.title}:`, error);
    }
  }
  for (const content of psychoEducationContent2) {
    try {
      await storage.createPsychoEducationContent(content);
      console.log(`Contenu psycho\xE9ducatif cr\xE9\xE9: ${content.title}`);
    } catch (error) {
      console.error(`Erreur lors de la cr\xE9ation du contenu ${content.title}:`, error);
    }
  }
  for (const resource of quickResources2) {
    try {
      await storage.createQuickResource(resource);
      console.log(`Ressource rapide cr\xE9\xE9e: ${resource.title}`);
    } catch (error) {
      console.error(`Erreur lors de la cr\xE9ation de la ressource ${resource.title}:`, error);
    }
  }
  const emergencyRoutines2 = [
    {
      title: "Routine anti-craving 3 minutes",
      description: "Routine rapide pour g\xE9rer un craving intense en 3 minutes",
      category: "general",
      duration: 3,
      steps: [
        "Arr\xEAte-toi et reconnais le craving sans jugement",
        "Respire profond\xE9ment : inspire 4 secondes, expire 6 secondes (r\xE9p\xE8te 5 fois)",
        "Nomme 5 choses que tu vois, 4 que tu entends, 3 que tu touches",
        "Rappelle-toi pourquoi tu veux arr\xEAter (tes motivations principales)",
        "Bois un grand verre d'eau lentement",
        "F\xE9licite-toi d'avoir r\xE9sist\xE9 \xE0 ce craving"
      ],
      isActive: true,
      isDefault: true
    },
    {
      title: "Technique de respiration d'urgence",
      description: "Respiration 4-7-8 pour calmer rapidement l'anxi\xE9t\xE9 et les cravings",
      category: "breathing",
      duration: 5,
      steps: [
        "Trouve une position confortable, assis ou debout",
        "Place ta langue derri\xE8re tes dents sup\xE9rieures",
        "Expire compl\xE8tement par la bouche",
        "Inspire par le nez pendant 4 secondes",
        "Retiens ton souffle pendant 7 secondes",
        "Expire par la bouche pendant 8 secondes",
        "R\xE9p\xE8te ce cycle 4 fois de suite",
        "Observe comment ton corps se d\xE9tend"
      ],
      isActive: true,
      isDefault: false
    },
    {
      title: "Ancrage sensoriel rapide",
      description: "Technique d'ancrage pour se reconnecter au moment pr\xE9sent",
      category: "grounding",
      duration: 2,
      steps: [
        "Nomme 5 choses que tu peux voir autour de toi",
        "Identifie 4 choses que tu peux toucher",
        "\xC9coute 3 sons diff\xE9rents dans ton environnement",
        "Trouve 2 odeurs que tu peux sentir",
        "Pense \xE0 1 go\xFBt agr\xE9able que tu aimes",
        "Prends un moment pour appr\xE9cier d'\xEAtre ancr\xE9 dans le pr\xE9sent"
      ],
      isActive: true,
      isDefault: false
    }
  ];
  for (const routine of emergencyRoutines2) {
    try {
      await storage.createEmergencyRoutine(routine);
      console.log(`Routine d'urgence cr\xE9\xE9e: ${routine.title}`);
    } catch (error) {
      console.error(`Erreur lors de la cr\xE9ation de la routine ${routine.title}:`, error);
    }
  }
  console.log("Donn\xE9es d'exemple cr\xE9\xE9es avec succ\xE8s!");
}
var init_seed_data = __esm({
  "server/seed-data.ts"() {
    "use strict";
    init_storage();
  }
});

// server/index.ts
import "dotenv/config";
import express from "express";
import session from "express-session";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// server/routes.ts
init_storage();

// server/auth.ts
init_storage();
import bcrypt from "bcryptjs";
var AuthService = class {
  static async hashPassword(password) {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }
  static async verifyPassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }
  static async register(userData) {
    const existingUser = await storage.getUserByEmail(userData.email);
    if (existingUser) {
      throw new Error("Un utilisateur avec cet email existe d\xE9j\xE0");
    }
    const authorizedAdminEmail = "doriansarry@yahoo.fr";
    const requestedRole = userData.role || "patient";
    if (requestedRole === "admin" && userData.email.toLowerCase() !== authorizedAdminEmail.toLowerCase()) {
      throw new Error("Acc\xE8s administrateur non autoris\xE9 pour cet email");
    }
    const hashedPassword = await this.hashPassword(userData.password);
    const newUser = {
      email: userData.email,
      password: hashedPassword,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      role: requestedRole
    };
    const user = await storage.createUser(newUser);
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    };
  }
  static async login(email, password) {
    const user = await storage.getUserByEmail(email);
    if (!user) {
      throw new Error("Email ou mot de passe incorrect");
    }
    const isValidPassword = await this.verifyPassword(password, user.password);
    if (!isValidPassword) {
      throw new Error("Email ou mot de passe incorrect");
    }
    if (!user.isActive) {
      throw new Error("Compte d\xE9sactiv\xE9");
    }
    await storage.updateUserLastLogin(user.id);
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    };
  }
  static async getUserById(id) {
    const user = await storage.getUser(id);
    if (!user) {
      return null;
    }
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    };
  }
  static async updateUser(userId, data) {
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error("Utilisateur non trouv\xE9");
    }
    if (data.email && data.email !== user.email) {
      const existing = await storage.getUserByEmail(data.email);
      if (existing) {
        throw new Error("Cet email est d\xE9j\xE0 utilis\xE9 par un autre compte.");
      }
    }
    const updatedUser = await storage.updateUser(userId, {
      firstName: data.firstName ?? user.firstName,
      lastName: data.lastName ?? user.lastName,
      email: data.email ?? user.email
    });
    return {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      role: updatedUser.role
    };
  }
  static async updatePassword(userId, oldPassword, newPassword) {
    if (!oldPassword || !newPassword) {
      throw new Error("L'ancien et le nouveau mot de passe sont requis.");
    }
    if (newPassword.length < 6) {
      throw new Error("Le nouveau mot de passe doit contenir au moins 6 caract\xE8res.");
    }
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error("Utilisateur non trouv\xE9.");
    }
    const isMatch = await this.verifyPassword(oldPassword, user.password);
    if (!isMatch) {
      throw new Error("L'ancien mot de passe est incorrect.");
    }
    const hashedNewPassword = await this.hashPassword(newPassword);
    await storage.updatePassword(userId, hashedNewPassword);
  }
};
function requireAuth(req, res, next) {
  if (!req.session?.user) {
    return res.status(401).json({ message: "Authentification requise" });
  }
  next();
}
function requireAdmin(req, res, next) {
  if (!req.session?.user) {
    return res.status(401).json({ message: "Authentification requise" });
  }
  if (req.session.user.role !== "admin") {
    return res.status(403).json({ message: "Acc\xE8s administrateur requis" });
  }
  next();
}

// server/routes.ts
init_schema();
init_db();
import { sql as sql3 } from "drizzle-orm";
function registerRoutes(app2) {
  app2.get("/api/test-db", async (_req, res) => {
    try {
      const result = await getDB().execute(sql3`SELECT 1 as one`);
      res.json({ ok: true, result: result.rows });
    } catch (e) {
      console.error("Database connection test failed:", e);
      res.status(500).json({ ok: false, error: e instanceof Error ? e.message : String(e) });
    }
  });
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName, role } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email et mot de passe requis" });
      }
      if (!email.includes("@")) {
        return res.status(400).json({ message: "Format d'email invalide" });
      }
      if (password.length < 4) {
        return res.status(400).json({ message: "Le mot de passe doit contenir au moins 4 caract\xE8res" });
      }
      const user = await AuthService.register({
        email,
        password,
        firstName,
        lastName,
        role
      });
      req.session.user = user;
      res.json({ user });
    } catch (error) {
      res.status(400).json({
        message: error instanceof Error ? error.message : "Erreur lors de l'inscription"
      });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email et mot de passe requis" });
      }
      const user = await AuthService.login(email, password);
      req.session.user = user;
      res.json({ user });
    } catch (error) {
      res.status(401).json({
        message: error instanceof Error ? error.message : "Erreur de connexion"
      });
    }
  });
  app2.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Erreur lors de la d\xE9connexion" });
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Logout successful" });
    });
  });
  app2.get("/api/auth/me", async (req, res) => {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ user: null, message: "Not authenticated" });
    }
    try {
      const user = await AuthService.getUserById(req.session.user.id);
      if (!user) {
        req.session.destroy(() => {
        });
        return res.status(401).json({ user: null, message: "User not found" });
      }
      res.json({ user });
    } catch (error) {
      res.status(500).json({ user: null, message: "Server error" });
    }
  });
  app2.get("/api/exercises", async (req, res) => {
    try {
      const exercises2 = await storage.getExercises();
      res.json(exercises2);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la r\xE9cup\xE9ration des exercices" });
    }
  });
  app2.get("/api/exercises/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const exercise = await storage.getExerciseById(id);
      if (!exercise) {
        return res.status(404).json({ message: "Exercice non trouv\xE9" });
      }
      res.json(exercise);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la r\xE9cup\xE9ration de l'exercice" });
    }
  });
  app2.post("/api/exercises", requireAdmin, async (req, res) => {
    try {
      const data = insertExerciseSchema.parse(req.body);
      const exercise = await storage.createExercise(data);
      res.json(exercise);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Validation \xE9chou\xE9e" });
    }
  });
  app2.get("/api/psycho-education", async (req, res) => {
    try {
      const content = await storage.getPsychoEducationContent();
      res.json(content);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la r\xE9cup\xE9ration du contenu" });
    }
  });
  app2.post("/api/psycho-education", requireAdmin, async (req, res) => {
    try {
      const data = insertPsychoEducationContentSchema.parse(req.body);
      const content = await storage.createPsychoEducationContent(data);
      res.json(content);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Validation \xE9chou\xE9e" });
    }
  });
  app2.get("/api/admin/exercises", requireAdmin, async (req, res) => {
    try {
      const exercises2 = await storage.getAllExercises();
      res.json(exercises2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch all exercises" });
    }
  });
  app2.get("/api/admin/psycho-education", requireAdmin, async (req, res) => {
    try {
      const content = await storage.getAllPsychoEducationContent();
      res.json(content);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch all psycho-education content" });
    }
  });
  app2.get("/api/admin/psycho-education/:contentId", requireAdmin, async (req, res) => {
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
  app2.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const users2 = await storage.getAllUsersWithStats();
      res.json(users2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  app2.delete("/api/admin/users/:userId", requireAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      await storage.deleteUser(userId);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });
  app2.get("/api/admin/media", requireAdmin, async (req, res) => {
    try {
      const mediaFiles = await storage.getAllMediaFiles();
      res.json(mediaFiles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch media files" });
    }
  });
  app2.post("/api/admin/media/upload", requireAdmin, async (req, res) => {
    try {
      res.status(501).json({ message: "File upload not yet implemented" });
    } catch (error) {
      res.status(500).json({ message: "Failed to upload file" });
    }
  });
  app2.delete("/api/admin/media/:mediaId", requireAdmin, async (req, res) => {
    try {
      const { mediaId } = req.params;
      await storage.deleteMediaFile(mediaId);
      res.json({ message: "Media file deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete media file" });
    }
  });
  app2.post("/api/cravings", requireAuth, async (req, res) => {
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
  app2.get("/api/cravings", requireAuth, async (req, res) => {
    try {
      if (!req.session?.user) return res.status(401).json({ message: "Session non valide" });
      const userId = req.session.user.id;
      const limit = req.query.limit ? parseInt(req.query.limit) : void 0;
      const entries = await storage.getCravingEntries(userId, limit);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch craving entries" });
    }
  });
  app2.get("/api/cravings/stats", requireAuth, async (req, res) => {
    try {
      if (!req.session?.user) return res.status(401).json({ message: "Session non valide" });
      const userId = req.session.user.id;
      const days = req.query.days ? parseInt(req.query.days) : void 0;
      const stats = await storage.getCravingStats(userId, days);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch craving stats" });
    }
  });
  app2.post("/api/exercise-sessions", requireAuth, async (req, res) => {
    try {
      if (!req.session?.user) return res.status(401).json({ message: "Session non valide" });
      const data = insertExerciseSessionSchema.parse({
        ...req.body,
        userId: req.session.user.id
      });
      const session2 = await storage.createExerciseSession(data);
      res.json(session2);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Validation failed" });
    }
  });
  app2.get("/api/exercise-sessions", requireAuth, async (req, res) => {
    try {
      if (!req.session?.user) return res.status(401).json({ message: "Session non valide" });
      const userId = req.session.user.id;
      const limit = req.query.limit ? parseInt(req.query.limit) : void 0;
      const sessions = await storage.getExerciseSessions(userId, limit);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exercise sessions" });
    }
  });
  app2.get("/api/exercise-sessions/detailed", requireAuth, async (req, res) => {
    try {
      if (!req.session?.user) return res.status(401).json({ message: "Session non valide" });
      const userId = req.session.user.id;
      const limit = req.query.limit ? parseInt(req.query.limit) : void 0;
      const sessions = await storage.getExerciseSessionsWithDetails(userId, limit);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch detailed exercise sessions" });
    }
  });
  app2.post("/api/beck-analyses", requireAuth, async (req, res) => {
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
  app2.get("/api/beck-analyses", requireAuth, async (req, res) => {
    try {
      if (!req.session?.user) return res.status(401).json({ message: "Session non valide" });
      const userId = req.session.user.id;
      const limit = req.query.limit ? parseInt(req.query.limit) : void 0;
      const analyses = await storage.getBeckAnalyses(userId, limit);
      res.json(analyses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch Beck analyses" });
    }
  });
  app2.get("/api/users/stats", requireAuth, async (req, res) => {
    try {
      if (!req.session?.user) return res.status(401).json({ message: "Session non valide" });
      const userId = req.session.user.id;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });
  app2.get("/api/users/badges", requireAuth, async (req, res) => {
    try {
      if (!req.session?.user) return res.status(401).json({ message: "Session non valide" });
      const userId = req.session.user.id;
      const badges = await storage.getUserBadges(userId);
      res.json(badges);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user badges" });
    }
  });
  app2.get("/api/users/profile", requireAuth, async (req, res) => {
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
  app2.put("/api/users/profile", requireAuth, async (req, res) => {
    try {
      if (!req.session?.user) return res.status(401).json({ message: "Session non valide" });
      const userId = req.session.user.id;
      const { firstName, lastName, email } = req.body;
      const updatedUser = await AuthService.updateUser(userId, { firstName, lastName, email });
      res.json(updatedUser);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Erreur lors de la mise \xE0 jour du profil" });
    }
  });
  app2.put("/api/users/password", requireAuth, async (req, res) => {
    try {
      if (!req.session?.user) return res.status(401).json({ message: "Session non valide" });
      const userId = req.session.user.id;
      const { oldPassword, newPassword } = req.body;
      await AuthService.updatePassword(userId, oldPassword, newPassword);
      res.json({ message: "Mot de passe mis \xE0 jour avec succ\xE8s" });
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Erreur lors de la mise \xE0 jour du mot de passe" });
    }
  });
  app2.delete("/api/users/profile", requireAuth, async (req, res) => {
    try {
      if (!req.session?.user) return res.status(401).json({ message: "Session non valide" });
      const userId = req.session.user.id;
      await storage.deleteUser(userId);
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ message: "Erreur lors de la d\xE9connexion apr\xE8s la suppression du compte" });
        }
        res.json({ message: "Compte supprim\xE9 avec succ\xE8s" });
      });
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la suppression du compte" });
    }
  });
  app2.post("/api/demo-user", async (req, res) => {
    try {
      const user = await storage.createUser({
        email: "demo@example.com",
        password: "demo123",
        firstName: "Utilisateur",
        lastName: "Demo",
        role: "patient"
      });
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to create demo user" });
    }
  });
  app2.post("/api/seed-data", requireAdmin, async (req, res) => {
    try {
      const { seedData: seedData2 } = await Promise.resolve().then(() => (init_seed_data(), seed_data_exports));
      await seedData2();
      res.json({ message: "Donn\xE9es d'exemple cr\xE9\xE9es avec succ\xE8s" });
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la cr\xE9ation des donn\xE9es d'exemple" });
    }
  });
  app2.delete("/api/admin/exercises/:exerciseId", requireAdmin, async (req, res) => {
    try {
      const { exerciseId } = req.params;
      await storage.deleteExercise(exerciseId);
      res.json({ message: "Exercise deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete exercise" });
    }
  });
  app2.put("/api/admin/psycho-education/:contentId", requireAdmin, async (req, res) => {
    try {
      const { contentId } = req.params;
      const data = insertPsychoEducationContentSchema.parse(req.body);
      const content = await storage.updatePsychoEducationContent(contentId, data);
      res.json(content);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to update content" });
    }
  });
  app2.delete("/api/admin/psycho-education/:contentId", requireAdmin, async (req, res) => {
    try {
      const { contentId } = req.params;
      await storage.deletePsychoEducationContent(contentId);
      res.json({ message: "Content deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete content" });
    }
  });
  app2.get("/api/admin/emergency-routines", requireAdmin, async (req, res) => {
    try {
      const routines = await storage.getAllEmergencyRoutines();
      res.json(routines);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch emergency routines" });
    }
  });
  app2.get("/api/admin/emergency-routines/default", requireAdmin, async (req, res) => {
    try {
      const routine = await storage.getDefaultEmergencyRoutine();
      res.json(routine);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch default emergency routine" });
    }
  });
  app2.post("/api/admin/emergency-routines", requireAdmin, async (req, res) => {
    try {
      const routine = await storage.createEmergencyRoutine(req.body);
      res.json(routine);
    } catch (error) {
      res.status(500).json({ message: "Failed to create emergency routine" });
    }
  });
  app2.put("/api/admin/emergency-routines/:routineId", requireAdmin, async (req, res) => {
    try {
      const { routineId } = req.params;
      const routine = await storage.updateEmergencyRoutine(routineId, req.body);
      res.json(routine);
    } catch (error) {
      res.status(500).json({ message: "Failed to update emergency routine" });
    }
  });
  app2.delete("/api/admin/emergency-routines/:routineId", requireAdmin, async (req, res) => {
    try {
      const { routineId } = req.params;
      await storage.deleteEmergencyRoutine(routineId);
      res.json({ message: "Emergency routine deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete emergency routine" });
    }
  });
  app2.put("/api/admin/emergency-routines/:routineId/set-default", requireAdmin, async (req, res) => {
    try {
      const { routineId } = req.params;
      await storage.setDefaultEmergencyRoutine(routineId);
      res.json({ message: "Default emergency routine set successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to set default emergency routine" });
    }
  });
  app2.get("/api/admin/quick-resources", requireAdmin, async (req, res) => {
    try {
      const resources = await storage.getAllQuickResources();
      res.json(resources);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch quick resources" });
    }
  });
  app2.get("/api/admin/quick-resources/pinned", requireAdmin, async (req, res) => {
    try {
      const resources = await storage.getPinnedQuickResources();
      res.json(resources);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pinned quick resources" });
    }
  });
  app2.post("/api/admin/quick-resources", requireAdmin, async (req, res) => {
    try {
      const resource = await storage.createQuickResource(req.body);
      res.json(resource);
    } catch (error) {
      res.status(500).json({ message: "Failed to create quick resource" });
    }
  });
  app2.put("/api/admin/quick-resources/:resourceId", requireAdmin, async (req, res) => {
    try {
      const { resourceId } = req.params;
      const resource = await storage.updateQuickResource(resourceId, req.body);
      res.json(resource);
    } catch (error) {
      res.status(500).json({ message: "Failed to update quick resource" });
    }
  });
  app2.delete("/api/admin/quick-resources/:resourceId", requireAdmin, async (req, res) => {
    try {
      const { resourceId } = req.params;
      await storage.deleteQuickResource(resourceId);
      res.json({ message: "Quick resource deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete quick resource" });
    }
  });
  app2.put("/api/admin/quick-resources/:resourceId/toggle-pin", requireAdmin, async (req, res) => {
    try {
      const { resourceId } = req.params;
      await storage.togglePinQuickResource(resourceId);
      res.json({ message: "Quick resource pin status toggled successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to toggle pin status" });
    }
  });
  app2.post("/api/strategies", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user.id;
      const { strategies } = req.body;
      console.log("Received strategies request:", { userId, strategiesCount: strategies?.length, body: req.body });
      if (!Array.isArray(strategies)) {
        console.error("Invalid strategies format:", { type: typeof strategies, value: strategies });
        return res.status(400).json({
          message: "Les strat\xE9gies doivent \xEAtre un tableau",
          received: typeof strategies,
          expected: "array"
        });
      }
      if (strategies.length === 0) {
        return res.status(400).json({ message: "Au moins une strat\xE9gie doit \xEAtre fournie" });
      }
      for (let i = 0; i < strategies.length; i++) {
        const strategy = strategies[i];
        console.log(`Validating strategy ${i + 1}:`, strategy);
        const requiredFields = ["context", "exercise", "effort", "duration", "cravingBefore", "cravingAfter"];
        const missingFields = requiredFields.filter(
          (field) => strategy[field] === void 0 || strategy[field] === null || strategy[field] === ""
        );
        if (missingFields.length > 0) {
          console.error(`Strategy ${i + 1} missing fields:`, missingFields);
          return res.status(400).json({
            message: `Strat\xE9gie ${i + 1}: champs manquants - ${missingFields.join(", ")}`,
            strategy,
            missingFields
          });
        }
        if (typeof strategy.duration !== "number" || strategy.duration <= 0) {
          return res.status(400).json({
            message: `Strat\xE9gie ${i + 1}: la dur\xE9e doit \xEAtre un nombre positif`,
            received: strategy.duration
          });
        }
        if (typeof strategy.cravingBefore !== "number" || strategy.cravingBefore < 0 || strategy.cravingBefore > 10) {
          return res.status(400).json({
            message: `Strat\xE9gie ${i + 1}: le craving avant doit \xEAtre un nombre entre 0 et 10`,
            received: strategy.cravingBefore
          });
        }
        if (typeof strategy.cravingAfter !== "number" || strategy.cravingAfter < 0 || strategy.cravingAfter > 10) {
          return res.status(400).json({
            message: `Strat\xE9gie ${i + 1}: le craving apr\xE8s doit \xEAtre un nombre entre 0 et 10`,
            received: strategy.cravingAfter
          });
        }
      }
      const savedStrategies = await storage.createAntiCravingStrategies(userId, strategies);
      console.log(`Successfully saved ${savedStrategies.length} strategies for user ${userId}`);
      res.json({
        success: true,
        strategies: savedStrategies,
        message: `${savedStrategies.length} strat\xE9gie(s) sauvegard\xE9e(s) avec succ\xE8s`,
        count: savedStrategies.length
      });
    } catch (error) {
      console.error("Error saving anti-craving strategies:", error);
      const errorMessage = error instanceof Error ? error.message : "Erreur lors de la sauvegarde des strat\xE9gies";
      res.status(500).json({
        message: errorMessage,
        error: error instanceof Error ? error.stack : String(error)
      });
    }
  });
  app2.get("/api/strategies", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user.id;
      console.log(`Fetching strategies for user ${userId}`);
      const strategies = await storage.getAntiCravingStrategies(userId);
      console.log(`Found ${strategies.length} strategies for user ${userId}`);
      res.json(strategies);
    } catch (error) {
      console.error("Error fetching anti-craving strategies:", error);
      const errorMessage = error instanceof Error ? error.message : "Erreur lors de la r\xE9cup\xE9ration des strat\xE9gies";
      res.status(500).json({ message: errorMessage });
    }
  });
  app2.post("/api/timer-sessions", requireAuth, async (req, res) => {
    try {
      if (!req.session?.user) return res.status(401).json({ message: "Session non valide" });
      const sessionData = {
        ...req.body,
        userId: req.session.user.id
      };
      const session2 = await storage.createTimerSession(sessionData);
      res.json(session2);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Validation failed" });
    }
  });
  app2.get("/api/timer-sessions", requireAuth, async (req, res) => {
    try {
      if (!req.session?.user) return res.status(401).json({ message: "Session non valide" });
      const userId = req.session.user.id;
      const limit = req.query.limit ? parseInt(req.query.limit) : void 0;
      const sessions = await storage.getTimerSessions(userId, limit);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch timer sessions" });
    }
  });
  app2.get("/api/visualizations", async (req, res) => {
    try {
      const content = await storage.getVisualizationContent();
      res.json(content);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la r\xE9cup\xE9ration des visualisations" });
    }
  });
  app2.post("/api/visualizations", requireAdmin, async (req, res) => {
    try {
      const content = await storage.createVisualizationContent(req.body);
      res.json(content);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Validation \xE9chou\xE9e" });
    }
  });
  app2.get("/api/audio-content", async (req, res) => {
    try {
      const content = await storage.getAudioContent();
      res.json(content);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la r\xE9cup\xE9ration du contenu audio" });
    }
  });
  app2.post("/api/audio-content", requireAdmin, async (req, res) => {
    try {
      const content = await storage.createAudioContent(req.body);
      res.json(content);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Validation \xE9chou\xE9e" });
    }
  });
  app2.get("/api/admin/professional-reports", requireAdmin, async (req, res) => {
    try {
      const reports = await storage.getProfessionalReports(req.session.user.id);
      res.json(reports);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch professional reports" });
    }
  });
  app2.post("/api/admin/professional-reports", requireAdmin, async (req, res) => {
    try {
      const reportData = {
        ...req.body,
        therapistId: req.session.user.id
      };
      const report = await storage.createProfessionalReport(reportData);
      res.json(report);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to create report" });
    }
  });
  app2.put("/api/admin/professional-reports/:reportId", requireAdmin, async (req, res) => {
    try {
      const { reportId } = req.params;
      const report = await storage.updateProfessionalReport(reportId, req.body);
      res.json(report);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to update report" });
    }
  });
  app2.delete("/api/admin/professional-reports/:reportId", requireAdmin, async (req, res) => {
    try {
      const { reportId } = req.params;
      await storage.deleteProfessionalReport(reportId);
      res.json({ message: "Report deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete report" });
    }
  });
  app2.post("/api/admin/generate-report", requireAdmin, async (req, res) => {
    try {
      const { patientId, reportType } = req.body;
      let startDate, endDate;
      const now = /* @__PURE__ */ new Date();
      switch (reportType) {
        case "weekly":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1e3);
          endDate = now;
          break;
        case "monthly":
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          endDate = now;
          break;
        default:
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1e3);
          endDate = now;
      }
      const reportData = await storage.generateUserProgressReport(patientId, startDate, endDate);
      const title = `Rapport ${reportType} - ${startDate.toLocaleDateString("fr-FR")} au ${endDate.toLocaleDateString("fr-FR")}`;
      const content = `
## R\xE9sum\xE9 de la p\xE9riode

### Exercices
- Nombre total d'exercices: ${reportData.exerciseStats?.count || 0}
- Dur\xE9e totale: ${Math.round((reportData.exerciseStats?.totalDuration || 0) / 60)} minutes
- Niveau de craving moyen avant exercice: ${reportData.exerciseStats?.avgCravingBefore?.toFixed(1) || "N/A"}/10
- Niveau de craving moyen apr\xE8s exercice: ${reportData.exerciseStats?.avgCravingAfter?.toFixed(1) || "N/A"}/10

### Cravings
- Nombre d'entr\xE9es: ${reportData.cravingStats?.count || 0}
- Intensit\xE9 moyenne: ${reportData.cravingStats?.avgIntensity?.toFixed(1) || "N/A"}/10

### Observations
${reportData.exerciseStats?.avgCravingBefore && reportData.exerciseStats?.avgCravingAfter ? `R\xE9duction moyenne du craving: ${(reportData.exerciseStats.avgCravingBefore - reportData.exerciseStats.avgCravingAfter).toFixed(1)} points` : "Donn\xE9es insuffisantes pour calculer l'efficacit\xE9 des exercices"}

### Recommandations
- ${reportData.exerciseStats?.count >= 3 ? "Bonne assiduit\xE9 dans les exercices" : "Encourager une pratique plus r\xE9guli\xE8re"}
- ${reportData.cravingStats?.avgIntensity < 5 ? "Niveau de craving globalement ma\xEEtris\xE9" : "Focus sur les techniques de r\xE9duction du craving"}
      `;
      res.json({ title, content, data: reportData });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate report" });
    }
  });
  app2.put("/api/admin/users/:userId/notes", requireAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const { notes } = req.body;
      await storage.updateUserNotes(userId, notes);
      res.json({ message: "Notes updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update user notes" });
    }
  });
  app2.get("/api/admin/inactive-users", requireAdmin, async (req, res) => {
    try {
      const threshold = req.query.threshold ? parseInt(req.query.threshold) : void 0;
      const users2 = await storage.getInactiveUsers(threshold);
      res.json(users2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inactive users" });
    }
  });
  app2.put("/api/admin/users/:userId/inactivity-threshold", requireAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const { threshold } = req.body;
      await storage.setUserInactivityThreshold(userId, threshold);
      res.json({ message: "Inactivity threshold updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update inactivity threshold" });
    }
  });
  app2.get("/api/exercises/:exerciseId/enhancements", async (req, res) => {
    try {
      const { exerciseId } = req.params;
      const enhancements = await storage.getExerciseEnhancements(exerciseId);
      res.json(enhancements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exercise enhancements" });
    }
  });
  app2.post("/api/admin/exercises/:exerciseId/enhancements", requireAdmin, async (req, res) => {
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

// server/migrate.ts
import "dotenv/config";
import { drizzle as drizzle2 } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pkg2 from "pg";
import fs from "fs";
var { Pool: Pool2, Client } = pkg2;
async function ensureAntiCravingTable() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });
  try {
    await client.connect();
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'anti_craving_strategies'
      );
    `);
    if (tableExists.rows[0].exists) {
      console.log("\u2705 Table anti_craving_strategies existe");
    } else {
      console.log("\u26A0\uFE0F Cr\xE9ation de la table anti_craving_strategies...");
      await client.query(`
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
      await client.query(`
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
      console.log("\u2705 Table anti_craving_strategies cr\xE9\xE9e");
    }
  } catch (error) {
    console.error("\u274C Erreur lors de la v\xE9rification de la table anti_craving_strategies:", error);
  } finally {
    await client.end();
  }
}
async function run() {
  if (!process.env.DATABASE_URL) {
    console.error("\u274C DATABASE_URL manquant");
    return;
  }
  if (!fs.existsSync("migrations")) {
    console.log("\u2139\uFE0F Dossier migrations/ absent, ex\xE9cution ignor\xE9e.");
    return;
  }
  console.log("\u{1F527} Migration runner: d\xE9marrage");
  const pool3 = new Pool2({ connectionString: process.env.DATABASE_URL });
  const db2 = drizzle2(pool3);
  try {
    await migrate(db2, { migrationsFolder: "migrations" });
    console.log("\u2705 Migrations Drizzle appliqu\xE9es (ou d\xE9j\xE0 \xE0 jour)");
    await ensureAntiCravingTable();
  } catch (e) {
    console.error("\u274C Erreur migrations:", e);
  } finally {
    await pool3.end();
  }
}
run();

// server/debugTables.ts
import { Router } from "express";
import pkg3 from "pg";
var { Pool: Pool3 } = pkg3;
var debugTablesRouter = Router();
function ensureDbUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL manquant");
  return url;
}
function makePool() {
  return new Pool3({ connectionString: ensureDbUrl() });
}
debugTablesRouter.get("/debug/tables", async (_req, res) => {
  const pool3 = makePool();
  try {
    const tables = await pool3.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    res.json({ tables: tables.rows.map((r) => r.table_name) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  } finally {
    await pool3.end();
  }
});
debugTablesRouter.get("/debug/tables/counts", async (_req, res) => {
  const pool3 = makePool();
  try {
    const tables = await pool3.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    const out = {};
    for (const row of tables.rows) {
      const tableName = row.table_name;
      const count = await pool3.query(`SELECT COUNT(*)::int AS c FROM "${tableName}";`);
      out[tableName] = count.rows[0].c;
    }
    res.json(out);
  } catch (e) {
    res.status(500).json({ error: e.message });
  } finally {
    await pool3.end();
  }
});
debugTablesRouter.delete("/debug/tables/purge", async (_req, res) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(403).json({ error: "Purge interdite en production" });
  }
  const pool3 = makePool();
  try {
    const tables = await pool3.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type='BASE TABLE'
      ORDER BY table_name;
    `);
    for (const row of tables.rows) {
      const tableName = row.table_name;
      await pool3.query(`TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE;`);
    }
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  } finally {
    await pool3.end();
  }
});

// server/index.ts
import { Pool as Pool4 } from "pg";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
var CORS_ORIGIN = process.env.CORS_ORIGIN || "*";
app.use(cors({
  origin: CORS_ORIGIN === "*" ? true : CORS_ORIGIN.split(","),
  credentials: true
}));
app.use(express.json());
var distPath = path.join(__dirname, "..", "dist");
console.log("\u{1F4C1} Serving static files from:", distPath);
app.use(express.static(distPath));
app.use(session({
  secret: process.env.SESSION_SECRET || "fallback-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 1e3 * 60 * 60 * 24 * 7
  }
}));
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    env: process.env.NODE_ENV
  });
});
registerRoutes(app);
app.use("/api", debugTablesRouter);
var pool2 = new Pool4({
  connectionString: process.env.DATABASE_URL
});
app.get("/api/tables", async (_req, res) => {
  try {
    const result = await pool2.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    res.json(result.rows.map((r) => r.table_name));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});
app.get("/api/data", async (_req, res) => {
  try {
    const tables = [
      "beck_analyses",
      "craving_entries",
      "exercise_sessions",
      "exercises",
      "psycho_education_content",
      "user_badges",
      "user_stats",
      "users"
    ];
    const data = {};
    for (const table of tables) {
      const result = await pool2.query(`SELECT * FROM ${table};`);
      data[table] = result.rows;
    }
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});
app.use((err, _req, res, _next) => {
  console.error("\u274C Erreur serveur:", err);
  res.status(500).json({ message: "Erreur interne" });
});
app.get("*", (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});
console.log("Routes disponibles :");
app._router.stack.forEach((r) => {
  if (r.route && r.route.path) {
    console.log(r.route.path);
  }
});
var port = process.env.PORT || 3e3;
app.listen(port, "0.0.0.0", () => {
  console.log(`\u{1F680} Server running at http://localhost:${port}`);
});
