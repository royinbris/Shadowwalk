const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// The marker we want to replace starts after `</AnimatePresence>` for the setup settings.
const inputAreaRegex = /<textarea\s+value=\{geminiQuery\}[\s\S]*?Copy\s+<\/button>\s*<\/div>/;

const newLayout = `<div className="flex gap-2 items-end">
                            <button
                              onClick={() => setGeminiQuery(transcript[currentIndex]?.text || '')}
                              title="Use Current Sentence"
                              className="w-[42px] h-[42px] flex-none bg-zinc-800 text-zinc-300 hover:text-white rounded-xl transition-all active:scale-95 flex items-center justify-center border border-zinc-700"
                            >
                              <FileText size={18} />
                            </button>

                            <textarea
                              value={geminiQuery}
                              onChange={(e) => setGeminiQuery(e.target.value)}
                              placeholder="질문이나 검색할 단어 입력..."
                              className="flex-1 h-[42px] min-h-[42px] py-3 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-yellow-500/50 resize-none overflow-hidden"
                            />

                            <button
                              onClick={() => askGemini()}
                              disabled={isGeminiLoading || (!geminiQuery.trim() && selectedWords.length === 0)}
                              title="Ask Gemini"
                              className="w-[42px] h-[42px] flex-none bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl transition-all active:scale-95 flex items-center justify-center shadow-lg disabled:opacity-50"
                            >
                              <Search size={18} />
                            </button>
                          </div>`;

if(inputAreaRegex.test(code)) {
    code = code.replace(inputAreaRegex, newLayout);
    console.log("Input area replaced.");
} else {
    console.error("Input area not found.");
}

fs.writeFileSync('src/App.tsx', code);
