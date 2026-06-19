import React, { useRef } from 'react';
import { Sparkles, Repeat, Settings, Key, Printer, Copy, FileUp } from 'lucide-react';
import { Project } from '../types';

const GoogleDriveIcon = ({ className = "w-3 h-3" }) => (
  <svg className={className} viewBox="0 0 144 144" xmlns="http://www.w3.org/2000/svg">
    <path d="M42.42 123.36 12 70.78a10.27 10.27 0 0 1 0-10.27l30.42-52.58a10.27 10.27 0 0 1 8.89-5.13h61.38l-40.7 70.33a10.27 10.27 0 0 0 0 10.27l40.7 70.33H51.31a10.27 10.27 0 0 1-8.89-5.14z" fill="#4285f4"/>
    <path d="M101.58 123.36 71.16 70.78a10.27 10.27 0 0 0 0-10.27L101.58 7.93a10.27 10.27 0 0 1 8.89-5.13h-61.38L8.39 73.13a10.27 10.27 0 0 0 0 10.27l40.7 70.33h61.38a10.27 10.27 0 0 0-8.89-5.14z" fill="#0f9d58"/>
    <path d="M101.58 20.73 71.16 73.31a10.27 10.27 0 0 1-8.89 5.14H1.85l39.53 68.44a10.27 10.27 0 0 0 8.89 5.14h61.38a10.27 10.27 0 0 0 8.89-5.14l30.42-52.58a10.27 10.27 0 0 0 0-10.27L110.47 25.86a10.27 10.27 0 0 0-8.89-5.13z" fill="#ffc107"/>
  </svg>
);

interface ScriptEditorProps {
  isLoading: boolean;
  unifiedInput: string;
  setUnifiedInput: (val: string) => void;
  refineTranscriptWithAI: () => void;
  autoFormatTranscript: () => void;
  setIsEditingPrompt: (val: boolean) => void;
  setIsApiKeyModalOpen: (val: boolean) => void;
  showCopyFeedback: (msg: string) => void;
  setView: (view: 'library' | 'study' | 'editor') => void;
  currentProject: Project | null;
  exportProject: (project: Project) => void;
  saveProject: (silentSave?: boolean, textInput?: string) => Project | null | void;
  error: string | null;
}

