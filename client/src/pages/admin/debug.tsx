import { useState } from "react";
import { useAuthQuery } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export default function AdminDebug() {
  const { data: user } = useAuthQuery();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const { data: psychoContent, error: psychoError, refetch: refetchPsycho } = useQuery({
    queryKey: ["admin", "psycho-education"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/psycho-education");
      return response.json();
    },
    enabled: false, // Ne charge pas automatiquement
  });

  const { data: adminExercises, error: exerciseError, refetch: refetchExercises } = useQuery({
    queryKey: ["admin", "exercises"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/exercises");
      return response.json();
    },
    enabled: false, // Ne charge pas automatiquement
  });

  const addResult = (message: string, type: "success" | "error" | "info" = "info") => {
    const timestamp = new Date().toLocaleTimeString();
    const icon = type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️";
    setTestResults(prev => [...prev, `${timestamp} ${icon} ${message}`]);
  };

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    try {
      addResult("🚀 Début des tests de diagnostic admin...", "info");

      // Test 1: Vérifier l'utilisateur actuel
      addResult(`Utilisateur connecté: ${user?.email} (${user?.role})`, user?.role === "admin" ? "success" : "error");

      // Test 2: Test accès psycho-education
      try {
        const psychoResult = await refetchPsycho();
        if (psychoResult.data) {
          addResult(`Contenu psycho-éducatif: ${psychoResult.data.length} éléments trouvés`, "success");
        } else {
          addResult("Aucun contenu psycho-éducatif trouvé", "error");
        }
      } catch (error: any) {
        addResult(`Erreur accès psycho-education: ${error.message}`, "error");
      }

      // Test 3: Test accès exercises admin
      try {
        const exerciseResult = await refetchExercises();
        if (exerciseResult.data) {
          addResult(`Exercices admin: ${exerciseResult.data.length} éléments trouvés`, "success");
        } else {
          addResult("Aucun exercice admin trouvé", "error");
        }
      } catch (error: any) {
        addResult(`Erreur accès exercices admin: ${error.message}`, "error");
      }

      // Test 4: Test création de contenu
      try {
        const testContent = {
          title: `Test Admin ${Date.now()}`,
          content: "Contenu de test créé par l'admin pour vérifier les permissions.",
          category: "addiction",
          type: "article",
          difficulty: "beginner",
          estimatedReadTime: 2
        };

        const response = await apiRequest("POST", "/api/psycho-education", testContent);
        const created = await response.json();
        addResult(`Contenu créé avec succès: ID ${created.id}`, "success");
      } catch (error: any) {
        addResult(`Erreur création de contenu: ${error.message}`, "error");
      }

      addResult("🎉 Tests terminés!", "success");

    } catch (error: any) {
      addResult(`Erreur générale: ${error.message}`, "error");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Debug Admin</h1>
        <Badge variant={user?.role === "admin" ? "default" : "destructive"}>
          {user?.role || "Non connecté"}
        </Badge>
      </div>

      <div className="grid gap-6">
        {/* Informations utilisateur */}
        <Card>
          <CardHeader>
            <CardTitle>Informations Utilisateur</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Email:</strong> {user?.email || "Non connecté"}</p>
              <p><strong>Rôle:</strong> {user?.role || "N/A"}</p>
              <p><strong>Nom:</strong> {user?.firstName} {user?.lastName}</p>
              <p><strong>ID:</strong> {user?.id || "N/A"}</p>
            </div>
          </CardContent>
        </Card>

        {/* Tests diagnostiques */}
        <Card>
          <CardHeader>
            <CardTitle>Tests Diagnostiques</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={runTests} disabled={isRunning}>
              {isRunning ? "Tests en cours..." : "Lancer les tests"}
            </Button>

            {testResults.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="font-medium">Résultats:</h4>
                <div className="bg-gray-50 p-4 rounded-md max-h-96 overflow-y-auto">
                  {testResults.map((result, index) => (
                    <div key={index} className="font-mono text-sm">
                      {result}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Erreurs détectées */}
        {(psychoError || exerciseError) && (
          <Card>
            <CardHeader>
              <CardTitle>Erreurs Détectées</CardTitle>
            </CardHeader>
            <CardContent>
              {psychoError && (
                <Alert className="mb-2">
                  <AlertDescription>
                    <strong>Erreur psycho-education:</strong> {psychoError.message}
                  </AlertDescription>
                </Alert>
              )}
              {exerciseError && (
                <Alert>
                  <AlertDescription>
                    <strong>Erreur exercises:</strong> {exerciseError.message}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Données chargées */}
        {psychoContent && (
          <Card>
            <CardHeader>
              <CardTitle>Contenu Psycho-Éducatif ({psychoContent.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {psychoContent.slice(0, 3).map((content: any) => (
                  <div key={content.id} className="border p-2 rounded">
                    <strong>{content.title}</strong>
                    <div className="text-sm text-gray-600">
                      {content.category} - {content.type} - {content.difficulty}
                    </div>
                  </div>
                ))}
                {psychoContent.length > 3 && (
                  <p className="text-sm text-gray-500">
                    ... et {psychoContent.length - 3} autres contenus
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}