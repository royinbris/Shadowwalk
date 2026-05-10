import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Plus, Minus } from 'lucide-react';

export const VerticalDial = ({ 
  label, 
  value, 
  min, 
  max, 
  step, 
  unit: _unit, 
  onChange, 
  color = 'cyan'
}: { 
  label: string; 
  value: number; 
  min: number; 
  max: number; 
  step: number; 
  unit: string; 
  onChange: (val: number) => void;
  color?: 'cyan' | 'orange' | 'emerald' | 'purple';
}) => {
  const TRACK_H = 180;
  const PAD = 10;
  const USABLE = TRACK_H - PAD * 2;
  
  const accumulatedPan = useRef(0);
  const [isActive, setIsActive] = useState(false);

  const handleDrag = (deltaY: number) => {
    accumulatedPan.current += deltaY;
    const threshold = 12;
    if (Math.abs(accumulatedPan.current) > threshold) {
      const direction = accumulatedPan.current < 0 ? 1 : -1;
      const newVal = Math.max(min, Math.min(max, Number((value + direction * step).toFixed(1))));
      if (newVal !== value) onChange(newVal);
      accumulatedPan.current = 0;
    }
  };

  const ratio = (value - min) / (max - min);
  const fillHeight = ratio * USABLE;
  const thumbBottom = PAD + fillHeight;

  const getColorHex = () => {
    switch(color) {
      case 'orange': return '#ff6b35';
      case 'emerald': return '#10b981';
      case 'purple': return '#a855f7';
      default: return '#00e5ff';
    }
  };

  const hex = getColorHex();

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="flex flex-col items-center mb-1">
        <div className="font-mono text-[10px] uppercase tracking-tighter text-white font-black mb-1 bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700 shadow-md text-center leading-tight">
          {label.split(' ').map((line, i) => <span key={i} className="block">{line}</span>)}
        </div>
        <div className="flex flex-col items-center mt-1">
          <div 
            className="font-mono text-xl font-black transition-all duration-300 leading-tight"
            style={{ color: hex, filter: `drop-shadow(0 0 8px ${hex}66)` }}
          >
            {step < 1 ? value.toFixed(1) : value}
          </div>
          <div className="font-mono text-[9px] font-bold text-zinc-500 uppercase tracking-tighter -mt-1 opacity-80">
            {_unit}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-1.5">
        <button 
          onPointerDown={() => onChange(Math.min(max, Number((value + step).toFixed(1))))}
          className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white active:scale-90 active:border-zinc-600 transition-all shadow-md"
        >
          <Plus size={14} />
        </button>

        <div 
          className="w-9 h-[180px] bg-[#0a0b0d] rounded-full border border-zinc-800/50 relative cursor-ns-resize shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] touch-none overflow-hidden"
          onWheel={(e) => {
            const direction = e.deltaY < 0 ? 1 : -1;
            onChange(Math.max(min, Math.min(max, Number((value + direction * step).toFixed(1)))));
          }}
          onPointerDown={(e) => {
            setIsActive(true);
            const rect = e.currentTarget.getBoundingClientRect();
            const y = e.clientY - rect.top;
            const clickRatio = 1 - (y - PAD) / USABLE;
            const newVal = Math.max(min, Math.min(max, Math.round((min + clickRatio * (max - min)) / step) * step));
            onChange(Number(newVal.toFixed(1)));
          }}
          onPointerUp={() => setIsActive(false)}
          onPointerLeave={() => setIsActive(false)}
        >
          <motion.div 
            className="absolute inset-0 z-20"
            onPan={(e, info) => handleDrag(info.delta.y)}
            onPanEnd={() => { accumulatedPan.current = 0; }}
          />

          {/* Ticks */}
          <div className="absolute inset-0 px-1.5 py-2.5 flex flex-col justify-between pointer-events-none opacity-20">
            {[...Array(11)].map((_, i) => (
              <div 
                key={i} 
                className={`h-[1px] rounded-full ${i % 2 === 0 ? 'w-full bg-zinc-400' : 'w-1/2 mx-auto bg-zinc-600'}`} 
              />
            ))}
          </div>

          {/* Fill Bar */}
          <motion.div 
            className="absolute bottom-[10px] left-[3px] right-[3px] rounded-[18px] shadow-md transition-colors duration-300 pointer-events-none"
            style={{ 
              background: `linear-gradient(to top, ${hex}, ${hex}44)`,
              boxShadow: `0 0 12px ${hex}33`
            }}
            animate={{ height: fillHeight }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />

          {/* Thumb / Handle */}
          <motion.div 
            className="absolute left-1/2 -translate-x-1/2 w-7 h-4 rounded-md border border-zinc-700 bg-gradient-to-br from-zinc-800 to-zinc-900 shadow-md flex items-center justify-center gap-0.5 z-10 pointer-events-none"
            style={{
              borderColor: isActive ? hex : '#3f3f46',
              boxShadow: isActive ? `0 0 10px ${hex}4d` : 'none'
            }}
            animate={{ bottom: thumbBottom - 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {[...Array(3)].map((_, i) => (
              <div 
                key={i} 
                className="w-0.5 h-2 rounded-full transition-colors duration-300" 
                style={{ backgroundColor: isActive ? hex : '#52525b' }}
              />
            ))}
          </motion.div>
        </div>

        <button 
          onPointerDown={() => onChange(Math.max(min, Number((value - step).toFixed(1))))}
          className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white active:scale-90 active:border-zinc-600 transition-all shadow-md"
        >
          <Minus size={14} />
        </button>
      </div>
    </div>
  );
};
