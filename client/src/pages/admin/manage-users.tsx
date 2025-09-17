import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Users, UserCheck, UserX, Filter, Download } from "lucide-react";

interface AdminUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  createdAt: string;
  lastLoginAt: string | null;
  isActive: boolean;
  exerciseCount: number;
  cravingCount: number;
}

export default function ManageUsers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [activityFilter, setActivityFilter] = useState<string>("all");

  // Rafraîchir les données à chaque fois qu'on arrive sur la page
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
  }, [queryClient]);

  const { data: users, isLoading, refetch: refetchUsers } = useQuery<AdminUser[]>({
    queryKey: ["admin", "users"],
    queryFn: async () => apiRequest("GET", "/api/admin/users").then(res => res.json()),
    initialData: [],
    staleTime: 0, // Forcer le refetch
    cacheTime: 60000, // 1 minute de cache
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => apiRequest("DELETE", `/api/admin/users/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast({ title: "Succès", description: "Utilisateur supprimé avec succès." });
    },
    onError: (error) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const filteredUsers = users?.filter(user => {
    // Filtre par terme de recherche
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtre par rôle
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    
    // Filtre par activité
    let matchesActivity = true;
    if (activityFilter === "active") {
      if (!user.lastLoginAt) {
        matchesActivity = false;
      } else {
        const lastLogin = new Date(user.lastLoginAt);
        const now = new Date();
        const diffDays = Math.ceil(Math.abs(now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));
        matchesActivity = diffDays <= 7;
      }
    } else if (activityFilter === "inactive") {
      if (!user.lastLoginAt) {
        matchesActivity = true;
      } else {
        const lastLogin = new Date(user.lastLoginAt);
        const now = new Date();
        const diffDays = Math.ceil(Math.abs(now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));
        matchesActivity = diffDays > 7;
      }
    }
    
    return matchesSearch && matchesRole && matchesActivity;
  }) || [];

  const getInactivityDays = (lastLoginAt: string | null) => {
    if (!lastLoginAt) return "Jamais connecté";
    const lastLogin = new Date(lastLoginAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastLogin.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} jour${diffDays > 1 ? 's' : ''}`;
  };

  const getInactivityBadgeVariant = (lastLoginAt: string | null) => {
    if (!lastLoginAt) return "destructive";
    const lastLogin = new Date(lastLoginAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastLogin.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 30) return "destructive";
    if (diffDays > 7) return "secondary";
    return "default";
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <Users className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Gestion des Utilisateurs</h1>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => refetchUsers()}
            className="flex items-center space-x-2"
          >
            <span className="material-icons">refresh</span>
            <span>Actualiser</span>
          </Button>
          <Button variant="outline" className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Exporter</span>
          </Button>
        </div>
      </div>

      {/* Filtres */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtres</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Rechercher</Label>
              <Input
                id="search"
                placeholder="Nom, prénom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="role">Rôle</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les rôles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les rôles</SelectItem>
                  <SelectItem value="patient">Patients</SelectItem>
                  <SelectItem value="admin">Administrateurs</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="activity">Activité</Label>
              <Select value={activityFilter} onValueChange={setActivityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Toute activité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toute activité</SelectItem>
                  <SelectItem value="active">Actifs (7 derniers jours)</SelectItem>
                  <SelectItem value="inactive">Inactifs (+ de 7 jours)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold text-primary">{filteredUsers.length}</div>
                <div className="text-sm text-muted-foreground">Utilisateurs affichés</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {filteredUsers.filter(u => u.role === 'patient').length}
                </div>
                <div className="text-sm text-muted-foreground">Patients</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserX className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {filteredUsers.filter(u => u.role === 'admin').length}
                </div>
                <div className="text-sm text-muted-foreground">Administrateurs</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {filteredUsers.filter(u => {
                if (!u.lastLoginAt) return true;
                const lastLogin = new Date(u.lastLoginAt);
                const now = new Date();
                const diffDays = Math.ceil(Math.abs(now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));
                return diffDays > 7;
              }).length}
            </div>
            <div className="text-sm text-muted-foreground">Inactifs (7+ jours)</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {users?.length || 0}
            </div>
            <div className="text-sm text-muted-foreground">Total général</div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des utilisateurs */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Utilisateurs</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Chargement des utilisateurs...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Inscription</TableHead>
                  <TableHead>Dernière connexion</TableHead>
                  <TableHead>Activité</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ID: {user.id.slice(0, 8)}...
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'destructive' : 'default'}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getInactivityBadgeVariant(user.lastLoginAt)}>
                        {getInactivityDays(user.lastLoginAt)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{user.exerciseCount} exercices</div>
                        <div>{user.cravingCount} cravings</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.role !== 'admin' && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <span className="material-icons mr-1">delete</span>
                              Supprimer
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                              <AlertDialogDescription>
                                Êtes-vous sûr de vouloir supprimer l'utilisateur {user.firstName} {user.lastName} ?
                                Cette action est irréversible et supprimera toutes ses données.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteUserMutation.mutate(user.id)}
                                disabled={deleteUserMutation.isPending}
                              >
                                {deleteUserMutation.isPending ? "Suppression..." : "Supprimer"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

