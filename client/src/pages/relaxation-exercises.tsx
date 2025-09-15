import React, { useState } from 'react';
import { Navigation } from '@/components/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Heart, Square, Triangle, Sparkles, Clock, User } from 'lucide-react';

import HeartCoherenceExercise from '@/components/interactive-exercises/HeartCoherenceExercise';
import SquareBreathingExercise from '@/components/interactive-exercises/SquareBreathingExercise';
import TriangleBreathingExercise from '@/components/interactive-exercises/TriangleBreathingExercise';

export default function RelaxationExercises() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('heart-coherence');
  const [preExerciseRating, setPreExerciseRating] = useState<number | null>(null);
  const [postExerciseRating, setPostExerciseRating] = useState<number | null>(null);
  const [showPostEvaluation, setShowPostEvaluation] = useState(false);
  const [completedExercise, setCompletedExercise] = useState<{
    type: string;
    duration: number;
  } | null>(null);

  // Mutation pour enregistrer la session
  const createSessionMutation = useMutation({
    mutationFn: async (sessionData: {
      exerciseType: string;
      duration: number;
      cravingBefore: number;
      cravingAfter: number;
    }) => {
      // Créer un exercice personnalisé dans la base de données
      const exerciseResponse = await apiRequest("POST", "/api/exercises", {
        title: getExerciseTitle(sessionData.exerciseType),
        category: "relaxation",
        difficulty: "beginner",
        duration: Math.ceil(sessionData.duration / 60),
        description: getExerciseDescription(sessionData.exerciseType),
        instructions: getExerciseInstructions(sessionData.exerciseType),
        benefits: getExerciseBenefits(sessionData.exerciseType),
      });

      const exercise = await exerciseResponse.json();

      // Enregistrer la session d'exercice
      return apiRequest("POST", "/api/exercise-sessions", {
        exerciseId: exercise.id,
        duration: Math.floor(sessionData.duration),
        completed: true,
        cravingBefore: sessionData.cravingBefore,
        cravingAfter: sessionData.cravingAfter,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exercise-sessions"] });
      toast({
        title: "Session enregistrée",
        description: "Votre session de relaxation a été enregistrée avec succès !",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error?.message ?? "Impossible d'enregistrer la session",
        variant: "destructive",
      });
    },
  });

  // Informations sur les exercices
  const getExerciseTitle = (type: string) => {
    switch (type) {
      case 'heart-coherence':
        return 'Cohérence Cardiaque Guidée';
      case 'square-breathing':
        return 'Respiration Carrée Guidée';
      case 'triangle-breathing':
        return 'Respiration Triangle Guidée';
      default:
        return 'Exercice de Relaxation';
    }
  };

  const getExerciseDescription = (type: string) => {
    switch (type) {
      case 'heart-coherence':
        return 'Exercice de cohérence cardiaque avec animation guidée pour synchroniser votre respiration et votre rythme cardiaque.';
      case 'square-breathing':
        return 'Technique de respiration carrée avec visualisation pour calmer l\'esprit et réduire le stress.';
      case 'triangle-breathing':
        return 'Exercice de respiration triangulaire pour équilibrer votre système nerveux et favoriser la relaxation.';
      default:
        return 'Exercice interactif de relaxation guidée.';
    }
  };

  const getExerciseInstructions = (type: string) => {
    switch (type) {
      case 'heart-coherence':
        return 'Suivez le mouvement de la balle qui grandit et rétrécit. Inspirez quand elle grandit, expirez quand elle rétrécit. Maintenez un rythme régulier.';
      case 'square-breathing':
        return 'Suivez la balle le long du carré. Inspirez sur le côté gauche, retenez en haut, expirez sur le côté droit, pausez en bas.';
      case 'triangle-breathing':
        return 'Suivez la balle le long du triangle. Inspirez en montant, retenez sur le côté, expirez en descendant.';
      default:
        return 'Suivez les instructions visuelles et respirez calmement.';
    }
  };

  const getExerciseBenefits = (type: string) => {
    const commonBenefits = [
      'Réduction du stress et de l\'anxiété',
      'Amélioration de la concentration',
      'Diminution du rythme cardiaque',
      'Activation du système nerveux parasympathique'
    ];

    switch (type) {
      case 'heart-coherence':
        return [
          ...commonBenefits,
          'Synchronisation du rythme cardiaque',
          'Amélioration de la variabilité cardiaque'
        ].join(', ');
      case 'square-breathing':
        return [
          ...commonBenefits,
          'Amélioration du contrôle respiratoire',
          'Stabilisation de l\'humeur'
        ].join(', ');
      case 'triangle-breathing':
        return [
          ...commonBenefits,
          'Équilibrage du système nerveux',
          'Amélioration de la qualité du sommeil'
        ].join(', ');
      default:
        return commonBenefits.join(', ');
    }
  };

  // Gestion du début d'exercice
  const handleExerciseStart = () => {
    if (preExerciseRating === null) {
      toast({
        title: "Évaluation requise",
        description: "Veuillez d'abord évaluer votre niveau de stress actuel.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  // Gestion de la fin d'exercice
  const handleExerciseComplete = (duration: number) => {
    setCompletedExercise({
      type: activeTab,
      duration
    });
    setShowPostEvaluation(true);
    
    toast({
      title: "Exercice terminé !",
      description: `Félicitations ! Vous avez terminé votre session en ${Math.floor(duration / 60)}:${String(Math.floor(duration % 60)).padStart(2, '0')}.`,
    });
  };

  // Finaliser la session
  const handleCompleteSession = () => {
    if (postExerciseRating === null || !completedExercise) {
      toast({
        title: "Évaluation requise",
        description: "Veuillez évaluer votre niveau de stress après l'exercice.",
        variant: "destructive",
      });
      return;
    }

    createSessionMutation.mutate({
      exerciseType: completedExercise.type,
      duration: completedExercise.duration,
      cravingBefore: preExerciseRating!,
      cravingAfter: postExerciseRating
    });

    // Reset state
    setShowPostEvaluation(false);
    setCompletedExercise(null);
    setPreExerciseRating(null);
    setPostExerciseRating(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <>
      <Navigation />
      <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
        {/* Header */}
        <section className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">
              Exercices de Relaxation
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Découvrez nos exercices de respiration interactifs pour réduire le stress, 
            améliorer votre bien-être et retrouver votre calme intérieur.
          </p>
        </section>

        {/* Évaluation pré-exercice */}
        {!showPostEvaluation && (
          <Card className="mb-8 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Évaluation Pré-Exercice
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Sur une échelle de 0 à 10, quel est votre niveau de stress/anxiété actuel ?
                </label>
                <input 
                  type="range" 
                  min="0" 
                  max="10" 
                  value={preExerciseRating || 5}
                  onChange={(e) => setPreExerciseRating(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>0 - Très calme</span>
                  <span className="font-bold text-primary">{preExerciseRating || 5}</span>
                  <span>10 - Très stressé</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Évaluation post-exercice */}
        {showPostEvaluation && completedExercise && (
          <Card className="mb-8 border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-green-600" />
                Session Terminée !
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-xl font-bold text-foreground">Félicitations !</h3>
                <p className="text-muted-foreground">
                  Vous avez terminé votre session de {getExerciseTitle(completedExercise.type)} 
                  en {formatTime(completedExercise.duration)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Comment vous sentez-vous maintenant ? (niveau de stress/anxiété)
                </label>
                <input 
                  type="range" 
                  min="0" 
                  max="10" 
                  value={postExerciseRating || 5}
                  onChange={(e) => setPostExerciseRating(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>0 - Très calme</span>
                  <span className="font-bold text-secondary">{postExerciseRating || 5}</span>
                  <span>10 - Très stressé</span>
                </div>
              </div>

              {preExerciseRating !== null && postExerciseRating !== null && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <h4 className="font-medium text-foreground mb-2">Votre amélioration</h4>
                  <div className="flex items-center justify-between">
                    <span>Avant: {preExerciseRating}/10</span>
                    <span className="text-green-600">→</span>
                    <span>Après: {postExerciseRating}/10</span>
                  </div>
                  {preExerciseRating > postExerciseRating && (
                    <p className="text-green-600 text-sm mt-2 font-medium">
                      ✓ Réduction de {preExerciseRating - postExerciseRating} points !
                    </p>
                  )}
                </div>
              )}

              <Button 
                onClick={handleCompleteSession}
                className="w-full"
                disabled={postExerciseRating === null || createSessionMutation.isPending}
              >
                {createSessionMutation.isPending ? "Enregistrement..." : "Enregistrer la Session"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Exercices interactifs */}
        {!showPostEvaluation && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="heart-coherence" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                <span className="hidden sm:inline">Cohérence Cardiaque</span>
                <span className="sm:hidden">Cardiaque</span>
              </TabsTrigger>
              <TabsTrigger value="square-breathing" className="flex items-center gap-2">
                <Square className="h-4 w-4" />
                <span className="hidden sm:inline">Respiration Carrée</span>
                <span className="sm:hidden">Carrée</span>
              </TabsTrigger>
              <TabsTrigger value="triangle-breathing" className="flex items-center gap-2">
                <Triangle className="h-4 w-4" />
                <span className="hidden sm:inline">Respiration Triangle</span>
                <span className="sm:hidden">Triangle</span>
              </TabsTrigger>
            </TabsList>

            {/* Description des exercices */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className={`${activeTab === 'heart-coherence' ? 'ring-2 ring-red-500 bg-red-50 dark:bg-red-900/10' : ''}`}>
                <CardContent className="p-4 text-center">
                  <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <h3 className="font-semibold">Cohérence Cardiaque</h3>
                  <p className="text-sm text-muted-foreground">
                    Synchronise votre respiration avec votre rythme cardiaque pour un équilibre optimal.
                  </p>
                  <Badge variant="outline" className="mt-2">
                    <Clock className="h-3 w-3 mr-1" />
                    5-10 min
                  </Badge>
                </CardContent>
              </Card>

              <Card className={`${activeTab === 'square-breathing' ? 'ring-2 ring-indigo-500 bg-indigo-50 dark:bg-indigo-900/10' : ''}`}>
                <CardContent className="p-4 text-center">
                  <Square className="h-8 w-8 text-indigo-500 mx-auto mb-2" />
                  <h3 className="font-semibold">Respiration Carrée</h3>
                  <p className="text-sm text-muted-foreground">
                    Technique de respiration structurée avec 4 phases pour calmer l'esprit.
                  </p>
                  <Badge variant="outline" className="mt-2">
                    <Clock className="h-3 w-3 mr-1" />
                    3-8 min
                  </Badge>
                </CardContent>
              </Card>

              <Card className={`${activeTab === 'triangle-breathing' ? 'ring-2 ring-emerald-500 bg-emerald-50 dark:bg-emerald-900/10' : ''}`}>
                <CardContent className="p-4 text-center">
                  <Triangle className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                  <h3 className="font-semibold">Respiration Triangle</h3>
                  <p className="text-sm text-muted-foreground">
                    Respiration à 3 phases pour équilibrer le système nerveux.
                  </p>
                  <Badge variant="outline" className="mt-2">
                    <Clock className="h-3 w-3 mr-1" />
                    4-10 min
                  </Badge>
                </CardContent>
              </Card>
            </div>

            {/* Exercices */}
            <TabsContent value="heart-coherence">
              <HeartCoherenceExercise
                onStart={() => handleExerciseStart()}
                onComplete={handleExerciseComplete}
              />
            </TabsContent>

            <TabsContent value="square-breathing">
              <SquareBreathingExercise
                onStart={() => handleExerciseStart()}
                onComplete={handleExerciseComplete}
              />
            </TabsContent>

            <TabsContent value="triangle-breathing">
              <TriangleBreathingExercise
                onStart={() => handleExerciseStart()}
                onComplete={handleExerciseComplete}
              />
            </TabsContent>
          </Tabs>
        )}

        {/* Informations et conseils */}
        {!showPostEvaluation && (
          <section className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-500" />
                  Conseils pour une pratique optimale
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-sm">Trouvez un endroit calme et confortable</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-sm">Adoptez une posture droite mais détendue</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-sm">Respirez par le nez si possible</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-sm">Pratiquez régulièrement pour de meilleurs résultats</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  Bénéfices de la respiration guidée
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span className="text-sm">Réduction du stress et de l'anxiété</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span className="text-sm">Amélioration de la concentration</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span className="text-sm">Meilleure gestion des émotions</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span className="text-sm">Amélioration de la qualité du sommeil</span>
                </div>
              </CardContent>
            </Card>
          </section>
        )}
      </main>
    </>
  );
}