import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Music, Volume2, VolumeX } from "lucide-react";

interface MoodTrack {
  id: string;
  name: string;
  mood: string;
  url: string;
  type: "mp3" | "synth";
  synthTrack?: "rain" | "space" | "calm";
}

const trackList: MoodTrack[] = [
  {
    id: "synth-rain",
    name: "Mưa Rơi Bên Thư Viện",
    mood: "Bình yên / Tập trung sâu",
    url: "",
    type: "synth",
    synthTrack: "rain"
  },
  {
    id: "synth-space",
    name: "Tím Khói Không Gian",
    mood: "Sâu lắng / Thiền định",
    url: "",
    type: "synth",
    synthTrack: "space"
  },
  {
    id: "mp3-stress",
    name: "Lofi Xoa Dịu Stress",
    mood: "Hóa giải Lo âu & Stress",
    url: "https://assets.mixkit.co/music/preview/mixkit-ambient-sleep-tom-1007.mp3",
    type: "mp3"
  },
  {
    id: "mp3-study",
    name: "Lofi Tập Trung Học Tập",
    mood: "Giải tỏa Áp lực học tập",
    url: "https://assets.mixkit.co/music/preview/mixkit-lofi-chill-1604.mp3",
    type: "mp3"
  },
  {
    id: "mp3-healing",
    name: "Lofi Chữa Lành Tâm Hồn",
    mood: "Trị liệu Tổn thương & Cô đơn",
    url: "https://assets.mixkit.co/music/preview/mixkit-beautiful-dream-extra-long-1002.mp3",
    type: "mp3"
  },
  {
    id: "mp3-motivation",
    name: "Lofi Động Lực Vượt Khó",
    mood: "Tiếp sức Kiên định & Resilience",
    url: "https://assets.mixkit.co/music/preview/mixkit-dreaming-big-1003.mp3",
    type: "mp3"
  }
];

export default function LofiAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(40);
  const [selectedTrackId, setSelectedTrackId] = useState("synth-rain");
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  
  // Audio node references for synth
  const rainSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const synthIntervalRef = useRef<any>(null);
  const mainGainRef = useRef<GainNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);

  // Initialize Web Audio API nodes for synth
  const initAudio = () => {
    if (audioCtxRef.current) return;
    const AudioContextClass: any = typeof window !== "undefined"
      ? (window.AudioContext || (window as any).webkitAudioContext)
      : null;
    if (!AudioContextClass) return;
    
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

  // Initialize HTML5 Audio element for MP3s
  useEffect(() => {
    const audio = new Audio();
    audio.loop = true;
    audioElementRef.current = audio;

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  // Update volume for both systems
  useEffect(() => {
    if (mainGainRef.current && audioCtxRef.current) {
      mainGainRef.current.gain.setValueAtTime(volume / 100, audioCtxRef.current.currentTime);
    }
    if (audioElementRef.current) {
      audioElementRef.current.volume = volume / 100;
    }
  }, [volume]);

  const startSoundscape = () => {
    const currentTrack = trackList.find(t => t.id === selectedTrackId) || trackList[0];

    // 1. Stop any currently playing audio/synth
    stopAllNodes();

    if (currentTrack.type === "synth") {
      initAudio();
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const synthType = currentTrack.synthTrack || "rain";

      if (synthType === "rain") {
        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5;
        }
        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        noiseSource.loop = true;

        const rainFilter = ctx.createBiquadFilter();
        rainFilter.type = "lowpass";
        rainFilter.frequency.setValueAtTime(600, ctx.currentTime);

        noiseSource.connect(rainFilter);
        if (filterNodeRef.current) {
          rainFilter.connect(filterNodeRef.current);
        }
        noiseSource.start();
        rainSourceRef.current = noiseSource;

      } else if (synthType === "space") {
        const bufferSize = 4 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
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
        rainSourceRef.current = noiseSource;
      }

      // Play procedural chords
      playLofiChords();
    } else {
      // Play MP3 audio track
      if (audioElementRef.current) {
        audioElementRef.current.src = currentTrack.url;
        audioElementRef.current.volume = volume / 100;
        audioElementRef.current.play().catch(err => {
          console.error("Audio play failed:", err);
        });
      }
    }
    setIsPlaying(true);
  };

  const playLofiChords = () => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    // Chords: Am7 -> Dm7 -> G7 -> Cmaj7
    const progressions = [
      [220.00, 261.63, 329.63, 392.00], // Am7
      [146.83, 261.63, 293.66, 349.23], // Dm7
      [196.00, 246.94, 293.66, 383.00], // G7
      [261.63, 329.63, 392.00, 493.88], // Cmaj7
    ];

    let chordIdx = 0;

    const playChord = () => {
      const now = ctx.currentTime;
      const chord = progressions[chordIdx];
      chordIdx = (chordIdx + 1) % progressions.length;

      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now);
        osc.detune.setValueAtTime((idx - 1.5) * 6, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.03, now + 1.5);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 5.5);

        osc.connect(gain);
        if (filterNodeRef.current) {
          gain.connect(filterNodeRef.current);
        }

        osc.start(now);
        osc.stop(now + 6.0);
      });
    };

    playChord();
    synthIntervalRef.current = setInterval(playChord, 6000);
  };

  const stopAllNodes = () => {
    // 1. Stop synth
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
    // 2. Pause HTML5 Audio
    if (audioElementRef.current) {
      audioElementRef.current.pause();
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

  // Change tracks dynamically
  useEffect(() => {
    if (isPlaying) {
      startSoundscape();
    }
  }, [selectedTrackId]);

  useEffect(() => {
    return () => {
      stopAllNodes();
    };
  }, []);

  const currentTrack = trackList.find(t => t.id === selectedTrackId) || trackList[0];

  return (
    <div className="flex flex-col md:flex-row items-center gap-4 bg-slate-900/90 backdrop-blur border border-amber-500/20 rounded-2xl p-4 shadow-xl">
      <div className="flex items-center gap-3 w-full justify-between md:justify-start">
        <div className="flex items-center gap-2">
          <div className="bg-amber-500/10 p-2 rounded-xl text-amber-400 border border-amber-500/30 animate-pulse">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-amber-100 font-sans flex items-center gap-1.5">
              Lofi Âm Thanh Trị Liệu
              <span className="text-[9px] bg-purple-500/20 text-purple-300 border border-purple-500/20 px-1.5 py-0.5 rounded-full font-mono">
                {currentTrack.type === "synth" ? "Giả Lập AI" : "Bản Nhạc"}
              </span>
            </h4>
            <p className="text-[10px] text-slate-400 font-mono">
              {isPlaying ? `Đang phát: ${currentTrack.name}` : "Chọn nhạc nền theo tâm trạng"}
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
              <span>Phát Nhạc</span>
            </>
          )}
        </button>
      </div>

      {/* Control select & sliders */}
      <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
        {/* Track Selector Dropdown */}
        <div className="relative w-full sm:w-60">
          <select
            id="track-select"
            value={selectedTrackId}
            onChange={(e) => setSelectedTrackId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 outline-none font-sans cursor-pointer focus:border-amber-500/40"
          >
            {trackList.map((track) => (
              <option key={track.id} value={track.id} className="bg-slate-950 text-slate-200">
                {track.name} ({track.mood})
              </option>
            ))}
          </select>
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
