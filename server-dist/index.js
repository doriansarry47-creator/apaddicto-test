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
  beckAnalyses: () => beckAnalyses,
  cravingEntries: () => cravingEntries,
  exerciseSessions: () => exerciseSessions,
  exercises: () => exercises,
  insertBeckAnalysisSchema: () => insertBeckAnalysisSchema,
  insertCravingEntrySchema: () => insertCravingEntrySchema,
  insertExerciseSchema: () => insertExerciseSchema,
  insertExerciseSessionSchema: () => insertExerciseSessionSchema,
  insertPsychoEducationContentSchema: () => insertPsychoEducationContentSchema,
  insertUserBadgeSchema: () => insertUserBadgeSchema,
  insertUserSchema: () => insertUserSchema,
  psychoEducationContent: () => psychoEducationContent,
  userBadges: () => userBadges,
  userStats: () => userStats,
  users: () => users
});
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users, exercises, psychoEducationContent, cravingEntries, exerciseSessions, beckAnalyses, userBadges, userStats, insertUserSchema, insertExerciseSchema, insertPsychoEducationContentSchema, insertCravingEntrySchema, insertExerciseSessionSchema, insertBeckAnalysisSchema, insertUserBadgeSchema;
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
      cratingBefore: integer("craving_before"),
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
import { eq, desc, and, gte } from "drizzle-orm";
var DbStorage, storage;
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    init_db();
    init_schema();
    DbStorage = class {
      async getUser(id) {
        return getDB().select().from(users).where(eq(users.id, id)).then((rows) => rows[0]);
      }
      async getUserByEmail(email) {
        return getDB().select().from(users).where(eq(users.email, email)).then((rows) => rows[0]);
      }
      async createUser(insertUser) {
        const newUser = await getDB().insert(users).values(insertUser).returning().then((rows) => rows[0]);
        await getDB().insert(userStats).values({ userId: newUser.id });
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
      async createExercise(insertExercise) {
        return getDB().insert(exercises).values(insertExercise).returning().then((rows) => rows[0]);
      }
      async getPsychoEducationContent() {
        return getDB().select().from(psychoEducationContent).where(eq(psychoEducationContent.isActive, true)).orderBy(psychoEducationContent.title);
      }
      async getAllPsychoEducationContent() {
        return getDB().select().from(psychoEducationContent).orderBy(psychoEducationContent.title);
      }
      async createPsychoEducationContent(insertContent) {
        return getDB().insert(psychoEducationContent).values(insertContent).returning().then((rows) => rows[0]);
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
      async getUserStats(userId) {
        return getDB().select().from(userStats).where(eq(userStats.userId, userId)).then((rows) => rows[0]);
      }
      async createBeckAnalysis(insertAnalysis) {
        return getDB().insert(beckAnalyses).values(insertAnalysis).returning().then((rows) => rows[0]);
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
      title: "Marche rapide",
      description: "Une marche \xE9nergique pour am\xE9liorer l'humeur et r\xE9duire le stress",
      category: "cardio",
      difficulty: "beginner",
      duration: 20,
      instructions: "Marchez d'un pas soutenu pendant 20 minutes. Concentrez-vous sur votre respiration et l'environnement qui vous entoure. Maintenez un rythme qui vous permet de parler mais qui vous fait l\xE9g\xE8rement transpirer.",
      benefits: "Am\xE9liore l'humeur, r\xE9duit l'anxi\xE9t\xE9, augmente l'\xE9nergie, favorise la production d'endorphines naturelles",
      imageUrl: "/images/walking.jpg"
    },
    {
      title: "Exercices de respiration profonde",
      description: "Techniques de respiration pour calmer l'esprit et r\xE9duire l'anxi\xE9t\xE9",
      category: "mindfulness",
      difficulty: "beginner",
      duration: 10,
      instructions: "Asseyez-vous confortablement. Inspirez lentement par le nez pendant 4 secondes, retenez votre souffle pendant 4 secondes, puis expirez par la bouche pendant 6 secondes. R\xE9p\xE9tez 10 fois.",
      benefits: "R\xE9duit le stress, calme le syst\xE8me nerveux, am\xE9liore la concentration, aide \xE0 g\xE9rer les \xE9motions",
      imageUrl: "/images/breathing.jpg"
    },
    {
      title: "\xC9tirements matinaux",
      description: "S\xE9quence d'\xE9tirements doux pour commencer la journ\xE9e",
      category: "flexibility",
      difficulty: "beginner",
      duration: 15,
      instructions: "Effectuez chaque \xE9tirement lentement et maintenez la position pendant 30 secondes. Incluez les bras, le cou, le dos, les jambes. Respirez profond\xE9ment pendant chaque \xE9tirement.",
      benefits: "Am\xE9liore la flexibilit\xE9, r\xE9duit les tensions musculaires, augmente la circulation sanguine, pr\xE9pare le corps pour la journ\xE9e",
      imageUrl: "/images/stretching.jpg"
    },
    {
      title: "Course l\xE9g\xE8re",
      description: "Jogging \xE0 rythme mod\xE9r\xE9 pour lib\xE9rer les endorphines",
      category: "cardio",
      difficulty: "intermediate",
      duration: 30,
      instructions: "Commencez par un \xE9chauffement de 5 minutes de marche. Courez \xE0 un rythme confortable pendant 20 minutes, puis terminez par 5 minutes de marche de r\xE9cup\xE9ration.",
      benefits: "Lib\xE8re des endorphines, am\xE9liore l'humeur, renforce le syst\xE8me cardiovasculaire, aide \xE0 g\xE9rer le stress",
      imageUrl: "/images/jogging.jpg"
    },
    {
      title: "M\xE9ditation guid\xE9e",
      description: "S\xE9ance de m\xE9ditation pour la paix int\xE9rieure",
      category: "mindfulness",
      difficulty: "beginner",
      duration: 15,
      instructions: "Asseyez-vous dans un endroit calme. Fermez les yeux et concentrez-vous sur votre respiration. Quand votre esprit divague, ramenez doucement votre attention sur votre souffle.",
      benefits: "R\xE9duit l'anxi\xE9t\xE9, am\xE9liore la concentration, favorise la relaxation, d\xE9veloppe la conscience de soi",
      imageUrl: "/images/meditation.jpg"
    },
    {
      title: "Pompes modifi\xE9es",
      description: "Exercice de renforcement adapt\xE9 \xE0 tous les niveaux",
      category: "strength",
      difficulty: "beginner",
      duration: 10,
      instructions: "Commencez par des pompes contre un mur ou sur les genoux. Effectuez 3 s\xE9ries de 8-12 r\xE9p\xE9titions avec 1 minute de repos entre les s\xE9ries.",
      benefits: "Renforce le haut du corps, am\xE9liore la confiance en soi, augmente la force fonctionnelle",
      imageUrl: "/images/pushups.jpg"
    },
    {
      title: "Yoga doux",
      description: "S\xE9quence de yoga relaxante pour corps et esprit",
      category: "flexibility",
      difficulty: "beginner",
      duration: 25,
      instructions: "Encha\xEEnez des postures simples comme la posture de l'enfant, le chat-vache, et la torsion assise. Maintenez chaque posture 30-60 secondes en respirant profond\xE9ment.",
      benefits: "Am\xE9liore la flexibilit\xE9, r\xE9duit le stress, favorise la relaxation, renforce la connexion corps-esprit",
      imageUrl: "/images/yoga.jpg"
    },
    {
      title: "Squats au poids du corps",
      description: "Exercice de renforcement des jambes et fessiers",
      category: "strength",
      difficulty: "intermediate",
      duration: 12,
      instructions: "Effectuez 3 s\xE9ries de 10-15 squats. Descendez comme si vous vous asseyiez sur une chaise, gardez le dos droit et les genoux align\xE9s avec les orteils.",
      benefits: "Renforce les jambes et fessiers, am\xE9liore l'\xE9quilibre, augmente la densit\xE9 osseuse",
      imageUrl: "/images/squats.jpg"
    }
  ];
  const psychoEducationContent2 = [
    {
      title: "Comprendre l'addiction",
      content: `L'addiction est une maladie chronique du cerveau qui affecte les circuits de r\xE9compense, de motivation et de m\xE9moire. Elle se caract\xE9rise par l'incapacit\xE9 de s'abstenir de mani\xE8re constante d'un comportement ou d'une substance, malgr\xE9 les cons\xE9quences n\xE9gatives.

## Les m\xE9canismes de l'addiction

L'addiction modifie la chimie du cerveau, particuli\xE8rement dans les zones responsables de :
- La prise de d\xE9cision
- Le contr\xF4le des impulsions
- La gestion du stress
- La r\xE9gulation \xE9motionnelle

## Facteurs de risque

Plusieurs facteurs peuvent contribuer au d\xE9veloppement d'une addiction :
- Pr\xE9disposition g\xE9n\xE9tique
- Traumatismes pass\xE9s
- Stress chronique
- Environnement social
- Troubles mentaux concomitants

## L'importance de la compr\xE9hension

Comprendre que l'addiction est une maladie et non un manque de volont\xE9 est crucial pour :
- R\xE9duire la culpabilit\xE9 et la honte
- D\xE9velopper de la compassion envers soi-m\xEAme
- Accepter l'aide professionnelle
- Maintenir la motivation pour le r\xE9tablissement`,
      category: "addiction",
      type: "article",
      difficulty: "beginner",
      estimatedReadTime: 8,
      imageUrl: "/images/brain-addiction.jpg"
    },
    {
      title: "Techniques de gestion du stress",
      content: `Le stress est souvent un d\xE9clencheur majeur dans les processus addictifs. Apprendre \xE0 g\xE9rer le stress de mani\xE8re saine est essentiel pour maintenir la sobri\xE9t\xE9.

## Techniques de relaxation imm\xE9diate

### Respiration 4-7-8
1. Inspirez par le nez pendant 4 secondes
2. Retenez votre souffle pendant 7 secondes
3. Expirez par la bouche pendant 8 secondes
4. R\xE9p\xE9tez 4 fois

### Relaxation musculaire progressive
- Contractez puis rel\xE2chez chaque groupe musculaire
- Commencez par les orteils, remontez jusqu'\xE0 la t\xEAte
- Maintenez la contraction 5 secondes, puis rel\xE2chez

## Strat\xE9gies \xE0 long terme

### Exercice physique r\xE9gulier
- Lib\xE8re des endorphines naturelles
- Am\xE9liore l'humeur et l'estime de soi
- R\xE9duit les hormones de stress

### M\xE9ditation et pleine conscience
- D\xE9veloppe la conscience de soi
- Am\xE9liore la r\xE9gulation \xE9motionnelle
- R\xE9duit l'anxi\xE9t\xE9 et la d\xE9pression

### Sommeil de qualit\xE9
- 7-9 heures par nuit
- Routine de coucher r\xE9guli\xE8re
- Environnement propice au repos`,
      category: "coping",
      type: "article",
      difficulty: "beginner",
      estimatedReadTime: 10,
      imageUrl: "/images/stress-management.jpg"
    },
    {
      title: "Maintenir la motivation",
      content: `La motivation fluctue naturellement au cours du processus de r\xE9tablissement. Voici des strat\xE9gies pour maintenir votre engagement envers vos objectifs.

## D\xE9finir des objectifs SMART

### Sp\xE9cifiques
- D\xE9finissez clairement ce que vous voulez accomplir
- \xC9vitez les objectifs vagues

### Mesurables
- \xC9tablissez des crit\xE8res pour mesurer vos progr\xE8s
- Utilisez des chiffres quand c'est possible

### Atteignables
- Fixez des objectifs r\xE9alistes
- Commencez petit et progressez graduellement

### Pertinents
- Assurez-vous que vos objectifs correspondent \xE0 vos valeurs
- Connectez-les \xE0 votre vision \xE0 long terme

### Temporels
- Fixez des \xE9ch\xE9ances claires
- Divisez les grands objectifs en \xE9tapes plus petites

## Techniques de motivation

### Visualisation positive
- Imaginez-vous atteignant vos objectifs
- Ressentez les \xE9motions positives associ\xE9es
- Pratiquez r\xE9guli\xE8rement cette visualisation

### Journal de gratitude
- Notez 3 choses pour lesquelles vous \xEAtes reconnaissant chaque jour
- Concentrez-vous sur les progr\xE8s, m\xEAme petits
- C\xE9l\xE9brez vos victoires

### Syst\xE8me de r\xE9compenses
- \xC9tablissez des r\xE9compenses saines pour vos accomplissements
- Variez les types de r\xE9compenses
- Assurez-vous qu'elles soutiennent vos objectifs`,
      category: "motivation",
      type: "article",
      difficulty: "intermediate",
      estimatedReadTime: 12,
      imageUrl: "/images/motivation.jpg"
    },
    {
      title: "Pr\xE9vention de la rechute",
      content: `La rechute fait souvent partie du processus de r\xE9tablissement. Comprendre les signaux d'alarme et avoir un plan peut vous aider \xE0 maintenir vos progr\xE8s.

## Signaux d'alarme pr\xE9coces

### \xC9motionnels
- Irritabilit\xE9 accrue
- Sentiment d'isolement
- Anxi\xE9t\xE9 ou d\xE9pression
- Perte d'int\xE9r\xEAt pour les activit\xE9s

### Comportementaux
- N\xE9gligence de l'hygi\xE8ne personnelle
- \xC9vitement des responsabilit\xE9s
- Isolement social
- Arr\xEAt des activit\xE9s de r\xE9tablissement

### Cognitifs
- Pens\xE9es obsessionnelles
- Rationalisation des comportements \xE0 risque
- Minimisation des cons\xE9quences
- Pens\xE9e "tout ou rien"

## Plan de pr\xE9vention de la rechute

### Identification des d\xE9clencheurs
- Situations \xE0 haut risque
- \xC9motions difficiles
- Personnes ou lieux probl\xE9matiques
- \xC9tats physiques (fatigue, faim)

### Strat\xE9gies d'adaptation
- Techniques de relaxation
- Exercice physique
- Contact avec le r\xE9seau de soutien
- Activit\xE9s alternatives saines

### Plan d'urgence
- Liste de contacts d'urgence
- Strat\xE9gies de distraction imm\xE9diate
- Lieux s\xFBrs o\xF9 se rendre
- Rappels de vos motivations

## Apr\xE8s une rechute

Si une rechute survient :
- Ne vous jugez pas s\xE9v\xE8rement
- Analysez ce qui s'est pass\xE9
- Ajustez votre plan de pr\xE9vention
- Reprenez vos strat\xE9gies de r\xE9tablissement rapidement`,
      category: "relapse_prevention",
      type: "article",
      difficulty: "advanced",
      estimatedReadTime: 15,
      imageUrl: "/images/relapse-prevention.jpg"
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
    const hashedPassword = await this.hashPassword(userData.password);
    const newUser = {
      email: userData.email,
      password: hashedPassword,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      role: userData.role || "patient"
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
      res.json({ message: "Logout successful" });
    });
  });
  app2.get("/api/auth/me", async (req, res) => {
    if (!req.session || !req.session.user) {
      return res.json({ user: null });
    }
    const user = await AuthService.getUserById(req.session.user.id);
    res.json({ user });
  });
  app2.get("/api/exercises", async (req, res) => {
    try {
      const exercises2 = await storage.getExercises();
      res.json(exercises2);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la r\xE9cup\xE9ration des exercices" });
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
}

// server/migrate.ts
import "dotenv/config";
import { drizzle as drizzle2 } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pkg2 from "pg";
import fs from "fs";
var { Pool: Pool2 } = pkg2;
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
    console.log("\u2705 Migrations appliqu\xE9es (ou d\xE9j\xE0 \xE0 jour)");
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
var app = express();
var CORS_ORIGIN = process.env.CORS_ORIGIN || "*";
app.use(cors({
  origin: CORS_ORIGIN === "*" ? true : CORS_ORIGIN.split(","),
  credentials: true
}));
app.use(express.json());
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
app.get("/", (_req, res) => {
  res.send("API Apaddcito est en ligne !");
});
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
