import React from 'react';
import { X } from 'lucide-react';
import { Project } from '../types';

const GoogleDriveIcon = ({ className = "w-2.5 h-2.5" }) => (
  <svg className={className} viewBox="0 0 144 144" xmlns="http://www.w3.org/2000/svg">
    <path d="M42.4 123.4l-30.4-52.6c-2.4-4.2-2.4-9.4 0-13.6l30.4-52.6c2.4-4.2 6.8-6.8 11.7-6.8h60.8l-40.6 70.3c-2.4 4.2-2.4 9.4 0 13.6l40.6 70.3H54.1c-4.9 0-9.3-2.6-11.7-6.8z" fill="#4285f4"/>
    <path d="M101.6 123.4l-30.4-52.6c-2.4-4.2-6.8-6.8-11.7-6.8L19.1 7.8c4.9-2.8 10.6-2.8 15.5 0h60.8l30.4 52.6c2.4 4.2 2.4 9.4 0 13.6l-40.6 70.3c-4.9 2.8-10.6 2.8-15.5 0z" fill="#0f9d58"/>
    <path d="M101.6 20.6l30.4 52.6c2.4 4.2 2.4 9.4 0 13.6L91.4 139.4c-4.9 2.8-10.6 2.8-15.5 0H15.1L55.7 69.1c2.4-4.2 6.8-6.8 11.7-6.8l30.4-52.6c3.8-6.6 13.6-6.6 17.4 0z" fill="#f4b400"/>
  </svg>
);

interface ProjectCardProps {
  project: Project;
  currentProject: Project | null;
  loadProject: (project: Project) => void;
  exportProject: (project: Project) => void;
  deleteProject: (id: string) => void;
}

export const ProjectCard = ({
  project,
  currentProject,
  loadProject,
  exportProject,
  deleteProject
}: ProjectCardProps) => {
  return (
    <div
      className={`group rounded-xl border p-2 transition-all flex flex-col justify-between cursor-pointer ${
        currentProject?.id === project.id
          ? 'border-yellow-500/70 bg-zinc-900'
          : 'border-zinc-800 bg-zinc-950 hover:bg-zinc-900/70'
      }`}
      onClick={() => loadProject(project)}
    >
      <div>
        <div className="flex items-center justify-between gap-1.5">
          <div className="min-w-0 flex-1 relative pl-2">
            {project.isVideoLocal && (
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.4)] absolute left-0 top-1.5 shrink-0" />
            )}
            <div className="text-sm font-bold text-white mb-1 leading-tight break-words line-clamp-3">
              {project.title}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto flex flex-row items-center justify-between gap-1 w-full pt-0.5">
        <div className="flex items-center gap-1 shrink min-w-0 overflow-hidden">
          {currentProject?.id === project.id && (
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] shrink-0" />
          )}
          <span className="text-[9px] text-white font-bold uppercase tracking-widest bg-zinc-900/50 px-1 py-0.5 rounded border border-zinc-800/50 truncate">
            {new Date(project.createdAt).toLocaleDateString()}
          </span>
        </div>
        
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); exportProject(project); }}
            className="flex items-center gap-1 px-1.5 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded transition-all border border-zinc-700 text-[8px] uppercase font-bold shrink-0"
            title="Export to Google Drive"
          >
            <GoogleDriveIcon />
            DRIVE
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); deleteProject(project.id); }}
            className="p-0.5 bg-zinc-800 hover:bg-red-500 text-zinc-400 hover:text-white rounded transition-all border border-zinc-700 hover:border-red-400 shrink-0"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
