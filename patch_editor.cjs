const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Find the editor view code to extract
const editorStartMarker = "          {/* EDITOR VIEW */}\n          {view === 'editor' && (\n            <motion.div";
const editorContentStartMarker = 'className="flex-1 p-4 md:p-6 flex flex-col overflow-hidden bg-zinc-950"\n            >';
const editorContentEndMarker = '            </motion.div>\n          )}\n\n          {/* STUDY VIEW */}';

const startIndex = code.indexOf(editorStartMarker);
const contentStartIndex = code.indexOf(editorContentStartMarker, startIndex) + editorContentStartMarker.length;
const endIndex = code.indexOf(editorContentEndMarker, contentStartIndex);

if (startIndex === -1 || contentStartIndex === -1 || endIndex === -1) {
    console.error("Markers not found");
    process.exit(1);
}

const editorContent = code.substring(contentStartIndex, endIndex).trim();

// 2. Create the renderEditor function
const renderEditorFn = `
  const openEditor = () => {
    if (isWideLayout) {
      if (view !== 'study') setView('study');
      setRightView('scriptEditor');
    } else {
      setView('editor');
    }
  };

  const renderEditor = () => (
    <div className="flex-1 w-full flex flex-col space-y-4 overflow-hidden overflow-y-auto min-h-0">
` + editorContent.replace(/<div className="w-full max-w-7xl mx-auto/g, '<div className="w-full mx-auto') + `
    </div>
  );
`;

// 3. Inject renderEditorFn right before "return (" 
const returnIndex = code.indexOf('  return (\n    <div className="h-screen');
if (returnIndex === -1) {
    console.error("Return not found");
    process.exit(1);
}
code = code.substring(0, returnIndex) + renderEditorFn + "\n" + code.substring(returnIndex);


// 4. Update view === 'editor' implementation
const updatedEditorView = `          {/* EDITOR VIEW */}
          {view === 'editor' && !isWideLayout && (
            <motion.div 
              key="editor"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="flex-1 flex flex-col overflow-hidden bg-zinc-950 p-4 md:p-6"
            >
              {renderEditor()}
            </motion.div>
          )}`;

const oldEditorFullStart = code.lastIndexOf("          {/* EDITOR VIEW */}", code.indexOf('          {/* STUDY VIEW */}'));
const oldEditorFullEnd = code.indexOf('          {/* STUDY VIEW */}');
code = code.substring(0, oldEditorFullStart) + updatedEditorView + "\n\n" + code.substring(oldEditorFullEnd);


// 5. Replace rightView === 'scriptEditor' code
// We must find ")" before rightView === 'scriptEditor' ? (
const rightScriptEditorStartMarker = ") : rightView === 'scriptEditor' ? (";
const rightScriptEditorEndMarker = "                  ) : (\n                    <div className=\"p-4 h-full overflow-y-auto\">";

const rseStartIndex = code.indexOf(rightScriptEditorStartMarker);
const rseEndIndex = code.indexOf(rightScriptEditorEndMarker, rseStartIndex);

if (rseStartIndex === -1 || rseEndIndex === -1) {
    console.error("Right view script editor not found");
    process.exit(1);
}

const newRightScriptEditor = `) : rightView === 'scriptEditor' ? (
                    <div className="p-4 h-full flex flex-col overflow-hidden min-h-0">
                      {renderEditor()}
                    </div>
`;

code = code.substring(0, rseStartIndex) + newRightScriptEditor + code.substring(rseEndIndex);

// 6. Replace setView('editor') with openEditor()
code = code.replace(/setView\('editor'\)/g, "openEditor()");

fs.writeFileSync('src/App.tsx', code);
console.log("Success");
