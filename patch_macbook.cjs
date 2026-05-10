const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Delete <- BACK TO STUDY in title bar in wide layout
const btnFindStr = `          {!isSplitStudy && (
            <button 
              onClick={handleScriptsClick}
              className={\`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight transition-all shrink-0 border \${
                view === 'library' 
                  ? 'bg-yellow-500 text-black border-yellow-400' 
                  : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-zinc-200'
              }\`}
            >
              {view === 'library' ? '← Back to study' : 'Scripts'}
            </button>
          )}`;

const btnReplaceStr = `          {!isWideLayout && (view !== 'library' || !!currentProject) && (
            <button 
              onClick={handleScriptsClick}
              className={\`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight transition-all shrink-0 border \${
                view === 'library' 
                  ? 'bg-yellow-500 text-black border-yellow-400' 
                  : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-zinc-200'
              }\`}
            >
              {view === 'library' ? '← Back to study' : 'Scripts'}
            </button>
          )}`;

code = code.replace(btnFindStr, btnReplaceStr);

// 2. Remove max width in library view
const maxWFindStr = `<div className="max-w-4xl mx-auto space-y-4">`;
const maxWReplaceStr = `<div className="w-full space-y-4">`;
code = code.replace(maxWFindStr, maxWReplaceStr);

// 3. 4-column layout for library view
const libraryGridRegex = /\{projects\.length === 0 \? \([\s\S]*?<\/div>\s*\)\s*:\s*\(\s*<div className="grid grid-cols-\[repeat\(auto-fill,minmax\(min\(100%,320px\),1fr\)\)\] gap-3">/;
const libraryGridMatch = code.match(libraryGridRegex);

if (libraryGridMatch) {
  const libReplaced = libraryGridMatch[0].replace(
    `<div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,320px),1fr))] gap-3">`,
    `<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 gap-4">`
  );
  code = code.replace(libraryGridMatch[0], libReplaced);
} else {
  console.log("Could not find library grid regex match!");
}

// 4. For the right panel, use auto-fill minmax(280px, 1fr) for perfect fluidity according to user specs
code = code.replace(
  /<div className="grid grid-cols-\[repeat\(auto-fill,minmax\(min\(100%,320px\),1fr\)\)\] gap-3">/g,
  '<div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3">'
);

fs.writeFileSync('src/App.tsx', code);
console.log("Done");
