import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Repeat, Play, Pause } from "lucide-react";

interface FloatingVideoSeekControlsProps {
  showVideoControls: boolean;
  seekBackDuration: number;
  handleSeekPointerDown: (delta: number) => void;
  stopSeekLoop: () => void;
  toggleCustomLoop: () => void;
  isCustomLoopActive: boolean;
  isExpansionMode?: boolean;
  isExpansionPaused?: boolean;
  toggleExpansionPause?: () => void;
  expandNext?: () => void;
  expandPrev?: () => void;
}

export const FloatingVideoSeekControls = ({
  showVideoControls,
  seekBackDuration,
  handleSeekPointerDown,
  stopSeekLoop,
  toggleCustomLoop,
  isCustomLoopActive,
  isExpansionMode = false,
  isExpansionPaused = false,
  toggleExpansionPause,
  expandNext,
  expandPrev,
}: FloatingVideoSeekControlsProps) => {
  return (
    <AnimatePresence>
      {showVideoControls && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="absolute inset-0 z-[80] flex select-none pointer-events-auto bg-black/10"
          onPointerDown={(e) => e.stopPropagation()}
          onPointerUp={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
          onTap={(e) => e.stopPropagation()}
          onPanStart={(e) => e.stopPropagation()}
          onPan={(e) => e.stopPropagation()}
          onPanEnd={(e) => e.stopPropagation()}
        >
          {/* Left: Atomic Seek Back */}
          <div
            className="flex-1 border-r border-white/20 border-l-[8px] border-l-red-500 bg-transparent active:bg-cyan-500/20 transition-all cursor-pointer touch-none hover:bg-white/5"
            onPointerDown={(e) => {
              e.stopPropagation();
              if (isExpansionMode && expandPrev) {
                expandPrev();
              } else {
                handleSeekPointerDown(-seekBackDuration);
              }
            }}
            onPointerUp={(e) => {
              e.stopPropagation();
              if (!isExpansionMode) stopSeekLoop();
            }}
            onPointerLeave={(e) => {
              e.stopPropagation();
              if (!isExpansionMode) stopSeekLoop();
            }}
            onPointerCancel={(e) => {
              e.stopPropagation();
              if (!isExpansionMode) stopSeekLoop();
            }}
          />

          {/* Center: Custom Loop Segment */}
          <div
            className={`flex-1 bg-transparent active:bg-purple-500/20 transition-all cursor-pointer touch-none flex items-center justify-center hover:bg-white/5 ${
              isExpansionMode || isCustomLoopActive
                ? (isExpansionMode && isExpansionPaused ? "bg-orange-500/30 border-x border-orange-500/50" : "bg-purple-500/30 backdrop-blur-sm border-x border-purple-500/50")
                : ""
            }`}
            onPointerDown={(e) => {
              e.stopPropagation();
              if (isExpansionMode && toggleExpansionPause) {
                toggleExpansionPause();
              } else {
                toggleCustomLoop();
              }
            }}
          >
            {isExpansionMode ? (
              isExpansionPaused ? (
                <Play className="w-12 h-12 text-orange-400 opacity-60 absolute" />
              ) : (
                <Pause className="w-12 h-12 text-purple-400 opacity-60 absolute" />
              )
            ) : isCustomLoopActive ? (
              <Repeat className="w-12 h-12 text-purple-400 opacity-60 absolute" />
            ) : null}
          </div>

          {/* Right: Atomic Seek Forward */}
          <div
            className="flex-1 border-l border-white/20 border-r-[8px] border-r-green-500 bg-transparent active:bg-cyan-500/20 transition-all cursor-pointer touch-none hover:bg-white/5"
            onPointerDown={(e) => {
              e.stopPropagation();
              if (isExpansionMode && expandNext) {
                expandNext();
              } else {
                handleSeekPointerDown(+seekBackDuration);
              }
            }}
            onPointerUp={(e) => {
              e.stopPropagation();
              if (!isExpansionMode) stopSeekLoop();
            }}
            onPointerLeave={(e) => {
              e.stopPropagation();
              if (!isExpansionMode) stopSeekLoop();
            }}
            onPointerCancel={(e) => {
              e.stopPropagation();
              if (!isExpansionMode) stopSeekLoop();
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

