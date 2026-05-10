const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `                  <div className="flex-shrink-0 flex flex-col px-0 pt-1 pb-1 bg-zinc-950 select-none border-4 border-zinc-700 rounded-none mx-2 mt-1 mb-0.5 overflow-y-auto hide-scrollbar shadow-2xl transition-all duration-300">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentIndex}`;

const replacementStr = `                  <div className="flex-shrink-0 flex flex-col px-0 pt-1 pb-1 bg-zinc-950 select-none border-4 border-zinc-700 rounded-none mx-2 mt-1 mb-0.5 overflow-y-auto hide-scrollbar shadow-2xl transition-all duration-300">
                    <AnimatePresence mode="wait">
                      {transcript.length > 0 ? (
                      <motion.div
                        key={currentIndex}`;

code = code.replace(targetStr, replacementStr);

const targetEndStr = `                          )}
                        </motion.div>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                ) : (
                  /* STANDARD MODE: Full Area Gestures */`;

const replacementEndStr = `                          )}
                        </motion.div>
                      </motion.div>
                      ) : (
                        <div className="text-zinc-500 space-y-4 py-8 text-center w-full min-h-[150px] flex flex-col items-center justify-center relative z-10" key="empty-integrated">
                          <Languages className="w-12 h-12 mx-auto opacity-20" />
                          <p className="text-sm font-medium uppercase tracking-widest opacity-50">No transcript loaded</p>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  /* STANDARD MODE: Full Area Gestures */`;

code = code.replace(targetEndStr, replacementEndStr);

fs.writeFileSync('src/App.tsx', code);
console.log("Done");
