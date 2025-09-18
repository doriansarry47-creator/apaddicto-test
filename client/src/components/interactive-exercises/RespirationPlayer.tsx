import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Heart, Square, Triangle, Play, Pause, Square as StopIcon, Maximize2, Minimize2 } from "lucide-react";

// RespirationPlayer.tsx
// Single-file React component (Tailwind) that provides a patient-facing UI
// for three guided breathing exercises: coherence (vertical ball), square, triangle.
// Patient can choose durations for each phase before launching the exercise.

export default function RespirationPlayer() {
  const [mode, setMode] = useState("coherence"); // "coherence" | "square" | "triangle"
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Default durations (in seconds) for each exercise template
  const defaultDurations = {
    coherence: { inhale: 4, exhale: 6 },
    square: { inhale: 4, holdHigh: 4, exhale: 4, holdLow: 4 },
    triangle: { inhale: 4, hold: 2, exhale: 4 }
  };

  const [durations, setDurations] = useState(defaultDurations);

  // Player state
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [phaseProgress, setPhaseProgress] = useState(0); // 0..1
  const tickRef = useRef(null);
  const phaseStartRef = useRef(null);

  // Derived phases array based on mode and current durations
  function getPhases(mode) {
    if (mode === "coherence") {
      return [
        { key: "inhale", label: "Inspirez", duration: durations.coherence.inhale },
        { key: "exhale", label: "Expirez", duration: durations.coherence.exhale }
      ];
    }
    if (mode === "square") {
      return [
        { key: "inhale", label: "Inspirez", duration: durations.square.inhale },
        { key: "holdHigh", label: "Bloquez", duration: durations.square.holdHigh },
        { key: "exhale", label: "Expirez", duration: durations.square.exhale },
        { key: "holdLow", label: "Restez vide", duration: durations.square.holdLow }
      ];
    }
    // triangle
    return [
      { key: "inhale", label: "Inspirez", duration: durations.triangle.inhale },
      { key: "hold", label: "Bloquez", duration: durations.triangle.hold },
      { key: "exhale", label: "Expirez", duration: durations.triangle.exhale }
    ];
  }

  const phases = getPhases(mode);

  // Reset function
  function resetPlayer() {
    setRunning(false);
    setPaused(false);
    setCurrentPhaseIndex(0);
    setPhaseProgress(0);
    phaseStartRef.current = null;
    if (tickRef.current) {
      cancelAnimationFrame(tickRef.current);
      tickRef.current = null;
    }
  }

  // Start / resume
  function startPlayer() {
    if (running && paused) {
      setPaused(false);
      phaseStartRef.current = performance.now() - phaseProgress * phases[currentPhaseIndex].duration * 1000;
      tick();
      return;
    }
    // fresh start
    setRunning(true);
    setPaused(false);
    setCurrentPhaseIndex(0);
    setPhaseProgress(0);
    phaseStartRef.current = performance.now();
    tick();
  }

  function pausePlayer() {
    setPaused(true);
    if (tickRef.current) {
      cancelAnimationFrame(tickRef.current);
      tickRef.current = null;
    }
  }

  // animation loop using rAF to update progress
  function tick() {
    tickRef.current = requestAnimationFrame((now) => {
      if (!phaseStartRef.current) phaseStartRef.current = now;
      const phase = phases[currentPhaseIndex];
      const elapsed = (now - phaseStartRef.current) / 1000; // seconds
      const progress = Math.min(1, phase.duration > 0 ? elapsed / phase.duration : 1);
      setPhaseProgress(progress);
      if (progress >= 1) {
        // move to next phase
        const next = (currentPhaseIndex + 1) % phases.length; // loop indefinitely
        setCurrentPhaseIndex(next);
        phaseStartRef.current = now;
        setPhaseProgress(0);
        tickRef.current = null;
        tick();
      } else {
        tickRef.current = null;
        tick();
      }
    });
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (tickRef.current) cancelAnimationFrame(tickRef.current);
    };
  }, []);

  // When mode or durations change, reset player to be safe
  useEffect(() => {
    resetPlayer();
  }, [mode, durations]);

  // Helpers for UI controls
  function updateDuration(template, key, value) {
    setDurations((d) => ({ ...d, [template]: { ...d[template], [key]: Math.max(0.5, Number(value)) } }));
  }

  // Compute visual position of ball depending on mode and phase progress
  function computeBallStyle() {
    // shared container is 200x200
    if (mode === "coherence") {
      // vertical movement: bottom (0%) -> top (100%) on inhale, reverse on exhale
      const phase = phases[currentPhaseIndex];
      const isInhale = phase.key === "inhale";
      const t = isInhale ? phaseProgress : 1 - phaseProgress;
      const y = 100 - t * 80; // px from top inside 200px (20px padding)
      return { transform: `translateY(${y}px)` };
    }

    if (mode === "square") {
      // square perimeter: top-left -> top-right -> bottom-right -> bottom-left -> back
      // map each phase to a side movement
      const side = currentPhaseIndex % 4; // 0..3
      const p = phaseProgress;
      const size = 160; // inner square size
      const pad = 20;
      let x = pad;
      let y = pad;
      if (side === 0) {
        // top: left -> right
        x = pad + p * size;
        y = pad;
      } else if (side === 1) {
        // right: top -> bottom
        x = pad + size;
        y = pad + p * size;
      } else if (side === 2) {
        // bottom: right -> left
        x = pad + size - p * size;
        y = pad + size;
      } else {
        // left: bottom -> top
        x = pad;
        y = pad + size - p * size;
      }
      return { transform: `translate(${x}px, ${y}px)` };
    }

    // triangle
    if (mode === "triangle") {
      // triangle points (equilateral) inside 180x156 box
      const pad = 20;
      const size = 160;
      const h = (Math.sqrt(3) / 2) * size; // height
      const p = phaseProgress;
      // vertices: A (pad, pad+h), B (pad+size/2, pad), C (pad+size, pad+h)
      const A = { x: pad, y: pad + h };
      const B = { x: pad + size / 2, y: pad };
      const C = { x: pad + size, y: pad + h };
      // sides mapping: inhale A->B, hold B (no movement), exhale B->C
      if (currentPhaseIndex === 0) {
        // A -> B
        const x = A.x + (B.x - A.x) * p;
        const y = A.y + (B.y - A.y) * p;
        return { transform: `translate(${x}px, ${y}px)` };
      } else if (currentPhaseIndex === 1) {
        // hold at B
        return { transform: `translate(${B.x}px, ${B.y}px)` };
      } else {
        // exhale B -> C
        const x = B.x + (C.x - B.x) * p;
        const y = B.y + (C.y - B.y) * p;
        return { transform: `translate(${x}px, ${y}px)` };
      }
    }

    return {};
  }

  const ballStyle = computeBallStyle();

  // Remaining time display for current phase
  const currentPhaseDuration = phases[currentPhaseIndex]?.duration || 0;
  const remainingSeconds = Math.max(0, Math.ceil((1 - phaseProgress) * currentPhaseDuration));

  const containerClasses = isFullscreen 
    ? "fixed inset-0 z-50 bg-gradient-to-b from-sky-50 via-emerald-50 to-violet-50 flex items-center justify-center p-6"
    : "bg-gradient-to-b from-sky-50 via-emerald-50 to-violet-50 rounded-2xl p-6";

  const contentClasses = isFullscreen
    ? "w-full max-w-6xl bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 grid grid-cols-1 lg:grid-cols-2 gap-8"
    : "w-full bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6";

  return (
    <div className={containerClasses}>
      <div className={contentClasses}>
        {/* Left: Controls */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Exercices de respiration</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="ml-2"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            Choisissez un exercice et adaptez les durées selon vos besoins avant de commencer.
          </p>

          <div className="flex gap-2 mb-6">
            <Button 
              onClick={() => setMode("coherence")} 
              variant={mode === "coherence" ? "default" : "outline"}
              className="flex items-center gap-2"
            >
              <Heart className="h-4 w-4" />
              Cohérence
            </Button>
            <Button 
              onClick={() => setMode("square")} 
              variant={mode === "square" ? "default" : "outline"}
              className="flex items-center gap-2"
            >
              <Square className="h-4 w-4" />
              Carrée
            </Button>
            <Button 
              onClick={() => setMode("triangle")} 
              variant={mode === "triangle" ? "default" : "outline"}
              className="flex items-center gap-2"
            >
              <Triangle className="h-4 w-4" />
              Triangulaire
            </Button>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Configuration des durées</CardTitle>
            </CardHeader>
            <CardContent>
              {mode === "coherence" && (
                <div className="space-y-4">
                  <DurationControl 
                    label="Inspiration" 
                    value={durations.coherence.inhale} 
                    onChange={(v) => updateDuration("coherence", "inhale", v)} 
                  />
                  <DurationControl 
                    label="Expiration" 
                    value={durations.coherence.exhale} 
                    onChange={(v) => updateDuration("coherence", "exhale", v)} 
                  />
                </div>
              )}

              {mode === "square" && (
                <div className="space-y-4">
                  <DurationControl 
                    label="Inspiration" 
                    value={durations.square.inhale} 
                    onChange={(v) => updateDuration("square", "inhale", v)} 
                  />
                  <DurationControl 
                    label="Blocage (plein)" 
                    value={durations.square.holdHigh} 
                    onChange={(v) => updateDuration("square", "holdHigh", v)} 
                  />
                  <DurationControl 
                    label="Expiration" 
                    value={durations.square.exhale} 
                    onChange={(v) => updateDuration("square", "exhale", v)} 
                  />
                  <DurationControl 
                    label="Blocage (vide)" 
                    value={durations.square.holdLow} 
                    onChange={(v) => updateDuration("square", "holdLow", v)} 
                  />
                </div>
              )}

              {mode === "triangle" && (
                <div className="space-y-4">
                  <DurationControl 
                    label="Inspiration" 
                    value={durations.triangle.inhale} 
                    onChange={(v) => updateDuration("triangle", "inhale", v)} 
                  />
                  <DurationControl 
                    label="Blocage" 
                    value={durations.triangle.hold} 
                    onChange={(v) => updateDuration("triangle", "hold", v)} 
                  />
                  <DurationControl 
                    label="Expiration" 
                    value={durations.triangle.exhale} 
                    onChange={(v) => updateDuration("triangle", "exhale", v)} 
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-3 mb-6">
            <Button 
              onClick={startPlayer} 
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600"
              disabled={running && !paused}
            >
              <Play className="h-4 w-4" />
              {running && !paused ? "En cours..." : "Lancer"}
            </Button>
            <Button 
              onClick={pausePlayer} 
              variant="outline" 
              className="flex items-center gap-2"
              disabled={!running || paused}
            >
              <Pause className="h-4 w-4" />
              Pause
            </Button>
            <Button 
              onClick={resetPlayer} 
              variant="outline" 
              className="flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50"
            >
              <StopIcon className="h-4 w-4" />
              Stop
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Phase actuelle:</span>
                  <Badge variant="secondary">
                    {phases[currentPhaseIndex]?.label || "Prêt"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Temps restant:</span>
                  <span className="text-sm font-medium">
                    {running && !paused ? `${remainingSeconds}s` : "—"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Visual */}
        <div className="p-4 flex flex-col items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Visualisation</CardTitle>
                <Badge variant="outline">{mode.toUpperCase()}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative w-64 h-64 bg-gradient-to-br from-blue-50 to-green-50 rounded-xl overflow-hidden mx-auto mb-4" 
                   style={{ boxShadow: 'inset 0 0 40px rgba(120,144,156,0.06)' }}>
                {/* Path visuals */}
                {mode === "square" && (
                  <svg className="absolute left-0 top-0" width="256" height="256" viewBox="0 0 200 200">
                    <rect x="20" y="20" width="160" height="160" rx="12" 
                          stroke="#e0f2fe" strokeWidth="6" fill="none" />
                  </svg>
                )}
                {mode === "triangle" && (
                  <svg className="absolute left-0 top-0" width="256" height="256" viewBox="0 0 200 200">
                    <path d="M20 150 L100 30 L180 150 Z" stroke="#e0f2fe" strokeWidth="6" 
                          fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}

                {/* Ball */}
                <div className="absolute" style={{ left: 0, top: 0 }}>
                  <div className="w-8 h-8 rounded-full shadow-lg flex items-center justify-center" 
                       style={{ 
                         background: 'linear-gradient(135deg, #06b6d4, #10b981)', 
                         transition: 'transform 120ms linear', 
                         ...ballStyle 
                       }}>
                    <div 
                      className="bg-white rounded-full"
                      style={{ 
                        width: 6 + 6 * (0.5 + 0.5 * phaseProgress), 
                        height: 6 + 6 * (0.5 + 0.5 * phaseProgress) 
                      }} 
                    />
                  </div>
                </div>
              </div>

              <div className="text-center mb-4">
                <div className="text-xl font-semibold text-foreground">
                  {phases[currentPhaseIndex]?.label || "Prêt à commencer"}
                </div>
                <div className="text-sm text-muted-foreground">
                  {running ? (paused ? 'En pause' : `Phase ${currentPhaseIndex + 1} / ${phases.length}`) : 'Configurez et appuyez sur Lancer'}
                </div>
              </div>

              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-400 to-blue-400 transition-all duration-150" 
                  style={{ width: `${Math.round(phaseProgress * 100)}%` }} 
                />
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground mt-4 max-w-sm">
            Suivez la balle et les instructions pour synchroniser votre respiration. 
            L'exercice boucle automatiquement pour une pratique continue.
          </p>
        </div>
      </div>
    </div>
  );
}

function DurationControl({ label, value, onChange }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">{label}</label>
        <span className="text-sm text-muted-foreground">{value}s</span>
      </div>
      <div className="flex items-center gap-3">
        <Slider
          value={[value]}
          onValueChange={(values) => onChange(values[0])}
          min={1}
          max={12}
          step={0.5}
          className="flex-1"
        />
        <Input
          type="number"
          min="1"
          max="60"
          step="0.5"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-20"
        />
      </div>
    </div>
  );
}