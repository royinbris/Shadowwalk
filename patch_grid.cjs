const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Grid layouts
code = code.replace(/className="grid grid-cols-2 gap-2"/g, 'className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"');
code = code.replace(/<div className="space-y-2">\s*\{projects\.map\(\(project\)/g, '<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">\n                          {projects.map((project)');

// 2. Line clamps
code = code.replace(/line-clamp-2/g, 'line-clamp-3');
code = code.replace(/<div className="text-sm font-bold text-white truncate">/g, '<div className="text-sm font-bold text-white mb-2 line-clamp-3 leading-tight break-keep">');

// 3. Main view styling replacements
code = code.replace(/<div className="mt-2 pt-2 border-t border-zinc-800\/50 flex justify-between items-center">/g, '<div className="mt-4 flex justify-between items-center">');
code = code.replace(/<Upload className="w-3 h-3" \/>\s*<span className="text-\[10px\] font-medium uppercase origin-left transform scale-\[0\.5\] -mr-6 whitespace-nowrap">Outport<\/span>/g, '<span className="text-[10px] font-bold uppercase tracking-wider px-1">EXPORT</span>');

// 4. Side view styling replacements
const rightPanelLoadExportMatches = /<div className="mt-3 flex items-center gap-2">\s*<button\s*onClick=\{\(\) => loadProject\(project\)\}\s*className="px-2 py-1 rounded-md text-\[10px\] font-bold uppercase border bg-zinc-800 text-zinc-300 border-zinc-700 hover:text-white"\s*>\s*Load\s*<\/button>\s*<button\s*onClick=\{\(\) => exportProject\(project\)\}\s*className="px-2 py-1 rounded-md text-\[10px\] font-bold uppercase border bg-zinc-800 text-zinc-300 border-zinc-700 hover:text-white"\s*>\s*Export\s*<\/button>/g;

const rightPanelNewLoadExport = `<div className="mt-3 flex items-center justify-between">
                                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest bg-zinc-900/50 px-1.5 py-0.5 rounded border border-zinc-800/50">
                                  {new Date(project.createdAt).toLocaleDateString()}
                                </span>
                                <button
                                  onClick={(e) => { e.stopPropagation(); exportProject(project); }}
                                  className="flex items-center gap-0.5 px-2 py-1 bg-zinc-800 hover:bg-yellow-500 hover:text-black text-yellow-500 rounded-md transition-all border border-yellow-500/20 text-[10px] uppercase font-bold"
                                  title="Export to File"
                                >
                                  EXPORT
                                </button>`;

code = code.replace(rightPanelLoadExportMatches, rightPanelNewLoadExport);

// 5. Font size increase for script editor (text-sm -> text-base or text-lg if requested 1 step higher, let's use text-base)
code = code.replace(/className="flex-1 w-full bg-transparent p-4 md:p-6 text-sm focus:outline-none resize-none font-sans leading-normal text-zinc-300 hide-scrollbar"/g, 'className="flex-1 w-full bg-transparent p-4 md:p-6 text-base focus:outline-none resize-none font-sans leading-relaxed text-zinc-300 hide-scrollbar"');

fs.writeFileSync('src/App.tsx', code);
