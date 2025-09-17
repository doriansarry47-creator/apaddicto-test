import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Play, 
  Pause, 
  Square, 
  Volume2, 
  VolumeX,
  Eye,
  EyeOff,
  Repeat,
  SkipBack,
  SkipForward
} from 'lucide-react';

interface VisualizationPlayerProps {
  title: string;
  description?: string;
  type: 'guided_imagery' | 'meditation' | 'breathing' | 'visualization';
  duration?: number; // en minutes
  audioUrl?: string;
  videoUrl?: string;
  imageUrl?: string;
  script?: string;
  instructions?: string;
  onComplete?: () => void;
  onProgress?: (progress: number) => void;
}

const VisualizationPlayer: React.FC<VisualizationPlayerProps> = ({
  title,
  description,
  type,
  duration = 10,
  audioUrl,
  videoUrl,
  imageUrl,
  script,
  instructions,
  onComplete,
  onProgress
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState([70]);
  const [showScript, setShowScript] = useState(false);
  const [showVideo, setShowVideo] = useState(true);
  const [notes, setNotes] = useState('');
  const [loop, setLoop] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const durationSeconds = duration * 60;
  const progress = (currentTime / durationSeconds) * 100;

  const typeConfig = {
    guided_imagery: {
      icon: '🌅',
      color: 'bg-blue-500',
      name: 'Imagerie Guidée'
    },
    meditation: {
      icon: '🧘',
      color: 'bg-purple-500', 
      name: 'Méditation'
    },
    breathing: {
      icon: '💨',
      color: 'bg-green-500',
      name: 'Respiration'
    },
    visualization: {
      icon: '👁️',
      color: 'bg-orange-500',
      name: 'Visualisation'
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume[0] / 100;
      audioRef.current.loop = loop;
    }
    if (videoRef.current) {
      videoRef.current.volume = volume[0] / 100;
      videoRef.current.loop = loop;
    }
  }, [volume, loop]);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1;
          if (onProgress) {
            onProgress((newTime / durationSeconds) * 100);
          }
          if (newTime >= durationSeconds) {
            handleComplete();
            return durationSeconds;
          }
          return newTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, durationSeconds, onProgress]);

  const handlePlay = () => {
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.play();
    }
    if (videoRef.current && showVideo) {
      videoRef.current.play();
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const handleStop = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const handleComplete = () => {
    setIsPlaying(false);
    if (onComplete) {
      onComplete();
    }
  };

  const handleSeek = (newProgress: number[]) => {
    const newTime = (newProgress[0] / 100) * durationSeconds;
    setCurrentTime(newTime);
    
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  const skipBackward = () => {
    const newTime = Math.max(0, currentTime - 30);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  const skipForward = () => {
    const newTime = Math.min(durationSeconds, currentTime + 30);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleMute = () => {
    if (volume[0] > 0) {
      setVolume([0]);
    } else {
      setVolume([70]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* En-tête */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <span className="text-2xl">{typeConfig[type].icon}</span>
            <div>
              <h2 className="text-xl">{title}</h2>
              <Badge className={`${typeConfig[type].color} text-white`}>
                {typeConfig[type].name}
              </Badge>
            </div>
          </CardTitle>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </CardHeader>
      </Card>

      {/* Contenu visuel */}
      <Card>
        <CardContent className="p-0">
          {videoUrl && showVideo ? (
            <video
              ref={videoRef}
              className="w-full h-64 object-cover rounded-t-lg"
              poster={imageUrl}
              muted={volume[0] === 0}
            >
              <source src={videoUrl} type="video/mp4" />
              Votre navigateur ne supporte pas la lecture vidéo.
            </video>
          ) : imageUrl ? (
            <img 
              src={imageUrl} 
              alt={title}
              className="w-full h-64 object-cover rounded-t-lg"
            />
          ) : (
            <div className="w-full h-64 bg-gradient-to-br from-blue-400 to-purple-500 rounded-t-lg flex items-center justify-center">
              <span className="text-6xl text-white">{typeConfig[type].icon}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contrôles de lecture */}
      <Card>
        <CardContent className="p-6">
          {/* Progression */}
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(durationSeconds)}</span>
            </div>
            <Slider
              value={[progress]}
              onValueChange={handleSeek}
              max={100}
              min={0}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Boutons de contrôle */}
          <div className="flex items-center justify-center space-x-4 mb-6">
            <Button variant="outline" size="icon" onClick={skipBackward}>
              <SkipBack className="h-4 w-4" />
            </Button>

            {!isPlaying ? (
              <Button size="lg" onClick={handlePlay}>
                <Play className="h-6 w-6" />
              </Button>
            ) : (
              <Button size="lg" variant="outline" onClick={handlePause}>
                <Pause className="h-6 w-6" />
              </Button>
            )}

            <Button variant="outline" size="icon" onClick={handleStop}>
              <Square className="h-4 w-4" />
            </Button>

            <Button variant="outline" size="icon" onClick={skipForward}>
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          {/* Contrôles audio et options */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={toggleMute}>
                {volume[0] > 0 ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
              <Slider
                value={volume}
                onValueChange={setVolume}
                max={100}
                min={0}
                step={5}
                className="w-24"
              />
            </div>

            <div className="flex items-center space-x-2">
              {videoUrl && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowVideo(!showVideo)}
                >
                  {showVideo ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span className="ml-1">{showVideo ? 'Masquer' : 'Vidéo'}</span>
                </Button>
              )}
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setLoop(!loop)}
                className={loop ? 'bg-primary text-primary-foreground' : ''}
              >
                <Repeat className="h-4 w-4" />
                <span className="ml-1">Boucle</span>
              </Button>

              {script && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowScript(!showScript)}
                >
                  <span className="mr-1">📜</span>
                  Script
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      {instructions && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-line">{instructions}</p>
          </CardContent>
        </Card>
      )}

      {/* Script (si affiché) */}
      {showScript && script && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Script de guidage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg max-h-64 overflow-y-auto">
              <p className="whitespace-pre-line text-sm">{script}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes personnelles */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Notes personnelles</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Notez vos observations, ressentis ou réflexions pendant ou après la session..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[100px]"
          />
        </CardContent>
      </Card>

      {/* Éléments audio/vidéo cachés */}
      {audioUrl && (
        <audio
          ref={audioRef}
          preload="auto"
          onError={(e) => console.error('Audio error:', e)}
        >
          <source src={audioUrl} type="audio/mpeg" />
          <source src={audioUrl} type="audio/wav" />
        </audio>
      )}

      {videoUrl && (
        <video
          ref={videoRef}
          className="hidden"
          preload="auto"
          onError={(e) => console.error('Video error:', e)}
        />
      )}
    </div>
  );
};

export default VisualizationPlayer;