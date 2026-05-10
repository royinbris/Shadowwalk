const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. STANDARD MODE
const standardRegex = /\{showKo && transcript\[currentIndex\]\.translation && \(\s*<p className="text-lg md:text-xl text-yellow-400 font-medium leading-relaxed">\s*\{transcript\[currentIndex\]\.translation\}\s*<\/p>\s*\)\}\s*\{showGrammar && transcript\[currentIndex\]\.grammar && \(\s*<p className="text-base md:text-lg text-zinc-300 font-medium leading-relaxed bg-zinc-800\/90 px-4 py-3 rounded-2xl mt-3">\s*\{transcript\[currentIndex\]\.grammar\}\s*<\/p>\s*\)\}/;

const standardReplacement = `{(() => {
                              const krFontSizeClassesKo: Record<number, string> = {
                                1: 'text-sm md:text-base',
                                2: 'text-base md:text-lg',
                                3: 'text-lg md:text-xl',
                                4: 'text-xl md:text-2xl',
                                5: 'text-2xl md:text-3xl', 
                                6: 'text-3xl md:text-4xl',
                                7: 'text-4xl md:text-5xl'
                              };
                              const krFontSizeClassesGr: Record<number, string> = {
                                1: 'text-xs md:text-sm',
                                2: 'text-sm md:text-base',
                                3: 'text-base md:text-lg',
                                4: 'text-lg md:text-xl',
                                5: 'text-xl md:text-2xl', 
                                6: 'text-2xl md:text-3xl',
                                7: 'text-3xl md:text-4xl'
                              };
                              const currentClassKo = krFontSizeClassesKo[krFontSize] || 'text-lg md:text-xl';
                              const currentClassGr = krFontSizeClassesGr[krFontSize] || 'text-base md:text-lg';

                              return (
                                <>
                                  {showKo && transcript[currentIndex].translation && (
                                    <p className={\`\${currentClassKo} text-yellow-400 font-medium leading-relaxed\`}>
                                      {transcript[currentIndex].translation}
                                    </p>
                                  )}
                                  {showGrammar && transcript[currentIndex].grammar && (
                                    <p className={\`\${currentClassGr} text-zinc-300 font-medium leading-relaxed bg-zinc-800/90 px-4 py-3 rounded-2xl mt-3\`}>
                                      {transcript[currentIndex].grammar}
                                    </p>
                                  )}
                                </>
                              );
                            })()}`;

code = code.replace(standardRegex, standardReplacement);

// 2. SPLIT MODE
const splitRegex = /\{showKo && transcript\[currentIndex\]\.translation && \(\s*<p className="text-sm md:text-base text-yellow-400 font-medium leading-relaxed italic text-center">\s*\{transcript\[currentIndex\]\.translation\}\s*<\/p>\s*\)\}\s*\{showGrammar && transcript\[currentIndex\]\.grammar && \(\s*<div className="text-\[14px\] md:text-\[16px\] text-zinc-300 font-medium leading-relaxed px-1 py-1">\s*\{transcript\[currentIndex\]\.grammar\}\s*<\/div>\s*\)\}/;

const splitReplacement = `{(() => {
                              const splitKoSize: Record<number, string> = {
                                1: 'text-xs',
                                2: 'text-xs md:text-sm',
                                3: 'text-sm md:text-base',
                                4: 'text-base md:text-lg',
                                5: 'text-lg md:text-xl',
                                6: 'text-xl md:text-2xl',
                                7: 'text-2xl md:text-3xl'
                              };
                              const currentClassKo = splitKoSize[krFontSize] || 'text-sm md:text-base';
                              const currentClassGr = splitKoSize[krFontSize] || 'text-[14px] md:text-[16px]';

                              return (
                                <>
                                  {showKo && transcript[currentIndex].translation && (
                                    <p className={\`\${currentClassKo} text-yellow-400 font-medium leading-relaxed italic text-center\`}>
                                      {transcript[currentIndex].translation}
                                    </p>
                                  )}
                                  {showGrammar && transcript[currentIndex].grammar && (
                                    <div className={\`\${currentClassGr} text-zinc-300 font-medium leading-relaxed px-1 py-1\`}>
                                      {transcript[currentIndex].grammar}
                                    </div>
                                  )}
                                </>
                              );
                            })()}`;

code = code.replace(splitRegex, splitReplacement);

fs.writeFileSync('src/App.tsx', code);
console.log("Replaced Korean/Grammar subtitles successfully.");
