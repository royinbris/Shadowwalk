import { VideoArea } from "./components/VideoArea";
import { TopStudyControls } from "./components/TopStudyControls";
import { FloatingVideoSeekControls } from "./components/FloatingVideoSeekControls";
import { SettingsModal } from "./components/SettingsModal";
import {
  DEFAULT_ANALYSIS_PROMPT,
  DEFAULT_QUERY_PROMPT,
  DEFAULT_REFINEMENT_PROMPT,
} from "./constants";
import { AssistantPanel } from "./components/AssistantPanel";
import { GestureHelpModal } from "./components/GestureHelpModal";
import { LargeControlsPanel } from "./components/LargeControlsPanel";
import { ScriptLibraryPanel } from "./components/ScriptLibraryPanel";
import { SettingsPanel } from "./components/SettingsPanel";
import { ThemeSelector } from "./components/ThemeSelector";
import { LibraryView } from "./components/LibraryView";
import { ScriptEditor } from "./components/ScriptEditor";
import {
  extractVideoId,
  formatTranscriptToUnified,
  exportProject,
  exportToGoogleDrive,
  printSubtitles,
  preprocessSrt,
} from "./utils";
import { RefinementPromptModal } from "./components/RefinementPromptModal";
import { ProjectCard } from "./components/ProjectCard";
import { PromptEditorModal } from "./components/PromptEditorModal";
import { THEMES } from "./themes";
import { ApiKeyModal } from "./components/ApiKeyModal";
import { GoogleDriveImportModal } from "./components/GoogleDriveImportModal";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Languages,
  Settings,
  Search,
  AlertCircle,
  FileText,
  Sparkles,
  X,
  Upload,
  Plus,
  Minus,
  Repeat,
  Download,
  Mic,
  Volume2,
  Key,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Eye,
  EyeOff,
  Printer,
  RefreshCw,
  Maximize,
  Minimize,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from "react-markdown";
import { VerticalDial } from "./components/VerticalDial";

// Initialize Gemini
const GEMINI_MODEL = "gemini-3-flash-preview";

import { TranscriptItem, RightView, Project } from "./types";

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

