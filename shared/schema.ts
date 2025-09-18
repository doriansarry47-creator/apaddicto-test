import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  password: varchar("password").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("patient"), // 'patient' or 'admin'
  level: integer("level").default(1),
  points: integer("points").default(0),
  isActive: boolean("is_active").default(true),
  lastLoginAt: timestamp("last_login_at"),
  inactivityThreshold: integer("inactivity_threshold").default(30), // jours avant considéré inactif
  notes: text("notes"), // notes du thérapeute sur le patient
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Exercises table
export const exercises = pgTable("exercises", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  category: varchar("category").notNull(), // 'cardio', 'strength', 'flexibility', 'mindfulness'
  difficulty: varchar("difficulty").default("beginner"), // 'beginner', 'intermediate', 'advanced'
  duration: integer("duration"), // in minutes
  instructions: text("instructions"),
  benefits: text("benefits"),
  imageUrl: varchar("image_url"),
  videoUrl: varchar("video_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Psychoeducation content table
export const psychoEducationContent = pgTable("psycho_education_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  category: varchar("category").notNull(), // 'addiction', 'motivation', 'coping', 'relapse_prevention'
  type: varchar("type").default("article"), // 'article', 'video', 'audio', 'interactive'
  difficulty: varchar("difficulty").default("beginner"),
  estimatedReadTime: integer("estimated_read_time"), // in minutes
  imageUrl: varchar("image_url"),
  videoUrl: varchar("video_url"),
  audioUrl: varchar("audio_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Craving entries
export const cravingEntries = pgTable("craving_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  intensity: integer("intensity").notNull(), // 0-10 scale
  triggers: jsonb("triggers").$type<string[]>().default([]),
  emotions: jsonb("emotions").$type<string[]>().default([]),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Exercise sessions
export const exerciseSessions = pgTable("exercise_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  exerciseId: varchar("exercise_id").notNull().references(() => exercises.id, { onDelete: 'cascade' }),
  duration: integer("duration"), // in seconds
  completed: boolean("completed").default(false),
  cravingBefore: integer("craving_before"), // 0-10 scale
  cravingAfter: integer("craving_after"), // 0-10 scale
  createdAt: timestamp("created_at").defaultNow(),
});

// Beck column analyses
export const beckAnalyses = pgTable("beck_analyses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  situation: text("situation"),
  automaticThoughts: text("automatic_thoughts"),
  emotions: text("emotions"),
  emotionIntensity: integer("emotion_intensity"),
  rationalResponse: text("rational_response"),
  newFeeling: text("new_feeling"),
  newIntensity: integer("new_intensity"),
  createdAt: timestamp("created_at").defaultNow(),
});

// User badges
export const userBadges = pgTable("user_badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  badgeType: varchar("badge_type").notNull(), // '7_days', '50_exercises', 'craving_reduction'
  earnedAt: timestamp("earned_at").defaultNow(),
});

// User progress/stats
export const userStats = pgTable("user_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  exercisesCompleted: integer("exercises_completed").default(0),
  totalDuration: integer("total_duration").default(0), // in seconds
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  averageCraving: integer("average_craving"), // calculated average
  beckAnalysesCompleted: integer("beck_analyses_completed").default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Create insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertExerciseSchema = createInsertSchema(exercises).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPsychoEducationContentSchema = createInsertSchema(psychoEducationContent).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCravingEntrySchema = createInsertSchema(cravingEntries).omit({
  id: true,
  createdAt: true,
});

export const insertExerciseSessionSchema = createInsertSchema(exerciseSessions).omit({
  id: true,
  createdAt: true,
});

export const insertBeckAnalysisSchema = createInsertSchema(beckAnalyses).omit({
  id: true,
  createdAt: true,
});

export const insertUserBadgeSchema = createInsertSchema(userBadges).omit({
  id: true,
  earnedAt: true,
});

// Emergency routines table
export const emergencyRoutines = pgTable("emergency_routines", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  steps: jsonb("steps").notNull(), // Array of steps for the routine
  duration: integer("duration"), // in minutes
  category: varchar("category").default("general"), // 'breathing', 'grounding', 'distraction', 'general'
  isActive: boolean("is_active").default(true),
  isDefault: boolean("is_default").default(false), // One routine can be marked as default
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertEmergencyRoutineSchema = createInsertSchema(emergencyRoutines).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Quick resources table (for psycho-education)
export const quickResources = pgTable("quick_resources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  content: text("content").notNull(),
  category: varchar("category").notNull(), // 'coping', 'motivation', 'emergency', 'relaxation'
  type: varchar("type").default("tip"), // 'tip', 'technique', 'reminder', 'affirmation'
  icon: varchar("icon"), // Icon name for UI
  color: varchar("color").default("blue"), // Color theme
  isActive: boolean("is_active").default(true),
  isPinned: boolean("is_pinned").default(false), // Pinned resources appear first
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertQuickResourceSchema = createInsertSchema(quickResources).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Anti-craving strategies table
export const antiCravingStrategies = pgTable("anti_craving_strategies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  context: varchar("context").notNull(), // 'leisure', 'home', 'work'
  exercise: text("exercise").notNull(),
  effort: varchar("effort").notNull(), // 'faible', 'modéré', 'intense'
  duration: integer("duration").notNull(), // in minutes
  cravingBefore: integer("craving_before").notNull(), // 0-10 scale
  cravingAfter: integer("craving_after").notNull(), // 0-10 scale
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAntiCravingStrategySchema = createInsertSchema(antiCravingStrategies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Timer sessions for exercises with audio/video
export const timerSessions = pgTable("timer_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  exerciseId: varchar("exercise_id").notNull().references(() => exercises.id, { onDelete: 'cascade' }),
  type: varchar("type").notNull(), // 'interval', 'continuous', 'breathing'
  duration: integer("duration").notNull(), // in seconds
  intervals: jsonb("intervals"), // for interval timers
  audioUrl: varchar("audio_url"), // background audio/music
  completed: boolean("completed").default(false),
  heartRateBefore: integer("heart_rate_before"),
  heartRateAfter: integer("heart_rate_after"),
  stressLevelBefore: integer("stress_level_before"), // 1-10 scale
  stressLevelAfter: integer("stress_level_after"), // 1-10 scale
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Professional reports for therapist
export const professionalReports = pgTable("professional_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  therapistId: varchar("therapist_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  reportType: varchar("report_type").notNull(), // 'weekly', 'monthly', 'session', 'progress'
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  data: jsonb("data"), // structured data (charts, stats, etc.)
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  isPrivate: boolean("is_private").default(true),
  tags: jsonb("tags").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Visualization content (guided imagery, meditation videos)
export const visualizationContent = pgTable("visualization_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  type: varchar("type").notNull(), // 'guided_imagery', 'meditation', 'breathing', 'visualization'
  category: varchar("category").notNull(), // 'relaxation', 'stress_reduction', 'pain_management', 'emotional_regulation'
  difficulty: varchar("difficulty").default("beginner"),
  duration: integer("duration"), // in minutes
  audioUrl: varchar("audio_url"),
  videoUrl: varchar("video_url"),
  imageUrl: varchar("image_url"),
  script: text("script"), // text script for the visualization
  instructions: text("instructions"),
  benefits: text("benefits"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Audio content for therapy (relaxation, ASMR, nature sounds)
export const audioContent = pgTable("audio_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  type: varchar("type").notNull(), // 'relaxation', 'nature_sounds', 'meditation', 'breathing_guide', 'asmr'
  category: varchar("category").notNull(),
  duration: integer("duration"), // in seconds
  audioUrl: varchar("audio_url").notNull(),
  thumbnailUrl: varchar("thumbnail_url"),
  isLoopable: boolean("is_loopable").default(false),
  volumeRecommendation: varchar("volume_recommendation").default("medium"),
  tags: jsonb("tags").$type<string[]>().default([]),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Exercise enhancement with multimedia
export const exerciseEnhancements = pgTable("exercise_enhancements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  exerciseId: varchar("exercise_id").notNull().references(() => exercises.id, { onDelete: 'cascade' }),
  audioUrls: jsonb("audio_urls").$type<string[]>().default([]), // multiple audio tracks
  videoUrls: jsonb("video_urls").$type<string[]>().default([]),
  imageUrls: jsonb("image_urls").$type<string[]>().default([]),
  timerSettings: jsonb("timer_settings"), // interval timer configuration
  breathingPattern: jsonb("breathing_pattern"), // for breathing exercises
  visualizationScript: text("visualization_script"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Create insert schemas for new tables
export const insertTimerSessionSchema = createInsertSchema(timerSessions).omit({
  id: true,
  createdAt: true,
});

export const insertProfessionalReportSchema = createInsertSchema(professionalReports).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVisualizationContentSchema = createInsertSchema(visualizationContent).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAudioContentSchema = createInsertSchema(audioContent).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertExerciseEnhancementSchema = createInsertSchema(exerciseEnhancements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Exercise = typeof exercises.$inferSelect;
export type InsertExercise = z.infer<typeof insertExerciseSchema>;
export type PsychoEducationContent = typeof psychoEducationContent.$inferSelect;
export type InsertPsychoEducationContent = z.infer<typeof insertPsychoEducationContentSchema>;
export type CravingEntry = typeof cravingEntries.$inferSelect;
export type InsertCravingEntry = z.infer<typeof insertCravingEntrySchema>;
export type ExerciseSession = typeof exerciseSessions.$inferSelect;
export type InsertExerciseSession = z.infer<typeof insertExerciseSessionSchema>;
export type BeckAnalysis = typeof beckAnalyses.$inferSelect;
export type InsertBeckAnalysis = z.infer<typeof insertBeckAnalysisSchema>;
export type UserBadge = typeof userBadges.$inferSelect;
export type InsertUserBadge = z.infer<typeof insertUserBadgeSchema>;
export type UserStats = typeof userStats.$inferSelect;
export type EmergencyRoutine = typeof emergencyRoutines.$inferSelect;
export type InsertEmergencyRoutine = z.infer<typeof insertEmergencyRoutineSchema>;
export type QuickResource = typeof quickResources.$inferSelect;
export type InsertQuickResource = z.infer<typeof insertQuickResourceSchema>;
export type AntiCravingStrategy = typeof antiCravingStrategies.$inferSelect;
export type InsertAntiCravingStrategy = z.infer<typeof insertAntiCravingStrategySchema>;
export type TimerSession = typeof timerSessions.$inferSelect;
export type InsertTimerSession = z.infer<typeof insertTimerSessionSchema>;
export type ProfessionalReport = typeof professionalReports.$inferSelect;
export type InsertProfessionalReport = z.infer<typeof insertProfessionalReportSchema>;
export type VisualizationContent = typeof visualizationContent.$inferSelect;
export type InsertVisualizationContent = z.infer<typeof insertVisualizationContentSchema>;
export type AudioContent = typeof audioContent.$inferSelect;
export type InsertAudioContent = z.infer<typeof insertAudioContentSchema>;
export type ExerciseEnhancement = typeof exerciseEnhancements.$inferSelect;
export type InsertExerciseEnhancement = z.infer<typeof insertExerciseEnhancementSchema>;
