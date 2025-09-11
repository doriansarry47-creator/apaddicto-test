import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { CravingEntry, ExerciseSession, BeckAnalysis, UserStats } from "@shared/schema";

const DEMO_USER_ID = "demo-user-123";

interface CravingStats {
  average: number;
  trend: number;
}

export default function Tracking() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');

  const { data: cravingEntries, isLoading: cravingLoading } = useQuery<CravingEntry[]>({
    queryKey: ["/api/cravings", DEMO_USER_ID],
    initialData: [],
  });

  const { data: cravingStats, isLoading: statsLoading } = useQuery<CravingStats>({
    queryKey: ["/api/cravings", DEMO_USER_ID, "stats"],
    initialData: { average: 0, trend: 0 },
  });

  const { data: exerciseSessions, isLoading: sessionsLoading } = useQuery<ExerciseSession[]>({
    queryKey: ["/api/exercise-sessions", DEMO_USER_ID],
    initialData: [],
  });

  const { data: userStats, isLoading: userStatsLoading } = useQuery<UserStats>({
    queryKey: ["/api/users", DEMO_USER_ID, "stats"],
    initialData: { exercisesCompleted: 0, totalDuration: 0, currentStreak: 0, longestStreak: 0, averageCraving: 0, id: '', userId: '', updatedAt: new Date() },
  });

  const { data: beckAnalyses, isLoading: beckLoading } = useQuery<BeckAnalysis[]>({
    queryKey: ["/api/beck-analyses", DEMO_USER_ID],
    initialData: [],
  });

  const isLoading = cravingLoading || statsLoading || sessionsLoading || userStatsLoading || beckLoading;

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
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-material" data-testid="card-avg-craving">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Craving Moyen</span>
                <span className="material-icons text-primary">psychology</span>
              </div>
              <div className="text-2xl font-bold text-foreground" data-testid="text-avg-craving">
                {averageCraving.toFixed(1)}/10
              </div>
              <p className={`text-xs ${cravingTrend < 0 ? 'text-success' : 'text-warning'}`}>
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

        {/* Detailed Tracking */}
        <Tabs defaultValue="cravings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3" data-testid="tabs-tracking">
            <TabsTrigger value="cravings" data-testid="tab-cravings">Cravings</TabsTrigger>
            <TabsTrigger value="exercises" data-testid="tab-exercises">Exercices</TabsTrigger>
            <TabsTrigger value="analyses" data-testid="tab-analyses">Analyses</TabsTrigger>
          </TabsList>

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
                    {cravingEntries.slice(0, 10).map((entry: CravingEntry) => (
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
                    <p className="text-muted-foreground">Commencez à suivre vos cravings pour voir votre progression.</p>
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
                    {exerciseSessions.slice(0, 10).map((session: ExerciseSession) => (
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
                          Exercice: {session.exerciseId}
                        </div>
                        
                        {session.cratingBefore !== null && session.cravingAfter !== null && (
                          <div className="flex items-center space-x-4 text-sm">
                            <span>Craving avant: <strong>{session.cratingBefore}/10</strong></span>
                            <span className="material-icons text-primary">arrow_forward</span>
                            <span>Craving après: <strong>{session.cravingAfter}/10</strong></span>
                            {session.cratingBefore > session.cravingAfter && (
                              <Badge className="bg-success text-success-foreground">
                                -{session.cratingBefore - session.cravingAfter} points
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
                    <p className="text-muted-foreground">Complétez des exercices pour voir votre historique.</p>
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
                    {beckAnalyses.slice(0, 5).map((analysis: BeckAnalysis) => (
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
                    <p className="text-muted-foreground">Utilisez l'outil d'analyse Beck pour mieux comprendre vos pensées.</p>
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
