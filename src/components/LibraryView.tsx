import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { Upload, Plus, Download, FileText, Cloud } from 'lucide-react';
import { Project } from '../types';
import { ProjectCard } from './ProjectCard';

const GoogleDriveIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} viewBox="0 0 144 144" xmlns="http://www.w3.org/2000/svg">
    <path d="M42.4 123.4l-30.4-52.6c-2.4-4.2-2.4-9.4 0-13.6l30.4-52.6c2.4-4.2 6.8-6.8 11.7-6.8h60.8l-40.6 70.3c-2.4 4.2-2.4 9.4 0 13.6l40.6 70.3H54.1c-4.9 0-9.3-2.6-11.7-6.8z" fill="#4285f4"/>
    <path d="M101.6 123.4l-30.4-52.6c-2.4-4.2-6.8-6.8-11.7-6.8L19.1 7.8c4.9-2.8 10.6-2.8 15.5 0h60.8l30.4 52.6c2.4 4.2 2.4 9.4 0 13.6l-40.6 70.3c-4.9 2.8-10.6 2.8-15.5 0z" fill="#0f9d58"/>
    <path d="M101.6 20.6l30.4 52.6c2.4 4.2 2.4 9.4 0 13.6L91.4 139.4c-4.9 2.8-10.6 2.8-15.5 0H15.1L55.7 69.1c2.4-4.2 6.8-6.8 11.7-6.8l30.4-52.6c3.8-6.6 13.6-6.6 17.4 0z" fill="#f4b400"/>
  </svg>
);

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
  onOpenDriveImport: () => void;
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
  openEditor,
  onOpenDriveImport
}: LibraryViewProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

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
              ref={fileInputRef} 
              onChange={handleFileImport} 
              className="hidden" 
              accept=".json"
            />
            {/* 
            <label className="cursor-pointer flex items-center bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all text-zinc-400 gap-2 border border-zinc-700">
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
              iCloud
            </button>
            <button 
              onClick={onOpenDriveImport}
              className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all text-zinc-300 border border-zinc-700"
            >
              <GoogleDriveIcon />
              Drive
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
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
    </motion.div>
  );
};
