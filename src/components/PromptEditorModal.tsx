import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings } from 'lucide-react';

interface PromptEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  tempAnalysisPrompt: string;
  setTempAnalysisPrompt: (val: string) => void;
  tempQueryPrompt: string;
  setTempQueryPrompt: (val: string) => void;
  onSave: () => void;
}

export const PromptEditorModal = ({
  isOpen,
  onClose,
  tempAnalysisPrompt,
  setTempAnalysisPrompt,
  tempQueryPrompt,
  setTempQueryPrompt,
  onSave
}: PromptEditorModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm shadow-[0_0_100px_rgba(0,0,0,0.5)]">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]"
          >
            <div className="flex items-center justify-between p-4 flex-shrink-0">
              <h4 className="text-[13px] font-black text-purple-400 flex items-center gap-2 uppercase tracking-wide">
                <span className="bg-purple-500/20 p-1.5 rounded-lg"><Settings size={14} className="text-purple-400" /></span>
                Prompt Editor
              </h4>
              <div className="flex gap-2">
                <button 
                  onClick={onClose}
                  className="text-[11px] font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-xl border border-zinc-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={onSave}
                  className="text-[11px] font-bold bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-xl shadow-lg shadow-purple-900/20 active:scale-95 transition-all"
                >
                  Save
                </button>
              </div>
            </div>
            
            <div className="flex-1 space-y-4 p-4 overflow-y-auto hide-scrollbar bg-zinc-950/50 border-t border-zinc-800">
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 flex flex-col gap-1">
                  Analysis Prompt
                  <span className="text-[9px] text-zinc-500 font-medium normal-case tracking-normal">Translates transcripts and highlights vocabulary</span>
                </label>
                <textarea 
                  value={tempAnalysisPrompt}
                  onChange={(e) => setTempAnalysisPrompt(e.target.value)}
                  className="w-full h-40 bg-zinc-900 border border-zinc-800 p-3 rounded-xl text-[11px] text-zinc-300 font-mono resize-none focus:border-purple-500/50 focus:outline-none placeholder:text-zinc-700"
                  placeholder="Enter system prompt for analysis..."
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 flex flex-col gap-1">
                  Query Prompt
                  <span className="text-[9px] text-zinc-500 font-medium normal-case tracking-normal">Directly interact with AI along with transcripts</span>
                </label>
                <textarea 
                  value={tempQueryPrompt}
                  onChange={(e) => setTempQueryPrompt(e.target.value)}
                  className="w-full h-24 bg-zinc-900 border border-zinc-800 p-3 rounded-xl text-[11px] text-zinc-300 font-mono resize-none focus:border-purple-500/50 focus:outline-none placeholder:text-zinc-700"
                  placeholder="Enter query format..."
                />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
