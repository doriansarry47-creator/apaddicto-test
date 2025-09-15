import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Heart, Play, Pause, Square, Settings } from 'lucide-react';

interface HeartCoherenceSettings {
  inhaleTime: number;
  exhaleTime: number;
  cycles: number;
}

interface HeartCoherenceExerciseProps {
  onComplete?: (duration: number) => void;
  onStart?: () => void;
  onStop?: () => void;
}

type Phase = 'inhale' | 'exhale' | 'hold';

export default function HeartCoherenceExercise({
  onComplete,
  onStart,
  onStop
}: HeartCoherenceExerciseProps) {
  // Settings state
  const [settings, setSettings] = useState<HeartCoherenceSettings>({
    inhaleTime: 4, // seconds
    exhaleTime: 4, // seconds  
    cycles: 10 // number of complete breath cycles
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
  const [ballScale, setBallScale] = useState(0.5);
  const [ballOpacity, setBallOpacity] = useState(0.7);
  
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  const phaseStartTimeRef = useRef<number>(0);
  
  // Calculate total exercise duration
  const totalExerciseDuration = settings.cycles * (settings.inhaleTime + settings.exhaleTime);
  
  // Phase durations
  const getCurrentPhaseDuration = () => {
    return currentPhase === 'inhale' ? settings.inhaleTime : settings.exhaleTime;
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
    
    // Animate ball based on phase and progress
    if (currentPhase === 'inhale') {
      // Ball grows during inhale
      setBallScale(0.5 + (progress * 0.7)); // Scale from 0.5 to 1.2
      setBallOpacity(0.7 + (progress * 0.3)); // Opacity from 0.7 to 1.0
    } else {
      // Ball shrinks during exhale
      setBallScale(1.2 - (progress * 0.7)); // Scale from 1.2 to 0.5
      setBallOpacity(1.0 - (progress * 0.3)); // Opacity from 1.0 to 0.7
    }
    
    // Check if phase is complete
    if (progress >= 1) {
      // Move to next phase
      if (currentPhase === 'inhale') {
        setCurrentPhase('exhale');
      } else {
        // Complete cycle
        const newCycleCount = cycleCount + 1;
        setCycleCount(newCycleCount);
        
        if (newCycleCount >= settings.cycles) {
          // Exercise complete
          completeExercise(elapsed);
          return;
        } else {
          setCurrentPhase('inhale');
        }
      }
      
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
      startTimeRef.current = 0; // Reset timing
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
    setBallScale(0.5);
    setBallOpacity(0.7);
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
        return 'Inspirez lentement et profondément';
      case 'exhale':
        return 'Expirez doucement et complètement';
      default:
        return 'Préparez-vous...';
    }
  };
  
  // Get phase color
  const getPhaseColor = () => {
    switch (currentPhase) {
      case 'inhale':
        return 'from-blue-400 to-cyan-300';
      case 'exhale':
        return 'from-green-400 to-emerald-300';
      default:
        return 'from-purple-400 to-pink-300';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl">
          <Heart className="h-6 w-6 text-red-500" />
          Cohérence Cardiaque
        </CardTitle>
        <p className="text-muted-foreground">
          Synchronisez votre respiration avec le mouvement de la balle
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Settings Panel */}
        {showSettings && (
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-lg">Paramètres</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <Label htmlFor="cycles">Cycles</Label>
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
            <Badge variant="outline" className={currentPhase === 'inhale' ? 'bg-blue-100 text-blue-800' : ''}>
              {currentPhase === 'inhale' ? 'Inspiration' : 'Expiration'}
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
          {/* Background particles effect */}
          <div className="absolute inset-0 opacity-20">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-1 h-1 bg-gradient-to-r ${getPhaseColor()} rounded-full animate-pulse`}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>
          
          {/* Main breathing ball */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className={`w-32 h-32 rounded-full bg-gradient-to-r ${getPhaseColor()} shadow-2xl transition-all duration-100 ease-out`}
              style={{
                transform: `scale(${ballScale})`,
                opacity: ballOpacity,
                boxShadow: `0 0 ${ballScale * 50}px rgba(59, 130, 246, ${ballOpacity * 0.5})`
              }}
            >
              {/* Inner glow */}
              <div 
                className="w-full h-full rounded-full bg-white/20 animate-pulse"
                style={{
                  animationDuration: `${getCurrentPhaseDuration()}s`
                }}
              />
            </div>
          </div>
          
          {/* Progress ring */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-muted-foreground/20"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className={`${currentPhase === 'inhale' ? 'text-blue-500' : 'text-green-500'} transition-colors duration-500`}
                strokeDasharray={`${phaseProgress * 283} 283`}
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
        
        {/* Instruction Text */}
        <div className="text-center py-4">
          <h3 className={`text-2xl font-semibold transition-colors duration-500 ${
            currentPhase === 'inhale' ? 'text-blue-600' : 'text-green-600'
          }`}>
            {getInstructionText()}
          </h3>
          <p className="text-muted-foreground mt-2">
            Suivez le mouvement de la balle avec votre respiration
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
                <Square className="h-5 w-5" />
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
                className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(cycleCount / settings.cycles) * 100}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}