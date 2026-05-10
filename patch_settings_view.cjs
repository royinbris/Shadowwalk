const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Update RightView type
code = code.replace(
  "type RightView = 'assistant' | 'scriptLibrary' | 'scriptEditor';",
  "type RightView = 'assistant' | 'scriptLibrary' | 'scriptEditor' | 'settings';"
);

// 2. We will add Settings to the tabs
const tabsMatch = /<button\s*onClick=\{\(\) => setRightView\('scriptLibrary'\)\}.*?Scripts\s*<\/button>/s;
const tabsMatchParsed = code.match(tabsMatch);
if (tabsMatchParsed) {
  const tabsReplacement = `${tabsMatchParsed[0]}

                    <button
                      onClick={() => setRightView('settings')}
                      className={\`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight border transition-all \${
                        rightView === 'settings'
                          ? 'bg-yellow-500 text-black border-yellow-400'
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-zinc-200'
                      }\`}
                    >
                      Settings
                    </button>`;
  code = code.replace(tabsMatch, tabsReplacement);
}

// 3. RightView condition handling
const rightViewHeaderMatch = /\{rightView === 'scriptLibrary' \? 'Script Library' : rightView === 'scriptEditor' \? 'Script Editor' : 'Gemini Assistant'\}/;
code = code.replace(rightViewHeaderMatch, "{rightView === 'scriptLibrary' ? 'Script Library' : rightView === 'scriptEditor' ? 'Script Editor' : rightView === 'settings' ? 'Settings' : 'Gemini Assistant'}");


const rightViewContentMatchStr = `                  ) : rightView === 'scriptEditor' ? (
                    <div className="p-4 h-full flex flex-col overflow-hidden min-h-0">
                      {renderEditor()}
                    </div>
                  ) : (`;

