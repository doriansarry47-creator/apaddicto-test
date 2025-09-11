import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import type { User, UserStats, UserBadge } from "@shared/schema";

interface CravingStats {
  average: number;
  trend: number;
}

export default function Profile() {
  const { user: authUser, isLoading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState({
    dailyReminder: true,
    cravingAlert: true,
    progressUpdate: false,
    weeklyReport: true
  });
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [isEditingEmail, setIsEditingEmail] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateUserMutation = useMutation({
    mutationFn: (updatedUser: { firstName: string; lastName: string; email?: string }) => {
      return fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser),
      }).then((res) => {
        if (!res.ok) {
          return res.json().then(err => { throw new Error(err.message || "Failed to update profile") });
        }
        return res.json();
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/profile"] });
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été mises à jour avec succès.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour le profil.",
        variant: "destructive",
      });
    },
  });

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation basique
    if (!firstName.trim() && !lastName.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir au moins un prénom ou un nom.",
        variant: "destructive",
      });
      return;
    }
    
    // Validation de la longueur
    if (firstName.trim().length > 50 || lastName.trim().length > 50) {
      toast({
        title: "Erreur",
        description: "Le prénom et le nom ne peuvent pas dépasser 50 caractères.",
        variant: "destructive",
      });
      return;
    }
    
    const updateData: { firstName: string; lastName: string; email?: string } = {
      firstName: firstName.trim(), 
      lastName: lastName.trim()
    };
    
    // Inclure l'email seulement si il a été modifié
    if (isEditingEmail && email !== user?.email) {
      // Validation email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        toast({
          title: "Erreur",
          description: "Veuillez saisir une adresse email valide.",
          variant: "destructive",
        });
        return;
      }
      updateData.email = email.trim();
    }
    
    updateUserMutation.mutate(updateData);
  };

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const updatePasswordMutation = useMutation({
    mutationFn: (passwords: { oldPassword: string; newPassword: string }) => {
      return fetch("/api/users/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwords),
      }).then((res) => {
        if (!res.ok) {
          return res.json().then(err => { throw new Error(err.message || "Failed to update password") });
        }
        return res.json();
      });
    },
    onSuccess: () => {
      toast({
        title: "Mot de passe mis à jour",
        description: "Votre mot de passe a été changé avec succès.",
      });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation des champs requis
    if (!oldPassword.trim()) {
      toast({
        title: "Erreur",
        description: "L'ancien mot de passe est requis.",
        variant: "destructive",
      });
      return;
    }
    
    if (!newPassword.trim()) {
      toast({
        title: "Erreur",
        description: "Le nouveau mot de passe est requis.",
        variant: "destructive",
      });
      return;
    }
    
    // Validation de la longueur du mot de passe
    if (newPassword.length < 6) {
      toast({
        title: "Erreur",
        description: "Le nouveau mot de passe doit contenir au moins 6 caractères.",
        variant: "destructive",
      });
      return;
    }
    
    // Validation de la correspondance
    if (newPassword !== confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les nouveaux mots de passe ne correspondent pas.",
        variant: "destructive",
      });
      return;
    }
    
    // Vérifier que le nouveau mot de passe est différent de l'ancien
    if (oldPassword === newPassword) {
      toast({
        title: "Erreur",
        description: "Le nouveau mot de passe doit être différent de l'ancien.",
        variant: "destructive",
      });
      return;
    }
    
    updatePasswordMutation.mutate({ oldPassword, newPassword });
  };

  const deleteAccountMutation = useMutation({
    mutationFn: () => {
      return fetch("/api/users/profile", {
        method: "DELETE",
      }).then((res) => {
        if (!res.ok) throw new Error("Failed to delete account");
        return res.json();
      });
    },
    onSuccess: () => {
      toast({
        title: "Compte supprimé",
        description: "Votre compte a été supprimé avec succès.",
      });
      handleLogout();
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le compte.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteAccount = () => {
    deleteAccountMutation.mutate();
  };

  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/users/profile"],
    enabled: !!authUser,
  });

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const { data: userStats, isLoading: statsLoading } = useQuery<UserStats>({
    queryKey: ["/api/users/stats"],
    enabled: !!authUser,
  });

  const { data: badges, isLoading: badgesLoading } = useQuery<UserBadge[]>({
    queryKey: ["/api/users/badges"],
    enabled: !!authUser,
  });

  const { data: cravingStats } = useQuery<CravingStats>({
    queryKey: ["/api/cravings/stats"],
    enabled: !!authUser,
  });

  const isLoading = authLoading || userLoading || statsLoading || badgesLoading;

  if (isLoading) {
    return (
      <>
        <Navigation />
        <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
          <div className="space-y-6">
            <div className="h-8 bg-muted rounded w-1/3 animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
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

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    toast({
      title: "Préférences mises à jour",
      description: "Vos paramètres de notification ont été sauvegardés.",
    });
  };

  const exportData = () => {
    toast({
      title: "Export en cours",
      description: "Vos données sont en cours de préparation pour le téléchargement.",
    });
  };

  const [, setLocation] = useLocation();
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setLocation("/login");
    queryClient.clear(); // Clear the cache on logout
  };

  const getBadgeInfo = (badgeType: string) => {
    switch (badgeType) {
      case '7_days':
        return { icon: 'star', name: '7 jours consécutifs', description: 'Une semaine d\'exercices réguliers', color: 'bg-warning' };
      case '50_exercises':
        return { icon: 'fitness_center', name: '50 exercices', description: 'Demi-centenaire d\'exercices complétés', color: 'bg-success' };
      case 'craving_reduction':
        return { icon: 'trending_down', name: 'Réduction des cravings', description: 'Diminution significative des cravings', color: 'bg-primary' };
      default:
        return { icon: 'emoji_events', name: 'Badge', description: 'Récompense obtenue', color: 'bg-muted' };
    }
  };

  const level = user?.level || 1;
  const points = user?.points || 0;
  const currentLevelProgress = points % 100;
  const nextLevelPoints = 100 - currentLevelProgress;
  const totalExercises = userStats?.exercisesCompleted || 0;
  const totalDuration = userStats?.totalDuration || 0;
  const averageCraving = cravingStats?.average || 0;

  return (
    <>
      <Navigation />
      <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
        
        {/* Page Header */}
        <section className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Profil</h1>
            <p className="text-muted-foreground">
              Gérez vos informations personnelles et suivez votre progression globale.
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <span className="material-icons mr-2">logout</span>
            Se déconnecter
          </Button>
        </section>

        {/* Profile Overview */}
        <section className="mb-8">
          <Card className="shadow-material" data-testid="card-profile-overview">
            <CardContent className="p-6">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {user?.firstName?.[0] || 'U'}{user?.lastName?.[0] || 'S'}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-foreground mb-1" data-testid="text-user-name">
                    {user?.firstName || 'Utilisateur'} {user?.lastName || 'Demo'}
                  </h2>
                  <p className="text-muted-foreground mb-2" data-testid="text-user-email">
                    {user?.email || 'demo@example.com'}
                  </p>
                  <div className="flex items-center space-x-4">
                    <Badge className="bg-primary text-primary-foreground">
                      Niveau {level}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {points} points
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground mb-1">Progression niveau {level + 1}</div>
                  <Progress value={currentLevelProgress} className="w-32 h-2" />
                  <div className="text-xs text-muted-foreground mt-1">
                    {nextLevelPoints} points restants
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Detailed Tabs */}
        <Tabs defaultValue="stats" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4" data-testid="tabs-profile">
            <TabsTrigger value="stats" data-testid="tab-stats">Statistiques</TabsTrigger>
            <TabsTrigger value="badges" data-testid="tab-badges">Badges</TabsTrigger>
            <TabsTrigger value="settings" data-testid="tab-settings">Paramètres</TabsTrigger>
            <TabsTrigger value="data" data-testid="tab-data">Données</TabsTrigger>
          </TabsList>

          {/* Statistics Tab */}
          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="shadow-material" data-testid="card-stat-exercises">
                <CardContent className="p-6 text-center">
                  <span className="material-icons text-4xl text-secondary mb-2">fitness_center</span>
                  <div className="text-2xl font-bold text-foreground">{totalExercises}</div>
                  <div className="text-sm text-muted-foreground">Exercices complétés</div>
                </CardContent>
              </Card>

              <Card className="shadow-material" data-testid="card-stat-duration">
                <CardContent className="p-6 text-center">
                  <span className="material-icons text-4xl text-primary mb-2">schedule</span>
                  <div className="text-2xl font-bold text-foreground">{Math.round(totalDuration / 60)}</div>
                  <div className="text-sm text-muted-foreground">Minutes d'exercice</div>
                </CardContent>
              </Card>

              <Card className="shadow-material" data-testid="card-stat-streak">
                <CardContent className="p-6 text-center">
                  <span className="material-icons text-4xl text-warning mb-2">local_fire_department</span>
                  <div className="text-2xl font-bold text-foreground">{userStats?.currentStreak || 0}</div>
                  <div className="text-sm text-muted-foreground">Jours consécutifs</div>
                </CardContent>
              </Card>

              <Card className="shadow-material" data-testid="card-stat-craving">
                <CardContent className="p-6 text-center">
                  <span className="material-icons text-4xl text-destructive mb-2">psychology</span>
                  <div className="text-2xl font-bold text-foreground">{averageCraving.toFixed(1)}</div>
                  <div className="text-sm text-muted-foreground">Craving moyen (/10)</div>
                </CardContent>
              </Card>
            </div>

            {/* Progress Charts */}
            <Card className="shadow-material" data-testid="card-progress-details">
              <CardHeader>
                <CardTitle>Progression Détaillée</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Niveau actuel</span>
                    <span>Niveau {level}</span>
                  </div>
                  <Progress value={currentLevelProgress} className="h-3" />
                  <div className="text-xs text-muted-foreground mt-1">
                    {currentLevelProgress}/100 points pour le niveau suivant
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-foreground mb-3">Répartition des Exercices</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Réduction craving</span>
                        <span>45%</span>
                      </div>
                      <Progress value={45} className="h-2" />
                      <div className="flex justify-between text-sm">
                        <span>Relaxation</span>
                        <span>30%</span>
                      </div>
                      <Progress value={30} className="h-2" />
                      <div className="flex justify-between text-sm">
                        <span>Énergie</span>
                        <span>25%</span>
                      </div>
                      <Progress value={25} className="h-2" />
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-foreground mb-3">Évolution Mensuelle</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Cette semaine</span>
                        <span className="text-success">+12%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Ce mois</span>
                        <span className="text-success">+35%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Craving moyen</span>
                        <span className="text-success">-23%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Badges Tab */}
          <TabsContent value="badges" className="space-y-6">
            <Card className="shadow-material" data-testid="card-badges-collection">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="material-icons mr-2 text-warning">emoji_events</span>
                  Collection de Badges
                </CardTitle>
              </CardHeader>
              <CardContent>
                {badges && badges.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {badges.map((badge: UserBadge) => {
                      const badgeInfo = getBadgeInfo(badge.badgeType);
                      return (
                        <div key={badge.id} className="border border-border rounded-lg p-4 text-center" data-testid={`badge-card-${badge.badgeType}`}>
                          <div className={`w-16 h-16 ${badgeInfo.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                            <span className="material-icons text-white text-2xl">
                              {badgeInfo.icon}
                            </span>
                          </div>
                          <h4 className="font-medium text-foreground mb-1">{badgeInfo.name}</h4>
                          <p className="text-xs text-muted-foreground mb-2">{badgeInfo.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {badge.earnedAt ? `Obtenu le ${new Date(badge.earnedAt).toLocaleDateString('fr-FR')}` : ''}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8" data-testid="empty-badges">
                    <span className="material-icons text-6xl text-muted-foreground mb-4">emoji_events</span>
                    <h3 className="text-lg font-medium text-foreground mb-2">Aucun badge obtenu</h3>
                    <p className="text-muted-foreground">Complétez des exercices pour gagner vos premiers badges !</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Badge Progress */}
            <Card className="shadow-material" data-testid="card-badge-progress">
              <CardHeader>
                <CardTitle>Badges à Débloquer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                      <span className="material-icons text-muted-foreground">schedule</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">Marathon Débutant</h4>
                      <p className="text-sm text-muted-foreground">Complétez 100 exercices</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{totalExercises}/100</div>
                    <Progress value={(totalExercises / 100) * 100} className="w-20 h-2" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                      <span className="material-icons text-muted-foreground">psychology</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">Maître du Mental</h4>
                      <p className="text-sm text-muted-foreground">Complétez 20 analyses Beck</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">0/20</div>
                    <Progress value={0} className="w-20 h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="shadow-material" data-testid="card-notifications">
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="daily-reminder" className="font-medium">Rappel quotidien</Label>
                    <p className="text-sm text-muted-foreground">Recevez un rappel pour vos exercices quotidiens</p>
                  </div>
                  <Switch
                    id="daily-reminder"
                    checked={notifications.dailyReminder}
                    onCheckedChange={() => handleNotificationChange('dailyReminder')}
                    data-testid="switch-daily-reminder"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="craving-alert" className="font-medium">Alertes craving</Label>
                    <p className="text-sm text-muted-foreground">Notifications d'encouragement lors de pics émotionnels</p>
                  </div>
                  <Switch
                    id="craving-alert"
                    checked={notifications.cravingAlert}
                    onCheckedChange={() => handleNotificationChange('cravingAlert')}
                    data-testid="switch-craving-alert"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="progress-update" className="font-medium">Mises à jour de progression</Label>
                    <p className="text-sm text-muted-foreground">Notifications sur vos accomplissements et badges</p>
                  </div>
                  <Switch
                    id="progress-update"
                    checked={notifications.progressUpdate}
                    onCheckedChange={() => handleNotificationChange('progressUpdate')}
                    data-testid="switch-progress-update"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="weekly-report" className="font-medium">Rapport hebdomadaire</Label>
                    <p className="text-sm text-muted-foreground">Résumé de votre semaine d'activité</p>
                  </div>
                  <Switch
                    id="weekly-report"
                    checked={notifications.weeklyReport}
                    onCheckedChange={() => handleNotificationChange('weeklyReport')}
                    data-testid="switch-weekly-report"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-material" data-testid="card-profile-info">
              <CardHeader>
                <CardTitle>Informations Personnelles</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom</Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Votre prénom"
                        maxLength={50}
                        data-testid="input-firstName"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom</Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Votre nom de famille"
                        maxLength={50}
                        data-testid="input-lastName"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email">Email</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditingEmail(!isEditingEmail)}
                      >
                        {isEditingEmail ? "Annuler" : "Modifier"}
                      </Button>
                    </div>
                    <Input 
                      id="email" 
                      type="email" 
                      value={isEditingEmail ? email : (user?.email || "")} 
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={!isEditingEmail}
                      placeholder="votre@email.com"
                    />
                    {isEditingEmail && (
                      <p className="text-sm text-muted-foreground">
                        Attention : La modification de votre email peut affecter votre connexion.
                      </p>
                    )}
                  </div>
                  <Button type="submit" disabled={updateUserMutation.isPending}>
                    {updateUserMutation.isPending ? "Enregistrement..." : "Enregistrer les modifications"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="shadow-material" data-testid="card-change-password">
              <CardHeader>
                <CardTitle>Changer le mot de passe</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="oldPassword">Ancien mot de passe</Label>
                    <Input
                      id="oldPassword"
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="Saisissez votre mot de passe actuel"
                      required
                      data-testid="input-old-password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Nouveau mot de passe (min. 6 caractères)"
                      minLength={6}
                      required
                      data-testid="input-new-password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirmez votre nouveau mot de passe"
                      minLength={6}
                      required
                      data-testid="input-confirm-password"
                    />
                  </div>
                  <Button type="submit" disabled={updatePasswordMutation.isPending}>
                    {updatePasswordMutation.isPending ? "Mise à jour..." : "Changer le mot de passe"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Tab */}
          <TabsContent value="data" className="space-y-6">
            <Card className="shadow-material" data-testid="card-data-export">
              <CardHeader>
                <CardTitle>Export de Données</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Téléchargez une copie de toutes vos données personnelles stockées dans l'application.
                </p>
                <Button onClick={exportData} data-testid="button-export-data">
                  <span className="material-icons mr-2">download</span>
                  Exporter mes données
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-material" data-testid="card-data-summary">
              <CardHeader>
                <CardTitle>Résumé des Données</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-foreground mb-3">Données d'activité</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Entrées de craving:</span>
                        <span className="font-medium">12</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sessions d'exercice:</span>
                        <span className="font-medium">{totalExercises}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Analyses cognitives:</span>
                        <span className="font-medium">3</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-foreground mb-3">Données de progression</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Badges obtenus:</span>
                        <span className="font-medium">{badges?.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Niveau actuel:</span>
                        <span className="font-medium">{level}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Points totaux:</span>
                        <span className="font-medium">{points}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive shadow-material" data-testid="card-data-delete">
              <CardHeader>
                <CardTitle className="text-destructive">Zone de Danger</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Attention : cette action est irréversible et supprimera définitivement toutes vos données.
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" data-testid="button-delete-account">
                      <span className="material-icons mr-2">delete_forever</span>
                      Supprimer mon compte
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Cette action est irréversible. Toutes vos données seront supprimées de manière permanente :
                        <ul className="mt-2 ml-4 list-disc text-sm">
                          <li>Vos informations personnelles</li>
                          <li>Vos sessions d'exercices</li>
                          <li>Vos entrées de craving</li>
                          <li>Vos analyses cognitives</li>
                          <li>Vos badges et statistiques</li>
                        </ul>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        disabled={deleteAccountMutation.isPending}
                      >
                        {deleteAccountMutation.isPending ? "Suppression..." : "Supprimer"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
