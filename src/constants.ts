export const DEFAULT_ANALYSIS_PROMPT = `[Instruction]
Respond in a result-first, high-density format for this sentence.

[Format]
Deep Grammar Analysis (한국어)
Key Nuance/Context (한국어)
2–3 short example sentences using similar structure

[Rules]
Answer first, no explanation before results
Each element MUST be on a separate line
Never merge lines into a paragraph
Keep each line short and readable
No filler, no repetition
Use **bolding** (lavender) for key terms.
No greetings/closings

[Constraint]
≤ 300 characters`;

export const DEFAULT_QUERY_PROMPT = `[Instruction]
Respond in a result-first, high-density format.
If the user's query is in Korean, you MUST answer entirely in Korean (한국어로 답변).

[Type Handling]
Word:
Dictionary meaning (Korean)
Synonyms (comma-separated)
Contextual meaning (한국어)
2–3 short example sentences

Phrase/Sentence:
Contextual meaning (한국어)
Natural alternatives (≥3)
1–2 short example sentences

[Rules]
Answer first, no explanation before results
Do not use labels (EN/KR 등 금지)
Each element MUST be on a separate line
Never merge lines into a paragraph
Keep each line short and readable
No filler, no repetition
Never combine meaning and synonyms in one line
Use **bolding** (lavender) for key terms.

[Constraint]
≤ 300 characters (soft limit; prioritize clarity and line breaks)

[Formatting Rules]
One function per line only
Synonyms must be comma-separated
Each example must be on its own line
No greetings/closings`;

export const DEFAULT_REFINEMENT_PROMPT = `당신은 타임스탬프가 포함된 YouTube transcript를 입력받는다.
모든 규칙을 반드시 엄격하게 따른다.

1. [목표]
1.1. transcript를 다음 3가지 요소를 포함한 최고의 영어 리스닝 학습 자료로 변환한다.
1.1.1. 자연스럽게 연결된 영어 문장
1.1.2. 한글 번역
1.1.3. 상세하고 구조화된 문법 및 표현 분석 (여러 줄)

2. [처리 규칙]
2.1. 잘린 문장들을 순서에 맞게 자연스러운 완전한 문장으로 연결한다. 가능한 10단어 이상, 50단어 이하로 한다.
2.2. 형용사와 명사 사이, 전치사 뒤, 관사 뒤 등 문법적으로 불완전하게 끝나는 텍스트는 **절대 그대로 두지 마시오.** 반드시 다음 타임스탬프의 텍스트와 병합하여 문맥과 문법이 완벽히 이어지는 하나의 완전한 문장(Complete Sentence)을 구성하시오.
2.3. 원문은 절대 수정하지 않는다. 단어는 그대로 두고 공백만 줄여 이어 붙인다.
2.4. 반복, 어색한 표현, 말버릇(uh, um), 오류까지 그대로 유지한다. (의역/문법 교정 금지)
2.5. 모든 문장은 반드시 (m:ss.x) 형태의 타임스탬프로 시작하고 0.1초 단위까지 표기한다.
2.6. 여러 타임스탬프를 하나로 합칠 경우 첫 타임스탬프를 사용한다.
2.7. 의미 단위 마침표(.)가 있다면 문장을 분리하고, "첫 타임스탬프 + (마침표 이전 단어 수 × 0.3초)"로 새 타임스탬프를 0.1초 단위로 계산한다. (U.S., Dr. 등 약어 예외)

3. [비언어 요소 및 메타 데이터]
3.1. 제목(Title)과 URL은 맨 앞 2줄에 원문 그대로 유지한다.
3.2. [Music], [Applause], [Laughter] 등은 모두 제거한다.
3.3. 맨 마지막 구간이 끝난 뒤 다음 줄에 "The end"를 추가한다.
3.4. "The end"의 타임스탬프는 "직전 문장의 타임스탬프 + (그 문장 단어 수 × 0.3초)"로 계산한다.
3.5. 굵게, 기울임, 코드블록 등의 마크다운 스타일링 기호를 절대 사용하지 않는다.

[출력 형식 — 반드시 문장, 번역, 문법 분석 순서 유지]
각 문장에 대해 아래 형식을 100% 지켜 출력한다.

[1번째 줄] (타임스탬프) 영어 원문 문장
[2번째 줄] 한글 번역 (직역 우선, 필요시 괄호로 의역 표기. 속도/타임스탬프 등 아무런 군더더기 없이 오직 번역만 작성)
[3번째 줄~다음 타임스탬프 이전까지] 문법/표현 상세 분석 (반드시 여러 줄로 나누어 보기 좋게 작성)
- 💡 표현: 핵심 단어나 숙어, 슬랭, 구동사의 뜻과 뉘앙스 정리
- 🔎 문법: 문장의 핵심 구조, 시제, 태, 관계대명사 등 구문 분석
- 🎯 해석 팁: 직독직해(끊어 읽기) 방법이나 원어민의 사고방식 등

(예시 형식)
(0:12.3) So I think what we need to focus on right now is the foundation.
그래서 저는 지금 우리가 집중해야 할 것은 기초라고 생각합니다.
💡 표현
- right now: 바로 지금 (강조)
- foundation: 기초, 토대
🔎 문법
- what we need to focus on: 관계대명사 what이 이끄는 명사절 주어로 단수 취급합니다.
- is: 전체 문장의 본동사(3인칭 단수) / the foundation: 주격 보어입니다.
🎯 해석 팁
- So I think (그래서 제 생각엔) / what we need to focus on right now (지금 우리가 집중해야 할 것은) / is the foundation (기초입니다) 형식으로 의미 단위로 끊어 읽으면 이해하기 쉽습니다.

[중요 제한]
1. 원본 transcript의 첫 단어부터 마지막 단어까지 100% 모두 번역하고 분석한다. 초반부(인트로, 인사말, 음악, 광고 등)를 임의로 삭제하거나 요약하는 것을 절대 금지한다.
2. 어떠한 단어나 문장도 절대로 누락해서는 안 된다. 누락 시 심각한 오류로 간주한다.
3. 결과물 앞뒤로 어떤 부가 설명, 인사말, 주석도 추가하지 않는다. 오직 결과만 출력한다.
4. 모든 분석은 친절한 영어 강사처럼 작성한다.

유튜브 transcript:`;
