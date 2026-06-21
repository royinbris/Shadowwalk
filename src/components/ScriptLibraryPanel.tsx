import React, { useRef } from 'react';
import { Upload, Plus, Download, FileText } from 'lucide-react';
import { Project } from '../types';
import { ProjectCard } from './ProjectCard';

interface ScriptLibraryPanelProps {
  projects: Project[];
  currentProject: Project | null;
  loadProject: (project: Project) => void;
  exportProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  handleFileImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleLocalFileSelection: (e: React.ChangeEvent<HTMLInputElement>) => void;
  startNewProject: () => void;
}

export const ScriptLibraryPanel = ({
  projects,
  currentProject,
  loadProject,
  exportProject,
  deleteProject,
  handleFileImport,
  handleLocalFileSelection,
  startNewProject
}: ScriptLibraryPanelProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="p-4 space-y-4 h-full overflow-y-auto">
      <div className="border-b border-zinc-800 pb-4">
        <h3 className="text-base font-black uppercase italic mb-2">Saved Scripts</h3>

        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="file"
            accept=".json,application/json"
            ref={fileInputRef}
            onChange={handleFileImport}
            className="hidden"
          />

          {/*
          <label className="cursor-pointer flex items-center bg-zinc-800 hover:bg-zinc-700 px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all text-zinc-400 gap-2 border border-zinc-700">
            <Upload size={12} className="text-yellow-500" />
            Local MP4+JSON
            <input
              type="file"
              accept=".mp4,.json"
              multiple
              className="hidden"
              onChange={handleLocalFileSelection}
            />
          </label>
          */}

          <button
            onClick={startNewProject}
            className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all text-zinc-400 border border-zinc-700"
          >
            <Plus className="w-3 h-3" />
            New
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all text-zinc-400 border border-zinc-700"
          >
            <Download className="w-3 h-3" />
            불러오기
          </button>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="py-16 text-center space-y-4">
          <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto">
            <FileText className="w-8 h-8 text-zinc-600" />
          </div>
          <p className="text-zinc-500 text-sm">
            No scripts yet. Create one to start shadowing.
          </p>
        </div>
      ) : (
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 140px), 1fr))' }}>
          {projects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              currentProject={currentProject}
              loadProject={loadProject}
              exportProject={exportProject}
              deleteProject={deleteProject}
            />
          ))}
        </div>
      )}
    </div>
  );
};
