import React, { useState } from "react";
import { GameResponse, EmotionalResource, GameChoice, ChatMessage } from "../types";
import { Shield, Sparkles, Send, HelpCircle, BookOpen, AlertCircle, RefreshCw, Feather } from "lucide-react";

interface Props {
  currentState: GameResponse | null;
  onStateUpdate: (newState: GameResponse, userMessage: string) => void;
  isLoading: boolean;
  error: string | null;
  emotionalResource: EmotionalResource;
  onReset: () => void;
  onSubmitInitial: (message: string) => void;
  userApiKey?: string;
  onApiKeyChange?: (key: string) => void;
  onClearError?: () => void;
}

export default function NarrativeConsole({
  currentState,
  onStateUpdate,
  isLoading,
  error,
  emotionalResource,
  onReset,
  onSubmitInitial,
  userApiKey,
  onApiKeyChange,
  onClearError,
}: Props) {
  const [initialMessage, setInitialMessage] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [socratesAnswer, setSocratesAnswer] = useState("");
  const [answeredSocrates, setAnsweredSocrates] = useState(false);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);

  const initialEmotionChips = [
    "Áp lực thi tốt nghiệp THPT Quốc gia & định hướng chọn ngành nghề bắt buộc từ cha mẹ",
    "Bị cô lập, tẩy chay vì không chạy theo xu hướng hoặc phong cách của nhóm bạn trong lớp",
    "Bị bôi nhọ danh dự, chế ảnh dìm, bạo lực mạng nặc danh trên Confession của trường",
    "Mất phương hướng bản thân, stress học tập kéo dài khiến mình mất sạch động lực",
  ];

  const handleChoiceSelect = async (choice: GameChoice) => {
    setSelectedChoiceId(choice.id);
    setAnsweredSocrates(false);
    setSocratesAnswer("");

    // Call state update in parent which triggers API
    onStateUpdate(currentState!, `Ta chọn phương án ${choice.id}: ${choice.text}`);
    setSelectedChoiceId(null);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMessage.trim()) return;

    onStateUpdate(currentState!, customMessage);
    setCustomMessage("");
    setAnsweredSocrates(false);
    setSocratesAnswer("");
  };

  const handleSocratesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socratesAnswer.trim()) return;
    setAnsweredSocrates(true);
  };

  // Helper render for connection/API key errors
  const renderErrorBlock = () => {
    if (!error) return null;
    const isApiKeyError = error.includes("API_KEY_MISSING") || error.toLowerCase().includes("api key") || error.toLowerCase().includes("apikey");

    return (
      <div className="mt-4 flex flex-col gap-3 bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl animate-fade-in text-left">
        <div className="flex items-center gap-2 text-rose-400 text-xs font-sans font-medium">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
        
        {isApiKeyError && onApiKeyChange && (
          <div className="bg-slate-950/90 border border-slate-900 rounded-xl p-3.5 space-y-2.5 mt-1">
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Trò chơi sử dụng mô hình trí tuệ nhân tạo <span className="text-amber-400 font-semibold">Gemini 3.5 Flash</span> từ Google để vận hành cốt truyện động. Hãy dán <strong>Gemini API Key</strong> của bạn bên dưới (Key được lưu an toàn trong trình duyệt của bạn):
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                id="console-api-key-input"
                type="password"
                placeholder="Nhập hoặc dán Gemini API Key..."
                value={userApiKey || ""}
                onChange={(e) => onApiKeyChange(e.target.value)}
                className="flex-grow bg-slate-900 border border-slate-800 focus:border-amber-500/40 rounded-lg px-3 py-1.5 text-xs font-mono text-amber-200 placeholder-slate-600 outline-none"
              />
              <button
                id="btn-retry-from-console"
                type="button"
                onClick={() => {
                  if (onClearError) {
                    onClearError();
                  } else {
                    window.location.reload();
                  }
                }}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-mono font-bold text-[10px] px-4 py-1.5 rounded-lg transition-colors cursor-pointer flex-shrink-0"
              >
                Kích Hoạt
              </button>
            </div>
            <p className="text-[10px] text-slate-500 font-sans">
              * Bạn có thể nhận API Key hoàn toàn miễn phí chỉ trong 1 phút tại trang web chính thức:{" "}
              <a 
                href="https://aistudio.google.com/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-amber-500 hover:underline inline-flex items-center gap-0.5"
              >
                Google AI Studio <Sparkles className="w-2.5 h-2.5 text-amber-400 inline" />
              </a>
            </p>
          </div>
        )}
      </div>
    );
  };

  // If there's no state, show onboarding emotions selection
  if (!currentState) {
    return (
      <div className="bg-slate-950/85 backdrop-blur-md border border-amber-500/10 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex bg-amber-500/10 p-3 rounded-2xl text-amber-400 border border-amber-500/20 mb-4 animate-bounce">
            <Feather className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-amber-100 font-sans tracking-tight">
            InnerScape: Mê Cung Tâm Trí
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-mono mt-2">
            Nhập vai khám phá xung đột nội tâm & Thực hành phục hồi nhân văn
          </p>
        </div>

        <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-2xl mb-8">
          <h3 className="text-sm font-semibold text-amber-200 mb-3 font-sans">
            "Chào mừng Voyager. Ta là The Arch-Architect. Sương mù tâm trí của bạn hôm nay nhuốm màu sắc gì?"
          </h3>
          <p className="text-xs text-slate-400 font-serif leading-relaxed mb-4">
            Hãy chọn một trong những vết nứt không gian bên dưới để bắt đầu cuộc hành trình phiêu lưu khám phá tâm hồn, hoặc trực tiếp bày tỏ nỗi lòng thực tại của bạn:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {initialEmotionChips.map((chip, i) => (
              <button
                key={i}
                id={`emotion-chip-${i}`}
                onClick={() => onSubmitInitial(chip)}
                disabled={isLoading}
                className="text-left bg-slate-950 hover:bg-slate-950/80 border border-slate-850 hover:border-amber-500/30 p-3.5 rounded-xl text-xs text-slate-300 hover:text-amber-100 transition-all cursor-pointer leading-relaxed"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Input Onboarding */}
        <form onSubmit={(e) => { e.preventDefault(); if (initialMessage.trim()) onSubmitInitial(initialMessage); }} className="space-y-3">
          <div className="relative">
            <textarea
              id="initial-message-input"
              rows={3}
              placeholder="Nhập trực tiếp cảm xúc, áp lực hay câu chuyện bạo lực/áp lực học đường của bạn tại đây để Ta dựng mê cung..."
              value={initialMessage}
              onChange={(e) => setInitialMessage(e.target.value)}
              disabled={isLoading}
              className="w-full bg-slate-950 border border-slate-850 focus:border-amber-500 rounded-xl px-4 py-3 text-xs font-sans text-slate-200 placeholder-slate-500 outline-none resize-none leading-relaxed"
            />
          </div>

          <div className="flex justify-end">
            <button
              id="btn-start-journey"
              type="submit"
              disabled={isLoading || !initialMessage.trim()}
              className="bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-600 hover:to-purple-700 text-slate-950 font-bold text-xs font-mono px-6 py-3 rounded-xl transition-all shadow-lg shadow-purple-950/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Đang khởi tạo Mê cung...
                </>
              ) : (
                <>
                  Bước vào Mê Cung Tâm Trí
                  <Send className="w-3.5 h-3.5 fill-current" />
                </>
              )}
            </button>
          </div>
        </form>

        {renderErrorBlock()}
      </div>
    );
  }

  // Active Narrative Game Console View
  return (
    <div className="flex flex-col gap-6">
      {/* Narrative Console card */}
      <div className="bg-slate-950/85 backdrop-blur-md border border-amber-500/10 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Header containing system status and reset */}
        <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-900">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            <h4 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
              Khung Cảnh Tâm Trí: {currentState.islandStatus || "Sương mù huyền bí"}
            </h4>
          </div>
          <button
            id="btn-restart-journey"
            onClick={onReset}
            className="text-[10px] text-slate-400 hover:text-amber-400 font-mono flex items-center gap-1 bg-slate-900 border border-slate-800 hover:border-amber-500/20 px-2.5 py-1.5 rounded-xl cursor-pointer transition-all"
          >
            <RefreshCw className="w-3 h-3" />
            Khởi đầu lại
          </button>
        </div>

        {/* Core Narrative Visual Novel Panel */}
        <div className="prose prose-invert max-w-none mb-6">
          <p className="text-slate-200 font-serif text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
            {currentState.narrative}
          </p>
        </div>

        {/* Knowledge Fragment: Time Librarian Parchment style */}
        <div className="bg-amber-950/10 border border-amber-500/20 rounded-2xl p-5 mb-6 relative">
          <div className="absolute -top-3 left-4 bg-slate-950 border border-amber-500/20 px-3 py-0.5 rounded-full text-[9px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            Mảnh vỡ Tri thức (The Time Librarian)
          </div>

          <div className="mb-3 mt-1">
            <span className="text-[10px] text-slate-400 font-mono italic block mb-1">
              Cuốn sách chữa lành: {currentState.knowledgeFragment.bookTitle}
            </span>
            <p className="text-xs sm:text-sm text-amber-200 font-serif italic border-l-2 border-amber-500/30 pl-3 leading-relaxed">
              "{currentState.knowledgeFragment.quote}"
            </p>
          </div>

          <p className="text-xs text-slate-300 font-sans leading-relaxed mb-4">
            {currentState.knowledgeFragment.insight}
          </p>

          {/* Socrates Interactivity inside the Knowledge Fragment */}
          <div className="bg-slate-950/80 border border-slate-900 rounded-xl p-4">
            <div className="flex items-start gap-2 mb-2">
              <HelpCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs font-semibold text-amber-300 font-sans leading-relaxed">
                {currentState.knowledgeFragment.question}
              </p>
            </div>

            {!answeredSocrates ? (
              <form onSubmit={handleSocratesSubmit} className="flex gap-2">
                <input
                  id="socrates-answer-input"
                  type="text"
                  placeholder="Bộc bạch suy nghĩ của bạn..."
                  value={socratesAnswer}
                  onChange={(e) => setSocratesAnswer(e.target.value)}
                  className="flex-grow bg-slate-900 border border-slate-850 focus:border-amber-500/40 rounded-lg px-3 py-1.5 text-xs text-slate-200 outline-none font-sans"
                />
                <button
                  id="btn-submit-socrates"
                  type="submit"
                  disabled={!socratesAnswer.trim()}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-mono font-bold text-[10px] px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  Giải mã
                </button>
              </form>
            ) : (
              <div className="mt-2 text-xs bg-slate-900/60 p-3 rounded-lg border border-slate-850 animate-fade-in">
                <div className="text-[10px] text-emerald-400 font-mono mb-1 font-bold uppercase">
                  Đã giải mã thành công thông điệp sách
                </div>
                <p className="text-slate-300 font-serif leading-relaxed italic">
                  {currentState.knowledgeFragment.correctAnswerExplanation}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RPG Choices Section */}
        <div className="space-y-3 mb-6">
          <h5 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
            Hành động tiếp theo (The Choices)
          </h5>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-6">
              <RefreshCw className="w-6 h-6 text-amber-400 animate-spin mb-2" />
              <p className="text-xs text-slate-400 font-mono animate-pulse">
                The Arch-Architect đang bẻ cong tương lai dựa trên cánh bướm lựa chọn...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {currentState.choices.map((choice) => (
                <button
                  key={choice.id}
                  id={`choice-btn-${choice.id}`}
                  onClick={() => handleChoiceSelect(choice)}
                  disabled={isLoading}
                  className="text-left bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/30 p-4 rounded-xl transition-all duration-200 cursor-pointer group flex items-start gap-3"
                >
                  <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-slate-950 border border-slate-800 group-hover:border-amber-500/40 text-xs font-mono font-bold text-amber-400 flex items-center justify-center">
                    {choice.id}
                  </span>
                  <div className="flex-grow">
                    <p className="text-xs font-semibold text-slate-200 group-hover:text-amber-100 transition-colors">
                      {choice.text}
                    </p>
                    <span className="text-[9px] text-slate-500 font-mono block mt-1">
                      {choice.id === "C" ? "💥 Lựa chọn Bộc phát / Góc tối" : "✨ Lựa chọn Trí tuệ"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Custom Story Continuation Input */}
        <form onSubmit={handleCustomSubmit} className="pt-4 border-t border-slate-900">
          <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-2">
            Hoặc tự kiến tạo lời đối thoại của riêng bạn:
          </p>
          <div className="relative">
            <input
              id="custom-message-input"
              type="text"
              placeholder="Bạn muốn hỏi sâu hơn hay đề xuất giải pháp khác? Hãy viết vào đây..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              disabled={isLoading}
              className="w-full bg-slate-900 border border-slate-850 focus:border-amber-500 rounded-xl px-4 py-2.5 pr-10 text-xs text-slate-200 outline-none"
            />
            <button
              id="btn-submit-custom"
              type="submit"
              disabled={isLoading || !customMessage.trim()}
              className="absolute right-2 top-2 bg-transparent text-amber-400 hover:text-amber-300 disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>

        {renderErrorBlock()}
      </div>
    </div>
  );
}
