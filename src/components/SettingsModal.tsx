import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, X, RotateCcw, Key } from 'lucide-react';
import { VerticalDial } from './VerticalDial';
import { ThemeSelector } from './ThemeSelector';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  setShowGestureHelp: (val: boolean) => void;
  
  videoScale: number;
  setVideoScale: (val: number) => void;
  playbackRate: number;
  setPlaybackRate: (val: number) => void;
  playerRef: React.MutableRefObject<any>;
  
  seekBackDuration: number;
  setSeekBackDuration: (val: number) => void;
  maxLoops: number;
  setMaxLoops: (val: number) => void;
  setLoopMode: (val: 0 | 1 | 2) => void;
  
  delayDuration: number;
  setDelayDuration: (val: number) => void;
  fontSize: number;
  setFontSize: (val: number) => void;
  krFontSize: number;
  setKrFontSize: (val: number) => void;

  isSubtitleOnly: boolean;
  setIsSubtitleOnly: (val: boolean) => void;
  isVideoOnly: boolean;
  setIsVideoOnly: (val: boolean) => void;
  setIsPlaying: (val: boolean) => void;

  showVideoControls: boolean;
  setShowVideoControls: (val: boolean) => void;
  isContinuous: boolean;
  setIsContinuous: (val: boolean) => void;
  
  delayMode: 0 | 1 | 2;
  setDelayMode: (val: 0 | 1 | 2) => void;
  showSyncControls: boolean;
  setShowSyncControls: (val: boolean) => void;
  showRecordingPanel: boolean;
  setShowRecordingPanel: (val: boolean) => void;

  aiProvider: 'gemini' | 'cerebras' | 'openrouter';
  setAiProvider: (val: 'gemini' | 'cerebras' | 'openrouter') => void;
  setIsApiKeyModalOpen: (val: boolean) => void;
  testApiKey: (provider: 'gemini' | 'cerebras' | 'openrouter', key: string) => Promise<boolean>;
  userApiKey: string | null;
  cerebrasApiKey: string | null;
  openrouterApiKey: string | null;
  
  isAutoPause: boolean;
  setIsAutoPause: (val: boolean) => void;
  isAutoAdvanceLoop: boolean;
  setIsAutoAdvanceLoop: (val: boolean) => void;

  themeId: string;
  setThemeId: (id: string) => void;
}

