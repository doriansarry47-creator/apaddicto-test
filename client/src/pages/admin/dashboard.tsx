import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Tableau de Bord Administrateur</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="material-icons mr-2">edit_note</span>
              Gestion du Contenu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-muted-foreground">
              Créer, modifier et gérer les exercices et articles psycho-éducatifs.
            </p>
            <div className="flex flex-col space-y-2">
              <Link to="/admin/manage-exercises">
                <Button variant="outline" className="w-full">
                  <span className="material-icons mr-2">fitness_center</span>
                  Gérer les Exercices
                </Button>
              </Link>
              <Link to="/admin/manage-content">
                <Button variant="outline" className="w-full">
                  <span className="material-icons mr-2">article</span>
                  Gérer le Contenu Éducatif
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="material-icons mr-2">people</span>
              Gestion des Utilisateurs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-muted-foreground">
              Voir les comptes patients, temps d'inactivité et gérer les suppressions.
            </p>
            <Link to="/admin/manage-users">
              <Button className="w-full">
                <span className="material-icons mr-2">manage_accounts</span>
                Gérer les Utilisateurs
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="material-icons mr-2">perm_media</span>
              Gestion des Médias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-muted-foreground">
              Ajouter des images et vidéos pour les exercices.
            </p>
            <Link to="/admin/manage-media">
              <Button variant="outline" className="w-full">
                <span className="material-icons mr-2">cloud_upload</span>
                Gérer les Médias
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="material-icons mr-2">bug_report</span>
              Debug & Tests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-muted-foreground">
              Diagnostiquer les problèmes de permissions et tester l'accès admin.
            </p>
            <Link to="/admin/debug">
              <Button variant="destructive" className="w-full">
                <span className="material-icons mr-2">settings</span>
                Debug Admin
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
