export interface Exercise {
  id: string;
  title: string;
  description: string;
  category: 'craving_reduction' | 'relaxation' | 'energy_boost' | 'emotion_management';
  level: 'beginner' | 'intermediate' | 'advanced' | 'all_levels';
  duration: number; // in minutes
  intensity: 'gentle' | 'moderate' | 'dynamic';
  type: 'physical' | 'breathing' | 'relaxation' | 'emergency';
  imageUrl: string;
  instructions: string[];
  benefits: string[];
}

export const exercises: Exercise[] = [
  // Beginner Level Exercises
  {
    id: 'gentle-stretching',
    title: 'Étirements Doux Anti-Stress',
    description: 'Séquence d\'étirements simples pour apaiser le système nerveux et réduire les tensions.',
    category: 'craving_reduction',
    level: 'beginner',
    duration: 5,
    intensity: 'gentle',
    type: 'physical',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200',
    instructions: [
      'Asseyez-vous confortablement ou tenez-vous debout',
      'Roulez lentement les épaules vers l\'arrière 5 fois',
      'Étirez doucement le cou de chaque côté',
      'Levez les bras au-dessus de la tête et étirez-vous',
      'Penchez-vous légèrement vers l\'avant pour étirer le dos'
    ],
    benefits: [
      'Réduction du stress physique',
      'Diminution des tensions musculaires',
      'Amélioration de la circulation',
      'Effet calmant sur le système nerveux'
    ]
  },
  {
    id: 'breathing-coherence',
    title: 'Respiration Cohérence Cardiaque',
    description: 'Technique de respiration guidée pour réguler le système nerveux et réduire l\'anxiété.',
    category: 'emotion_management',
    level: 'all_levels',
    duration: 6,
    intensity: 'gentle',
    type: 'breathing',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200',
    instructions: [
      'Installez-vous confortablement, dos droit',
      'Inspirez lentement par le nez pendant 5 secondes',
      'Expirez doucement par la bouche pendant 5 secondes',
      'Répétez ce rythme pendant 6 minutes',
      'Focalisez-vous sur votre cœur pendant l\'exercice'
    ],
    benefits: [
      'Régulation du rythme cardiaque',
      'Réduction de l\'anxiété',
      'Amélioration de la concentration',
      'Activation du système parasympathique'
    ]
  },

  // Intermediate Level Exercises
  {
    id: 'cardio-circuit',
    title: 'Circuit Cardio Doux',
    description: 'Enchaînement de mouvements pour activer la circulation et libérer les endorphines.',
    category: 'craving_reduction',
    level: 'intermediate',
    duration: 8,
    intensity: 'moderate',
    type: 'physical',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200',
    instructions: [
      'Échauffement : marchez sur place 1 minute',
      '30 secondes de montées de genoux',
      '30 secondes de talons-fesses',
      '1 minute de squats légers',
      '30 secondes d\'étirements pour récupérer'
    ],
    benefits: [
      'Libération d\'endorphines',
      'Amélioration de l\'humeur',
      'Réduction du stress',
      'Activation métabolique'
    ]
  },
  {
    id: 'yoga-relaxation',
    title: 'Yoga Relaxation Progressive',
    description: 'Enchaînement de postures douces pour la détente musculaire et mentale profonde.',
    category: 'relaxation',
    level: 'beginner',
    duration: 10,
    intensity: 'gentle',
    type: 'relaxation',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200',
    instructions: [
      'Commencez en position debout, pieds parallèles',
      'Passez en posture de l\'enfant pendant 2 minutes',
      'Enchaînez avec la posture du chat-vache',
      'Terminez par la posture du cadavre',
      'Respirez profondément tout au long de l\'exercice'
    ],
    benefits: [
      'Relaxation musculaire profonde',
      'Réduction du stress mental',
      'Amélioration de la flexibilité',
      'Centrage et ancrage'
    ]
  },

  // Advanced Level Exercises
  {
    id: 'hiit-anti-craving',
    title: 'HIIT Anti-Craving',
    description: 'Entraînement intensif pour une libération maximale d\'endorphines et réduction rapide du craving.',
    category: 'craving_reduction',
    level: 'advanced',
    duration: 12,
    intensity: 'dynamic',
    type: 'physical',
    imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200',
    instructions: [
      'Échauffement : 2 minutes de cardio léger',
      '30 secondes de burpees, 30 secondes de repos',
      '30 secondes de jumping jacks, 30 secondes de repos',
      '30 secondes de mountain climbers, 30 secondes de repos',
      'Répétez le circuit 3 fois, puis récupération'
    ],
    benefits: [
      'Libération massive d\'endorphines',
      'Réduction rapide du craving',
      'Amélioration de la condition physique',
      'Effet antidépresseur naturel'
    ]
  },

  // Emergency Routine
  {
    id: 'emergency-routine',
    title: 'Routine Urgence Anti-Craving',
    description: 'Séquence rapide et efficace pour casser immédiatement un pic de craving intense.',
    category: 'craving_reduction',
    level: 'all_levels',
    duration: 3,
    intensity: 'moderate',
    type: 'emergency',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200',
    instructions: [
      '10 respirations profondes et rapides',
      '30 secondes de sautillements sur place',
      '20 squats rapides',
      '10 respirations de récupération',
      'Évaluation de votre état'
    ],
    benefits: [
      'Interruption immédiate du craving',
      'Libération rapide d\'endorphines',
      'Recentrage mental',
      'Activation du système nerveux sympathique'
    ]
  },

  // Energy Boost Exercises
  {
    id: 'morning-energizer',
    title: 'Réveil Énergisant',
    description: 'Routine matinale pour commencer la journée avec énergie et motivation.',
    category: 'energy_boost',
    level: 'intermediate',
    duration: 7,
    intensity: 'moderate',
    type: 'physical',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200',
    instructions: [
      'Réveil articulaire : rotation des articulations',
      '1 minute de marche dynamique',
      '20 squats avec bras levés',
      '30 secondes de jumping jacks',
      'Étirements dynamiques pour finir'
    ],
    benefits: [
      'Activation métabolique',
      'Amélioration de l\'humeur',
      'Boost d\'énergie naturel',
      'Préparation mentale positive'
    ]
  },

  // Emotion Management
  {
    id: 'anxiety-relief',
    title: 'Gestion de l\'Anxiété',
    description: 'Combinaison de mouvements et respiration pour gérer l\'anxiété et les émotions difficiles.',
    category: 'emotion_management',
    level: 'beginner',
    duration: 8,
    intensity: 'gentle',
    type: 'relaxation',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200',
    instructions: [
      'Position confortable, yeux fermés',
      '3 minutes de respiration 4-7-8',
      'Visualisation d\'un lieu sûr',
      'Mouvements doux des bras et du corps',
      'Affirmations positives'
    ],
    benefits: [
      'Réduction de l\'anxiété',
      'Régulation émotionnelle',
      'Amélioration de l\'estime de soi',
      'Développement de la résilience'
    ]
  },

  // Relaxation Exercises
  {
    id: 'progressive-relaxation',
    title: 'Relaxation Musculaire Progressive',
    description: 'Technique de Jacobson pour relâcher toutes les tensions du corps.',
    category: 'relaxation',
    level: 'all_levels',
    duration: 15,
    intensity: 'gentle',
    type: 'relaxation',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200',
    instructions: [
      'Allongez-vous confortablement',
      'Contractez et relâchez chaque groupe musculaire',
      'Commencez par les pieds, remontez jusqu\'à la tête',
      'Maintenez la contraction 5 secondes, relâchez 10 secondes',
      'Terminez par une relaxation complète'
    ],
    benefits: [
      'Relâchement des tensions physiques',
      'Amélioration du sommeil',
      'Réduction du stress chronique',
      'Conscience corporelle accrue'
    ]
  }
];

export const categories = {
  craving_reduction: 'Réduction Craving',
  relaxation: 'Détente',
  energy_boost: 'Regain d\'Énergie',
  emotion_management: 'Gestion Émotions'
} as const;

export const levels = {
  beginner: 'Débutant',
  intermediate: 'Intermédiaire', 
  advanced: 'Avancé',
  all_levels: 'Tous niveaux'
} as const;

export const intensities = {
  gentle: 'Douce',
  moderate: 'Modérée',
  dynamic: 'Dynamique'
} as const;

export function getExercisesByCategory(category: keyof typeof categories) {
  return exercises.filter(exercise => exercise.category === category);
}

export function getExercisesByLevel(level: keyof typeof levels) {
  return exercises.filter(exercise => exercise.level === level);
}

export function getEmergencyExercises() {
  return exercises.filter(exercise => exercise.type === 'emergency');
}

export function getExerciseById(id: string) {
  return exercises.find(exercise => exercise.id === id);
}
