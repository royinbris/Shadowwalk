const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add CEREBRAS_MODEL
code = code.replace(
  'const GEMINI_MODEL = "gemini-3-flash-preview";',
  'const GEMINI_MODEL = "gemini-3-flash-preview";\nconst CEREBRAS_MODEL = "qwen-3-235b-a22b-instruct-2507";'
);

// 2. Add AI Provider states
const targetStates = `  const [userApiKey, setUserApiKey] = useState(() => localStorage.getItem('user_gemini_api_key') || '');`;
const replacementStates = `  const [userApiKey, setUserApiKey] = useState(() => localStorage.getItem('user_gemini_api_key') || '');
  const [cerebrasApiKey, setCerebrasApiKey] = useState(() => localStorage.getItem('user_cerebras_api_key') || '');
  const [aiProvider, setAiProvider] = useState<'gemini' | 'cerebras'>(() => (localStorage.getItem('user_ai_provider') as 'gemini' | 'cerebras') || 'gemini');`;
code = code.replace(targetStates, replacementStates);

// 3. Replace getAIClient with generic generateAIContent
const targetGetAIClient = `  // Get AI Client with priority: User Key only
  const getAIClient = useCallback(() => {
    const key = userApiKey?.trim();
    if (!key) return null;
    try {
      return new GoogleGenAI({ apiKey: key });
    } catch (e) {
      console.error("SDK Init Error:", e);
      return null;
    }
  }, [userApiKey]);`;

const replacementGenerateAIContent = `  // Unified AI Generation
  const generateAIContent = useCallback(async (prompt: string): Promise<string> => {
    if (aiProvider === 'gemini') {
      const key = userApiKey?.trim();
      if (!key) {
        setIsApiKeyModalOpen(true);
        throw new Error("⚠️ Gemini API 키가 설정되지 않았습니다.");
      }
      const aiClient = new GoogleGenAI({ apiKey: key });
      const response = await aiClient.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt
      });
      return response.text || "";
    } else {
      const key = cerebrasApiKey?.trim();
      if (!key) {
        setIsApiKeyModalOpen(true);
        throw new Error("⚠️ Cerebras API 키가 설정되지 않았습니다.");
      }
      const response = await fetch("https://api.cerebras.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": \`Bearer \${key}\`
        },
        body: JSON.stringify({
          model: CEREBRAS_MODEL,
          messages: [{ role: "user", content: prompt }]
        })
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(\`Cerebras API Error: \${response.status} \${response.statusText} - \${errorData.error?.message || ''}\`);
      }
      const data = await response.json();
      return data.choices[0]?.message?.content || "";
    }
  }, [aiProvider, userApiKey, cerebrasApiKey, setIsApiKeyModalOpen]);`;

code = code.replace(targetGetAIClient, replacementGenerateAIContent);

