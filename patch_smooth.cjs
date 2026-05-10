const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Restore the JSX rendering (remove Video Only Mode text, show subtitles always)
const targetJSXRegex = /\{isVideoOnly \? \([\s\S]*?<span className="text-zinc-600 font-bold tracking-widest text-sm uppercase">Video Only Mode<\/span>[\s\S]*?<\/motion\.div>\s*\) : transcript\.length > 0 \? \(/g;
code = code.replace(targetJSXRegex, '{transcript.length > 0 ? (');

// 2. Change interval logic to handle isVideoOnly smoothly
const intervalStart = `      checkIntervalRef.current = window.setInterval(() => {
        // Lockdown: Do not perform any auto-pause/sync logic while recording, reviewing voice, or just after resuming
        if (isRecordingRef.current || isPlayingRecordedRef.current || isResumingAfterRecordRef.current) return;

        let currentTime = 0;
        
        if (currentProject?.isVideoLocal) {
          if (!videoRef.current) return;
          currentTime = videoRef.current.currentTime;
        } else {
          if (!playerRef.current) return;
          currentTime = playerRef.current.getCurrentTime();
        }`;

const smoothLogic = `

        // If Video Only mode, just play smoothly and only sync the subtitle index
        if (isVideoOnly) {
          const matchingIndex = transcript.findIndex((s, i) => {
            const nextOffset = transcript[i+1]?.offset || s.offset + s.duration + 5;
            return currentTime >= s.offset && currentTime < nextOffset;
          });
          if (matchingIndex !== -1 && matchingIndex !== currentIndex) {
            setCurrentIndex(matchingIndex);
          }
          return; // Do nothing else!
        }`;

code = code.replace(intervalStart, intervalStart + smoothLogic);

// We also need to restore the progress bar and buttons visibility
const targetProgress = '{/* Progress Indicator */}\n              {transcript.length > 0 && !isVideoOnly && (';
code = code.replace(targetProgress, '{/* Progress Indicator */}\n              {transcript.length > 0 && (');

fs.writeFileSync('src/App.tsx', code);
console.log("Done");
