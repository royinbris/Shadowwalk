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
  children
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
          <video 
            ref={videoRef}
            src={localVideoUrl || undefined}
            className="w-full h-full object-contain bg-black"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            playsInline
          />
        ) : (
          <div id="youtube-container" className="w-full h-full pointer-events-auto" suppressHydrationWarning></div>
        )}
      </div>
      {children}
    </div>
  );
};
