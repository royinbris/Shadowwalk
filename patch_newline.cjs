const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
    '{isSplitStudy && renderLargeControls()}\\n              </aside>',
    '{isSplitStudy && renderLargeControls()}\n              </aside>'
);

fs.writeFileSync('src/App.tsx', code);
console.log("Fixed newline");
