const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace z and x
const zxRegex = /case 'z':\s*case 'Z':\s*case 'ㅋ':\s*e\.preventDefault\(\);\s*setVideoScale\(prev => Math\.max\(1, prev - 1\)\);\s*break;\s*case 'x':\s*case 'X':\s*case 'ㅌ':\s*e\.preventDefault\(\);\s*setVideoScale\(prev => Math\.min\(5, prev \+ 1\)\);\s*break;/g;
code = code.replace(zxRegex, `case '{':
          e.preventDefault();
          setSplitRatio(prev => Math.max(20, prev - 5));
          break;
        case '}':
          e.preventDefault();
          setSplitRatio(prev => Math.min(80, prev + 5));
          break;`);

const plusMinusRegex = /case '\\+':\s*case '=':\s*e\.preventDefault\(\);\s*setPlaybackRate\(prev => Math\.min\(2\.0, Number\(\(prev \+ 0\.1\)\.toFixed\(1\)\)\)\);\s*break;\s*case '-':\s*case '_':\s*e\.preventDefault\(\);\s*setPlaybackRate\(prev => Math\.max\(0\.5, Number\(\(prev - 0\.1\)\.toFixed\(1\)\)\)\);\s*break;/g;

code = code.replace(plusMinusRegex, `case '=':
          e.preventDefault();
          setPlaybackRate(prev => Math.min(2.0, Number((prev + 0.1).toFixed(1))));
          break;
        case '-':
          e.preventDefault();
          setPlaybackRate(prev => Math.max(0.5, Number((prev - 0.1).toFixed(1))));
          break;
        case '_':
          e.preventDefault();
          setVideoScale(prev => Math.max(0, prev - 1));
          break;
        case '+':
          e.preventDefault();
          setVideoScale(prev => Math.min(5, prev + 1));
          break;`);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched keys");
