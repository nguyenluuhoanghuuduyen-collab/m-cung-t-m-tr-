import React, { useRef, useEffect, useState } from "react";
import { Sparkles, Send, Info, Eye } from "lucide-react";

interface Star {
  x: number;
  y: number;
  size: number;
  color: string;
  sentiment: string;
  message?: string;
  alpha: number;
  speedX: number;
  speedY: number;
  pulseSpeed: number;
  pulsePhase: number;
}

export default function StarryGalaxy() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectedSentiment, setSelectedSentiment] = useState<string>("Bình yên");
  const [anonMsg, setAnonMsg] = useState<string>("");
  const [stars, setStars] = useState<Star[]>([]);
  const [hoveredStar, setHoveredStar] = useState<Star | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);

  const sentimentConfigs: Record<string, { color: string; label: string }> = {
    "Bình yên": { color: "#8b5cf6", label: "Tím Sâu Sắc (Calm & Reflective)" },
    "Áp lực": { color: "#3b82f6", label: "Xanh Lo Âu (Anxious but Hopeful)" },
    "Kiên định": { color: "#eab308", label: "Vàng Rực Sáng (Resilient & Strong)" },
    "Tổn thương": { color: "#ef4444", label: "Đỏ Bão Giông (Hurt or Overwhelmed)" },
  };

  // Generate initial mock stars representing the dynamic galaxy of the classroom
  const generateInitialStars = (width: number, height: number): Star[] => {
    const list: Star[] = [];
    const sentiments = Object.keys(sentimentConfigs);
    const mockMessages: Record<string, string[]> = {
      "Bình yên": [
        "Cố gắng sống chậm lại một chút...",
        "Lo-fi giúp mình tập trung thi cử hơn",
        "Hôm nay tớ đã thấu hiểu nỗi lòng của mẹ",
      ],
      "Áp lực": [
        "Ước gì điểm thi không đè nặng lên ngực tớ",
        "Áp lực đồng trang lứa mệt mỏi thật sự",
        "Có nhiều lúc chỉ muốn tắt điện thoại 1 ngày",
      ],
      "Kiên định": [
        "Dù ai nói gì, tớ sẽ bảo vệ bạn bị cô lập kia",
        "Mình tin ngày mai mây mù sẽ tan",
        "Chiến binh cầu vồng truyền động lực cho tớ",
      ],
      "Tổn thương": [
        "Tại sao họ lại chế giễu ngoại hình của tớ...",
        "Có ai thấu hiểu cảm giác bị bỏ rơi không?",
        "Tớ mệt mỏi vì những lời đàm tiếu vô căn cứ",
      ],
    };

    for (let i = 0; i < 40; i++) {
      const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
      const config = sentimentConfigs[sentiment];
      const msgs = mockMessages[sentiment];
      const message = msgs[Math.floor(Math.random() * msgs.length)];

      list.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2.5 + 1.5,
        color: config.color,
        sentiment,
        message,
        alpha: Math.random() * 0.6 + 0.3,
        speedX: (Math.random() - 0.5) * 0.15,
        speedY: (Math.random() - 0.5) * 0.15,
        pulseSpeed: 0.01 + Math.random() * 0.02,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }
    return list;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        canvas.width = width || 400;
        canvas.height = height || 250;
        
        // Populate initial stars when size is set
        if (stars.length === 0) {
          setStars(generateInitialStars(canvas.width, canvas.height));
        }
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [stars.length]);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Render cosmic background fog
      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        10,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width
      );
      gradient.addColorStop(0, "rgba(24, 18, 43, 0.4)");
      gradient.addColorStop(1, "rgba(8, 6, 16, 0.8)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Drawing constellation links between stars of close distance
      ctx.strokeStyle = "rgba(139, 92, 246, 0.05)";
      ctx.lineWidth = 0.5;
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const dx = stars[i].x - stars[j].x;
          const dy = stars[i].y - stars[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 75) {
            ctx.beginPath();
            ctx.moveTo(stars[i].x, stars[i].y);
            ctx.lineTo(stars[j].x, stars[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw and update stars
      stars.forEach((star) => {
        // Move star gently
        star.x += star.speedX;
        star.y += star.speedY;

        // Bounce back inside boundaries
        if (star.x < 0 || star.x > canvas.width) star.speedX *= -1;
        if (star.y < 0 || star.y > canvas.height) star.speedY *= -1;

        // Pulsate glow
        star.pulsePhase += star.pulseSpeed;
        const pulse = Math.sin(star.pulsePhase) * 0.3 + 0.7;

        // Glow ring
        ctx.shadowBlur = star.size * 3;
        ctx.shadowColor = star.color;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size * pulse, 0, Math.PI * 2);
        ctx.fillStyle = `${star.color}${Math.floor(star.alpha * 255).toString(16).padStart(2, "0")}`;
        ctx.fill();

        // Reset shadow
        ctx.shadowBlur = 0;
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [stars]);

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x: e.clientX, y: e.clientY });

    // Look for hovered star within 12px range
    let foundStar: Star | null = null;
    for (const star of stars) {
      const dx = star.x - x;
      const dy = star.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 12) {
        foundStar = star;
        break;
      }
    }
    setHoveredStar(foundStar);
    setShowTooltip(!!foundStar);
  };

  const handleSendStar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!anonMsg.trim()) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const config = sentimentConfigs[selectedSentiment];

    const newStar: Star = {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 3 + 2.5, // slightly larger for user contribution
      color: config.color,
      sentiment: selectedSentiment,
      message: anonMsg,
      alpha: 1.0,
      speedX: (Math.random() - 0.5) * 0.1,
      speedY: (Math.random() - 0.5) * 0.1,
      pulseSpeed: 0.02 + Math.random() * 0.03,
      pulsePhase: Math.random() * Math.PI,
    };

    setStars((prev) => [newStar, ...prev]);
    setAnonMsg("");
  };

  // Count distribution of sentiments in galaxy
  const counts = stars.reduce((acc, s) => {
    acc[s.sentiment] = (acc[s.sentiment] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="bg-slate-950/80 backdrop-blur-md border border-purple-500/10 rounded-2xl p-6 shadow-xl relative flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-purple-500/10 p-2.5 rounded-xl text-purple-400 border border-purple-500/30">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-purple-100 font-sans tracking-tight">
              Dải Ngân Hà Lớp Học (Classroom Galaxy)
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Tổng hợp cảm xúc nặc danh dưới dạng chòm sao của lớp học
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-purple-300 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20 font-mono">
          <Eye className="w-3.5 h-3.5" />
          Nặc Danh Tuyệt Đối
        </div>
      </div>

      {/* Interactive Cosmos Canvas */}
      <div 
        ref={containerRef}
        className="relative w-full h-[220px] bg-slate-950 border border-slate-900 rounded-xl overflow-hidden mb-4"
      >
        <canvas
          ref={canvasRef}
          onMouseMove={handleCanvasMouseMove}
          onMouseLeave={() => setShowTooltip(false)}
          className="absolute inset-0 cursor-crosshair"
        />

        {/* Floating tooltip */}
        {showTooltip && hoveredStar && (
          <div 
            className="fixed z-50 bg-slate-900/95 backdrop-blur-md border border-purple-500/30 p-3 rounded-lg shadow-2xl max-w-xs font-sans text-xs pointer-events-none transition-all duration-150"
            style={{ top: mousePos.y + 12, left: mousePos.x + 12 }}
          >
            <div className="flex items-center justify-between gap-4 mb-1.5">
              <span className="font-mono text-[10px] uppercase font-bold text-slate-400">
                Thần Thể Lữ Hành
              </span>
              <span 
                className="px-1.5 py-0.5 rounded text-[10px] font-mono border"
                style={{ color: hoveredStar.color, borderColor: `${hoveredStar.color}40`, backgroundColor: `${hoveredStar.color}15` }}
              >
                {hoveredStar.sentiment}
              </span>
            </div>
            <p className="text-slate-200 italic leading-relaxed">
              "{hoveredStar.message || "Không để lại lời nhắn..."}"
            </p>
          </div>
        )}

        <div className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur border border-slate-900 rounded px-2 py-1 text-[10px] text-slate-400 font-mono pointer-events-none">
          Rê chuột qua chòm sao để thấu cảm...
        </div>
      </div>

      {/* Sentiment statistics indicator */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {Object.entries(sentimentConfigs).map(([name, conf]) => {
          const percentage = stars.length ? Math.round(((counts[name] || 0) / stars.length) * 100) : 0;
          return (
            <div key={name} className="bg-slate-900/40 border border-slate-900 p-2 rounded-xl text-center">
              <div className="text-[10px] font-mono text-slate-400">{name}</div>
              <div className="text-xs font-mono font-bold mt-1" style={{ color: conf.color }}>
                {percentage}%
              </div>
            </div>
          );
        })}
      </div>

      {/* Anonymous Star Contribution Form */}
      <form onSubmit={handleSendStar} className="mt-auto pt-3 border-t border-slate-900">
        <p className="text-xs text-slate-400 font-sans mb-2 font-medium">
          Gửi một nỗi đau hoặc tâm sự thầm kín lên chòm sao:
        </p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {Object.keys(sentimentConfigs).map((name) => (
            <button
              key={name}
              type="button"
              id={`sentiment-btn-${name.replace(/\s+/g, "-")}`}
              onClick={() => setSelectedSentiment(name)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all cursor-pointer ${
                selectedSentiment === name
                  ? "bg-purple-500 text-slate-950 font-bold"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200"
              }`}
            >
              {name}
            </button>
          ))}
        </div>
        <div className="relative">
          <input
            id="anon-msg-input"
            type="text"
            placeholder="Bạn muốn thổ lộ gì lên dải ngân hà nặc danh lớp học hôm nay?..."
            value={anonMsg}
            onChange={(e) => setAnonMsg(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-800 focus:border-purple-500 rounded-xl px-4 py-2.5 pr-10 text-xs font-sans text-slate-200 placeholder-slate-500 outline-none"
          />
          <button
            id="btn-send-anon-msg"
            type="submit"
            className="absolute right-2.5 top-2 text-purple-400 hover:text-purple-300 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
