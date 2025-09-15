#!/usr/bin/env node

/**
 * Script pour ajouter automatiquement l'exercice de cohérence cardiaque
 * avec support audio et guidance visuelle
 */

const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const { exercises, exerciseEnhancements, audioContent } = require('../server-dist/shared/schema');
const { eq } = require('drizzle-orm');

// Configuration de la base de données
const connectionString = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_vRJU7LlnYG1y@ep-soft-bush-ab0hbww0-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require";
const sql = postgres(connectionString, { ssl: 'require' });
const db = drizzle(sql);

async function addCoherenceCardiaque() {
  try {
    console.log('🫀 Ajout de l\'exercice de cohérence cardiaque...');

    // Vérifier si l'exercice existe déjà
    const existingExercise = await db
      .select()
      .from(exercises)
      .where(eq(exercises.title, 'Cohérence Cardiaque'))
      .limit(1);

    if (existingExercise.length > 0) {
      console.log('✅ L\'exercice de cohérence cardiaque existe déjà');
      return existingExercise[0];
    }

    // Créer l'exercice de base
    const coherenceExercise = {
      title: 'Cohérence Cardiaque',
      description: 'Technique de respiration 5-5 pour réduire stress et craving. Respirez calmement en suivant le rythme : inspirez 5 secondes, expirez 5 secondes pendant 5 minutes.',
      category: 'respiration',
      difficulty: 'beginner',
      duration: 5,
      instructions: `1. Installation
Installez-vous confortablement, pieds au sol, mains relâchées. Fermez doucement les yeux si vous voulez.

2. Position des mains
Posez une main sur le ventre, l'autre sur la poitrine pour sentir le mouvement respiratoire.

3. Inspiration - 5 secondes
Inspirez par le nez pendant 5 secondes en gonflant le ventre d'abord, puis la poitrine.

4. Expiration - 5 secondes  
Expirez par la bouche pendant 5 secondes en relâchant d'abord la poitrine, puis le ventre.

5. Continuité
Maintenez ce rythme pendant 5 minutes (30 cycles de respiration).

6. Retour au rythme
Si vous perdez le rythme, reprenez calmement sans vous juger.`,
      benefits: `• Réduction du stress et de l'anxiété
• Diminution des cravings
• Amélioration de la variabilité cardiaque
• Apaisement du système nerveux
• Meilleure gestion émotionnelle
• Activation du système parasympathique
• Diminution du cortisol (hormone du stress)
• Amélioration de la concentration
• Effet apaisant immédiat (2-3 minutes)`,
      imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
      isActive: true
    };

    const [createdExercise] = await db
      .insert(exercises)
      .values(coherenceExercise)
      .returning();

    console.log('✅ Exercice de cohérence cardiaque créé:', createdExercise.id);

    // Créer le contenu audio associé
    const audioGuide = {
      title: 'Guide Audio - Cohérence Cardiaque',
      description: 'Guide vocal pour la respiration 5-5 avec signaux sonores',
      type: 'breathing_guide',
      category: 'respiration',
      duration: 300, // 5 minutes en secondes
      audioUrl: 'https://example.com/coherence-cardiaque-guide.mp3', // URL fictive - à remplacer par vraie URL
      thumbnailUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200',
      isLoopable: false,
      volumeRecommendation: 'medium',
      tags: ['respiration', 'coherence', 'relaxation', 'stress'],
      isActive: true
    };

    const [createdAudio] = await db
      .insert(audioContent)
      .values(audioGuide)
      .returning();

    console.log('✅ Contenu audio créé:', createdAudio.id);

    // Créer l'enrichissement de l'exercice
    const enhancement = {
      exerciseId: createdExercise.id,
      audioUrls: [createdAudio.audioUrl],
      imageUrls: [
        'https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
        'https://images.unsplash.com/photo-1574126154517-d1e0d89ef734?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300' // GIF/image de respiration
      ],
      timerSettings: {
        type: 'breathing',
        cycles: 30,
        inhale_duration: 5,
        exhale_duration: 5,
        total_duration: 300,
        visual_guide: true
      },
      breathingPattern: {
        pattern_type: '5-5',
        inhale_seconds: 5,
        exhale_seconds: 5,
        cycles_per_minute: 6,
        total_cycles: 30,
        has_audio_cues: true,
        has_visual_cues: true
      },
      visualizationScript: `Imaginez une bulle qui se gonfle doucement quand vous inspirez, et qui se dégonfle paisiblement quand vous expirez. 

Cette bulle suit le rythme naturel de votre cœur, créant une harmonie parfaite entre votre respiration et votre rythme cardiaque.

Avec chaque inspiration, vous accueillez le calme. Avec chaque expiration, vous relâchez les tensions et les pensées parasites.

Votre cœur bat de plus en plus régulièrement, créant un état de cohérence qui apaise tout votre être.`,
      isActive: true
    };

    const [createdEnhancement] = await db
      .insert(exerciseEnhancements)
      .values(enhancement)
      .returning();

    console.log('✅ Enrichissement créé:', createdEnhancement.id);

    console.log('🎉 Exercice de cohérence cardiaque ajouté avec succès !');
    console.log(`
📋 Résumé :
- Exercice ID: ${createdExercise.id}
- Audio ID: ${createdAudio.id}  
- Enhancement ID: ${createdEnhancement.id}
- Durée: 5 minutes
- Catégorie: respiration (objectif apaisement)
- Niveau: débutant
- Support: audio + timer + visualisation
    `);

    return createdExercise;

  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout de l\'exercice:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  addCoherenceCardiaque()
    .then(() => {
      console.log('✅ Script terminé avec succès');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Script échoué:', error);
      process.exit(1);
    });
}

module.exports = { addCoherenceCardiaque };