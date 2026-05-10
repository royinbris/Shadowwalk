const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `<div className="mt-3 flex items-center justify-between">
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
        </div>`;

const repl = `<div className="mt-3 flex flex-wrap items-center justify-between gap-1.5 min-w-0">
          <div className="flex items-center gap-1.5 shrink min-w-0">
            {currentProject?.id === project.id && (
              <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] shrink-0" />
            )}
            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest bg-zinc-900/50 px-1.5 py-0.5 rounded border border-zinc-800/50 truncate min-w-[50px]">
              {new Date(project.createdAt).toLocaleDateString()}
            </span>
          </div>
          
          <div className="flex items-center gap-1 relative z-10 shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); exportProject(project); }}
              className="flex items-center gap-0.5 px-2 py-1 bg-zinc-800 hover:bg-yellow-500 hover:text-black text-yellow-500 rounded-md transition-all border border-yellow-500/20 text-[10px] uppercase font-bold shrink-0"
              title="Export to File"
            >
              EXPORT
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); deleteProject(project.id); }}
              className="p-1 bg-zinc-800 hover:bg-red-500 text-zinc-400 hover:text-white rounded-md transition-all border border-zinc-700 hover:border-red-400 shrink-0"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>`;

code = code.replaceAll(target, repl);
fs.writeFileSync('src/App.tsx', code);
console.log("Replaced successfully.");