const renderSettingsCode = `                  ) : rightView === 'settings' ? (
                    <div className="p-4 overflow-y-auto h-full">
                      <div className="space-y-4 pb-4">
                        <div className="flex flex-col xl:flex-row gap-4 items-start">
                          <div className="flex-1 flex justify-between items-start gap-1 w-full overflow-x-auto hide-scrollbar">
                            <VerticalDial 
                              label="속도"
                              unit="배속"
                              value={playbackRate}
                              min={0.5}
                              max={1.5}
                              step={0.1}
                              color="cyan"
                              onChange={(val) => {
                                setPlaybackRate(val);
                                playerRef.current?.setPlaybackRate(val);
                              }}
                            />

                            <VerticalDial 
                              label="빽"
                              unit="초"
                              value={seekBackDuration}
                              min={0}
                              max={3}
                              step={0.5}
                              color="purple"
                              onChange={setSeekBackDuration}
                            />

                            <VerticalDial 
                              label="반복"
                              unit="회"
                              value={maxLoops}
                              min={0}
                              max={20}
                              step={1}
                              color="orange"
                              onChange={(val) => {
                                setMaxLoops(val);
                                if (val === 0) setIsLooping(false);
                                else if (maxLoops === 0 && val > 0) setIsLooping(true);
                              }}
                            />

                            <VerticalDial 
                              label="대기"
                              unit="초"
                              value={delayDuration}
                              min={0}
                              max={10}
                              step={0.5}
                              color="emerald"
                              onChange={setDelayDuration}
                            />

                            <VerticalDial 
                              label="글씨"
                              unit="단계"
                              value={fontSize}
                              min={1}
                              max={7}
                              step={1}
                              color="purple"
                              onChange={setFontSize}
                            />

                            <VerticalDial 
                              label="크기"
                              unit="단계"
                              value={videoScale}
                              min={1}
                              max={5}
                              step={1}
                              color="cyan"
                              onChange={setVideoScale}
                            />
                          </div>

                          <div className="w-full xl:w-[80px] grid grid-cols-2 sm:grid-cols-3 xl:flex xl:flex-col gap-1.5 pt-1 xl:border-l xl:border-t-0 border-t border-zinc-700/50 xl:pl-2 pt-2 xl:pt-1">
                            <button 
                              onClick={() => {
                                const nextState = !isSubtitleOnly;
                                setIsSubtitleOnly(nextState);
                                if (nextState) {
                                  setIsPlaying(false);
                                  playerRef.current?.pauseVideo();
                                }
                              }}
                              className={\`py-2.5 rounded-xl flex flex-col items-center justify-center gap-0.5 border transition-all \${isSubtitleOnly ? 'bg-[#00e5ff]/10 border-[#00e5ff] text-[#00e5ff]' : 'bg-black/40 border-zinc-800 text-zinc-300'}\`}
                            >
                              <span className="text-[11px] font-black uppercase tracking-tighter text-center">자막전용</span>
                            </button>

                            <button
                              onClick={() => setShowVideoControls(prev => !prev)}
                              className={\`py-2.5 rounded-xl flex flex-col items-center justify-center gap-0.5 border transition-all \${showVideoControls ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500' : 'bg-black/40 border-zinc-800 text-zinc-300'}\`}
                            >
                              <span className="text-[11px] font-black uppercase tracking-tighter text-center">비디오빽</span>
                            </button>

                            <button 
                              onClick={() => setIsDelayEnabled(!isDelayEnabled)}
                              className={\`py-2.5 rounded-xl flex flex-col items-center justify-center gap-0.5 border transition-all \${isDelayEnabled ? 'bg-[#00e5ff]/10 border-[#00e5ff] text-[#00e5ff]' : 'bg-black/40 border-zinc-800 text-zinc-300'}\`}
                            >
                              <span className="text-[11px] font-black uppercase tracking-tighter text-center">대기토글</span>
                            </button>

                            <button 
                              onClick={() => setIsAutoAdvanceLoop(!isAutoAdvanceLoop)}
                              className={\`py-2.5 rounded-xl flex flex-col items-center justify-center gap-0.5 border transition-all \${isAutoAdvanceLoop ? 'bg-[#00e5ff]/10 border-[#00e5ff] text-[#00e5ff]' : 'bg-black/40 border-zinc-800 text-zinc-300'}\`}
                            >
                              <span className="text-[11px] font-black uppercase tracking-tighter text-center">루프연계</span>
                            </button>

                            <button 
                              onClick={() => setIsContinuous(!isContinuous)}
                              className={\`py-2.5 rounded-xl flex flex-col items-center justify-center gap-0.5 border transition-all \${isContinuous ? 'bg-[#ff6b35]/10 border-[#ff6b35] text-[#ff6b35]' : 'bg-black/40 border-zinc-800 text-zinc-300'}\`}
                            >
                              <span className="text-[11px] font-black uppercase tracking-tighter text-center">전체반복</span>
                            </button>

                            <button 
                              onClick={() => setIsAutoPause(!isAutoPause)}
                              className={\`py-2.5 rounded-xl flex flex-col items-center justify-center gap-0.5 border transition-all \${isAutoPause ? 'bg-[#ff6b35]/10 border-[#ff6b35] text-[#ff6b35]' : 'bg-black/40 border-zinc-800 text-zinc-300'}\`}
                            >
                              <span className="text-[11px] font-black uppercase tracking-tighter text-center">오토포즈</span>
                            </button>

                            <button 
                              onClick={() => {
                                setIsApiKeyModalOpen(true);
                              }}
                              className="bg-purple-600/20 hover:bg-purple-600/30 py-2.5 rounded-xl border border-purple-500/30 flex flex-col items-center justify-center gap-0.5 text-purple-400 active:scale-95 transition-all shadow-lg"
                            >
                              <span className="text-[11px] font-black uppercase tracking-tighter text-center">API Key</span>
                              <Key size={10} />
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-zinc-700/50">
                          <button 
                            onClick={() => {
                              setPlaybackRate(1.0);
                              setMaxLoops(5);
                              setDelayDuration(1.0);
                              setFontSize(3);
                              setIsContinuous(true);
                              setIsAutoPause(false);
                              setIsDelayEnabled(true);
                              setIsAutoAdvanceLoop(true);
                              setIsSubtitleOnly(false);
                              playerRef.current?.setPlaybackRate(1.0);
                            }}
                            className="bg-zinc-800/80 hover:bg-zinc-700 py-2 rounded-lg border border-zinc-700 flex items-center justify-center gap-2 text-yellow-500 active:scale-95 transition-all shadow-lg"
                          >
                            <RotateCcw size={14} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Reset All Settings</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : rightView === 'scriptEditor' ? (
                    <div className="p-4 h-full flex flex-col overflow-hidden min-h-0">
                      {renderEditor()}
                    </div>
                  ) : (`;

code = code.replace(rightViewContentMatchStr, renderSettingsCode);

const setBtnFindStr = `<button \n                      onClick={() => setShowSettings(!showSettings)}\n`;
const setBtnReplaceStr = `<button \n                      onClick={() => {\n                        if (!isWideLayout) {\n                          setShowSettings(!showSettings);\n                        } else {\n                          setRightView(rightView === 'settings' ? 'scriptLibrary' : 'settings');\n                        }\n                      }}\n`;

code = code.replace(setBtnFindStr, setBtnReplaceStr);

fs.writeFileSync('src/App.tsx', code);
