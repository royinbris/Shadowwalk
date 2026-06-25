import React from 'react';
import { FileText, Search, Key, Printer } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { TranscriptItem } from '../types';
import { printSubtitles } from '../utils';

interface AssistantPanelProps {
  analysisPromptTemplate: string;
  setTempAnalysisPrompt: (val: string) => void;
  queryPromptTemplate: string;
  setTempQueryPrompt: (val: string) => void;
  setIsPromptEditorOpen: (val: boolean) => void;
  transcript: TranscriptItem[];
  currentIndex: number;
  geminiQuery: string;
  setGeminiQuery: (val: string) => void;
  askGemini: (text?: string) => void;
  isGeminiLoading: boolean;
  selectedWords: string[];
  aiProvider: string;
  geminiResponse: string;
  geminiLogRef: React.RefObject<HTMLDivElement>;
  setIsApiKeyModalOpen?: (val: boolean) => void;
  projectTitle?: string;
}

export const AssistantPanel = ({
  analysisPromptTemplate,
  setTempAnalysisPrompt,
  queryPromptTemplate,
  setTempQueryPrompt,
  setIsPromptEditorOpen,
  transcript,
  currentIndex,
  geminiQuery,
  setGeminiQuery,
  askGemini,
  isGeminiLoading,
  selectedWords,
  aiProvider,
  geminiResponse,
  geminiLogRef,
  setIsApiKeyModalOpen,
  projectTitle
}: AssistantPanelProps) => {
  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden h-full flex flex-col relative">
        <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-sm font-black uppercase">Gemini 도우미</h3>
          </div>

          <div className="flex items-center gap-1.5">
            {transcript && transcript.length > 0 && (
              <div className="flex gap-1 mr-2 border-r border-zinc-700 pr-2">
                <button
                  onClick={() => printSubtitles(transcript, 'en', projectTitle || 'Subtitles')}
                  className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight text-zinc-400 border border-zinc-700 hover:text-white hover:border-zinc-500 transition-all flex items-center gap-1 bg-zinc-800"
                  title="Print English Only"
                >
                  <Printer className="w-3 h-3" /> EN
                </button>
                <button
                  onClick={() => printSubtitles(transcript, 'all', projectTitle || 'Subtitles')}
                  className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight text-zinc-400 border border-zinc-700 hover:text-white hover:border-zinc-500 transition-all flex items-center gap-1 bg-zinc-800"
                  title="Print All"
                >
                  <Printer className="w-3 h-3" /> ALL
                </button>
              </div>
            )}
            <button 
              onClick={() => {
                setTempAnalysisPrompt(analysisPromptTemplate);
                setTempQueryPrompt(queryPromptTemplate);
                setIsPromptEditorOpen(true);
              }}
              className="px-2 py-1 rounded-md text-[10px] font-bold uppercase border bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-purple-400 transition-colors"
            >
              Prompt
            </button>
            {setIsApiKeyModalOpen && (
              <button 
                onClick={() => setIsApiKeyModalOpen(true)}
                className="px-2 py-1 rounded-md text-[10px] font-bold uppercase border bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white transition-colors flex items-center gap-1"
                title="API Key Settings"
              >
                API <Key size={12} />
              </button>
            )}
          </div>
        </div>

        <div className="p-4 border-b border-zinc-800 space-y-3 shrink-0 relative">
          <div className="flex gap-2 items-end">
            <button
              onClick={() => setGeminiQuery(transcript[currentIndex]?.text || '')}
              title="Use Current Sentence"
              className="w-[44px] h-[44px] flex-none bg-zinc-800 text-zinc-300 hover:text-white rounded-xl transition-all active:scale-95 flex items-center justify-center border border-zinc-700"
            >
              <FileText size={18} />
            </button>

            <textarea
              value={geminiQuery}
              onChange={(e) => setGeminiQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (!isGeminiLoading) {
                    askGemini();
                  }
                }
              }}
              placeholder="질문, 단어 입력 또는 Enter를 눌러 문장 전체 분석"
              className="flex-1 h-[44px] min-h-[44px] py-2.5 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-yellow-500/50 resize-none overflow-y-auto"
            />

            <button
              onClick={() => askGemini()}
              disabled={isGeminiLoading}
              title="Ask Gemini"
              className="w-[44px] h-[44px] flex-none bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl transition-all active:scale-95 flex items-center justify-center shadow-lg disabled:opacity-50"
            >
              <Search size={18} />
            </button>
          </div>
        </div>

        <div ref={geminiLogRef as any} className="flex-1 overflow-y-auto p-4">
          {geminiResponse ? (
            <div className="markdown-body text-sm">
              <ReactMarkdown>{geminiResponse}</ReactMarkdown>
              {isGeminiLoading && (
                <div className="mt-4 flex items-center space-x-2 text-zinc-500 text-xs">
                  <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  <span>{aiProvider === 'gemini' ? 'Gemini' : aiProvider === 'cerebras' ? 'Cerebras' : 'OpenRouter'} is thinking...</span>
                </div>
              )}
            </div>
          ) : isGeminiLoading ? (
            <div className="text-sm text-zinc-500">{aiProvider === 'gemini' ? 'Gemini' : aiProvider === 'cerebras' ? 'Cerebras' : 'OpenRouter'} is thinking...</div>
          ) : (
            <div className="text-sm text-zinc-500 leading-relaxed">
              <ul className="list-disc pl-4 space-y-2 mt-2">
                <li>질문이나 검색할 단어를 입력하세요.</li>
                <li>좌측 버튼은 현재 문장을 복사합니다.</li>
                <li>오른쪽 버튼은 AI에게 질문을 전송합니다.</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
