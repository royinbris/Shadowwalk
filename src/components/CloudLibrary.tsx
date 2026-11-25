import React, { useEffect, useRef, useState } from 'react';
import { Cloud, FileText, RefreshCw, Trash2, Upload } from 'lucide-react';
import type { Project } from '../types';
import { deleteCloudFile, listCloudFiles, readCloudFile, saveCloudProject, saveCloudText, type CloudEntry } from '../cloud';

interface Props {
  refreshKey: number;
  onOpenProject: (project: Project) => void;
  onOpenText: (content: string) => void;
}

export function CloudLibrary({ refreshKey, onOpenProject, onOpenText }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [entries, setEntries] = useState<CloudEntry[]>([]);
  const [titles, setTitles] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const files = await listCloudFiles();
      setEntries(files.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()));
      const projects = files.filter((entry) => entry.pathname.endsWith('.json'));
      const results = await Promise.allSettled(projects.map(async (entry) => {
        const project = JSON.parse(await readCloudFile(entry.pathname)) as Project;
        return [entry.pathname, project.title] as const;
      }));
      setTitles(Object.fromEntries(results.filter((result) => result.status === 'fulfilled').map((result) => result.value)));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '클라우드 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void refresh(); }, [refreshKey]);

  const upload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length) return;
    setLoading(true);
    setError(null);
    try {
      for (const file of files) {
        if (file.size > 256 * 1024) throw new Error('파일은 256KB 이하만 저장할 수 있습니다.');
        const content = await file.text();
        if (file.name.toLowerCase().endsWith('.txt')) {
          await saveCloudText(file.name, content);
        } else if (file.name.toLowerCase().endsWith('.json')) {
          const project = JSON.parse(content) as Project;
          await saveCloudProject(project);
        } else {
          throw new Error('TXT 또는 JSON 파일만 저장할 수 있습니다.');
        }
      }
      await refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '업로드하지 못했습니다.');
      setLoading(false);
    }
  };

  const open = async (entry: CloudEntry) => {
    setError(null);
    try {
      const content = await readCloudFile(entry.pathname);
      if (entry.pathname.endsWith('.json')) onOpenProject(JSON.parse(content) as Project);
      else onOpenText(content);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '파일을 열지 못했습니다.');
    }
  };

  const remove = async (entry: CloudEntry) => {
    if (!window.confirm(`${titles[entry.pathname] || entry.name} 파일을 클라우드에서 삭제할까요?`)) return;
    setError(null);
    try {
      await deleteCloudFile(entry.pathname);
      await refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '파일을 삭제하지 못했습니다.');
    }
  };

  return (
    <section className="rounded-xl border border-sky-900/60 bg-sky-950/10 p-4 space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className="font-bold text-sky-300 flex items-center gap-2"><Cloud size={16} /> 클라우드 파일</h3>
        <div className="flex items-center gap-2">
          <input ref={inputRef} type="file" accept=".txt,.json,text/plain,application/json" multiple className="hidden" onChange={upload} />
          <button onClick={() => inputRef.current?.click()} disabled={loading} className="text-xs px-3 py-1.5 rounded bg-sky-800 text-white disabled:opacity-50 flex items-center gap-1"><Upload size={13} /> TXT/JSON 올리기</button>
          <button onClick={() => void refresh()} disabled={loading} title="새로고침" className="p-1.5 rounded bg-zinc-800 text-zinc-200 disabled:opacity-50"><RefreshCw size={14} /></button>
        </div>
      </div>
      {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
      {loading && <p className="text-xs text-zinc-400">클라우드 파일을 확인하는 중…</p>}
      {!loading && !error && entries.length === 0 && <p className="text-xs text-zinc-400">저장된 파일이 없습니다.</p>}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map((entry) => (
          <div key={entry.pathname} className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 min-w-0">
            <FileText size={15} className="text-sky-400 shrink-0" />
            <button onClick={() => void open(entry)} className="flex-1 min-w-0 text-left text-sm text-white truncate hover:text-sky-300" title="열기">
              {titles[entry.pathname] || entry.name.replace(/^[0-9a-f-]{36}-/, '')}
              <span className="block text-[10px] text-zinc-500">{entry.pathname.endsWith('.json') ? 'JSON' : 'TXT'} · {new Date(entry.uploadedAt).toLocaleDateString()}</span>
            </button>
            <button onClick={() => void remove(entry)} title="클라우드에서 삭제" className="text-zinc-500 hover:text-red-400"><Trash2 size={15} /></button>
          </div>
        ))}
      </div>
    </section>
  );
}
