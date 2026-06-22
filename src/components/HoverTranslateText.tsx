import React, { useState, useRef } from 'react';

interface HoverTranslateTextProps {
  text: string;
  className?: string;
}

interface DictionaryEntry {
  pos: string;
  terms: string[];
}

export const HoverTranslateText: React.FC<HoverTranslateTextProps> = ({ text, className }) => {
  const [hoveredWord, setHoveredWord] = useState<string | null>(null);
  const [translation, setTranslation] = useState<string | null>(null);
  const [dictionary, setDictionary] = useState<DictionaryEntry[] | null>(null);
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
      setDictionary(null);
      
      try {
        const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ko&dt=t&dt=bd&q=${encodeURIComponent(cleanWord)}`);
        const data = await res.json();
        if (data && data[0] && data[0][0] && data[0][0][0]) {
          setTranslation(data[0][0][0]);
        } else {
          setTranslation('번역 불가');
        }

        if (data && data[1] && Array.isArray(data[1])) {
          const dictEntries = data[1].slice(0, 3).map((item: any) => {
            let posName = item[0];
            if (posName === 'noun') posName = '명사';
            else if (posName === 'verb') posName = '동사';
            else if (posName === 'adjective') posName = '형용사';
            else if (posName === 'adverb') posName = '부사';
            else if (posName === 'pronoun') posName = '대명사';
            else if (posName === 'preposition') posName = '전치사';
            else if (posName === 'conjunction') posName = '접속사';

            return {
              pos: posName,
              terms: Array.isArray(item[1]) ? item[1].slice(0, 5) : []
            };
          });
          setDictionary(dictEntries);
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
    setDictionary(null);
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
          className="fixed z-[9999] bg-zinc-900/95 backdrop-blur-sm border border-zinc-700/80 text-white px-3 py-2 rounded-lg shadow-2xl text-sm flex flex-col pointer-events-none transform -translate-x-1/2 -translate-y-full min-w-[80px]"
          style={{ top: position.top, left: position.left, width: dictionary ? 'max-content' : 'auto', maxWidth: '280px' }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[28px]">
              <div className="w-4 h-4 border-2 border-zinc-500 border-t-white rounded-full animate-spin" />
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <div className="flex items-baseline gap-2">
                <span className="text-zinc-400 font-medium text-xs">{hoveredWord}</span>
                <span className="text-emerald-400 font-bold text-[15px]">{translation}</span>
              </div>
              
              {dictionary && dictionary.length > 0 && (
                <div className="mt-0.5 flex flex-col gap-1 border-t border-zinc-700/60 pt-1.5">
                  {dictionary.map((entry, idx) => (
                    <span key={idx} className="text-zinc-300 text-xs break-keep leading-snug">
                      • {entry.terms.join(', ')}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};
