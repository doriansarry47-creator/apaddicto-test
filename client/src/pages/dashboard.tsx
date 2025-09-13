import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Navigation } from "@/components/navigation";
import { CravingEntry } from "@/components/craving-entry";
import { BeckColumn } from "@/components/beck-column";
import { StrategiesBox } from "@/components/strategies-box";
import { GamificationProgress } from "@/components/gamification-progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuthQuery } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { getEmergencyExercises } from "@/lib/exercises-data";
import type { User, UserStats, ExerciseSession } from "@shared/schema";

interface CravingStats {
  average: number;
  trend: number;
}

export default function Dashboard() {
  const [showCravingEntry, setShowCravingEntry] = useState(false);
  const [showBeckColumn, setShowBeckColumn] = useState(false);
  const [showStrategiesBox, setShowStrategiesBox] = useState(false);
  const { toast } = useToast();
  
  // Récupérer l'utilisateur authentifié
  const { data: authenticatedUser, isLoading } = useAuthQuery();

  const { data: cravingStats } = useQuery<CravingStats>({
    queryKey: ["/api/cravings/stats"],
    queryFn: async () => {
      const response = await fetch("/api/cravings/stats");
      if (!response.ok) throw new Error("Failed to fetch craving stats");
      return response.json();
    },
    enabled: !!authenticatedUser,
    initialData: { average: 0, trend: 0 },
  });

  const { data: userStats } = useQuery<UserStats>({
    queryKey: ["/api/users/stats"],
    queryFn: async () => {
      const response = await fetch("/api/users/stats");
      if (!response.ok) throw new Error("Failed to fetch user stats");
      return response.json();
    },
    enabled: !!authenticatedUser,
    initialData: { exercisesCompleted: 0, totalDuration: 0, currentStreak: 0, longestStreak: 0, averageCraving: 0, id: '', userId: '', updatedAt: new Date() },
  });

  const { data: exerciseSessions } = useQuery<any[]>({
    queryKey: ["/api/exercise-sessions/detailed"],
    queryFn: async () => {
      const response = await fetch("/api/exercise-sessions/detailed?limit=5");
      if (!response.ok) throw new Error("Failed to fetch exercise sessions");
      return response.json();
    },
    enabled: !!authenticatedUser,
    initialData: [],
  });

  // Pas besoin de requête séparée pour user, nous avons déjà authenticatedUser
  const user = authenticatedUser;

  const startEmergencyRoutine = () => {
    const emergencyExercises = getEmergencyExercises();
    if (emergencyExercises.length > 0) {
      // Navigate to the first emergency exercise
      window.location.href = `/exercise/${emergencyExercises[0].id}`;
    }
  };

  const todayCravingLevel = cravingStats?.average || 0;
  const cravingTrend = cravingStats?.trend || 0;
  const exercisesCompleted = userStats?.exercisesCompleted || 0;
  const userLevel = 1; // Par défaut niveau 1, peut être étendu avec la gamification

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Navigation />
      <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
        {/* Hero Section - Page d'accueil personnalisée */}
        <section className="text-center mb-12 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-primary mb-4">
              Bienvenue dans Apaddicto
            </h1>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="flex items-center gap-2 text-lg">
                <span className="material-icons text-primary">fitness_center</span>
                <span>Exercices ciblés</span>
              </div>
              <div className="flex items-center gap-2 text-lg">
                <span className="material-icons text-secondary">psychology</span>
                <span>Suivi personnalisé</span>
              </div>
              <div className="flex items-center gap-2 text-lg">
                <span className="material-icons text-warning">emoji_events</span>
                <span>Motivation quotidienne</span>
              </div>
            </div>
            {user && (
              <div className="mt-6 p-4 bg-primary/10 rounded-lg">
                <p className="text-lg font-medium">Bonjour {user.firstName || 'Champion'} ! 👋</p>
                <p className="text-muted-foreground">Prêt(e) à continuer votre parcours de rétablissement ?</p>
              </div>
            )}
          </div>
        </section>
        
        {/* Dashboard Overview Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Today's Craving Level */}
          <Card className="shadow-material" data-testid="card-craving-level">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-foreground">Niveau de Craving Aujourd'hui</h3>
                <span className="material-icons text-primary">trending_down</span>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-foreground" data-testid="text-today-craving">
                    {Math.round(todayCravingLevel)}
                  </span>
                  <span className="text-sm text-muted-foreground">/10</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full craving-slider rounded-full transition-all duration-300" 
                    style={{ width: `${(todayCravingLevel / 10) * 100}%` }}
                    data-testid="progress-craving-level"
                  ></div>
                </div>
                <p className={`text-sm font-medium ${cravingTrend < 0 ? 'text-success' : 'text-warning'}`}>
                  {cravingTrend < 0 ? '↓' : '↑'} {Math.abs(Math.round(cravingTrend))}% depuis hier
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Progress */}
          <Card className="shadow-material" data-testid="card-weekly-progress">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-foreground">Progrès Cette Semaine</h3>
                <span className="material-icons text-secondary">bar_chart</span>
              </div>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-secondary" data-testid="text-exercises-completed">
                    {exercisesCompleted}
                  </div>
                  <div className="text-sm text-muted-foreground">exercices complétés</div>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <span className="material-icons text-warning text-lg">emoji_events</span>
                  <span className="text-sm font-medium text-foreground">
                    Niveau {userLevel}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Action */}
          <Card className="bg-gradient-to-br from-destructive to-red-600 shadow-material text-destructive-foreground" data-testid="card-emergency">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Routine d'Urgence</h3>
                <span className="material-icons">emergency</span>
              </div>
              <p className="text-sm mb-4 opacity-90">Ressens-tu un craving intense maintenant?</p>
              <Button 
                onClick={startEmergencyRoutine}
                className="w-full bg-white text-destructive font-medium hover:bg-gray-50"
                data-testid="button-emergency-routine"
              >
                Démarrer Routine 3 min
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Quick Actions */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-material" data-testid="card-quick-craving">
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="material-icons mr-2 text-primary">psychology</span>
                Enregistrement Rapide
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Comment vous sentez-vous maintenant ?
              </p>
              <Button 
                onClick={() => setShowCravingEntry(!showCravingEntry)}
                className="w-full"
                data-testid="button-toggle-craving"
              >
                {showCravingEntry ? "Masquer" : "Enregistrer un Craving"}
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-material" data-testid="card-quick-beck">
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="material-icons mr-2 text-secondary">psychology</span>
                Analyse Cognitive
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Analysez une situation difficile
              </p>
              <Button 
                onClick={() => setShowBeckColumn(!showBeckColumn)}
                variant="secondary"
                className="w-full"
                data-testid="button-toggle-beck"
              >
                {showBeckColumn ? "Masquer" : "Démarrer Analyse Beck"}
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-material" data-testid="card-quick-strategies">
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="material-icons mr-2 text-warning">fitness_center</span>
                Boîte à Stratégies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Testez et évaluez vos stratégies anti-craving
              </p>
              <Button 
                onClick={() => setShowStrategiesBox(!showStrategiesBox)}
                variant="outline"
                className="w-full"
                data-testid="button-toggle-strategies"
              >
                {showStrategiesBox ? "Masquer" : "Ouvrir Boîte à Stratégies"}
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Conditional Forms */}
        {showCravingEntry && authenticatedUser && (
          <section className="mb-8">
            <CravingEntry 
              userId={authenticatedUser.id} 
              onSuccess={() => {
                setShowCravingEntry(false);
                toast({
                  title: "Craving enregistré",
                  description: "Merci d'avoir partagé votre ressenti.",
                });
              }}
            />
          </section>
        )}

        {showBeckColumn && authenticatedUser && (
          <section className="mb-8">
            <BeckColumn 
              userId={authenticatedUser.id}
              onSuccess={() => {
                setShowBeckColumn(false);
                toast({
                  title: "Analyse sauvegardée",
                  description: "Votre réflexion a été enregistrée.",
                });
              }}
            />
          </section>
        )}

        {showStrategiesBox && authenticatedUser && (
          <section className="mb-8">
            <StrategiesBox 
              userId={authenticatedUser.id}
              onSuccess={() => {
                setShowStrategiesBox(false);
                toast({
                  title: "Stratégies sauvegardées",
                  description: "Vos stratégies anti-craving ont été enregistrées dans l'onglet Suivi.",
                });
              }}
            />
          </section>
        )}

        {/* Quick Access to Exercises */}
        <section className="mb-8">
          <Card className="shadow-material" data-testid="card-exercise-shortcuts">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="material-icons mr-2 text-primary">fitness_center</span>
                  Exercices Recommandés
                </div>
                <Link to="/exercises" className="text-primary hover:text-primary/80 font-medium text-sm">
                  Voir tout
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link to="/exercises?category=craving" className="w-full">
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 w-full" data-testid="button-craving-exercises">
                    <span className="material-icons text-destructive">emergency</span>
                    <div className="text-center">
                      <div className="font-medium">Réduction Craving</div>
                      <div className="text-xs text-muted-foreground">Exercices ciblés</div>
                    </div>
                  </Button>
                </Link>
                
                <Link to="/exercises?category=breathing" className="w-full">
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 w-full" data-testid="button-breathing-exercises">
                    <span className="material-icons text-secondary">air</span>
                    <div className="text-center">
                      <div className="font-medium">Respiration</div>
                      <div className="text-xs text-muted-foreground">Techniques guidées</div>
                    </div>
                  </Button>
                </Link>
                
                <Link to="/exercises?category=relaxation" className="w-full">
                  <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 w-full" data-testid="button-relaxation-exercises">
                    <span className="material-icons text-primary">self_improvement</span>
                    <div className="text-center">
                      <div className="font-medium">Relaxation</div>
                      <div className="text-xs text-muted-foreground">Détente profonde</div>
                    </div>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Recent Activities Section */}
        {exerciseSessions && exerciseSessions.length > 0 && (
          <section className="mb-8">
            <Card className="shadow-material">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="material-icons mr-2 text-secondary">history</span>
                  Dernières Activités
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {exerciseSessions.slice(0, 3).map((session: any) => (
                    <div key={session.id} className="flex items-center justify-between p-3 bg-secondary/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="material-icons text-secondary">fitness_center</span>
                        <div>
                          <div className="font-medium">{session.exerciseTitle || 'Exercice'}</div>
                          <div className="text-xs text-muted-foreground">
                            {session.duration ? `${Math.round(session.duration / 60)} minutes` : ''}
                            {session.cravingBefore !== null && session.cravingAfter !== null && 
                              ` • Craving: ${session.cravingBefore} → ${session.cravingAfter}`
                            }
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(session.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Gamification Progress */}
        {authenticatedUser && <GamificationProgress userId={authenticatedUser.id} />}
      </main>

      {/* Floating Emergency Button */}
      <Button
        onClick={startEmergencyRoutine}
        className="fab bg-destructive text-destructive-foreground w-14 h-14 rounded-full shadow-material-lg hover:shadow-xl transition-all"
        data-testid="button-fab-emergency"
      >
        <span className="material-icons">emergency</span>
      </Button>
    </>
  );
}
