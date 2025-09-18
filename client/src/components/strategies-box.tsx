import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
      console.log('Sending strategies to API:', data);
      
      try {
        const response = await apiRequest("POST", "/api/strategies", { strategies: data });
        const result = await response.json();
        console.log('API response:', result);
        return result;
      } catch (error) {
        console.error('Error in mutation:', error);
        // Re-throw to let the mutation handle it
        throw error;
      }
    },
    onSuccess: (result) => {
      const count = result.strategies?.length || result.length || 0;
      toast({
        title: "Stratégies sauvegardées !",
        description: `${count} stratégie(s) enregistrée(s) avec succès dans l'onglet Suivi.`,
      });
      
      // Invalider tous les caches liés aux stratégies avec les clés correctes
      queryClient.invalidateQueries({ queryKey: ["/api/strategies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/strategies", userId] });
      queryClient.invalidateQueries({ queryKey: ["/api/users/stats"] });
      
      // Invalider toutes les queries relatives aux stratégies pour être sûr
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && key.length > 0 && key[0] === "/api/strategies";
        }
      });
      
      // Refetch immédiat
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ["/api/strategies"] });
        queryClient.refetchQueries({ queryKey: ["/api/strategies", userId] });
      }, 100);
      
      console.log('Strategies saved successfully, caches invalidated');
      onSuccess?.();
    },
    onError: (error) => {
      console.error("Error saving strategies:", error);
      console.error("Error details:", {
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        stack: error instanceof Error ? error.stack : undefined
      });
      toast({
        title: "Erreur de sauvegarde",
        description: `Impossible de sauvegarder les stratégies: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        variant: "destructive",
      });
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
    console.log('Handle save called, current strategies:', strategies);
    
    const validStrategies = strategies
      .filter(strategy => {
        const hasExercise = strategy.exercise && strategy.exercise.trim().length > 0;
        console.log('Strategy validation:', { 
          id: strategy.id,
          exercise: strategy.exercise, 
          hasExercise,
          context: strategy.context,
          effort: strategy.effort,
          duration: strategy.duration,
          cravingBefore: strategy.cravingBefore,
          cravingAfter: strategy.cravingAfter
        });
        return hasExercise;
      })
      .map(strategy => {
        const mappedStrategy = {
          // Don't include userId here as it will be added by the server
          context: strategy.context,
          exercise: strategy.exercise.trim(),
          effort: strategy.effort,
          duration: Number(strategy.duration),
          cravingBefore: Number(strategy.cravingBefore),
          cravingAfter: Number(strategy.cravingAfter)
        };
        console.log('Mapped strategy:', mappedStrategy);
        return mappedStrategy;
      });

    console.log('Valid strategies to save:', validStrategies);

    if (validStrategies.length === 0) {
      console.warn('No valid strategies found');
      toast({
        title: "Aucune stratégie valide",
        description: "Veuillez remplir au moins une stratégie avec un exercice décrit avant de sauvegarder.",
        variant: "destructive",
      });
      return;
    }

    // Validation supplémentaire avec logs détaillés
    for (let i = 0; i < validStrategies.length; i++) {
      const strategy = validStrategies[i];
      console.log(`Validating strategy ${i + 1}:`, strategy);
      
      if (isNaN(strategy.duration) || strategy.duration < 1 || strategy.duration > 180) {
        console.error(`Invalid duration for strategy ${i + 1}:`, strategy.duration);
        toast({
          title: "Durée invalide",
          description: `La durée de la stratégie ${i + 1} doit être entre 1 et 180 minutes. (Actuel: ${strategy.duration})`,
          variant: "destructive",
        });
        return;
      }
      
      if (isNaN(strategy.cravingBefore) || strategy.cravingBefore < 0 || strategy.cravingBefore > 10) {
        console.error(`Invalid cravingBefore for strategy ${i + 1}:`, strategy.cravingBefore);
        toast({
          title: "Niveau de craving invalide",
          description: `Le craving avant de la stratégie ${i + 1} doit être entre 0 et 10. (Actuel: ${strategy.cravingBefore})`,
          variant: "destructive",
        });
        return;
      }
      
      if (isNaN(strategy.cravingAfter) || strategy.cravingAfter < 0 || strategy.cravingAfter > 10) {
        console.error(`Invalid cravingAfter for strategy ${i + 1}:`, strategy.cravingAfter);
        toast({
          title: "Niveau de craving invalide",
          description: `Le craving après de la stratégie ${i + 1} doit être entre 0 et 10. (Actuel: ${strategy.cravingAfter})`,
          variant: "destructive",
        });
        return;
      }
    }

    console.log('All validation passed. Starting mutation with valid strategies:', validStrategies);
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
        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <div className="min-w-[800px] lg:min-w-full">
            {/* Headers - Desktop */}
            <div className="hidden md:grid md:grid-cols-7 gap-2 p-3 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg text-sm font-medium border border-primary/10">
              <div className="text-center font-semibold text-primary">Contexte</div>
              <div className="text-center font-semibold text-primary">Exercices</div>
              <div className="text-center font-semibold text-primary">Effort / Intensité</div>
              <div className="text-center font-semibold text-primary">Durée (min)</div>
              <div className="text-center font-semibold text-primary">Craving Avant</div>
              <div className="text-center font-semibold text-primary">Craving Après</div>
              <div className="text-center font-semibold text-primary">Actions</div>
            </div>

            {/* Strategy Rows */}
            <div className="space-y-3 mt-4">
              {strategies.map((strategy, index) => (
                <div key={strategy.id} className="border border-border rounded-lg p-3 bg-background hover:bg-muted/30 transition-colors">
                  {/* Mobile Header */}
                  <div className="md:hidden mb-3 flex items-center justify-between">
                    <h4 className="font-medium text-primary">Stratégie #{index + 1}</h4>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {strategy.context === 'leisure' ? 'Loisirs' : 
                         strategy.context === 'home' ? 'Domicile' : 'Travail'}
                      </Badge>
                      {strategies.length > 1 && (
                        <Button
                          onClick={() => removeRow(strategy.id)}
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive h-6 w-6 p-0"
                          data-testid={`button-remove-mobile-${index}`}
                        >
                          <span className="material-icons text-xs">delete</span>
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Content - Responsive Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-7 gap-3 md:gap-2">
                    {/* Context */}
                    <div className="flex flex-col">
                      <label className="block md:hidden text-xs font-medium text-muted-foreground mb-1">Contexte</label>
                      <select
                        value={strategy.context}
                        onChange={(e) => updateStrategy(strategy.id, 'context', e.target.value)}
                        className="w-full p-3 md:p-2 border border-input rounded-lg text-sm bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary"
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
                      <label className="block md:hidden text-xs font-medium text-muted-foreground mb-1">Exercice/Stratégie</label>
                      <textarea
                        value={strategy.exercise}
                        onChange={(e) => updateStrategy(strategy.id, 'exercise', e.target.value)}
                        placeholder="Décrivez votre activité/stratégie en détail..."
                        className="w-full p-3 md:p-2 border border-input rounded-lg text-sm resize-none h-20 md:h-16 bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        data-testid={`textarea-exercise-${index}`}
                      />
                    </div>

                    {/* Effort */}
                    <div>
                      <label className="block md:hidden text-xs font-medium text-muted-foreground mb-1">Effort / Intensité</label>
                      <select
                        value={strategy.effort}
                        onChange={(e) => updateStrategy(strategy.id, 'effort', e.target.value)}
                        className="w-full p-3 md:p-2 border border-input rounded-lg text-sm bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary"
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
                      <label className="block md:hidden text-xs font-medium text-muted-foreground mb-1">Durée (minutes)</label>
                      <input
                        type="number"
                        min="1"
                        max="180"
                        value={strategy.duration}
                        onChange={(e) => updateStrategy(strategy.id, 'duration', Number(e.target.value))}
                        className="w-full p-3 md:p-2 border border-input rounded-lg text-sm bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        data-testid={`input-duration-${index}`}
                      />
                    </div>

                    {/* Craving Before/After - Grouped on Mobile */}
                    <div className="md:hidden">
                      <label className="block text-xs font-medium text-muted-foreground mb-2">Niveau de Craving</label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Avant</label>
                          <select
                            value={strategy.cravingBefore}
                            onChange={(e) => updateStrategy(strategy.id, 'cravingBefore', Number(e.target.value))}
                            className="w-full p-2 border border-input rounded text-sm bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            data-testid={`select-craving-before-mobile-${index}`}
                          >
                            {Array.from({length: 11}, (_, i) => (
                              <option key={i} value={i}>{i}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Après</label>
                          <select
                            value={strategy.cravingAfter}
                            onChange={(e) => updateStrategy(strategy.id, 'cravingAfter', Number(e.target.value))}
                            className="w-full p-2 border border-input rounded text-sm bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            data-testid={`select-craving-after-mobile-${index}`}
                          >
                            {Array.from({length: 11}, (_, i) => (
                              <option key={i} value={i}>{i}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Craving Before - Desktop Only */}
                    <div className="hidden md:block">
                      <select
                        value={strategy.cravingBefore}
                        onChange={(e) => updateStrategy(strategy.id, 'cravingBefore', Number(e.target.value))}
                        className="w-full p-2 border border-input rounded text-sm bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        data-testid={`select-craving-before-${index}`}
                      >
                        {Array.from({length: 11}, (_, i) => (
                          <option key={i} value={i}>{i}</option>
                        ))}
                      </select>
                    </div>

                    {/* Craving After - Desktop Only */}
                    <div className="hidden md:block">
                      <select
                        value={strategy.cravingAfter}
                        onChange={(e) => updateStrategy(strategy.id, 'cravingAfter', Number(e.target.value))}
                        className="w-full p-2 border border-input rounded text-sm bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        data-testid={`select-craving-after-${index}`}
                      >
                        {Array.from({length: 11}, (_, i) => (
                          <option key={i} value={i}>{i}</option>
                        ))}
                      </select>
                    </div>

                    {/* Actions - Desktop Only */}
                    <div className="hidden md:flex justify-center">
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

                  {/* Mobile Results Summary */}
                  <div className="md:hidden mt-3 p-2 bg-muted/20 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Résultat:</span>
                      <div className="flex items-center space-x-2">
                        <Badge variant={strategy.cravingBefore > 6 ? "destructive" : strategy.cravingBefore > 3 ? "secondary" : "default"}>
                          {strategy.cravingBefore}/10
                        </Badge>
                        <span className="material-icons text-xs text-muted-foreground">arrow_forward</span>
                        <Badge variant={strategy.cravingAfter > 6 ? "destructive" : strategy.cravingAfter > 3 ? "secondary" : "default"}>
                          {strategy.cravingAfter}/10
                        </Badge>
                        {strategy.cravingBefore > strategy.cravingAfter && (
                          <Badge className="bg-success text-success-foreground text-xs">
                            -{strategy.cravingBefore - strategy.cravingAfter}
                          </Badge>
                        )}
                      </div>
                    </div>
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
            {saveStrategiesMutation.isPending ? (
              <>
                <span className="material-icons animate-spin mr-2 text-sm">refresh</span>
                Sauvegarde en cours...
              </>
            ) : (
              <>
                <span className="material-icons mr-2 text-sm">save</span>
                Sauvegarder dans l'onglet Suivi
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}