const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  'const isLastLoop = !isLooping || loopCount >= maxLoops - 1;',
  'const isLastLoop = isVideoOnly || !isLooping || loopCount >= maxLoops - 1;'
);

code = code.replace(
  'const waitTime = (isDelayEnabled && delayDuration > 0) ? delayDuration * 1000 : 0;',
  'const waitTime = (!isVideoOnly && isDelayEnabled && delayDuration > 0) ? delayDuration * 1000 : 0;'
);

code = code.replace(
  'if (isAutoPause) {',
  'if (isAutoPause && !isVideoOnly) {'
);

fs.writeFileSync('src/App.tsx', code);
console.log("Done");