// 4. Update the places where aiClient is used
// In handleRefineSubtitle:
code = code.replace(
  /const aiClient = getAIClient\(\);\n\s*if \(\!aiClient\) \{\n\s*setIsApiKeyModalOpen\(true\);\n\s*throw new Error[\s\S]*?\n\s*\}\n\s*const prompt = `\$\{refinementPrompt\}\\n\$\{unifiedInput\}`;\n\s*const response = await aiClient\.models\.generateContent\(\{\n\s*model: GEMINI_MODEL,\n\s*contents: prompt\n\s*\}\);\n\s*if \(response\.text\) \{/,
  `const prompt = \`\${refinementPrompt}\\n\${unifiedInput}\`;
      const responseText = await generateAIContent(prompt);
      
      if (responseText) {
        const response = { text: responseText };`
);

// In handleGeminiHelper:
code = code.replace(
  /const aiClient = getAIClient\(\);\n\s*if \(\!aiClient\) \{\n\s*setIsApiKeyModalOpen\(true\);\n\s*throw new Error[\s\S]*?\n\s*\}\n\s*const currentSentence[\s\S]*?\n\s*const response = await aiClient\.models\.generateContent\(\{\n\s*model: GEMINI_MODEL,\n\s*contents: prompt\n\s*\}\);\n\s*if \(response\.text\) \{/,
  `const currentSentence = transcript[currentIndex]?.text || "";
      let prompt = \`[Context Sentence]\\n\${currentSentence}\\n\\n[User Query]\\n\${queryToUse}\`;
      
      if (selectedWords.length > 0) {
        const isSingleWord = selectedWords.length === 1 && !selectedWords[0].includes(" ");
        prompt = \`[Context Sentence]\\n\${currentSentence}\\n\\n[Target Word/Phrase]\\n\${selectedWords.join(' ')}\\n\\n[User Query]\\n\${queryToUse || 'Please explain the target word/phrase in this context detailedly.'}\`;
        
        if (isSingleWord) {
          prompt += \`\\n\\n[Single Word Rule]\\nSince it's a single word, briefly explain general dictionary definition then contextual meaning.\`;
        }
      }
      
      const responseText = await generateAIContent(prompt);
      
      if (responseText) {
        const response = { text: responseText };`
);

// In testApiKey
code = code.replace(
  /const testApiKey = async \(\) => \{\n\s*const aiClient = getAIClient\(\);\n\s*if \(\!aiClient\) \{\n\s*alert\("키를 먼저 입력해 주세요\."\);\n\s*return;\n\s*\}\n\s*setIsGeminiLoading\(true\);\n\s*try \{\n\s*const response = await aiClient\.models\.generateContent\(\{\n\s*model: GEMINI_MODEL,\n\s*contents: "Test connection\. Respond with 'OK'"\n\s*\}\);\n\s*if \(response\.text\) \{/,
  `const testApiKey = async () => {
    setIsGeminiLoading(true);
    try {
      const responseText = await generateAIContent("Test connection. Respond with 'OK' only.");
      if (responseText) {`
);

// 5. Update settings UI
// Add selector for AI Provider and input for Cerebras Key.
const settingsUIRegex = /<div className="space-y-4">\n\s*<div className="relative">[\s\S]*?<\/div>/;

const newSettingsUI = `<div className="space-y-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setAiProvider('gemini');
                        localStorage.setItem('user_ai_provider', 'gemini');
                      }}
                      className={\`flex-1 py-3 rounded-2xl font-bold transition-all \${aiProvider === 'gemini' ? 'bg-[#00e5ff] text-black' : 'bg-black/40 text-zinc-400 border border-zinc-800'}\`}
                    >Gemini</button>
                    <button
                      onClick={() => {
                        setAiProvider('cerebras');
                        localStorage.setItem('user_ai_provider', 'cerebras');
                      }}
                      className={\`flex-1 py-3 rounded-2xl font-bold transition-all \${aiProvider === 'cerebras' ? 'bg-[#ff00ff] text-white' : 'bg-black/40 text-zinc-400 border border-zinc-800'}\`}
                    >Cerebras</button>
                  </div>

                  {aiProvider === 'gemini' ? (
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
                        className={\`w-full bg-black/40 border rounded-2xl px-5 py-4 text-base text-zinc-200 outline-none transition-all font-mono placeholder:text-zinc-700 \${!userApiKey ? 'border-red-500/50 focus:border-red-500' : 'border-zinc-800 focus:border-purple-500'}\`}
                      />
                      <button 
                        onClick={() => setIsApiKeyVisible(!isApiKeyVisible)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
                      >
                        {isApiKeyVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  ) : (
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
                        className={\`w-full bg-black/40 border rounded-2xl px-5 py-4 text-base text-zinc-200 outline-none transition-all font-mono placeholder:text-zinc-700 \${!cerebrasApiKey ? 'border-red-500/50 focus:border-red-500' : 'border-zinc-800 focus:border-[#ff00ff]'}\`}
                      />
                      <button 
                        onClick={() => setIsApiKeyVisible(!isApiKeyVisible)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
                      >
                        {isApiKeyVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  )}`;

code = code.replace(settingsUIRegex, newSettingsUI);

fs.writeFileSync('src/App.tsx', code);
console.log("Done");
