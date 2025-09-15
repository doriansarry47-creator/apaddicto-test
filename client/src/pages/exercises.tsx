import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigation } from "@/components/navigation";
import { ExerciseCard } from "@/components/exercise-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Exercise as APIExercise } from "../../../../shared/schema";

// Types pour la compatibilité avec le composant ExerciseCard existant
interface Exercise {
  id: string;
  title: string;
  description: string;
  category: 'cardio' | 'strength' | 'flexibility' | 'mindfulness' | 'relaxation' | 'respiration' | 'meditation' | 'debutant';
  level: 'beginner' | 'intermediate' | 'advanced' | 'all_levels';
  duration: number;
  intensity: 'gentle' | 'moderate' | 'dynamic';
  type: 'physical' | 'breathing' | 'relaxation' | 'emergency';
  imageUrl: string;
  instructions: string[];
  benefits: string[];
}

// Mappages des catégories API vers les catégories frontend - correspondance directe et variantes
const categoryMapping: Record<string, keyof typeof categories> = {
  // Correspondance directe avec les catégories de l'admin
  'cardio': 'cardio',
  'strength': 'strength',
  'renforcement': 'strength', // Variante française
  'flexibility': 'flexibility',
  'etirement': 'flexibility', // Variante française
  'mindfulness': 'mindfulness',
  'relaxation': 'relaxation',
  'respiration': 'respiration',
  'meditation': 'meditation',
  'debutant': 'debutant'
};

// Fonction pour convertir les exercices API en format frontend
const convertAPIExerciseToFrontend = (apiExercise: APIExercise): Exercise => {
  const mappedCategory = categoryMapping[apiExercise.category] || apiExercise.category as Exercise['category'];
  
  return {
    id: apiExercise.id,
    title: apiExercise.title,
    description: apiExercise.description || '',
    category: mappedCategory,
    level: (apiExercise.difficulty as 'beginner' | 'intermediate' | 'advanced') || 'beginner',
    duration: apiExercise.duration || 10,
    intensity: 'moderate', // Valeur par défaut, pourrait être déterminée par la durée/catégorie
    type: ['mindfulness', 'respiration', 'meditation'].includes(apiExercise.category) ? 'breathing' : 
          ['flexibility', 'relaxation'].includes(apiExercise.category) ? 'relaxation' :
          'physical',
    imageUrl: apiExercise.imageUrl || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200',
    instructions: apiExercise.instructions ? apiExercise.instructions.split('\n').filter(Boolean) : [],
    benefits: apiExercise.benefits ? apiExercise.benefits.split('\n').filter(Boolean) : []
  };
};

// Catégories par objectif adaptées à l'addictologie
const objectives = {
  apaisement: '🧘 Apaisement / Gestion du Stress',
  energie: '⚡ Énergie / Activation',
  renforcement: '💪 Renforcement Musculaire',
  mobilite: '🤸 Mobilité & Relâchement',
  coordination: '⚖️ Coordination & Équilibre',
  relaxation: '😌 Relaxation & Pleine Conscience',
  focus: '🧠 Focus Cognitif'
} as const;

// Catégories techniques (pour la correspondance avec l'API)
const categories = {
  cardio: 'Cardio Training',
  strength: 'Renforcement Musculaire',
  flexibility: 'Étirement & Flexibilité',
  mindfulness: 'Pleine Conscience & Méditation',
  relaxation: 'Relaxation',
  respiration: 'Exercices de Respiration',
  meditation: 'Méditation',
  debutant: 'Exercices Débutant'
} as const;

// Mappage catégories API vers objectifs addictologie
const categoryToObjective: Record<string, keyof typeof objectives> = {
  'respiration': 'apaisement',
  'meditation': 'apaisement',
  'mindfulness': 'apaisement',
  'relaxation': 'relaxation',
  'cardio': 'energie',
  'strength': 'renforcement',
  'flexibility': 'mobilite',
  'debutant': 'focus'
};

const levels = {
  beginner: 'Débutant',
  intermediate: 'Intermédiaire', 
  advanced: 'Avancé',
  all_levels: 'Tous niveaux'
} as const;

