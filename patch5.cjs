const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Move the copy buttons
const targetStr1 = `                        <button 
                          onClick={() => setIsEditingPrompt(true)}
                          className="bg-zinc-900 hover:bg-zinc-800 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all text-zinc-300 border border-zinc-800 flex items-center gap-2 active:scale-95"
                        >
                          <Settings size={12} />
                          프롬프트 수정
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <button 
                          onClick={() => setUnifiedInput('')}
                          className="bg-zinc-900/50 hover:bg-red-950/30 px-3 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all text-red-500 border border-red-500/10 active:scale-95"
                        >
                          Clear
                        </button>
                        <div className="flex bg-zinc-950/50 rounded-xl p-0.5 border border-zinc-800">`;

const replacement1 = `                        <button 
                          onClick={() => setIsEditingPrompt(true)}
                          className="bg-zinc-900 hover:bg-zinc-800 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all text-zinc-300 border border-zinc-800 flex items-center gap-2 active:scale-95"
                        >
                          <Settings size={12} />
                          프롬프트 수정
                        </button>
                        
                        <div className="flex bg-zinc-950/50 rounded-xl p-0.5 border border-zinc-800">`;

code = code.replace(targetStr1, replacement1);

const targetStr2 = `                            Title
                          </button>
                        </div>
                      </div>
                    </div>`;

const replacement2 = `                            Title
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button 
                          onClick={() => setUnifiedInput('')}
                          className="bg-zinc-900/50 hover:bg-red-950/30 px-3 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all text-red-500 border border-red-500/10 active:scale-95"
                        >
                          Clear
                        </button>
                      </div>
                    </div>`;

code = code.replace(targetStr2, replacement2);

// Make the first row flex-wrap just in case
code = code.replace(
  '<div className="flex gap-2">',
  '<div className="flex flex-wrap gap-2">'
); // Replace the first match of flex gap-2 inside that block... wait, better be specific

code = code.replace(
  '<div className="flex flex-wrap items-center justify-between gap-3">\n                      <div className="flex gap-2">',
  '<div className="flex flex-wrap items-center justify-between gap-3">\n                      <div className="flex flex-wrap gap-2 items-center">'
);

// 2. Change absolute to fixed bottom for mobile
const targetStr3 = `transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute bottom-0 left-0 right-0 z-50 p-1 bg-zinc-900/95 backdrop-blur-2xl border-t border-zinc-800 pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
          >
          <div className="w-full max-w-2xl mx-auto relative h-[216px]">`;

const replacement3 = `transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={\`\${isSplitStudy ? 'absolute' : 'fixed'} bottom-0 left-0 right-0 z-50 p-1 bg-zinc-900/95 backdrop-blur-2xl border-t border-zinc-800 pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]\`}
          >
          <div className="w-full max-w-2xl mx-auto relative h-[216px]">`;

code = code.replace(targetStr3, replacement3);

// We need to add pb-padding to the main container when fixed is shown so we can scroll to the bottom. Wait, pb-48 is already added to 'flex-1 flex flex-row min-h-0' in the main view!

fs.writeFileSync('src/App.tsx', code);
console.log("Done");
