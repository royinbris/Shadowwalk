import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Eye, EyeOff } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  aiProvider: 'gemini' | 'cerebras' | 'openrouter';
  setAiProvider: (provider: 'gemini' | 'cerebras' | 'openrouter') => void;
  userApiKey: string;
  setUserApiKey: (key: string) => void;
  geminiModel: string;
  setGeminiModel: (model: string) => void;
  cerebrasApiKey: string;
  setCerebrasApiKey: (key: string) => void;
  cerebrasModel: string;
  setCerebrasModel: (model: string) => void;
  openrouterApiKey: string;
  setOpenrouterApiKey: (key: string) => void;
  openrouterModel: string;
  setOpenrouterModel: (model: string) => void;
  isApiKeyVisible: boolean;
  setIsApiKeyVisible: (visible: boolean) => void;
  testApiKey: () => void;
  isLoading: boolean;
}

export const ApiKeyModal = ({
  isOpen,
  onClose,
  aiProvider,
  setAiProvider,
  userApiKey,
  setUserApiKey,
  geminiModel,
  setGeminiModel,
  cerebrasApiKey,
  setCerebrasApiKey,
  cerebrasModel,
  setCerebrasModel,
  openrouterApiKey,
  setOpenrouterApiKey,
  openrouterModel,
  setOpenrouterModel,
  isApiKeyVisible,
  setIsApiKeyVisible,
  testApiKey,
  isLoading
}: ApiKeyModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl p-6 space-y-6"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black uppercase tracking-tighter text-purple-400 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" /> {aiProvider === 'gemini' ? 'Gemini' : aiProvider === 'cerebras' ? 'Cerebras' : 'OpenRouter'} API
                </h3>
                <a 
                  href={aiProvider === 'gemini' ? "https://aistudio.google.com/app/apikey" : aiProvider === 'cerebras' ? "https://cloud.cerebras.ai/" : "https://openrouter.ai/keys"}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[10px] font-bold text-zinc-500 hover:text-purple-400 underline underline-offset-2 transition-colors"
                >
                  {aiProvider === 'gemini' ? 'Gemini' : aiProvider === 'cerebras' ? 'Cerebras' : 'OpenRouter'} API 키 발급받기 →
                </a>
              </div>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                선택한 인공지능(AI) 모델을 사용하기 위해 API 키가 필요합니다. 발급받은 키는 본인의 브라우저에만 안전하게 저장되며 외부로 전송되지 않습니다.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setAiProvider('gemini');
                    localStorage.setItem('user_ai_provider', 'gemini');
                  }}
                  className={`flex-1 py-3 rounded-2xl font-bold transition-all text-xs ${aiProvider === 'gemini' ? 'bg-[#00e5ff] text-black' : 'bg-black/40 text-zinc-400 border border-zinc-800'}`}
                >Gemini</button>
                <button
                  onClick={() => {
                    setAiProvider('cerebras');
                    localStorage.setItem('user_ai_provider', 'cerebras');
                  }}
                  className={`flex-1 py-3 rounded-2xl font-bold transition-all text-xs ${aiProvider === 'cerebras' ? 'bg-[#ff00ff] text-white' : 'bg-black/40 text-zinc-400 border border-zinc-800'}`}
                >Cerebras</button>
                <button
                  onClick={() => {
                    setAiProvider('openrouter');
                    localStorage.setItem('user_ai_provider', 'openrouter');
                  }}
                  className={`flex-1 py-3 rounded-2xl font-bold transition-all text-[11px] ${aiProvider === 'openrouter' ? 'bg-[#00ff88] text-black' : 'bg-black/40 text-zinc-400 border border-zinc-800'}`}
                >OpenRouter</button>
              </div>

              {aiProvider === 'gemini' ? (
                <>
                  <div className="relative">
                    <input 
                      type={isApiKeyVisible ? "text" : "password"}
                      value={userApiKey}
                      onChange={(e) => {
                        const val = e.target.value;
                        setUserApiKey(val);
                        localStorage.setItem('user_gemini_api_key', val);
                      }}
                      placeholder="Gemini API 키를 입력하세요..."
                      className={`w-full bg-black/40 border rounded-2xl px-5 py-4 text-base text-zinc-200 outline-none transition-all font-mono placeholder:text-zinc-700 ${!userApiKey ? 'border-red-500/50 focus:border-red-500' : 'border-zinc-800 focus:border-[#00e5ff]'}`}
                    />
                    <button 
                      onClick={() => setIsApiKeyVisible(!isApiKeyVisible)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
                    >
                      {isApiKeyVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <div className="relative mt-2">
                    <select
                      value={geminiModel}
                      onChange={(e) => {
                        setGeminiModel(e.target.value);
                        localStorage.setItem('user_gemini_model', e.target.value);
                      }}
                      className="w-full bg-black/40 border border-zinc-800 focus:border-[#00e5ff] rounded-2xl px-5 py-3 text-sm text-zinc-200 outline-none transition-all font-mono appearance-none"
                    >
                      <option value="gemini-3.1-flash-lite-preview">Gemini 3.1 Flash Lite Preview</option>
                      <option value="gemini-3-flash-preview">Gemini 3 Flash Preview</option>
                      <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                      <option value="gemini-2.5-flash-8b">Gemini 2.5 Flash 8B</option>
                      <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                      <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                      <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                  </div>
                </>
              ) : aiProvider === 'cerebras' ? (
                <>
                  <div className="relative">
                    <input 
                      type={isApiKeyVisible ? "text" : "password"}
                      value={cerebrasApiKey}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCerebrasApiKey(val);
                        localStorage.setItem('user_cerebras_api_key', val);
                      }}
                      placeholder="Cerebras API 키를 입력하세요..."
                      className={`w-full bg-black/40 border rounded-2xl px-5 py-4 text-base text-zinc-200 outline-none transition-all font-mono placeholder:text-zinc-700 ${!cerebrasApiKey ? 'border-red-500/50 focus:border-red-500' : 'border-zinc-800 focus:border-[#ff00ff]'}`}
                    />
                    <button 
                      onClick={() => setIsApiKeyVisible(!isApiKeyVisible)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
                    >
                      {isApiKeyVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <div className="relative mt-2">
                    <select
                      value={cerebrasModel}
                      onChange={(e) => {
                        setCerebrasModel(e.target.value);
                        localStorage.setItem('user_cerebras_model', e.target.value);
                      }}
                      className="w-full bg-black/40 border border-zinc-800 focus:border-[#ff00ff] rounded-2xl px-5 py-3 text-sm text-zinc-200 outline-none transition-all font-mono appearance-none"
                    >
                      <option value="llama3.1-8b">Llama 3.1 8B</option>
                      <option value="gpt-oss-120b">OpenAI GPT OSS</option>
                      <option value="qwen-3-235b-a22b-instruct-2507">Qwen 3 235B Instruct</option>
                      <option value="zai-glm-4.7">Z.ai GLM 4.7</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                  </div>
                </>
              ) : aiProvider === 'openrouter' ? (
                <>
                  <div className="relative">
                    <input 
                      type={isApiKeyVisible ? "text" : "password"}
                      value={openrouterApiKey}
                      onChange={(e) => {
                        const val = e.target.value;
                        setOpenrouterApiKey(val);
                        localStorage.setItem('user_openrouter_api_key', val);
                      }}
                      placeholder="OpenRouter API 키를 입력하세요..."
                      className={`w-full bg-black/40 border rounded-2xl px-5 py-4 text-base text-zinc-200 outline-none transition-all font-mono placeholder:text-zinc-700 ${!openrouterApiKey ? 'border-red-500/50 focus:border-red-500' : 'border-zinc-800 focus:border-[#00ff88]'}`}
                    />
                    <button 
                      onClick={() => setIsApiKeyVisible(!isApiKeyVisible)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
                    >
                      {isApiKeyVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <div className="relative mt-2">
                    <select
                      value={openrouterModel}
                      onChange={(e) => {
                        setOpenrouterModel(e.target.value);
                        localStorage.setItem('user_openrouter_model', e.target.value);
                      }}
                      className="w-full bg-black/40 border border-zinc-800 focus:border-[#00ff88] rounded-2xl px-5 py-3 text-sm text-zinc-200 outline-none transition-all font-mono appearance-none"
                    >
                      <option value="qwen/qwen-3-235b-instruct">Qwen 3 235B Instruct</option>
                      <option value="qwen/qwen-3-235b">Qwen 3 235B</option>
                      <option value="qwen/qwen3-coder:free">Qwen 3 Coder (Free)</option>
                      <option value="qwen/qwen3-next-80b-a3b-instruct:free">Qwen 3 Next 80B A3B (Free)</option>
                      <option value="qwen/qwen-2.5-coder-32b-instruct">Qwen 2.5 Coder 32B</option>
                      <option value="qwen/qwen-max">Qwen Max</option>
                      <option value="qwen/qwen-plus">Qwen Plus</option>
                      <option value="meta-llama/llama-3.3-70b-instruct:free">Llama 3.3 70B (Free)</option>
                      <option value="google/gemma-3-27b-it:free">Gemma 3 27B (Free)</option>
                      <option value="deepseek/deepseek-r1">DeepSeek R1</option>
                      <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                  </div>
                </>
              ) : null}

              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={() => {
                    if (aiProvider === 'gemini') {
                      setUserApiKey('');
                      localStorage.removeItem('user_gemini_api_key');
                    } else if (aiProvider === 'cerebras') {
                      setCerebrasApiKey('');
                      localStorage.removeItem('user_cerebras_api_key');
                    } else {
                      setOpenrouterApiKey('');
                      localStorage.removeItem('user_openrouter_api_key');
                    }
                  }}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-400 py-3 rounded-xl text-xs font-bold transition-all border border-zinc-700 active:scale-95"
                >
                  지우기
                </button>
                <button 
                  onClick={testApiKey}
                  disabled={isLoading}
                  className="col-span-1 bg-zinc-800 hover:bg-zinc-700 text-purple-400 py-3 rounded-xl text-xs font-bold transition-all border border-zinc-700 active:scale-95 disabled:opacity-50"
                >
                  {isLoading ? "확인중..." : "TEST"}
                </button>
                <button 
                  onClick={onClose}
                  className="bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-xl text-xs font-black transition-all shadow-[0_4px_12px_rgba(147,51,234,0.3)] active:scale-95"
                >
                  확인
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
