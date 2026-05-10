import React, { useState } from 'react';
import { THEMES } from '../themes';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface ThemeSelectorProps {
  themeId: string;
  setThemeId: (id: string) => void;
}

export const ThemeSelector = ({ themeId, setThemeId }: ThemeSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const currentTheme = themeId === 'default' ? null : THEMES.find(t => t.id === themeId);

  return (
    <>
      <div className="mt-4 pt-4 border-t border-zinc-700/50">
        <button 
          onClick={() => setIsOpen(true)} 
          className="w-full flex items-center justify-between bg-zinc-800/50 hover:bg-zinc-800 p-3 rounded-xl transition-colors border border-zinc-700/50"
        >
          <span className="text-xs font-black uppercase tracking-[0.2em] text-yellow-500">테마모드</span>
          <div className="flex items-center gap-2">
            {currentTheme ? (
              <div className="flex w-16 h-3 rounded overflow-hidden">
                {currentTheme.colors.map((color, idx) => (
                  <div key={idx} className="flex-1 h-full" style={{ backgroundColor: color }} />
                ))}
              </div>
            ) : (
              <span className="text-[10px] font-bold text-zinc-400 border border-zinc-700 px-2 py-0.5 rounded">SYSTEM</span>
            )}
            <span className="text-zinc-500 text-xs">▼</span>
          </div>
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 min-h-screen"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="w-full max-w-2xl bg-zinc-900 border border-zinc-700/50 rounded-[32px] p-6 shadow-2xl space-y-6 max-h-[85vh] overflow-y-auto hide-scrollbar"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-2 sticky top-0 bg-zinc-900 z-10 py-2">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-yellow-500">
                  Select Theme
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-zinc-500 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => {
                      setThemeId(theme.id);
                      setIsOpen(false);
                    }}
                    className={`flex flex-col items-center p-3 rounded-xl transition-all border-2 ${
                      themeId === theme.id ? 'border-yellow-500 bg-zinc-800/80 scale-105' : 'border-zinc-700 hover:bg-zinc-800 hover:border-zinc-500'
                    }`}
                  >
                    <div className="flex w-full h-8 rounded-md overflow-hidden mb-2">
                      {theme.colors.map((color, idx) => (
                        <div key={idx} className="flex-1 h-full" style={{ backgroundColor: color }} />
                      ))}
                    </div>
                    <span className={`text-xs font-bold ${themeId === theme.id ? 'text-yellow-500' : 'text-zinc-300'}`}>
                      {theme.name}
                    </span>
                  </button>
                ))}
                
                {/* Default Option */}
                <button
                  onClick={() => {
                    setThemeId('default');
                    setIsOpen(false);
                  }}
                  className={`flex flex-col items-center p-3 rounded-xl transition-all border-2 ${
                    themeId === 'default' ? 'border-yellow-500 bg-zinc-800/80 scale-105' : 'border-zinc-700 hover:bg-zinc-800 hover:border-zinc-500'
                  }`}
                >
                  <div className="flex items-center justify-center w-full h-8 rounded-md overflow-hidden mb-2 bg-zinc-800 border border-zinc-600">
                    <span className="text-[10px] font-black tracking-widest text-zinc-400">SYSTEM</span>
                  </div>
                  <span className={`text-xs font-bold ${themeId === 'default' ? 'text-yellow-500' : 'text-zinc-300'}`}>
                    Default
                  </span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
