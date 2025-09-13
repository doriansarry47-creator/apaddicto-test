import { storage } from './storage';
import type { InsertExercise, InsertPsychoEducationContent, InsertEmergencyRoutine, InsertQuickResource } from '@shared/schema';

export async function seedData() {
  // Exercices de thérapie sportive avancés avec contenu récupéré
  const exercises: InsertExercise[] = [
    {
      title: "Étirements Doux Anti-Stress",
      description: "Séquence d'étirements simples pour apaiser le système nerveux et réduire les tensions.",
      category: "flexibility",
      difficulty: "beginner",
      duration: 5,
      instructions: "Asseyez-vous confortablement ou tenez-vous debout. Roulez lentement les épaules vers l'arrière 5 fois. Étirez doucement le cou de chaque côté. Levez les bras au-dessus de la tête et étirez-vous. Penchez-vous légèrement vers l'avant pour étirer le dos.",
      benefits: "Réduction du stress physique, diminution des tensions musculaires, amélioration de la circulation, effet calmant sur le système nerveux",
      imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
    },
    {
      title: "Respiration Cohérence Cardiaque",
      description: "Technique de respiration guidée pour réguler le système nerveux et réduire l'anxiété.",
      category: "mindfulness",
      difficulty: "beginner",
      duration: 6,
      instructions: "Installez-vous confortablement, dos droit. Inspirez lentement par le nez pendant 5 secondes. Expirez doucement par la bouche pendant 5 secondes. Répétez ce rythme pendant 6 minutes. Focalisez-vous sur votre cœur pendant l'exercice.",
      benefits: "Régulation du rythme cardiaque, réduction de l'anxiété, amélioration de la concentration, activation du système parasympathique",
      imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
    },
    {
      title: "Circuit Cardio Doux",
      description: "Enchaînement de mouvements pour activer la circulation et libérer les endorphines.",
      category: "cardio",
      difficulty: "intermediate",
      duration: 8,
      instructions: "Échauffement : marchez sur place 1 minute. 30 secondes de montées de genoux. 30 secondes de talons-fesses. 1 minute de squats légers. 30 secondes d'étirements pour récupérer.",
      benefits: "Libération d'endorphines, amélioration de l'humeur, réduction du stress, activation métabolique",
      imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
    },
    {
      title: "Yoga Relaxation Progressive",
      description: "Enchaînement de postures douces pour la détente musculaire et mentale profonde.",
      category: "flexibility",
      difficulty: "beginner",
      duration: 10,
      instructions: "Commencez en position debout, pieds parallèles. Passez en posture de l'enfant pendant 2 minutes. Enchaînez avec la posture du chat-vache. Terminez par la posture du cadavre. Respirez profondément tout au long de l'exercice.",
      benefits: "Relaxation musculaire profonde, réduction du stress mental, amélioration de la flexibilité, centrage et ancrage",
      imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
    },
    {
      title: "HIIT Anti-Craving",
      description: "Entraînement intensif pour une libération maximale d'endorphines et réduction rapide du craving.",
      category: "strength",
      difficulty: "advanced",
      duration: 12,
      instructions: "Échauffement : 2 minutes de cardio léger. 30 secondes de burpees, 30 secondes de repos. 30 secondes de jumping jacks, 30 secondes de repos. 30 secondes de mountain climbers, 30 secondes de repos. Répétez le circuit 3 fois, puis récupération.",
      benefits: "Libération massive d'endorphines, réduction rapide du craving, amélioration de la condition physique, effet antidépresseur naturel",
      imageUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
    },
    {
      title: "Routine Urgence Anti-Craving",
      description: "Séquence rapide et efficace pour casser immédiatement un pic de craving intense.",
      category: "cardio",
      difficulty: "intermediate",
      duration: 3,
      instructions: "10 respirations profondes et rapides. 30 secondes de sautillements sur place. 20 squats rapides. 10 respirations de récupération. Évaluation de votre état.",
      benefits: "Interruption immédiate du craving, libération rapide d'endorphines, recentrage mental, activation du système nerveux sympathique",
      imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
    },
    {
      title: "Réveil Énergisant",
      description: "Routine matinale pour commencer la journée avec énergie et motivation.",
      category: "cardio",
      difficulty: "intermediate",
      duration: 7,
      instructions: "Réveil articulaire : rotation des articulations. 1 minute de marche dynamique. 20 squats avec bras levés. 30 secondes de jumping jacks. Étirements dynamiques pour finir.",
      benefits: "Activation métabolique, amélioration de l'humeur, boost d'énergie naturel, préparation mentale positive",
      imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
    },
    {
      title: "Gestion de l'Anxiété",
      description: "Combinaison de mouvements et respiration pour gérer l'anxiété et les émotions difficiles.",
      category: "mindfulness",
      difficulty: "beginner",
      duration: 8,
      instructions: "Position confortable, yeux fermés. 3 minutes de respiration 4-7-8. Visualisation d'un lieu sûr. Mouvements doux des bras et du corps. Affirmations positives.",
      benefits: "Réduction de l'anxiété, régulation émotionnelle, amélioration de l'estime de soi, développement de la résilience",
      imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
    },
    {
      title: "Relaxation Musculaire Progressive",
      description: "Technique de Jacobson pour relâcher toutes les tensions du corps.",
      category: "mindfulness",
      difficulty: "beginner",
      duration: 15,
      instructions: "Allongez-vous confortablement. Contractez et relâchez chaque groupe musculaire. Commencez par les pieds, remontez jusqu'à la tête. Maintenez la contraction 5 secondes, relâchez 10 secondes. Terminez par une relaxation complète.",
      benefits: "Relâchement des tensions physiques, amélioration du sommeil, réduction du stress chronique, conscience corporelle accrue",
      imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
    }
  ];

  // Contenu psychoéducatif enrichi
  const psychoEducationContent: InsertPsychoEducationContent[] = [
    {
      title: "Comprendre l'addiction",
      content: `L'addiction est une maladie chronique du cerveau qui affecte les circuits de récompense, de motivation et de mémoire. Elle se caractérise par l'incapacité de s'abstenir de manière constante d'un comportement ou d'une substance, malgré les conséquences négatives.

## Les mécanismes de l'addiction

L'addiction modifie la chimie du cerveau, particulièrement dans les zones responsables de :
- **La prise de décision** : Altération du cortex préfrontal
- **Le contrôle des impulsions** : Dysfonctionnement du système inhibiteur
- **La gestion du stress** : Déséquilibre hormonal
- **La régulation émotionnelle** : Impact sur l'amygdale et l'hippocampe

## Facteurs de risque

### Biologiques
- Prédisposition génétique (40-60% du risque)
- Déséquilibres neurochimiques
- Troubles mentaux concomitants

### Psychologiques  
- Traumatismes passés non résolus
- Stratégies d'adaptation inadéquates
- Faible estime de soi

### Environnementaux
- Stress chronique
- Environnement social permissif
- Accessibilité des substances/comportements

## L'importance de la compréhension

Comprendre que l'addiction est une **maladie** et non un manque de volonté est crucial pour :
- ✅ Réduire la culpabilité et la honte
- ✅ Développer de la compassion envers soi-même
- ✅ Accepter l'aide professionnelle
- ✅ Maintenir la motivation pour le rétablissement`,
      category: "addiction",
      type: "article",
      difficulty: "beginner",
      estimatedReadTime: 8,
      imageUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
    },
    {
      title: "Techniques de gestion du stress avancées",
      content: `Le stress est souvent un déclencheur majeur dans les processus addictifs. Voici des techniques scientifiquement prouvées pour gérer le stress de manière saine.

## 🚨 Techniques de gestion immédiate

### Technique 5-4-3-2-1 (Ancrage sensoriel)
1. **5 choses** que vous pouvez voir
2. **4 choses** que vous pouvez toucher
3. **3 choses** que vous pouvez entendre
4. **2 choses** que vous pouvez sentir
5. **1 chose** que vous pouvez goûter

### Respiration Box (4-4-4-4)
- Inspirez pendant 4 secondes
- Retenez pendant 4 secondes  
- Expirez pendant 4 secondes
- Pause pendant 4 secondes
- Répétez 8-10 cycles

### Auto-massage express
- Massez les tempes en mouvements circulaires
- Pression sur les points d'acupression (poignet, main)
- Étirement doux du cou et des épaules

## 🏃‍♂️ Stratégies à long terme

### HIIT pour la gestion du stress
- **3x par semaine**, 15-20 minutes
- Libère des endorphines pour 24-48h
- Améliore la résistance au stress

### Pratique méditative quotidienne
- **Minimum 10 minutes** par jour
- Applications recommandées : Headspace, Calm, Insight Timer
- Focus sur la **pleine conscience** et l'**auto-compassion**

### Optimisation du sommeil
- **Température** : 18-19°C optimal
- **Écrans** : Arrêt 1h avant coucher
- **Routine** : Même horaire chaque jour
- **Environnement** : Noir complet, silencieux`,
      category: "stress_management",
      type: "article", 
      difficulty: "intermediate",
      estimatedReadTime: 12,
      imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
    },
    {
      title: "Psychologie de la motivation : Méthodes scientifiques",
      content: `La motivation n'est pas un sentiment constant. C'est une compétence qui se développe avec des techniques éprouvées par la recherche en psychologie comportementale.

## 🎯 Système d'objectifs hiérarchique

### Objectifs SMART-ER
- **S**pécifique - **M**esurable - **A**tteignable - **R**elevant - **T**emporel
- **E**motionnellement connecté - **R**évisable

### Exemple concret
❌ "Je veux arrêter de boire"
✅ "Je vais rester sobre pendant 30 jours, en remplaçant l'alcool par du thé, parce que je veux être présent pour ma famille"

## 🧠 Techniques de neuroscience motivationnelle

### Dopamine Stacking
1. **Activité agréable** avant l'objectif difficile
2. **Récompense immédiate** après accomplissement
3. **Célébration** des petites victoires

### Visualisation basée sur les résultats
- **10 minutes** de visualisation quotidienne
- **Ressentir** les émotions du succès
- **Ancrer** physiquement les sensations positives

### Accountability sociale
- **Partenaire** de responsabilité
- **Check-ins** réguliers (quotidiens/hebdomadaires)
- **Engagement public** de vos objectifs

## 📊 Système de tracking motivationnel

### Métriques quotidiennes
- Score de motivation (1-10)
- Activités accomplies
- Obstacles rencontrés
- Solutions trouvées

### Analyse hebdomadaire
- Patterns de motivation faible
- Déclencheurs positifs identifiés
- Ajustements nécessaires`,
      category: "motivation",
      type: "article",
      difficulty: "advanced",
      estimatedReadTime: 15,
      imageUrl: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
    },
    {
      title: "Plan complet de prévention des rechutes",
      content: `Un plan de prévention des rechutes robuste est votre bouclier contre les moments difficiles. Voici un système complet basé sur les meilleures pratiques cliniques.

## 🚨 Système d'alerte précoce

### Signaux physiques
- ⚠️ Fatigue inhabituelle
- ⚠️ Changements d'appétit
- ⚠️ Troubles du sommeil
- ⚠️ Tensions musculaires

### Signaux émotionnels
- 😤 Irritabilité croissante  
- 😔 Sentiment de vide
- 😰 Anxiété persistante
- 🙄 Cynisme envers le rétablissement

### Signaux comportementaux
- 📵 Isolement social
- 🎯 Abandon des routines saines
- 🤝 Évitement du soutien
- 💭 Romantisation du passé

### Signaux cognitifs
- 🧠 Pensées "tout ou rien"
- 🎭 Minimisation des conséquences
- 🔄 Rumination excessive
- ❓ Remise en question du rétablissement

## 🛡️ Stratégies de protection

### Niveau 1 : Prévention quotidienne
- **Morning routine** : Méditation + exercice + intentions
- **Evening review** : Gratitude + challenges + solutions
- **Connections** : 1 interaction sociale positive par jour

### Niveau 2 : Intervention précoce  
- **HALT Check** : Am-I Hungry/Angry/Lonely/Tired?
- **Emergency contacts** : 3 personnes disponibles 24/7
- **Safe spaces** : Lieux physiques de récupération

### Niveau 3 : Crise management
- **Emergency protocol** : Actions spécifiques minute par minute
- **Professional help** : Thérapeute, médecin, hotline
- **Damage control** : Plan si rechute partielle

## 🔄 Après une rechute : Recovery protocol

### Phase 1 : Sécurité (0-24h)
1. **Stop** immédiatement la substance/comportement
2. **Seek** aide professionnelle si nécessaire
3. **Stabilize** environnement physique et émotionnel

### Phase 2 : Analyse (24-72h)
- **What** s'est passé exactement?
- **When** les signaux d'alarme ont-ils commencé?
- **Where** étais-je? (lieu, contexte)
- **Why** mes stratégies n'ont-elles pas fonctionné?

### Phase 3 : Reconstruction (72h+)
- **Ajuster** le plan de prévention
- **Renforcer** les stratégies faibles
- **Ajouter** nouvelles techniques apprises
- **Recommit** publiquement aux objectifs`,
      category: "relapse_prevention",
      type: "article",
      difficulty: "advanced",
      estimatedReadTime: 18,
      imageUrl: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
    },
    {
      title: "Neuroscience des émotions et régulation",
      content: `Comprendre le fonctionnement de vos émotions au niveau neurologique vous donne un pouvoir extraordinaire sur votre bien-être mental.

## 🧠 Anatomie émotionnelle

### Le trio décisionnel
1. **Amygdale** : Détection des menaces (émotions primaires)
2. **Cortex préfrontal** : Analyse rationnelle (pensées logiques)  
3. **Système limbique** : Mémoire émotionnelle (associations passées)

### Processus de déclenchement émotionnel
**Stimulus** → **Évaluation automatique** → **Réaction physiologique** → **Émotion consciente** → **Action**

## 🎛️ Techniques de régulation avancées

### Window of Tolerance
- **Zone optimale** : Vous pouvez penser clairement et gérer les émotions
- **Hyperactivation** : Anxiété, colère, panique - besoin de calmer
- **Hypoactivation** : Dépression, vide, déconnexion - besoin d'activer

### STOP Technique améliorée
- **S**top : Pause physique immédiate
- **T**ake a breath : 3 respirations profondes conscientes  
- **O**bserve : "Que se passe-t-il dans mon corps/esprit?"
- **P**roceed : Action consciente basée sur valeurs

### Technique RAIN pour émotions difficiles
- **R**ecognize : "Je remarque de la colère/tristesse..."
- **A**llow : "C'est ok de ressentir cela"
- **I**nvestigate : "Où est-ce dans mon corps? Que dit cette émotion?"
- **N**urture : Auto-compassion et bienveillance

## 🔧 Outils pratiques quotidiens

### Emotional Check-ins
**3x par jour**, demandez-vous :
- Émotion principale en ce moment?
- Intensité (1-10)?
- Message de cette émotion?
- Action nécessaire?

### Emotion Surfing
1. **Identifier** la vague émotionnelle qui arrive
2. **Respirer** avec l'émotion (ne pas résister)
3. **Observer** comment elle monte puis redescend
4. **Naviguer** sans être submergé`,
      category: "emotional_regulation",
      type: "article",
      difficulty: "intermediate",
      estimatedReadTime: 14,
      imageUrl: "https://images.unsplash.com/photo-1559757260-6dd0cd4bce18?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
    }
  ];

  // Ressources rapides pour intervention immédiate
  const quickResources: InsertQuickResource[] = [
    {
      title: "Technique 5-4-3-2-1",
      description: "Ancrage sensoriel rapide en cas de panique ou craving intense",
      content: "5 choses que je vois, 4 que je touche, 3 que j'entends, 2 que je sens, 1 que je goûte",
      category: "emergency", 
      type: "technique",
      icon: "eye",
      color: "red",
      isActive: true,
      isPinned: true
    },
    {
      title: "Respiration Box 4-4-4-4",
      description: "Technique de respiration pour calmer le système nerveux rapidement",
      content: "Inspire 4 sec → Retiens 4 sec → Expire 4 sec → Pause 4 sec. Répète 8 fois.",
      category: "coping",
      type: "technique", 
      icon: "wind",
      color: "blue",
      isActive: true,
      isPinned: true
    },
    {
      title: "Cette émotion va passer",
      description: "Rappel que toutes les émotions sont temporaires",
      content: "Les émotions sont comme des vagues - elles montent, atteignent un pic, puis redescendent naturellement. Cette intensité ne va pas durer.",
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
      content: "J'ai déjà surmonté des difficultés. Ce craving ne me définit pas. Je choisis ma réponse.",
      category: "motivation",
      type: "affirmation",
      icon: "zap",
      color: "yellow", 
      isActive: true,
      isPinned: true
    },
    {
      title: "Auto-massage express",
      description: "Technique rapide pour réduire les tensions physiques",
      content: "Masse tes tempes en cercles, presse les points entre pouce/index, étire doucement le cou. 2 minutes suffisent.",
      category: "relaxation",
      type: "technique",
      icon: "hand", 
      color: "purple",
      isActive: true,
      isPinned: false
    },
    {
      title: "Mes 3 raisons principales",
      description: "Rappel de tes motivations fondamentales pour le rétablissement",
      content: "1. Ma santé et mon bien-être - 2. Mes relations importantes - 3. Mes objectifs et rêves futurs",
      category: "motivation",
      type: "reminder",
      icon: "target",
      color: "orange",
      isActive: true,
      isPinned: true
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

  // Insérer les ressources rapides
  for (const resource of quickResources) {
    try {
      await storage.createQuickResource(resource);
      console.log(`Ressource rapide créée: ${resource.title}`);
    } catch (error) {
      console.error(`Erreur lors de la création de la ressource ${resource.title}:`, error);
    }
  }

  // Routines d'urgence
  const emergencyRoutines: InsertEmergencyRoutine[] = [
    {
      title: "Routine anti-craving 3 minutes",
      description: "Routine rapide pour gérer un craving intense en 3 minutes",
      category: "general",
      duration: 3,
      steps: [
        "Arrête-toi et reconnais le craving sans jugement",
        "Respire profondément : inspire 4 secondes, expire 6 secondes (répète 5 fois)",
        "Nomme 5 choses que tu vois, 4 que tu entends, 3 que tu touches",
        "Rappelle-toi pourquoi tu veux arrêter (tes motivations principales)",
        "Bois un grand verre d'eau lentement",
        "Félicite-toi d'avoir résisté à ce craving"
      ],
      isActive: true,
      isDefault: true
    },
    {
      title: "Technique de respiration d'urgence",
      description: "Respiration 4-7-8 pour calmer rapidement l'anxiété et les cravings",
      category: "breathing",
      duration: 5,
      steps: [
        "Trouve une position confortable, assis ou debout",
        "Place ta langue derrière tes dents supérieures",
        "Expire complètement par la bouche",
        "Inspire par le nez pendant 4 secondes",
        "Retiens ton souffle pendant 7 secondes",
        "Expire par la bouche pendant 8 secondes",
        "Répète ce cycle 4 fois de suite",
        "Observe comment ton corps se détend"
      ],
      isActive: true,
      isDefault: false
    },
    {
      title: "Ancrage sensoriel rapide",
      description: "Technique d'ancrage pour se reconnecter au moment présent",
      category: "grounding",
      duration: 2,
      steps: [
        "Nomme 5 choses que tu peux voir autour de toi",
        "Identifie 4 choses que tu peux toucher",
        "Écoute 3 sons différents dans ton environnement",
        "Trouve 2 odeurs que tu peux sentir",
        "Pense à 1 goût agréable que tu aimes",
        "Prends un moment pour apprécier d'être ancré dans le présent"
      ],
      isActive: true,
      isDefault: false
    }
  ];

  // Insérer les routines d'urgence
  for (const routine of emergencyRoutines) {
    try {
      await storage.createEmergencyRoutine(routine);
      console.log(`Routine d'urgence créée: ${routine.title}`);
    } catch (error) {
      console.error(`Erreur lors de la création de la routine ${routine.title}:`, error);
    }
  }

  console.log('Données d\'exemple créées avec succès!');
}

