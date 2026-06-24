import React, { useState } from "react";
import { RealWorldQuest } from "../types";
import { CheckSquare, Square, Calendar, Trophy, Gift, ArrowRight } from "lucide-react";

interface Props {
  quests: RealWorldQuest[];
  onCompleteQuest: (index: number) => void;
  completedQuestIndexes: number[];
}

export default function RestorativeQuests({ quests, onCompleteQuest, completedQuestIndexes }: Props) {
  // Overall Restorative Score based on completed quests
  const restorativeScore = completedQuestIndexes.length * 35;

  return (
    <div className="bg-slate-950/80 backdrop-blur-md border border-amber-500/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-900">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500/10 p-2.5 rounded-xl text-amber-400 border border-amber-500/30">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-amber-100 font-sans tracking-tight">
              Hành Trình Phục Hồi (Restorative Justice Quests)
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Chuyển hóa từ nhận thức trong thế giới ảo thành hành động thực tế
            </p>
          </div>
        </div>

        {/* Global Level Indicator */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
          <span className="text-[10px] text-slate-400 font-mono">Phục Hồi Lực:</span>
          <span className="text-sm font-bold text-amber-400 font-mono">{restorativeScore} RP</span>
        </div>
      </div>

      {quests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-900/20 rounded-xl border border-dashed border-slate-850 p-6">
          <Calendar className="w-8 h-8 text-slate-600 mb-2" />
          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            Mê cung tâm trí chưa mở ra. Hãy bắt đầu cuộc trò chuyện với <span className="text-amber-300 font-medium">The Arch-Architect</span> ở phía trên để mở khóa các nhiệm vụ phục hồi thực tại đầu tiên!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {quests.map((quest, index) => {
            const isCompleted = completedQuestIndexes.includes(index);
            return (
              <div
                key={index}
                id={`quest-card-${index}`}
                className={`transition-all duration-300 rounded-xl p-4 border flex gap-4 ${
                  isCompleted
                    ? "bg-emerald-950/20 border-emerald-500/20"
                    : "bg-slate-900/60 border-slate-800 hover:border-amber-500/20"
                }`}
              >
                <button
                  id={`btn-complete-quest-${index}`}
                  onClick={() => onCompleteQuest(index)}
                  disabled={isCompleted}
                  className={`mt-1 flex-shrink-0 cursor-pointer transition-colors ${
                    isCompleted ? "text-emerald-400" : "text-slate-500 hover:text-amber-400"
                  }`}
                >
                  {isCompleted ? (
                    <CheckSquare className="w-5 h-5 fill-emerald-500/10" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                </button>

                <div className="flex-grow">
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <h4 className={`text-sm font-semibold font-sans ${
                      isCompleted ? "text-slate-500 line-through" : "text-amber-200"
                    }`}>
                      {quest.title}
                    </h4>
                    {isCompleted && (
                      <span className="text-[9px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono uppercase">
                        Hoàn thành
                      </span>
                    )}
                  </div>
                  <p className={`text-xs leading-relaxed mb-3 ${
                    isCompleted ? "text-slate-600" : "text-slate-300"
                  }`}>
                    {quest.description}
                  </p>

                  <div className="flex items-center gap-2 bg-slate-950/50 p-2 rounded-lg border border-slate-850">
                    <Gift className={`w-3.5 h-3.5 ${isCompleted ? "text-slate-600" : "text-amber-400"}`} />
                    <span className="text-[10px] font-mono text-slate-400">
                      <span className="font-semibold text-amber-300/80">Phần thưởng: </span>
                      {quest.reward} (+35 RP)
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
