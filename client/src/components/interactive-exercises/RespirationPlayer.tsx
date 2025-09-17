import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function RespirationPlayer() {
  const [exercise, setExercise] = useState("coherence");
  const [phase, setPhase] = useState("inspire");
  const [running, setRunning] = useState(false);
  const [durations, setDurations] = useState({
    inspire: 4,
    hold: 4,
    expire: 4,
  });
  const [timeLeft, setTimeLeft] = useState(durations.inspire);
  const [soundOn, setSoundOn] = useState(true);
  const [cycleCount, setCycleCount] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const phasesMap = {
    coherence: ["inspire", "expire"],
    square: ["inspire", "hold", "expire", "hold"],
    triangle: ["inspire", "hold", "expire"],
  };

  const nextPhase = () => {
    const phases = phasesMap[exercise];
    const idx = phases.indexOf(phase);
    const next = phases[(idx + 1) % phases.length];
    
    // Increment cycle count when we complete a full cycle
    if (idx === phases.length - 1) {
      setCycleCount(prev => prev + 1);
    }
    
    setPhase(next);
    setTimeLeft(durations[next]);
    if (soundOn && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // Ignore audio play errors (user interaction required)
      });
    }
  };

  useEffect(() => {
    if (!running) return;
    if (timeLeft <= 0) {
      nextPhase();
      return;
    }
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, running]);

  // Position of the ball depending on exercise + phase
  const getBallPosition = () => {
    if (exercise === "coherence") {
      return phase === "inspire" ? { y: -80 } : { y: 80 };
    }
    if (exercise === "square") {
      if (phase === "inspire") return { x: 80, y: -80 };      // Top right
      if (phase === "hold") return { x: 80, y: 80 };         // Bottom right
      if (phase === "expire") return { x: -80, y: 80 };      // Bottom left
      return { x: -80, y: -80 };                             // Top left (2nd hold)
    }
    if (exercise === "triangle") {
      if (phase === "inspire") return { x: 0, y: -100 };     // Top
      if (phase === "hold") return { x: 87, y: 50 };         // Bottom right
      return { x: -87, y: 50 };                              // Bottom left
    }
    return { x: 0, y: 0 };
  };

  const getPhaseText = (currentPhase: string) => {
    switch (currentPhase) {
      case "inspire": return "Inspirez";
      case "hold": return "Retenez";
      case "expire": return "Expirez";
      default: return currentPhase;
    }
  };

  const getPhaseColor = (currentPhase: string) => {
    switch (currentPhase) {
      case "inspire": return "text-blue-600";
      case "hold": return "text-amber-600";
      case "expire": return "text-green-600";
      default: return "text-gray-600";
    }
  };

  const resetExercise = () => {
    setRunning(false);
    setPhase(phasesMap[exercise][0]);
    setTimeLeft(durations[phasesMap[exercise][0]]);
    setCycleCount(0);
  };

  const startExercise = () => {
    setRunning(true);
    setPhase(phasesMap[exercise][0]);
    setTimeLeft(durations[phasesMap[exercise][0]]);
  };

  return (
    <div className="w-full h-full flex flex-col lg:flex-row bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 overflow-auto">
      <audio ref={audioRef} src="/sounds/bell.mp3" preload="auto" />

      {/* Left Panel - Controls */}
      <div className="w-full lg:w-1/3 p-4 lg:p-6 space-y-4 lg:space-y-6 bg-white/80 backdrop-blur-sm">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl text-center">Exercices de Respiration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Exercise Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Type d'exercice :</label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { value: "coherence", label: "Cohérence cardiaque", icon: "💓", desc: "Inspire/Expire" },
                  { value: "square", label: "Respiration carrée", icon: "⬜", desc: "4 phases égales" },
                  { value: "triangle", label: "Respiration triangle", icon: "🔺", desc: "3 phases fluides" }
                ].map((ex) => (
                  <Button
                    key={ex.value}
                    onClick={() => {
                      setExercise(ex.value);
                      resetExercise();
                    }}
                    variant={exercise === ex.value ? "default" : "outline"}
                    className="justify-start text-left h-auto p-3"
                  >
                    <div className="flex items-center space-x-3 w-full">
                      <span className="text-lg">{ex.icon}</span>
                      <div>
                        <div className="font-medium">{ex.label}</div>
                        <div className="text-xs text-muted-foreground">{ex.desc}</div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Duration Settings */}
            <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-700">Durées (secondes) :</div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-xs text-gray-600">Inspire</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={durations.inspire}
                    onChange={(e) => setDurations(prev => ({ ...prev, inspire: parseInt(e.target.value) || 4 }))}
                    className="w-full text-center p-2 text-sm border rounded"
                    disabled={running}
                  />
                </div>
                {(exercise === "square" || exercise === "triangle") && (
                  <div className="space-y-1">
                    <label className="text-xs text-gray-600">Retenir</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={durations.hold}
                      onChange={(e) => setDurations(prev => ({ ...prev, hold: parseInt(e.target.value) || 4 }))}
                      className="w-full text-center p-2 text-sm border rounded"
                      disabled={running}
                    />
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-xs text-gray-600">Expire</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={durations.expire}
                    onChange={(e) => setDurations(prev => ({ ...prev, expire: parseInt(e.target.value) || 4 }))}
                    className="w-full text-center p-2 text-sm border rounded"
                    disabled={running}
                  />
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-2">
              {!running ? (
                <Button onClick={startExercise} className="w-full bg-green-600 hover:bg-green-700">
                  <span className="material-icons mr-2">play_arrow</span>
                  Commencer
                </Button>
              ) : (
                <Button onClick={() => setRunning(false)} variant="outline" className="w-full">
                  <span className="material-icons mr-2">pause</span>
                  Pause
                </Button>
              )}
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={resetExercise} variant="outline" size="sm">
                  <span className="material-icons mr-1 text-sm">stop</span>
                  Reset
                </Button>
                <Button 
                  onClick={() => setSoundOn(!soundOn)} 
                  variant="outline" 
                  size="sm"
                  className={soundOn ? "bg-blue-50" : ""}
                >
                  <span className="material-icons mr-1 text-sm">
                    {soundOn ? "volume_up" : "volume_off"}
                  </span>
                  {soundOn ? "Son ON" : "Son OFF"}
                </Button>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2 p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Status :</span>
                <Badge variant={running ? "default" : "secondary"}>
                  {running ? "En cours" : "Arrêté"}
                </Badge>
              </div>
              
              <div className="text-center">
                <div className={`text-2xl font-bold ${getPhaseColor(phase)}`}>
                  {getPhaseText(phase)}
                </div>
                <div className="text-lg text-gray-600">
                  {timeLeft}s
                </div>
              </div>
              
              {cycleCount > 0 && (
                <div className="text-center pt-2 border-t border-gray-200">
                  <div className="text-sm text-gray-600">Cycles complétés :</div>
                  <div className="text-lg font-semibold text-primary">{cycleCount}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Panel - Visual Animation */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-8 min-h-[400px] lg:min-h-full">
        <div className="relative">
          {/* Background Circle */}
          <div className="w-80 h-80 lg:w-96 lg:h-96 rounded-full bg-gradient-to-br from-white/40 to-white/20 backdrop-blur-sm border border-white/30 shadow-2xl flex items-center justify-center">
            
            {/* Shape guides */}
            <div className="absolute inset-8 lg:inset-12">
              {exercise === "square" && (
                <svg className="w-full h-full opacity-30" viewBox="0 0 200 200">
                  <rect x="20" y="20" width="160" height="160" stroke="#6366f1" strokeWidth="2" fill="none" strokeDasharray="5,5" />
                  {/* Corner labels */}
                  <text x="185" y="15" fontSize="12" fill="#6366f1" textAnchor="middle" className="text-xs font-medium">Inspire</text>
                  <text x="185" y="195" fontSize="12" fill="#6366f1" textAnchor="middle" className="text-xs font-medium">Retenir</text>
                  <text x="15" y="195" fontSize="12" fill="#6366f1" textAnchor="middle" className="text-xs font-medium">Expire</text>
                  <text x="15" y="15" fontSize="12" fill="#6366f1" textAnchor="middle" className="text-xs font-medium">Retenir</text>
                </svg>
              )}
              
              {exercise === "triangle" && (
                <svg className="w-full h-full opacity-30" viewBox="0 0 200 200">
                  <polygon points="100,20 170,150 30,150" stroke="#10b981" strokeWidth="2" fill="none" strokeDasharray="5,5" />
                  {/* Vertex labels */}
                  <text x="100" y="15" fontSize="12" fill="#10b981" textAnchor="middle" className="text-xs font-medium">Inspire</text>
                  <text x="175" y="160" fontSize="12" fill="#10b981" textAnchor="middle" className="text-xs font-medium">Retenir</text>
                  <text x="25" y="160" fontSize="12" fill="#10b981" textAnchor="middle" className="text-xs font-medium">Expire</text>
                </svg>
              )}

              {exercise === "coherence" && (
                <svg className="w-full h-full opacity-30" viewBox="0 0 200 200">
                  <line x1="100" y1="40" x2="100" y2="160" stroke="#ef4444" strokeWidth="2" strokeDasharray="5,5" />
                  <text x="115" y="45" fontSize="12" fill="#ef4444" className="text-xs font-medium">Inspire</text>
                  <text x="115" y="165" fontSize="12" fill="#ef4444" className="text-xs font-medium">Expire</text>
                </svg>
              )}
            </div>

            {/* Animated breathing guide */}
            <motion.div
              animate={getBallPosition()}
              transition={{ 
                duration: durations[phase], 
                ease: "easeInOut",
                repeat: 0
              }}
              className="relative"
            >
              {/* Main orb */}
              <motion.div
                animate={{ 
                  scale: running ? [1, 1.2, 1] : 1,
                  boxShadow: running ? [
                    "0 0 20px rgba(59, 130, 246, 0.5)",
                    "0 0 40px rgba(59, 130, 246, 0.8)",
                    "0 0 20px rgba(59, 130, 246, 0.5)"
                  ] : "0 0 20px rgba(59, 130, 246, 0.3)"
                }}
                transition={{ 
                  duration: durations[phase] / 2, 
                  repeat: running ? Infinity : 0,
                  repeatType: "reverse"
                }}
                className="w-12 h-12 lg:w-16 lg:h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 shadow-lg flex items-center justify-center"
              >
                <div className="w-6 h-6 lg:w-8 lg:h-8 rounded-full bg-white/80"></div>
              </motion.div>

              {/* Ripple effect */}
              {running && (
                <motion.div
                  animate={{ 
                    scale: [0, 2, 0],
                    opacity: [0.6, 0, 0.6]
                  }}
                  transition={{
                    duration: durations[phase],
                    repeat: Infinity,
                    ease: "easeOut"
                  }}
                  className="absolute inset-0 rounded-full border-2 border-blue-400"
                />
              )}
            </motion.div>

            {/* Center instructions for mobile */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none lg:hidden">
              <div className="text-center bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                <div className={`text-lg font-bold ${getPhaseColor(phase)}`}>
                  {getPhaseText(phase)}
                </div>
                <div className="text-sm text-gray-600">{timeLeft}s</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}