export default function Exercises() {
  const [selectedObjective, setSelectedObjective] = useState<keyof typeof objectives | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof categories | 'all'>('all');
  const [selectedLevel, setSelectedLevel] = useState<keyof typeof levels | 'all'>('all');
  const [cravingLevel, setCravingLevel] = useState<number | null>(null);
  const [location] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Récupération des exercices depuis l'API
  const { data: apiExercises, isLoading, error, refetch: refetchExercises } = useQuery<APIExercise[]>({
    queryKey: ['exercises'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/exercises');
      return response.json();
    },
    initialData: [],
    staleTime: 0, // Forcer le refetch
    cacheTime: 300000, // 5 minutes de cache
  });

  // Conversion des exercices API vers le format frontend
  const exercises = apiExercises.map(convertAPIExerciseToFrontend);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get('category');
    if (category && categories[category as keyof typeof categories]) {
      setSelectedCategory(category as keyof typeof categories);
    }
  }, [location.search]);

  // Rafraîchir les exercices quand on arrive sur la page
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['exercises'] });
  }, [queryClient]);

  // Fonction pour déterminer l'objectif d'un exercice
  const getExerciseObjective = (exercise: Exercise): keyof typeof objectives => {
    return categoryToObjective[exercise.category] || 'focus';
  };

  // Fonction de suggestion intelligente selon le craving
  const getSuggestedExercises = (cravingLevel: number) => {
    if (cravingLevel >= 7) {
      // Craving élevé -> priorité apaisement, niveau débutant
      return exercises.filter(ex => 
        getExerciseObjective(ex) === 'apaisement' && 
        ex.level === 'beginner' && 
        ex.duration <= 10
      );
    } else if (cravingLevel >= 4) {
      // Craving modéré -> relaxation ou mobilité douce
      return exercises.filter(ex => 
        ['apaisement', 'relaxation', 'mobilite'].includes(getExerciseObjective(ex)) &&
        ['beginner', 'intermediate'].includes(ex.level)
      );
    } else {
      // Craving faible -> énergie ou renforcement
      return exercises.filter(ex => 
        ['energie', 'renforcement', 'coordination'].includes(getExerciseObjective(ex))
      );
    }
  };

  const filteredExercises = exercises.filter((exercise) => {
    const objectiveMatch = selectedObjective === 'all' || getExerciseObjective(exercise) === selectedObjective;
    const categoryMatch = selectedCategory === 'all' || exercise.category === selectedCategory;
    const levelMatch = selectedLevel === 'all' || exercise.level === selectedLevel;
    return objectiveMatch && categoryMatch && levelMatch;
  });

  // Suggestion intelligente si un niveau de craving est défini
  const suggestedExercises = cravingLevel !== null ? getSuggestedExercises(cravingLevel) : [];

  if (isLoading) {
    return (
      <>
        <Navigation />
        <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement des exercices...</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navigation />
        <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Erreur lors du chargement des exercices.</p>
            <Button onClick={() => window.location.reload()}>Réessayer</Button>
          </div>
        </main>
      </>
    );
  }

  const handleStartExercise = (exercise: Exercise) => {
    toast({
      title: "Exercice démarré",
      description: `Vous avez commencé "${exercise.title}". Bonne séance !`,
    });
    // Here you would typically navigate to the exercise detail page or start a timer
    window.location.href = `/exercise/${exercise.id}`;
  };

  return (
    <>
      <Navigation />
      <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
        
        {/* Page Header */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Bibliothèque d'Exercices</h1>
              <p className="text-muted-foreground">
                Choisissez parmi nos exercices adaptés à votre niveau et vos besoins du moment.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => refetchExercises()}
              className="flex items-center space-x-2"
            >
              <span className="material-icons">refresh</span>
              <span>Actualiser</span>
            </Button>
          </div>
        </section>

        {/* Filters */}
        <section className="mb-8">
          <Card className="shadow-material" data-testid="card-filters">
            <CardHeader>
              <CardTitle className="text-lg">Filtres</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Évaluation du craving */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">Comment vous sentez-vous maintenant ? (0-10)</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {[0,1,2,3,4,5,6,7,8,9,10].map((level) => (
                    <Button
                      key={level}
                      variant={cravingLevel === level ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCravingLevel(level)}
                      className={`${level >= 7 ? 'text-red-600' : level >= 4 ? 'text-orange-600' : 'text-green-600'}`}
                    >
                      {level}
                    </Button>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCravingLevel(null)}
                  >
                    Réinitialiser
                  </Button>
                </div>
                {cravingLevel !== null && (
                  <div className="p-3 bg-secondary rounded-lg text-sm">
                    <p className="font-medium mb-1">
                      {cravingLevel >= 7 ? '🚨 Niveau élevé - Exercices d\'apaisement recommandés' :
                       cravingLevel >= 4 ? '⚠️ Niveau modéré - Relaxation et mobilité douce' :
                       '✅ Niveau faible - Énergie et renforcement possibles'}
                    </p>
                    <p className="text-muted-foreground">
                      {suggestedExercises.length} exercice{suggestedExercises.length > 1 ? 's' : ''} adapté{suggestedExercises.length > 1 ? 's' : ''} à votre état
                    </p>
                  </div>
                )}
              </div>

              {/* Objectif Filter */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">Objectif</h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedObjective === 'all' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedObjective('all')}
                    data-testid="button-objective-all"
                  >
                    Tous les objectifs
                  </Button>
                  {Object.entries(objectives).map(([key, label]) => (
                    <Button
                      key={key}
                      variant={selectedObjective === key ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedObjective(key as keyof typeof objectives)}
                      data-testid={`button-objective-${key}`}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Level Filter */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">Niveau</h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedLevel === 'all' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedLevel('all')}
                    data-testid="button-level-all"
                  >
                    Tous niveaux
                  </Button>
                  {Object.entries(levels).map(([key, label]) => (
                    <Button
                      key={key}
                      variant={selectedLevel === key ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedLevel(key as keyof typeof levels)}
                      data-testid={`button-level-${key}`}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Suggestions intelligentes */}
        {cravingLevel !== null && suggestedExercises.length > 0 && (
          <section className="mb-8">
            <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span className="material-icons">psychology</span>
                  <span>Exercices recommandés pour vous</span>
                </CardTitle>
                <CardDescription>
                  Basé sur votre évaluation actuelle ({cravingLevel}/10)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {suggestedExercises.slice(0, 3).map((exercise) => (
                    <ExerciseCard
                      key={exercise.id}
                      exercise={exercise}
                      onStart={() => handleStartExercise(exercise)}
                    />
                  ))}
                </div>
                {suggestedExercises.length > 3 && (
                  <Button
                    className="mt-4"
                    variant="outline"
                    onClick={() => {
                      setSelectedObjective(getExerciseObjective(suggestedExercises[0]));
                    }}
                  >
                    Voir tous les exercices recommandés ({suggestedExercises.length})
                  </Button>
                )}
              </CardContent>
            </Card>
          </section>
        )}

        {/* Results Summary */}
        <section className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-medium text-foreground">
              {selectedObjective === 'all' ? 'Tous les exercices' : objectives[selectedObjective as keyof typeof objectives]}
              {selectedLevel !== 'all' && ` - ${levels[selectedLevel as keyof typeof levels]}`}
            </h2>
            <span className="text-sm text-muted-foreground" data-testid="text-results-count">
              {filteredExercises.length} exercice{filteredExercises.length !== 1 ? 's' : ''}
            </span>
          </div>
        </section>

        {/* Exercise Grid */}
        <section>
          {filteredExercises.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="grid-exercises">
              {filteredExercises.map((exercise) => (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  onStart={() => handleStartExercise(exercise)}
                />
              ))}
            </div>
          ) : (
            <Card className="shadow-material" data-testid="card-no-results">
              <CardContent className="p-8 text-center">
                <span className="material-icons text-6xl text-muted-foreground mb-4">search_off</span>
                <h3 className="text-xl font-medium text-foreground mb-2">Aucun exercice trouvé</h3>
                <p className="text-muted-foreground mb-4">
                  {exercises.length === 0 ? 
                    "Aucun exercice disponible pour le moment. Les administrateurs peuvent en ajouter via l'interface d'administration." :
                    "Essayez de modifier vos filtres pour voir plus d'exercices."
                  }
                </p>
                <Button
                  onClick={() => {
                    setSelectedObjective('all');
                    setSelectedCategory('all');
                    setSelectedLevel('all');
                    setCravingLevel(null);
                  }}
                  data-testid="button-reset-filters"
                >
                  Réinitialiser les filtres
                </Button>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Emergency Access */}
        <section className="mt-12">
          <Card className="bg-gradient-to-r from-destructive to-red-600 shadow-material text-destructive-foreground" data-testid="card-emergency-section">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-medium mb-2 flex items-center">
                    <span className="material-icons mr-2">emergency</span>
                    Besoin d'aide immédiate ?
                  </h3>
                  <p className="opacity-90">
                    Accédez rapidement à nos routines d'urgence de 3 minutes pour gérer un craving intense.
                  </p>
                </div>
                <Button
                  onClick={() => {
                    // Chercher d'abord un exercice d'urgence
                    const emergencyExercise = exercises.find(ex => ex.type === 'emergency');
                    if (emergencyExercise) {
                      handleStartExercise(emergencyExercise);
                    } else {
                      // Rediriger vers les routines d'urgence ou exercices de respiration
                      const breathingExercise = exercises.find(ex => ex.type === 'breathing' || ex.category === 'emotion_management');
                      if (breathingExercise) {
                        handleStartExercise(breathingExercise);
                      } else {
                        toast({
                          title: "Routine d'urgence",
                          description: "Aucune routine d'urgence spécifique disponible. Essayez les exercices de respiration ou de relaxation.",
                        });
                      }
                    }
                  }}
                  className="bg-white text-destructive hover:bg-gray-50 ml-4"
                  data-testid="button-emergency-access"
                >
                  Routine d'Urgence
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </>
  );
}
