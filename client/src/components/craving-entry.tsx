import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { InsertCravingEntry } from "@shared/schema";

const triggers = [
  "Stress", "Ennui", "Solitude", "Conflit", "Fatigue", "Frustration", "Pression sociale", "Nostalgie"
];

const emotions = [
  "Anxiété", "Tristesse", "Colère", "Frustration", "Honte", "Culpabilité", "Vide", "Irritabilité"
];

interface CravingEntryProps {
  userId: string;
  onSuccess?: () => void;
}

export function CravingEntry({ userId, onSuccess }: CravingEntryProps) {
  const [intensity, setIntensity] = useState(5);
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createCravingMutation = useMutation({
    mutationFn: async (data: InsertCravingEntry) => {
      return await apiRequest("POST", "/api/cravings", data);
    },
    onSuccess: () => {
      toast({
        title: "Craving enregistré",
        description: "Votre craving a été enregistré avec succès.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cravings", userId] });
      queryClient.invalidateQueries({ queryKey: ["/api/cravings", userId, "stats"] });
      
      // Reset form
      setIntensity(5);
      setSelectedTriggers([]);
      setSelectedEmotions([]);
      setNotes("");
      
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer le craving. Veuillez réessayer.",
        variant: "destructive",
      });
      console.error("Error creating craving entry:", error);
    },
  });

  const toggleTrigger = (trigger: string) => {
    setSelectedTriggers(prev => 
      prev.includes(trigger) 
        ? prev.filter(t => t !== trigger)
        : [...prev, trigger]
    );
  };

  const toggleEmotion = (emotion: string) => {
    setSelectedEmotions(prev => 
      prev.includes(emotion) 
        ? prev.filter(e => e !== emotion)
        : [...prev, emotion]
    );
  };

  const handleSubmit = () => {
    createCravingMutation.mutate({
      userId,
      intensity,
      triggers: selectedTriggers,
      emotions: selectedEmotions,
      notes: notes.trim() || null,
    });
  };

  const getSliderColor = (value: number) => {
    if (value <= 3) return "bg-success";
    if (value <= 6) return "bg-warning";
    return "bg-destructive";
  };

  return (
    <Card className="shadow-material" data-testid="card-craving-entry">
      <CardHeader>
        <CardTitle className="flex items-center text-lg font-medium">
          <span className="material-icons mr-2 text-primary">psychology</span>
          Enregistrer un Craving
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Intensity Slider */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Intensité du craving: <span className="font-bold text-primary" data-testid="text-intensity">{intensity}</span>/10
          </label>
          <div className="relative">
            <input 
              type="range" 
              min="0" 
              max="10" 
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
              className="w-full h-2 craving-slider rounded-lg cursor-pointer"
              data-testid="slider-intensity"
            />
          </div>
        </div>

        {/* Triggers */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">Déclencheurs identifiés</label>
          <div className="flex flex-wrap gap-2">
            {triggers.map((trigger) => (
              <Button
                key={trigger}
                variant={selectedTriggers.includes(trigger) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleTrigger(trigger)}
                className="text-xs"
                data-testid={`button-trigger-${trigger.toLowerCase()}`}
              >
                {trigger}
              </Button>
            ))}
          </div>
        </div>

        {/* Emotions */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">Émotions ressenties</label>
          <div className="flex flex-wrap gap-2">
            {emotions.map((emotion) => (
              <Button
                key={emotion}
                variant={selectedEmotions.includes(emotion) ? "secondary" : "outline"}
                size="sm"
                onClick={() => toggleEmotion(emotion)}
                className="text-xs"
                data-testid={`button-emotion-${emotion.toLowerCase()}`}
              >
                {emotion}
              </Button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Notes (optionnel)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-3 border border-input rounded-lg resize-none h-20 text-sm bg-background"
            placeholder="Ajoutez des détails sur votre ressenti ou la situation..."
            data-testid="textarea-notes"
          />
        </div>

        <Button 
          onClick={handleSubmit}
          disabled={createCravingMutation.isPending}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          data-testid="button-save-craving"
        >
          {createCravingMutation.isPending ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </CardContent>
    </Card>
  );
}
