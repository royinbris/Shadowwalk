const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Remove "선택 단어/문장을..."
code = code.replace(
  /<p className="text-\[11px\] text-zinc-500 mt-1">\n\s*선택 단어\/문장을 바로 질문할 수 있는 우측 기본 패널\n\s*<\/p>/g,
  ''
);

// 2. We need to find the right panel assistant input area
const inputAreaStartMarker = `                          {/* Textarea for detailed typing */}\n                          <textarea \n                            value={geminiQuery}\n                            onChange={(e) => setGeminiQuery(e.target.value)}`;

const oldInputArea = `                          {/* Textarea for detailed typing */}
                          <textarea 
                            value={geminiQuery}
                            onChange={(e) => setGeminiQuery(e.target.value)}
                            placeholder="단어, 구문, 문장을 입력하거나 좌측 자막에서 클릭하세요"
                            className="w-full h-28 rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/40 resize-none"
                          />

                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              onClick={() => askGemini()}
                              disabled={isGeminiLoading || (!geminiQuery.trim() && selectedWords.length === 0)}
                              className="px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-yellow-500 text-black disabled:opacity-50"
                            >
                              Ask Gemini
                            </button>

                            <button
                              onClick={() => setGeminiQuery(transcript[currentIndex]?.text || '')}
                              className="px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-zinc-800 text-zinc-300 border border-zinc-700"
                            >
                              Use Current Sentence
                            </button>

                            <button
                              onClick={() =>
                                navigator.clipboard.writeText(geminiQuery || transcript[currentIndex]?.text || '')
                              }
                              className="px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-zinc-800 text-zinc-300 border border-zinc-700"
                            >
                              Copy
                            </button>
                          </div>`;

// Wait, the input area might have "onKeyDown" or similar. Let's do a precise replacement.
// So let's first locate the exact textarea.
