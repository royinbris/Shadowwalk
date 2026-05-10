const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "className={`w-full bg-zinc-950 transition-all duration-700 ease-in-out relative flex items-center justify-center overflow-hidden ${videoId && !showGeminiHelper ? 'opacity-100' : 'h-0 opacity-0'}`}",
  "className={`w-full bg-zinc-950 transition-all duration-700 ease-in-out relative flex items-center justify-center overflow-hidden ${videoId && !showGeminiHelper && videoScale > 0 ? 'opacity-100' : 'h-0 opacity-0'}`}"
);

code = code.replace(
  "display: videoId && !showGeminiHelper ? 'flex' : 'none',",
  "display: videoId && !showGeminiHelper && videoScale > 0 ? 'flex' : 'none',"
);

code = code.replace(
  "aspectRatio: videoId && !showGeminiHelper ? `16 / ${9 * (videoScale * 0.2)}` : 'auto'",
  "aspectRatio: videoId && !showGeminiHelper && videoScale > 0 ? `16 / ${9 * (videoScale * 0.2)}` : 'auto'"
);

code = code.replaceAll(
  'min={1}\n                              max={5}\n                              step={1}\n                              color="cyan"\n                              onChange={setVideoScale}',
  'min={0}\n                              max={5}\n                              step={1}\n                              color="cyan"\n                              onChange={setVideoScale}'
);

fs.writeFileSync('src/App.tsx', code);
console.log("Done");
