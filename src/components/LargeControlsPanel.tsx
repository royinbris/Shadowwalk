import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Play, X } from 'lucide-react';

interface LargeControlsPanelProps {
  showSyncControls: boolean;
  showRecordingPanel: boolean;
  isSplitStudy: boolean;
  currentIndex: number;
  transcriptLength: number;
  adjustNextTimestamp: (val: number) => void;
  isRecording: boolean;
  isPlayingRecorded: boolean;
  recordedUrl: string | null;
  handlePlayStart: (e: any) => void;
  handlePlayEnd: (e: any) => void;
  handlePTTStart: (e: any) => void;
  handlePTTEnd: (e: any) => void;
  playerRef: React.MutableRefObject<any>;
  videoRef: React.MutableRefObject<any>;
  setIsPlaying: (val: boolean) => void;
  togglePlay: () => void;
  isPlaying: boolean;
  remainingPlaybackTime: number;
  recordingDuration: number;
  setShowRecordingPanel: (val: boolean) => void;
}

export const LargeControlsPanel = ({
  showSyncControls, showRecordingPanel, isSplitStudy,
  currentIndex, transcriptLength, adjustNextTimestamp,
  isRecording, isPlayingRecorded, recordedUrl,
  handlePlayStart, handlePlayEnd, handlePTTStart, handlePTTEnd,
  playerRef, videoRef, setIsPlaying, togglePlay, isPlaying,
  remainingPlaybackTime, recordingDuration, setShowRecordingPanel
}: LargeControlsPanelProps) => {
  return (
    <AnimatePresence>
      {(showSyncControls || showRecordingPanel) && (
        <motion.div 
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          onPointerDown={(e) => e.stopPropagation()}
          onPointerUp={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className={`${isSplitStudy ? 'absolute' : 'fixed'} bottom-0 left-0 right-0 z-50 p-1 bg-zinc-900/95 backdrop-blur-2xl border-t border-zinc-800 pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]`}
        >
          <div className="w-full max-w-2xl mx-auto relative h-[216px]">
            {/* SYNC PANEL - Only show if specifically requested and not on the last sentence */}
            {showSyncControls && currentIndex < transcriptLength - 1 && (
              <div className="flex gap-1 items-stretch h-full">
                {/* Left Side: Minus Buttons */}
                <div className="grid grid-cols-2 gap-1 flex-1">
                  <button 
                    onClick={() => adjustNextTimestamp(-0.1)}
                    className="bg-zinc-800 active:bg-yellow-500 active:text-black py-10 rounded-lg text-[13px] font-black border border-zinc-700 text-zinc-400"
                  >
                    -0.1
                  </button>
                  <button 
                    onClick={() => adjustNextTimestamp(-0.25)}
                    className="bg-zinc-800 active:bg-yellow-500 active:text-black py-10 rounded-lg text-[13px] font-black border border-zinc-700 text-zinc-400"
                  >
                    -0.25
                  </button>
                  <button 
                    onClick={() => adjustNextTimestamp(-1.0)}
                    className="bg-zinc-800 active:bg-yellow-500 active:text-black py-10 rounded-lg text-[13px] font-black border border-zinc-700 text-zinc-400"
                  >
                    -1.0
                  </button>
                  <button 
                    onClick={() => adjustNextTimestamp(-0.5)}
                    className="bg-zinc-800 active:bg-yellow-500 active:text-black py-10 rounded-lg text-[13px] font-black border border-zinc-700 text-zinc-400"
                  >
                    -0.50
                  </button>
                </div>

                {/* Vertical Divider */}
                <div className="w-[1px] bg-zinc-700 mx-0.5 self-stretch"></div>

                {/* Right Side: Plus Buttons */}
                <div className="grid grid-cols-2 gap-1 flex-1">
                  <button 
                    onClick={() => adjustNextTimestamp(0.25)}
                    className="bg-zinc-800 active:bg-yellow-500 active:text-black py-10 rounded-lg text-[13px] font-black border border-zinc-700 text-zinc-400"
                  >
                    +0.25
                  </button>
                  <button 
                    onClick={() => adjustNextTimestamp(0.1)}
                    className="bg-zinc-800 active:bg-yellow-500 active:text-black py-10 rounded-lg text-[13px] font-black border border-zinc-700 text-zinc-400"
                  >
                    +0.1
                  </button>
                  <button 
                    onClick={() => adjustNextTimestamp(0.5)}
                    className="bg-zinc-800 active:bg-yellow-500 active:text-black py-10 rounded-lg text-[13px] font-black border border-zinc-700 text-zinc-400"
                  >
                    +0.50
                  </button>
                  <button 
                    onClick={() => adjustNextTimestamp(1.0)}
                    className="bg-zinc-800 active:bg-yellow-500 active:text-black py-10 rounded-lg text-[13px] font-black border border-zinc-700 text-zinc-400"
                  >
                    +1.0
                  </button>
                </div>
              </div>
            )}

            {/* RECORDING PANEL OVERLAY */}
            <AnimatePresence>
              {showRecordingPanel && (
                <motion.div 
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 50, opacity: 0 }}
                  onPointerDown={(e) => e.stopPropagation()}
                  onPointerUp={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute inset-0 z-[60] bg-zinc-950 border border-zinc-900 rounded-lg overflow-hidden flex select-none"
                >
                  {/* AREA 1: LEFT (25%) - Status & Replay */}
                  <div 
                    className={`flex-[1] border-r border-zinc-900 flex flex-col items-center justify-between p-3 transition-colors ${isPlayingRecorded ? 'bg-green-950/20' : recordedUrl ? 'hover:bg-zinc-900/40 cursor-pointer' : ''}`}
                    onPointerDown={(e) => {
                      playerRef.current?.pauseVideo();
                      videoRef.current?.pause();
                      setIsPlaying(false);
                      if (recordedUrl) handlePlayStart(e);
                    }}
                    onPointerUp={handlePlayEnd}
                    onPointerLeave={handlePlayEnd}
                  >
                    <div className="flex justify-center w-full">
                      <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider font-mono transition-all duration-300 border ${
                        isRecording 
                          ? 'bg-red-500/20 text-red-500 border-red-500/30' 
                          : isPlayingRecorded 
                            ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30' 
                            : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                      }`}>
                        {isRecording ? '녹음중' : isPlayingRecorded ? '재생중' : '대기중'}
                      </div>
                    </div>
                    <div className="flex-1" />
                  </div>

                  {/* AREA 2: CENTER (50%) - Recording (Dedicated PTT) */}
                  <div 
                    className={`flex-[2] relative flex flex-col items-center justify-center border-r border-zinc-900 transition-colors cursor-pointer touch-none ${
                      isRecording ? 'bg-red-950/20' : isPlayingRecorded ? 'bg-emerald-950/20' : 'hover:bg-zinc-900/40'
                    }`}
                    onPointerDown={(e) => {
                      playerRef.current?.pauseVideo();
                      videoRef.current?.pause();
                      setIsPlaying(false);
                      handlePTTStart(e);
                    }}
                    onPointerUp={handlePTTEnd}
                    onPointerLeave={handlePTTEnd}
                  >
                    {(isRecording || isPlayingRecorded) && (
                      <>
                        <motion.div 
                          initial={{ scale: 1, opacity: 0.5 }}
                          animate={{ scale: 3, opacity: 0 }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                          className={`absolute w-20 h-20 rounded-full border ${isRecording ? 'border-red-500/50' : 'border-emerald-500/50'}`}
                        />
                        <motion.div 
                          initial={{ scale: 1, opacity: 0.8 }}
                          animate={{ scale: 2.2, opacity: 0 }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                          className={`absolute w-20 h-20 rounded-full border ${isRecording ? 'border-red-500/30' : 'border-emerald-500/30'}`}
                        />
                      </>
                    )}
                    
                    <div className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isRecording 
                        ? 'bg-red-600 scale-105 shadow-[0_0_40px_rgba(220,38,38,0.5)]' 
                        : isPlayingRecorded
                          ? 'bg-emerald-600 scale-105 shadow-[0_0_40px_rgba(16,185,129,0.5)]'
                          : 'bg-zinc-900 shadow-xl'
                    }`}>
                      {isPlayingRecorded ? (
                        <Play className="w-10 h-10 text-white fill-white" />
                      ) : (
                        <Mic className={`w-10 h-10 transition-colors ${isRecording ? 'text-white' : 'text-zinc-500'}`} />
                      )}
                    </div>
                  </div>

                  {/* AREA 3: RIGHT (25%) - Timer & Video Toggle */}
                  <div 
                    className={`flex-[1] flex flex-col items-center justify-between p-3 cursor-pointer transition-colors relative ${isPlaying ? 'bg-yellow-950/10' : 'hover:bg-zinc-900/40'}`}
                    onClick={togglePlay}
                  >
                    <div className={`font-mono text-lg font-black tracking-tighter transition-colors duration-300 ${
                      isRecording ? 'text-red-500' : isPlayingRecorded ? 'text-emerald-500' : 'text-zinc-500'
                    }`}>
                      {isPlayingRecorded 
                        ? `${Math.floor(remainingPlaybackTime / 60)}:${String(remainingPlaybackTime % 60).padStart(2, '0')}`
                        : `${Math.floor(recordingDuration / 60)}:${String(recordingDuration % 60).padStart(2, '0')}`
                      }
                    </div>
                    
                    <div className="flex-1" />

                    <button 
                      onClick={(e) => { e.stopPropagation(); setShowRecordingPanel(false); }}
                      className="absolute bottom-2 right-2 p-1.5 text-zinc-700 hover:text-white transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
