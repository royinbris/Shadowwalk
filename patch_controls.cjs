const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const controlsStartMarker = "              {/* Large Controls (Walking-First) - Fixed at bottom when sync controls or recording panel are shown */}";
const controlsEndMarker = "              </AnimatePresence>";

const startIndex = code.indexOf(controlsStartMarker);
let endIndex = code.indexOf(controlsEndMarker, startIndex);
// Find the SECOND AnimatePresence closing tag since there's one inside for RECORDING PANEL OVERLAY
endIndex = code.indexOf(controlsEndMarker, endIndex + controlsEndMarker.length);
endIndex += controlsEndMarker.length;

if (startIndex === -1 || endIndex === -1) {
    console.error("Controls block not found");
    process.exit(1);
}

const controlsBlock = code.substring(startIndex, endIndex);

// 1. Create renderLargeControls function
const renderLargeControlsFn = `
  const renderLargeControls = () => (
    <>
` + controlsBlock.replace(/                /g, '      ') + `
    </>
  );
`;

// Insert it right before the return statement
const returnIndex = code.indexOf('  return (\n    <div className="h-screen');
if(returnIndex === -1) {
    console.error("Return statement not found");
    process.exit(1);
}
code = code.substring(0, returnIndex) + renderLargeControlsFn + '\n' + code.substring(returnIndex);

// 2. Replace the original block with !isSplitStudy condition
code = code.replace(controlsBlock, '              {!isSplitStudy && renderLargeControls()}');

// 3. Add to \`<aside className="... relative">\`
code = code.replace(
    'className="bg-zinc-950 flex flex-col overflow-hidden min-w-0"',
    'className="bg-zinc-950 flex flex-col overflow-hidden min-w-0 relative"'
);

// 4. Update flex-1 overflow-y-auto in \`<aside>\` to have padding
code = code.replace(
    '<div className="flex-1 overflow-y-auto">',
    '<div className={`flex-1 overflow-y-auto ${isSplitStudy && (showSyncControls || showRecordingPanel) ? \\\'pb-[260px]\\\' : \\\'\\\'}`}>'
);

// 5. Update main left panel pb-48
code = code.replace(
    'className={`flex-1 flex flex-row min-h-0 ${(showSyncControls || showRecordingPanel) ? \\\'pb-48\\\' : \\\'\\\'}`}',
    'className={`flex-1 flex flex-row min-h-0 ${(!isSplitStudy && (showSyncControls || showRecordingPanel)) ? \\\'pb-48\\\' : \\\'\\\'}`}'
);

// 6. Insert \`{isSplitStudy && renderLargeControls()}\` at the end of \`<aside>\`
const asideEndMarker = "              </aside>";
const asideEndIndex = code.indexOf(asideEndMarker);
if (asideEndIndex === -1) {
    console.error("Aside end not found");
    process.exit(1);
}
code = code.substring(0, asideEndIndex) + '                {isSplitStudy && renderLargeControls()}\\n' + code.substring(asideEndIndex);

fs.writeFileSync('src/App.tsx', code);
console.log("Success");
