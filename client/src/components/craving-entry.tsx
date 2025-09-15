import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { InsertCravingEntry } from "@shared/schema";

const triggersCategories = {
  "Régulation émotionnelle": [
    "Recherche de calme / apaisement",
    "Besoin de réduire le stress",
    "Gestion de l'anxiété",
    "Fuir un sentiment de solitude",
    "Combler l'ennui",
    "Échapper à la tristesse ou à la dépression",
    "Besoin de contrôle face à une situation vécue comme chaotique"
  ],
  "Besoin de récompense / plaisir": [
    "Volonté de se récompenser après un effort ou une frustration",
    "Recherche de plaisir immédiat",
    "Comportement associé à une habitude (ex : après le repas, en soirée)",
    "Association à des souvenirs positifs (fêtes, moments entre amis, vacances)"
  ],
  "Besoin physiologique": [
    "Manque d'énergie, fatigue",
    "Besoin de stimulation (se réveiller, rester concentré)",
    "Faim réelle ou perçue",
    "Déséquilibre du sommeil",
    "Désir de réguler une tension corporelle (agitation, inconfort, douleur)"
  ],
  "Contexte social et environnemental": [
    "Influence du groupe / entourage",
    "Présence de signaux visuels, olfactifs ou sonores (odeurs, lieux, pubs, images)",
    "Situations de fête, convivialité",
    "Routines (trajet, pause, moment précis de la journée)"
  ],
  "Besoin identitaire / psychologique profond": [
    "Sentiment d'appartenance (faire comme les autres)",
    "Recherche de valorisation de soi",
    "Besoin de remplir un vide intérieur",
    "Échapper à des pensées intrusives ou ruminations"
  ]
};

const emotions = [
  "Anxiété", "Angoisse", "Peur", "Panique", "Inquiétude", "Nervosité",
  "Tristesse", "Mélancolie", "Désespoir", "Abattement", "Nostalgie", "Chagrin",
  "Colère", "Rage", "Irritabilité", "Indignation", "Exaspération", "Agacement",
  "Frustration", "Déception", "Amertume", "Ressentiment", "Contrariété",
  "Honte", "Embarras", "Humiliation", "Gêne", "Confusion",
  "Culpabilité", "Remords", "Regret", "Auto-critique", "Responsabilité excessive",
  "Vide", "Ennui", "Apathie", "Indifférence", "Détachement", "Isolement",
  "Excitation", "Euphorie", "Joie excessive", "Hyperactivité émotionnelle",
  "Jalousie", "Envie", "Possessivité", "Comparaison sociale",
  "Solitude", "Abandon", "Rejet", "Exclusion", "Incompréhension"
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
      queryClient.invalidateQueries({ queryKey: ["/api/cravings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cravings/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users/stats"] });
      
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
          
          {/* Selected Triggers Display */}
          {selectedTriggers.length > 0 && (
            <div className="mb-4">
              <div className="text-xs text-muted-foreground mb-2">Déclencheurs sélectionnés :</div>
              <div className="flex flex-wrap gap-1">
                {selectedTriggers.map((trigger, index) => (
                  <Badge
                    key={index}
                    variant="default"
                    className="text-xs cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => toggleTrigger(trigger)}
                  >
                    {trigger} ×
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Category Selection */}
          <div className="space-y-3">
            {Object.entries(triggersCategories).map(([category, triggers]) => (
              <div key={category}>
                <Select onValueChange={(value) => toggleTrigger(value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={`🔹 ${category}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {triggers.map((trigger) => (
                      <SelectItem
                        key={trigger}
                        value={trigger}
                        disabled={selectedTriggers.includes(trigger)}
                      >
                        {selectedTriggers.includes(trigger) ? `✓ ${trigger}` : trigger}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
