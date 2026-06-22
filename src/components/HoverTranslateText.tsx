import React, { useState, useRef } from 'react';

interface HoverTranslateTextProps {
  text: string;
  className?: string;
}

export const HoverTranslateText: React.FC<HoverTranslateTextProps> = ({ text, className }) => {
  const [hoveredWord, setHoveredWord] = useState<string | null>(null);
  const [translation, setTranslation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (word: string, e: React.MouseEvent) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const cleanWord = word.replace(/[^a-zA-Z0-9'-]/g, '');
    if (!cleanWord) return;

    setPosition({ top: rect.top - 10, left: rect.left + rect.width / 2 });
    
    if (timerRef.current) clearTimeout(timerRef.current);
    
    timerRef.current = setTimeout(async () => {
      setHoveredWord(cleanWord);
      setIsLoading(true);
      setTranslation(null);
      
      try {
        const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ko&dt=t&q=${encodeURIComponent(cleanWord)}`);
        const data = await res.json();
        if (data && data[0] && data[0][0] && data[0][0][0]) {
          setTranslation(data[0][0][0]);
        } else {
          setTranslation('번역 불가');
        }
      } catch (err) {
        setTranslation('오류 발생');
      } finally {
        setIsLoading(false);
      }
    }, 400); // 400ms delay for snappier feel
  };

  const handleMouseLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setHoveredWord(null);
    setTranslation(null);
  };

  const words = text.split(' ');

  return (
    <>
      <p className={className}>
        {words.map((word, i) => (
          <React.Fragment key={i}>
            <span 
              className="hover:text-yellow-300 transition-colors cursor-help inline-block"
              onMouseEnter={(e) => handleMouseEnter(word, e)}
              onMouseLeave={handleMouseLeave}
            >
              {word}
            </span>
            {i < words.length - 1 && ' '}
          </React.Fragment>
        ))}
      </p>

      {hoveredWord && (
        <div 
          className="fixed z-[9999] bg-zinc-900 border border-zinc-700 text-white px-3 py-1.5 rounded-lg shadow-xl text-sm font-bold flex items-center justify-center pointer-events-none transform -translate-x-1/2 -translate-y-full min-w-[60px] min-h-[36px]"
          style={{ top: position.top, left: position.left }}
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-zinc-500 border-t-white rounded-full animate-spin" />
          ) : (
            <span className="text-emerald-400">{translation}</span>
          )}
        </div>
      )}
    </>
  );
};
