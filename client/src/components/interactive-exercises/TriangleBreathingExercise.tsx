import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Triangle, Play, Pause, Square, Settings } from 'lucide-react';

interface TriangleBreathingSettings {
  inhaleTime: number;
  holdTime: number;
  exhaleTime: number;
  cycles: number;
}

interface TriangleBreathingExerciseProps {
  onComplete?: (duration: number) => void;
  onStart?: () => void;
  onStop?: () => void;
}

type Phase = 'inhale' | 'hold' | 'exhale';

export default function TriangleBreathingExercise({
  onComplete,
  onStart,
  onStop
}: TriangleBreathingExerciseProps) {
  // Settings state
  const [settings, setSettings] = useState<TriangleBreathingSettings>({
    inhaleTime: 4,
    holdTime: 4,
    exhaleTime: 4,
    cycles: 10
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
  const [ballSize, setBallSize] = useState(14);
  
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  const phaseStartTimeRef = useRef<number>(0);
  
  // Calculate total exercise duration
  const totalExerciseDuration = settings.cycles * (
    settings.inhaleTime + settings.holdTime + settings.exhaleTime
  );
  
  // Get current phase duration
  const getCurrentPhaseDuration = () => {
    switch (currentPhase) {
      case 'inhale': return settings.inhaleTime;
      case 'hold': return settings.holdTime;
      case 'exhale': return settings.exhaleTime;
    }
  };
  
  // Calculate ball position on triangle path
  const calculateBallPosition = (progress: number, phase: Phase) => {
    const centerX = 150;
    const centerY = 120;
    const radius = 80;
    
    // Triangle vertices (equilateral triangle)
    const vertices = [
      { x: centerX, y: centerY - radius }, // Top vertex
      { x: centerX + radius * Math.cos(Math.PI / 6), y: centerY + radius * Math.sin(Math.PI / 6) }, // Bottom right
      { x: centerX - radius * Math.cos(Math.PI / 6), y: centerY + radius * Math.sin(Math.PI / 6) }  // Bottom left
    ];
    
    let startVertex, endVertex;
    
    switch (phase) {
      case 'inhale':
        // Bottom left to top
        startVertex = vertices[2];
        endVertex = vertices[0];
        break;
      case 'hold':
        // Top to bottom right
        startVertex = vertices[0];
        endVertex = vertices[1];
        break;
      case 'exhale':
        // Bottom right to bottom left
        startVertex = vertices[1];
        endVertex = vertices[2];
        break;
    }
    
    // Linear interpolation between vertices
    return {
      x: startVertex.x + (endVertex.x - startVertex.x) * progress,
      y: startVertex.y + (endVertex.y - startVertex.y) * progress
    };
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
    switch (currentPhase) {
      case 'inhale':
        setBallSize(14 + (progress * 10)); // Grows during inhale
        break;
      case 'hold':
        setBallSize(24); // Maximum size during hold
        break;
      case 'exhale':
        setBallSize(24 - (progress * 10)); // Shrinks during exhale
        break;
    }
    
    // Check if phase is complete
    if (progress >= 1) {
      // Move to next phase
      let nextPhase: Phase;
      let newCycleCount = cycleCount;
      
      switch (currentPhase) {
        case 'inhale':
          nextPhase = 'hold';
          break;
        case 'hold':
          nextPhase = 'exhale';
          break;
        case 'exhale':
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
    // Start position: bottom left vertex
    setBallPosition({ x: 84, y: 189 });
    setBallSize(14);
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
      // Bottom left vertex position
      setBallPosition({ x: 84, y: 189 });
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
        return 'Inspirez profondément';
      case 'hold':
        return 'Retenez votre souffle';
      case 'exhale':
        return 'Expirez lentement';
      default:
        return 'Préparez-vous...';
    }
  };
  
  // Get phase color
  const getPhaseColor = () => {
    switch (currentPhase) {
      case 'inhale':
        return 'text-blue-600';
      case 'hold':
        return 'text-purple-600';
      case 'exhale':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };
  
  // Get ball color
  const getBallColor = () => {
    switch (currentPhase) {
      case 'inhale':
        return 'from-blue-400 to-cyan-300';
      case 'hold':
        return 'from-purple-400 to-violet-300';
      case 'exhale':
        return 'from-green-400 to-emerald-300';
      default:
        return 'from-gray-400 to-slate-300';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl">
          <Triangle className="h-6 w-6 text-emerald-500" />
          Respiration Triangle
        </CardTitle>
        <p className="text-muted-foreground">
          Suivez la balle le long du triangle pour une respiration équilibrée
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
                <Label htmlFor="holdTime">Rétention (sec)</Label>
                <Input
                  id="holdTime"
                  type="number"
                  min="1"
                  max="12"
                  value={settings.holdTime}
                  onChange={(e) => setSettings(prev => ({ ...prev, holdTime: Number(e.target.value) }))}
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
              <div className="md:col-span-3">
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
          {/* Triangle path visualization */}
          <svg className="absolute inset-4" viewBox="0 0 300 240">
            {/* Triangle outline */}
            <polygon
              points="150,40 219.28,169 80.72,169"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-muted-foreground/30"
              strokeDasharray="10,5"
            />
            
            {/* Vertex circles */}
            <circle cx="150" cy="40" r="6" className="fill-blue-400 opacity-60" />
            <circle cx="219.28" cy="169" r="6" className="fill-purple-400 opacity-60" />
            <circle cx="80.72" cy="169" r="6" className="fill-green-400 opacity-60" />
            
            {/* Phase labels */}
            <text x="115" y="100" className="text-sm fill-blue-600 font-medium">
              <tspan x="115" dy="0">Inspiration</tspan>
              <tspan x="125" dy="15">↗</tspan>
            </text>
            <text x="185" y="100" className="text-sm fill-purple-600 font-medium">
              <tspan x="185" dy="0">Rétention</tspan>
              <tspan x="195" dy="15">↘</tspan>
            </text>
            <text x="150" y="200" textAnchor="middle" className="text-sm fill-green-600 font-medium">
              Expiration ←
            </text>
            
            {/* Progress indicator */}
            {isRunning && (
              <>
                {/* Current path segment highlight */}
                {currentPhase === 'inhale' && (
                  <line
                    x1="80.72"
                    y1="169"
                    x2={80.72 + (150 - 80.72) * phaseProgress}
                    y2={169 + (40 - 169) * phaseProgress}
                    stroke="currentColor"
                    strokeWidth="6"
                    className="text-blue-400 opacity-80"
                    strokeLinecap="round"
                  />
                )}
                {currentPhase === 'hold' && (
                  <line
                    x1="150"
                    y1="40"
                    x2={150 + (219.28 - 150) * phaseProgress}
                    y2={40 + (169 - 40) * phaseProgress}
                    stroke="currentColor"
                    strokeWidth="6"
                    className="text-purple-400 opacity-80"
                    strokeLinecap="round"
                  />
                )}
                {currentPhase === 'exhale' && (
                  <line
                    x1="219.28"
                    y1="169"
                    x2={219.28 + (80.72 - 219.28) * phaseProgress}
                    y2="169"
                    stroke="currentColor"
                    strokeWidth="6"
                    className="text-green-400 opacity-80"
                    strokeLinecap="round"
                  />
                )}
              </>
            )}
          </svg>
          
          {/* Animated ball */}
          <div
            className={`absolute rounded-full bg-gradient-to-r ${getBallColor()} shadow-lg transform -translate-x-1/2 -translate-y-1/2 transition-all duration-100 ease-out`}
            style={{
              left: `${(ballPosition.x / 300) * 100}%`,
              top: `${(ballPosition.y / 240) * 100}%`,
              width: `${ballSize}px`,
              height: `${ballSize}px`,
              boxShadow: `0 0 ${ballSize * 1.5}px rgba(59, 130, 246, 0.4)`
            }}
          >
            {/* Inner glow effect */}
            <div 
              className="w-full h-full rounded-full bg-white/40"
              style={{
                animation: `pulse ${getCurrentPhaseDuration()}s infinite ease-in-out`
              }}
            />
          </div>
          
          {/* Floating particles for ambiance */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-1.5 h-1.5 rounded-full bg-gradient-to-r ${getBallColor()} opacity-30`}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `float ${3 + Math.random() * 4}s infinite ease-in-out`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        </div>
        
        {/* Instruction Text */}
        <div className="text-center py-4">
          <h3 className={`text-2xl font-semibold transition-colors duration-500 ${getPhaseColor()}`}>
            {getInstructionText()}
          </h3>
          <p className="text-muted-foreground mt-2">
            Suivez le mouvement de la balle le long du triangle
          </p>
          {isRunning && (
            <div className="mt-2 text-sm text-muted-foreground">
              Temps restant dans cette phase: {Math.ceil(getCurrentPhaseDuration() - (getCurrentPhaseDuration() * phaseProgress))}s
            </div>
          )}
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
                className="bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(cycleCount / settings.cycles) * 100}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
      
      {/* Custom CSS for floating animation */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.2;
          }
          50% {
            transform: translateY(-10px) rotate(180deg);
            opacity: 0.6;
          }
        }
      `}</style>
    </Card>
  );
}