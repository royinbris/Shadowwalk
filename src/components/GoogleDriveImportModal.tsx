import React, { useState, useEffect } from 'react';
import {
  fetchGoogleDriveFiles,
  downloadGoogleDriveText,
  downloadGoogleDriveBlob,
  getGoogleToken,
  isIOSDevice,
  startGoogleRedirectAuth,
} from '../utils';

interface DriveFile {
  id: string;
  name: string;
  modifiedTime: string;
  mimeType?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onImport: (payload: {
    mediaBlob: Blob | null;
    mediaName: string | null;
    textContent: string | null;
    isJson: boolean;
  }) => void | Promise<void>;
}

const stripExt = (name: string) => name.replace(/\.[^/.]+$/, '');
const isMediaFile = (f: DriveFile) =>
  /\.(mp3|m4a|mp4|wav|ogg|aac|webm)$/i.test(f.name) ||
  (f.mimeType || '').startsWith('audio/') ||
  (f.mimeType || '').startsWith('video/');
const isTextFile = (f: DriveFile) => /\.(txt|srt|vtt)$/i.test(f.name);
const isJsonFile = (f: DriveFile) => /\.json$/i.test(f.name);

export const GoogleDriveImportModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempted, setAttempted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // iOS blocks popups not opened from a direct user gesture, so only
      // auto-load when a token already exists; otherwise wait for a tap.
      if ((window as any)._driveToken) {
        loadFiles();
      } else {
        setFiles([]);
        setError(null);
        setAttempted(false);
      }
    } else {
      setFiles([]);
      setError(null);
      setAttempted(false);
    }
  }, [isOpen]);

  const handleConnect = () => {
    // iOS blocks the token popup; redirect the whole page to Google instead.
    if (isIOSDevice() && !(window as any)._driveToken) {
      startGoogleRedirectAuth();
      return;
    }
    loadFiles();
  };

  const loadFiles = async () => {
    setIsLoading(true);
    setError(null);
    setAttempted(true);

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

  const findPair = (file: DriveFile, predicate: (f: DriveFile) => boolean) => {
    const base = stripExt(file.name);
    // Prefer an exact base-name match, otherwise a file whose base starts with this base.
    return (
      files.find((f) => f.id !== file.id && predicate(f) && stripExt(f.name) === base) ||
      files.find(
        (f) => f.id !== file.id && predicate(f) && stripExt(f.name).startsWith(base),
      ) ||
      null
    );
  };

  const handleFileClick = async (file: DriveFile) => {
    const token = (window as any)._driveToken;
    if (!token) return;

    setIsLoading(true);
    try {
      let mediaFile: DriveFile | null = null;
      let textFile: DriveFile | null = null;
      let jsonFile: DriveFile | null = null;

      if (isMediaFile(file)) {
        mediaFile = file;
        textFile =
          findPair(file, (f) => /\.txt$/i.test(f.name)) ||
          findPair(file, isTextFile);
        if (!textFile) jsonFile = findPair(file, isJsonFile);
      } else if (isJsonFile(file)) {
        jsonFile = file;
        mediaFile = findPair(file, isMediaFile);
      } else {
        textFile = file;
        mediaFile = findPair(file, isMediaFile);
      }

      const mediaBlob = mediaFile
        ? await downloadGoogleDriveBlob(token, mediaFile.id)
        : null;
      const textSource = jsonFile || textFile;
      const textContent = textSource
        ? await downloadGoogleDriveText(token, textSource.id)
        : null;

      await onImport({
        mediaBlob,
        mediaName: mediaFile ? mediaFile.name : null,
        textContent,
        isJson: !!jsonFile,
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert("파일을 다운로드하는 데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const badge = (f: DriveFile) => {
    if (isMediaFile(f)) return '음원';
    if (isJsonFile(f)) return 'JSON';
    if (isTextFile(f)) return '자막';
    return '파일';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl">
        <div className="flex justify-between items-center mb-3">
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

        <div className="flex-1 overflow-y-auto pr-2 space-y-1.5">
          {isLoading ? (
            <div className="text-center text-zinc-500 py-8 font-bold">로딩 중...</div>
          ) : !attempted || (error && files.length === 0) ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <button
                onClick={handleConnect}
                className="px-5 py-3 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors"
              >
                구글 드라이브 연결
              </button>
              <p className="text-xs text-zinc-500 text-center">
                버튼을 눌러 구글 로그인 후 파일을 불러옵니다.
              </p>
            </div>
          ) : files.length === 0 && !error ? (
            <div className="text-center text-zinc-500 py-8 text-sm">
              '유튭영어' 폴더에 파일이 없습니다.
            </div>
          ) : (
            files.map(file => {
              const d = new Date(file.modifiedTime);
              const displayName = stripExt(file.name);
              return (
                <button
                  key={file.id}
                  onClick={() => handleFileClick(file)}
                  className="w-full flex items-center justify-between bg-black/40 border border-zinc-800 hover:border-blue-400/50 py-2 px-2.5 rounded-xl transition-all group gap-2"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 shrink-0">
                      {badge(file)}
                    </span>
                    <span className="text-sm font-sans font-medium text-zinc-200 group-hover:text-blue-400 transition-colors line-clamp-2 text-left break-words pr-1">
                      {displayName}
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center bg-zinc-800/60 rounded-lg p-1.5 min-w-[2.5rem] shrink-0">
                    <div className="text-[9px] text-zinc-400 font-bold leading-none mb-1">{d.getMonth() + 1}월</div>
                    <div className="text-sm text-zinc-200 font-black leading-none">{d.getDate()}</div>
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
