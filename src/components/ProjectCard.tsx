import React from 'react';
import { X, Download } from 'lucide-react';
import { Project } from '../types';

interface ProjectCardProps {
  project: Project;
  currentProject: Project | null;
  loadProject: (project: Project) => void;
  exportProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  layout?: 'grid' | 'list';
}

export const ProjectCard = ({
  project,
  currentProject,
  loadProject,
  exportProject,
  deleteProject,
  layout = 'grid'
}: ProjectCardProps) => {
  const isActive = currentProject?.id === project.id;

  if (layout === 'list') {
    return (
      <div
        className={`group rounded-lg border px-3 py-2 transition-all flex items-center gap-3 cursor-pointer ${
          isActive
            ? 'border-yellow-500/70 bg-zinc-900'
            : 'border-zinc-800 bg-zinc-950 hover:bg-zinc-900/70'
        }`}
        onClick={() => loadProject(project)}
      >
        {project.isVideoLocal && (
          <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 shrink-0 whitespace-nowrap">
            🎵 로컬 음원
          </span>
        )}
        <div className="min-w-0 flex-1 text-sm font-bold text-white truncate">
          {project.title}
        </div>
        <span className="text-[9px] text-white font-bold uppercase tracking-widest bg-zinc-900/50 px-1 py-0.5 rounded border border-zinc-800/50 shrink-0">
          {new Date(project.createdAt).toLocaleDateString()}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); exportProject(project); }}
            className="flex items-center gap-1 px-1.5 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded transition-all border border-zinc-700 text-[8px] uppercase font-bold shrink-0"
            title="파일로 저장"
          >
            <Download className="w-2.5 h-2.5" />
            저장
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); deleteProject(project.id); }}
            className="p-0.5 bg-zinc-800 hover:bg-red-500 text-zinc-400 hover:text-white rounded transition-all border border-zinc-700 hover:border-red-400 shrink-0"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

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
        <div className="flex flex-col items-start gap-1.5 mb-1">
          {project.isVideoLocal && (
            <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 shrink-0 whitespace-nowrap">
              🎵 로컬 음원
            </span>
          )}
          <div className="min-w-0 flex-1 relative w-full">
            <div className="text-sm font-bold text-white leading-tight break-words line-clamp-3">
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
            title="파일로 저장"
          >
            <Download className="w-2.5 h-2.5" />
            저장
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
