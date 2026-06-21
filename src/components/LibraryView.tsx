import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Upload, Plus, Download, FileText, Cloud, LayoutGrid, List } from 'lucide-react';
import { Project } from '../types';
import { ProjectCard } from './ProjectCard';

interface LibraryViewProps {
  projects: Project[];
  currentProject: Project | null;
  loadProject: (project: Project) => void;
  exportProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  handleFileImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleLocalFileSelection: (e: React.ChangeEvent<HTMLInputElement>) => void;
  startNewProject: () => void;
  openEditor: () => void;
}

export const LibraryView = ({
  projects,
  currentProject,
  loadProject,
  exportProject,
  deleteProject,
  handleFileImport,
  handleLocalFileSelection,
  startNewProject,
  openEditor
}: LibraryViewProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(
    () => (localStorage.getItem('library_view_mode') as 'grid' | 'list') || 'grid'
  );

  const toggleViewMode = () => {
    setViewMode((prev) => {
      const next = prev === 'grid' ? 'list' : 'grid';
      localStorage.setItem('library_view_mode', next);
      return next;
    });
  };

  return (
    <motion.div 
      key="library"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex-1 p-6 overflow-y-auto"
    >
      <div className="w-full space-y-4">
        <div className="border-b border-zinc-800 pb-4">
          <h2 className="text-lg font-black uppercase italic mb-2">Saved Scripts</h2>
          <div className="flex justify-end items-center gap-2">
            <input 
              type="file"
              accept=".json,application/json"
              ref={fileInputRef}
              onChange={handleFileImport}
              className="hidden"
            />
            <label className="cursor-pointer flex items-center bg-zinc-800 hover:bg-zinc-700 px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all text-zinc-300 gap-1.5 border border-zinc-700">
              <Upload size={14} className="text-yellow-500" />
              음원+TXT
              <input
                type="file"
                multiple
                className="hidden"
                onChange={handleLocalFileSelection}
              />
            </label>
            <button 
              onClick={startNewProject}
              className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all text-zinc-300 border border-zinc-700"
            >
              <Plus className="w-3.5 h-3.5" />
              New
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all text-zinc-300 border border-zinc-700"
            >
              <Cloud className="w-3.5 h-3.5 text-sky-400" />
              불러오기
            </button>
            <button
              onClick={toggleViewMode}
              className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all text-zinc-300 border border-zinc-700"
              title={viewMode === 'grid' ? '리스트 보기' : '박스 보기'}
            >
              {viewMode === 'grid'
                ? <List className="w-3.5 h-3.5 text-sky-400" />
                : <LayoutGrid className="w-3.5 h-3.5 text-sky-400" />}
            </button>
            <span className="text-zinc-500 font-mono text-[10px] self-center ml-1">{projects.length} ITEMS</span>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto">
              <FileText className="w-10 h-10 text-zinc-700" />
            </div>
            <p className="text-zinc-500">No scripts yet. Create one to start shadowing.</p>
            <button 
              onClick={() => openEditor()}
              className="bg-zinc-800 hover:bg-zinc-700 px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all"
            >
              Create First Script
            </button>
          </div>
        ) : (
          <div className={viewMode === 'grid'
            ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4"
            : "flex flex-col gap-2"}>
            {projects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                currentProject={currentProject}
                loadProject={loadProject}
                exportProject={exportProject}
                deleteProject={deleteProject}
                layout={viewMode}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
