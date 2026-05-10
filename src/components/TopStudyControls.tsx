import React, { useState } from "react";
import { X, Key } from "lucide-react";
import { TranscriptItem, RightView } from "../types";
import { printSubtitles } from "../utils";

interface TopStudyControlsProps {
  transcript: TranscriptItem[];
  currentIndex: number;
  selectedWords: string[];
  openEditor: () => void;
  playSentence: (index: number) => void;
  delayMode: 0 | 1 | 2;
  setDelayMode: (val: 0 | 1 | 2) => void;
  isAutoPause: boolean;
  setIsAutoPause: (val: boolean) => void;
  isSplitStudy: boolean;
  setRightView: (val: RightView) => void;
  showGeminiHelper: boolean;
  setShowGeminiHelper: (val: boolean) => void;
  isWideLayout: boolean;
  showSettings: boolean;
  setShowSettings: (val: boolean) => void;
  rightView: RightView;
  showRecordingPanel: boolean;
  setShowRecordingPanel: (val: boolean) => void;
  loopMode: 0 | 1 | 2;
  setLoopMode: (val: 0 | 1 | 2) => void;
  loopCount: number;
  maxLoops: number;
  showVideoControls: boolean;
  setShowVideoControls: (val: boolean) => void;
  aiProvider: "gemini" | "cerebras" | "openrouter";
  setTempAnalysisPrompt: (val: string) => void;
  analysisPromptTemplate: string;
  setTempQueryPrompt: (val: string) => void;
  queryPromptTemplate: string;
  setIsPromptEditorOpen: (val: boolean) => void;
  setIsApiKeyModalOpen?: (val: boolean) => void;
  isCustomLoopActive: boolean;
  isVideoOnly: boolean;
  toggleVideoOnly: () => void;
  isSubtitleOnly: boolean;
  toggleSubtitleOnly: () => void;
  projectTitle?: string;
  isExpansionMode?: boolean;
  cyclePlaybackStage?: () => void;
}

