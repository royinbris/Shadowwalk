const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  'const [isSubtitleOnly, setIsSubtitleOnly] = useState(false);',
  'const [isSubtitleOnly, setIsSubtitleOnly] = useState(false);\n  const [isVideoOnly, setIsVideoOnly] = useState(false);'
);

// We need to update the reset settings to reset isVideoOnly too
code = code.replace(
  'setIsSubtitleOnly(false);\n                              playerRef.current?.setPlaybackRate(1.0);',
  'setIsSubtitleOnly(false);\n                              setIsVideoOnly(false);\n                              playerRef.current?.setPlaybackRate(1.0);'
);

code = code.replace(
  'setIsSubtitleOnly(false);\n                                playerRef.current?.setPlaybackRate(1.0);',
  'setIsSubtitleOnly(false);\n                                setIsVideoOnly(false);\n                                playerRef.current?.setPlaybackRate(1.0);'
);

// We need to find the "자막전용" button and insert "영상전용" before or after it
const buttonRegex = /<button[\s\S]*?className=\{`py-2\.5 rounded-xl flex flex-col items-center justify-center gap-0\.5 border transition-all \$\{isSubtitleOnly \? 'bg-\[#00e5ff\]\/10 border-\[#00e5ff\] text-\[#00e5ff\]' : 'bg-black\/40 border-zinc-800 text-zinc-300'\}`\}[\s\S]*?>[\s\S]*?<span className="text-\[11px\] font-black uppercase tracking-tighter text-center">자막전용<\/span>[\s\S]*?<\/button>/g;

let match;
let matches = [];
while ((match = buttonRegex.exec(code)) !== null) {
  matches.push(match[0]);
}

console.log("Found matches: ", matches.length);

if (matches.length > 0) {
  const newButton = `
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
                            </button>
  `;
  
  // Also we need to update the isSubtitleOnly click handler to disable isVideoOnly
  code = code.replaceAll(
    'const nextState = !isSubtitleOnly;\n                                setIsSubtitleOnly(nextState);\n                                if (nextState) {\n                                  setIsPlaying(false);\n                                  playerRef.current?.pauseVideo();\n                                }',
    'const nextState = !isSubtitleOnly;\n                                setIsSubtitleOnly(nextState);\n                                if (nextState) {\n                                  setIsVideoOnly(false);\n                                  setIsPlaying(false);\n                                  playerRef.current?.pauseVideo();\n                                }'
  );

  matches.forEach(m => {
    code = code.replace(m, m + newButton);
  });
}

// And hide the subtitle texts if isVideoOnly
// Around 3357
const target1 = `<AnimatePresence mode="wait">\n                      {transcript.length > 0 ? (`;
const replacement1 = `<AnimatePresence mode="wait">\n                      {isVideoOnly ? (\n                        <motion.div\n                          key="video-only"\n                          initial={{ opacity: 0 }}\n                          animate={{ opacity: 1 }}\n                          exit={{ opacity: 0 }}\n                          className="flex-1 flex items-center justify-center min-h-[150px]"\n                        >\n                          <span className="text-zinc-600 font-bold tracking-widest text-sm uppercase">Video Only Mode</span>\n                        </motion.div>\n                      ) : transcript.length > 0 ? (`;

code = code.replace(target1, replacement1);

// Around 3608
const target2 = `<AnimatePresence mode="wait">\n                      {transcript.length > 0 ? (`;
code = code.replaceAll(target2, replacement1);


fs.writeFileSync('src/App.tsx', code);
console.log("Done");
