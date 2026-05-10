const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Script Editor Textarea Size & Font
const textAreaclassMatch = /className="flex-1 w-full bg-transparent p-6 md:p-10 text-base md:text-lg focus:outline-none resize-none font-mono leading-relaxed text-zinc-300 hide-scrollbar"/g;
const newTextAreaClass = 'className="flex-1 w-full bg-transparent p-4 md:p-6 text-sm focus:outline-none resize-none font-sans leading-normal text-zinc-300 hide-scrollbar"';
code = code.replace(textAreaclassMatch, newTextAreaClass);

// 2. Export Button next to Save
const saveButtonMatch = /<button \n                          onClick=\{saveProject\}\n                          className="bg-yellow-500 hover:bg-yellow-400 px-5 py-2 rounded-xl text-\[10px\] font-black uppercase tracking-widest transition-all text-black shadow-lg shadow-yellow-500\/10 active:scale-95"\n                        >\n                          Save\n                        <\/button>/g;
const exportSaveButtons = `<button 
                          onClick={() => {
                            if (currentProject) exportProject(currentProject);
                            else alert("저장 후 내보낼 수 있습니다.");
                          }}
                          className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all text-zinc-300 border border-zinc-700 active:scale-95"
                        >
                          Export
                        </button>
                        <button 
                          onClick={saveProject}
                          className="bg-yellow-500 hover:bg-yellow-400 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-black shadow-lg shadow-yellow-500/10 active:scale-95"
                        >
                          Save
                        </button>`;
code = code.replace(saveButtonMatch, exportSaveButtons);

// 3. Korean Subtitle (translation) -> text-yellow-400
// showKo rendering:
code = code.replace(/text-sm md:text-base text-zinc-400 font-medium leading-relaxed italic text-center/g, 'text-sm md:text-base text-yellow-400 font-medium leading-relaxed italic text-center');
code = code.replace(/text-lg md:text-xl text-zinc-400 font-medium leading-relaxed/g, 'text-lg md:text-xl text-yellow-400 font-medium leading-relaxed');

// 4. Grammar subtitle -> remove italic, make it regular normal style
code = code.replace(/text-\[14px\] md:text-\[16px\] text-zinc-300 font-medium leading-relaxed px-1 py-1 italic/g, 'text-[14px] md:text-[16px] text-zinc-300 font-medium leading-relaxed px-1 py-1');

// Just in case there are other variations
code = code.replace(/<p className="text-sm md:text-base text-zinc-400 font-medium leading-relaxed italic text-center">/g, '<p className="text-sm md:text-base text-yellow-400 font-medium leading-relaxed italic text-center">');
code = code.replace(/<p className="text-lg md:text-xl text-zinc-400 font-medium leading-relaxed">/g, '<p className="text-lg md:text-xl text-yellow-400 font-medium leading-relaxed">');
code = code.replace(/<div className="text-\[14px\] md:text-\[16px\] text-zinc-300 font-medium leading-relaxed px-1 py-1 italic">/g, '<div className="text-[14px] md:text-[16px] text-zinc-300 font-medium leading-relaxed px-1 py-1">');


fs.writeFileSync('src/App.tsx', code);