export const ScriptEditor = ({
  isLoading,
  unifiedInput,
  setUnifiedInput,
  refineTranscriptWithAI,
  autoFormatTranscript,
  setIsEditingPrompt,
  setIsApiKeyModalOpen,
  showCopyFeedback,
  setView,
  currentProject,
  exportProject,
  saveProject,
  error
}: ScriptEditorProps) => {
  const [isEnglishOnly, setIsEnglishOnly] = React.useState(false);
  const [storedInput, setStoredInput] = React.useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const txtFileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const newText = unifiedInput ? unifiedInput + '\n\n' + text : text;
        setUnifiedInput(newText);
        saveProject(true, newText);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input so the same file can be selected again
  };

  return (
    <div className="flex-1 w-full flex flex-col space-y-4 overflow-hidden overflow-y-auto min-h-0">
      <div className="w-full mx-auto flex-1 flex flex-col space-y-4 overflow-hidden">
        <div className="flex flex-col space-y-4 shrink-0">
          <h2 className="text-xl md:text-2xl font-black uppercase italic text-yellow-500 tracking-tighter text-center">Script Editor</h2>
          
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-1.5 md:gap-2">
                <button 
                  onClick={refineTranscriptWithAI}
                  disabled={isLoading || !unifiedInput.trim()}
                  className="bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900/50 px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all text-white shadow-lg shadow-purple-500/20 flex items-center gap-1 active:scale-95"
                >
                  {isLoading ? (
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Sparkles size={10} />
                  )}
                  AI 정제
                </button>
                {/\d{1,2}:\d{2}/.test(unifiedInput) && !/\(\d{1,2}:\d{2}\)/.test(unifiedInput) && (
                  <button 
                    onClick={autoFormatTranscript}
                    className="bg-blue-600 hover:bg-blue-500 px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all text-white shadow-lg shadow-blue-500/20 flex items-center gap-1 active:scale-95"
                  >
                    <Repeat size={10} />
                    자동 수정
                  </button>
                )}
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-emerald-600/20 hover:bg-emerald-600/30 px-2.5 py-1.5 rounded-lg border border-emerald-500/30 text-[9px] font-bold uppercase tracking-wider transition-all text-emerald-400 flex items-center gap-1 active:scale-95 shadow-lg"
                >
                  <FileUp size={10} />
                  SRT 열기
                </button>
                <input
                  type="file"
                  accept=".srt,.txt"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button 
                  onClick={() => txtFileInputRef.current?.click()}
                  className="bg-blue-600/20 hover:bg-blue-600/30 px-2.5 py-1.5 rounded-lg border border-blue-500/30 text-[9px] font-bold uppercase tracking-wider transition-all text-blue-400 flex items-center gap-1 active:scale-95 shadow-lg"
                >
                  <FileUp size={10} />
                  TXT 열기
                </button>
                <input
                  type="file"
                  accept=".txt"
                  ref={txtFileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button 
                  onClick={() => setIsEditingPrompt(true)}
                  className="bg-zinc-900 hover:bg-zinc-800 px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all text-zinc-300 border border-zinc-800 flex items-center gap-1 active:scale-95"
                >
                  <Settings size={10} />
                  프롬프트
                </button>
                <button 
                  onClick={() => setIsApiKeyModalOpen(true)}
                  className="bg-purple-600/20 hover:bg-purple-600/30 px-2.5 py-1.5 rounded-lg border border-purple-500/30 text-[9px] font-bold uppercase tracking-wider transition-all text-purple-400 flex items-center gap-1 active:scale-95 shadow-lg"
                >
                  <Key size={10} />
                  API
                </button>
                <button 
                  onClick={() => {
                    if (isEnglishOnly) {
                      setUnifiedInput(storedInput);
                      setIsEnglishOnly(false);
                    } else {
                      if (!unifiedInput) return;
                      setStoredInput(unifiedInput);
                      const lines = unifiedInput.split('\n');
                      const filteredLines = lines.filter(line => {
                        const t = line.trim();
                        if (t === '') return true;
                        if (t.toLowerCase().startsWith('title:')) return true;
                        if (t.toLowerCase().startsWith('url:')) return true;
                        if (/^\([\d:]+(\.\d+)?\)/.test(t)) return true;
                        return false;
                      });
                      const cleaned = filteredLines.join('\n').replace(/\n{3,}/g, '\n\n');
                      setUnifiedInput(cleaned.trim());
                      setIsEnglishOnly(true);
                    }
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all border active:scale-95 shadow-lg ${isEnglishOnly ? 'bg-blue-600/20 text-blue-400 border-blue-500/30 hover:bg-blue-600/30' : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800'}`}
                >
                  영문만
                </button>

                <button 
                  onClick={() => {
                    const printWindow = window.open('', '', 'width=800,height=600');
                    if (printWindow) {
                      const lines = unifiedInput.split('\n');
                      const enOnly = lines.filter(line => 
                        line.startsWith('Title:') || 
                        line.startsWith('URL:') || 
                        line.trim().startsWith('(')
                      ).filter(line => !line.trim().startsWith('Trad:') && !line.trim().startsWith('Gram:')).join('\n');
                      
                      const htmlContent = `
                        <html>
                          <head>
                            <title>Print EN Transcript</title>
                            <style>
                              body { font-family: sans-serif; padding: 20px; white-space: pre-wrap; line-height: 1.5; font-size: 14px; color: black; }
                            </style>
                          </head>
                          <body>${enOnly.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</body>
                        </html>
                      `;
                      printWindow.document.write(htmlContent);
                      printWindow.document.close();
                      printWindow.focus();
                      setTimeout(() => {
                        printWindow.print();
                        printWindow.close();
                      }, 250);
                    }
                  }}
                  className="bg-zinc-900 hover:bg-zinc-800 px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all text-zinc-300 border border-zinc-800 flex items-center gap-1 active:scale-95"
                >
                  <Printer size={10} />
                  EN
                </button>

                <button 
                  onClick={() => {
                    const printWindow = window.open('', '', 'width=800,height=600');
                    if (printWindow) {
                      const htmlContent = `
                        <html>
                          <head>
                            <title>Print Transcript</title>
                            <style>
                              body { font-family: sans-serif; padding: 20px; white-space: pre-wrap; line-height: 1.5; font-size: 14px; color: black; }
                            </style>
                          </head>
                          <body>${unifiedInput.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</body>
                        </html>
                      `;
                      printWindow.document.write(htmlContent);
                      printWindow.document.close();
                      printWindow.focus();
                      setTimeout(() => {
                        printWindow.print();
                        printWindow.close();
                      }, 250);
                    }
                  }}
                  className="bg-zinc-900 hover:bg-zinc-800 px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all text-zinc-300 border border-zinc-800 flex items-center gap-1 active:scale-95"
                >
                  <Printer size={10} />
                  ALL
                </button>
                
                <div className="flex items-center bg-zinc-950/50 rounded-lg p-0.5 border border-zinc-800">
                  <div className="px-1.5 flex items-center justify-center text-zinc-600">
                    <Copy size={11} />
                  </div>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(unifiedInput);
                      showCopyFeedback("전체 스크립트 복사 완료");
                    }}
                    className="px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter text-zinc-500 hover:text-white transition-colors border-l border-zinc-800"
                  >
                    ALL
                  </button>
                  <button 
                    onClick={() => {
                      const lines = unifiedInput.split('\n');
                      const enOnly = lines.filter(line => 
                        line.startsWith('Title:') || 
                        line.startsWith('URL:') || 
                        line.trim().startsWith('(')
                      ).filter(line => !line.trim().startsWith('Trad:') && !line.trim().startsWith('Gram:')).join('\n');
                      navigator.clipboard.writeText(enOnly);
                      showCopyFeedback("영어 문장만 복사 완료");
                    }}
                    className="px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter text-zinc-500 hover:text-white transition-colors border-l border-zinc-800"
                  >
                    EN
                  </button>
                  <button 
                    onClick={() => {
                      const titleLine = unifiedInput.split('\n').find(l => l.trim().startsWith('Title:'));
                      if (titleLine) {
                        navigator.clipboard.writeText(titleLine.replace('Title:', '').trim());
                        showCopyFeedback("제목 복사 완료");
                      }
                    }}
                    className="px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter text-zinc-500 hover:text-white transition-colors border-l border-zinc-800"
                  >
                    Title
                  </button>
                  <button 
                    onClick={() => {
                      const urlLine = unifiedInput.split('\n').find(l => l.trim().startsWith('URL:'));
                      if (urlLine) {
                        navigator.clipboard.writeText(urlLine.replace('URL:', '').trim());
                        showCopyFeedback("URL 복사 완료");
                      }
                    }}
                    className="px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter text-zinc-500 hover:text-white transition-colors border-l border-zinc-800"
                  >
                    URL
                  </button>
                </div>
                <button 
                  onClick={() => setView(currentProject ? 'study' : 'library')}
                  className="bg-zinc-900 hover:bg-zinc-800 px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all text-zinc-400 border border-zinc-800 active:scale-95"
                >
                  뒤로가기
                </button>
                <button 
                  onClick={() => {
                    const saved = saveProject(true);
                    if (saved) exportProject(saved);
                    else if (currentProject) exportProject(currentProject);
                    else alert("저장 가능한 스크립트가 없습니다. 먼저 작성해 주세요.");
                  }}
                  className="bg-zinc-800 hover:bg-zinc-700 px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all text-zinc-300 border border-zinc-700 active:scale-95 flex items-center gap-1.5"
                >
                  <GoogleDriveIcon />
                  DRIVE
                </button>
                <button 
                  onClick={saveProject}
                  className="bg-yellow-500 hover:bg-yellow-400 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all text-black shadow-lg shadow-yellow-500/10 active:scale-95"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 relative min-h-0 bg-zinc-900 rounded-none border border-zinc-800 shadow-2xl overflow-hidden flex flex-col">
          <textarea
            className={`flex-1 w-full bg-transparent p-4 md:p-6 focus:outline-none resize-none leading-relaxed hide-scrollbar ${
              isEnglishOnly ? 'font-bold text-lg md:text-xl text-zinc-100' : 'font-sans text-base text-zinc-300'
            }`}
            style={isEnglishOnly ? { fontFamily: 'sans-serif' } : {}}
            placeholder={`Example:\nTitle: My Lesson\nURL: https://youtube.com/watch?v=...\n\n(0:02) Sentence one.\n(0:06) Sentence two...`}
            value={unifiedInput}
            onChange={(e) => setUnifiedInput(e.target.value)}
            spellCheck={false}
          />
          {isLoading && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center space-y-6">
              <Sparkles className="w-16 h-16 text-yellow-500 animate-spin" />
              <p className="font-black text-xl uppercase tracking-[0.2em] animate-pulse text-yellow-500">AI Processing</p>
            </div>
          )}
        </div>

        {error && <p className="text-red-500 text-center text-[10px] md:text-sm font-bold bg-red-500/10 py-2 md:py-3 rounded-xl border border-red-500/20">{error}</p>}
      </div>
    </div>
  );
};
