import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface CoherenceCardiaqueTimerProps {
  duration?: number; // in minutes, default 5
  onComplete?: () => void;
  onStop?: () => void;
}

export function CoherenceCardiaqueTimer({ 
  duration = 5, 
  onComplete, 
  onStop 
}: CoherenceCardiaqueTimerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [currentCycle, setCurrentCycle] = useState(0);
  const [phase, setPhase] = useState<'inhale' | 'exhale'>('inhale');
  const [phaseTime, setPhaseTime] = useState(0);
  
  const totalDuration = duration * 60; // Convert to seconds
  const totalCycles = duration * 6; // 6 cycles per minute
  const phaseProgress = useRef(0);
  
  // Audio context for breathing sounds (optional)
  const audioContext = useRef<AudioContext | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isRunning && timeElapsed < totalDuration) {
      interval = setInterval(() => {
        setTimeElapsed(prev => {
          const newTime = prev + 0.1; // Update every 100ms for smooth animation
          
          // Calculate current cycle and phase
          const cycleTime = newTime % 10; // 10 seconds per cycle (5 inhale + 5 exhale)
          const newCycle = Math.floor(newTime / 10);
          
          if (cycleTime < 5) {
            setPhase('inhale');
            setPhaseTime(cycleTime);
            phaseProgress.current = (cycleTime / 5) * 100;
          } else {
            setPhase('exhale');
            setPhaseTime(cycleTime - 5);
            phaseProgress.current = ((cycleTime - 5) / 5) * 100;
          }
          
          setCurrentCycle(newCycle);
          
          // Check if completed
          if (newTime >= totalDuration) {
            setIsRunning(false);
            onComplete?.();
          }
          
          return newTime;
        });
      }, 100);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeElapsed, totalDuration, onComplete]);

  const startTimer = () => {
    setIsRunning(true);
    setTimeElapsed(0);
    setCurrentCycle(0);
    setPhase('inhale');
    setPhaseTime(0);
  };

  const stopTimer = () => {
    setIsRunning(false);
    onStop?.();
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeElapsed(0);
    setCurrentCycle(0);
    setPhase('inhale');
    setPhaseTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const overallProgress = (timeElapsed / totalDuration) * 100;
  const remainingTime = totalDuration - timeElapsed;

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-material">
      <CardHeader>
        <CardTitle className="text-center">
          🫀 Cohérence Cardiaque - {duration} minutes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Main Visual Guide */}
        <div className="flex flex-col items-center space-y-4">
          
          {/* Breathing Circle */}
          <div className="relative w-48 h-48 flex items-center justify-center">
            <div 
              className={`
                w-32 h-32 rounded-full border-4 transition-all duration-[5000ms] ease-in-out
                ${phase === 'inhale' 
                  ? 'scale-150 border-blue-400 bg-blue-100 shadow-lg' 
                  : 'scale-100 border-green-400 bg-green-100 shadow-sm'
                }
              `}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <div className="text-2xl font-bold">
                {phase === 'inhale' ? '📨' : '📤'}
              </div>
              <div className="text-lg font-semibold">
                {phase === 'inhale' ? 'Inspirez' : 'Expirez'}
              </div>
              <div className="text-sm text-muted-foreground">
                {Math.ceil(5 - phaseTime)}s
              </div>
            </div>
          </div>

          {/* Phase Progress */}
          <div className="w-full max-w-xs">
            <div className="flex justify-between text-sm text-muted-foreground mb-1">
              <span>{phase === 'inhale' ? 'Inspiration' : 'Expiration'}</span>
              <span>{Math.round(phaseProgress.current)}%</span>
            </div>
            <Progress 
              value={phaseProgress.current} 
              className={`h-2 ${phase === 'inhale' ? 'bg-blue-100' : 'bg-green-100'}`}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="space-y-1">
            <div className="text-2xl font-bold text-primary">
              {formatTime(timeElapsed)}
            </div>
            <div className="text-xs text-muted-foreground">Temps écoulé</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-secondary">
              {formatTime(remainingTime)}
            </div>
            <div className="text-xs text-muted-foreground">Temps restant</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-green-600">
              {currentCycle}
            </div>
            <div className="text-xs text-muted-foreground">Cycles complétés</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-blue-600">
              {totalCycles}
            </div>
            <div className="text-xs text-muted-foreground">Cycles total</div>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Progression générale</span>
            <span>{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="h-3" />
        </div>

        {/* Instructions */}
        {isRunning && (
          <Card className="bg-accent/30">
            <CardContent className="p-4">
              <div className="text-center space-y-2">
                <div className="font-medium">
                  {phase === 'inhale' 
                    ? "Inspirez lentement par le nez..." 
                    : "Expirez doucement par la bouche..."
                  }
                </div>
                <div className="text-sm text-muted-foreground">
                  {phase === 'inhale' 
                    ? "Laissez votre ventre se gonfler naturellement" 
                    : "Relâchez complètement l'air, détendez-vous"
                  }
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Controls */}
        <div className="flex justify-center space-x-4">
          {!isRunning ? (
            <Button 
              onClick={startTimer}
              className="flex items-center space-x-2"
              size="lg"
            >
              <span className="material-icons">play_arrow</span>
              <span>Démarrer</span>
            </Button>
          ) : (
            <>
              <Button 
                onClick={stopTimer}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <span className="material-icons">pause</span>
                <span>Pause</span>
              </Button>
              <Button 
                onClick={resetTimer}
                variant="secondary"
                className="flex items-center space-x-2"
              >
                <span className="material-icons">stop</span>
                <span>Arrêter</span>
              </Button>
            </>
          )}
        </div>

        {/* Tips */}
        {!isRunning && timeElapsed === 0 && (
          <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="text-center space-y-2">
                <div className="font-medium text-blue-900 dark:text-blue-100">
                  💡 Conseils pour une séance efficace
                </div>
                <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <p>• Installez-vous confortablement, pieds au sol</p>
                  <p>• Placez une main sur le ventre, l'autre sur la poitrine</p>
                  <p>• Suivez le rythme du cercle : il grandit → inspirez, il rétrécit → expirez</p>
                  <p>• Si vous perdez le rythme, reprenez calmement</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Completion Message */}
        {!isRunning && timeElapsed >= totalDuration && (
          <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
            <CardContent className="p-4">
              <div className="text-center space-y-2">
                <div className="text-2xl">🎉</div>
                <div className="font-medium text-green-900 dark:text-green-100">
                  Séance de cohérence cardiaque terminée !
                </div>
                <div className="text-sm text-green-800 dark:text-green-200">
                  Vous avez complété {totalCycles} cycles de respiration. 
                  Prenez un moment pour ressentir les bénéfices.
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
      </CardContent>
    </Card>
  );
}