const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Remove helperShowKo and helperShowGrammar from state
code = code.replace(/const \[helperShowKo, setHelperShowKo\] = useState\(true\);\n/g, '');
code = code.replace(/const \[helperShowGrammar, setHelperShowGrammar\] = useState\(true\);\n/g, '');

// 2. Replace helperShowKo with showKo in text rendering
code = code.replace(/\{helperShowKo &&/g, '{showKo &&');
code = code.replace(/\{helperShowGrammar &&/g, '{showGrammar &&');

// 3. Make the English sentence rendering in Gemini mode gated by showEn
// Find "{transcript[currentIndex].text.split(' ').map((word, i) => {" in the code
code = code.replace(
  /\{transcript\[currentIndex\]\.text\.split/g,
  '{showEn && transcript[currentIndex].text.split'
);

// 4. In the Left Panel Learning View Title Bar:
// Find `<div className="flex bg-zinc-800 rounded-lg p-0.5 gap-1.5 mr-1">`
// add the copy buttons right after it
const subtitleTogglesEnd = `                          <button \n                            onClick={() => setShowGrammar(!showGrammar)}\n                            className={\`px-1.5 py-1 rounded-md text-[10px] font-bold uppercase transition-all \${showGrammar ? 'bg-zinc-700 text-yellow-500' : 'text-zinc-500 hover:text-zinc-300'}\`}\n                          >\n                            문법\n                          </button>\n                        </div>`;

const copyButtonsHTML = `
                        <div className="w-[1px] h-3 bg-zinc-700 mx-1"></div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            const text = transcript[currentIndex]?.text;
                            if (text) {
                              navigator.clipboard.writeText(text);
                              showCopyFeedback("영어 문장 복사됨");
                            }
                          }}
                          className="px-2 py-1 rounded-md text-[10px] font-bold uppercase border bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white"
                        >
                          EN
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (selectedWords.length > 0) {
                              navigator.clipboard.writeText(selectedWords.join(' '));
                              showCopyFeedback("선택된 단어 복사됨");
                            }
                          }}
                          className={\`px-2 py-1 rounded-md text-[10px] font-bold uppercase border transition-all \${
                            selectedWords.length > 0 
                              ? 'bg-purple-900/30 border-purple-500 text-purple-400 hover:text-white' 
                              : 'bg-zinc-900 border-zinc-800 text-zinc-500 cursor-not-allowed opacity-70'
                          }\`}
                        >
                          Selected
                        </button>`;

if(code.indexOf(subtitleTogglesEnd) !== -1) {
  code = code.replace(subtitleTogglesEnd, subtitleTogglesEnd + copyButtonsHTML);
} else {
  console.error("Subtitle toggles end not found");
}


// 5. Remove KO, GRM, EN, Selected from Gemini Title Context (Lines 3020-3100)
// For !isSplitStudy popup
const popupGeminiButtonsRegex = /<div className="flex bg-zinc-950\/50 rounded-lg p-0\.5 border border-zinc-800 mr-0\.5 gap-0\.5">[\s\S]*?Selected\s*<\/button>/;
if (popupGeminiButtonsRegex.test(code)) {
    code = code.replace(popupGeminiButtonsRegex, '');
} else {
    console.error("Popup gemini buttons not found");
}

// 6. Remove KO, Grammar, EN, Selected from rightView === 'assistant'
const rightPanelGeminiButtonsRegex = /<button\s*onClick=\{[^}]*setHelperShowKo[\s\S]*?Selected\s*<\/button>/;
if (rightPanelGeminiButtonsRegex.test(code)) {
    code = code.replace(rightPanelGeminiButtonsRegex, '');
} else {
    console.error("Right panel gemini buttons not found");
}

fs.writeFileSync('src/App.tsx', code);
console.log("Success");
