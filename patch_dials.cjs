const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const newDials = `<VerticalDial 
                              label="영상 크기"
                              unit="단계"
                              value={videoScale}
                              min={0}
                              max={5}
                              step={1}
                              color="cyan"
                              onChange={setVideoScale}
                            />

                            <VerticalDial 
                              label="재생 속도"
                              unit="배속"
                              value={playbackRate}
                              min={0.5}
                              max={1.5}
                              step={0.1}
                              color="orange"
                              onChange={(val) => {
                                setPlaybackRate(val);
                                playerRef.current?.setPlaybackRate(val);
                              }}
                            />

                            <VerticalDial 
                              label="재생 빽"
                              unit="초"
                              value={seekBackDuration}
                              min={0}
                              max={3}
                              step={0.5}
                              color="purple"
                              onChange={setSeekBackDuration}
                            />

                            <VerticalDial 
                              label="재생 반복"
                              unit="회"
                              value={maxLoops}
                              min={0}
                              max={20}
                              step={1}
                              color="emerald"
                              onChange={(val) => {
                                setMaxLoops(val);
                                if (val === 0) setIsLooping(false);
                                else if (maxLoops === 0 && val > 0) setIsLooping(true);
                              }}
                            />

                            <VerticalDial 
                              label="재생 대기"
                              unit="초"
                              value={delayDuration}
                              min={0}
                              max={10}
                              step={0.5}
                              color="cyan"
                              onChange={setDelayDuration}
                            />

                            <VerticalDial 
                              label="영자 크기"
                              unit="단계"
                              value={fontSize}
                              min={1}
                              max={7}
                              step={1}
                              color="orange"
                              onChange={setFontSize}
                            />

                            <VerticalDial 
                              label="한문 크기"
                              unit="단계"
                              value={krFontSize}
                              min={1}
                              max={7}
                              step={1}
                              color="purple"
                              onChange={setKrFontSize}
                            />`;

// There are two occurrences of this block of code:
const regex = /<VerticalDial\s+label="속도"[\s\S]*?onChange={setVideoScale}\s*\/>/g;

code = code.replace(regex, newDials);

fs.writeFileSync('src/App.tsx', code);
console.log("Replaced Dials successfully.");
