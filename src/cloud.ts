import type { Project } from './types';

export interface CloudEntry {
  pathname: string;
  uploadedAt: string;
  size: number;
  name: string;
}

async function request(path: string, options?: RequestInit) {
  const response = await fetch(`/api/library${path}`, { cache: 'no-store', ...options });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `클라우드 요청 실패 (${response.status})`);
  }
  return response;
}

export async function listCloudFiles(): Promise<CloudEntry[]> {
  const response = await request('');
  return (await response.json()).entries;
}

export async function readCloudFile(pathname: string): Promise<string> {
  return (await request(`?path=${encodeURIComponent(pathname)}`)).text();
}

export async function saveCloudProject(project: Project): Promise<void> {
  await request('', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind: 'project', project }),
  });
}

export async function saveCloudText(name: string, content: string): Promise<void> {
  await request('', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind: 'text', name, content }),
  });
}

export async function deleteCloudFile(pathname: string): Promise<void> {
  await request(`?path=${encodeURIComponent(pathname)}`, { method: 'DELETE' });
}