export const SettingsModal = ({
  isOpen, onClose, setShowGestureHelp,
  videoScale, setVideoScale,
  playbackRate, setPlaybackRate, playerRef,
  seekBackDuration, setSeekBackDuration,
  maxLoops, setMaxLoops, setLoopMode,
  delayDuration, setDelayDuration,
  fontSize, setFontSize,
  krFontSize, setKrFontSize,
  isSubtitleOnly, setIsSubtitleOnly, isVideoOnly, setIsVideoOnly, setIsPlaying,
  showVideoControls, setShowVideoControls,
  isContinuous, setIsContinuous,
  delayMode, setDelayMode,
  showSyncControls, setShowSyncControls,
  showRecordingPanel, setShowRecordingPanel,
  aiProvider, setAiProvider, setIsApiKeyModalOpen, testApiKey, userApiKey, cerebrasApiKey, openrouterApiKey,
  isAutoPause, setIsAutoPause,
  isAutoAdvanceLoop, setIsAutoAdvanceLoop,
  themeId, setThemeId
}: SettingsModalProps) => {

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 30 }}
            className="w-full max-w-lg bg-[#1a1c23] border border-zinc-700/50 rounded-[32px] p-6 shadow-2xl space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-yellow-500">Study Settings</h3>
                <button 
                  onClick={() => setShowGestureHelp(true)}
                  className="p-1 text-zinc-500 hover:text-yellow-500 transition-colors"
                  title="Gesture Guide"
                >
                  <HelpCircle size={14} />
                </button>
              </div>
              <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 pb-4">
              <div className="flex gap-4 items-start">
                {/* Left: Dials */}
                <div className="flex-1 flex justify-between items-start gap-1">
                  <VerticalDial 
                    label="영상 크기"
                    unit="단계"
                    value={videoScale}
                    min={0}
                    max={5}
                    step={1}
                    color="cyan"
                    onChange={setVideoScale}
                  />

                  <VerticalDial 
                    label="재생 속도"
                    unit="배속"
                    value={playbackRate}
                    min={0.5}
                    max={1.5}
                    step={0.1}
                    color="orange"
                    onChange={(val) => {
                      setPlaybackRate(val);
                      playerRef.current?.setPlaybackRate(val);
                    }}
                  />

                  <VerticalDial 
                    label="재생 빽"
                    unit="초"
                    value={seekBackDuration}
                    min={0}
                    max={5}
                    step={0.5}
                    color="purple"
                    onChange={setSeekBackDuration}
                  />

                  <VerticalDial 
                    label="재생 반복"
                    unit="회"
                    value={maxLoops}
                    min={0}
                    max={20}
                    step={1}
                    color="emerald"
                    onChange={(val) => {
                      setMaxLoops(val);
                      if (val === 0) setLoopMode(0);
                      else if (maxLoops === 0 && val > 0) setLoopMode(1);
                    }}
                  />

                  <VerticalDial 
                    label="재생 대기"
                    unit="초"
                    value={delayDuration}
                    min={0}
                    max={10}
                    step={0.5}
                    color="cyan"
                    onChange={setDelayDuration}
                  />

                  <VerticalDial 
                    label="영자 크기"
                    unit="단계"
                    value={fontSize}
                    min={1}
                    max={7}
                    step={1}
                    color="orange"
                    onChange={setFontSize}
                  />

                  <VerticalDial 
                    label="한문 크기"
                    unit="단계"
                    value={krFontSize}
                    min={1}
                    max={7}
                    step={1}
                    color="purple"
                    onChange={setKrFontSize}
                  />
                </div>

                {/* Right: Vertical Toggles */}
                <div className="w-[80px] flex flex-col gap-1.5 pt-1 border-l border-zinc-700/50 pl-2">
                  <button 
                    onClick={() => {
                      const nextState = !isVideoOnly;
                      setIsVideoOnly(nextState);
                      if (nextState) setIsSubtitleOnly(false);
                    }}
                    className={`h-9 flex items-center justify-center px-1 w-full rounded border transition-colors ${
                      isVideoOnly ? 'bg-orange-500 border-orange-400 text-zinc-950 font-black' : 'bg-transparent border-transparent text-zinc-400 hover:bg-zinc-800'
                    }`}
                  >
                    <span className="text-[10px]">영상전용</span>
                  </button>
                  <button 
                    onClick={() => {
                      const nextState = !isSubtitleOnly;
                      setIsSubtitleOnly(nextState);
                      if (nextState) {
                        setIsVideoOnly(false);
                        setIsPlaying(false);
                        playerRef.current?.pauseVideo();
                      }
                    }}
                    className={`h-9 flex items-center justify-center px-1 w-full rounded border transition-colors ${
                      isSubtitleOnly ? 'bg-orange-500 border-orange-400 text-zinc-950 font-black' : 'bg-transparent border-transparent text-zinc-400 hover:bg-zinc-800'
                    }`}
                  >
                    <span className="text-[10px]">자막전용</span>
                  </button>
                  <button 
                    onClick={() => setShowVideoControls(!showVideoControls)}
                    className={`h-9 flex items-center justify-center px-1 w-full rounded border transition-colors ${
                      showVideoControls ? 'bg-orange-500 border-orange-400 text-zinc-950 font-black' : 'bg-transparent border-transparent text-zinc-400 hover:bg-zinc-800'
                    }`}
                  >
                    <span className="text-[10px]">터치조작</span>
                  </button>
                  <button 
                    onClick={() => setIsContinuous(!isContinuous)}
                    className={`h-9 flex items-center justify-center px-1 w-full rounded border transition-colors ${
                      isContinuous ? 'bg-orange-500 border-orange-400 text-zinc-950 font-black' : 'bg-transparent border-transparent text-zinc-400 hover:bg-zinc-800'
                    }`}
                  >
                    <span className="text-[10px]">연속재생</span>
                  </button>
                  <button 
                    onClick={() => setDelayMode((delayMode + 1) % 3 as 0|1|2)}
                    className={`h-9 flex items-center justify-center px-1 w-full rounded border transition-all ${
                      delayMode === 1 ? 'bg-yellow-500 border-yellow-400 text-zinc-950 font-black' :
                      delayMode === 2 ? 'bg-cyan-500 border-cyan-400 text-zinc-950 font-black' : 'bg-transparent border-transparent text-zinc-400 hover:bg-zinc-800'
                    }`}
                  >
                    <span className="text-[10px]">대기시간</span>
                  </button>
                  <button 
                    onClick={() => setIsAutoPause(!isAutoPause)}
                    className={`h-9 flex items-center justify-center px-1 w-full rounded border transition-colors ${
                      isAutoPause ? 'bg-orange-500 border-orange-400 text-zinc-950 font-black' : 'bg-transparent border-transparent text-zinc-400 hover:bg-zinc-800'
                    }`}
                  >
                    <span className="text-[10px]">자동정지</span>
                  </button>
                  <button 
                    onClick={() => setIsAutoAdvanceLoop(!isAutoAdvanceLoop)}
                    className={`h-9 flex items-center justify-center px-1 w-full rounded border transition-colors ${
                      isAutoAdvanceLoop ? 'bg-orange-500 border-orange-400 text-zinc-950 font-black' : 'bg-transparent border-transparent text-zinc-400 hover:bg-zinc-800'
                    }`}
                  >
                    <span className="text-[10px]">자동진행</span>
                  </button>
                  <button 
                    onClick={() => {
                      if (!showSyncControls) setShowRecordingPanel(false);
                      setShowSyncControls(!showSyncControls);
                    }}
                    className={`h-9 flex items-center justify-center px-1 w-full rounded border transition-colors ${
                      showSyncControls ? 'bg-orange-500 border-orange-400 text-zinc-950 font-black' : 'bg-transparent border-transparent text-zinc-400 hover:bg-zinc-800'
                    }`}
                  >
                    <span className="text-[10px]">싱크패널</span>
                  </button>
                  <button 
                    onClick={() => {
                      if (!showRecordingPanel) setShowSyncControls(false);
                      setShowRecordingPanel(!showRecordingPanel);
                    }}
                    className={`h-9 flex items-center justify-center px-1 w-full rounded border transition-colors ${
                      showRecordingPanel ? 'bg-orange-500 border-orange-400 text-zinc-950 font-black' : 'bg-transparent border-transparent text-zinc-400 hover:bg-zinc-800'
                    }`}
                  >
                    <span className="text-[10px]">녹음패널</span>
                  </button>
                </div>
              </div>

              <div className="flex bg-zinc-900 rounded-xl p-1 gap-1 border border-zinc-800/50 mt-2">
                <button
                  onClick={() => setShowGestureHelp(true)}
                  className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg transition-colors flex items-center justify-center gap-1 border border-zinc-700"
                  title="Gesture Guide"
                >
                  <HelpCircle size={12} />
                  <span className="text-[12px] font-black uppercase tracking-tighter text-center">Gesture Guide</span>
                </button>
                <button
                  onClick={() => setIsApiKeyModalOpen(true)}
                  className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-lg transition-colors flex items-center justify-center gap-1 border border-zinc-700"
                  title="Configure API Keys"
                >
                  <Key size={12} />
                  <span className="text-[12px] font-black uppercase tracking-tighter text-center">API Key Settings</span>
                </button>
              </div>

              <ThemeSelector themeId={themeId} setThemeId={setThemeId} />
            </div>

            {/* Footer Buttons */}
            <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-zinc-700/50">
              <button 
                onClick={() => {
                  setPlaybackRate(1.0);
                  setMaxLoops(5);
                  setDelayDuration(1.0);
                  setFontSize(3);
                  setIsContinuous(true);
                  setIsAutoPause(false);
                  setIsAutoAdvanceLoop(true);
                  setIsSubtitleOnly(false);
                  setIsVideoOnly(false);
                  playerRef.current?.setPlaybackRate(1.0);
                }}
                className="bg-zinc-800/80 hover:bg-zinc-700 py-2 rounded-lg border border-zinc-700 flex items-center justify-center gap-2 text-yellow-500 active:scale-95 transition-all shadow-lg"
              >
                <RotateCcw size={14} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Reset All Settings</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
