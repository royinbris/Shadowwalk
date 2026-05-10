const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/grid-cols-\[repeat\(auto-fill,minmax\(320px,1fr\)\)\]/g, 'grid-cols-[repeat(auto-fill,minmax(min(100%,320px),1fr))]');

fs.writeFileSync('src/App.tsx', code);
