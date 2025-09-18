import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { InsertBeckAnalysis } from "@shared/schema";

interface BeckColumnProps {
  userId: string;
  onSuccess?: () => void;
}

export function BeckColumn({ userId, onSuccess }: BeckColumnProps) {
  const [situation, setSituation] = useState("");
  const [automaticThoughts, setAutomaticThoughts] = useState("");
  const [emotions, setEmotions] = useState("");
  const [emotionIntensity, setEmotionIntensity] = useState(5);
  const [rationalResponse, setRationalResponse] = useState("");
  const [newFeeling, setNewFeeling] = useState("");
  const [newIntensity, setNewIntensity] = useState(5);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createBeckAnalysisMutation = useMutation({
    mutationFn: async (data: InsertBeckAnalysis) => {
      return await apiRequest("POST", "/api/beck-analyses", data);
    },
    onSuccess: () => {
      toast({
        title: "Analyse sauvegardée",
        description: "Votre analyse cognitive a été sauvegardée avec succès.",
      });
      // Invalidation plus large pour s'assurer que toutes les données sont actualisées
      queryClient.invalidateQueries({ queryKey: ["/api/beck-analyses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users/stats"] });
      queryClient.invalidateQueries({ queryKey: ["beck-analyses"] });
      queryClient.invalidateQueries({ queryKey: ["users", "stats"] });
      // Vider le formulaire après sauvegarde réussie
      clearForm();
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder l'analyse. Veuillez réessayer.",
        variant: "destructive",
      });
      console.error("Error creating Beck analysis:", error);
    },
  });

  const handleSubmit = () => {
    if (!situation.trim() || !automaticThoughts.trim() || !emotions.trim()) {
      toast({
        title: "Champs manquants",
        description: "Veuillez remplir au moins les 3 premières colonnes.",
        variant: "destructive",
      });
      return;
    }

    createBeckAnalysisMutation.mutate({
      userId,
      situation: situation.trim(),
      automaticThoughts: automaticThoughts.trim(),
      emotions: emotions.trim(),
      emotionIntensity,
      rationalResponse: rationalResponse.trim() || null,
      newFeeling: newFeeling.trim() || null,
      newIntensity: newFeeling.trim() ? newIntensity : null,
    });
  };

  const clearForm = () => {
    setSituation("");
    setAutomaticThoughts("");
    setEmotions("");
    setEmotionIntensity(5);
    setRationalResponse("");
    setNewFeeling("");
    setNewIntensity(5);
  };

  return (
    <Card className="shadow-material" data-testid="card-beck-column">
      <CardHeader>
        <CardTitle className="flex items-center text-xl font-medium">
          <span className="material-icons mr-2 text-primary">psychology</span>
          Colonne de Beck - Analyse Cognitive
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Analysez vos pensées et émotions pour mieux comprendre vos réactions.
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
          {/* Column 1: Situation */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-foreground">1. Situation</label>
            <div className="text-xs text-muted-foreground mb-2">
              <strong>Exemples :</strong><br/>
              • "J'ai vu mon dealer dans la rue"<br/>
              • "Mon conjoint m'a critiqué"<br/>
              • "Je me suis dispute avec un ami"<br/>
              • "J'ai reçu une mauvaise nouvelle au travail"
            </div>
            <textarea
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              className="w-full p-3 border border-input rounded-lg resize-none h-24 text-sm bg-background"
              placeholder="Décrivez la situation déclenchante de façon factuelle et objective..."
              data-testid="textarea-situation"
            />
          </div>

          {/* Column 2: Automatic Thoughts */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-foreground">2. Pensées Automatiques</label>
            <div className="text-xs text-muted-foreground mb-2">
              <strong>Exemples :</strong><br/>
              • "Je n'y arriverai jamais"<br/>
              • "Personne ne me comprend"<br/>
              • "C'est trop dur, j'ai besoin de consommer"<br/>
              • "Je suis nul(le), je mérite de souffrir"<br/>
              • "Une seule fois ne changera rien"
            </div>
            <textarea
              value={automaticThoughts}
              onChange={(e) => setAutomaticThoughts(e.target.value)}
              className="w-full p-3 border border-input rounded-lg resize-none h-24 text-sm bg-background"
              placeholder="Quelles pensées vous sont venues spontanément? (sans les censurer)"
              data-testid="textarea-thoughts"
            />
          </div>

          {/* Column 3: Emotions */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-foreground">3. Émotions</label>
            <div className="text-xs text-muted-foreground mb-2">
              <strong>Exemples :</strong><br/>
              • "Anxiété, peur du manque"<br/>
              • "Tristesse profonde, désespoir"<br/>
              • "Colère contre moi-même"<br/>
              • "Honte, culpabilité"<br/>
              • "Vide intérieur, solitude"
            </div>
            <textarea
              value={emotions}
              onChange={(e) => setEmotions(e.target.value)}
              className="w-full p-3 border border-input rounded-lg resize-none h-20 text-sm bg-background"
              placeholder="Nommez les émotions ressenties avec précision..."
              data-testid="textarea-emotions"
            />
            <div className="flex items-center space-x-2">
              <span className="text-xs text-muted-foreground">Intensité:</span>
              <input
                type="range"
                min="1"
                max="10"
                value={emotionIntensity}
                onChange={(e) => setEmotionIntensity(Number(e.target.value))}
                className="flex-1 h-1"
                data-testid="slider-emotion-intensity"
              />
              <span className="text-xs font-medium text-primary" data-testid="text-emotion-intensity">
                {emotionIntensity}
              </span>
            </div>
          </div>

          {/* Column 4: Rational Responses */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-foreground">4. Réponses Rationnelles</label>
            <div className="text-xs text-muted-foreground mb-2">
              <strong>Exemples :</strong><br/>
              • "J'ai déjà surmonté des difficultés avant"<br/>
              • "Cette émotion va passer, comme les autres"<br/>
              • "Consommer ne résoudra pas mon problème"<br/>
              • "Je peux demander de l'aide"<br/>
              • "Chaque jour sobre est une victoire"
            </div>
            <textarea
              value={rationalResponse}
              onChange={(e) => setRationalResponse(e.target.value)}
              className="w-full p-3 border border-input rounded-lg resize-none h-24 text-sm bg-background"
              placeholder="Reformulez vos pensées de manière plus équilibrée et bienveillante..."
              data-testid="textarea-rational-response"
            />
          </div>

          {/* Column 5: Result */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-foreground">5. Nouveau Ressenti</label>
            <div className="text-xs text-muted-foreground mb-2">
              <strong>Exemples :</strong><br/>
              • "Plus calme, moins d'urgence"<br/>
              • "Toujours triste mais avec de l'espoir"<br/>
              • "Moins de colère, plus de compréhension"<br/>
              • "Un peu soulagé(e), plus confiant(e)"<br/>
            </div>
            <textarea
              value={newFeeling}
              onChange={(e) => setNewFeeling(e.target.value)}
              className="w-full p-3 border border-input rounded-lg resize-none h-20 text-sm bg-background"
              placeholder="Décrivez votre nouvel état émotionnel après la restructuration..."
              data-testid="textarea-new-feeling"
            />
            <div className="flex items-center space-x-2">
              <span className="text-xs text-muted-foreground">Nouvelle intensité:</span>
              <input
                type="range"
                min="1"
                max="10"
                value={newIntensity}
                onChange={(e) => setNewIntensity(Number(e.target.value))}
                className="flex-1 h-1"
                data-testid="slider-new-intensity"
              />
              <span className="text-xs font-medium text-secondary" data-testid="text-new-intensity">
                {newIntensity}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={clearForm}
            data-testid="button-clear-beck"
          >
            Effacer
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createBeckAnalysisMutation.isPending}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            data-testid="button-save-beck"
          >
            {createBeckAnalysisMutation.isPending ? "Sauvegarde..." : "Sauvegarder l'Analyse"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
