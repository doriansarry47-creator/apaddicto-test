import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

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
  const audioRef = useRef(null);

  const phasesMap = {
    coherence: ["inspire", "expire"],
    square: ["inspire", "hold", "expire", "hold"],
    triangle: ["inspire", "hold", "expire"],
  };

  const nextPhase = () => {
    const phases = phasesMap[exercise];
    const idx = phases.indexOf(phase);
    const next = phases[(idx + 1) % phases.length];
    setPhase(next);
    setTimeLeft(durations[next]);
    if (soundOn && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
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
      return phase === "inspire" ? { y: -100 } : { y: 100 };
    }
    if (exercise === "square") {
      if (phase === "inspire") return { x: 100, y: 0 };
      if (phase === "hold") return { x: 100, y: 100 };
      if (phase === "expire") return { x: 0, y: 100 };
      return { x: 0, y: 0 };
    }
    if (exercise === "triangle") {
      if (phase === "inspire") return { x: 100, y: 100 };
      if (phase === "hold") return { x: 50, y: 0 };
      return { x: 0, y: 100 };
    }
    return { x: 0, y: 0 };
  };

  return (
    <div className="flex flex-col items-center p-6 space-y-4">
      <audio ref={audioRef} src="/sounds/bell.mp3" preload="auto" />

      {/* Exercise selector */}
      <select
        className="p-2 rounded border"
        value={exercise}
        onChange={(e) => setExercise(e.target.value)}
      >
        <option value="coherence">Cohérence cardiaque</option>
        <option value="square">Respiration carrée</option>
        <option value="triangle">Respiration triangulaire</option>
      </select>

      {/* Controls */}
      <div className="flex space-x-2">
        <button
          className="px-4 py-2 rounded bg-green-500 text-white"
          onClick={() => {
            setRunning(true);
            setPhase(phasesMap[exercise][0]);
            setTimeLeft(durations[phasesMap[exercise][0]]);
          }}
        >
          Start
        </button>
        <button
          className="px-4 py-2 rounded bg-yellow-500 text-white"
          onClick={() => setRunning(false)}
        >
          Pause
        </button>
        <button
          className="px-4 py-2 rounded bg-red-500 text-white"
          onClick={() => setRunning(false)}
        >
          Stop
        </button>
        <button
          className={`px-4 py-2 rounded ${soundOn ? "bg-blue-500" : "bg-gray-400"} text-white`}
          onClick={() => setSoundOn(!soundOn)}
        >
          {soundOn ? "Son activé" : "Son coupé"}
        </button>
      </div>

      {/* Timer + phase */}
      <div className="text-xl font-semibold">
        Phase : {phase} ({timeLeft}s)
      </div>

      {/* Animated ball with guides */}
      <div className="relative w-[200px] h-[200px] border border-gray-300 rounded flex items-center justify-center">
        {/* Shape guides */}
        {exercise === "square" && (
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
            <rect x="25" y="25" width="150" height="150" stroke="lightgray" fill="none" />
          </svg>
        )}
        {exercise === "triangle" && (
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
            <polygon points="100,20 180,180 20,180" stroke="lightgray" fill="none" />
          </svg>
        )}
        <motion.div
          animate={getBallPosition()}
          transition={{ duration: durations[phase], ease: "linear" }}
          className="w-6 h-6 rounded-full bg-blue-500 absolute"
        />
      </div>
    </div>
  );
}