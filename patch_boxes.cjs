const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const baseGridClass = 'grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3';

code = code.replace(
  '<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">',
  `<div className="${baseGridClass}">`
);
code = code.replace(
  '<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">',
  `<div className="${baseGridClass}">`
);

const newCardTemplate = `
      <div
        key={project.id}
        className={\`group rounded-xl border p-3 transition-all flex flex-col justify-between cursor-pointer \${
          currentProject?.id === project.id
            ? 'border-yellow-500/70 bg-zinc-900'
            : 'border-zinc-800 bg-zinc-950 hover:bg-zinc-900/70'
        }\`}
        onClick={() => loadProject(project)}
      >
        <div>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-white mb-2 line-clamp-3 leading-tight break-keep flex items-start gap-1.5">
                {project.isVideoLocal && (
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.4)] mt-1.5 shrink-0" />
                )}
                {project.title}
              </div>
              <div className="text-[11px] font-mono text-zinc-500 mt-1">
                {project.transcript.length} lines
                {project.isVideoLocal ? ' · local video' : ' · youtube'}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {currentProject?.id === project.id && (
              <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] shrink-0" />
            )}
            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest bg-zinc-900/50 px-1.5 py-0.5 rounded border border-zinc-800/50">
              {new Date(project.createdAt).toLocaleDateString()}
            </span>
          </div>
          
          <div className="flex items-center gap-1 relative z-10">
            <button
              onClick={(e) => { e.stopPropagation(); exportProject(project); }}
              className="flex items-center gap-0.5 px-2 py-1 bg-zinc-800 hover:bg-yellow-500 hover:text-black text-yellow-500 rounded-md transition-all border border-yellow-500/20 text-[10px] uppercase font-bold"
              title="Export to File"
            >
              EXPORT
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); deleteProject(project.id); }}
              className="p-1 bg-zinc-800 hover:bg-red-500 text-zinc-400 hover:text-white rounded-md transition-all border border-zinc-700 hover:border-red-400"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
`.trim();

// Because the layout of cards has slightly different structures, we'll replace the existing .map loops contents with the unified template
// Replacing main view map
const mainMapRegex = /\{projects\.map\(project => \(\s*<div\s*key=\{project\.id\}.*?<\/div>\s*<\/div>\s*\)\)\}/s;
if (mainMapRegex.test(code)) {
  code = code.replace(mainMapRegex, `{projects.map(project => (\n${newCardTemplate}\n))}`);
}

// Replacing right panel map
const rightMapRegex = /\{projects\.map\(\(project\) => \(\s*<div\s*key=\{project\.id\}.*?<\/div>\s*<\/div>\s*\)\)\}/s;
if (rightMapRegex.test(code)) {
  code = code.replace(rightMapRegex, `{projects.map(project => (\n${newCardTemplate}\n))}`);
}

fs.writeFileSync('src/App.tsx', code);