export default function App() {
  const [themeId, setThemeId] = useState<string>("default");

  const currentThemeStyles = React.useMemo(() => {
    if (themeId === "default") return {};
    const t = THEMES.find((t) => t.id === themeId);
    return t ? t.styles : {};
  }, [themeId]);

  const [view, setView] = useState<"library" | "editor" | "study">("library");
  const [rightView, setRightView] = useState<RightView>("assistant");
  const [windowWidth, setWindowWidth] = useState(() => window.innerWidth);
  const [windowHeight, setWindowHeight] = useState(() => window.innerHeight);

  useEffect(() => {
    if (view !== "study") {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
        transitionTimeoutRef.current = null;
      }
      isTransitioningRef.current = false;
    }
  }, [view]);

  const [projects, setProjects] = useState<Project[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  const [localVideoUrl, setLocalVideoUrl] = useState<string | null>(null);
  const [localVideoFile, setLocalVideoFile] = useState<File | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [unifiedInput, setUnifiedInput] = useState("");
  const [videoId, setVideoId] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loopMode, setLoopMode] = useState<0 | 1 | 2>(1);
  const [isAutoPause, setIsAutoPause] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentProject) {
      localStorage.setItem(
        `project_last_index_${currentProject.id}`,
        currentIndex.toString(),
      );
    }
  }, [currentIndex, currentProject]);
  const [showEn, setShowEn] = useState(true);
  const [showKo, setShowKo] = useState(false);
  const [showGrammar, setShowGrammar] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [loopCount, setLoopCount] = useState(0);
  const [maxLoops, setMaxLoops] = useState(5);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [showSyncControls, setShowSyncControls] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [geminiApiKeys, setGeminiApiKeys] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("user_gemini_api_keys");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    const legacy = localStorage.getItem("user_gemini_api_key");
    return legacy ? [legacy] : [""];
  });
  const [selectedGeminiKeyIndex, setSelectedGeminiKeyIndex] = useState(
    () => parseInt(localStorage.getItem("selected_gemini_key_index") || "0", 10),
  );
  const userApiKey = geminiApiKeys[selectedGeminiKeyIndex] || "";
  const [geminiModel, setGeminiModel] = useState(
    () => localStorage.getItem("user_gemini_model") || GEMINI_MODEL,
  );
  const [cerebrasApiKey, setCerebrasApiKey] = useState(
    () => localStorage.getItem("user_cerebras_api_key") || "",
  );
  const [cerebrasModel, setCerebrasModel] = useState(
    () => localStorage.getItem("user_cerebras_model") || "llama3.1-8b",
  );
  const [openrouterApiKey, setOpenrouterApiKey] = useState(
    () => localStorage.getItem("user_openrouter_api_key") || "",
  );
  const [openrouterModel, setOpenrouterModel] = useState(
    () => localStorage.getItem("user_openrouter_model") || "qwen/qwen-3-235b",
  );
  const [aiProvider, setAiProvider] = useState<
    "gemini" | "cerebras" | "openrouter"
  >(
    () =>
      (localStorage.getItem("user_ai_provider") as
        | "gemini"
        | "cerebras"
        | "openrouter") || "gemini",
  );
  const [isApiKeyVisible, setIsApiKeyVisible] = useState(false);

  const handleExportProject = useCallback((project: Project) => {
    // exportProject(project); // 로컬 저장 기능 중지 (향후 대비용으로 남겨둠)
    exportToGoogleDrive(project);
  }, []);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isDriveImportModalOpen, setIsDriveImportModalOpen] = useState(false);
  const [isContinuous, setIsContinuous] = useState(true);
  const [isAutoAdvanceLoop, setIsAutoAdvanceLoop] = useState(true);
  const [isSubtitleOnly, setIsSubtitleOnly] = useState(false);
  const [isVideoOnly, setIsVideoOnly] = useState(false);
  const [showVideoControls, setShowVideoControls] = useState(false);
  const [seekBackDuration, setSeekBackDuration] = useState(1.0);
  const [showGeminiHelper, setShowGeminiHelper] = useState(false);
  const [isCustomLoopActive, setIsCustomLoopActive] = useState(false);
  const customLoopRef = useRef<{ start: number; end: number } | null>(null);

  // Expansion mode states
  const [isExpansionMode, setIsExpansionMode] = useState(false);
  const [expansionCurrentEnd, setExpansionCurrentEnd] = useState<number | null>(null);
  const [isExpansionPaused, setIsExpansionPaused] = useState(false);

  const cyclePlaybackStage = useCallback(() => {
    if (!showVideoControls) {
      // Stage 1 -> Stage 2
      setShowVideoControls(true);
      setIsExpansionMode(false);
      setIsExpansionPaused(false);
    } else if (!isExpansionMode) {
      // Stage 2 -> Stage 3
      setIsExpansionMode(true);
      setIsExpansionPaused(false);
      setIsCustomLoopActive(false);
      customLoopRef.current = null;
      
      const currentSentenceStart =
        view === "study" && transcript.length > 0 && currentIndex < transcript.length
          ? transcript[currentIndex].offset
          : null;
      if (currentSentenceStart !== null) {
        setExpansionCurrentEnd(currentSentenceStart + seekBackDuration);
      } else {
        setExpansionCurrentEnd(null);
      }
    } else {
      // Stage 3 -> Stage 1
      setShowVideoControls(false);
      setIsExpansionMode(false);
      setIsExpansionPaused(false);
      setExpansionCurrentEnd(null);
    }
  }, [showVideoControls, isExpansionMode, view, transcript, currentIndex, seekBackDuration]);

  const toggleExpansionPause = useCallback(() => {
    setIsExpansionPaused((prev) => !prev);
  }, []);

  const expandNext = useCallback(() => {
    const currentSentenceStart =
      view === "study" && transcript.length > 0 && currentIndex < transcript.length
        ? transcript[currentIndex].offset
        : 0;
    const currentSentenceEnd =
      view === "study" && transcript.length > 0 && currentIndex < transcript.length
        ? transcript[currentIndex].offset + transcript[currentIndex].duration
        : currentSentenceStart + 10;
        
    setExpansionCurrentEnd((prev) => 
      prev !== null 
        ? Math.min(currentSentenceEnd, prev + seekBackDuration) 
        : Math.min(currentSentenceEnd, currentSentenceStart + seekBackDuration)
    );
  }, [view, transcript, currentIndex, seekBackDuration]);

  const expandPrev = useCallback(() => {
    const currentSentenceStart =
      view === "study" && transcript.length > 0 && currentIndex < transcript.length
        ? transcript[currentIndex].offset
        : 0;
    setExpansionCurrentEnd((prev) => 
      prev !== null ? Math.max(currentSentenceStart + 0.1, prev - seekBackDuration) : prev
    );
  }, [view, transcript, currentIndex, seekBackDuration]);

  const resetExpansion = useCallback(() => {
    const currentSentenceStart =
      view === "study" && transcript.length > 0 && currentIndex < transcript.length
        ? transcript[currentIndex].offset
        : null;
    if (currentSentenceStart !== null) {
      setExpansionCurrentEnd(currentSentenceStart + seekBackDuration);
      if (currentProject?.isVideoLocal && videoRef.current) {
        videoRef.current.currentTime = currentSentenceStart;
        videoRef.current.play().catch(() => {});
      } else if (playerRef.current) {
        expectedSeekTargetRef.current = { time: currentSentenceStart, timestamp: Date.now() };
        playerRef.current.seekTo(currentSentenceStart, true);
        playerRef.current.playVideo();
      }
    } else {
      setExpansionCurrentEnd(null);
    }
  }, [view, transcript, currentIndex, seekBackDuration, currentProject]);

  const [geminiQuery, setGeminiQuery] = useState("");

  const [geminiResponse, setGeminiResponse] = useState("");
  const [isGeminiLoading, setIsGeminiLoading] = useState(false);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);

  const [splitRatio, setSplitRatio] = useState(40); // 40% left, 60% right
  const [isDraggingDivider, setIsDraggingDivider] = useState(false);

  const isWideLayout =
    windowWidth >= 1024 || (windowWidth > windowHeight && windowWidth >= 640);
  const isSplitStudy = view === "study" && isWideLayout;

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingDivider) return;
      const newRatio = (e.clientX / window.innerWidth) * 100;
      if (newRatio > 20 && newRatio < 80) {
        // Limit resizing between 20% and 80%
        setSplitRatio(newRatio);
      }
    };
    const handleMouseUp = () => setIsDraggingDivider(false);

    if (isDraggingDivider) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    } else {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingDivider]);

  const handleScriptsClick = () => {
    if (isSplitStudy) {
      setRightView("scriptLibrary");
      return;
    }
    if (view !== "library") {
      setIsPlaying(false);
      if (playerRef.current) playerRef.current.pauseVideo();
      if (videoRef.current) videoRef.current.pause();
      if (transitionTimeoutRef.current)
        clearTimeout(transitionTimeoutRef.current);
      setView("library");
    } else {
      setView("study");
    }
  };

  // Unified AI Generation Stream
  const generateAIContentStream = useCallback(
    async (prompt: string, onUpdate: (chunk: string) => void): Promise<string> => {
      if (aiProvider === "gemini") {
        const key = userApiKey?.trim();
        if (!key) {
          setIsApiKeyModalOpen(true);
          throw new Error("⚠️ Gemini API 키가 설정되지 않았습니다.");
        }
        const aiClient = new GoogleGenAI({ apiKey: key });
        const currentModelName = geminiModel.startsWith("models/")
          ? geminiModel.substring(7)
          : geminiModel;
        
        const responseStream = await aiClient.models.generateContentStream({
          model: currentModelName,
          contents: prompt,
        });

        let fullText = "";
        for await (const chunk of responseStream) {
          fullText += chunk.text;
          onUpdate(fullText);
        }
        return fullText;
      } else if (aiProvider === "cerebras") {
        const key = cerebrasApiKey?.trim();
        if (!key) {
          setIsApiKeyModalOpen(true);
          throw new Error("⚠️ Cerebras API 키가 설정되지 않았습니다.");
        }
        const response = await fetch(
          "https://api.cerebras.ai/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${key}`,
            },
            body: JSON.stringify({
              model: cerebrasModel,
              messages: [{ role: "user", content: prompt }],
              stream: true,
            }),
          },
        );
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            `Cerebras API Error: ${response.status} ${response.statusText} - ${errorData.error?.message || ""}`,
          );
        }
        const reader = response.body?.getReader();
        const decoder = new TextDecoder("utf-8");
        let fullText = "";
        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const dataStr = line.replace('data: ', '').trim();
                if (dataStr === '[DONE]') continue;
                try {
                  const data = JSON.parse(dataStr);
                  if (data.choices && data.choices[0] && data.choices[0].delta && data.choices[0].delta.content) {
                    fullText += data.choices[0].delta.content;
                    onUpdate(fullText);
                  }
                } catch (e) {}
              }
            }
          }
        }
        return fullText;
      } else {
        const key = openrouterApiKey?.trim();
        if (!key) {
          setIsApiKeyModalOpen(true);
          throw new Error("⚠️ OpenRouter API 키가 설정되지 않았습니다.");
        }
        const response = await fetch(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${key}`,
            },
            body: JSON.stringify({
              model: openrouterModel,
              messages: [{ role: "user", content: prompt }],
              stream: true,
            }),
          },
        );
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            `OpenRouter API Error: ${response.status} ${response.statusText} - ${errorData.error?.message || ""}`,
          );
        }
        const reader = response.body?.getReader();
        const decoder = new TextDecoder("utf-8");
        let fullText = "";
        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const dataStr = line.replace('data: ', '').trim();
                if (dataStr === '[DONE]') continue;
                try {
                  const data = JSON.parse(dataStr);
                  if (data.choices && data.choices[0] && data.choices[0].delta && data.choices[0].delta.content) {
                    fullText += data.choices[0].delta.content;
                    onUpdate(fullText);
                  }
                } catch (e) {}
              }
            }
          }
        }
        return fullText;
      }
    },
    [
      aiProvider,
      userApiKey,
      geminiModel,
      cerebrasApiKey,
      cerebrasModel,
      openrouterApiKey,
      openrouterModel,
      setIsApiKeyModalOpen,
    ],
  );

  // Unified AI Generation
  const generateAIContent = useCallback(
    async (prompt: string): Promise<string> => {
      if (aiProvider === "gemini") {
        const key = userApiKey?.trim();
        if (!key) {
          setIsApiKeyModalOpen(true);
          throw new Error("⚠️ Gemini API 키가 설정되지 않았습니다.");
        }
        const aiClient = new GoogleGenAI({ apiKey: key });
        const currentModelName = geminiModel.startsWith("models/")
          ? geminiModel.substring(7)
          : geminiModel;
        const response = await aiClient.models.generateContent({
          model: currentModelName,
          contents: prompt,
        });
        return response.text || "";
      } else if (aiProvider === "cerebras") {
        const key = cerebrasApiKey?.trim();
        if (!key) {
          setIsApiKeyModalOpen(true);
          throw new Error("⚠️ Cerebras API 키가 설정되지 않았습니다.");
        }
        const response = await fetch(
          "https://api.cerebras.ai/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${key}`,
            },
            body: JSON.stringify({
              model: cerebrasModel,
              messages: [{ role: "user", content: prompt }],
            }),
          },
        );
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            `Cerebras API Error: ${response.status} ${response.statusText} - ${errorData.error?.message || ""}`,
          );
        }
        const data = await response.json();
        return data.choices[0]?.message?.content || "";
      } else {
        const key = openrouterApiKey?.trim();
        if (!key) {
          setIsApiKeyModalOpen(true);
          throw new Error("⚠️ OpenRouter API 키가 설정되지 않았습니다.");
        }
        const response = await fetch(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${key}`,
            },
            body: JSON.stringify({
              model: openrouterModel,
              messages: [{ role: "user", content: prompt }],
            }),
          },
        );
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            `OpenRouter API Error: ${response.status} ${response.statusText} - ${errorData.error?.message || ""}`,
          );
        }
        const data = await response.json();
        return data.choices[0]?.message?.content || "";
      }
    },
    [
      aiProvider,
      userApiKey,
      cerebrasApiKey,
      openrouterApiKey,
      openrouterModel,
      setIsApiKeyModalOpen,
    ],
  );

  const [analysisPromptTemplate, setAnalysisPromptTemplate] = useState(
    DEFAULT_ANALYSIS_PROMPT,
  );
  const [queryPromptTemplate, setQueryPromptTemplate] =
    useState(DEFAULT_QUERY_PROMPT);
  const [isPromptEditorOpen, setIsPromptEditorOpen] = useState(false);
  const [tempAnalysisPrompt, setTempAnalysisPrompt] = useState("");
  const [tempQueryPrompt, setTempQueryPrompt] = useState("");
  const [refinementPrompt, setRefinementPrompt] = useState(
    DEFAULT_REFINEMENT_PROMPT,
  );
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [delayDuration, setDelayDuration] = useState(1.0);
  const [delayMode, setDelayMode] = useState<0 | 1 | 2>(2);
  const [fontSize, setFontSize] = useState(3);
  const [krFontSize, setKrFontSize] = useState(3);
  const [showSpeedControl, setShowSpeedControl] = useState(false);
  const [showLoopControl, setShowLoopControl] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showGestureHelp, setShowGestureHelp] = useState(false);
  const [isBlackout, setIsBlackout] = useState(false);
  const [videoScale, setVideoScale] = useState(5);
  const [isRecording, setIsRecording] = useState(false);
  const isRecordingRef = useRef(false);
  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recorderAudioRef = useRef<HTMLAudioElement | null>(null);
  const [showRecordingPanel, setShowRecordingPanel] = useState(false);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  const showCopyFeedback = useCallback((msg: string = "복사되었습니다!") => {
    setCopyStatus(msg);
    setTimeout(() => setCopyStatus(null), 2000);
  }, []);
  const [isPlayingRecorded, setIsPlayingRecorded] = useState(false);
  const isPlayingRecordedRef = useRef(false);
  useEffect(() => {
    isPlayingRecordedRef.current = isPlayingRecorded;
  }, [isPlayingRecorded]);
  const [wasPlayingBeforeAction, setWasPlayingBeforeAction] = useState(false);
  const wasPlayingBeforeActionRef = useRef(false);
  useEffect(() => {
    wasPlayingBeforeActionRef.current = wasPlayingBeforeAction;
  }, [wasPlayingBeforeAction]);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [remainingPlaybackTime, setRemainingPlaybackTime] = useState(0);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingTimerRef = useRef<any>(null);
  const playbackTimerRef = useRef<any>(null);
  const playbackSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const decodedBufferRef = useRef<AudioBuffer | null>(null);

  const lastPanOffset = useRef({ x: 0, y: 0 });
  const lastTapTime = useRef<number>(0);
  const tapCount = useRef<number>(0);
  const tapTimeout = useRef<any>(null);

  const captionAreaRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const virtualTimeRef = useRef<number>(0);
  const wakeLockRef = useRef<any>(null);
  const lastVirtualTimeUpdateRef = useRef<number>(0);
  const checkIntervalRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isTransitioningRef = useRef(false);
  const transitionTimeoutRef = useRef<any>(null);
  const isResumingAfterRecordRef = useRef(false);
  const resumeGuardTimerRef = useRef<any>(null);
  const expectedSeekTargetRef = useRef<{ time: number; timestamp: number } | null>(null);
  const seekLoopRef = useRef<any>(null);
  const wasPlayingOnPointerDownRef = useRef<boolean>(false);

  // Key repeat management for Option + Arrow keys
  const keyRepeatTimerRef = useRef<any>(null);
  const keyRepeatDelayRef = useRef<any>(null);
  const activeKeysRef = useRef<Set<string>>(new Set());
  const fullscreenContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    }
  }, [isFullscreen]);

  // Load projects from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("shadowing_projects");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const unique = Array.from(
          new Map(parsed.map((p: any) => [p.id, p])).values(),
        ) as Project[];
        setProjects(unique);
      } catch (e) {
        console.error("Failed to load projects", e);
      }
    }
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Save projects to localStorage
  const saveProjectsToStorage = (updatedProjects: Project[]) => {
    localStorage.setItem("shadowing_projects", JSON.stringify(updatedProjects));
    setProjects(updatedProjects);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const project = JSON.parse(event.target?.result as string);
        if (project.videoId && project.transcript) {
          const updatedProjects = [project, ...projects];
          saveProjectsToStorage(updatedProjects);
          loadProject(project);
          setView("study");
        } else {
          throw new Error("Invalid project format");
        }
      } catch (err) {
        setError("Invalid project file.");
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = "";
  };

  const handleLocalFileSelection = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    let mp4File: File | null = null;
    let jsonFile: File | null = null;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.name.toLowerCase().endsWith(".mp4")) mp4File = file;
      if (file.name.toLowerCase().endsWith(".json")) jsonFile = file;
    }

    if (!mp4File || !jsonFile) {
      setError("Please select both an .mp4 file and a .json subtitle file.");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const jsonText = await jsonFile.text();
      const jsonData = JSON.parse(jsonText);

      if (!jsonData.transcript || !Array.isArray(jsonData.transcript)) {
        throw new Error("Invalid JSON format. Expected { transcript: [...] }");
      }

      const url = URL.createObjectURL(mp4File);
      setLocalVideoUrl(url);
      setLocalVideoFile(mp4File);

      const baseName = mp4File.name.replace(/\.[^/.]+$/, "");

      const newProject: Project = {
        id: Date.now().toString(),
        title: jsonData.title || baseName,
        videoId: "local",
        transcript: jsonData.transcript,
        createdAt: Date.now(),
        isVideoLocal: true,
        localFileName: mp4File.name,
      };

      setProjects((prev) => {
        const next = [newProject, ...prev];
        saveProjectsToStorage(next);
        return next;
      });

      loadProject(newProject);
    } catch (err) {
      console.error(err);
      setError(
        "Failed to load local files. " +
          (err instanceof Error ? err.message : ""),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const startNewProject = () => {
    setCurrentProject(null);
    setUnifiedInput("");
    setVideoId(null);
    setTranscript([]);
    setCurrentIndex(0);
    setLoopCount(0);
    setIsPlaying(false);
    setError(null);
    openEditor();
  };

  const loadProject = (project: Project) => {
    // If it's a local video, check if we still have the Blob URL or if it's expired
    if (project.isVideoLocal && !localVideoUrl) {
      if (localVideoFile && localVideoFile.name === project.localFileName) {
        // Reuse current (though localVideoUrl should have been set if file is present)
      } else {
        setError(
          `Please re-select the local video file: ${project.localFileName}`,
        );
        return;
      }
    }

    setCurrentProject(project);
    setVideoId(project.videoId);
    setTranscript(project.transcript);
    setUnifiedInput(formatTranscriptToUnified(project)); // Sync input area

    const savedIndexRaw = localStorage.getItem(
      `project_last_index_${project.id}`,
    );
    const savedIndex = savedIndexRaw ? parseInt(savedIndexRaw, 10) : 0;
    setCurrentIndex(
      Math.max(0, Math.min(savedIndex, project.transcript.length - 1)),
    );

    setLoopCount(0);
    setIsPlaying(false);
    setShowEn(true);
    setShowKo(true);
    setShowGrammar(true);
    setView("study");
    setRightView("subtitles");
  };

  const saveProject = (silentSave: boolean = false, textInput?: string): Project | null | void => {
    const inputToUse = textInput !== undefined ? textInput : unifiedInput;
    if (!inputToUse.trim()) return null;
    if (!silentSave) setError(null);

    const processedInput = preprocessSrt(inputToUse);
    const lines = processedInput.split("\n");
    let title = "";
    let url = "";
    let videoIdToUse = "";

    // 1. Try to find Title and URL with prefixes
    const titleMatch = processedInput.match(/Title:\s*(.*)/i);
    const urlMatch = processedInput.match(/URL:\s*(.*)/i);

    if (titleMatch) title = titleMatch[1].trim();
    if (urlMatch) url = urlMatch[1].trim();

    // 2. If not found, look at the first few lines for Title and URL
    const firstFewLines = lines
      .slice(0, 10)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    for (const line of firstFewLines) {
      const vidId = extractVideoId(line);
      if (vidId && !videoIdToUse) {
        videoIdToUse = vidId;
        if (!url) url = line;
        continue;
      }

      // If it's not a URL, not a timestamp, and not a prefixed line, it might be the title
      if (
        !line.match(/^[(\[]\d+/) &&
        !line.toLowerCase().startsWith("title:") &&
        !line.toLowerCase().startsWith("url:") &&
        !title
      ) {
        title = line;
      }
    }

    if (!videoIdToUse && url) {
      videoIdToUse = extractVideoId(url) || "";
    }

    // Fallback to current project if still missing
    if (!title) title = currentProject?.title || "Untitled Project";
    if (!videoIdToUse) videoIdToUse = currentProject?.videoId || "";

    if (!videoIdToUse) {
      if (!silentSave) setError("Could not find a valid YouTube URL.");
      return null;
    }

    const transcriptItems: TranscriptItem[] = [];
    let currentItem: TranscriptItem | null = null;

    lines.forEach((line) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;

      // Support both (MM:SS) and [HH:MM:SS]
      const timeMatch = trimmedLine.match(
        /^[(\[](\d+:?\d*:?[\d\.]*)[)\]]\s*(.*)$/,
      );
      if (timeMatch) {
        const timeStr = timeMatch[1];
        const text = timeMatch[2].trim();

        const parts = timeStr.split(":").map(Number);
        let seconds = 0;
        if (parts.length === 3)
          seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
        else if (parts.length === 2) seconds = parts[0] * 60 + parts[1];
        else seconds = parts[0];

        currentItem = { text, offset: seconds, duration: 0 };
        transcriptItems.push(currentItem);
      } else {
        // Check if this line is title or url line to skip it
        const isTitleLine =
          trimmedLine.toLowerCase().startsWith("title:") ||
          trimmedLine === title;
        const isUrlLine =
          trimmedLine.toLowerCase().startsWith("url:") ||
          trimmedLine === url ||
          extractVideoId(trimmedLine);

        if (currentItem && !isTitleLine && !isUrlLine) {
          if (!currentItem.translation) {
            currentItem.translation = trimmedLine;
          } else {
            if (!currentItem.grammar) {
              currentItem.grammar = trimmedLine;
            } else {
              currentItem.grammar += "\n" + trimmedLine;
            }
          }
        }
      }
    });

    if (transcriptItems.length === 0) {
      if (!silentSave) setError("No valid transcript lines found.");
      return null;
    }

    // Calculate durations
    for (let i = 0; i < transcriptItems.length; i++) {
      const nextOffset =
        transcriptItems[i + 1]?.offset || transcriptItems[i].offset + 5;
      transcriptItems[i].duration = Math.max(
        0.1,
        nextOffset - transcriptItems[i].offset,
      );
    }

    const updatedProject: Project = {
      id: currentProject?.id || Date.now().toString(),
      title,
      videoId: videoIdToUse,
      transcript: transcriptItems,
      createdAt: currentProject?.createdAt || Date.now(),
    };

    const updatedProjects = currentProject
      ? projects.map((p) => (p.id === currentProject.id ? updatedProject : p))
      : [updatedProject, ...projects];

    saveProjectsToStorage(updatedProjects);
    setCurrentProject(updatedProject);
    
    if (!silentSave) {
      setVideoId(updatedProject.videoId);
      setTranscript(updatedProject.transcript);
      setShowEn(true);
      setShowKo(true);
      setShowGrammar(true);
      setView("study");
    }
    
    return updatedProject;
  };

  const deleteProject = (id: string) => {
    const updated = projects.filter((p) => p.id !== id);
    saveProjectsToStorage(updated);
  };

  const autoFormatTranscript = () => {
    if (!unifiedInput.trim()) return;

    let formatted = preprocessSrt(unifiedInput);

    // Remove YouTube UI artifacts (e.g., [Music], [Laughter]) if requested, or just clean noise
    formatted = formatted.replace(/\[(Music|Laughter|Applause|Music)\]/gi, "");

    // 2. Pattern for raw YouTube copy (Timecode and Text usually separated by newlines)
    const lines = formatted
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l);
    const resultLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const nextLine = lines[i + 1] || "";

      // Time format: 0:00 or 12:34 or 1:23:45
      const isTime = /^(\d{1,2}:)?\d{1,2}:\d{2}$/.test(line);

      if (isTime && nextLine && !/^(\d{1,2}:)?\d{1,2}:\d{2}$/.test(nextLine)) {
        resultLines.push(`(${line}) ${nextLine}`);
        i++; // skip next line because we consumed it
      } else if (line.match(/^\(\d{1,2}:\d{2}\)/)) {
        // Already formatted: (0:00) Text
        resultLines.push(line);
      } else if (line.match(/^(\d{1,2}:\d{2}) /)) {
        // Space formatted: 0:00 Text -> (0:00) Text
        resultLines.push(line.replace(/^(\d{1,2}:\d{2})/, "($1)"));
      } else {
        resultLines.push(line);
      }
    }

    setUnifiedInput(resultLines.join("\n"));
  };

  const refineTranscriptWithAI = async () => {
    if (!unifiedInput.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const prompt = `${refinementPrompt}\n${unifiedInput}`;
      const responseText = await generateAIContent(prompt);

      if (responseText) {
        const response = { text: responseText };
        setUnifiedInput(response.text);
      } else {
        throw new Error("AI가 응답을 생성하지 못했습니다.");
      }
    } catch (err: any) {
      console.error("AI Refinement Error:", err);
      if (err.message && err.message.includes("429")) {
        setError("API 사용량 초과. 잠시 후 다시 시도해주세요.");
      } else {
        setError(
          "AI 정제 중 오류가 발생했습니다: " +
            (err.message || "알 수 없는 오류"),
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const adjustNextTimestamp = useCallback(
    (delta: number) => {
      const nextIndex = currentIndex + 1;
      if (nextIndex >= transcript.length) return;

      const updatedTranscript = [...transcript];
      // Ensure next offset doesn't go before current offset
      updatedTranscript[nextIndex].offset = Math.max(
        updatedTranscript[currentIndex].offset + 0.1,
        updatedTranscript[nextIndex].offset + delta,
      );

      // Recalculate durations
      for (let i = 0; i < updatedTranscript.length; i++) {
        const nextOffset =
          updatedTranscript[i + 1]?.offset || updatedTranscript[i].offset + 5;
        updatedTranscript[i].duration = Math.max(
          0.1,
          nextOffset - updatedTranscript[i].offset,
        );
      }

      setTranscript(updatedTranscript);

      // Update current project if it exists
      if (currentProject) {
        const updatedProject = {
          ...currentProject,
          transcript: updatedTranscript,
        };
        setCurrentProject(updatedProject);
        const updatedProjects = projects.map((p) =>
          p.id === updatedProject.id ? updatedProject : p,
        );
        saveProjectsToStorage(updatedProjects);
        setUnifiedInput(formatTranscriptToUnified(updatedProject));
      }
    },
    [currentIndex, transcript, currentProject, projects],
  );

  // Initialize Player when videoId is set
  useEffect(() => {
    let timeoutId: number;
    let checkYtTimeoutId: number;

    if (videoId) {
      setIsPlayerReady(false);

      const checkYtAndInit = () => {
        if (window.YT && window.YT.Player) {
          initPlayer();
        } else {
          console.log("Waiting for YouTube API...");
          checkYtTimeoutId = window.setTimeout(checkYtAndInit, 500);
        }
      };

      const initPlayer = () => {
        const container = document.getElementById("youtube-container");
        if (!container) {
          console.log("No container 'youtube-container' found, retrying...");
          timeoutId = window.setTimeout(initPlayer, 300);
          return;
        }

        if (
          playerRef.current &&
          typeof playerRef.current.destroy === "function"
        ) {
          try {
            playerRef.current.destroy();
            playerRef.current = null;
          } catch (e) {
            console.warn("Player destroy failed", e);
          }
        }

        container.innerHTML =
          '<div id="youtube-player" style="width: 100%; height: 100%;"></div>';

        try {
          console.log("Initializing YT Player for:", videoId);
          playerRef.current = new window.YT.Player("youtube-player", {
            width: "100%",
            height: "100%",
            videoId: videoId,
            playerVars: {
              autoplay: 0,
              controls: 1,
              modestbranding: 1,
              rel: 0,
              showinfo: 0,
              iv_load_policy: 3,
              start: Math.floor(transcript[currentIndex]?.offset || 0),
              enablejsapi: 1,
              playsinline: 1,
            },
            events: {
              onReady: (event: any) => {
                setIsPlayerReady(true);
                try {
                  if (typeof event.target.setPlaybackQuality === "function") {
                    event.target.setPlaybackQuality("large");
                  }
                } catch (e) {
                  console.warn("Failed to set quality", e);
                }

                // Seek to initial offset and explicitly pause to prevent autoplay
                event.target.seekTo(
                  transcript[currentIndex]?.offset || 0,
                  true,
                );
                event.target.pauseVideo();
                setIsPlaying(false);
                console.log("Player Ready & Primed");
              },
              onStateChange: (event: any) => {
                setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
              },
              onError: (e: any) => {
                console.error("YT Player Error:", e.data);
              },
            },
          });
        } catch (e) {
          console.error("Error creating YT Player", e);
          // Retry if it failed for some transient reason
          timeoutId = window.setTimeout(initPlayer, 1000);
        }
      };

      checkYtAndInit();
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (checkYtTimeoutId) clearTimeout(checkYtTimeoutId);
    };
  }, [videoId]);

  // Sync playbackRate with YouTube Player
  useEffect(() => {
    if (
      playerRef.current &&
      typeof playerRef.current.setPlaybackRate === "function"
    ) {
      playerRef.current.setPlaybackRate(playbackRate);
    }
  }, [playbackRate]);

  useEffect(() => {
    if (isPlaying && transcript.length > 0 && !isSubtitleOnly) {
      lastVirtualTimeUpdateRef.current = Date.now();
      isTransitioningRef.current = false; // Reset on start

      checkIntervalRef.current = window.setInterval(() => {
        // Lockdown: Do not perform any auto-pause/sync logic while recording, reviewing voice, or just after resuming
        if (
          isRecordingRef.current ||
          isPlayingRecordedRef.current ||
          isResumingAfterRecordRef.current
        )
          return;

        let currentTime = 0;

        if (currentProject?.isVideoLocal) {
          if (!videoRef.current) return;
          currentTime = videoRef.current.currentTime;
        } else {
          if (!playerRef.current) return;
          currentTime = playerRef.current.getCurrentTime();
        }

        // Custom A-B Loop / Expansion Loop Logic
        if (customLoopRef.current) {
          const loop = customLoopRef.current;
          if (currentTime >= loop.end - 0.05) {
            if (currentProject?.isVideoLocal && videoRef.current) {
              videoRef.current.currentTime = loop.start;
            } else if (playerRef.current) {
              expectedSeekTargetRef.current = { time: loop.start, timestamp: Date.now() };
              playerRef.current.seekTo(loop.start, true);
            }
            return; // Prevent End of Sentence logic
          }
        } else if (isExpansionMode) {
          const currentSentenceStart = transcript[currentIndex]?.offset || 0;
          if (!isExpansionPaused && expansionCurrentEnd !== null) {
            if (currentTime >= expansionCurrentEnd - 0.05) {
              if (isTransitioningRef.current) return;
              isTransitioningRef.current = true;

              let waitTime = 0;
              if (delayMode === 2) {
                waitTime = Math.max(0, (expansionCurrentEnd - currentSentenceStart) * 1000);
                waitTime += (delayDuration > 0 ? delayDuration * 1000 : 0);
              } else if (delayMode === 1 && delayDuration > 0) {
                waitTime = delayDuration * 1000;
              }

              // Apply playback rate to wait time
              if (waitTime > 0 && playbackRate > 0) {
                waitTime = waitTime / playbackRate;
              }

              if (waitTime > 0) {
                if (currentProject?.isVideoLocal && videoRef.current) {
                  videoRef.current.pause();
                } else if (playerRef.current) {
                  playerRef.current.pauseVideo();
                }
              }

              transitionTimeoutRef.current = window.setTimeout(() => {
                isTransitioningRef.current = false;
                if (!isExpansionPaused && isExpansionMode) {
                  if (currentProject?.isVideoLocal && videoRef.current) {
                    videoRef.current.currentTime = currentSentenceStart;
                    if (waitTime > 0) videoRef.current.play().catch(() => {});
                  } else if (playerRef.current) {
                    expectedSeekTargetRef.current = { time: currentSentenceStart, timestamp: Date.now() };
                    playerRef.current.seekTo(currentSentenceStart, true);
                    if (waitTime > 0) playerRef.current.playVideo();
                  }
                }
              }, waitTime > 0 ? waitTime : 10);

              return; // Prevent End of Sentence logic
            }
          }
        }

        // If Video Only mode, just play smoothly and only sync the subtitle index
        if (isVideoOnly) {
          const matchingIndex = transcript.findIndex((s, i) => {
            const nextOffset =
              transcript[i + 1]?.offset || s.offset + s.duration + 5;
            return currentTime >= s.offset && currentTime < nextOffset;
          });
          if (matchingIndex !== -1 && matchingIndex !== currentIndex) {
            setCurrentIndex(matchingIndex);
          }
          return; // Do nothing else!
        }

        const currentSentence = transcript[currentIndex];

        if (currentSentence) {
          const endTime = currentSentence.offset + currentSentence.duration;

          // 1. Emergency Sync: If currentTime is off the current sentence, find the correct one
          if (!isSubtitleOnly) {
            if (expectedSeekTargetRef.current) {
              const { time, timestamp } = expectedSeekTargetRef.current;
              if (Date.now() - timestamp < 4000) {
                if (Math.abs(currentTime - time) > 1.0) {
                  return; // Player hasn't caught up, ignore stale time
                } else {
                  expectedSeekTargetRef.current = null;
                }
              } else {
                expectedSeekTargetRef.current = null;
              }
            }

            const isWayOff =
              currentTime < currentSentence.offset - 0.5 ||
              currentTime > endTime + 0.5;
            if (isWayOff && !isTransitioningRef.current) {
              const matchingIndex = transcript.findIndex((s, i) => {
                const nextOffset =
                  transcript[i + 1]?.offset || s.offset + s.duration + 1;
                return currentTime >= s.offset && currentTime < nextOffset;
              });
              if (matchingIndex !== -1 && matchingIndex !== currentIndex) {
                setCurrentIndex(matchingIndex);
                setLoopCount(0);
                return;
              }
            }
          }

          // 2. Handle End of Sentence (Auto-Pause or Looping)
          if (currentTime >= endTime - 0.1 && currentTime <= endTime + 0.5) {
            if (isTransitioningRef.current) return;
            isTransitioningRef.current = true;

            const isLastLoop =
              isVideoOnly ||
              loopMode === 0 ||
              (loopMode === 1 && loopCount >= maxLoops - 1);
            let waitTime = 0;
            if (!isVideoOnly) {
              if (delayMode === 2) {
                const currentSentence = transcript[currentIndex];
                const nextSentence = transcript[currentIndex + 1];
                let baseWait = 0;
                if (currentSentence && nextSentence) {
                  baseWait = Math.max(
                    0,
                    (nextSentence.offset - currentSentence.offset) * 1000,
                  );
                } else if (currentSentence) {
                  baseWait = currentSentence.duration * 1000;
                }
                waitTime =
                  baseWait + (delayDuration > 0 ? delayDuration * 1000 : 0);
              } else if (delayMode === 1 && delayDuration > 0) {
                waitTime = delayDuration * 1000;
              }
            }

            const performTransition = () => {
              if (isLastLoop) {
                // End of loops or Looping is OFF
                setLoopCount(0);

                if (isAutoPause && !isVideoOnly) {
                  // Pause and move to next
                  setIsPlaying(false);
                  if (!isSubtitleOnly) {
                    if (currentProject?.isVideoLocal) {
                      videoRef.current?.pause();
                    } else if (playerRef.current) {
                      playerRef.current.pauseVideo();
                    }
                  }

                  if (currentIndex < transcript.length - 1) {
                    const nextIdx = currentIndex + 1;
                    setCurrentIndex(nextIdx);
                    if (isSubtitleOnly) {
                      virtualTimeRef.current = transcript[nextIdx].offset;
                    } else if (currentProject?.isVideoLocal) {
                      if (videoRef.current)
                        videoRef.current.currentTime =
                          transcript[nextIdx].offset;
                    } else if (playerRef.current) {
                      expectedSeekTargetRef.current = { time: transcript[nextIdx].offset, timestamp: Date.now() };
                      playerRef.current.seekTo(transcript[nextIdx].offset, true);
                    }
                  }
                } else if (
                  isAutoAdvanceLoop ||
                  (isContinuous && loopMode === 0)
                ) {
                  // Move to next
                  if (currentIndex < transcript.length - 1) {
                    const nextIdx = currentIndex + 1;
                    setCurrentIndex(nextIdx);
                    if (isSubtitleOnly) {
                      virtualTimeRef.current = transcript[nextIdx].offset;
                      lastVirtualTimeUpdateRef.current = Date.now();
                    } else if (currentProject?.isVideoLocal) {
                      if (videoRef.current) {
                        videoRef.current.currentTime =
                          transcript[nextIdx].offset;
                        videoRef.current.play();
                      }
                    } else if (playerRef.current) {
                      expectedSeekTargetRef.current = { time: transcript[nextIdx].offset, timestamp: Date.now() };
                      playerRef.current.seekTo(transcript[nextIdx].offset, true);
                      playerRef.current.playVideo();
                    }
                  } else if (isContinuous) {
                    // Restart
                    setCurrentIndex(0);
                    if (isSubtitleOnly) {
                      virtualTimeRef.current = transcript[0].offset;
                      lastVirtualTimeUpdateRef.current = Date.now();
                    } else if (currentProject?.isVideoLocal) {
                      if (videoRef.current) {
                        videoRef.current.currentTime = transcript[0].offset;
                        videoRef.current.play();
                      }
                    } else if (playerRef.current) {
                      expectedSeekTargetRef.current = { time: transcript[0].offset, timestamp: Date.now() };
                      playerRef.current.seekTo(transcript[0].offset, true);
                      playerRef.current.playVideo();
                    }
                  } else {
                    setIsPlaying(false);
                    if (!isSubtitleOnly) {
                      if (currentProject?.isVideoLocal) {
                        videoRef.current?.pause();
                      } else if (playerRef.current) {
                        playerRef.current.pauseVideo();
                      }
                    }
                  }
                } else {
                  // Just stop
                  setIsPlaying(false);
                  if (!isSubtitleOnly) {
                    if (currentProject?.isVideoLocal) {
                      videoRef.current?.pause();
                    } else if (playerRef.current) {
                      playerRef.current.pauseVideo();
                    }
                  }
                }
              } else {
                // Continue looping
                setLoopCount((prev) => prev + 1);
                if (isSubtitleOnly) {
                  virtualTimeRef.current = currentSentence.offset;
                  lastVirtualTimeUpdateRef.current = Date.now();
                } else if (currentProject?.isVideoLocal) {
                  if (videoRef.current) {
                    videoRef.current.currentTime = currentSentence.offset;
                    videoRef.current.play();
                  }
                } else if (playerRef.current) {
                  expectedSeekTargetRef.current = { time: currentSentence.offset, timestamp: Date.now() };
                  playerRef.current.seekTo(currentSentence.offset, true);
                  playerRef.current.playVideo();
                }
              }
              isTransitioningRef.current = false;
            };

            if (waitTime > 0) {
              if (!isSubtitleOnly) {
                if (currentProject?.isVideoLocal) {
                  videoRef.current?.pause();
                } else if (playerRef.current) {
                  playerRef.current.pauseVideo();
                }
              }
              // Track this timeout to prevent it from outliving its context (Timer Zombie fix)
              if (transitionTimeoutRef.current)
                clearTimeout(transitionTimeoutRef.current);
              transitionTimeoutRef.current = setTimeout(() => {
                performTransition();
                transitionTimeoutRef.current = null;
              }, waitTime);
            } else {
              performTransition();
            }
            return;
          }

          // 3. Continuous Sync: If not looping/pausing, ensure currentIndex matches currentTime
          if (loopMode === 0 && !isAutoPause) {
            // Check for end of video to restart if continuous is ON
            if (
              isContinuous &&
              currentIndex === transcript.length - 1 &&
              currentTime >= endTime - 0.1
            ) {
              setCurrentIndex(0);
              if (isSubtitleOnly) {
                virtualTimeRef.current = transcript[0].offset;
              } else if (currentProject?.isVideoLocal) {
                if (videoRef.current)
                  videoRef.current.currentTime = transcript[0].offset;
              } else {
                expectedSeekTargetRef.current = { time: transcript[0].offset, timestamp: Date.now() };
                playerRef.current.seekTo(transcript[0].offset, true);
              }
              return;
            }

            const matchingIndex = transcript.findIndex((s, i) => {
              const nextOffset =
                transcript[i + 1]?.offset || s.offset + s.duration + 1;
              return currentTime >= s.offset && currentTime < nextOffset;
            });

            if (matchingIndex !== -1 && matchingIndex !== currentIndex) {
              setCurrentIndex(matchingIndex);
            }
          }
        }
      }, 100);
    } else {
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    }
    return () => {
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    };
  }, [
    isPlaying,
    currentIndex,
    transcript,
    loopMode,
    isAutoPause,
    loopCount,
    maxLoops,
    isSubtitleOnly,
    playbackRate,
    delayDuration,
    delayMode,
    isContinuous,
    isAutoAdvanceLoop,
    isExpansionMode,
    isExpansionPaused,
    expansionCurrentEnd,
  ]);

  const playSentence = useCallback(
    (index: number) => {
      // Kill any pending transition timeouts (Timer Zombie prevention)
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
        transitionTimeoutRef.current = null;
      }

      // Atomic Resume Guard: Block sync loop from overriding user intent immediately
      if (resumeGuardTimerRef.current) {
        clearTimeout(resumeGuardTimerRef.current);
      }
      isResumingAfterRecordRef.current = true;
      resumeGuardTimerRef.current = setTimeout(() => {
        isResumingAfterRecordRef.current = false;
        resumeGuardTimerRef.current = null;
      }, 1500);

      isTransitioningRef.current = false;

      if (transcript[index]) {
        expectedSeekTargetRef.current = { time: transcript[index].offset, timestamp: Date.now() };
        if (isSubtitleOnly) {
          // Just move the index, no playback
          setCurrentIndex(index);
          setIsPlaying(false);
        } else if (currentProject?.isVideoLocal) {
          if (videoRef.current) {
            videoRef.current.currentTime = transcript[index].offset;
            videoRef.current.play();
          }
          setCurrentIndex(index);
          setLoopCount(0);
        } else if (playerRef.current) {
          expectedSeekTargetRef.current = { time: transcript[index].offset, timestamp: Date.now() };
          playerRef.current.seekTo(transcript[index].offset, true);
          playerRef.current.playVideo();
          setCurrentIndex(index);
          setLoopCount(0); // Reset loop count for new sentence
        }
      }
    },
    [transcript, isSubtitleOnly, currentProject],
  );

  const nextSentence = useCallback(() => {
    if (isSubtitleOnly) {
      if (currentIndex < transcript.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else if (isContinuous) {
        setCurrentIndex(0);
      }
      return;
    }
    if (currentIndex < transcript.length - 1) {
      playSentence(currentIndex + 1);
    } else if (isContinuous) {
      playSentence(0);
    }
  }, [currentIndex, transcript, isContinuous, playSentence, isSubtitleOnly]);

  const prevSentence = useCallback(() => {
    if (isSubtitleOnly) {
      if (currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
      return;
    }
    if (currentIndex > 0) {
      playSentence(currentIndex - 1);
    }
  }, [currentIndex, playSentence, isSubtitleOnly]);

  const togglePlay = useCallback(() => {
    if (isSubtitleOnly) {
      // In subtitle only mode, playback is disabled (Static Reading Mode)
      return;
    }

    // Kill any pending transition timeouts (Timer Zombie prevention)
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }

    // Smart Start/Resume Logic: If near end of sentence, restart from start
    let startTime = 0;
    let endTime = 0;
    const currentSentence = transcript[currentIndex];
    if (currentSentence) {
      startTime = currentSentence.offset;
      endTime = currentSentence.offset + currentSentence.duration;
    }

    if (currentProject?.isVideoLocal) {
      if (videoRef.current) {
        if (videoRef.current.paused) {
          // Guard resume to prevent immediate re-pause
          isResumingAfterRecordRef.current = true;
          setTimeout(() => {
            isResumingAfterRecordRef.current = false;
          }, 1500);

          if (videoRef.current.currentTime > endTime - 0.5) {
            videoRef.current.currentTime = startTime;
          }
          videoRef.current.play();
        } else {
          videoRef.current.pause();
          setIsPlaying(false);
        }
      }
      return;
    }

    if (!playerRef.current || !isPlayerReady) return;

    try {
      const state = playerRef.current.getPlayerState();
      if (state === window.YT.PlayerState.PLAYING) {
        playerRef.current.pauseVideo();
        // Do not manual setIsPlaying(false) here, let onStateChange handle it
      } else {
        // Guard resume to prevent immediate re-pause
        isResumingAfterRecordRef.current = true;
        setTimeout(() => {
          isResumingAfterRecordRef.current = false;
        }, 1500);

        const currentT = playerRef.current.getCurrentTime();
        if (currentT > endTime - 0.5) {
          expectedSeekTargetRef.current = { time: startTime, timestamp: Date.now() };
          playerRef.current.seekTo(startTime, true);
        }
        playerRef.current.playVideo();
      }
    } catch (e) {
      isResumingAfterRecordRef.current = true;
      setTimeout(() => {
        isResumingAfterRecordRef.current = false;
      }, 1500);
      playerRef.current.playVideo();
    }
  }, [
    isSubtitleOnly,
    isPlaying,
    transcript,
    currentIndex,
    isPlayerReady,
    currentProject,
  ]);

  useEffect(() => {
    const requestWakeLock = async () => {
      try {
        if ("wakeLock" in navigator) {
          if (isPlaying && !wakeLockRef.current) {
            wakeLockRef.current = await navigator.wakeLock.request("screen");
            wakeLockRef.current.addEventListener("release", () => {
              wakeLockRef.current = null;
            });
          } else if (!isPlaying && wakeLockRef.current) {
            await wakeLockRef.current.release();
            wakeLockRef.current = null;
          }
        }
      } catch (err) {
        console.warn("Wake Lock error:", err);
      }
    };

    requestWakeLock();

    // Automatically re-request if page becomes visible and playing
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && isPlaying) {
        requestWakeLock();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isPlaying]);

  const changePlaybackRate = () => {
    const rates = [0.75, 1, 1.25];
    const nextRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
    setPlaybackRate(nextRate);
    if (currentProject?.isVideoLocal) {
      if (videoRef.current) videoRef.current.playbackRate = nextRate;
    } else {
      playerRef.current?.setPlaybackRate(nextRate);
    }
  };

  const pokeMedia = () => {
    // 1. YouTube Poke: Essential for iOS to allow programmatic playVideo() later
    if (playerRef.current && (window as any).YT) {
      playerRef.current.playVideo();
      // Wait long enough for iOS it signal activation, then pause
      setTimeout(() => {
        playerRef.current?.pauseVideo();
      }, 200);
    }

    // 2. Local Video Poke: Using Promise-based play() for deterministic pause
    if (videoRef.current) {
      videoRef.current
        .play()
        .then(() => {
          videoRef.current?.pause();
        })
        .catch(() => {
          // Silently catch gesture rejection if triggered via non-trusted event
        });
    }
  };

  const startSeekStep = useCallback(
    (offsetSeconds: number) => {
      // Kill any pending transition timeouts (Timer Zombie prevention)
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
        transitionTimeoutRef.current = null;
      }

      // Atomic Resume Guard: Clear previous guard timer and set a fresh one
      if (resumeGuardTimerRef.current) {
        clearTimeout(resumeGuardTimerRef.current);
      }
      isResumingAfterRecordRef.current = true;
      resumeGuardTimerRef.current = setTimeout(() => {
        isResumingAfterRecordRef.current = false;
        resumeGuardTimerRef.current = null;
      }, 1500);

      isTransitioningRef.current = false;

      const minTime = (view === "study" && transcript.length > 0 && currentIndex < transcript.length)
        ? transcript[currentIndex].offset
        : 0;

      // Local MP4 logic
      if (currentProject?.isVideoLocal && videoRef.current) {
        // Seek from current actual time to avoid accumulation errors
        let newTime = videoRef.current.currentTime + offsetSeconds;
        if (offsetSeconds < 0) {
          newTime = Math.max(minTime, newTime);
        } else {
          newTime = Math.max(0, newTime);
        }
        videoRef.current.currentTime = newTime;
        videoRef.current.play().catch(() => {});
        return;
      }
      // YouTube Player logic
      if (playerRef.current && isPlayerReady) {
        // Seek from current actual time to avoid accumulation errors
        let newTime = playerRef.current.getCurrentTime() + offsetSeconds;
        if (offsetSeconds < 0) {
          newTime = Math.max(minTime, newTime);
        } else {
          newTime = Math.max(0, newTime);
        }
        expectedSeekTargetRef.current = { time: newTime, timestamp: Date.now() };
        playerRef.current.seekTo(newTime, true);
        playerRef.current.playVideo();
      }
    },
    [isPlayerReady, currentProject, view, transcript, currentIndex],
  );

  const handleSeekPointerDown = useCallback(
    (offsetSeconds: number) => {
      // Immediate first step
      startSeekStep(offsetSeconds);

      // After 400ms, start repeating
      seekLoopRef.current = setTimeout(() => {
        seekLoopRef.current = setInterval(
          () => {
            startSeekStep(offsetSeconds);
          },
          200, // fixed fast scrub interval
        );
      }, 400);
    },
    [startSeekStep, seekBackDuration],
  );

  const stopSeekLoop = useCallback(() => {
    if (seekLoopRef.current) {
      clearTimeout(seekLoopRef.current);
      clearInterval(seekLoopRef.current);
      seekLoopRef.current = null;
    }
  }, []);

  const toggleCustomLoop = useCallback(() => {
    if (customLoopRef.current) {
      customLoopRef.current = null;
      setIsCustomLoopActive(false);
    } else {
      let currentTime = 0;
      if (currentProject?.isVideoLocal && videoRef.current) {
        currentTime = videoRef.current.currentTime;
      } else if (playerRef.current) {
        currentTime = playerRef.current.getCurrentTime();
      }

      const currentSentenceStart =
        view === "study" && transcript.length > 0 && currentIndex < transcript.length
          ? transcript[currentIndex].offset
          : 0;

      const start = Math.max(currentSentenceStart, currentTime - seekBackDuration);
      customLoopRef.current = { start, end: currentTime };
      setIsCustomLoopActive(true);

      if (currentProject?.isVideoLocal && videoRef.current) {
        videoRef.current.currentTime = start;
        videoRef.current.play().catch(() => {});
      } else if (playerRef.current) {
        expectedSeekTargetRef.current = { time: start, timestamp: Date.now() };
        playerRef.current.seekTo(start, true);
        playerRef.current.playVideo();
      }
    }
  }, [seekBackDuration, currentProject, view, transcript, currentIndex]);

  const toggleSubtitleOnly = useCallback(() => {
    setIsSubtitleOnly((prevSub) => {
      const nextState = !prevSub;
      if (nextState) {
        setIsVideoOnly(false);
        setIsPlaying(false);
        if (currentProject?.isVideoLocal) videoRef.current?.pause();
        else playerRef.current?.pauseVideo();
      }
      return nextState;
    });
  }, [currentProject]);

  const toggleVideoOnly = useCallback(() => {
    setIsVideoOnly((prevVid) => {
      const nextState = !prevVid;
      if (nextState) {
        setIsSubtitleOnly(false);
      }
      return nextState;
    });
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleSyncAction = (key: string) => {
      switch (key) {
        case "ArrowUp":
          adjustNextTimestamp(0.1);
          break;
        case "ArrowDown":
          adjustNextTimestamp(-0.1);
          break;
        case "ArrowRight":
          adjustNextTimestamp(0.5);
          break;
        case "ArrowLeft":
          adjustNextTimestamp(-0.5);
          break;
      }
    };

    const stopRepeat = () => {
      if (keyRepeatDelayRef.current) clearTimeout(keyRepeatDelayRef.current);
      if (keyRepeatTimerRef.current) clearInterval(keyRepeatTimerRef.current);
      keyRepeatDelayRef.current = null;
      keyRepeatTimerRef.current = null;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      const active = document.activeElement;
      const isTyping =
        active?.tagName === "INPUT" ||
        active?.tagName === "TEXTAREA" ||
        (active as HTMLElement)?.isContentEditable;

      if (isTyping) return;

      // Only handle shortcuts in study view
      if (view !== "study") return;

      // Up/Down Arrow Seek
      if (!e.altKey && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
        e.preventDefault();
        const delta =
          e.key === "ArrowDown" ? seekBackDuration : -seekBackDuration;
        startSeekStep(delta);
        return;
      }

      const isOptionAction = e.altKey;

      if (isOptionAction) {
        if (
          ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)
        ) {
          e.preventDefault();

          // If this key is already active, ignore the repeat event from OS
          if (activeKeysRef.current.has(e.key)) return;

          activeKeysRef.current.add(e.key);

          // Initial Action
          handleSyncAction(e.key);

          // Setup Repeat logic: 300ms initial delay, then 200ms repetition
          stopRepeat();
          keyRepeatDelayRef.current = setTimeout(() => {
            keyRepeatTimerRef.current = setInterval(() => {
              handleSyncAction(e.key);
            }, 200);
          }, 300);
        }
        return;
      }

      switch (e.key) {
        case "Shift":
          e.preventDefault();
          setIsPlaying(false);
          if (currentProject?.isVideoLocal && videoRef.current) {
            videoRef.current.pause();
          } else if (playerRef.current && typeof playerRef.current.pauseVideo === "function") {
            playerRef.current.pauseVideo();
          }
          break;
        case " ":
          e.preventDefault(); // Prevent scroll
          togglePlay();
          break;
        case "ArrowLeft":
          e.preventDefault();
          prevSentence();
          break;
        case "ArrowRight":
          e.preventDefault();
          nextSentence();
          break;
        case "q":
        case "Q":
        case "ㅂ":
        case "ㅃ":
          e.preventDefault();
          cyclePlaybackStage();
          break;
        case "w":
        case "W":
        case "ㅈ":
        case "ㅉ":
          e.preventDefault();
          setDelayMode((prev) => ((prev + 1) % 3) as 0 | 1 | 2);
          break;
        case "p":
        case "P":
        case "ㅔ":
        case "ㅖ":
          e.preventDefault();
          setIsAutoPause((prev) => !prev);
          break;
        case "a":
        case "A":
        case "ㅁ":
          e.preventDefault();
          setShowGeminiHelper((prev) => !prev);
          break;
        case "g":
        case "G":
        case "ㅎ":
          e.preventDefault();
          setShowGrammar((prev) => !prev);
          break;
        case "e":
        case "E":
        case "ㄷ":
        case "ㄸ":
          e.preventDefault();
          setShowEn((prev) => !prev);
          break;
        case "k":
        case "K":
        case "ㅏ":
          e.preventDefault();
          setShowKo((prev) => !prev);
          break;
        case "c":
        case "C":
        case "ㅊ":
          e.preventDefault();
          const currentText = transcript[currentIndex]?.text;
          if (currentText) {
            navigator.clipboard.writeText(currentText);
          }
          break;
        case "r":
        case "R":
        case "ㄱ":
        case "ㄲ":
          e.preventDefault();
          setIsContinuous((prev) => !prev);
          break;
        case "{":
          e.preventDefault();
          setSplitRatio((prev) => Math.max(20, prev - 5));
          break;
        case "}":
          e.preventDefault();
          setSplitRatio((prev) => Math.min(80, prev + 5));
          break;
        case "<":
        case ",":
          e.preventDefault();
          if (e.shiftKey || isExpansionMode) {
            expandPrev();
          } else {
            setDelayDuration((prev) => Math.max(0, Number((prev - 0.1).toFixed(1))));
          }
          break;
        case ">":
        case ".":
          e.preventDefault();
          if (e.shiftKey || isExpansionMode) {
            expandNext();
          } else {
            setDelayDuration((prev) => Math.min(5, Number((prev + 0.1).toFixed(1))));
          }
          break;
        case "/":
          e.preventDefault();
          resetExpansion();
          break;
        case "l":
        case "L":
        case "ㅣ":
          e.preventDefault();
          setLoopMode((prev) => {
            const next = (prev === 0 ? 2 : prev - 1) as 0 | 1 | 2;
            if (next === 1 && maxLoops === 0) {
              setMaxLoops(5);
            }
            setLoopCount(0);
            return next;
          });
          break;
        case "x":
        case "X":
        case "ㅌ":
          e.preventDefault();
          toggleCustomLoop();
          break;
        case "s":
        case "S":
        case "ㄴ":
          e.preventDefault();
          setShowSettings((prev) => !prev);
          break;
        case "v":
        case "V":
        case "ㅍ":
          e.preventDefault();
          // Immediate pause and Poke before logic
          if (playerRef.current) {
            if (isPlaying) setWasPlayingBeforeAction(true);
            playerRef.current.pauseVideo();
          }
          if (videoRef.current) {
            if (!videoRef.current.paused) setWasPlayingBeforeAction(true);
            videoRef.current.pause();
          }
          // Do not setIsPlaying(false) here, let player listeners handle it
          pokeMedia();

          if (decodedBufferRef.current) {
            playBuffer(decodedBufferRef.current);
          }
          break;
        case "b":
        case "B":
        case "ㅠ":
          e.preventDefault();
          // Immediate pause and Poke before logic
          if (playerRef.current) {
            if (isPlaying) setWasPlayingBeforeAction(true);
            playerRef.current.pauseVideo();
          }
          if (videoRef.current) {
            if (!videoRef.current.paused) setWasPlayingBeforeAction(true);
            videoRef.current.pause();
          }
          // Do not setIsPlaying(false) here, let player listeners handle it
          pokeMedia();

          if (!isRecording && streamRef.current) {
            // Simulate a pointer event for compatibility with existing logic
            handlePTTStart({
              stopPropagation: () => {},
              preventDefault: () => {},
            } as any);
          }
          break;
        case "n":
        case "N":
        case "ㅜ":
          e.preventDefault();
          if (isRecording) {
            handlePTTEnd({
              stopPropagation: () => {},
              preventDefault: () => {},
            } as any);
          }
          break;
        case "\\":
        case "|":
          e.preventDefault();
          setShowRecordingPanel((prev) => !prev);
          setShowSyncControls(false); // Hide sync if recording panel is toggled
          break;
        case "=":
          e.preventDefault();
          setPlaybackRate((prev) =>
            Math.min(2.0, Number((prev + 0.1).toFixed(1))),
          );
          break;
        case "-":
          e.preventDefault();
          setPlaybackRate((prev) =>
            Math.max(0.5, Number((prev - 0.1).toFixed(1))),
          );
          break;
        case "+":
          e.preventDefault();
          setVideoScale((prev) => Math.min(5, prev + 1));
          break;
        case "_":
          e.preventDefault();
          setVideoScale((prev) => Math.max(0, prev - 1));
          break;
        case "[":
          e.preventDefault();
          setMaxLoops((prev) => {
            const next = Math.max(0, prev - 1);
            if (next === 0) setLoopMode(0);
            return next;
          });
          break;
        case "]":
          e.preventDefault();
          setMaxLoops((prev) => {
            const next = Math.min(20, prev + 1);
            if (prev === 0 && next > 0) setLoopMode(1);
            return next;
          });
          break;
        case ";":
          e.preventDefault();
          setFontSize((prev) => Math.max(1, prev - 1));
          break;
        case "'":
          e.preventDefault();
          setFontSize((prev) => Math.min(7, prev + 1));
          break;
        case ":":
          e.preventDefault();
          setKrFontSize((prev) => Math.max(1, prev - 1));
          break;
        case '"':
          e.preventDefault();
          setKrFontSize((prev) => Math.min(7, prev + 1));
          break;

        case "z":
        case "Z":
        case "ㅋ":
        case "Enter":
          e.preventDefault();
          const container = document.getElementById(
            "study-fullscreen-container",
          );
          if (!document.fullscreenElement && container) {
            container.requestFullscreen().catch(() => {});
          } else if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
          }
          break;

        case "1":
          if (isSplitStudy) {
            e.preventDefault();
            setRightView("subtitles");
          }
          break;
        case "2":
          if (isSplitStudy) {
            e.preventDefault();
            setRightView("assistant");
          }
          break;
        case "3":
          if (isSplitStudy) {
            e.preventDefault();
            setRightView("scriptEditor");
          }
          break;
        case "4":
          if (isSplitStudy) {
            e.preventDefault();
            setRightView("scriptLibrary");
          }
          break;
        case "5":
          if (isSplitStudy) {
            e.preventDefault();
            setRightView("settings");
          }
          break;
        case "7":
          if (isSplitStudy && transcript.length > 0) {
            e.preventDefault();
            printSubtitles(
              transcript,
              "en",
              currentProject?.title || "Subtitles",
            );
          }
          break;
        case "8":
          if (isSplitStudy && transcript.length > 0) {
            e.preventDefault();
            printSubtitles(
              transcript,
              "all",
              currentProject?.title || "Subtitles",
            );
          }
          break;
        case "f":
        case "F":
        case "ㄹ":
          e.preventDefault();
          toggleVideoOnly();
          break;
        case "t":
        case "T":
        case "ㅅ":
        case "ㅆ":
          e.preventDefault();
          toggleSubtitleOnly();
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (activeKeysRef.current.has(e.key)) {
        activeKeysRef.current.delete(e.key);
        // If the current repeating key is released, stop everything
        stopRepeat();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    // Cleanup if Option key is released or window loses focus
    const handleBlur = () => {
      activeKeysRef.current.clear();
      stopRepeat();
    };
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
      stopRepeat();
    };
  }, [
    view,
    togglePlay,
    prevSentence,
    nextSentence,
    playSentence,
    currentIndex,
    adjustNextTimestamp,
    transcript,
    maxLoops,
    seekBackDuration,
    startSeekStep,
    videoScale,
    setVideoScale,
    toggleVideoOnly,
    toggleSubtitleOnly,
    toggleCustomLoop,
    isSplitStudy,
    setRightView,
    currentProject,
    cyclePlaybackStage,
  ]);

  const geminiLogRef = useRef<HTMLDivElement>(null);
  const accumulatedPan = useRef(0);

  useEffect(() => {
    if (geminiLogRef.current) {
      geminiLogRef.current.scrollTop = 0;
    }
  }, [geminiResponse]);

  useEffect(() => {
    if (geminiLogRef.current && isGeminiLoading) {
      geminiLogRef.current.scrollTop = geminiLogRef.current.scrollHeight;
    }
  }, [isGeminiLoading]);

  const askGemini = async (overrideQuery?: string) => {
    // Determine target query
    let queryToUse = "";
    if (
      overrideQuery &&
      overrideQuery !== "ㅡ" &&
      overrideQuery.toLowerCase() !== "m"
    ) {
      queryToUse = overrideQuery;
    } else if (
      geminiQuery.trim() &&
      geminiQuery.trim() !== "ㅡ" &&
      geminiQuery.trim().toLowerCase() !== "m"
    ) {
      queryToUse = geminiQuery.trim();
    } else if (selectedWords.length > 0) {
      queryToUse = selectedWords.join(" ");
    }

    // Treat as direct full sentence analysis if no specific query was entered,
    // or if the explicit shortcut 'ㅡ' or 'm' was used
    const isDirectAnalysis =
      !queryToUse ||
      overrideQuery === "ㅡ" ||
      overrideQuery?.toLowerCase() === "m" ||
      geminiQuery.trim() === "ㅡ" ||
      geminiQuery.trim().toLowerCase() === "m";

    const currentSentence = transcript[currentIndex]?.text || "";

    // If there is no query and no sentence to analyze, just return
    if (!queryToUse && !currentSentence) return;

    setIsGeminiLoading(true);
    setGeminiResponse("");

    // Clear state after calling
    if (!overrideQuery) {
      setGeminiQuery("");
      setSelectedWords([]);
    }

    try {
      let prompt = "";

      if (isDirectAnalysis) {
        prompt = `${analysisPromptTemplate}\n\n[Context Sentence]\n${currentSentence}`;
      } else {
        const actualQuery =
          queryToUse === selectedWords.join(" ")
            ? "Please explain the target word/phrase in this context detailedly."
            : queryToUse;

        prompt = `[Combined Instructions]
You have two sets of formatting rules below. Automatically determine if the user is asking for a deep grammatical analysis of the entire sentence (or a grammar question), OR if they are asking about the meaning of a specific word or phrase. Apply the appropriate format.

=== Rules for Full Sentence Analysis (Grammar/Nuance) ===
${analysisPromptTemplate}

=== Rules for Word/Phrase Explanation ===
${queryPromptTemplate}
===================================================

[Context Sentence]
${currentSentence}

[Target Word/Phrase]
${selectedWords.length > 0 ? selectedWords.join(" ") : "N/A"}

[User Query]
${actualQuery}`;
      }

      const resultHeader = isDirectAnalysis
        ? ""
        : `### 🔍 Analysis for: **${queryToUse}**\n\n---\n\n`;

      setGeminiResponse(resultHeader);

      const responseText = await generateAIContentStream(prompt, (chunk) => {
        setGeminiResponse(resultHeader + chunk);
      });

      if (!responseText) {
        setGeminiResponse("AI가 답변을 생성하지 못했습니다.");
      }
    } catch (err: any) {
      console.error("Gemini Helper Error Details:", err);
      let errorMsg = "오류가 발생했습니다.";
      if (err.message && err.message.includes("429")) {
        errorMsg =
          "API 사용량 초과 (429). 너무 많은 요청이 발생했습니다. 잠시 후 1~2분 뒤에 다시 시도해주세요.";
      } else if (
        err.message &&
        (err.message.includes("Forbidden") || err.message.includes("403"))
      ) {
        const _currentModel =
          aiProvider === "gemini"
            ? geminiModel
            : aiProvider === "cerebras"
              ? cerebrasModel
              : openrouterModel;
        errorMsg = `API 접근 거부 (403). 입력하신 API 키가 "${_currentModel}" 모델을 사용할 권한이 없거나 키가 올바르지 않습니다.`;
      } else if (err.message) {
        errorMsg = `오류: ${err.message}`;
      }
      setGeminiResponse(errorMsg);
    } finally {
      setIsGeminiLoading(false);
    }
  };

  const testApiKey = async () => {
    setIsGeminiLoading(true);
    try {
      const responseText = await generateAIContent(
        "Test connection. Respond with 'OK' only.",
      );
      if (responseText) {
        alert("✅ 연결 성공! API 키가 정상적으로 작동합니다.");
      }
    } catch (err: any) {
      console.error("Test Error:", err);
      alert(`❌ 연결 실패: ${err.message || "알 수 없는 오류"}`);
    } finally {
      setIsGeminiLoading(false);
    }
  };

  // Initialize microphone and AudioContext when recording panel opens
  useEffect(() => {
    if (showRecordingPanel) {
      const initMic = async () => {
        try {
          if (streamRef.current) {
            // Already initialized, just ensure it's not stopped
            return;
          }

          if (!audioCtxRef.current) {
            const AudioContextClass =
              (window as any).AudioContext ||
              (window as any).webkitAudioContext;
            audioCtxRef.current = new AudioContextClass();
          }
          if (audioCtxRef.current?.state === "suspended") {
            await audioCtxRef.current.resume();
          }

          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          streamRef.current = stream;
        } catch (err) {
          console.error("Microphone initialization failed:", err);
          alert("마이크 사용을 허용해 주세요.");
          setShowRecordingPanel(false);
        }
      };
      initMic();
    } else {
      // Release tracks (disable only to avoid iOS interruption) when panel closes
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.enabled = false;
        });
        // We do NOT set streamRef.current = null here to preserve the session
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      if (playbackSourceRef.current) {
        playbackSourceRef.current.stop();
        playbackSourceRef.current = null;
      }
      setRecordingDuration(0);
    }

    return () => {
      // Final cleanup (we can stop here as the component is unmounting)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      if (playbackSourceRef.current) {
        try {
          playbackSourceRef.current.stop();
        } catch (e) {
          // Already stopped
        }
        playbackSourceRef.current = null;
      }
    };
  }, [showRecordingPanel]);

  const handlePTTStart = async (e: React.PointerEvent | React.TouchEvent) => {
    if ((e as any).stopPropagation) (e as any).stopPropagation();
    if ((e as any).cancelable) e.preventDefault();

    // Kill any pending transition timeouts (Timer Zombie prevention)
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }

    // 0-Priority: Immediate State Capture & Poke
    if (playerRef.current) {
      if (isPlaying) setWasPlayingBeforeAction(true);
      // Synchronous pause first
      playerRef.current.pauseVideo();
      // No manual setIsPlaying(false) here
    }
    if (videoRef.current) {
      if (!videoRef.current.paused) setWasPlayingBeforeAction(true);
      videoRef.current.pause();
    }

    // Execute Poke to secure activation token (async but starts synchronously)
    pokeMedia();

    if (isRecording || !streamRef.current) return;

    // Reactivate mic tracks (they might have been disabled when panel closed)
    streamRef.current.getTracks().forEach((t) => (t.enabled = true));

    try {
      if (audioCtxRef.current?.state === "suspended")
        await audioCtxRef.current.resume();
      if (playbackSourceRef.current) {
        playbackSourceRef.current.stop();
        playbackSourceRef.current = null;
      }

      // Detection for MIME Type (iOS prefers audio/mp4)
      const supportedTypes = [
        "audio/mp4",
        "audio/webm;codecs=opus",
        "audio/webm",
      ];
      const mimeType =
        supportedTypes.find((t) => MediaRecorder.isTypeSupported(t)) ||
        "audio/mp4";

      const mediaRecorder = new MediaRecorder(streamRef.current, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const arrayBuffer = await audioBlob.arrayBuffer();

        try {
          const audioBuffer =
            await audioCtxRef.current!.decodeAudioData(arrayBuffer);
          decodedBufferRef.current = audioBuffer;
          setRecordedUrl("recorded");
          playBuffer(audioBuffer);
        } catch (err) {
          console.error("Audio decoding failed:", err);
        }
      };

      // Start Recording
      mediaRecorder.start(100); // 100ms timeslice for better iOS stability
      setIsRecording(true);

      // Timer
      setRecordingDuration(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("PTT Start Error:", err);
    }
  };

  const handlePTTEnd = (e: React.PointerEvent | React.TouchEvent) => {
    if ((e as any).stopPropagation) (e as any).stopPropagation();
    if ((e as any).cancelable) e.preventDefault();

    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      // Clean up timer
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  const playBuffer = async (buffer: AudioBuffer) => {
    if (!audioCtxRef.current) return;

    // 0-Priority: Immediate Pause (Synchronous)
    if (playerRef.current) {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
    }
    if (videoRef.current) {
      videoRef.current.pause();
    }

    // 1. Precise Invalidation: Stop existing playback WITHOUT triggering its onended
    if (playbackSourceRef.current) {
      try {
        // Crucial: Clear onended BEFORE stopping to prevent unwanted auto-resume during rapid clicks
        playbackSourceRef.current.onended = null;
        playbackSourceRef.current.stop();
      } catch (e) {
        // Source might have already stopped or not started
      }
      playbackSourceRef.current = null;
    }

    // 2. Clear existing timer
    if (playbackTimerRef.current) {
      clearInterval(playbackTimerRef.current);
      playbackTimerRef.current = null;
    }

    // 3. Ensure AudioContext is active (Mandatory for iOS)
    if (audioCtxRef.current.state === "suspended") {
      await audioCtxRef.current.resume();
    }

    const source = audioCtxRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtxRef.current.destination);
    playbackSourceRef.current = source;

    // Set initial countdown time
    const duration = Math.ceil(buffer.duration);
    setRemainingPlaybackTime(duration);

    setIsPlayingRecorded(true);
    source.start(0);

    // Start playback countdown timer
    const startTime = Date.now();
    playbackTimerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, duration - elapsed);
      setRemainingPlaybackTime(remaining);
    }, 100);

    source.onended = () => {
      setIsPlayingRecorded(false);
      playbackSourceRef.current = null;
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
        playbackTimerRef.current = null;
      }

      // Auto-Resume Video only if this specific source finished naturally
      // Activate guard IMMEDIATELY when audio ends to protect the upcoming resume
      if (wasPlayingBeforeActionRef.current) {
        isResumingAfterRecordRef.current = true;
        setTimeout(() => {
          isResumingAfterRecordRef.current = false;
        }, 1500);
      }

      setTimeout(() => {
        if (wasPlayingBeforeActionRef.current) {
          // Kill pending transitions before resuming (Timer Zombie prevention)
          if (transitionTimeoutRef.current) {
            clearTimeout(transitionTimeoutRef.current);
            transitionTimeoutRef.current = null;
          }

          let startTime = 0;
          let endTime = 0;
          const currentSentence = transcript[currentIndex];
          if (currentSentence) {
            startTime = currentSentence.offset;
            endTime = currentSentence.offset + currentSentence.duration;
          }

          if (playerRef.current) {
            // Smart Resume: If we are right at the edge of the sentence, seek back to start
            const currentT = playerRef.current.getCurrentTime();
            if (currentT > endTime - 0.5) {
              expectedSeekTargetRef.current = { time: startTime, timestamp: Date.now() };
              playerRef.current.seekTo(startTime, true);
            }
            playerRef.current.playVideo();
          }
          if (videoRef.current) {
            // Smart Resume local video
            if (videoRef.current.currentTime > endTime - 0.5) {
              videoRef.current.currentTime = startTime;
            }
            videoRef.current.play().catch(() => {});
          }
          // Reset after completion
          setWasPlayingBeforeAction(false);
        }
      }, 50);
    };
  };

  const toggleRecording = async () => {
    // Legacy support for keyboard shortcuts
    if (isRecording) {
      handlePTTEnd({ preventDefault: () => {} } as any);
    } else {
      // Ensure panel is open when recording via shortcut for visual feedback & mic sync
      if (!showRecordingPanel) {
        setShowRecordingPanel(true);
        // Small delay to allow useEffect [showRecordingPanel] to initialize mic
        setTimeout(() => {
          handlePTTStart({ preventDefault: () => {} } as any);
        }, 100);
      } else {
        handlePTTStart({ preventDefault: () => {} } as any);
      }
    }
  };

  const handlePlayStart = async (e: React.PointerEvent | React.TouchEvent) => {
    if ((e as any).stopPropagation) (e as any).stopPropagation();
    if ((e as any).cancelable) e.preventDefault();

    // Kill any pending transition timeouts (Timer Zombie prevention)
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }

    // 0-Priority: Immediate State Capture & Poke
    if (playerRef.current) {
      if (isPlaying) setWasPlayingBeforeAction(true);
      playerRef.current.pauseVideo();
      // No manual setIsPlaying(false) here
    }
    if (videoRef.current) {
      if (!videoRef.current.paused) setWasPlayingBeforeAction(true);
      videoRef.current.pause();
    }

    // Secure token for auto-resume after playback
    pokeMedia();

    if (!decodedBufferRef.current || !audioCtxRef.current) return;

    try {
      if (audioCtxRef.current.state === "suspended")
        await audioCtxRef.current.resume();
      playBuffer(decodedBufferRef.current);
    } catch (err) {
      console.error("Manual playback start error:", err);
    }
  };

  const handlePlayEnd = (e: React.PointerEvent | React.TouchEvent) => {
    if ((e as any).stopPropagation) (e as any).stopPropagation();
    if (playbackSourceRef.current) {
      try {
        playbackSourceRef.current.stop();
      } catch (err) {
        // Already stopped
      }
      playbackSourceRef.current = null;
      setIsPlayingRecorded(false);

      // Resume video if it was playing before we started recording/playing
      if (wasPlayingBeforeActionRef.current) {
        // Guard resume to prevent immediate re-pause (Method A)
        isResumingAfterRecordRef.current = true;
        setTimeout(() => {
          isResumingAfterRecordRef.current = false;
        }, 1500);

        // Kill pending transitions before resuming (Timer Zombie prevention)
        if (transitionTimeoutRef.current) {
          clearTimeout(transitionTimeoutRef.current);
          transitionTimeoutRef.current = null;
        }

        let startTime = 0;
        let endTime = 0;
        const currentSentence = transcript[currentIndex];
        if (currentSentence) {
          startTime = currentSentence.offset;
          endTime = currentSentence.offset + currentSentence.duration;
        }

        if (playerRef.current) {
          // Smart Resume: If we are right at the edge of the sentence, seek back to start
          const currentT = playerRef.current.getCurrentTime();
          if (currentT > endTime - 0.5) {
            expectedSeekTargetRef.current = { time: startTime, timestamp: Date.now() };
            playerRef.current.seekTo(startTime, true);
          }
          playerRef.current.playVideo();
        }
        if (videoRef.current) {
          // Smart Resume local video
          if (videoRef.current.currentTime > endTime - 0.5) {
            videoRef.current.currentTime = startTime;
          }
          videoRef.current.play().catch(() => {});
        }
        setWasPlayingBeforeAction(false);
      }
    } else {
      // Even if no source, if we were in a "playing state" but released, ensure video resumes
      if (wasPlayingBeforeActionRef.current) {
        // Guard resume to prevent immediate re-pause (Method A)
        isResumingAfterRecordRef.current = true;
        setTimeout(() => {
          isResumingAfterRecordRef.current = false;
        }, 1500);

        // Kill pending transitions before resuming (Timer Zombie prevention)
        if (transitionTimeoutRef.current) {
          clearTimeout(transitionTimeoutRef.current);
          transitionTimeoutRef.current = null;
        }

        let startTime = 0;
        let endTime = 0;
        const currentSentence = transcript[currentIndex];
        if (currentSentence) {
          startTime = currentSentence.offset;
          endTime = currentSentence.offset + currentSentence.duration;
        }

        if (playerRef.current) {
          // Smart Resume: If we are right at the edge of the sentence, seek back to start
          const currentT =
            typeof playerRef.current.getCurrentTime === "function"
              ? playerRef.current.getCurrentTime()
              : 0;
          if (currentT > endTime - 0.5) {
            playerRef.current.seekTo(startTime, true);
          }
          playerRef.current.playVideo();
        }
        if (videoRef.current) {
          // Smart Resume local video
          if (videoRef.current.currentTime > endTime - 0.5) {
            videoRef.current.currentTime = startTime;
          }
          videoRef.current.play().catch(() => {});
        }
        setWasPlayingBeforeAction(false);
      }
    }
  };

  const togglePlayRecorded = () => {
    // Legacy support if needed, but we use handlePlayStart/End now
  };

  const openEditor = () => {
    if (isWideLayout && view === "study") {
      setRightView("scriptEditor");
    } else {
      setView("editor");
    }
  };

  return (
    <div
      className="h-screen h-[100dvh] bg-black text-white font-sans flex flex-col overflow-hidden items-center justify-center pt-[env(safe-area-inset-top)]"
      style={currentThemeStyles as React.CSSProperties}
    >
      <div
        className={
          isSplitStudy || view === "library"
            ? "w-full h-full bg-zinc-950 flex flex-col overflow-hidden border-x border-zinc-900 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative"
            : "w-full sm:max-w-xl md:max-w-2xl h-full bg-zinc-950 flex flex-col overflow-hidden border-x border-zinc-900 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative"
        }
      >
        {/* Navigation Rail */}
        <nav className="h-10 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-2 shrink-0">
          <div className="flex items-center gap-4">
            <h1
              onClick={() => {
                if ("serviceWorker" in navigator) {
                  navigator.serviceWorker.getRegistrations().then((registrations) => {
                    for (let registration of registrations) {
                      registration.update();
                    }
                  });
                }
                window.location.reload();
              }}
              className="text-base font-black tracking-tighter uppercase cursor-pointer hover:text-yellow-500 transition-colors active:scale-95 flex items-center justify-center gap-1.5"
            >
              <span className="leading-none">ShadowWalk</span>
              <AnimatePresence>
                {isInitializing && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <RefreshCw className="w-4 h-4 text-yellow-500 animate-spin" />
                  </motion.div>
                )}
              </AnimatePresence>
              {(view === "library" || isWideLayout) && (
                <span className="text-xs leading-none text-zinc-300 font-bold uppercase tracking-widest bg-zinc-900/50 px-1.5 py-0.5 rounded border border-zinc-800/50 ml-1">
                  {(() => {
                    try {
                      const d = new Date(__APP_BUILD_TIME__);
                      return `${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}.${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
                    } catch (e) {
                      return "VER.1";
                    }
                  })()}
                </span>
              )}
              {view === "study" && currentProject?.isVideoLocal && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse" />
              )}
            </h1>
          </div>
          <div className="flex gap-1 items-center">
            {!isSplitStudy && view === "study" && (
              <>
                <div
                  className="flex flex-col items-end justify-center gap-0.5 cursor-pointer hover:bg-zinc-800/50 px-2 py-1 rounded transition-colors group mr-1"
                  onClick={() => setIsBlackout(true)}
                  title="Blackout Mode (Audio Only)"
                >
                  <div
                    className={`text-[13px] leading-none font-black font-sans transition-all duration-300 group-hover:text-yellow-500 tracking-wider ${isPlaying ? "text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]" : "text-zinc-500"}`}
                  >
                    {playbackRate.toFixed(1)}x
                  </div>
                  {transcript.length > 0 && currentIndex < transcript.length - 1 && (
                    <div 
                      className="text-zinc-500 font-black text-[13px] font-sans leading-none tracking-widest group-hover:text-zinc-400"
                    >
                      {(() => {
                        const s = transcript[currentIndex + 1].offset;
                        const mins = Math.floor(s / 60);
                        const secs = (s % 60).toFixed(1);
                        return `${mins}:${secs.padStart(4, "0")}`;
                      })()}
                    </div>
                  )}
                </div>
                <div className="flex bg-zinc-800 rounded-lg p-1 gap-2 mr-1">
                  <button
                    onClick={() => setShowEn(!showEn)}
                    className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${showEn ? "bg-zinc-700 text-yellow-500" : "text-zinc-500 hover:text-zinc-300"}`}
                  >
                    영어
                  </button>
                  <button
                    onClick={() => setShowKo(!showKo)}
                    className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${showKo ? "bg-zinc-700 text-yellow-500" : "text-zinc-500 hover:text-zinc-300"}`}
                  >
                    한글
                  </button>
                  <button
                    onClick={() => setShowGrammar(!showGrammar)}
                    className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${showGrammar ? "bg-zinc-700 text-yellow-500" : "text-zinc-500 hover:text-zinc-300"}`}
                  >
                    문법
                  </button>
                </div>
              </>
            )}
            {!isWideLayout && (view !== "library" || !!currentProject) && (
              <button
                onClick={handleScriptsClick}
                className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight transition-all shrink-0 border ${
                  view === "library"
                    ? "bg-yellow-500 text-black border-yellow-400"
                    : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-zinc-200"
                }`}
              >
                {view === "library" ? "← Back to study" : "Scripts"}
              </button>
            )}
          </div>
        </nav>

        <main className="flex-1 relative overflow-hidden flex flex-col">
          <AnimatePresence mode="wait">
            {/* LIBRARY VIEW */}
            {view === "library" && (
              <LibraryView
                projects={projects}
                currentProject={currentProject}
                loadProject={loadProject}
                exportProject={handleExportProject}
                deleteProject={deleteProject}
                handleFileImport={handleFileImport}
                handleLocalFileSelection={handleLocalFileSelection}
                startNewProject={startNewProject}
                openEditor={openEditor}
                onOpenDriveImport={() => setIsDriveImportModalOpen(true)}
              />
            )}

            {/* EDITOR VIEW */}
            {view === "editor" && (
              <motion.div
                key="editor"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="flex-1 flex flex-col overflow-hidden bg-zinc-950 p-4 md:p-6"
              >
                <ScriptEditor
                  isLoading={isLoading}
                  unifiedInput={unifiedInput}
                  setUnifiedInput={setUnifiedInput}
                  refineTranscriptWithAI={refineTranscriptWithAI}
                  autoFormatTranscript={autoFormatTranscript}
                  setIsEditingPrompt={setIsEditingPrompt}
                  setIsApiKeyModalOpen={setIsApiKeyModalOpen}
                  showCopyFeedback={showCopyFeedback}
                  setView={setView}
                  currentProject={currentProject}
                  exportProject={handleExportProject}
                  saveProject={saveProject}
                  error={error}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* STUDY VIEW */}
          <motion.div
            key="study"
            initial={false}
            animate={{ opacity: view === "study" ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className={`flex-1 flex flex-row min-h-0 ${!isSplitStudy && (showSyncControls || showRecordingPanel) ? "pb-48" : ""}`}
            style={{
              position: view === "study" ? "relative" : "absolute",
              visibility: view === "study" ? "visible" : "hidden",
              pointerEvents: view === "study" ? "auto" : "none",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: view === "study" ? 10 : -10,
            }}
          >
            {/* LEFT / MAIN STUDY SECTION */}
            <section
              className={`min-w-0 flex flex-col ${isSplitStudy ? "border-r border-zinc-900" : "flex-1"}`}
              style={{
                width: isSplitStudy ? `${splitRatio}%` : "100%",
                flex: isSplitStudy ? "none" : 1,
              }}
            >
              {isSplitStudy && (
                <div className="px-4 py-2 border-b border-zinc-900 flex items-center justify-between bg-zinc-950/95 shrink-0">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500 font-black">
                        Learning View
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-1 items-center">
                    {view === "study" && (
                      <>
                        <div
                          className="flex flex-col items-end justify-center gap-0.5 cursor-pointer hover:bg-zinc-800/50 px-2 py-1 rounded transition-colors group mr-1"
                          onClick={() => setIsBlackout(true)}
                          title="Blackout Mode (Audio Only)"
                        >
                          <div
                            className={`text-[13px] leading-none font-black font-sans transition-all duration-300 group-hover:text-yellow-500 tracking-wider ${isPlaying ? "text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]" : "text-zinc-500"}`}
                          >
                            {playbackRate.toFixed(1)}x
                          </div>
                          {transcript.length > 0 && currentIndex < transcript.length - 1 && (
                            <div 
                              className="text-zinc-500 font-black text-[13px] font-sans leading-none tracking-widest group-hover:text-zinc-400"
                            >
                              {(() => {
                                const s = transcript[currentIndex + 1].offset;
                                const mins = Math.floor(s / 60);
                                const secs = (s % 60).toFixed(1);
                                return `${mins}:${secs.padStart(4, "0")}`;
                              })()}
                            </div>
                          )}
                        </div>
                        <div className="flex bg-zinc-800 rounded-lg p-1 gap-2 mr-1">
                          <button
                            onClick={() => setShowEn(!showEn)}
                            className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${showEn ? "bg-zinc-700 text-yellow-500" : "text-zinc-500 hover:text-zinc-300"}`}
                          >
                            영어
                          </button>
                          <button
                            onClick={() => setShowKo(!showKo)}
                            className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${showKo ? "bg-zinc-700 text-yellow-500" : "text-zinc-500 hover:text-zinc-300"}`}
                          >
                            한글
                          </button>
                          <button
                            onClick={() => setShowGrammar(!showGrammar)}
                            className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${showGrammar ? "bg-zinc-700 text-yellow-500" : "text-zinc-500 hover:text-zinc-300"}`}
                          >
                            문법
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              <div
                ref={fullscreenContainerRef}
                id="study-fullscreen-container"
                className={`flex-1 flex flex-col min-h-0 relative ${isFullscreen ? "bg-black !fixed !inset-0 !z-[100] !w-full !h-[100dvh]" : ""}`}
              >
                <VideoArea
                  videoId={videoId}
                  showGeminiHelper={showGeminiHelper}
                  videoScale={videoScale}
                  currentProject={currentProject}
                  videoRef={videoRef}
                  localVideoUrl={localVideoUrl}
                  setIsPlaying={setIsPlaying}
                  isFullscreen={isFullscreen}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const container = document.getElementById("study-fullscreen-container");
                      if (container && container.requestFullscreen) {
                        if (!document.fullscreenElement) {
                          container.requestFullscreen().catch(() => setIsFullscreen(true));
                        } else {
                          document.exitFullscreen().catch(() => setIsFullscreen(false));
                        }
                      } else {
                        // Fallback for iOS
                        setIsFullscreen(!isFullscreen);
                      }
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="absolute top-0 left-0 z-[100] cursor-pointer touch-none p-3 group bg-transparent"
                    title="전체 화면 토글"
                  >
                    <div className="p-2.5 bg-transparent rounded-xl text-white/80 group-active:text-white pointer-events-none transition-all group-active:scale-95 border border-white/30 shadow-sm">
                      {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                    </div>
                  </button>
                  <FloatingVideoSeekControls
                    showVideoControls={showVideoControls}
                    seekBackDuration={seekBackDuration}
                    handleSeekPointerDown={handleSeekPointerDown}
                    stopSeekLoop={stopSeekLoop}
                    toggleCustomLoop={toggleCustomLoop}
                    isCustomLoopActive={isCustomLoopActive}
                    isExpansionMode={isExpansionMode}
                    isExpansionPaused={isExpansionPaused}
                    toggleExpansionPause={toggleExpansionPause}
                    expandNext={expandNext}
                    expandPrev={expandPrev}
                  />
                </VideoArea>
                <div
                  className={`transition-all duration-500 z-50 ${isFullscreen ? "absolute top-0 left-0 right-0 opacity-0 hover:opacity-100 bg-black/60 pt-4 pb-2" : ""}`}
                >
                  <TopStudyControls
                    transcript={transcript}
                    currentIndex={currentIndex}
                    selectedWords={selectedWords}
                    openEditor={openEditor}
                    playSentence={playSentence}
                    delayMode={delayMode}
                    setDelayMode={setDelayMode}
                    isAutoPause={isAutoPause}
                    setIsAutoPause={setIsAutoPause}
                    isSplitStudy={isSplitStudy}
                    setRightView={setRightView}
                    showGeminiHelper={showGeminiHelper}
                    setShowGeminiHelper={setShowGeminiHelper}
                    isWideLayout={isWideLayout}
                    showSettings={showSettings}
                    setShowSettings={setShowSettings}
                    rightView={rightView}
                    showRecordingPanel={showRecordingPanel}
                    setShowRecordingPanel={setShowRecordingPanel}
                    loopMode={loopMode}
                    setLoopMode={setLoopMode}
                    loopCount={loopCount}
                    maxLoops={maxLoops}
                    showVideoControls={showVideoControls}
                    setShowVideoControls={setShowVideoControls}
                    aiProvider={aiProvider as "gemini" | "cerebras"}
                    setTempAnalysisPrompt={setTempAnalysisPrompt}
                    analysisPromptTemplate={analysisPromptTemplate}
                    setTempQueryPrompt={setTempQueryPrompt}
                    queryPromptTemplate={queryPromptTemplate}
                    setIsPromptEditorOpen={setIsPromptEditorOpen}
                    setIsApiKeyModalOpen={setIsApiKeyModalOpen}
                    isCustomLoopActive={isCustomLoopActive}
                    isVideoOnly={isVideoOnly}
                    toggleVideoOnly={toggleVideoOnly}
                    isSubtitleOnly={isSubtitleOnly}
                    toggleSubtitleOnly={toggleSubtitleOnly}
                    projectTitle={currentProject?.title}
                    isExpansionMode={isExpansionMode}
                    cyclePlaybackStage={cyclePlaybackStage}
                  />
                </div>

                {/* Main Content Area */}

                {/* Settings Overlay */}
                <SettingsModal
                  isOpen={showSettings}
                  onClose={() => setShowSettings(false)}
                  setShowGestureHelp={setShowGestureHelp}
                  videoScale={videoScale}
                  setVideoScale={setVideoScale}
                  playbackRate={playbackRate}
                  setPlaybackRate={setPlaybackRate}
                  playerRef={playerRef}
                  seekBackDuration={seekBackDuration}
                  setSeekBackDuration={setSeekBackDuration}
                  maxLoops={maxLoops}
                  setMaxLoops={setMaxLoops}
                  setLoopMode={setLoopMode}
                  delayDuration={delayDuration}
                  setDelayDuration={setDelayDuration}
                  fontSize={fontSize}
                  setFontSize={setFontSize}
                  krFontSize={krFontSize}
                  setKrFontSize={setKrFontSize}
                  isSubtitleOnly={isSubtitleOnly}
                  setIsSubtitleOnly={setIsSubtitleOnly}
                  isVideoOnly={isVideoOnly}
                  setIsVideoOnly={setIsVideoOnly}
                  setIsPlaying={setIsPlaying}
                  showVideoControls={showVideoControls}
                  setShowVideoControls={setShowVideoControls}
                  isContinuous={isContinuous}
                  setIsContinuous={setIsContinuous}
                  delayMode={delayMode}
                  setDelayMode={setDelayMode}
                  showSyncControls={showSyncControls}
                  setShowSyncControls={setShowSyncControls}
                  showRecordingPanel={showRecordingPanel}
                  setShowRecordingPanel={setShowRecordingPanel}
                  aiProvider={aiProvider as "gemini" | "cerebras"}
                  setAiProvider={setAiProvider as any}
                  setIsApiKeyModalOpen={setIsApiKeyModalOpen}
                  testApiKey={testApiKey as any}
                  userApiKey={userApiKey}
                  cerebrasApiKey={cerebrasApiKey}
                  openrouterApiKey={openrouterApiKey}
                  isAutoPause={isAutoPause}
                  setIsAutoPause={setIsAutoPause}
                  isAutoAdvanceLoop={isAutoAdvanceLoop}
                  setIsAutoAdvanceLoop={setIsAutoAdvanceLoop}
                  themeId={themeId}
                  setThemeId={setThemeId}
                />

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-h-0 relative">
                  {!(isSplitStudy && rightView === "subtitles") &&
                    (showGeminiHelper || isSplitStudy ? (
                      /* INTEGRATED GEMINI MODE: Split English (Non-Gesture) and Translation/Grammar (Gesture) */
                      <motion.div
                        key={`gemini-mode-${isFullscreen ? "fullscreen" : "normal"}`}
                        drag={isFullscreen}
                        dragConstraints={fullscreenContainerRef}
                        dragMomentum={false}
                        animate={!isFullscreen ? { x: 0, y: 0 } : undefined}
                        className={`flex-shrink-0 flex flex-col px-0 pt-1 pb-1 select-none overflow-y-auto hide-scrollbar transition-all ${isFullscreen ? "absolute bottom-8 left-8 right-8 z-50 bg-black/60 shadow-xl border border-zinc-800/80 rounded-2xl pointer-events-auto cursor-move backdrop-blur-md min-h-[100px]" : "bg-zinc-950 border-4 border-zinc-700/80 rounded-none mx-2 mb-0.5 mt-1 shadow-2xl duration-300"}`}
                      >
                        <AnimatePresence mode="wait">
                          {transcript.length > 0 ? (
                            <motion.div
                              key={currentIndex}
                              initial={{ opacity: 0, scale: 0.98 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 1.02 }}
                              className="w-full space-y-0.5 pointer-events-auto"
                              ref={captionAreaRef}
                              onPointerDown={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const x = e.clientX - rect.left;
                                if (x < 50 || x > rect.width - 50) return;

                                window.speechSynthesis.cancel();
                                let wasPlaying = false;
                                if (currentProject?.isVideoLocal && videoRef.current) {
                                  wasPlaying = !videoRef.current.paused;
                                } else if (playerRef.current && typeof playerRef.current.getPlayerState === "function") {
                                  wasPlaying = playerRef.current.getPlayerState() === window.YT.PlayerState.PLAYING;
                                }
                                wasPlayingOnPointerDownRef.current = wasPlaying;

                                setIsPlaying(false);
                                if (currentProject?.isVideoLocal && videoRef.current) {
                                  videoRef.current.pause();
                                } else if (playerRef.current && typeof playerRef.current.pauseVideo === "function") {
                                  playerRef.current.pauseVideo();
                                }
                              }}
                              onTap={(e, info) => {
                                if (
                                  Math.abs(lastPanOffset.current.x) < 5 &&
                                  Math.abs(lastPanOffset.current.y) < 5
                                ) {
                                  if (
                                    (e.target as HTMLElement).closest(
                                      ".en-subtitle-area",
                                    )
                                  ) {
                                    return;
                                  }
                                  if (tapTimeout.current) {
                                    clearTimeout(tapTimeout.current);
                                    tapTimeout.current = null;
                                  }
                                  const now = Date.now();
                                  const tapThreshold = 450;
                                  if (now - lastTapTime.current < tapThreshold)
                                    tapCount.current += 1;
                                  else tapCount.current = 1;
                                  lastTapTime.current = now;
                                  const isDoubleTap = tapCount.current === 2;
                                  const isTripleTap = tapCount.current === 3;
                                  if (!captionAreaRef.current) return;
                                  const rect =
                                    captionAreaRef.current.getBoundingClientRect();
                                  const x = info.point.x - rect.left;
                                  
                                  // 50px 좌우 데드존 (오터치 방지)
                                  if (x < 50 || x > rect.width - 50) return;
                                  
                                  const ratio = x / rect.width;
                                  const handleAction = (count: number) => {
                                    if (count === 3) {
                                      if (ratio < 0.33) {
                                        setShowVideoControls((prev) => !prev);
                                      } else if (
                                        ratio >= 0.33 &&
                                        ratio <= 0.66
                                      ) {
                                        setShowRecordingPanel((prev) => !prev);
                                        setShowSyncControls(false);
                                      } else if (ratio > 0.66) {
                                        setShowGestureHelp(true);
                                      }
                                      tapCount.current = 0;
                                    } else if (count === 2) {
                                      if (ratio < 0.33)
                                        setIsAutoPause(!isAutoPause);
                                      else if (ratio > 0.66)
                                        setLoopMode(
                                          (prev) =>
                                            (prev === 0 ? 2 : prev - 1) as
                                              | 0
                                              | 1
                                              | 2,
                                        );
                                      else {
                                        setShowSyncControls(!showSyncControls);
                                        setShowRecordingPanel(false);
                                      }
                                      tapCount.current = 0;
                                    } else if (count === 1) {
                                      if (ratio < 0.33) prevSentence();
                                      else if (ratio > 0.66) nextSentence();
                                      else {
                                        if (wasPlayingOnPointerDownRef.current) {
                                          wasPlayingOnPointerDownRef.current = false;
                                        } else {
                                          togglePlay();
                                        }
                                      }
                                      tapCount.current = 0;
                                    }
                                    tapCount.current = 0;
                                  };
                                  if (isTripleTap) {
                                    if (tapTimeout.current) {
                                      clearTimeout(tapTimeout.current);
                                      tapTimeout.current = null;
                                    }
                                    handleAction(3);
                                  } else {
                                    tapTimeout.current = setTimeout(
                                      () => handleAction(tapCount.current),
                                      tapThreshold,
                                    );
                                  }
                                }
                              }}
                            >
                              {/* 1. English Sentence (Interactivity: word clicks only) */}
                              <motion.div
                                className="px-4 py-1 w-full relative en-subtitle-area"
                                onPointerDown={(e) => e.stopPropagation()}
                              >
                                <div className="flex flex-wrap gap-x-2 gap-y-1 justify-start w-full relative z-10">
                                  {showEn &&
                                    transcript[currentIndex].text
                                      .split(" ")
                                      .map((word, i) => {
                                        const cleanWord = word.replace(
                                          /[.,!?;:]/g,
                                          "",
                                        );
                                        const isSelected =
                                          selectedWords.includes(cleanWord);
                                        const fontSizeClasses: Record<
                                          number,
                                          string
                                        > = {
                                          1: "text-sm",
                                          2: "text-base",
                                          3: "text-lg",
                                          4: "text-xl",
                                          5: "text-2xl",
                                          6: "text-3xl",
                                          7: "text-4xl",
                                        };
                                        const currentFontClass =
                                          fontSizeClasses[fontSize] ||
                                          "text-lg";

                                        return (
                                          <span
                                            key={i}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setSelectedWords((prev) => {
                                                const isAlreadySelected =
                                                  prev.includes(cleanWord);
                                                let nextSelected;
                                                if (isAlreadySelected) {
                                                  nextSelected = prev.filter(
                                                    (w) => w !== cleanWord,
                                                  );
                                                } else {
                                                  nextSelected = [
                                                    ...prev,
                                                    cleanWord,
                                                  ];
                                                }

                                                // Sync to input field
                                                setGeminiQuery(
                                                  nextSelected.join(" "),
                                                );
                                                if (isSplitStudy) {
                                                  setRightView("assistant");
                                                } else {
                                                  setShowGeminiHelper(true);
                                                }
                                                return nextSelected;
                                              });
                                            }}
                                            className={`${currentFontClass} font-bold transition-all cursor-pointer hover:scale-110 active:scale-95 inline-block ${
                                              isSelected
                                                ? "text-yellow-400 scale-105"
                                                : "text-white hover:text-yellow-500"
                                            }`}
                                          >
                                            {word}
                                          </span>
                                        );
                                      })}
                                </div>
                              </motion.div>

                              {/* Divider between English and Korean */}
                              <div className="mx-12 my-1 border-t border-zinc-600" />

                              {/* 2. Control Area: Translation & Grammar (Gestures active here) */}
                              <motion.div
                                className="space-y-0 px-3 cursor-pointer touch-none flex flex-col justify-start text-left w-full"
                                onPanStart={() => {
                                  if (isFullscreen) return;
                                  lastPanOffset.current = { x: 0, y: 0 };
                                }}
                                onPan={(e, info) => {
                                  if (isFullscreen) return;
                                  lastPanOffset.current = info.offset;
                                }}
                                onPanEnd={(e, info) => {
                                  if (isFullscreen) return;
                                  const { offset, point } = info;
                                  const threshold = 40;
                                  if (
                                    Math.abs(offset.x) > Math.abs(offset.y) * 1.2 &&
                                    Math.abs(offset.x) > threshold
                                  ) {
                                    if (offset.x > 0) {
                                      prevSentence();
                                    } else {
                                      nextSentence();
                                    }
                                  } else if (
                                    Math.abs(offset.y) > Math.abs(offset.x) * 1.2 &&
                                    Math.abs(offset.y) > threshold
                                  ) {
                                    if (!captionAreaRef.current) return;
                                    const rect =
                                      captionAreaRef.current.getBoundingClientRect();
                                    const x = point.x - rect.left;
                                    const width = rect.width;
                                    if (x < width * 0.25) {
                                      const delta = offset.y < 0 ? 0.1 : -0.1;
                                      setPlaybackRate((prev) => {
                                        const newRate = Number(
                                          Math.max(
                                            0.5,
                                            Math.min(2.0, prev + delta),
                                          ).toFixed(1),
                                        );
                                        playerRef.current?.setPlaybackRate(
                                          newRate,
                                        );
                                        return newRate;
                                      });
                                    } else if (x > width * 0.75) {
                                      if (showVideoControls) {
                                        const delta = offset.y < 0 ? 0.5 : -0.5;
                                        setSeekBackDuration((prev) =>
                                          Math.max(
                                            0,
                                            Math.min(5, prev + delta),
                                          ),
                                        );
                                      } else {
                                        const delta = offset.y < 0 ? 1 : -1;
                                        setMaxLoops((prev) => {
                                          const next = Math.max(
                                            0,
                                            Math.min(20, prev + delta),
                                          );
                                          if (next === 0) setLoopMode(0);
                                          else if (prev === 0 && next > 0)
                                            setLoopMode(1);
                                          return next;
                                        });
                                      }
                                    } else {
                                      const delta = offset.y < 0 ? 1 : -1;
                                      setFontSize((prev) =>
                                        Math.max(1, Math.min(7, prev + delta)),
                                      );
                                    }
                                  }
                                  lastPanOffset.current = { x: 0, y: 0 };
                                }}
                              >
                                {(() => {
                                  const splitKoSize: Record<number, string> = {
                                    1: "text-xs",
                                    2: "text-xs md:text-sm",
                                    3: "text-sm md:text-base",
                                    4: "text-base md:text-lg",
                                    5: "text-lg md:text-xl",
                                    6: "text-xl md:text-2xl",
                                    7: "text-2xl md:text-3xl",
                                  };
                                  const currentClassKo =
                                    splitKoSize[krFontSize] ||
                                    "text-sm md:text-base";
                                  const currentClassGr =
                                    splitKoSize[krFontSize] ||
                                    "text-[14px] md:text-[16px]";

                                  return (
                                    <>
                                      {showKo &&
                                        transcript[currentIndex]
                                          .translation && (
                                          <div className="relative w-full">
                                            <p
                                              className={`${currentClassKo} text-yellow-400 font-bold leading-relaxed text-left w-full relative z-10`}
                                            >
                                              {
                                                transcript[currentIndex]
                                                  .translation
                                              }
                                            </p>
                                          </div>
                                        )}
                                      {showGrammar &&
                                        transcript[currentIndex].grammar && (
                                          <div
                                            className={`${currentClassGr} text-zinc-300 font-medium leading-relaxed py-1 whitespace-pre-wrap text-left w-full relative z-10 block`}
                                          >
                                            {transcript[currentIndex].grammar}
                                          </div>
                                        )}
                                    </>
                                  );
                                })()}
                              </motion.div>
                            </motion.div>
                          ) : (
                            <div
                              className="text-zinc-500 space-y-4 py-8 text-center w-full min-h-[150px] flex flex-col items-center justify-center relative z-10"
                              key="empty-integrated"
                            >
                              <Languages className="w-12 h-12 mx-auto opacity-20" />
                              <p className="text-sm font-medium uppercase tracking-widest opacity-50">
                                No transcript loaded
                              </p>
                            </div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ) : (
                      /* STANDARD MODE: Full Area Gestures */
                      <motion.div
                        key={`standard-mode-${isFullscreen ? "fullscreen" : "normal"}`}
                        drag={isFullscreen}
                        dragConstraints={fullscreenContainerRef}
                        dragMomentum={false}
                        animate={!isFullscreen ? { x: 0, y: 0 } : undefined}
                        ref={captionAreaRef}
                        className={`flex flex-col items-start justify-start px-4 text-left cursor-pointer select-none group touch-none w-full transition-all ${isFullscreen ? "absolute bottom-8 left-8 right-8 w-auto z-50 bg-black/60 shadow-xl border border-zinc-800/80 rounded-2xl pointer-events-auto cursor-move backdrop-blur-md pb-6 pt-4" : "flex-1 relative pb-4 pt-2 duration-300"}`}
                        onPointerDown={() => {
                          window.speechSynthesis.cancel();
                          let wasPlaying = false;
                          if (currentProject?.isVideoLocal && videoRef.current) {
                            wasPlaying = !videoRef.current.paused;
                          } else if (playerRef.current && typeof playerRef.current.getPlayerState === "function") {
                            wasPlaying = playerRef.current.getPlayerState() === window.YT.PlayerState.PLAYING;
                          }
                          wasPlayingOnPointerDownRef.current = wasPlaying;

                          setIsPlaying(false);
                          if (currentProject?.isVideoLocal && videoRef.current) {
                            videoRef.current.pause();
                          } else if (playerRef.current && typeof playerRef.current.pauseVideo === "function") {
                            playerRef.current.pauseVideo();
                          }
                        }}
                        onTap={(e, info) => {
                          if (
                            Math.abs(lastPanOffset.current.x) < 5 &&
                            Math.abs(lastPanOffset.current.y) < 5
                          ) {
                            if (tapTimeout.current) {
                              clearTimeout(tapTimeout.current);
                              tapTimeout.current = null;
                            }
                            const now = Date.now();
                            const tapThreshold = 450;
                            if (now - lastTapTime.current < tapThreshold)
                              tapCount.current += 1;
                            else tapCount.current = 1;
                            lastTapTime.current = now;
                            const isTripleTap = tapCount.current === 3;

                            if (!captionAreaRef.current) return;
                            const rect =
                              captionAreaRef.current.getBoundingClientRect();
                            const x = info.point.x - rect.left;
                            const ratio = x / rect.width;

                            const handleAction = (count: number) => {
                              if (count === 3) {
                                if (ratio < 0.33) {
                                  setShowVideoControls((prev) => !prev);
                                } else if (ratio >= 0.33 && ratio <= 0.66) {
                                  setShowRecordingPanel((prev) => !prev);
                                  setShowSyncControls(false);
                                } else if (ratio > 0.66) {
                                  setShowGestureHelp(true);
                                }
                                tapCount.current = 0;
                              } else if (count === 2) {
                                if (ratio < 0.33) setIsAutoPause(!isAutoPause);
                                else if (ratio > 0.66)
                                  setLoopMode(
                                    (prev) =>
                                      (prev === 0 ? 2 : prev - 1) as 0 | 1 | 2,
                                  );
                                else {
                                  setShowSyncControls(!showSyncControls);
                                  setShowRecordingPanel(false);
                                }
                                tapCount.current = 0;
                              } else if (count === 1) {
                                if (ratio < 0.33) prevSentence();
                                else if (ratio > 0.66) nextSentence();
                                else {
                                  if (wasPlayingOnPointerDownRef.current) {
                                    wasPlayingOnPointerDownRef.current = false;
                                  } else {
                                    togglePlay();
                                  }
                                }
                                tapCount.current = 0;
                              }
                              tapCount.current = 0;
                            };

                            if (isTripleTap) {
                              handleAction(3);
                            } else {
                              tapTimeout.current = setTimeout(
                                () => handleAction(tapCount.current),
                                tapThreshold,
                              );
                            }
                          }
                        }}
                        onPanStart={() => {
                          if (isFullscreen) return;
                          lastPanOffset.current = { x: 0, y: 0 };
                        }}
                        onPan={(e, info) => {
                          if (isFullscreen) return;
                          lastPanOffset.current = info.offset;
                        }}
                        onPanEnd={(e, info) => {
                          if (isFullscreen) return;
                          const { offset, point } = info;
                          const threshold = 40;
                          if (
                            Math.abs(offset.x) > Math.abs(offset.y) * 1.2 &&
                            Math.abs(offset.x) > threshold
                          ) {
                            if (offset.x > 0) {
                              prevSentence();
                            } else {
                              nextSentence();
                            }
                          } else if (
                            Math.abs(offset.y) > Math.abs(offset.x) * 1.2 &&
                            Math.abs(offset.y) > threshold
                          ) {
                            if (!captionAreaRef.current) return;
                            const rect =
                              captionAreaRef.current.getBoundingClientRect();
                            const x = point.x - rect.left;
                            const width = rect.width;
                            if (x < width * 0.25) {
                              const delta = offset.y < 0 ? 0.1 : -0.1;
                              setPlaybackRate((prev) => {
                                const newRate = Number(
                                  Math.max(
                                    0.5,
                                    Math.min(2.0, prev + delta),
                                  ).toFixed(1),
                                );
                                playerRef.current?.setPlaybackRate(newRate);
                                return newRate;
                              });
                            } else if (x > width * 0.75) {
                              if (showVideoControls) {
                                const delta = offset.y < 0 ? 0.5 : -0.5;
                                setSeekBackDuration((prev) =>
                                  Math.max(0, Math.min(5, prev + delta)),
                                );
                              } else {
                                const delta = offset.y < 0 ? 1 : -1;
                                setMaxLoops((prev) => {
                                  const next = Math.max(
                                    0,
                                    Math.min(20, prev + delta),
                                  );
                                  if (next === 0) setLoopMode(0);
                                  else if (prev === 0 && next > 0)
                                    setLoopMode(1);
                                  return next;
                                });
                              }
                            } else {
                              const delta = offset.y < 0 ? 1 : -1;
                              setFontSize((prev) =>
                                Math.max(1, Math.min(7, prev + delta)),
                              );
                            }
                          }
                          lastPanOffset.current = { x: 0, y: 0 };
                        }}
                      >
                        <AnimatePresence mode="wait">
                          {transcript.length > 0 ? (
                            <motion.div
                              key={currentIndex}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 1.05 }}
                              className="space-y-2 w-full"
                            >
                              <div className="relative w-full">
                                <div className="space-y-1 text-left w-full">
                                  {showEn &&
                                    (() => {
                                      const fontSizeClasses: Record<
                                        number,
                                        string
                                      > = {
                                        1: "text-base md:text-lg",
                                        2: "text-lg md:text-xl",
                                        3: "text-xl md:text-2xl",
                                        4: "text-2xl md:text-3xl",
                                        5: "text-3xl md:text-4xl",
                                        6: "text-4xl md:text-5xl",
                                        7: "text-5xl md:text-6xl",
                                      };
                                      const currentClass =
                                        fontSizeClasses[fontSize] ||
                                        "text-xl md:text-2xl";

                                      return (
                                        <p
                                          className={`${currentClass} font-black leading-tight text-white drop-shadow-[0_4px_12px_rgba(255,255,255,0.2)]`}
                                        >
                                          {transcript[currentIndex].text}
                                        </p>
                                      );
                                    })()}
                                  {(() => {
                                    const krFontSizeClassesKo: Record<
                                      number,
                                      string
                                    > = {
                                      1: "text-sm md:text-base",
                                      2: "text-base md:text-lg",
                                      3: "text-lg md:text-xl",
                                      4: "text-xl md:text-2xl",
                                      5: "text-2xl md:text-3xl",
                                      6: "text-3xl md:text-4xl",
                                      7: "text-4xl md:text-5xl",
                                    };
                                    const currentClassKo =
                                      krFontSizeClassesKo[krFontSize] ||
                                      "text-lg md:text-xl";

                                    return (
                                      <>
                                        {showKo &&
                                          transcript[currentIndex]
                                            .translation && (
                                            <p
                                              className={`${currentClassKo} text-yellow-400 font-bold leading-snug bg-zinc-800/90 px-3 py-2 w-full block relative z-10`}
                                            >
                                              {
                                                transcript[currentIndex]
                                                  .translation
                                              }
                                            </p>
                                          )}
                                      </>
                                    );
                                  })()}
                                </div>
                              </div>
                              {(() => {
                                const krFontSizeClassesGr: Record<
                                  number,
                                  string
                                > = {
                                  1: "text-xs md:text-sm",
                                  2: "text-sm md:text-base",
                                  3: "text-base md:text-lg",
                                  4: "text-lg md:text-xl",
                                  5: "text-xl md:text-2xl",
                                  6: "text-2xl md:text-3xl",
                                  7: "text-3xl md:text-4xl",
                                };
                                const currentClassGr =
                                  krFontSizeClassesGr[krFontSize] ||
                                  "text-base md:text-lg";

                                return (
                                  <>
                                    {showGrammar &&
                                      transcript[currentIndex].grammar && (
                                        <p
                                          className={`${currentClassGr} text-zinc-300 font-medium leading-relaxed mt-1.5 whitespace-pre-wrap w-full text-left relative z-10`}
                                        >
                                          {transcript[currentIndex].grammar}
                                        </p>
                                      )}
                                  </>
                                );
                              })()}
                            </motion.div>
                          ) : (
                            <div className="text-zinc-500 space-y-4 py-20 text-center w-full">
                              <Languages className="w-16 h-16 mx-auto opacity-20" />
                              <p className="text-xl">No transcript loaded</p>
                            </div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}

                  {/* Gemini Chat Log & Input (Only in showGeminiHelper mode) */}
                  {showGeminiHelper && !isSplitStudy && (
                    <div className="flex-1 flex flex-col min-h-0 relative">
                      <div className="px-3 py-2 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between shrink-0">
                        <div>
                          <h3 className="text-[11px] font-black uppercase tracking-widest text-zinc-400">
                            Gemini 도우미
                          </h3>
                        </div>
                        <div className="flex items-center gap-1">
                          {transcript && transcript.length > 0 && (
                            <div className="flex gap-1">
                              <button
                                onClick={() =>
                                  printSubtitles(
                                    transcript,
                                    "en",
                                    currentProject?.title || "Subtitles",
                                  )
                                }
                                className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight text-zinc-400 bg-zinc-800 border border-zinc-700 hover:text-white hover:border-zinc-500 transition-all flex items-center gap-1"
                                title="Print English Only"
                              >
                                <Printer className="w-3 h-3" /> EN
                              </button>
                              <button
                                onClick={() =>
                                  printSubtitles(
                                    transcript,
                                    "all",
                                    currentProject?.title || "Subtitles",
                                  )
                                }
                                className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight text-zinc-400 bg-zinc-800 border border-zinc-700 hover:text-white hover:border-zinc-500 transition-all flex items-center gap-1"
                                title="Print All"
                              >
                                <Printer className="w-3 h-3" /> ALL
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div
                        ref={geminiLogRef}
                        className="flex-1 overflow-y-auto p-4 hide-scrollbar text-sm md:text-base text-zinc-300 leading-relaxed"
                      >
                        <div className="markdown-body">
                          {geminiResponse ? (
                            <>
                              <ReactMarkdown>{geminiResponse}</ReactMarkdown>
                              {isGeminiLoading && (
                                <div className="mt-4 flex items-center justify-center space-x-2 text-purple-500/50">
                                  <Sparkles className="w-4 h-4 animate-spin" />
                                  <span className="text-xs">생성 중...</span>
                                </div>
                              )}
                            </>
                          ) : isGeminiLoading ? (
                            <div className="flex items-center justify-center py-6">
                              <Sparkles className="w-6 h-6 text-purple-500 animate-spin" />
                            </div>
                          ) : (
                            <div className="text-zinc-500 italic">
                              질문을 터치하거나 직접 입력해 주세요.
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="px-4 pb-6 pt-3 bg-zinc-900 border-t border-zinc-800 shrink-0">
                        <div className="flex gap-2 items-center">
                          {/* Auto-Analysis Shortcut Button (Vertical Bar) */}
                          <motion.button
                            whileTap={{
                              scale: 0.9,
                              backgroundColor: "#a855f7",
                            }}
                            onClick={() => askGemini()}
                            className="w-5 h-10 bg-zinc-700 rounded-full hover:bg-purple-500 transition-colors shadow-lg"
                            title="문장 전체 자동 분석"
                          />

                          <div className="flex-1 relative">
                            <input
                              type="text"
                              value={geminiQuery}
                              onChange={(e) => setGeminiQuery(e.target.value)}
                              onKeyDown={(e) =>
                                e.key === "Enter" && askGemini()
                              }
                              placeholder="Gemini에게 질문하기... (Enter: 문장 전체 분석 또는 질문 전송)"
                              className="w-full bg-black border border-zinc-800 rounded-xl pl-4 pr-10 py-2.5 text-base outline-none focus:border-purple-500 transition-colors"
                            />
                            {geminiQuery && (
                              <button
                                onClick={() => {
                                  setGeminiQuery("");
                                  setSelectedWords([]);
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors p-1"
                              >
                                <X size={16} />
                              </button>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              askGemini();
                              setSelectedWords([]);
                            }}
                            className="w-11 h-11 flex-none bg-purple-600 hover:bg-purple-500 rounded-xl transition-all active:scale-95 flex items-center justify-center shadow-lg shadow-purple-500/20"
                          >
                            <Search size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {!isSplitStudy && (
                  <LargeControlsPanel
                    showSyncControls={showSyncControls}
                    showRecordingPanel={showRecordingPanel}
                    isSplitStudy={isSplitStudy}
                    currentIndex={currentIndex}
                    transcriptLength={transcript.length}
                    adjustNextTimestamp={adjustNextTimestamp}
                    isRecording={isRecording}
                    isPlayingRecorded={isPlayingRecorded}
                    recordedUrl={recordedUrl}
                    handlePlayStart={handlePlayStart}
                    handlePlayEnd={handlePlayEnd}
                    handlePTTStart={handlePTTStart}
                    handlePTTEnd={handlePTTEnd}
                    playerRef={playerRef}
                    videoRef={videoRef}
                    setIsPlaying={setIsPlaying}
                    togglePlay={togglePlay}
                    isPlaying={isPlaying}
                    remainingPlaybackTime={remainingPlaybackTime}
                    recordingDuration={recordingDuration}
                    setShowRecordingPanel={setShowRecordingPanel}
                  />
                )}

                {/* Footer Buttons removed as requested */}
              </div>
            </section>

            {/* DIVIDER */}
            {isSplitStudy && (
              <div
                className="w-1 cursor-col-resize bg-zinc-900 hover:bg-yellow-500/50 active:bg-yellow-500 transition-colors z-50 shrink-0"
                onMouseDown={(e) => {
                  setIsDraggingDivider(true);
                  e.preventDefault();
                }}
              />
            )}

            {/* RIGHT PANEL */}
            {isSplitStudy && (
              <aside
                className="bg-zinc-950 flex flex-col overflow-hidden min-w-0 relative"
                style={{
                  width: `calc(${100 - splitRatio}% - 4px)`,
                  flex: "none",
                }}
              >
                <div className="h-10 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-3 shrink-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-black tracking-tight uppercase">
                      {rightView === "scriptLibrary"
                        ? "Script Library"
                        : rightView === "scriptEditor"
                          ? "Script Editor"
                          : rightView === "settings"
                            ? "Settings"
                            : rightView === "subtitles"
                              ? "자막 (Subtitles)"
                              : `${aiProvider === "gemini" ? "Gemini" : aiProvider === "cerebras" ? "Cerebras" : "OpenRouter"} Assistant`}
                    </h2>
                  </div>

                  <div className="flex items-center gap-1">
                    {rightView === "subtitles" && transcript.length > 0 && (
                      <div className="flex gap-1 mr-2 border-r border-zinc-700 pr-2">
                        <button
                          onClick={() =>
                            printSubtitles(
                              transcript,
                              "en",
                              currentProject?.title || "Subtitles",
                            )
                          }
                          className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight text-zinc-400 border border-zinc-700 hover:text-white hover:border-zinc-500 transition-all flex items-center gap-1"
                          title="Print English Only"
                        >
                          <Printer className="w-3 h-3" /> EN
                        </button>
                        <button
                          onClick={() =>
                            printSubtitles(
                              transcript,
                              "all",
                              currentProject?.title || "Subtitles",
                            )
                          }
                          className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight text-zinc-400 border border-zinc-700 hover:text-white hover:border-zinc-500 transition-all flex items-center gap-1"
                          title="Print All"
                        >
                          <Printer className="w-3 h-3" /> ALL
                        </button>
                      </div>
                    )}
                    <button
                      onClick={() => setRightView("subtitles")}
                      className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight border transition-all ${
                        rightView === "subtitles"
                          ? "bg-yellow-500 text-black border-yellow-400"
                          : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-zinc-200"
                      }`}
                    >
                      자막
                    </button>
                    <button
                      onClick={() => setRightView("assistant")}
                      className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight border transition-all ${
                        rightView === "assistant"
                          ? "bg-yellow-500 text-black border-yellow-400"
                          : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-zinc-200"
                      }`}
                    >
                      Assistant
                    </button>

                    <button
                      onClick={() => setRightView("scriptEditor")}
                      className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight border transition-all ${
                        rightView === "scriptEditor"
                          ? "bg-yellow-500 text-black border-yellow-400"
                          : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-zinc-200"
                      }`}
                    >
                      Editor
                    </button>

                    <button
                      onClick={() => setRightView("scriptLibrary")}
                      className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight border transition-all ${
                        rightView === "scriptLibrary"
                          ? "bg-yellow-500 text-black border-yellow-400"
                          : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-zinc-200"
                      }`}
                    >
                      Scripts
                    </button>

                    <button
                      onClick={() => setRightView("settings")}
                      className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight border transition-all ${
                        rightView === "settings"
                          ? "bg-yellow-500 text-black border-yellow-400"
                          : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-zinc-200"
                      }`}
                    >
                      Settings
                    </button>
                  </div>
                </div>

                <div
                  className={`flex-1 overflow-y-auto ${isSplitStudy && (showSyncControls || showRecordingPanel) ? "pb-[260px]" : ""}`}
                >
                  {rightView === "scriptLibrary" ? (
                    <ScriptLibraryPanel
                      projects={projects}
                      currentProject={currentProject}
                      loadProject={loadProject}
                      exportProject={handleExportProject}
                      deleteProject={deleteProject}
                      handleFileImport={handleFileImport}
                      handleLocalFileSelection={handleLocalFileSelection}
                      startNewProject={startNewProject}
                      onOpenDriveImport={() => setIsDriveImportModalOpen(true)}
                    />
                  ) : rightView === "settings" ? (
                    <SettingsPanel
                      videoScale={videoScale}
                      setVideoScale={setVideoScale}
                      playbackRate={playbackRate}
                      setPlaybackRate={setPlaybackRate}
                      playerRef={playerRef}
                      seekBackDuration={seekBackDuration}
                      setSeekBackDuration={setSeekBackDuration}
                      maxLoops={maxLoops}
                      setMaxLoops={setMaxLoops}
                      setLoopMode={setLoopMode}
                      delayDuration={delayDuration}
                      setDelayDuration={setDelayDuration}
                      fontSize={fontSize}
                      setFontSize={setFontSize}
                      krFontSize={krFontSize}
                      setKrFontSize={setKrFontSize}
                      isSubtitleOnly={isSubtitleOnly}
                      setIsSubtitleOnly={setIsSubtitleOnly}
                      isVideoOnly={isVideoOnly}
                      setIsVideoOnly={setIsVideoOnly}
                      setIsPlaying={setIsPlaying}
                      showVideoControls={showVideoControls}
                      setShowVideoControls={setShowVideoControls}
                      isContinuous={isContinuous}
                      setIsContinuous={setIsContinuous}
                      delayMode={delayMode}
                      setDelayMode={setDelayMode}
                      showSyncControls={showSyncControls}
                      setShowSyncControls={setShowSyncControls}
                      showRecordingPanel={showRecordingPanel}
                      setShowRecordingPanel={setShowRecordingPanel}
                      aiProvider={aiProvider as "gemini" | "cerebras"}
                      setAiProvider={setAiProvider as any}
                      setIsApiKeyModalOpen={setIsApiKeyModalOpen}
                      testApiKey={testApiKey as any}
                      userApiKey={userApiKey}
                      cerebrasApiKey={cerebrasApiKey}
                      openrouterApiKey={openrouterApiKey}
                      isAutoPause={isAutoPause}
                      setIsAutoPause={setIsAutoPause}
                      isAutoAdvanceLoop={isAutoAdvanceLoop}
                      setIsAutoAdvanceLoop={setIsAutoAdvanceLoop}
                      themeId={themeId}
                      setThemeId={setThemeId}
                      setShowGestureHelp={setShowGestureHelp}
                    />
                  ) : rightView === "subtitles" ? (
                    <div
                      className="flex-1 overflow-y-auto p-4 md:p-8 bg-zinc-950 flex flex-col justify-center items-center cursor-pointer"
                      onClick={togglePlay}
                    >
                      {transcript.length > 0 && transcript[currentIndex] ? (
                        <div className="w-full space-y-8 text-center flex flex-col items-center">
                          {showEn &&
                            (() => {
                              const fontSizeClasses: Record<number, string> = {
                                1: "text-base md:text-lg",
                                2: "text-lg md:text-xl",
                                3: "text-xl md:text-2xl",
                                4: "text-2xl md:text-3xl",
                                5: "text-3xl md:text-4xl",
                                6: "text-4xl md:text-5xl",
                                7: "text-5xl md:text-6xl",
                              };
                              const currentClass =
                                fontSizeClasses[fontSize] ||
                                "text-xl md:text-2xl";

                              return (
                                <p
                                  className={`${currentClass} font-black leading-tight text-white drop-shadow-[0_4px_12px_rgba(255,255,255,0.2)]`}
                                >
                                  {transcript[currentIndex].text}
                                </p>
                              );
                            })()}

                          {(() => {
                            const krFontSizeClassesKo: Record<number, string> =
                              {
                                1: "text-sm md:text-base",
                                2: "text-base md:text-lg",
                                3: "text-lg md:text-xl",
                                4: "text-xl md:text-2xl",
                                5: "text-2xl md:text-3xl",
                                6: "text-3xl md:text-4xl",
                                7: "text-4xl md:text-5xl",
                              };
                            const krFontSizeClassesGr: Record<number, string> =
                              {
                                1: "text-xs md:text-sm",
                                2: "text-sm md:text-base",
                                3: "text-base md:text-lg",
                                4: "text-lg md:text-xl",
                                5: "text-xl md:text-2xl",
                                6: "text-2xl md:text-3xl",
                                7: "text-3xl md:text-4xl",
                              };
                            const currentClassKo =
                              krFontSizeClassesKo[krFontSize] ||
                              "text-lg md:text-xl";
                            const currentClassGr =
                              krFontSizeClassesGr[krFontSize] ||
                              "text-base md:text-lg";

                            return (
                              <div className="space-y-4 w-full flex flex-col items-center">
                                {showKo &&
                                  transcript[currentIndex].translation && (
                                    <p
                                      className={`${currentClassKo} text-yellow-400 font-bold leading-relaxed bg-zinc-800/90 w-full block px-4 py-2`}
                                    >
                                      {transcript[currentIndex].translation}
                                    </p>
                                  )}
                                {showGrammar &&
                                  transcript[currentIndex].grammar && (
                                    <p
                                      className={`${currentClassGr} text-zinc-300 w-full font-medium leading-relaxed mt-3 whitespace-pre-wrap text-left`}
                                    >
                                      {transcript[currentIndex].grammar}
                                    </p>
                                  )}
                              </div>
                            );
                          })()}
                        </div>
                      ) : (
                        <div className="text-zinc-500 space-y-4 py-20 text-center w-full">
                          <Languages className="w-16 h-16 mx-auto opacity-20" />
                          <p className="text-xl">No transcript loaded</p>
                        </div>
                      )}
                    </div>
                  ) : rightView === "scriptEditor" ? (
                    <div className="p-4 h-full flex flex-col overflow-hidden min-h-0">
                      <ScriptEditor
                        isLoading={isLoading}
                        unifiedInput={unifiedInput}
                        setUnifiedInput={setUnifiedInput}
                        refineTranscriptWithAI={refineTranscriptWithAI}
                        autoFormatTranscript={autoFormatTranscript}
                        setIsEditingPrompt={setIsEditingPrompt}
                        setIsApiKeyModalOpen={setIsApiKeyModalOpen}
                        showCopyFeedback={showCopyFeedback}
                        setView={setView}
                        currentProject={currentProject}
                        exportProject={handleExportProject}
                        saveProject={saveProject}
                        error={error}
                      />
                    </div>
                  ) : (
                    <AssistantPanel
                      analysisPromptTemplate={analysisPromptTemplate}
                      setTempAnalysisPrompt={setTempAnalysisPrompt}
                      queryPromptTemplate={queryPromptTemplate}
                      setTempQueryPrompt={setTempQueryPrompt}
                      setIsPromptEditorOpen={setIsPromptEditorOpen}
                      transcript={transcript}
                      currentIndex={currentIndex}
                      geminiQuery={geminiQuery}
                      setGeminiQuery={setGeminiQuery}
                      askGemini={askGemini}
                      isGeminiLoading={isGeminiLoading}
                      selectedWords={selectedWords}
                      aiProvider={aiProvider}
                      geminiResponse={geminiResponse}
                      geminiLogRef={geminiLogRef}
                      setIsApiKeyModalOpen={setIsApiKeyModalOpen}
                      projectTitle={currentProject?.title}
                    />
                  )}
                </div>
                {isSplitStudy && (
                  <LargeControlsPanel
                    showSyncControls={showSyncControls}
                    showRecordingPanel={showRecordingPanel}
                    isSplitStudy={isSplitStudy}
                    currentIndex={currentIndex}
                    transcriptLength={transcript.length}
                    adjustNextTimestamp={adjustNextTimestamp}
                    isRecording={isRecording}
                    isPlayingRecorded={isPlayingRecorded}
                    recordedUrl={recordedUrl}
                    handlePlayStart={handlePlayStart}
                    handlePlayEnd={handlePlayEnd}
                    handlePTTStart={handlePTTStart}
                    handlePTTEnd={handlePTTEnd}
                    playerRef={playerRef}
                    videoRef={videoRef}
                    setIsPlaying={setIsPlaying}
                    togglePlay={togglePlay}
                    isPlaying={isPlaying}
                    remainingPlaybackTime={remainingPlaybackTime}
                    recordingDuration={recordingDuration}
                    setShowRecordingPanel={setShowRecordingPanel}
                  />
                )}
              </aside>
            )}
          </motion.div>

          {/* Shared Prompt Editor Modal */}
          <PromptEditorModal
            isOpen={isPromptEditorOpen}
            onClose={() => setIsPromptEditorOpen(false)}
            tempAnalysisPrompt={tempAnalysisPrompt}
            setTempAnalysisPrompt={setTempAnalysisPrompt}
            tempQueryPrompt={tempQueryPrompt}
            setTempQueryPrompt={setTempQueryPrompt}
            onSave={() => {
              setAnalysisPromptTemplate(tempAnalysisPrompt);
              setQueryPromptTemplate(tempQueryPrompt);
              setIsPromptEditorOpen(false);
            }}
          />

          {/* Script Editor Refinement Prompt Modal */}
          <RefinementPromptModal
            isOpen={isEditingPrompt}
            onClose={() => setIsEditingPrompt(false)}
            refinementPrompt={refinementPrompt}
            setRefinementPrompt={setRefinementPrompt}
          />

          {/* Google Drive Import Modal */}
          <GoogleDriveImportModal
            isOpen={isDriveImportModalOpen}
            onClose={() => setIsDriveImportModalOpen(false)}
            onImport={(project) => {
              saveProject(project);
              loadProject(project);
              setView("study");
            }}
          />

          {/* API Key Modal */}
          <ApiKeyModal
            isOpen={isApiKeyModalOpen}
            onClose={() => setIsApiKeyModalOpen(false)}
            aiProvider={aiProvider as any}
            setAiProvider={setAiProvider as any}
            geminiApiKeys={geminiApiKeys}
            setGeminiApiKeys={setGeminiApiKeys}
            selectedGeminiKeyIndex={selectedGeminiKeyIndex}
            setSelectedGeminiKeyIndex={setSelectedGeminiKeyIndex}
            geminiModel={geminiModel}
            setGeminiModel={setGeminiModel}
            cerebrasApiKey={cerebrasApiKey}
            setCerebrasApiKey={setCerebrasApiKey}
            cerebrasModel={cerebrasModel}
            setCerebrasModel={setCerebrasModel}
            openrouterApiKey={openrouterApiKey}
            setOpenrouterApiKey={setOpenrouterApiKey}
            openrouterModel={openrouterModel}
            setOpenrouterModel={setOpenrouterModel}
            isApiKeyVisible={isApiKeyVisible}
            setIsApiKeyVisible={setIsApiKeyVisible}
            testApiKey={testApiKey}
            isLoading={isGeminiLoading}
          />

          {/* Gesture Help Modal */}
          <GestureHelpModal
            isOpen={showGestureHelp}
            onClose={() => setShowGestureHelp(false)}
            isAutoPause={isAutoPause}
            playbackRate={playbackRate}
            fontSize={fontSize}
            maxLoops={maxLoops}
            loopMode={loopMode}
          />

          {/* BLACKOUT OVERLAY */}
          <AnimatePresence>
            {isBlackout && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsBlackout(false)}
                className="fixed inset-0 z-[99999] cursor-pointer select-none"
                style={{ backgroundColor: "#000000", width: "100vw", height: "100dvh" }}
              />
            )}
          </AnimatePresence>

          {/* Copy Status Feedback Toast */}
          <AnimatePresence>
            {copyStatus && (
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.9 }}
                className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[9999] bg-yellow-500 text-black px-6 py-2 rounded-full shadow-2xl font-black text-sm tracking-wider border border-yellow-400"
              >
                {copyStatus}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Recording elements managed via AudioContext/PTT handler */}
        </main>
      </div>
    </div>
  );
}
