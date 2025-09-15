import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Square, Play, Pause, Square as Stop, Settings } from 'lucide-react';

interface SquareBreathingSettings {
  inhaleTime: number;
  holdAfterInhaleTime: number;
  exhaleTime: number;
  holdAfterExhaleTime: number;
  cycles: number;
}

interface SquareBreathingExerciseProps {
  onComplete?: (duration: number) => void;
  onStart?: () => void;
  onStop?: () => void;
}

type Phase = 'inhale' | 'hold-after-inhale' | 'exhale' | 'hold-after-exhale';

export default function SquareBreathingExercise({
  onComplete,
  onStart,
  onStop
}: SquareBreathingExerciseProps) {
  // Settings state
  const [settings, setSettings] = useState<SquareBreathingSettings>({
    inhaleTime: 4,
    holdAfterInhaleTime: 4,
    exhaleTime: 4,
    holdAfterExhaleTime: 4,
    cycles: 8
  });
  
  // Exercise state
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<Phase>('inhale');
  const [cycleCount, setCycleCount] = useState(0);
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  
  // Animation state
  const [ballPosition, setBallPosition] = useState({ x: 0, y: 0 });
  const [ballSize, setBallSize] = useState(12);
  
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  const phaseStartTimeRef = useRef<number>(0);
  
  // Calculate total exercise duration
  const totalExerciseDuration = settings.cycles * (
    settings.inhaleTime + settings.holdAfterInhaleTime + 
    settings.exhaleTime + settings.holdAfterExhaleTime
  );
  
  // Get current phase duration
  const getCurrentPhaseDuration = () => {
    switch (currentPhase) {
      case 'inhale': return settings.inhaleTime;
      case 'hold-after-inhale': return settings.holdAfterInhaleTime;
      case 'exhale': return settings.exhaleTime;
      case 'hold-after-exhale': return settings.holdAfterExhaleTime;
    }
  };
  
  // Calculate ball position on square path
  const calculateBallPosition = (progress: number, phase: Phase) => {
    const size = 200; // Size of the square
    const center = size / 2;
    const padding = 40; // Distance from edge
    
    switch (phase) {
      case 'inhale':
        // Bottom to top (left side)
        return {
          x: padding,
          y: size - padding - (progress * (size - 2 * padding))
        };
      case 'hold-after-inhale':
        // Left to right (top side)
        return {
          x: padding + (progress * (size - 2 * padding)),
          y: padding
        };
      case 'exhale':
        // Top to bottom (right side)
        return {
          x: size - padding,
          y: padding + (progress * (size - 2 * padding))
        };
      case 'hold-after-exhale':
        // Right to left (bottom side)
        return {
          x: size - padding - (progress * (size - 2 * padding)),
          y: size - padding
        };
    }
  };
  
  // Animation loop
  const animate = (timestamp: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
      phaseStartTimeRef.current = timestamp;
    }
    
    const elapsed = (timestamp - startTimeRef.current) / 1000;
    const phaseElapsed = (timestamp - phaseStartTimeRef.current) / 1000;
    const phaseDuration = getCurrentPhaseDuration();
    
    setTotalDuration(elapsed);
    
    // Calculate progress within current phase (0 to 1)
    const progress = Math.min(phaseElapsed / phaseDuration, 1);
    setPhaseProgress(progress);
    
    // Update ball position
    const position = calculateBallPosition(progress, currentPhase);
    setBallPosition(position);
    
    // Update ball size based on phase
    if (currentPhase === 'inhale') {
      setBallSize(12 + (progress * 8)); // Grows during inhale
    } else if (currentPhase === 'exhale') {
      setBallSize(20 - (progress * 8)); // Shrinks during exhale
    } else {
      setBallSize(currentPhase === 'hold-after-inhale' ? 20 : 12); // Hold size
    }
    
    // Check if phase is complete
    if (progress >= 1) {
      // Move to next phase
      let nextPhase: Phase;
      let newCycleCount = cycleCount;
      
      switch (currentPhase) {
        case 'inhale':
          nextPhase = 'hold-after-inhale';
          break;
        case 'hold-after-inhale':
          nextPhase = 'exhale';
          break;
        case 'exhale':
          nextPhase = 'hold-after-exhale';
          break;
        case 'hold-after-exhale':
          nextPhase = 'inhale';
          newCycleCount = cycleCount + 1;
          setCycleCount(newCycleCount);
          break;
      }
      
      if (newCycleCount >= settings.cycles) {
        // Exercise complete
        completeExercise(elapsed);
        return;
      }
      
      setCurrentPhase(nextPhase);
      phaseStartTimeRef.current = timestamp;
    }
    
    if (isRunning && !isPaused) {
      animationRef.current = requestAnimationFrame(animate);
    }
  };
  
  // Start exercise
  const startExercise = () => {
    setIsRunning(true);
    setIsPaused(false);
    setCycleCount(0);
    setCurrentPhase('inhale');
    setTotalDuration(0);
    startTimeRef.current = 0;
    onStart?.();
    animationRef.current = requestAnimationFrame(animate);
  };
  
  // Pause/Resume exercise
  const togglePause = () => {
    if (isPaused) {
      setIsPaused(false);
      startTimeRef.current = 0;
      animationRef.current = requestAnimationFrame(animate);
    } else {
      setIsPaused(true);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
  };
  
  // Stop exercise
  const stopExercise = () => {
    setIsRunning(false);
    setIsPaused(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    onStop?.();
    resetState();
  };
  
  // Complete exercise
  const completeExercise = (duration: number) => {
    setIsRunning(false);
    setIsPaused(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    onComplete?.(duration);
  };
  
  // Reset state
  const resetState = () => {
    setCycleCount(0);
    setCurrentPhase('inhale');
    setPhaseProgress(0);
    setTotalDuration(0);
    setBallPosition({ x: 40, y: 160 });
    setBallSize(12);
    startTimeRef.current = 0;
    phaseStartTimeRef.current = 0;
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  // Initialize ball position
  useEffect(() => {
    if (!isRunning) {
      setBallPosition({ x: 40, y: 160 }); // Start at bottom-left
    }
  }, [isRunning]);
  
  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Get instruction text
  const getInstructionText = () => {
    switch (currentPhase) {
      case 'inhale':
        return 'Inspirez lentement';
      case 'hold-after-inhale':
        return 'Retenez votre souffle';
      case 'exhale':
        return 'Expirez doucement';
      case 'hold-after-exhale':
        return 'Poumons vides, retenez';
      default:
        return 'Préparez-vous...';
    }
  };
  
  // Get phase color
  const getPhaseColor = () => {
    switch (currentPhase) {
      case 'inhale':
        return 'text-blue-600';
      case 'hold-after-inhale':
        return 'text-purple-600';
      case 'exhale':
        return 'text-green-600';
      case 'hold-after-exhale':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };
  
  // Get ball color
  const getBallColor = () => {
    switch (currentPhase) {
      case 'inhale':
        return 'from-blue-400 to-cyan-300';
      case 'hold-after-inhale':
        return 'from-purple-400 to-violet-300';
      case 'exhale':
        return 'from-green-400 to-emerald-300';
      case 'hold-after-exhale':
        return 'from-orange-400 to-yellow-300';
      default:
        return 'from-gray-400 to-slate-300';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl">
          <Square className="h-6 w-6 text-indigo-500" />
          Respiration Carrée
        </CardTitle>
        <p className="text-muted-foreground">
          Suivez la balle le long du carré pour réguler votre respiration
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Settings Panel */}
        {showSettings && (
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-lg">Paramètres</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="inhaleTime">Inspiration (sec)</Label>
                <Input
                  id="inhaleTime"
                  type="number"
                  min="2"
                  max="12"
                  value={settings.inhaleTime}
                  onChange={(e) => setSettings(prev => ({ ...prev, inhaleTime: Number(e.target.value) }))}
                  disabled={isRunning}
                />
              </div>
              <div>
                <Label htmlFor="holdInhale">Rétention (sec)</Label>
                <Input
                  id="holdInhale"
                  type="number"
                  min="0"
                  max="12"
                  value={settings.holdAfterInhaleTime}
                  onChange={(e) => setSettings(prev => ({ ...prev, holdAfterInhaleTime: Number(e.target.value) }))}
                  disabled={isRunning}
                />
              </div>
              <div>
                <Label htmlFor="exhaleTime">Expiration (sec)</Label>
                <Input
                  id="exhaleTime"
                  type="number"
                  min="2"
                  max="12"
                  value={settings.exhaleTime}
                  onChange={(e) => setSettings(prev => ({ ...prev, exhaleTime: Number(e.target.value) }))}
                  disabled={isRunning}
                />
              </div>
              <div>
                <Label htmlFor="holdExhale">Pause (sec)</Label>
                <Input
                  id="holdExhale"
                  type="number"
                  min="0"
                  max="12"
                  value={settings.holdAfterExhaleTime}
                  onChange={(e) => setSettings(prev => ({ ...prev, holdAfterExhaleTime: Number(e.target.value) }))}
                  disabled={isRunning}
                />
              </div>
              <div className="md:col-span-4">
                <Label htmlFor="cycles">Nombre de cycles</Label>
                <Input
                  id="cycles"
                  type="number"
                  min="1"
                  max="50"
                  value={settings.cycles}
                  onChange={(e) => setSettings(prev => ({ ...prev, cycles: Number(e.target.value) }))}
                  disabled={isRunning}
                />
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Status Display */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            <div>Durée: {formatTime(totalDuration)} / {formatTime(totalExerciseDuration)}</div>
            <div>Cycle: {cycleCount} / {settings.cycles}</div>
          </div>
          <div className="flex gap-2">
            <Badge 
              variant="outline" 
              className={`${getPhaseColor().replace('text-', 'bg-').replace('-600', '-100')} ${getPhaseColor()}`}
            >
              {getInstructionText()}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              disabled={isRunning}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Animation Area */}
        <div className="relative h-80 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-lg overflow-hidden">
          {/* Square path visualization */}
          <svg className="absolute inset-4" viewBox="0 0 200 200">
            {/* Square outline */}
            <rect
              x="40"
              y="40"
              width="120"
              height="120"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-muted-foreground/30"
              strokeDasharray="8,4"
            />
            
            {/* Phase labels */}
            <text x="100" y="30" textAnchor="middle" className="text-xs fill-blue-600 font-medium">
              Inspiration ↑
            </text>
            <text x="170" y="105" textAnchor="middle" className="text-xs fill-purple-600 font-medium">
              <tspan x="170" dy="0">Rétention</tspan>
              <tspan x="170" dy="12">→</tspan>
            </text>
            <text x="100" y="185" textAnchor="middle" className="text-xs fill-green-600 font-medium">
              Expiration ↓
            </text>
            <text x="30" y="105" textAnchor="middle" className="text-xs fill-orange-600 font-medium">
              <tspan x="30" dy="0">Pause</tspan>
              <tspan x="30" dy="12">←</tspan>
            </text>
            
            {/* Progress path */}
            {isRunning && (
              <path
                d={`M 40 160 L 40 40 L 160 40 L 160 160 L 40 160`}
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                className={`${getPhaseColor().replace('text-', 'text-').replace('-600', '-400')} opacity-60`}
                strokeDasharray="400"
                strokeDashoffset={400 - (((cycleCount * 4 + ['inhale', 'hold-after-inhale', 'exhale', 'hold-after-exhale'].indexOf(currentPhase) + phaseProgress) / (settings.cycles * 4)) * 400)}
                style={{ transition: 'stroke-dashoffset 0.1s ease-out' }}
              />
            )}
          </svg>
          
          {/* Animated ball */}
          <div
            className={`absolute w-6 h-6 rounded-full bg-gradient-to-r ${getBallColor()} shadow-lg transform -translate-x-1/2 -translate-y-1/2 transition-all duration-100 ease-out`}
            style={{
              left: `${(ballPosition.x / 200) * 100}%`,
              top: `${(ballPosition.y / 200) * 100}%`,
              width: `${ballSize}px`,
              height: `${ballSize}px`,
              boxShadow: `0 0 ${ballSize}px rgba(59, 130, 246, 0.4)`
            }}
          >
            {/* Inner glow effect */}
            <div className="w-full h-full rounded-full bg-white/40 animate-pulse" />
          </div>
          
          {/* Corner indicators */}
          <div className="absolute top-4 left-4 w-3 h-3 rounded-full bg-blue-400 opacity-50" />
          <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-purple-400 opacity-50" />
          <div className="absolute bottom-4 right-4 w-3 h-3 rounded-full bg-green-400 opacity-50" />
          <div className="absolute bottom-4 left-4 w-3 h-3 rounded-full bg-orange-400 opacity-50" />
        </div>
        
        {/* Instruction Text */}
        <div className="text-center py-4">
          <h3 className={`text-2xl font-semibold transition-colors duration-500 ${getPhaseColor()}`}>
            {getInstructionText()}
          </h3>
          <p className="text-muted-foreground mt-2">
            Suivez le mouvement de la balle le long du carré
          </p>
        </div>
        
        {/* Control Buttons */}
        <div className="flex justify-center gap-3">
          {!isRunning ? (
            <Button onClick={startExercise} size="lg" className="gap-2">
              <Play className="h-5 w-5" />
              Commencer
            </Button>
          ) : (
            <>
              <Button onClick={togglePause} variant="outline" size="lg" className="gap-2">
                {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
                {isPaused ? 'Reprendre' : 'Pause'}
              </Button>
              <Button onClick={stopExercise} variant="destructive" size="lg" className="gap-2">
                <Stop className="h-5 w-5" />
                Arrêter
              </Button>
            </>
          )}
        </div>
        
        {/* Progress Bar */}
        {isRunning && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progrès global</span>
              <span>{Math.round((cycleCount / settings.cycles) * 100)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 via-purple-500 via-green-500 to-orange-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(cycleCount / settings.cycles) * 100}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}