import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Music, Volume2, VolumeX, Sparkles, CloudRain, Wind } from "lucide-react";

export default function LofiAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(40);
  const [track, setTrack] = useState<"rain" | "space" | "calm">("rain");
  const audioCtxRef = useRef<AudioContext | null>(null);
  
  // Audio node references
  const rainSourceRef = useRef<AudioWorkletNode | ScriptProcessorNode | null>(null);
  const synthIntervalRef = useRef<any>(null);
  const mainGainRef = useRef<GainNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);

  // Initialize Web Audio API nodes
  const initAudio = () => {
    if (audioCtxRef.current) return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtxRef.current = new AudioContextClass();
    
    // Main Gain
    const gain = audioCtxRef.current.createGain();
    gain.gain.setValueAtTime(volume / 100, audioCtxRef.current.currentTime);
    gain.connect(audioCtxRef.current.destination);
    mainGainRef.current = gain;

    // Filter node for Lo-fi feel
    const filter = audioCtxRef.current.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(800, audioCtxRef.current.currentTime);
    filter.connect(gain);
    filterNodeRef.current = filter;
  };

  useEffect(() => {
    if (mainGainRef.current && audioCtxRef.current) {
      mainGainRef.current.gain.setValueAtTime(volume / 100, audioCtxRef.current.currentTime);
    }
  }, [volume]);

  const startSoundscape = () => {
    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    stopAllNodes();

    // 1. Procedural Noise Generator (Rain or Space Hum)
    if (track === "rain") {
      // White noise synthesis for rain
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Brownian noise filter approximation for deep warm rain
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; // Gain multiplier
      }
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      // Filter for rain softness
      const rainFilter = ctx.createBiquadFilter();
      rainFilter.type = "lowpass";
      rainFilter.frequency.setValueAtTime(600, ctx.currentTime);

      noiseSource.connect(rainFilter);
      if (filterNodeRef.current) {
        rainFilter.connect(filterNodeRef.current);
      }
      noiseSource.start();
      rainSourceRef.current = noiseSource as any;

    } else if (track === "space" || track === "calm") {
      // Space/Wind hum
      const bufferSize = 4 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Deep pink/brownian filter for warm cyber space ambient
        output[i] = (lastOut + (0.05 * white)) / 1.05;
        lastOut = output[i];
        output[i] *= 1.5;
      }
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const spaceFilter = ctx.createBiquadFilter();
      spaceFilter.type = "bandpass";
      spaceFilter.Q.setValueAtTime(1.0, ctx.currentTime);
      spaceFilter.frequency.setValueAtTime(180, ctx.currentTime);

      noiseSource.connect(spaceFilter);
      if (filterNodeRef.current) {
        spaceFilter.connect(filterNodeRef.current);
      }
      noiseSource.start();
      rainSourceRef.current = noiseSource as any;
    }

    // 2. Procedural cozy musical synth chords
    playLofiChords();
    setIsPlaying(true);
  };

  const playLofiChords = () => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    // Chords progression: Am7 -> Dm7 -> G7 -> Cmaj7 (Lofi classic)
    const progressions = [
      [220.00, 261.63, 329.63, 392.00], // Am7 (A3, C4, E4, G4)
      [146.83, 261.63, 293.66, 349.23], // Dm7 (D3, C4, D4, F4)
      [196.00, 246.94, 293.66, 383.00], // G7
      [261.63, 329.63, 392.00, 493.88], // Cmaj7
    ];

    let chordIdx = 0;

    const playChord = () => {
      const now = ctx.currentTime;
      const chord = progressions[chordIdx];
      chordIdx = (chordIdx + 1) % progressions.length;

      // Soft sound, multiple oscillators to create full tone
      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // 7th chord elements with soft triangle wave
        osc.type = track === "calm" ? "sine" : "triangle";
        osc.frequency.setValueAtTime(freq, now);

        // Detune slightly for lush chorus effect
        osc.detune.setValueAtTime((idx - 1.5) * 6, now);

        // Soft exponential attack and long decay
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.04, now + 1.5);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 5.5);

        osc.connect(gain);
        if (filterNodeRef.current) {
          gain.connect(filterNodeRef.current);
        }

        osc.start(now);
        osc.stop(now + 6.0);
      });
    };

    // Play first chord immediately
    playChord();
    
    // Setup interval for every 6 seconds
    synthIntervalRef.current = setInterval(playChord, 6000);
  };

  const stopAllNodes = () => {
    if (rainSourceRef.current) {
      try {
        rainSourceRef.current.stop();
      } catch (e) {}
      rainSourceRef.current = null;
    }
    if (synthIntervalRef.current) {
      clearInterval(synthIntervalRef.current);
      synthIntervalRef.current = null;
    }
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      stopAllNodes();
      setIsPlaying(false);
    } else {
      startSoundscape();
    }
  };

  useEffect(() => {
    if (isPlaying) {
      // Restart with the new track selection
      startSoundscape();
    }
  }, [track]);

  useEffect(() => {
    return () => {
      stopAllNodes();
    };
  }, []);

  return (
    <div className="flex flex-col md:flex-row items-center gap-4 bg-slate-900/90 backdrop-blur border border-amber-500/20 rounded-2xl p-4 shadow-xl">
      <div className="flex items-center gap-3 w-full justify-between md:justify-start">
        <div className="flex items-center gap-2">
          <div className="bg-amber-500/10 p-2 rounded-xl text-amber-400 border border-amber-500/30 animate-pulse">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-amber-100 font-sans">
              Lofi Ambient Tâm Trí
            </h4>
            <p className="text-[10px] text-slate-400 font-mono">
              {isPlaying ? "Đang phát sóng..." : "Âm thanh xoa dịu stress"}
            </p>
          </div>
        </div>

        <button
          id="btn-toggle-ambient"
          onClick={handleTogglePlay}
          className={`px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
            isPlaying
              ? "bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold"
              : "bg-slate-800 hover:bg-slate-700 text-slate-200"
          }`}
        >
          {isPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5" />
              <span>Dừng phát</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Phát Lo-fi</span>
            </>
          )}
        </button>
      </div>

      {/* Control sliders & selectors */}
      <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
        {/* Track buttons */}
        <div className="flex bg-slate-950 rounded-xl p-1 border border-slate-800">
          <button
            id="track-rain"
            onClick={() => setTrack("rain")}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all cursor-pointer flex items-center gap-1 ${
              track === "rain" ? "bg-amber-500/15 text-amber-400 border border-amber-500/30" : "text-slate-400"
            }`}
          >
            <CloudRain className="w-3 h-3" />
            Mưa Thư Viện
          </button>
          <button
            id="track-space"
            onClick={() => setTrack("space")}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all cursor-pointer flex items-center gap-1 ${
              track === "space" ? "bg-amber-500/15 text-amber-400 border border-amber-500/30" : "text-slate-400"
            }`}
          >
            <Wind className="w-3 h-3" />
            Tím Khói
          </button>
          <button
            id="track-calm"
            onClick={() => setTrack("calm")}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all cursor-pointer flex items-center gap-1 ${
              track === "calm" ? "bg-amber-500/15 text-amber-400 border border-amber-500/30" : "text-slate-400"
            }`}
          >
            <Sparkles className="w-3 h-3" />
            Thiền Định
          </button>
        </div>

        {/* Volume controls */}
        <div className="flex items-center gap-2 text-slate-400 w-full sm:w-auto">
          {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          <input
            id="volume-slider"
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-20 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <span className="text-[10px] font-mono w-6 text-right">{volume}%</span>
        </div>
      </div>
    </div>
  );
}
