import React, { useState, useEffect } from 'react';
import { fetchGoogleDriveFiles, downloadGoogleDriveFile, getGoogleToken } from '../utils';

interface DriveFile {
  id: string;
  name: string;
  modifiedTime: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onImport: (projectData: any) => void;
}

export const GoogleDriveImportModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadFiles();
    } else {
      setFiles([]);
      setError(null);
    }
  }, [isOpen]);

  const loadFiles = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const accessToken = await getGoogleToken();
      const fetchedFiles = await fetchGoogleDriveFiles(accessToken);
      setFiles(fetchedFiles);
      (window as any)._driveToken = accessToken;
    } catch (err) {
      console.error(err);
      setError("파일 목록을 불러오거나 인증하는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileClick = async (file: DriveFile) => {
    const token = (window as any)._driveToken;
    if (!token) return;

    setIsLoading(true);
    try {
      const projectData = await downloadGoogleDriveFile(token, file.id);
      onImport(projectData);
      onClose();
    } catch (err) {
      console.error(err);
      alert("파일을 다운로드하는 데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black uppercase tracking-tighter text-blue-400">
            구글 드라이브에서 불러오기
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl mb-4 text-sm font-bold">
            {error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto pr-2 space-y-2">
          {isLoading ? (
            <div className="text-center text-zinc-500 py-8 font-bold">로딩 중...</div>
          ) : files.length === 0 && !error ? (
            <div className="text-center text-zinc-500 py-8 text-sm">
              '유튭영어' 폴더에 저장된 파일이 없습니다.<br/>
              (앱을 통해 Export한 파일만 표시됩니다)
            </div>
          ) : (
            files.map(file => {
              const d = new Date(file.modifiedTime);
              return (
                <button
                  key={file.id}
                  onClick={() => handleFileClick(file)}
                  className="w-full flex items-center justify-between bg-black/40 border border-zinc-800 hover:border-blue-400/50 py-2.5 px-3 rounded-xl transition-all group gap-3"
                >
                  <div className="text-sm font-sans font-medium text-zinc-200 group-hover:text-blue-400 transition-colors truncate text-left">
                    {file.name}
                  </div>
                  <div className="text-[10px] text-zinc-500 shrink-0">
                    {d.toLocaleDateString()} {d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl font-bold bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
