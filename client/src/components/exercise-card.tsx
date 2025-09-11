import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Exercise } from "@/lib/exercises-data";
import { levels, intensities } from "@/lib/exercises-data";

interface ExerciseCardProps {
  exercise: Exercise;
  showStartButton?: boolean;
  onStart?: () => void;
}

export function ExerciseCard({ exercise, showStartButton = true, onStart }: ExerciseCardProps) {
  const getLevelBadgeColor = (level: keyof typeof levels) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'advanced':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      default:
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
    }
  };

  const getIntensityIcon = (intensity: keyof typeof intensities) => {
    switch (intensity) {
      case 'gentle':
        return 'self_improvement';
      case 'moderate':
        return 'fitness_center';
      case 'dynamic':
        return 'flash_on';
      default:
        return 'fitness_center';
    }
  };

  const getButtonColor = () => {
    if (exercise.type === 'emergency') {
      return 'bg-destructive text-destructive-foreground hover:bg-destructive/90';
    }
    if (exercise.type === 'breathing' || exercise.type === 'relaxation') {
      return 'bg-secondary text-secondary-foreground hover:bg-secondary/90';
    }
    return 'bg-primary text-primary-foreground hover:bg-primary/90';
  };

  return (
    <Card 
      className={`shadow-material hover:shadow-material-lg transition-shadow overflow-hidden ${
        exercise.type === 'emergency' ? 'border-2 border-destructive' : ''
      }`}
      data-testid={`card-exercise-${exercise.id}`}
    >
      <img 
        src={exercise.imageUrl} 
        alt={exercise.title}
        className="w-full h-48 object-cover"
        data-testid={`img-exercise-${exercise.id}`}
      />
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-2">
          <Badge 
            className={getLevelBadgeColor(exercise.level)}
            data-testid={`badge-level-${exercise.id}`}
          >
            {levels[exercise.level]}
          </Badge>
          <span className="text-sm text-muted-foreground" data-testid={`text-duration-${exercise.id}`}>
            {exercise.duration} min
          </span>
        </div>
        
        <h4 className="text-lg font-medium text-foreground mb-2" data-testid={`title-exercise-${exercise.id}`}>
          {exercise.title}
        </h4>
        
        <p className="text-sm text-muted-foreground mb-4" data-testid={`description-exercise-${exercise.id}`}>
          {exercise.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-muted-foreground">
            <span className={`material-icons text-base mr-1`}>
              {getIntensityIcon(exercise.intensity)}
            </span>
            <span data-testid={`text-intensity-${exercise.id}`}>
              Intensité {intensities[exercise.intensity].toLowerCase()}
            </span>
          </div>
          
          {showStartButton && (
            <div className="flex items-center gap-2">
              <Link to={`/exercise/${exercise.id}`}>
                <Button
                  size="sm"
                  variant="outline"
                  data-testid={`button-details-${exercise.id}`}
                >
                  Détails
                </Button>
              </Link>
              <Button
                size="sm"
                className={getButtonColor()}
                onClick={onStart}
                data-testid={`button-start-${exercise.id}`}
              >
                Démarrer
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
