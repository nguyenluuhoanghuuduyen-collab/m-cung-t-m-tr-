import React, { useState, useEffect } from "react";
import { GameResponse, EmotionalResource, RealWorldQuest } from "./types";
import NarrativeConsole from "./components/NarrativeConsole";
import SystemResources from "./components/SystemResources";
import LofiAudioPlayer from "./components/LofiAudioPlayer";
import StarryGalaxy from "./components/StarryGalaxy";
import BookSoulLibrary from "./components/BookSoulLibrary";
import RestorativeQuests from "./components/RestorativeQuests";
import { Library, Compass, Users, GraduationCap, FileText } from "lucide-react";
import { callGeminiDirectly } from "./geminiClient";
import { exportJourneyToPDF } from "./pdfExporter";

export default function App() {
  const [emotionalResource, setEmotionalResource] = useState<EmotionalResource>({
    empathy: 50,
    resilience: 50,
    clarity: 50,
  });

  const [userApiKey, setUserApiKey] = useState<string>(() => {
    return localStorage.getItem("innerscape_api_key") || "";
  });

  const [currentState, setCurrentState] = useState<GameResponse | null>(null);
  const [history, setHistory] = useState<{ sender: "user" | "architect"; text: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unlockedQuests, setUnlockedQuests] = useState<RealWorldQuest[]>([]);
  const [completedQuestIndexes, setCompletedQuestIndexes] = useState<number[]>([]);

  // Sound and UI controls
  const [activeTab, setActiveTab] = useState<"journey" | "library" | "galaxy">("journey");

  const handleExportPDF = async () => {
    if (history.length === 0) return;
    setIsExporting(true);
    try {
      const rpScore = completedQuestIndexes.length * 20;
      await exportJourneyToPDF({
        emotionalResource,
        history,
        quests: unlockedQuests,
        completedQuestIndexes,
        restorativeScore: rpScore
      });
    } catch (err: any) {
      alert(err.message || "Không thể xuất file PDF. Vui lòng thử lại.");
    } finally {
      setIsExporting(false);
    }
  };

  // Call the backend endpoint or Gemini directly to initiate or proceed the maze
  const fetchNextState = async (message: string, currentHistory: typeof history, currentResources: EmotionalResource) => {
    setIsLoading(true);
    setError(null);
    try {
      let data: GameResponse;

      if (userApiKey && userApiKey.trim() !== "") {
        // If there's a custom key in browser, call Gemini directly (serverless-friendly!)
        data = await callGeminiDirectly(userApiKey, message, currentHistory, currentResources);
      } else {
        // Otherwise fallback to backend environment variables (for local development)
        const response = await fetch("/api/architect/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message,
            history: currentHistory,
            emotionalResource: currentResources,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          if (response.status === 401 || errorData.code === "API_KEY_MISSING") {
            throw new Error("API_KEY_MISSING: Chưa cấu hình hoặc API Key không hợp lệ. Vui lòng nhập/dán API Key ở góc trên bên phải.");
          }
          throw new Error(errorData.error || "Không thể kết nối với Kiến trúc sư Trưởng. Vui lòng kiểm tra API key.");
        }

        data = await response.json();
      }

      // Update state
      setCurrentState(data);
      setEmotionalResource(data.emotionalResource);

      // Add to history
      setHistory((prev) => [
        ...prev,
        { sender: "user", text: message },
        { sender: "architect", text: data.narrative },
      ]);

      // Unlock new quest if provided
      if (data.realWorldQuest) {
        const newQuest = data.realWorldQuest;
        // Check if quest already exists by title to avoid duplicates
        setUnlockedQuests((prev) => {
          if (prev.some((q) => q.title === newQuest.title)) return prev;
          return [newQuest, ...prev];
        });
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Đã xảy ra sự cố không mong muốn trong Mê cung.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitInitial = (message: string) => {
    fetchNextState(message, [], emotionalResource);
  };

  const handleStateUpdate = (currentStateData: GameResponse, userMessage: string) => {
    fetchNextState(userMessage, history, emotionalResource);
  };

  const handleCompleteQuest = (index: number) => {
    if (!completedQuestIndexes.includes(index)) {
      setCompletedQuestIndexes((prev) => [...prev, index]);

      // Grant bonus statistics reward
      setEmotionalResource((prev) => ({
        empathy: Math.min(100, prev.empathy + 10),
        resilience: Math.min(100, prev.resilience + 10),
        clarity: Math.min(100, prev.clarity + 5),
      }));
    }
  };

  const handleReset = () => {
    setEmotionalResource({ empathy: 50, resilience: 50, clarity: 50 });
    setCurrentState(null);
    setHistory([]);
    setError(null);
    setUnlockedQuests([]);
    setCompletedQuestIndexes([]);
  };

  return (
    <div className="min-h-screen bg-[#080610] text-slate-100 relative overflow-x-hidden selection:bg-amber-500/30 selection:text-amber-200">
      {/* Absolute grid and glowing decorations */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e1b4b12_1px,transparent_1px),linear-gradient(to_bottom,#1e1b4b12_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-amber-900/5 blur-[120px] pointer-events-none" />

      {/* Atmospheric Global Top Navigation */}
      <header className="border-b border-slate-900 bg-slate-950/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-amber-500 to-purple-600 p-2 rounded-xl text-slate-950 font-bold border border-amber-400/20 shadow-lg shadow-purple-950/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-amber-100 font-sans tracking-tight">
                  InnerScape
                </h1>
                <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded-md font-mono">
                  v1.2 PRO
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                Mê cung Khám phá Tâm trí & Giác ngộ Giáo dục
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            {/* Input API Key settings */}
            <div className="flex items-center gap-1.5 bg-slate-900/60 border border-slate-800 rounded-xl px-2.5 py-1">
              <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">Gemini API Key:</span>
              <input
                id="header-api-key-input"
                type="password"
                placeholder="Dán API Key để lưu..."
                value={userApiKey}
                onChange={(e) => {
                  const val = e.target.value;
                  setUserApiKey(val);
                  localStorage.setItem("innerscape_api_key", val);
                }}
                className="bg-slate-950/60 border border-slate-850 focus:border-amber-500/40 rounded-lg px-2 py-1 text-[10px] font-mono text-amber-100 placeholder-slate-600 outline-none w-28 sm:w-44 transition-all"
              />
            </div>

            {/* Quick tab switch buttons */}
            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                id="tab-btn-journey"
                onClick={() => setActiveTab("journey")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === "journey"
                    ? "bg-amber-500/15 text-amber-300 border border-amber-500/20"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Thám hiểm</span>
              </button>
              <button
                id="tab-btn-library"
                onClick={() => setActiveTab("library")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === "library"
                    ? "bg-amber-500/15 text-amber-300 border border-amber-500/20"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Library className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tàng thư</span>
              </button>
              <button
                id="tab-btn-galaxy"
                onClick={() => setActiveTab("galaxy")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === "galaxy"
                    ? "bg-amber-500/15 text-amber-300 border border-amber-500/20"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Dải ngân hà</span>
              </button>
            </div>

            {/* PDF Journey Report Exporter */}
            <button
              id="btn-export-pdf"
              onClick={handleExportPDF}
              disabled={isExporting || history.length === 0}
              className={`px-4 py-2 rounded-xl text-xs font-medium font-sans flex items-center gap-1.5 transition-all border shadow-lg ${
                isExporting || history.length === 0
                  ? "bg-slate-900/60 border-slate-850 text-slate-500 cursor-not-allowed opacity-50"
                  : "bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold border-amber-400/20 shadow-amber-500/10 hover:shadow-amber-500/20 active:scale-95 cursor-pointer"
              }`}
              title={history.length === 0 ? "Bắt đầu thám hiểm mê cung để có nhật ký xuất PDF" : "Tải xuống báo cáo hành trình khám phá tâm trí"}
            >
              <FileText className={`w-3.5 h-3.5 ${isExporting ? "animate-spin" : ""}`} />
              <span>{isExporting ? "Đang xuất PDF..." : "Xuất PDF Kết Quả"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        
        {/* Real-time Lo-fi audio system and live resources status */}
        <div className="flex flex-col gap-6">
          <LofiAudioPlayer />
          <SystemResources resource={emotionalResource} />
        </div>

        {/* Dynamic Responsive Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Active Navigation Workspace (8 columns) */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            {activeTab === "journey" && (
              <div className="animate-fade-in">
                <NarrativeConsole
                  currentState={currentState}
                  onStateUpdate={handleStateUpdate}
                  isLoading={isLoading}
                  error={error}
                  emotionalResource={emotionalResource}
                  onReset={handleReset}
                  onSubmitInitial={handleSubmitInitial}
                  userApiKey={userApiKey}
                  onApiKeyChange={(key) => {
                    setUserApiKey(key);
                    localStorage.setItem("innerscape_api_key", key);
                  }}
                  onClearError={() => setError(null)}
                />
              </div>
            )}

            {activeTab === "library" && (
              <div className="animate-fade-in">
                <BookSoulLibrary />
              </div>
            )}

            {activeTab === "galaxy" && (
              <div className="animate-fade-in">
                <StarryGalaxy />
              </div>
            )}

            {/* Restorative Quests panel (Always prominent below journey or tab) */}
            <RestorativeQuests
              quests={unlockedQuests}
              onCompleteQuest={handleCompleteQuest}
              completedQuestIndexes={completedQuestIndexes}
            />
          </div>

          {/* Interactive Companion Sidebar (4 columns) - only visible/relevant on wider viewports */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            {activeTab !== "library" && <BookSoulLibrary />}
            {activeTab !== "galaxy" && <StarryGalaxy />}
          </div>

        </div>
      </main>

      {/* Atmospheric Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/40 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500 font-mono">
            &copy; 2026 InnerScape. Kiến tạo bởi Arch-Architect vinh danh những tâm hồn dũng cảm.
          </p>
          <div className="flex gap-4 text-xs font-mono text-slate-400">
            <span>Bảo mật tuyệt đối</span>
            <span>&bull;</span>
            <span>Triết lý Kỷ luật Tích cực</span>
            <span>&bull;</span>
            <span>Restorative Justice</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
