const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "className={`flex-1 flex flex-row min-h-0 ${(showSyncControls || showRecordingPanel) ? 'pb-48' : ''}`}",
  "className={`flex-1 flex flex-row min-h-0 ${(!isSplitStudy && (showSyncControls || showRecordingPanel)) ? 'pb-48' : ''}`}"
);

fs.writeFileSync('src/App.tsx', code);
console.log("Success");
