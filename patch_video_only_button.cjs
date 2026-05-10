const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `<span className="text-[11px] font-black uppercase tracking-tighter text-center">자막전용</span>
                            </button>`;

const newButton = `<span className="text-[11px] font-black uppercase tracking-tighter text-center">자막전용</span>
                            </button>

                            <button 
                              onClick={() => {
                                const nextState = !isVideoOnly;
                                setIsVideoOnly(nextState);
                                if (nextState && isSubtitleOnly) {
                                  setIsSubtitleOnly(false);
                                }
                              }}
                              className={\`py-2.5 rounded-xl flex flex-col items-center justify-center gap-0.5 border transition-all \${isVideoOnly ? 'bg-[#ff00ff]/10 border-[#ff00ff] text-[#ff00ff]' : 'bg-black/40 border-zinc-800 text-zinc-300'}\`}
                            >
                              <span className="text-[11px] font-black uppercase tracking-tighter text-center">영상전용</span>
                            </button>`;

code = code.replaceAll(targetStr, newButton);

fs.writeFileSync('src/App.tsx', code);
console.log("Done");
