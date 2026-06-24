import React from "react";
import { Heart, Shield, Eye, Flame } from "lucide-react";
import { EmotionalResource } from "../types";

interface Props {
  resource: EmotionalResource;
}

export default function SystemResources({ resource }: Props) {
  const { empathy, resilience, clarity } = resource;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Empathy Meter */}
      <div className="bg-slate-950/80 backdrop-blur-md border border-purple-500/10 p-4 rounded-2xl relative overflow-hidden shadow-lg group hover:border-purple-500/30 transition-all duration-300">
        <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="bg-purple-500/10 p-1.5 rounded-lg text-purple-400">
              <Heart className="w-4 h-4 fill-current" />
            </div>
            <span className="text-xs font-mono text-purple-200">THẤU CẢM (Empathy)</span>
          </div>
          <span className="text-xs font-mono font-bold text-purple-400">{empathy}/100</span>
        </div>
        <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-purple-600 to-purple-400 h-1.5 rounded-full transition-all duration-1000"
            style={{ width: `${Math.max(5, Math.min(100, empathy))}%` }}
          />
        </div>
        <p className="text-[10px] text-slate-400 mt-2 font-sans">
          Khả năng kết nối, thấu cảm và mô phỏng nỗi đau của tha nhân.
        </p>
      </div>

      {/* Resilience Meter */}
      <div className="bg-slate-950/80 backdrop-blur-md border border-amber-500/10 p-4 rounded-2xl relative overflow-hidden shadow-lg group hover:border-amber-500/30 transition-all duration-300">
        <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="bg-amber-500/10 p-1.5 rounded-lg text-amber-400">
              <Shield className="w-4 h-4" />
            </div>
            <span className="text-xs font-mono text-amber-200">KIÊN ĐỊNH (Resilience)</span>
          </div>
          <span className="text-xs font-mono font-bold text-amber-400">{resilience}/100</span>
        </div>
        <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-amber-600 to-amber-400 h-1.5 rounded-full transition-all duration-1000"
            style={{ width: `${Math.max(5, Math.min(100, resilience))}%` }}
          />
        </div>
        <p className="text-[10px] text-slate-400 mt-2 font-sans">
          Sức chống chịu nghịch cảnh, áp lực và kiên trì rèn luyện đạo đức.
        </p>
      </div>

      {/* Clarity Meter */}
      <div className="bg-slate-950/80 backdrop-blur-md border border-blue-500/10 p-4 rounded-2xl relative overflow-hidden shadow-lg group hover:border-blue-500/30 transition-all duration-300">
        <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="bg-blue-500/10 p-1.5 rounded-lg text-blue-400">
              <Eye className="w-4 h-4" />
            </div>
            <span className="text-xs font-mono text-blue-200">SÁNG SUỐT (Clarity)</span>
          </div>
          <span className="text-xs font-mono font-bold text-blue-400">{clarity}/100</span>
        </div>
        <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-blue-600 to-blue-400 h-1.5 rounded-full transition-all duration-1000"
            style={{ width: `${Math.max(5, Math.min(100, clarity))}%` }}
          />
        </div>
        <p className="text-[10px] text-slate-400 mt-2 font-sans">
          Trí lực nhận thức, phân tích lý tính và hóa giải định kiến lầm lạc.
        </p>
      </div>
    </div>
  );
}
