import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
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
  category: 'craving_reduction' | 'relaxation' | 'energy_boost' | 'emotion_management';
  level: 'beginner' | 'intermediate' | 'advanced' | 'all_levels';
  duration: number;
  intensity: 'gentle' | 'moderate' | 'dynamic';
  type: 'physical' | 'breathing' | 'relaxation' | 'emergency';
  imageUrl: string;
  instructions: string[];
  benefits: string[];
}

// Mappages des catégories API vers les catégories frontend
const categoryMapping: Record<string, keyof typeof categories> = {
  'cardio': 'craving_reduction',
  'strength': 'energy_boost', 
  'flexibility': 'relaxation',
  'mindfulness': 'emotion_management',
  'relaxation': 'relaxation',
  'respiration': 'emotion_management',
  'meditation': 'relaxation',
  'etirement': 'relaxation',
  'renforcement': 'energy_boost',
  'debutant': 'craving_reduction'
};

// Fonction pour convertir les exercices API en format frontend
const convertAPIExerciseToFrontend = (apiExercise: APIExercise): Exercise => {
  const mappedCategory = categoryMapping[apiExercise.category] || 'craving_reduction';
  
  return {
    id: apiExercise.id,
    title: apiExercise.title,
    description: apiExercise.description || '',
    category: mappedCategory,
    level: (apiExercise.difficulty as 'beginner' | 'intermediate' | 'advanced') || 'beginner',
    duration: apiExercise.duration || 10,
    intensity: 'moderate', // Valeur par défaut, pourrait être déterminée par la durée/catégorie
    type: apiExercise.category === 'mindfulness' ? 'breathing' : 
          apiExercise.category === 'flexibility' ? 'relaxation' :
          'physical',
    imageUrl: apiExercise.imageUrl || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200',
    instructions: apiExercise.instructions ? apiExercise.instructions.split('\n').filter(Boolean) : [],
    benefits: apiExercise.benefits ? apiExercise.benefits.split('\n').filter(Boolean) : []
  };
};

// Catégories et niveaux pour l'interface utilisateur
const categories = {
  craving_reduction: 'Réduction Craving',
  relaxation: 'Détente',
  energy_boost: 'Regain d\'Énergie',
  emotion_management: 'Gestion Émotions'
} as const;

const levels = {
  beginner: 'Débutant',
  intermediate: 'Intermédiaire', 
  advanced: 'Avancé',
  all_levels: 'Tous niveaux'
} as const;

export default function Exercises() {
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof categories>('craving_reduction');
  const [selectedLevel, setSelectedLevel] = useState<keyof typeof levels | 'all'>('all');
  const [location] = useLocation();
  const { toast } = useToast();

  // Récupération des exercices depuis l'API
  const { data: apiExercises, isLoading, error } = useQuery<APIExercise[]>({
    queryKey: ['exercises'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/exercises');
      return response.json();
    },
    initialData: []
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

  const filteredExercises = exercises.filter((exercise) => {
    const categoryMatch = exercise.category === selectedCategory;
    const levelMatch = selectedLevel === 'all' || exercise.level === selectedLevel;
    return categoryMatch && levelMatch;
  });

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
          <h1 className="text-3xl font-bold text-foreground mb-2">Bibliothèque d'Exercices</h1>
          <p className="text-muted-foreground">
            Choisissez parmi nos exercices adaptés à votre niveau et vos besoins du moment.
          </p>
        </section>

        {/* Filters */}
        <section className="mb-8">
          <Card className="shadow-material" data-testid="card-filters">
            <CardHeader>
              <CardTitle className="text-lg">Filtres</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Category Filter */}
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">Catégorie</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(categories).map(([key, label]) => (
                    <Button
                      key={key}
                      variant={selectedCategory === key ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(key as keyof typeof categories)}
                      data-testid={`button-category-${key}`}
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

        {/* Results Summary */}
        <section className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-medium text-foreground">
              {categories[selectedCategory]}
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
                    setSelectedCategory('craving_reduction');
                    setSelectedLevel('all');
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
                    const emergencyExercise = exercises.find(ex => ex.type === 'emergency');
                    if (emergencyExercise) {
                      handleStartExercise(emergencyExercise);
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
