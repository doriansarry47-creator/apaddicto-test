import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import IntervalTimer from "@/components/interval-timer";
import VisualizationPlayer from "@/components/visualization-player";
import { 
  Activity, 
  Heart, 
  Leaf, 
  Brain,
  Timer,
  Play,
  Eye,
  Volume2,
  Search,
  Filter,
  Star,
  Clock
} from "lucide-react";

interface Exercise {
  id: string;
  title: string;
  description?: string;
  category: string;
  difficulty: string;
  duration?: number;
  instructions?: string;
  benefits?: string;
  imageUrl?: string;
  videoUrl?: string;
}

interface ExerciseEnhancement {
  exerciseId: string;
  audioUrls: string[];
  videoUrls: string[];
  imageUrls: string[];
  timerSettings?: any;
  breathingPattern?: any;
  visualizationScript?: string;
}

interface VisualizationContent {
  id: string;
  title: string;
  description?: string;
  type: 'guided_imagery' | 'meditation' | 'breathing' | 'visualization';
  category: string;
  difficulty: string;
  duration?: number;
  audioUrl?: string;
  videoUrl?: string;
  imageUrl?: string;
  script?: string;
  instructions?: string;
  benefits?: string;
}

export default function TherapeuticExercises() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("exercises");
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [selectedVisualization, setSelectedVisualization] = useState<VisualizationContent | null>(null);
  const [isTimerDialogOpen, setIsTimerDialogOpen] = useState(false);
  const [isVisualizationDialogOpen, setIsVisualizationDialogOpen] = useState(false);

  // Fetch exercises
  const { data: exercises = [], isLoading: exercisesLoading } = useQuery<Exercise[]>({
    queryKey: ["exercises"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/exercises");
      return response.json();
    },
  });

  // Fetch visualization content
  const { data: visualizations = [], isLoading: visualizationsLoading } = useQuery<VisualizationContent[]>({
    queryKey: ["visualizations"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/visualizations");
      return response.json();
    },
    initialData: [],
  });

  // Save exercise session
  const saveSessionMutation = useMutation({
    mutationFn: (sessionData: any) => apiRequest("POST", "/api/timer-sessions", sessionData),
    onSuccess: () => {
      toast({ title: "Succès", description: "Session enregistrée avec succès" });
      queryClient.invalidateQueries({ queryKey: ["user-stats"] });
    },
    onError: (error: any) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const categories = [
    { id: 'all', name: 'Toutes', icon: '📋', color: 'bg-gray-500' },
    { id: 'physical', name: 'Exercices Physiques', icon: '💪', color: 'bg-blue-500' },
    { id: 'relaxation', name: 'Relaxation', icon: '🧘', color: 'bg-green-500' },
    { id: 'breathing', name: 'Respiration', icon: '💨', color: 'bg-cyan-500' },
    { id: 'meditation', name: 'Méditation', icon: '🕯️', color: 'bg-purple-500' },
    { id: 'emotional', name: 'Régulation Émotionnelle', icon: '❤️', color: 'bg-pink-500' },
    { id: 'stabilization', name: 'Stabilisation', icon: '⚖️', color: 'bg-orange-500' },
    { id: 'mindfulness', name: 'Pleine Conscience', icon: '🌸', color: 'bg-indigo-500' },
  ];

  const difficulties = [
    { id: 'all', name: 'Tous niveaux' },
    { id: 'beginner', name: 'Débutant', color: 'bg-green-500' },
    { id: 'intermediate', name: 'Intermédiaire', color: 'bg-yellow-500' },
    { id: 'advanced', name: 'Avancé', color: 'bg-red-500' },
  ];

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || exercise.category === categoryFilter;
    const matchesDifficulty = difficultyFilter === "all" || exercise.difficulty === difficultyFilter;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const filteredVisualizations = visualizations.filter(viz => {
    const matchesSearch = viz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      viz.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || viz.category === categoryFilter;
    const matchesDifficulty = difficultyFilter === "all" || viz.difficulty === difficultyFilter;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const startExerciseWithTimer = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setIsTimerDialogOpen(true);
  };

  const startVisualization = (visualization: VisualizationContent) => {
    setSelectedVisualization(visualization);
    setIsVisualizationDialogOpen(true);
  };

  const handleTimerComplete = (sessionData: any) => {
    if (selectedExercise) {
      saveSessionMutation.mutate({
        exerciseId: selectedExercise.id,
        type: 'interval',
        duration: sessionData.totalDuration,
        completed: true,
        heartRateBefore: sessionData.heartRateBefore,
        heartRateAfter: sessionData.heartRateAfter,
        stressLevelBefore: sessionData.stressLevelBefore,
        stressLevelAfter: sessionData.stressLevelAfter,
      });
    }
    setIsTimerDialogOpen(false);
    setSelectedExercise(null);
  };

  const handleVisualizationComplete = () => {
    setIsVisualizationDialogOpen(false);
    setSelectedVisualization(null);
  };

  const getIntervalConfigForExercise = (exercise: Exercise) => {
    // Configuration d'exemple basée sur le type d'exercice
    switch (exercise.category) {
      case 'breathing':
        return [
          { name: 'Préparation', duration: 30, type: 'preparation' as const, color: '#3B82F6' },
          { name: 'Inspiration', duration: 4, type: 'work' as const, color: '#10B981' },
          { name: 'Rétention', duration: 7, type: 'rest' as const, color: '#F59E0B' },
          { name: 'Expiration', duration: 8, type: 'work' as const, color: '#EF4444' },
        ];
      case 'physical':
        return [
          { name: 'Échauffement', duration: 60, type: 'preparation' as const, color: '#3B82F6' },
          { name: 'Exercice', duration: 120, type: 'work' as const, color: '#10B981' },
          { name: 'Repos', duration: 60, type: 'rest' as const, color: '#F59E0B' },
        ];
      case 'relaxation':
        return [
          { name: 'Installation', duration: 60, type: 'preparation' as const, color: '#3B82F6' },
          { name: 'Relaxation', duration: 300, type: 'work' as const, color: '#10B981' },
        ];
      default:
        return [
          { name: 'Début', duration: 30, type: 'preparation' as const, color: '#3B82F6' },
          { name: 'Exercice', duration: 180, type: 'work' as const, color: '#10B981' },
        ];
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <Activity className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Exercices Thérapeutiques</h1>
        </div>
      </div>

      {/* Filtres */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtres et recherche</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Input
                placeholder="Rechercher un exercice..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Difficulté" />
                </SelectTrigger>
                <SelectContent>
                  {difficulties.map((difficulty) => (
                    <SelectItem key={difficulty.id} value={difficulty.id}>
                      {difficulty.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Catégories rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 mb-6">
        {categories.slice(1).map((category) => (
          <Button
            key={category.id}
            variant={categoryFilter === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => setCategoryFilter(category.id)}
            className="flex flex-col items-center p-3 h-auto"
          >
            <span className="text-lg mb-1">{category.icon}</span>
            <span className="text-xs text-center">{category.name}</span>
          </Button>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="exercises" className="flex items-center space-x-2">
            <Timer className="h-4 w-4" />
            <span>Exercices avec Timer</span>
          </TabsTrigger>
          <TabsTrigger value="visualizations" className="flex items-center space-x-2">
            <Eye className="h-4 w-4" />
            <span>Visualisations & Méditations</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="exercises" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exercisesLoading ? (
              <p>Chargement des exercices...</p>
            ) : filteredExercises.length === 0 ? (
              <p className="text-center text-muted-foreground col-span-full py-8">
                Aucun exercice trouvé avec ces filtres.
              </p>
            ) : (
              filteredExercises.map((exercise) => {
                const category = categories.find(c => c.id === exercise.category);
                const difficulty = difficulties.find(d => d.id === exercise.difficulty);
                
                return (
                  <Card key={exercise.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{category?.icon || '🏃'}</span>
                          <div>
                            <CardTitle className="text-lg">{exercise.title}</CardTitle>
                            <div className="flex items-center space-x-2 mt-1">
                              {difficulty && (
                                <Badge className={`${difficulty.color} text-white`}>
                                  {difficulty.name}
                                </Badge>
                              )}
                              {exercise.duration && (
                                <Badge variant="outline" className="flex items-center space-x-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{exercise.duration} min</span>
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {exercise.imageUrl && (
                        <img 
                          src={exercise.imageUrl} 
                          alt={exercise.title}
                          className="w-full h-32 object-cover rounded-lg mb-4"
                        />
                      )}
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                        {exercise.description}
                      </p>
                      {exercise.benefits && (
                        <div className="mb-4">
                          <div className="text-xs font-medium text-green-600 mb-1">Bienfaits :</div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {exercise.benefits}
                          </p>
                        </div>
                      )}
                      <div className="flex space-x-2">
                        <Button 
                          onClick={() => startExerciseWithTimer(exercise)}
                          className="flex-1"
                        >
                          <Timer className="h-4 w-4 mr-2" />
                          Démarrer
                        </Button>
                        {exercise.videoUrl && (
                          <Button variant="outline" size="sm">
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="visualizations" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visualizationsLoading ? (
              <p>Chargement des visualisations...</p>
            ) : filteredVisualizations.length === 0 ? (
              <p className="text-center text-muted-foreground col-span-full py-8">
                Aucune visualisation trouvée. Cette section sera bientôt disponible.
              </p>
            ) : (
              filteredVisualizations.map((visualization) => {
                const typeConfig = {
                  guided_imagery: { icon: '🌅', name: 'Imagerie Guidée', color: 'bg-blue-500' },
                  meditation: { icon: '🧘', name: 'Méditation', color: 'bg-purple-500' },
                  breathing: { icon: '💨', name: 'Respiration', color: 'bg-green-500' },
                  visualization: { icon: '👁️', name: 'Visualisation', color: 'bg-orange-500' },
                };
                
                const config = typeConfig[visualization.type];
                
                return (
                  <Card key={visualization.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{config.icon}</span>
                          <div>
                            <CardTitle className="text-lg">{visualization.title}</CardTitle>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge className={`${config.color} text-white`}>
                                {config.name}
                              </Badge>
                              {visualization.duration && (
                                <Badge variant="outline" className="flex items-center space-x-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{visualization.duration} min</span>
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {visualization.imageUrl && (
                        <img 
                          src={visualization.imageUrl} 
                          alt={visualization.title}
                          className="w-full h-32 object-cover rounded-lg mb-4"
                        />
                      )}
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                        {visualization.description}
                      </p>
                      <div className="flex space-x-2">
                        <Button 
                          onClick={() => startVisualization(visualization)}
                          className="flex-1"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Commencer
                        </Button>
                        {visualization.audioUrl && (
                          <Button variant="outline" size="sm">
                            <Volume2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog pour le timer */}
      <Dialog open={isTimerDialogOpen} onOpenChange={setIsTimerDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Session d'exercice</DialogTitle>
          </DialogHeader>
          {selectedExercise && (
            <IntervalTimer
              intervals={getIntervalConfigForExercise(selectedExercise)}
              rounds={1}
              onComplete={handleTimerComplete}
              onSessionData={handleTimerComplete}
              exerciseTitle={selectedExercise.title}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog pour les visualisations */}
      <Dialog open={isVisualizationDialogOpen} onOpenChange={setIsVisualizationDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Session de visualisation</DialogTitle>
          </DialogHeader>
          {selectedVisualization && (
            <VisualizationPlayer
              title={selectedVisualization.title}
              description={selectedVisualization.description}
              type={selectedVisualization.type}
              duration={selectedVisualization.duration}
              audioUrl={selectedVisualization.audioUrl}
              videoUrl={selectedVisualization.videoUrl}
              imageUrl={selectedVisualization.imageUrl}
              script={selectedVisualization.script}
              instructions={selectedVisualization.instructions}
              onComplete={handleVisualizationComplete}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}