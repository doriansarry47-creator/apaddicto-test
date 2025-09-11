import { storage } from './storage';
import type { InsertExercise, InsertPsychoEducationContent } from '@shared/schema';

export async function seedData() {
  // Exercices de thérapie sportive
  const exercises: InsertExercise[] = [
    {
      title: "Marche rapide",
      description: "Une marche énergique pour améliorer l'humeur et réduire le stress",
      category: "cardio",
      difficulty: "beginner",
      duration: 20,
      instructions: "Marchez d'un pas soutenu pendant 20 minutes. Concentrez-vous sur votre respiration et l'environnement qui vous entoure. Maintenez un rythme qui vous permet de parler mais qui vous fait légèrement transpirer.",
      benefits: "Améliore l'humeur, réduit l'anxiété, augmente l'énergie, favorise la production d'endorphines naturelles",
      imageUrl: "/images/walking.jpg",
    },
    {
      title: "Exercices de respiration profonde",
      description: "Techniques de respiration pour calmer l'esprit et réduire l'anxiété",
      category: "mindfulness",
      difficulty: "beginner",
      duration: 10,
      instructions: "Asseyez-vous confortablement. Inspirez lentement par le nez pendant 4 secondes, retenez votre souffle pendant 4 secondes, puis expirez par la bouche pendant 6 secondes. Répétez 10 fois.",
      benefits: "Réduit le stress, calme le système nerveux, améliore la concentration, aide à gérer les émotions",
      imageUrl: "/images/breathing.jpg",
    },
    {
      title: "Étirements matinaux",
      description: "Séquence d'étirements doux pour commencer la journée",
      category: "flexibility",
      difficulty: "beginner",
      duration: 15,
      instructions: "Effectuez chaque étirement lentement et maintenez la position pendant 30 secondes. Incluez les bras, le cou, le dos, les jambes. Respirez profondément pendant chaque étirement.",
      benefits: "Améliore la flexibilité, réduit les tensions musculaires, augmente la circulation sanguine, prépare le corps pour la journée",
      imageUrl: "/images/stretching.jpg",
    },
    {
      title: "Course légère",
      description: "Jogging à rythme modéré pour libérer les endorphines",
      category: "cardio",
      difficulty: "intermediate",
      duration: 30,
      instructions: "Commencez par un échauffement de 5 minutes de marche. Courez à un rythme confortable pendant 20 minutes, puis terminez par 5 minutes de marche de récupération.",
      benefits: "Libère des endorphines, améliore l'humeur, renforce le système cardiovasculaire, aide à gérer le stress",
      imageUrl: "/images/jogging.jpg",
    },
    {
      title: "Méditation guidée",
      description: "Séance de méditation pour la paix intérieure",
      category: "mindfulness",
      difficulty: "beginner",
      duration: 15,
      instructions: "Asseyez-vous dans un endroit calme. Fermez les yeux et concentrez-vous sur votre respiration. Quand votre esprit divague, ramenez doucement votre attention sur votre souffle.",
      benefits: "Réduit l'anxiété, améliore la concentration, favorise la relaxation, développe la conscience de soi",
      imageUrl: "/images/meditation.jpg",
    },
    {
      title: "Pompes modifiées",
      description: "Exercice de renforcement adapté à tous les niveaux",
      category: "strength",
      difficulty: "beginner",
      duration: 10,
      instructions: "Commencez par des pompes contre un mur ou sur les genoux. Effectuez 3 séries de 8-12 répétitions avec 1 minute de repos entre les séries.",
      benefits: "Renforce le haut du corps, améliore la confiance en soi, augmente la force fonctionnelle",
      imageUrl: "/images/pushups.jpg",
    },
    {
      title: "Yoga doux",
      description: "Séquence de yoga relaxante pour corps et esprit",
      category: "flexibility",
      difficulty: "beginner",
      duration: 25,
      instructions: "Enchaînez des postures simples comme la posture de l'enfant, le chat-vache, et la torsion assise. Maintenez chaque posture 30-60 secondes en respirant profondément.",
      benefits: "Améliore la flexibilité, réduit le stress, favorise la relaxation, renforce la connexion corps-esprit",
      imageUrl: "/images/yoga.jpg",
    },
    {
      title: "Squats au poids du corps",
      description: "Exercice de renforcement des jambes et fessiers",
      category: "strength",
      difficulty: "intermediate",
      duration: 12,
      instructions: "Effectuez 3 séries de 10-15 squats. Descendez comme si vous vous asseyiez sur une chaise, gardez le dos droit et les genoux alignés avec les orteils.",
      benefits: "Renforce les jambes et fessiers, améliore l'équilibre, augmente la densité osseuse",
      imageUrl: "/images/squats.jpg",
    }
  ];

  // Contenu psychoéducatif
  const psychoEducationContent: InsertPsychoEducationContent[] = [
    {
      title: "Comprendre l'addiction",
      content: `L'addiction est une maladie chronique du cerveau qui affecte les circuits de récompense, de motivation et de mémoire. Elle se caractérise par l'incapacité de s'abstenir de manière constante d'un comportement ou d'une substance, malgré les conséquences négatives.

## Les mécanismes de l'addiction

L'addiction modifie la chimie du cerveau, particulièrement dans les zones responsables de :
- La prise de décision
- Le contrôle des impulsions
- La gestion du stress
- La régulation émotionnelle

## Facteurs de risque

Plusieurs facteurs peuvent contribuer au développement d'une addiction :
- Prédisposition génétique
- Traumatismes passés
- Stress chronique
- Environnement social
- Troubles mentaux concomitants

## L'importance de la compréhension

Comprendre que l'addiction est une maladie et non un manque de volonté est crucial pour :
- Réduire la culpabilité et la honte
- Développer de la compassion envers soi-même
- Accepter l'aide professionnelle
- Maintenir la motivation pour le rétablissement`,
      category: "addiction",
      type: "article",
      difficulty: "beginner",
      estimatedReadTime: 8,
      imageUrl: "/images/brain-addiction.jpg",
    },
    {
      title: "Techniques de gestion du stress",
      content: `Le stress est souvent un déclencheur majeur dans les processus addictifs. Apprendre à gérer le stress de manière saine est essentiel pour maintenir la sobriété.

## Techniques de relaxation immédiate

### Respiration 4-7-8
1. Inspirez par le nez pendant 4 secondes
2. Retenez votre souffle pendant 7 secondes
3. Expirez par la bouche pendant 8 secondes
4. Répétez 4 fois

### Relaxation musculaire progressive
- Contractez puis relâchez chaque groupe musculaire
- Commencez par les orteils, remontez jusqu'à la tête
- Maintenez la contraction 5 secondes, puis relâchez

## Stratégies à long terme

### Exercice physique régulier
- Libère des endorphines naturelles
- Améliore l'humeur et l'estime de soi
- Réduit les hormones de stress

### Méditation et pleine conscience
- Développe la conscience de soi
- Améliore la régulation émotionnelle
- Réduit l'anxiété et la dépression

### Sommeil de qualité
- 7-9 heures par nuit
- Routine de coucher régulière
- Environnement propice au repos`,
      category: "coping",
      type: "article",
      difficulty: "beginner",
      estimatedReadTime: 10,
      imageUrl: "/images/stress-management.jpg",
    },
    {
      title: "Maintenir la motivation",
      content: `La motivation fluctue naturellement au cours du processus de rétablissement. Voici des stratégies pour maintenir votre engagement envers vos objectifs.

## Définir des objectifs SMART

### Spécifiques
- Définissez clairement ce que vous voulez accomplir
- Évitez les objectifs vagues

### Mesurables
- Établissez des critères pour mesurer vos progrès
- Utilisez des chiffres quand c'est possible

### Atteignables
- Fixez des objectifs réalistes
- Commencez petit et progressez graduellement

### Pertinents
- Assurez-vous que vos objectifs correspondent à vos valeurs
- Connectez-les à votre vision à long terme

### Temporels
- Fixez des échéances claires
- Divisez les grands objectifs en étapes plus petites

## Techniques de motivation

### Visualisation positive
- Imaginez-vous atteignant vos objectifs
- Ressentez les émotions positives associées
- Pratiquez régulièrement cette visualisation

### Journal de gratitude
- Notez 3 choses pour lesquelles vous êtes reconnaissant chaque jour
- Concentrez-vous sur les progrès, même petits
- Célébrez vos victoires

### Système de récompenses
- Établissez des récompenses saines pour vos accomplissements
- Variez les types de récompenses
- Assurez-vous qu'elles soutiennent vos objectifs`,
      category: "motivation",
      type: "article",
      difficulty: "intermediate",
      estimatedReadTime: 12,
      imageUrl: "/images/motivation.jpg",
    },
    {
      title: "Prévention de la rechute",
      content: `La rechute fait souvent partie du processus de rétablissement. Comprendre les signaux d'alarme et avoir un plan peut vous aider à maintenir vos progrès.

## Signaux d'alarme précoces

### Émotionnels
- Irritabilité accrue
- Sentiment d'isolement
- Anxiété ou dépression
- Perte d'intérêt pour les activités

### Comportementaux
- Négligence de l'hygiène personnelle
- Évitement des responsabilités
- Isolement social
- Arrêt des activités de rétablissement

### Cognitifs
- Pensées obsessionnelles
- Rationalisation des comportements à risque
- Minimisation des conséquences
- Pensée "tout ou rien"

## Plan de prévention de la rechute

### Identification des déclencheurs
- Situations à haut risque
- Émotions difficiles
- Personnes ou lieux problématiques
- États physiques (fatigue, faim)

### Stratégies d'adaptation
- Techniques de relaxation
- Exercice physique
- Contact avec le réseau de soutien
- Activités alternatives saines

### Plan d'urgence
- Liste de contacts d'urgence
- Stratégies de distraction immédiate
- Lieux sûrs où se rendre
- Rappels de vos motivations

## Après une rechute

Si une rechute survient :
- Ne vous jugez pas sévèrement
- Analysez ce qui s'est passé
- Ajustez votre plan de prévention
- Reprenez vos stratégies de rétablissement rapidement`,
      category: "relapse_prevention",
      type: "article",
      difficulty: "advanced",
      estimatedReadTime: 15,
      imageUrl: "/images/relapse-prevention.jpg",
    }
  ];

  // Insérer les exercices
  for (const exercise of exercises) {
    try {
      await storage.createExercise(exercise);
      console.log(`Exercice créé: ${exercise.title}`);
    } catch (error) {
      console.error(`Erreur lors de la création de l'exercice ${exercise.title}:`, error);
    }
  }

  // Insérer le contenu psychoéducatif
  for (const content of psychoEducationContent) {
    try {
      await storage.createPsychoEducationContent(content);
      console.log(`Contenu psychoéducatif créé: ${content.title}`);
    } catch (error) {
      console.error(`Erreur lors de la création du contenu ${content.title}:`, error);
    }
  }

  console.log('Données d\'exemple créées avec succès!');
}

