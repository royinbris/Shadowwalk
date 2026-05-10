const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  '{/* Progress Indicator */}\n              {transcript.length > 0 && (',
  '{/* Progress Indicator */}\n              {transcript.length > 0 && !isVideoOnly && ('
);

fs.writeFileSync('src/App.tsx', code);
console.log("Done");
