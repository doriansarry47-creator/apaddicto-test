import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useAuthQuery } from "@/hooks/use-auth";
import type { CravingEntry, ExerciseSession, BeckAnalysis, UserStats, AntiCravingStrategy } from "@shared/schema";

interface CravingStats {
  average: number;
  trend: number;
}

export default function Tracking() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');
  
  // Récupérer l'utilisateur authentifié
  const { data: authenticatedUser, isLoading: userLoading } = useAuthQuery();

  const { data: cravingEntries, isLoading: cravingLoading } = useQuery<CravingEntry[]>({
    queryKey: ["/api/cravings"],
    queryFn: async () => {
      const response = await fetch("/api/cravings");
      if (!response.ok) throw new Error("Failed to fetch cravings");
      return response.json();
    },
    enabled: !!authenticatedUser,
    initialData: [],
  });

  const { data: cravingStats, isLoading: statsLoading } = useQuery<CravingStats>({
    queryKey: ["/api/cravings/stats"],
    queryFn: async () => {
      const response = await fetch("/api/cravings/stats");
      if (!response.ok) throw new Error("Failed to fetch craving stats");
      return response.json();
    },
    enabled: !!authenticatedUser,
    initialData: { average: 0, trend: 0 },
  });

  const { data: exerciseSessions, isLoading: sessionsLoading } = useQuery<any[]>({
    queryKey: ["/api/exercise-sessions/detailed"],
    queryFn: async () => {
      const response = await fetch("/api/exercise-sessions/detailed");
      if (!response.ok) throw new Error("Failed to fetch exercise sessions");
      return response.json();
    },
    enabled: !!authenticatedUser,
    initialData: [],
  });

  const { data: userStats, isLoading: userStatsLoading } = useQuery<UserStats>({
    queryKey: ["/api/users/stats"],
    queryFn: async () => {
      const response = await fetch("/api/users/stats");
      if (!response.ok) throw new Error("Failed to fetch user stats");
      return response.json();
    },
    enabled: !!authenticatedUser,
    initialData: { exercisesCompleted: 0, totalDuration: 0, currentStreak: 0, longestStreak: 0, averageCraving: 0, id: '', userId: '', updatedAt: new Date() },
  });

  const { data: beckAnalyses, isLoading: beckLoading } = useQuery<BeckAnalysis[]>({
    queryKey: ["/api/beck-analyses"],
    queryFn: async () => {
      const response = await fetch("/api/beck-analyses");
      if (!response.ok) throw new Error("Failed to fetch beck analyses");
      return response.json();
    },
    enabled: !!authenticatedUser,
    initialData: [],
  });

  const { data: antiCravingStrategies, isLoading: strategiesLoading } = useQuery<AntiCravingStrategy[]>({
    queryKey: ["/api/strategies"],
    queryFn: async () => {
      const response = await fetch("/api/strategies", {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        console.error(`Erreur API strategies: ${response.status} ${response.statusText}`);
        throw new Error("Failed to fetch strategies");
      }
      return response.json();
    },
    enabled: !!authenticatedUser,
    initialData: [],
  });

  const isLoading = userLoading || cravingLoading || statsLoading || sessionsLoading || userStatsLoading || beckLoading || strategiesLoading;

  if (isLoading) {
    return (
      <>
        <Navigation />
        <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
          <div className="space-y-6">
            <div className="h-8 bg-muted rounded w-1/3 animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
                    <div className="h-8 bg-muted rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </>
    );
  }

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTriggerColor = (trigger: string) => {
    const colors = {
      'Stress': 'bg-red-100 text-red-800',
      'Ennui': 'bg-yellow-100 text-yellow-800',
      'Solitude': 'bg-blue-100 text-blue-800',
      'Conflit': 'bg-purple-100 text-purple-800',
      'Fatigue': 'bg-gray-100 text-gray-800',
      'Frustration': 'bg-orange-100 text-orange-800'
    };
    return colors[trigger as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const averageCraving = cravingStats?.average || 0;
  const cravingTrend = cravingStats?.trend || 0;
  const totalExercises = userStats?.exercisesCompleted || 0;
  const totalDuration = userStats?.totalDuration || 0;

  return (
    <>
      <Navigation />
      <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
        
        {/* Page Header */}
        <section className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Suivi de Votre Progression</h1>
          <p className="text-muted-foreground">
            Analysez votre évolution et identifiez les patterns qui vous aident.
          </p>
        </section>

        {/* Key Statistics */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-material" data-testid="card-avg-craving">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Craving Moyen</span>
                <span className="material-icons text-primary">psychology</span>
              </div>
              <div className="text-2xl font-bold text-foreground" data-testid="text-avg-craving">
                {averageCraving.toFixed(1)}/10
              </div>
              <div className="w-full mt-2">
                <Progress value={(averageCraving / 10) * 100} className="h-2" />
              </div>
              <p className={`text-xs mt-2 ${cravingTrend < 0 ? 'text-success' : 'text-warning'}`}>
                {cravingTrend < 0 ? '↓' : '↑'} {Math.abs(cravingTrend).toFixed(1)}% ce mois
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-material" data-testid="card-total-exercises">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Exercices Complétés</span>
                <span className="material-icons text-secondary">fitness_center</span>
              </div>
              <div className="text-2xl font-bold text-foreground" data-testid="text-total-exercises">
                {totalExercises}
              </div>
              <p className="text-xs text-muted-foreground">
                {Math.round(totalDuration / 60)} minutes au total
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-material" data-testid="card-current-streak">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Série Actuelle</span>
                <span className="material-icons text-warning">local_fire_department</span>
              </div>
              <div className="text-2xl font-bold text-foreground" data-testid="text-current-streak">
                {userStats?.currentStreak || 0}
              </div>
              <p className="text-xs text-muted-foreground">jours consécutifs</p>
            </CardContent>
          </Card>

          <Card className="shadow-material" data-testid="card-best-streak">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Meilleure Série</span>
                <span className="material-icons text-destructive">emoji_events</span>
              </div>
              <div className="text-2xl font-bold text-foreground" data-testid="text-best-streak">
                {userStats?.longestStreak || 0}
              </div>
              <p className="text-xs text-muted-foreground">record personnel</p>
            </CardContent>
          </Card>
        </section>

        {/* Summary Dashboard */}
        <section className="mb-8">
          <Card className="shadow-material">
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="material-icons mr-2 text-primary">dashboard</span>
                Tableau de Bord - Résumé de Vos Activités
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-primary/10 rounded-lg">
                  <div className="text-2xl font-bold text-primary mb-2">{cravingEntries?.length || 0}</div>
                  <div className="text-sm text-muted-foreground">Cravings Enregistrés</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Dernière entrée: {cravingEntries && cravingEntries.length > 0 ? formatDate(cravingEntries[0].createdAt) : 'Aucune'}
                  </div>
                </div>
                <div className="text-center p-4 bg-secondary/10 rounded-lg">
                  <div className="text-2xl font-bold text-secondary mb-2">{beckAnalyses?.length || 0}</div>
                  <div className="text-sm text-muted-foreground">Analyses Beck</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Dernière analyse: {beckAnalyses && beckAnalyses.length > 0 ? formatDate(beckAnalyses[0].createdAt) : 'Aucune'}
                  </div>
                </div>
                <div className="text-center p-4 bg-warning/10 rounded-lg">
                  <div className="text-2xl font-bold text-warning mb-2">{antiCravingStrategies?.length || 0}</div>
                  <div className="text-sm text-muted-foreground">Stratégies Testées</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {antiCravingStrategies && antiCravingStrategies.length > 0 && (() => {
                      const avg = antiCravingStrategies.reduce((sum, s) => sum + (s.cravingBefore - s.cravingAfter), 0) / antiCravingStrategies.length;
                      return `Efficacité moyenne: ${avg > 0 ? '+' : ''}${avg.toFixed(1)} points`;
                    })()} 
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Detailed Tracking */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5" data-testid="tabs-tracking">
            <TabsTrigger value="overview" data-testid="tab-overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="cravings" data-testid="tab-cravings">Cravings</TabsTrigger>
            <TabsTrigger value="exercises" data-testid="tab-exercises">Exercices</TabsTrigger>
            <TabsTrigger value="analyses" data-testid="tab-analyses">Analyses</TabsTrigger>
            <TabsTrigger value="strategies" data-testid="tab-strategies">Stratégies</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activities */}
              <Card className="shadow-material">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="material-icons mr-2 text-primary">history</span>
                    Activités Récentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Recent exercise sessions */}
                    {exerciseSessions?.slice(0, 3).map((session: any) => (
                      <div key={`session-${session.id}`} className="flex items-center justify-between p-2 bg-secondary/5 rounded">
                        <div className="flex items-center gap-2">
                          <span className="material-icons text-secondary text-sm">fitness_center</span>
                          <span className="text-sm">{session.exerciseTitle || 'Exercice'} complété</span>
                        </div>
                        <div className="text-xs text-muted-foreground">{formatDate(session.createdAt)}</div>
                      </div>
                    ))}
                    
                    {/* Recent craving entries */}
                    {cravingEntries?.slice(0, 3).map((entry: CravingEntry) => (
                      <div key={`craving-${entry.id}`} className="flex items-center justify-between p-2 bg-primary/5 rounded">
                        <div className="flex items-center gap-2">
                          <span className="material-icons text-primary text-sm">psychology</span>
                          <span className="text-sm">Craving enregistré (niveau {entry.intensity})</span>
                        </div>
                        <div className="text-xs text-muted-foreground">{formatDate(entry.createdAt)}</div>
                      </div>
                    ))}
                    
                    {/* Recent Beck analyses */}
                    {beckAnalyses?.slice(0, 2).map((analysis: BeckAnalysis) => (
                      <div key={`beck-${analysis.id}`} className="flex items-center justify-between p-2 bg-info/5 rounded">
                        <div className="flex items-center gap-2">
                          <span className="material-icons text-info text-sm">psychology</span>
                          <span className="text-sm">Analyse cognitive</span>
                        </div>
                        <div className="text-xs text-muted-foreground">{formatDate(analysis.createdAt)}</div>
                      </div>
                    ))}
                    
                    {/* Recent strategies */}
                    {antiCravingStrategies?.slice(0, 2).map((strategy: AntiCravingStrategy) => (
                      <div key={`strategy-${strategy.id}`} className="flex items-center justify-between p-2 bg-warning/5 rounded">
                        <div className="flex items-center gap-2">
                          <span className="material-icons text-warning text-sm">fitness_center</span>
                          <span className="text-sm">Stratégie testée</span>
                          {strategy.cravingBefore > strategy.cravingAfter && (
                            <Badge className="bg-success text-success-foreground text-xs">
                              -{strategy.cravingBefore - strategy.cravingAfter}
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">{formatDate(strategy.createdAt)}</div>
                      </div>
                    ))}
                    
                    {(!cravingEntries?.length && !beckAnalyses?.length && !antiCravingStrategies?.length && !exerciseSessions?.length) && (
                      <div className="text-center py-4 text-muted-foreground">
                        <span className="material-icons text-4xl mb-2">analytics</span>
                        <p>Aucune activité récente</p>
                        <p className="text-xs">Commencez à utiliser les outils depuis l'accueil</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {/* Progress Chart */}
              <Card className="shadow-material">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="material-icons mr-2 text-secondary">trending_down</span>
                    Évolution des Cravings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {cravingEntries && cravingEntries.length >= 2 ? (
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-foreground">
                          {(() => {
                            const recent = cravingEntries.slice(0, 5);
                            const older = cravingEntries.slice(5, 10);
                            const recentAvg = recent.reduce((sum, e) => sum + e.intensity, 0) / recent.length;
                            const olderAvg = older.length > 0 ? older.reduce((sum, e) => sum + e.intensity, 0) / older.length : recentAvg;
                            const improvement = olderAvg - recentAvg;
                            return improvement > 0 ? `-${improvement.toFixed(1)}` : `+${Math.abs(improvement).toFixed(1)}`;
                          })()} points
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {(() => {
                            const recent = cravingEntries.slice(0, 5);
                            const older = cravingEntries.slice(5, 10);
                            const recentAvg = recent.reduce((sum, e) => sum + e.intensity, 0) / recent.length;
                            const olderAvg = older.length > 0 ? older.reduce((sum, e) => sum + e.intensity, 0) / older.length : recentAvg;
                            const improvement = olderAvg - recentAvg;
                            return improvement > 0 ? 'Amélioration récente' : 'Stabilisation';
                          })()}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Dernières entrées (moyenne)</span>
                          <span className="font-medium">
                            {(() => {
                              const recent = cravingEntries.slice(0, 5);
                              return (recent.reduce((sum, e) => sum + e.intensity, 0) / recent.length).toFixed(1);
                            })()} / 10
                          </span>
                        </div>
                        <Progress 
                          value={(() => {
                            const recent = cravingEntries.slice(0, 5);
                            return (recent.reduce((sum, e) => sum + e.intensity, 0) / recent.length / 10) * 100;
                          })()} 
                          className="h-2"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <span className="material-icons text-4xl mb-2">show_chart</span>
                      <p>Pas assez de données</p>
                      <p className="text-xs">Enregistrez plus de cravings pour voir votre évolution</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Cravings Tab */}
          <TabsContent value="cravings" className="space-y-6">
            <Card className="shadow-material" data-testid="card-craving-history">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="material-icons mr-2 text-primary">timeline</span>
                  Historique des Cravings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cravingEntries && cravingEntries.length > 0 ? (
                  <div className="space-y-4">
                    {cravingEntries.map((entry: CravingEntry) => (
                      <div key={entry.id} className="border border-border rounded-lg p-4" data-testid={`craving-entry-${entry.id}`}>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm text-muted-foreground">
                            {formatDate(entry.createdAt)}
                          </span>
                          <div className="flex items-center">
                            <span className="text-sm font-medium mr-2">Intensité:</span>
                            <Badge variant={entry.intensity > 6 ? "destructive" : entry.intensity > 3 ? "secondary" : "default"}>
                              {entry.intensity}/10
                            </Badge>
                          </div>
                        </div>
                        
                        {entry.triggers && entry.triggers.length > 0 && (
                          <div className="mb-2">
                            <span className="text-xs font-medium text-muted-foreground">Déclencheurs:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {entry.triggers.map((trigger: string, index: number) => (
                                <Badge key={index} variant="outline" className={getTriggerColor(trigger)}>
                                  {trigger}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {entry.emotions && entry.emotions.length > 0 && (
                          <div className="mb-2">
                            <span className="text-xs font-medium text-muted-foreground">Émotions:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {entry.emotions.map((emotion: string, index: number) => (
                                <Badge key={index} variant="outline" className="bg-blue-100 text-blue-800">
                                  {emotion}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {entry.notes && (
                          <p className="text-sm text-foreground mt-2 italic">"{entry.notes}"</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8" data-testid="empty-cravings">
                    <span className="material-icons text-6xl text-muted-foreground mb-4">psychology</span>
                    <h3 className="text-lg font-medium text-foreground mb-2">Aucun craving enregistré</h3>
                    <p className="text-muted-foreground mb-4">Commencez à suivre vos cravings pour voir votre progression.</p>
                    <div className="bg-info/10 p-4 rounded-lg">
                      <p className="text-sm text-info font-medium mb-2">📊 Pourquoi enregistrer ?</p>
                      <p className="text-xs text-muted-foreground">
                        Le suivi de vos cravings vous aide à identifier les déclencheurs et à mesurer vos progrès au fil du temps.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Exercises Tab */}
          <TabsContent value="exercises" className="space-y-6">
            <Card className="shadow-material" data-testid="card-exercise-history">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="material-icons mr-2 text-secondary">fitness_center</span>
                  Historique des Exercices
                </CardTitle>
              </CardHeader>
              <CardContent>
                {exerciseSessions && exerciseSessions.length > 0 ? (
                  <div className="space-y-4">
                    {exerciseSessions.map((session: ExerciseSession) => (
                      <div key={session.id} className="border border-border rounded-lg p-4" data-testid={`exercise-session-${session.id}`}>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm text-muted-foreground">
                            {formatDate(session.createdAt)}
                          </span>
                          <div className="flex items-center space-x-2">
                            {session.completed && (
                              <Badge className="bg-success text-success-foreground">
                                <span className="material-icons text-sm mr-1">check_circle</span>
                                Complété
                              </Badge>
                            )}
                            {session.duration && (
                              <Badge variant="outline">
                                {Math.round(session.duration / 60)} min
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-sm font-medium text-foreground mb-2">
                          <div className="flex items-center gap-2">
                            <span>Exercice:</span>
                            <span className="font-bold">{session.exerciseTitle || session.exerciseId}</span>
                            {session.exerciseCategory && (
                              <Badge variant="outline" className="text-xs">
                                {session.exerciseCategory}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {session.cravingBefore !== null && session.cravingAfter !== null && (
                          <div className="flex items-center space-x-4 text-sm">
                            <span>Craving avant: <strong>{session.cravingBefore}/10</strong></span>
                            <span className="material-icons text-primary">arrow_forward</span>
                            <span>Craving après: <strong>{session.cravingAfter}/10</strong></span>
                            {session.cravingBefore > session.cravingAfter && (
                              <Badge className="bg-success text-success-foreground">
                                -{session.cravingBefore - session.cravingAfter} points
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8" data-testid="empty-exercises">
                    <span className="material-icons text-6xl text-muted-foreground mb-4">fitness_center</span>
                    <h3 className="text-lg font-medium text-foreground mb-2">Aucun exercice complété</h3>
                    <p className="text-muted-foreground mb-4">Complétez des exercices pour voir votre historique.</p>
                    <div className="bg-info/10 p-4 rounded-lg">
                      <p className="text-sm text-info font-medium mb-2">💪 Les exercices :</p>
                      <p className="text-xs text-muted-foreground">
                        Les exercices thérapeutiques vous aident à développer de nouvelles habitudes et à gérer vos cravings de manière proactive.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Beck Analyses Tab */}
          <TabsContent value="analyses" className="space-y-6">
            <Card className="shadow-material" data-testid="card-beck-history">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="material-icons mr-2 text-primary">psychology</span>
                  Analyses Cognitives (Beck)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {beckAnalyses && beckAnalyses.length > 0 ? (
                  <div className="space-y-6">
                    {beckAnalyses.map((analysis: BeckAnalysis) => (
                      <div key={analysis.id} className="border border-border rounded-lg p-4" data-testid={`beck-analysis-${analysis.id}`}>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm text-muted-foreground">
                            {formatDate(analysis.createdAt)}
                          </span>
                          {analysis.emotionIntensity && analysis.newIntensity && (
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-muted-foreground">Émotion:</span>
                              <Badge variant="outline">{analysis.emotionIntensity}/10</Badge>
                              <span className="material-icons text-sm text-primary">arrow_forward</span>
                              <Badge className="bg-secondary text-secondary-foreground">{analysis.newIntensity}/10</Badge>
                            </div>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <h4 className="font-medium text-foreground mb-1">Situation:</h4>
                            <p className="text-muted-foreground">{analysis.situation}</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-foreground mb-1">Pensées automatiques:</h4>
                            <p className="text-muted-foreground">{analysis.automaticThoughts}</p>
                          </div>
                          {analysis.rationalResponse && (
                            <div className="md:col-span-2">
                              <h4 className="font-medium text-foreground mb-1">Réponse rationnelle:</h4>
                              <p className="text-muted-foreground">{analysis.rationalResponse}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8" data-testid="empty-analyses">
                    <span className="material-icons text-6xl text-muted-foreground mb-4">psychology</span>
                    <h3 className="text-lg font-medium text-foreground mb-2">Aucune analyse cognitive</h3>
                    <p className="text-muted-foreground mb-4">Utilisez l'outil d'analyse Beck pour mieux comprendre vos pensées.</p>
                    <div className="bg-info/10 p-4 rounded-lg">
                      <p className="text-sm text-info font-medium mb-2">🧠 L'analyse de Beck :</p>
                      <p className="text-xs text-muted-foreground">
                        Cet outil vous aide à identifier et restructurer les pensées automatiques négatives qui peuvent déclencher vos cravings.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Strategies Tab */}
          <TabsContent value="strategies" className="space-y-6">
            <Card className="shadow-material" data-testid="card-strategies-history">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="material-icons mr-2 text-warning">fitness_center</span>
                  Historique des Stratégies Anti-Craving
                </CardTitle>
              </CardHeader>
              <CardContent>
                {antiCravingStrategies && antiCravingStrategies.length > 0 ? (
                  <div className="space-y-4">
                    {antiCravingStrategies.map((strategy: AntiCravingStrategy) => (
                      <div key={strategy.id} className="border border-border rounded-lg p-4" data-testid={`strategy-${strategy.id}`}>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm text-muted-foreground">
                            {formatDate(strategy.createdAt)}
                          </span>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="capitalize">
                              {strategy.context === 'leisure' ? 'Loisirs' : 
                               strategy.context === 'home' ? 'Domicile' : 'Travail'}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              {strategy.effort}
                            </Badge>
                            <Badge variant="outline">
                              {strategy.duration} min
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="text-sm font-medium text-foreground mb-2">
                          {strategy.exercise}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm">
                          <span>Craving avant: <strong className={`${strategy.cravingBefore > 6 ? 'text-destructive' : strategy.cravingBefore > 3 ? 'text-warning' : 'text-success'}`}>{strategy.cravingBefore}/10</strong></span>
                          <span className="material-icons text-primary">arrow_forward</span>
                          <span>Craving après: <strong className={`${strategy.cravingAfter > 6 ? 'text-destructive' : strategy.cravingAfter > 3 ? 'text-warning' : 'text-success'}`}>{strategy.cravingAfter}/10</strong></span>
                          {strategy.cravingBefore > strategy.cravingAfter && (
                            <Badge className="bg-success text-success-foreground">
                              <span className="material-icons text-sm mr-1">trending_down</span>
                              -{strategy.cravingBefore - strategy.cravingAfter} points
                            </Badge>
                          )}
                          {strategy.cravingBefore === strategy.cravingAfter && (
                            <Badge variant="outline">
                              <span className="material-icons text-sm mr-1">remove</span>
                              Stable
                            </Badge>
                          )}
                          {strategy.cravingBefore < strategy.cravingAfter && (
                            <Badge variant="destructive">
                              <span className="material-icons text-sm mr-1">trending_up</span>
                              +{strategy.cravingAfter - strategy.cravingBefore} points
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8" data-testid="empty-strategies">
                    <span className="material-icons text-6xl text-muted-foreground mb-4">fitness_center</span>
                    <h3 className="text-lg font-medium text-foreground mb-2">Aucune stratégie enregistrée</h3>
                    <p className="text-muted-foreground mb-4">Utilisez la Boîte à Stratégies depuis l'accueil pour commencer à tester vos techniques anti-craving.</p>
                    <div className="bg-info/10 p-4 rounded-lg">
                      <p className="text-sm text-info font-medium mb-2">💡 Conseil :</p>
                      <p className="text-xs text-muted-foreground">
                        Testez différentes stratégies dans différents contextes (domicile, travail, loisirs) pour construire votre boîte à outils personnalisée.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
