import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Volume2, 
  VolumeX,
  Heart,
  Activity,
  Timer
} from 'lucide-react';

interface IntervalConfig {
  name: string;
  duration: number; // en secondes
  type: 'work' | 'rest' | 'preparation';
  color: string;
}

interface IntervalTimerProps {
  intervals: IntervalConfig[];
  rounds?: number;
  onComplete?: () => void;
  onSessionData?: (data: {
    totalDuration: number;
    completedRounds: number;
    heartRateBefore?: number;
    heartRateAfter?: number;
    stressLevelBefore?: number;
    stressLevelAfter?: number;
  }) => void;
  audioUrl?: string;
  exerciseTitle?: string;
}

const IntervalTimer: React.FC<IntervalTimerProps> = ({
  intervals,
  rounds = 1,
  onComplete,
  onSessionData,
  audioUrl,
  exerciseTitle = 'Exercice'
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [currentIntervalIndex, setCurrentIntervalIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(intervals[0]?.duration || 0);
  const [totalTime, setTotalTime] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [volume, setVolume] = useState([50]);
  const [heartRateBefore, setHeartRateBefore] = useState<number>();
  const [heartRateAfter, setHeartRateAfter] = useState<number>();
  const [stressLevelBefore, setStressLevelBefore] = useState<number>();
  const [stressLevelAfter, setStressLevelAfter] = useState<number>();
  const [showPreSession, setShowPreSession] = useState(true);
  const [showPostSession, setShowPostSession] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentInterval = intervals[currentIntervalIndex];
  const totalDuration = intervals.reduce((sum, interval) => sum + interval.duration, 0) * rounds;
  const progress = ((totalDuration - (timeLeft + (rounds - currentRound) * intervals.reduce((sum, interval) => sum + interval.duration, 0) + intervals.slice(currentIntervalIndex + 1).reduce((sum, interval) => sum + interval.duration, 0))) / totalDuration) * 100;

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.loop = true;
      audioRef.current.volume = volume[0] / 100;
    }
  }, [audioUrl, volume]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
        setTotalTime(prev => prev + 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      // Passer à l'intervalle suivant
      if (currentIntervalIndex < intervals.length - 1) {
        setCurrentIntervalIndex(prev => prev + 1);
        setTimeLeft(intervals[currentIntervalIndex + 1].duration);
      } else if (currentRound < rounds) {
        // Passer au round suivant
        setCurrentRound(prev => prev + 1);
        setCurrentIntervalIndex(0);
        setTimeLeft(intervals[0].duration);
      } else {
        // Session terminée
        completeSession();
      }
    }

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, currentIntervalIndex, currentRound, rounds, intervals]);

  const startTimer = () => {
    setIsRunning(true);
    if (audioEnabled && audioRef.current) {
      audioRef.current.play();
    }
    setShowPreSession(false);
  };

  const pauseTimer = () => {
    setIsRunning(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const stopTimer = () => {
    setIsRunning(false);
    setCurrentRound(1);
    setCurrentIntervalIndex(0);
    setTimeLeft(intervals[0]?.duration || 0);
    setTotalTime(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const resetTimer = () => {
    stopTimer();
    setShowPreSession(true);
    setShowPostSession(false);
  };

  const completeSession = () => {
    setIsRunning(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setShowPostSession(true);
    
    if (onSessionData) {
      onSessionData({
        totalDuration: totalTime,
        completedRounds: currentRound,
        heartRateBefore,
        heartRateAfter,
        stressLevelBefore,
        stressLevelAfter
      });
    }
    
    if (onComplete) {
      onComplete();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
    if (!audioEnabled && isRunning && audioRef.current) {
      audioRef.current.play();
    } else if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  if (showPreSession) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center space-x-2">
            <Activity className="h-6 w-6" />
            <span>{exerciseTitle}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              Préparez-vous pour votre session de {rounds} round{rounds > 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-semibold">Durée totale</div>
                <div className="text-muted-foreground">{formatTime(totalDuration)}</div>
              </div>
              <div>
                <div className="font-semibold">Intervalles</div>
                <div className="text-muted-foreground">{intervals.length} phases</div>
              </div>
            </div>
          </div>

          {/* Mesures pré-session */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium flex items-center space-x-2 mb-2">
                <Heart className="h-4 w-4" />
                <span>Fréquence cardiaque (optionnel)</span>
              </label>
              <input
                type="number"
                placeholder="BPM"
                className="w-full px-3 py-2 border rounded-md"
                value={heartRateBefore || ''}
                onChange={(e) => setHeartRateBefore(e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium flex items-center space-x-2 mb-2">
                <Activity className="h-4 w-4" />
                <span>Niveau de stress (1-10)</span>
              </label>
              <Slider
                value={stressLevelBefore ? [stressLevelBefore] : [5]}
                onValueChange={(value) => setStressLevelBefore(value[0])}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="text-center text-sm text-muted-foreground mt-1">
                {stressLevelBefore || 5}/10
              </div>
            </div>
          </div>

          <Button 
            onClick={startTimer} 
            className="w-full"
            size="lg"
          >
            <Play className="h-5 w-5 mr-2" />
            Commencer la session
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (showPostSession) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center text-green-600">
            ✅ Session terminée !
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              Félicitations ! Vous avez terminé votre session.
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-semibold">Durée totale</div>
                <div className="text-muted-foreground">{formatTime(totalTime)}</div>
              </div>
              <div>
                <div className="font-semibold">Rounds terminés</div>
                <div className="text-muted-foreground">{currentRound}/{rounds}</div>
              </div>
            </div>
          </div>

          {/* Mesures post-session */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium flex items-center space-x-2 mb-2">
                <Heart className="h-4 w-4" />
                <span>Fréquence cardiaque après</span>
              </label>
              <input
                type="number"
                placeholder="BPM"
                className="w-full px-3 py-2 border rounded-md"
                value={heartRateAfter || ''}
                onChange={(e) => setHeartRateAfter(e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium flex items-center space-x-2 mb-2">
                <Activity className="h-4 w-4" />
                <span>Niveau de stress après (1-10)</span>
              </label>
              <Slider
                value={stressLevelAfter ? [stressLevelAfter] : [5]}
                onValueChange={(value) => setStressLevelAfter(value[0])}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="text-center text-sm text-muted-foreground mt-1">
                {stressLevelAfter || 5}/10
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button onClick={resetTimer} variant="outline" className="flex-1">
              <RotateCcw className="h-4 w-4 mr-2" />
              Recommencer
            </Button>
            <Button onClick={onComplete} className="flex-1">
              Terminer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center flex items-center justify-center space-x-2">
          <Timer className="h-6 w-6" />
          <span>{exerciseTitle}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progression générale */}
        <div>
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Progression générale</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>

        {/* Intervalle actuel */}
        <div className="text-center">
          <Badge 
            variant="outline" 
            className="mb-4"
            style={{ 
              borderColor: currentInterval?.color,
              color: currentInterval?.color 
            }}
          >
            {currentInterval?.name}
          </Badge>
          <div className="text-6xl font-mono font-bold mb-2">
            {formatTime(timeLeft)}
          </div>
          <div className="text-sm text-muted-foreground">
            Round {currentRound} / {rounds} • Phase {currentIntervalIndex + 1} / {intervals.length}
          </div>
        </div>

        {/* Contrôles audio */}
        {audioUrl && (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAudio}
            >
              {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            <Slider
              value={volume}
              onValueChange={setVolume}
              max={100}
              min={0}
              step={5}
              className="flex-1"
              disabled={!audioEnabled}
            />
            <span className="text-sm text-muted-foreground w-10">
              {volume[0]}%
            </span>
          </div>
        )}

        {/* Contrôles de la session */}
        <div className="flex justify-center space-x-2">
          {!isRunning ? (
            <Button onClick={startTimer} size="lg">
              <Play className="h-5 w-5 mr-2" />
              Reprendre
            </Button>
          ) : (
            <Button onClick={pauseTimer} variant="outline" size="lg">
              <Pause className="h-5 w-5 mr-2" />
              Pause
            </Button>
          )}
          
          <Button onClick={stopTimer} variant="outline" size="lg">
            <Square className="h-5 w-5 mr-2" />
            Arrêter
          </Button>
          
          <Button onClick={resetTimer} variant="outline" size="lg">
            <RotateCcw className="h-5 w-5 mr-2" />
            Reset
          </Button>
        </div>

        {/* Prochains intervalles */}
        <div>
          <div className="text-sm font-medium mb-2">Prochaines phases :</div>
          <div className="flex flex-wrap gap-1">
            {intervals.slice(currentIntervalIndex + 1).map((interval, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs"
                style={{ 
                  borderColor: interval.color,
                  color: interval.color 
                }}
              >
                {interval.name} ({formatTime(interval.duration)})
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>

      {/* Audio element */}
      {audioUrl && (
        <audio
          ref={audioRef}
          preload="auto"
          onError={(e) => console.error('Audio error:', e)}
        />
      )}
    </Card>
  );
};

export default IntervalTimer;