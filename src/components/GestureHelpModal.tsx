import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface GestureHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAutoPause: boolean;
  playbackRate: number;
  fontSize: number;
  maxLoops: number;
  loopMode: 0 | 1 | 2;
}

export const GestureHelpModal = ({
  isOpen,
  onClose,
  isAutoPause,
  playbackRate,
  fontSize,
  maxLoops,
  loopMode
}: GestureHelpModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl"
          >
            <div className="p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-black uppercase italic text-yellow-500 tracking-tighter">제스처 가이드</h3>
                <button onClick={onClose} className="p-1.5 hover:bg-zinc-800 rounded-full transition-colors">
                  <X className="w-4 h-4 text-zinc-500" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 border-b border-zinc-800 pb-0.5">탭 동작 (클릭)</p>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-zinc-800/50 p-2 rounded-xl border border-zinc-800">
                      <p className="text-zinc-400 mb-0.5">왼쪽 25%</p>
                      <p className="font-bold">1x: 이전 문장</p>
                      <p className="text-yellow-500">2x: 자동 멈춤 {isAutoPause ? 'ON' : 'OFF'}</p>
                      <p className="text-yellow-500">3x: 비디오빽 패널</p>
                    </div>
                    <div className="bg-zinc-800/50 p-2 rounded-xl border border-zinc-800">
                      <p className="text-zinc-400 mb-0.5">오른쪽 25%</p>
                      <p className="font-bold">1x: 다음 문장</p>
                      <p className="text-yellow-500">2x: 구문 반복 (루프모드)</p>
                      <p className="text-yellow-500 font-bold">3x: 가이드</p>
                    </div>
                    <div className="col-span-2 bg-zinc-800/50 p-2 rounded-xl border border-zinc-800 text-center">
                      <p className="text-zinc-400 mb-1">중앙 50%</p>
                      <div className="flex justify-around gap-1 font-bold">
                        <p>1x: 재생</p>
                        <p className="text-yellow-500">2x: 동기화</p>
                        <p className="text-yellow-500">3x: 녹음</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 border-b border-zinc-800 pb-0.5">스와이프 ↑↓</p>
                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <div className="bg-zinc-800/50 p-2 rounded-xl border border-zinc-800 text-center">
                      <p className="text-zinc-400 mb-0.5">왼쪽</p>
                      <p className="font-bold">속도</p>
                      <p className="text-yellow-500 font-mono">{playbackRate.toFixed(1)}x</p>
                    </div>
                    <div className="bg-zinc-800/50 p-2 rounded-xl border border-zinc-800 text-center">
                      <p className="text-zinc-400 mb-0.5">중앙</p>
                      <p className="font-bold">크기</p>
                      <p className="text-yellow-500 font-mono">{fontSize}</p>
                    </div>
                    <div className="bg-zinc-800/50 p-2 rounded-xl border border-zinc-800 text-center">
                      <p className="text-zinc-400 mb-0.5">오른쪽</p>
                      <p className="font-bold">반복</p>
                      <p className="text-yellow-500 font-mono">{loopMode === 2 ? '∞' : loopMode === 1 ? maxLoops : 'OFF'}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 border-b border-zinc-800 pb-0.5">키보드 단축키</p>
                  <div className="bg-zinc-800/50 p-2 rounded-xl border border-zinc-800 grid grid-cols-4 gap-y-2 gap-x-1">
                    <div className="flex flex-col items-center">
                      <span className="text-zinc-500 text-[9px] uppercase">속도</span>
                      <span className="font-bold text-yellow-500 font-mono text-[11px]">- / =</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-zinc-500 text-[9px] uppercase">영상크기</span>
                      <span className="font-bold text-yellow-500 font-mono text-[11px]">_ / +</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-zinc-500 text-[9px] uppercase">글자크기</span>
                      <span className="font-bold text-yellow-500 font-mono text-[11px]">; / '</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-zinc-500 text-[9px] uppercase">Loop수</span>
                      <span className="font-bold text-yellow-500 font-mono text-[11px]">[ / ]</span>
                    </div>

                    <div className="flex flex-col items-center border-t border-zinc-700/50 pt-1">
                      <span className="text-zinc-500 text-[9px] uppercase">구문Loop</span>
                      <span className="font-bold text-cyan-400 font-mono text-[11px]">L</span>
                    </div>
                    <div className="flex flex-col items-center border-t border-zinc-700/50 pt-1">
                      <span className="text-zinc-500 text-[9px] uppercase">커스텀Loop</span>
                      <span className="font-bold text-cyan-400 font-mono text-[11px]">X</span>
                    </div>
                    <div className="flex flex-col items-center border-t border-zinc-700/50 pt-1">
                      <span className="text-zinc-500 text-[9px] uppercase">전체화면</span>
                      <span className="font-bold text-cyan-400 font-mono text-[11px]">Z/Enter</span>
                    </div>
                    <div className="flex flex-col items-center border-t border-zinc-700/50 pt-1">
                      <span className="text-zinc-500 text-[9px] uppercase">전체반복</span>
                      <span className="font-bold text-cyan-400 font-mono text-[11px]">R</span>
                    </div>
                    <div className="flex flex-col items-center border-t border-zinc-700/50 pt-1">
                      <span className="text-zinc-500 text-[9px] uppercase">대기모드</span>
                      <span className="font-bold text-cyan-400 font-mono text-[11px]">W</span>
                    </div>

                    <div className="flex flex-col items-center border-t border-zinc-700/50 pt-1">
                      <span className="text-zinc-500 text-[9px] uppercase">오토포즈</span>
                      <span className="font-bold text-cyan-400 font-mono text-[11px]">P</span>
                    </div>
                    <div className="flex flex-col items-center border-t border-zinc-700/50 pt-1">
                      <span className="text-zinc-500 text-[9px] uppercase">단어/TTS</span>
                      <span className="font-bold text-purple-400 font-mono text-[11px]">C</span>
                    </div>
                    <div className="flex flex-col items-center border-t border-zinc-700/50 pt-1">
                      <span className="text-zinc-500 text-[9px] uppercase">Gemini</span>
                      <span className="font-bold text-blue-400 font-mono text-[11px]">A</span>
                    </div>
                    <div className="flex flex-col items-center border-t border-zinc-700/50 pt-1">
                      <span className="text-zinc-500 text-[9px] uppercase">세팅모달</span>
                      <span className="font-bold text-yellow-500 font-mono text-[11px]">S</span>
                    </div>

                    <div className="flex flex-col items-center border-t border-zinc-700/50 pt-1">
                      <span className="text-zinc-500 text-[9px] uppercase">녹음시작</span>
                      <span className="font-bold text-red-500 font-mono text-[11px]">B</span>
                    </div>
                    <div className="flex flex-col items-center border-t border-zinc-700/50 pt-1">
                      <span className="text-zinc-500 text-[9px] uppercase">녹음종료</span>
                      <span className="font-bold text-white font-mono text-[11px]">N</span>
                    </div>
                    <div className="flex flex-col items-center border-t border-zinc-700/50 pt-1">
                      <span className="text-zinc-500 text-[9px] uppercase">발음재생</span>
                      <span className="font-bold text-emerald-500 font-mono text-[11px]">V</span>
                    </div>
                    <div className="flex flex-col items-center border-t border-zinc-700/50 pt-1">
                      <span className="text-zinc-500 text-[9px] uppercase">녹음패널</span>
                      <span className="font-bold text-zinc-400 font-mono text-[11px]">\</span>
                    </div>

                    <div className="flex flex-col items-center border-t border-zinc-700/50 pt-1">
                      <span className="text-zinc-500 text-[9px] uppercase">백버튼패널</span>
                      <span className="font-bold text-yellow-500 font-mono text-[11px]">Q</span>
                    </div>

                    <div className="flex flex-col items-center border-t border-zinc-700/50 pt-1">
                      <span className="text-zinc-500 text-[9px] uppercase">영상전용</span>
                      <span className="font-bold text-orange-400 font-mono text-[11px]">F</span>
                    </div>
                    <div className="flex flex-col items-center border-t border-zinc-700/50 pt-1">
                      <span className="text-zinc-500 text-[9px] uppercase">자막전용</span>
                      <span className="font-bold text-orange-400 font-mono text-[11px]">T</span>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={onClose}
                className="w-full py-3 bg-yellow-500 text-black font-black uppercase tracking-widest rounded-xl active:scale-95 transition-all text-sm"
              >
                확인
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
