declare global {
  const __APP_BUILD_TIME__: string;
}

export interface TranscriptItem {
  text: string;
  translation?: string;
  grammar?: string;
  offset: number;
  duration: number;
}

export type RightView = 'assistant' | 'scriptLibrary' | 'scriptEditor' | 'settings' | 'subtitles';

export interface Project {
  id: string;
  title: string;
  videoId: string;
  transcript: TranscriptItem[];
  createdAt: number;
  isVideoLocal?: boolean;
  localFileName?: string;
}
