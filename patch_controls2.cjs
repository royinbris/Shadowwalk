const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "\\\\'pb-[260px]\\\\'",
  "'pb-[260px]'"
);
code = code.replace(
  "\\\\'\\\\'",
  "''"
);
// In case the above didn't match, let's just do a regex replace on \'
code = code.replace(/\\\'pb-\[260px\]\\\'/g, "'pb-[260px]'");
code = code.replace(/\\\'\\\'/g, "''");

fs.writeFileSync('src/App.tsx', code);
console.log("Success");
