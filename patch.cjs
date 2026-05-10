const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const startMarker = "2.7.3.4. 이 과정을 전체 transcript를 처음부터 끝까지 순차적으로 반복한다.";
const endMarker = "유튜브 transcript:`);\n  const [isEditingPrompt, setIsEditingPrompt] = useState(false);";

const startIndex = code.indexOf(startMarker);
const endIndex = code.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
    const replacement = `2.7.3.4. 이 과정을 전체 transcript를 처음부터 끝까지 순차적으로 반복한다.

4. 문장이 길어지는 경우: 여러 단락을 하나의 문장으로 합치는 규칙 적용
4.1. 원문에서 문장이 여러 줄에 걸쳐 흩어져 있지만,
의미 흐름이 하나의 문장 단위를 이루는 경우, 여러 줄을 하나의 완전한 문장으로 자연스럽게 연결한다.
4.2. 원문 단어는 절대 수정하지 않고, 단지 공백을 줄여서 문자열로 이어 붙인다.
4.3. 이때 해당 “묶음”의 시간은 첫 줄의 타임스탬프를 기준으로 하고,
이후 분리된 하위 문장들에 대해 2.7.3 규칙을 적용한다. 

5. 제목과 URL은 반드시 원문 그대로 유지한다.
5.1. 첫 줄: Title
5.2. 둘째 줄: URL (링크 변환 금지, 일반 텍스트 유지) 
6. [Music], [Applause], [Laughter] 같은 비언어 요소는 제거한다. 
7. 마지막에 반드시 한 줄 추가한다.
7.1. The end 
8. "The end"의 타임스탬프:
8.1. 직전에 출력된 마지막 문장의 타임스탬프 + (그 문장 단어 수 × 0.1초)
8.2. 결과를 0.1초 단위로 반올림한다. 
9. 출력 앞뒤에 어떤 설명, 주석, 안내문도 추가하지 않는다.
10. 굵게, 기울임, 코드블록 등 모든 스타일 요소 사용 금지한다.

[출력 형식 — 반드시 3줄 구조 유지]
1. 각 문장은 반드시 아래 3줄로 구성한다. 
1.1. 1번째 줄:
    * (타임스탬프) 영어 원문

1.2. 2번째 줄:
    * 한글 번역
    * 직역 우선
    * 필요 시 괄호로 의역 추가
    * 타임스탬프 금지

1.3. 3번째 줄:
    * 문법 설명 (300~500자)
    * 형식은 반드시 아래 패턴을 따른다.
        * 표현1: 의미(뉘앙스); 표현2: 의미(뉘앙스); 표현3: 의미(뉘앙스); ...;
        * 문법: 핵심구조 + 시제/절/태 + 문장 내 역할 + 왜 이런 구조인지;
        * 해석팁: 전체 의미 흐름 설명

[문법 설명 규칙]
1. 영어 강사처럼 정확하고 체계적으로 작성한다.
2. 단순 설명 금지 (깊이 있게 분석).
3. 자연스럽지만 전문적으로 작성한다.
4. 스타일 기호 사용 금지한다.

[중요 제한]
1. 문장 누락 절대 금지한다.
2. 문맥이 다른 문장끼리 합치지 말 것.
3. 내용 단순화 금지한다.
4. 반드시 시간 순서를 유지한다.
5. 문법 설명은 항상 충분히 상세하게 작성한다.

유튜브 transcript:\`);
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);`;

    code = code.substring(0, startIndex) + replacement + code.substring(endIndex + endMarker.length);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Success");
} else {
    console.log("Markers not found", startIndex, endIndex);
}
