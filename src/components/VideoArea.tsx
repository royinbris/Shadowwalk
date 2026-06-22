import React from 'react';
import { Project } from '../types';

interface VideoAreaProps {
  videoId: string | null;
  showGeminiHelper: boolean;
  videoScale: number;
  currentProject: Project | null;
  videoRef: React.MutableRefObject<any>;
  localVideoUrl: string | null;
  setIsPlaying: (val: boolean) => void;
  isFullscreen?: boolean;
  children?: React.ReactNode;
  onLocalFileSelect?: (file: File) => void;
}

export const VideoArea = ({
  videoId,
  showGeminiHelper,
  videoScale,
  currentProject,
  videoRef,
  localVideoUrl,
  setIsPlaying,
  isFullscreen,
  children,
  onLocalFileSelect
}: VideoAreaProps) => {
  return (
    <div 
      className={`w-full bg-zinc-950 transition-all duration-700 ease-in-out flex items-center justify-center overflow-hidden ${videoId && !showGeminiHelper && videoScale > 0 ? 'opacity-100' : 'h-0 opacity-0'} ${isFullscreen ? 'absolute inset-0 z-0' : 'relative'}`}
      style={{ 
        display: videoId && !showGeminiHelper && (videoScale > 0 || isFullscreen) ? 'flex' : 'none',
        aspectRatio: isFullscreen ? 'auto' : (videoId && !showGeminiHelper && videoScale > 0 ? `16 / ${9 * (videoScale * 0.2)}` : 'auto')
      }}
    >
      <div className="absolute inset-0 w-full h-full flex items-center justify-center">
        {currentProject?.isVideoLocal ? (
          <>
            <video 
              ref={videoRef}
              src={localVideoUrl || undefined}
              className={`w-full h-full object-contain bg-black ${!localVideoUrl ? 'opacity-0' : ''}`}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
              playsInline
            />
            {!localVideoUrl && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/95 z-10 border-2 border-dashed border-zinc-700/50 m-4 rounded-2xl">
                <div className="bg-yellow-500/10 p-4 rounded-full mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
                <h3 className="text-white font-bold text-lg mb-2 text-center px-4">로컬 음원/영상 파일이 필요합니다</h3>
                <p className="text-zinc-400 text-sm mb-6 text-center px-4 max-w-sm">
                  브라우저 보안 정책상 이전에 사용하신 로컬 파일을 자동으로 불러올 수 없습니다. 원활한 재생을 위해 파일을 다시 선택해 주세요.
                </p>
                <label className="px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase tracking-wider text-sm rounded-xl cursor-pointer transition-all shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_30px_rgba(234,179,8,0.5)] hover:-translate-y-0.5 active:scale-95">
                  파일 다시 선택하기
                  <input 
                    type="file" 
                    accept="audio/*,video/*" 
                    className="hidden" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && onLocalFileSelect) {
                        onLocalFileSelect(file);
                      }
                      e.target.value = '';
                    }} 
                  />
                </label>
              </div>
            )}
          </>
        ) : (
          <div id="youtube-container" className="w-full h-full pointer-events-auto" suppressHydrationWarning></div>
        )}
      </div>
      {children}
    </div>
  );
};