export const TopStudyControls = ({
  transcript,
  currentIndex,
  selectedWords,
  openEditor,
  playSentence,
  delayMode,
  setDelayMode,
  isAutoPause,
  setIsAutoPause,
  isSplitStudy,
  setRightView,
  showGeminiHelper,
  setShowGeminiHelper,
  isWideLayout,
  showSettings,
  setShowSettings,
  rightView,
  showRecordingPanel,
  setShowRecordingPanel,
  loopMode,
  setLoopMode,
  loopCount,
  maxLoops,
  showVideoControls,
  setShowVideoControls,
  aiProvider,
  setTempAnalysisPrompt,
  analysisPromptTemplate,
  setTempQueryPrompt,
  queryPromptTemplate,
  setIsPromptEditorOpen,
  setIsApiKeyModalOpen,
  isCustomLoopActive,
  isVideoOnly,
  toggleVideoOnly,
  isSubtitleOnly,
  toggleSubtitleOnly,
  projectTitle,
  isExpansionMode = false,
  cyclePlaybackStage,
}: TopStudyControlsProps) => {
  const [isJumpPopupOpen, setIsJumpPopupOpen] = useState(false);
  const [jumpTens, setJumpTens] = useState(0);
  const [jumpOnes, setJumpOnes] = useState(0);

  const handleJumpSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const targetNumber = jumpTens * 10 + jumpOnes;
    let targetIndex = targetNumber - 1;
    if (!isNaN(targetIndex)) {
      targetIndex = Math.max(0, Math.min(transcript.length - 1, targetIndex));
      playSentence(targetIndex);
    }
    setIsJumpPopupOpen(false);
  };

  return (
    <>
      {/* Progress Indicator */}
      {transcript.length > 0 && (
        <div className="px-2 md:px-4 py-2 flex items-center bg-zinc-900/30 border-b border-zinc-800/50">
          {/* Left: Sentence Counter */}
          <div
            onClick={() => openEditor()}
            className="text-yellow-500 font-bold text-[14px] uppercase tracking-widest cursor-pointer hover:text-yellow-400 active:scale-95 transition-all shrink-0 whitespace-nowrap"
          >
            {currentIndex + 1}/{transcript.length}
          </div>

          {/* Center: Functional Buttons */}
          <div className="flex-1 flex items-center justify-between px-2 sm:px-4 min-w-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDelayMode(((delayMode + 1) % 3) as 0 | 1 | 2);
              }}
              className={`relative flex items-center justify-center text-[25px] flex-col leading-none font-bold transition-all hover:scale-110 active:scale-90 ${delayMode === 2 ? "text-red-500" : delayMode === 1 ? "text-yellow-500" : "text-white/30"}`}
              title="Play 간격 토글"
            >
              🅦
              {delayMode === 2 && <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-current rounded-full" />}
              {delayMode === 1 && <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-current rounded-full" />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsAutoPause(!isAutoPause);
              }}
              className={`text-[25px] font-bold transition-all hover:scale-110 active:scale-90 ${isAutoPause ? "text-yellow-500" : "text-white/30"}`}
              title="Auto Pause"
            >
              🅟
            </button>
            <button
              onClick={() => {
                if (isSplitStudy) {
                  setRightView("assistant");
                } else {
                  setShowGeminiHelper(!showGeminiHelper);
                }
              }}
              className={`text-[25px] font-bold transition-all hover:scale-110 active:scale-90 ${(isSplitStudy ? rightView === "assistant" : showGeminiHelper) ? "text-purple-400" : "text-white/30"}`}
              title={showGeminiHelper ? "도우미 끄기" : "Gemini 도우미"}
            >
              🅐
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                const curr = currentIndex + 1;
                setJumpTens(Math.floor(curr / 10));
                setJumpOnes(curr % 10);
                setIsJumpPopupOpen(true);
              }}
              className={`text-[25px] font-bold transition-all hover:scale-110 active:scale-90 text-white/30 hover:text-cyan-400`}
              title="문장 이동 (X)"
            >
              🅧
            </button>
            <button
              onClick={() => {
                if (!isWideLayout) {
                  setShowSettings(!showSettings);
                } else {
                  setRightView(
                    rightView === "settings" ? "scriptLibrary" : "settings",
                  );
                }
              }}
              className="px-4 py-1.5 rounded-full text-[13px] font-black uppercase tracking-tight transition-all border bg-yellow-500 text-black border-yellow-600 shadow-[0_0_15px_rgba(234,179,8,0.3)] active:scale-95 shrink-0"
            >
              Set
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!isSubtitleOnly && !isVideoOnly) {
                   toggleSubtitleOnly(); // N -> T
                } else if (isSubtitleOnly) {
                   toggleVideoOnly(); // T -> F
                } else if (isVideoOnly) {
                   toggleVideoOnly(); // F -> N
                }
              }}
              className={`relative flex items-center justify-center text-[25px] flex-col leading-none font-bold transition-all hover:scale-110 active:scale-90 ${isSubtitleOnly ? "text-red-500" : isVideoOnly ? "text-[#ff00ff]" : "text-white/30"}`}
              title={`디스플레이 모드 (${isSubtitleOnly ? "T" : isVideoOnly ? "F" : "N"})`}
            >
              {isSubtitleOnly ? "🅣" : isVideoOnly ? "🅕" : "🅝"}
              {isVideoOnly && <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-current rounded-full" />}
              {isSubtitleOnly && <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-current rounded-full" />}
            </button>
            <button
              onClick={() => {
                if (selectedWords && selectedWords.length > 0) {
                  navigator.clipboard.writeText(selectedWords.join(" "));
                } else {
                  const currentText = transcript[currentIndex]?.text;
                  if (currentText) {
                    navigator.clipboard.writeText(currentText);
                  }
                }
              }}
              className="text-[25px] font-bold transition-all hover:scale-110 active:scale-90 text-white/30 hover:text-yellow-500"
              title="문장 복사"
            >
              🅒
            </button>
            <button
              onClick={() => setShowRecordingPanel(!showRecordingPanel)}
              className={`text-[25px] font-bold transition-all hover:scale-110 active:scale-90 ${showRecordingPanel ? "text-red-500" : "text-white/30"}`}
              title="음성 녹음"
            >
              🅡
            </button>
            <button
              onClick={() =>
                setLoopMode(loopMode === 0 ? 2 : ((loopMode - 1) as 0 | 1 | 2))
              }
              className={`relative flex items-center justify-center text-[25px] flex-col leading-none font-bold transition-all hover:scale-110 active:scale-90 ${loopMode === 2 ? "text-red-500" : loopMode === 1 ? "text-yellow-500" : "text-white/30"}`}
              title="Loop"
            >
              🅛
              {loopMode === 2 && <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-current rounded-full" />}
              {loopMode === 1 && <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-current rounded-full" />}
            </button>
          </div>

          {/* Right: Loop Counter */}
          <div className="shrink-0 flex justify-end">
            <button
              onClick={() => {
                if (cyclePlaybackStage) cyclePlaybackStage();
                else setShowVideoControls(!showVideoControls);
              }}
              className={`${loopMode === 0 ? "text-yellow-500/40" : "text-yellow-500"} font-bold text-[14px] uppercase tracking-widest hover:text-yellow-400 active:scale-95 transition-all inline-flex items-center gap-1 whitespace-nowrap min-w-[50px] justify-end`}
              title="스테이지 변경"
            >
              <div className="w-[36px] text-right">
                {loopMode === 0 ? "-/-" : loopMode === 2 ? "∞" : `${loopCount + 1}/${maxLoops}`}
              </div>
              <span
                className={`text-[20px] leading-none ${
                  loopMode === 0
                    ? "text-white/10"
                    : isExpansionMode
                      ? "text-orange-500"
                      : isCustomLoopActive
                        ? "text-red-500"
                        : showVideoControls
                          ? "text-green-500"
                          : "text-white/30"
                }`}
              >
                •
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Gemini Helper Integrated Title Bar */}
      {showGeminiHelper && !isSplitStudy && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowGeminiHelper(false);
            }
          }}
          className="px-4 py-2 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between cursor-pointer hover:bg-zinc-800 transition-colors"
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="flex items-baseline gap-2 overflow-hidden pointer-events-none">
              <h3 className="text-[11.5px] font-black uppercase tracking-tighter text-purple-500 shrink-0">
                {aiProvider === "gemini"
                  ? "Gemini"
                  : aiProvider === "cerebras"
                    ? "Cerebras"
                    : "OpenRouter"}{" "}
                도우미
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {transcript && transcript.length > 0 && (
                <div className="flex gap-1 mr-2 border-r border-zinc-700 pr-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      printSubtitles(
                        transcript,
                        "en",
                        projectTitle || "Subtitles",
                      );
                    }}
                    className="px-2 py-0.5 rounded text-[9.5px] font-black uppercase tracking-tighter text-zinc-400 border border-zinc-700 hover:text-white hover:border-zinc-500 transition-all flex items-center gap-1 bg-zinc-800"
                    title="Print English Only"
                  >
                    EN
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      printSubtitles(
                        transcript,
                        "all",
                        projectTitle || "Subtitles",
                      );
                    }}
                    className="px-2 py-0.5 rounded text-[9.5px] font-black uppercase tracking-tighter text-zinc-400 border border-zinc-700 hover:text-white hover:border-zinc-500 transition-all flex items-center gap-1 bg-zinc-800"
                    title="Print All"
                  >
                    ALL
                  </button>
                </div>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setTempAnalysisPrompt(analysisPromptTemplate);
                  setTempQueryPrompt(queryPromptTemplate);
                  setIsPromptEditorOpen(true);
                }}
                className="text-[9.5px] font-black text-zinc-500 hover:text-purple-400 transition-colors bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700 active:scale-95 uppercase tracking-tighter"
              >
                Prompt
              </button>
              {setIsApiKeyModalOpen && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsApiKeyModalOpen(true);
                  }}
                  className="text-[9.5px] flex items-center justify-center gap-1 font-black text-zinc-500 hover:text-white transition-colors bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700 active:scale-95 uppercase tracking-tighter"
                  title="API Key Settings"
                >
                  API <Key size={10} />
                </button>
              )}
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowGeminiHelper(false);
            }}
            className="text-zinc-500 hover:text-white transition-colors p-1"
          >
            <X size={14} />
          </button>
        </div>
      )}
      {isJumpPopupOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-2">
          <div className="bg-zinc-900 border border-zinc-700 p-4 sm:p-6 rounded-2xl w-full max-w-[560px] flex flex-col gap-4 shadow-2xl relative">
            <button
              onClick={() => setIsJumpPopupOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-white text-center">문장 이동</h2>
            <p className="text-zinc-400 text-sm text-center">
              1번째부터 {transcript.length}번째까지 이동 가능
            </p>
            
            <div className="flex flex-col gap-5 my-2">
              <div className="flex flex-col gap-2">
                <div className="text-zinc-500 text-xs font-bold pl-1 uppercase tracking-wider">Tens (십의 자리)</div>
                <div className="grid grid-cols-10 gap-1 sm:gap-2">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
                    const maxTens = Math.floor(transcript.length / 10);
                    const isDisabled = num > maxTens;
                    return (
                      <button
                        key={`tens-${num}`}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => {
                          setJumpTens(num);
                          if (num === maxTens && jumpOnes > transcript.length % 10) {
                            setJumpOnes(transcript.length % 10);
                          }
                        }}
                        className={`aspect-square sm:h-12 w-full rounded-lg text-base sm:text-xl font-bold transition-all flex items-center justify-center ${
                          isDisabled 
                            ? "bg-zinc-800/30 text-zinc-700 cursor-not-allowed" 
                            : jumpTens === num
                            ? "bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)] scale-110 z-10"
                            : "bg-zinc-800 text-white hover:bg-zinc-700 active:scale-95"
                        }`}
                      >
                        {num}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="text-zinc-500 text-xs font-bold pl-1 uppercase tracking-wider">Ones (일의 자리)</div>
                <div className="grid grid-cols-10 gap-1 sm:gap-2">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
                    const maxTens = Math.floor(transcript.length / 10);
                    const isDisabled = jumpTens === maxTens ? num > (transcript.length % 10) : false;
                    return (
                      <button
                        key={`ones-${num}`}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => setJumpOnes(num)}
                        className={`aspect-square sm:h-12 w-full rounded-lg text-base sm:text-xl font-bold transition-all flex items-center justify-center ${
                          isDisabled
                            ? "bg-zinc-800/30 text-zinc-700 cursor-not-allowed"
                            : jumpOnes === num
                            ? "bg-orange-500 text-black shadow-[0_0_15px_rgba(249,115,22,0.4)] scale-110 z-10"
                            : "bg-zinc-800 text-white hover:bg-zinc-700 active:scale-95"
                        }`}
                      >
                        {num}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="text-center font-black text-4xl text-white my-2">
              {Math.max(1, Math.min(transcript.length, jumpTens * 10 + jumpOnes))}
            </div>

            <form onSubmit={handleJumpSubmit} className="flex flex-col gap-4 mt-2">
              <button
                type="submit"
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 sm:py-4 rounded-xl text-lg transition-all active:scale-95 shadow-[0_0_20px_rgba(8,145,178,0.3)]"
              >
                이동하기
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
