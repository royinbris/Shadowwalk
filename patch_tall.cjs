const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
    ' className="flex-1 h-[42px] min-h-[42px] py-3 px-3',
    ' className="flex-1 h-[44px] min-h-[44px] py-2.5 px-3'
);
code = code.replace(/h-\[42px\]/g, 'h-[44px]');
code = code.replace(/w-\[42px\]/g, 'w-[44px]');
code = code.replace(/<FileText size={18} \/>/g, '<FileText size={20} />');
code = code.replace(/<Search size={18} \/>/g, '<Search size={20} />');

fs.writeFileSync('src/App.tsx', code);
