const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Remove the subtitle
const subtitleText = '<p className="text-[11px] text-zinc-500 mt-1">\n                              선택 단어/문장을 바로 질문할 수 있는 우측 기본 패널\n                            </p>';

if (code.includes(subtitleText)) {
    code = code.replace(subtitleText, '');
} else {
    // try formatting insensitive
    code = code.replace(/<p className="text-\[11px\] text-zinc-500 mt-1">\s*선택 단어\/문장을 바로 질문할 수 있는 우측 기본 패널\s*<\/p>/g, '');
}

fs.writeFileSync('src/App.tsx', code);
console.log("Subtitle patch done.");
