import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { InsertAntiCravingStrategy } from "@shared/schema";

const contexts = [
  { key: 'leisure', label: 'Pendant mes loisirs' },
  { key: 'home', label: 'Au domicile' },
  { key: 'work', label: 'Au travail / lieu de soin' }
];

const effortLevels = [
  { value: 'faible', label: 'Faible' },
  { value: 'modéré', label: 'Modéré' },
  { value: 'intense', label: 'Intense' }
];

interface StrategyRow {
  id: string;
  context: string;
  exercise: string;
  effort: string;
  duration: number;
  cravingBefore: number;
  cravingAfter: number;
}

interface StrategiesBoxProps {
  userId: string;
  onSuccess?: () => void;
}

export function StrategiesBox({ userId, onSuccess }: StrategiesBoxProps) {
  const [strategies, setStrategies] = useState<StrategyRow[]>([
    {
      id: 'default',
      context: 'leisure',
      exercise: '',
      effort: 'modéré',
      duration: 10,
      cravingBefore: 5,
      cravingAfter: 3
    }
  ]);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const saveStrategiesMutation = useMutation({
    mutationFn: async (data: InsertAntiCravingStrategy[]) => {
      const response = await apiRequest("POST", "/api/strategies", { strategies: data });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Stratégies sauvegardées",
        description: "Vos stratégies anti-craving ont été enregistrées avec succès.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/strategies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users/stats"] });
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les stratégies. Veuillez réessayer.",
        variant: "destructive",
      });
      console.error("Error saving strategies:", error);
    },
  });

  const addRow = () => {
    const newRow: StrategyRow = {
      id: Date.now().toString(),
      context: 'leisure',
      exercise: '',
      effort: 'modéré',
      duration: 10,
      cravingBefore: 5,
      cravingAfter: 3
    };
    setStrategies([...strategies, newRow]);
  };

  const updateStrategy = (id: string, field: keyof StrategyRow, value: any) => {
    setStrategies(strategies.map(strategy => 
      strategy.id === id ? { ...strategy, [field]: value } : strategy
    ));
  };

  const removeRow = (id: string) => {
    if (strategies.length > 1) {
      setStrategies(strategies.filter(strategy => strategy.id !== id));
    }
  };

  const handleSave = () => {
    const validStrategies = strategies
      .filter(strategy => strategy.exercise.trim())
      .map(strategy => ({
        userId,
        context: strategy.context,
        exercise: strategy.exercise,
        effort: strategy.effort,
        duration: strategy.duration,
        cravingBefore: strategy.cravingBefore,
        cravingAfter: strategy.cravingAfter
      }));

    if (validStrategies.length === 0) {
      toast({
        title: "Aucune stratégie",
        description: "Veuillez remplir au moins une stratégie avant de sauvegarder.",
        variant: "destructive",
      });
      return;
    }

    saveStrategiesMutation.mutate(validStrategies);
  };

  const getExampleText = (context: string) => {
    const examples = {
      'leisure': 'Ex: Course à pied, méditation, lecture',
      'home': 'Ex: Ménage, yoga, cuisine créative',
      'work': 'Ex: Pause active, respiration, étirements'
    };
    return examples[context as keyof typeof examples] || '';
  };

  return (
    <Card className="shadow-material" data-testid="card-strategies-box">
      <CardHeader>
        <CardTitle className="flex items-center text-lg font-medium">
          <span className="material-icons mr-2 text-primary">psychology</span>
          Boîte à Stratégies Anti-Craving
        </CardTitle>
        <div className="text-sm text-muted-foreground mt-2 space-y-2">
          <p>
            Cet outil vous permet de découvrir et d'expérimenter différentes activités physiques ou stratégies pour réduire vos envies de fumer (cravings).
          </p>
          <p>
            Vous pouvez tester plusieurs actions, noter leur durée, leur intensité et évaluer l'impact sur votre craving avant et après l'activité.
          </p>
          <p>
            Avec le temps, cela vous aidera à identifier les stratégies qui vous apportent le plus de bénéfices et à construire votre propre boîte à outils anti-craving.
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Table Header */}
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Headers */}
            <div className="grid grid-cols-7 gap-2 p-2 bg-muted/50 rounded-lg text-sm font-medium">
              <div className="text-center">Contexte</div>
              <div className="text-center">Exercices</div>
              <div className="text-center">Effort / Intensité</div>
              <div className="text-center">Durée (min)</div>
              <div className="text-center">Craving Avant</div>
              <div className="text-center">Craving Après</div>
              <div className="text-center">Actions</div>
            </div>

            {/* Strategy Rows */}
            <div className="space-y-2 mt-4">
              {strategies.map((strategy, index) => (
                <div key={strategy.id} className="grid grid-cols-7 gap-2 p-2 border rounded-lg">
                  {/* Context */}
                  <div className="flex flex-col">
                    <select
                      value={strategy.context}
                      onChange={(e) => updateStrategy(strategy.id, 'context', e.target.value)}
                      className="w-full p-2 border border-input rounded text-sm bg-background"
                      data-testid={`select-context-${index}`}
                    >
                      {contexts.map(context => (
                        <option key={context.key} value={context.key}>
                          {context.label}
                        </option>
                      ))}
                    </select>
                    <div className="text-xs text-muted-foreground mt-1 italic">
                      {getExampleText(strategy.context)}
                    </div>
                  </div>

                  {/* Exercise */}
                  <div>
                    <textarea
                      value={strategy.exercise}
                      onChange={(e) => updateStrategy(strategy.id, 'exercise', e.target.value)}
                      placeholder="Décrivez votre activité/stratégie..."
                      className="w-full p-2 border border-input rounded text-sm resize-none h-16 bg-background"
                      data-testid={`textarea-exercise-${index}`}
                    />
                  </div>

                  {/* Effort */}
                  <div>
                    <select
                      value={strategy.effort}
                      onChange={(e) => updateStrategy(strategy.id, 'effort', e.target.value)}
                      className="w-full p-2 border border-input rounded text-sm bg-background"
                      data-testid={`select-effort-${index}`}
                    >
                      {effortLevels.map(level => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Duration */}
                  <div>
                    <input
                      type="number"
                      min="1"
                      max="180"
                      value={strategy.duration}
                      onChange={(e) => updateStrategy(strategy.id, 'duration', Number(e.target.value))}
                      className="w-full p-2 border border-input rounded text-sm bg-background"
                      data-testid={`input-duration-${index}`}
                    />
                  </div>

                  {/* Craving Before */}
                  <div>
                    <select
                      value={strategy.cravingBefore}
                      onChange={(e) => updateStrategy(strategy.id, 'cravingBefore', Number(e.target.value))}
                      className="w-full p-2 border border-input rounded text-sm bg-background"
                      data-testid={`select-craving-before-${index}`}
                    >
                      {Array.from({length: 11}, (_, i) => (
                        <option key={i} value={i}>{i}</option>
                      ))}
                    </select>
                  </div>

                  {/* Craving After */}
                  <div>
                    <select
                      value={strategy.cravingAfter}
                      onChange={(e) => updateStrategy(strategy.id, 'cravingAfter', Number(e.target.value))}
                      className="w-full p-2 border border-input rounded text-sm bg-background"
                      data-testid={`select-craving-after-${index}`}
                    >
                      {Array.from({length: 11}, (_, i) => (
                        <option key={i} value={i}>{i}</option>
                      ))}
                    </select>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-center">
                    {strategies.length > 1 && (
                      <Button
                        onClick={() => removeRow(strategy.id)}
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        data-testid={`button-remove-${index}`}
                      >
                        <span className="material-icons text-sm">delete</span>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between pt-4">
          <Button
            onClick={addRow}
            variant="outline"
            className="flex items-center gap-2"
            data-testid="button-add-row"
          >
            <span className="material-icons text-sm">add</span>
            Ajouter une ligne
          </Button>

          <Button
            onClick={handleSave}
            disabled={saveStrategiesMutation.isPending}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            data-testid="button-save-strategies"
          >
            {saveStrategiesMutation.isPending ? "Sauvegarde..." : "Sauvegarder dans l'onglet Suivi"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}