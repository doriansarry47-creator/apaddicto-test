import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { levels, intensities } from "@/lib/exercises-data";
import type { InsertExerciseSession, Exercise as APIExercise } from "@shared/schema";

const DEMO_USER_ID = "demo-user-123";

export default function ExerciseDetail() {
  const { id } = useParams();
  const [isRunning, setIsRunning] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [cravingBefore, setCravingBefore] = useState<number | null>(null);
  const [cravingAfter, setCravingAfter] = useState<number | null>(null);
  const [showCravingAfter, setShowCravingAfter] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Récupérer l'exercice depuis l'API
  const { data: exercise, isLoading, error } = useQuery<APIExercise>({
    queryKey: ['exercise', id],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/exercises/${id}`);
      return response.json();
    },
    enabled: !!id,
  });

  const createSessionMutation = useMutation({
    mutationFn: async (data: InsertExerciseSession) => {
      return await apiRequest("POST", "/api/exercise-sessions", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exercise-sessions", DEMO_USER_ID] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", DEMO_USER_ID, "stats"] });
    },
  });

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isRunning) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  if (isLoading) {
    return (
      <>
        <Navigation />
        <main className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement de l'exercice...</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (error || !exercise) {
    return (
      <>
        <Navigation />
        <main className="container mx-auto px-4 py-6">
          <Card className="shadow-material">
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold mb-4">Exercice non trouvé</h1>
              <p className="text-muted-foreground mb-4">
                L'exercice demandé n'existe pas ou n'est plus disponible.
              </p>
              <Link to="/exercises">
                <Button>Retour aux exercices</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </>
    );
  }

  const startExercise = () => {
    if (cravingBefore === null) {
      toast({
        title: "Évaluation requise",
        description: "Veuillez d'abord évaluer votre niveau de craving actuel.",
        variant: "destructive",
      });
      return;
    }
    
    setIsRunning(true);
    setTimeElapsed(0);
    setCurrentStep(0);
  };

  const stopExercise = () => {
    setIsRunning(false);
    setShowCravingAfter(true);
    
    toast({
      title: "Exercice terminé",
      description: "Félicitations ! Comment vous sentez-vous maintenant ?",
    });
  };

  const completeExercise = () => {
    if (cravingAfter === null) {
      toast({
        title: "Évaluation requise",
        description: "Veuillez évaluer votre niveau de craving après l'exercice.",
        variant: "destructive",
      });
      return;
    }

    createSessionMutation.mutate({
      userId: DEMO_USER_ID,
      exerciseId: exercise.id,
      duration: timeElapsed,
      completed: true,
      cratingBefore: cravingBefore,
      cravingAfter: cravingAfter,
    });

    toast({
      title: "Session enregistrée",
      description: "Merci d'avoir complété cet exercice !",
    });

    // Navigate back to exercises
    window.location.href = "/exercises";
  };

  const nextStep = () => {
    const instructions = exercise.instructions ? exercise.instructions.split('\n').filter(Boolean) : [];
    if (currentStep < instructions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      stopExercise();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getLevelBadgeColor = (level: keyof typeof levels) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const instructions = exercise.instructions ? exercise.instructions.split('\n').filter(Boolean) : [];
  const stepProgress = instructions.length > 0 ? ((currentStep + 1) / instructions.length) * 100 : 0;
  const expectedDuration = (exercise.duration || 10) * 60; // Convert to seconds

  return (
    <>
      <Navigation />
      <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
        
        {/* Exercise Header */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link to="/exercises" className="flex items-center text-primary hover:text-primary/80">
              <span className="material-icons mr-1">arrow_back</span>
              Retour aux exercices
            </Link>
            <Badge className={getLevelBadgeColor(exercise.difficulty as keyof typeof levels)}>
              {levels[exercise.difficulty as keyof typeof levels] || exercise.difficulty}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h1 className="text-3xl font-bold text-foreground mb-4" data-testid="title-exercise">
                {exercise.title}
              </h1>
              <p className="text-lg text-muted-foreground mb-6" data-testid="description-exercise">
                {exercise.description || "Description non disponible"}
              </p>
              
              {/* Exercise Info */}
              <div className="flex items-center space-x-6 text-sm text-muted-foreground mb-6">
                <div className="flex items-center">
                  <span className="material-icons text-base mr-1">schedule</span>
                  <span>{exercise.duration || 10} minutes</span>
                </div>
                <div className="flex items-center">
                  <span className="material-icons text-base mr-1">fitness_center</span>
                  <span>Niveau {exercise.difficulty}</span>
                </div>
                <div className="flex items-center">
                  <span className="material-icons text-base mr-1">category</span>
                  <span>{exercise.category}</span>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <img 
                src={exercise.imageUrl || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200'} 
                alt={exercise.title}
                className="w-full h-64 object-cover rounded-xl shadow-material"
                data-testid="img-exercise"
              />
            </div>
          </div>
        </section>

        {/* Pre-Exercise Evaluation */}
        {!isRunning && !showCravingAfter && (
          <section className="mb-8">
            <Card className="shadow-material" data-testid="card-pre-evaluation">
              <CardHeader>
                <CardTitle>Évaluation Pré-Exercice</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Sur une échelle de 0 à 10, quel est votre niveau de craving actuel ?
                  </label>
                  <input 
                    type="range" 
                    min="0" 
                    max="10" 
                    value={cravingBefore || 5}
                    onChange={(e) => setCravingBefore(Number(e.target.value))}
                    className="w-full h-2 craving-slider rounded-lg cursor-pointer"
                    data-testid="slider-craving-before"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0 - Aucun</span>
                    <span className="font-bold text-primary">{cravingBefore || 5}</span>
                    <span>10 - Très intense</span>
                  </div>
                </div>
                <Button 
                  onClick={startExercise}
                  className="w-full"
                  disabled={cravingBefore === null}
                  data-testid="button-start-exercise"
                >
                  Démarrer l'Exercice
                </Button>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Exercise Progress */}
        {isRunning && (
          <section className="mb-8">
            <Card className="shadow-material" data-testid="card-exercise-progress">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Exercice en cours</span>
                  <span className="text-2xl font-bold text-primary" data-testid="text-timer">
                    {formatTime(timeElapsed)}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>Étape {currentStep + 1} sur {instructions.length}</span>
                    <span>{Math.round(stepProgress)}%</span>
                  </div>
                  <Progress value={stepProgress} className="h-2" data-testid="progress-steps" />
                </div>

                {/* Current Instruction */}
                <Card className="bg-accent/50">
                  <CardContent className="p-4">
                    <h3 className="font-medium text-foreground mb-2">
                      Étape {currentStep + 1}
                    </h3>
                    <p className="text-foreground" data-testid="text-current-instruction">
                      {instructions[currentStep] || "Suivez l'exercice selon vos capacités"}
                    </p>
                  </CardContent>
                </Card>

                {/* Controls */}
                <div className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={stopExercise}
                    data-testid="button-stop-exercise"
                  >
                    Arrêter
                  </Button>
                  <Button 
                    onClick={nextStep}
                    data-testid="button-next-step"
                  >
                    {currentStep === instructions.length - 1 ? "Terminer" : "Suivant"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Post-Exercise Evaluation */}
        {showCravingAfter && (
          <section className="mb-8">
            <Card className="shadow-material" data-testid="card-post-evaluation">
              <CardHeader>
                <CardTitle>Évaluation Post-Exercice</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center mb-4">
                  <div className="text-6xl mb-4">🎉</div>
                  <h3 className="text-xl font-bold text-foreground">Félicitations !</h3>
                  <p className="text-muted-foreground">
                    Vous avez terminé l'exercice en {formatTime(timeElapsed)}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Quel est maintenant votre niveau de craving ?
                  </label>
                  <input 
                    type="range" 
                    min="0" 
                    max="10" 
                    value={cravingAfter || 5}
                    onChange={(e) => setCravingAfter(Number(e.target.value))}
                    className="w-full h-2 craving-slider rounded-lg cursor-pointer"
                    data-testid="slider-craving-after"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0 - Aucun</span>
                    <span className="font-bold text-secondary">{cravingAfter || 5}</span>
                    <span>10 - Très intense</span>
                  </div>
                </div>

                {cravingBefore !== null && cravingAfter !== null && (
                  <div className="bg-accent/30 rounded-lg p-4">
                    <h4 className="font-medium text-foreground mb-2">Votre amélioration</h4>
                    <div className="flex items-center justify-between">
                      <span>Avant: {cravingBefore}/10</span>
                      <span className="material-icons text-primary">arrow_forward</span>
                      <span>Après: {cravingAfter}/10</span>
                    </div>
                    {cravingBefore > cravingAfter && (
                      <p className="text-success text-sm mt-2 font-medium">
                        ✓ Réduction de {cravingBefore - cravingAfter} points !
                      </p>
                    )}
                  </div>
                )}

                <Button 
                  onClick={completeExercise}
                  className="w-full"
                  disabled={cravingAfter === null || createSessionMutation.isPending}
                  data-testid="button-complete-exercise"
                >
                  {createSessionMutation.isPending ? "Enregistrement..." : "Terminer la Session"}
                </Button>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Exercise Information */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Instructions */}
          <Card className="shadow-material" data-testid="card-instructions">
            <CardHeader>
              <CardTitle>Instructions Détaillées</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {instructions.length > 0 ? instructions.map((instruction, index) => (
                  <li key={index} className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium mr-3">
                      {index + 1}
                    </span>
                    <span className="text-foreground">{instruction}</span>
                  </li>
                )) : (
                  <li className="text-muted-foreground">Aucune instruction détaillée disponible pour cet exercice.</li>
                )}
              </ol>
            </CardContent>
          </Card>

          {/* Benefits */}
          <Card className="shadow-material" data-testid="card-benefits">
            <CardHeader>
              <CardTitle>Bénéfices de cet Exercice</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {exercise.benefits ? exercise.benefits.split('\n').filter(Boolean).map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <span className="material-icons text-success mr-3 mt-0.5">check_circle</span>
                    <span className="text-foreground">{benefit}</span>
                  </li>
                )) : (
                  <li className="text-muted-foreground">Les bénéfices de cet exercice incluent une meilleure gestion du stress et une amélioration du bien-être.</li>
                )}
              </ul>
            </CardContent>
          </Card>
        </section>
      </main>
    </>
  );
}
