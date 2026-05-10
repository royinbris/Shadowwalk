const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /if \(err\.message && \(err\.message\.includes\("Forbidden"\) \|\| err\.message\.includes\("403"\)\)\) \{/,
  `if (err.message && err.message.includes("429")) {
        errorMsg = "API 사용량 초과 (429). 너무 많은 요청이 발생했습니다. 잠시 후 1~2분 뒤에 다시 시도해주세요.";
      } else if (err.message && (err.message.includes("Forbidden") || err.message.includes("403"))) {`
);

code = code.replace(
  /setError\("AI 정제 중 오류가 발생했습니다: " \+ \(err\.message \|\| "알 수 없는 오류"\)\);/,
  `if (err.message && err.message.includes("429")) {
        setError("API 사용량 초과. 잠시 후 다시 시도해주세요.");
      } else {
        setError("AI 정제 중 오류가 발생했습니다: " + (err.message || "알 수 없는 오류"));
      }`
);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched errors!");
