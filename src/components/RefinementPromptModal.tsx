import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, X } from 'lucide-react';

interface RefinementPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  refinementPrompt: string;
  setRefinementPrompt: (val: string) => void;
}

export const RefinementPromptModal = ({
  isOpen,
  onClose,
  refinementPrompt,
  setRefinementPrompt
}: RefinementPromptModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-8"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-2xl flex flex-col h-full max-h-[90vh]"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <Settings className="text-purple-500" size={20} />
                </div>
                <h3 className="text-base font-black uppercase tracking-tighter">AI 프롬프트 수정</h3>
              </div>
              <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <textarea
              value={refinementPrompt}
              onChange={(e) => setRefinementPrompt(e.target.value)}
              className="flex-1 w-full bg-zinc-950 text-zinc-300 text-base p-6 rounded-2xl border border-zinc-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none resize-none font-sans leading-relaxed mb-6 hide-scrollbar"
              placeholder="AI에게 지시할 내용을 입력하세요..."
            />

            <div className="flex gap-3">
              <button 
                onClick={() => {
                  setRefinementPrompt(`아래에 첨부된 영어 문장들은 YouTube 영상에서 추출한 리스닝 연습용 transcript입니다. 아래 규칙에 따라 정리해 주세요.

[처리 규칙]
1. 타임스탬프가 붙어 쪼개진 문구들을 자연스러운 문장으로 연결한다.
2. 각 문장은 가능한 최소 10단어 이상, 50단어 이하로 유지한다.
3. 50단어를 초과하면 의미 단위가 끊기지 않는 지점(접속사, 관계절, 분사구문, 전치사구 경계 등)을 우선 기준으로 2문장으로 나눈다.
4. 한 단어짜리 문장은 만들지 않는다. 반드시 앞이나 뒤 문장에 포함시킨다. 특히 Mr, Mrs 등 호칭과 이름은 반드시 이어져야 편집.
5. 단어를 수정하거나, 문법적으로 교정하거나, 번역투에 맞게 바꾸거나, 요약하지 않는다. 영어 원문은 그대로 유지한다.
6. 각 문장 앞에는 해당 문장의 시작 타임스탬프를 원문 형식 그대로 붙인다.
7. 한 문장이 둘로 나뉘는 경우, 두 번째 문장의 타임스탬프는 원래 문장의 시작 타임스탬프에 (앞문장으로 분리된 단어 수 × 0.1초)를 더해 계산한다.
8. 제목과 URL이 있으면 제목부터 URL까지 원문 그대로 포함한다. URL은 링크로 바꾸지 말고 일반 텍스트로 둔다.
9. 원문이 제목 없이 URL로 시작하면, transcript 내용을 바탕으로 자연스러운 영어 제목을 첫 줄에 추가한 뒤 그다음 줄에 URL을 넣는다.
10. [Music], [Applause], [Laughter] 같은 비언어 표시는 출력에서 제외한다.
11. 마지막에는 “The end”라는 문장을 별도로 1줄 추가한다.
12. “The end” 문장의 앞에 타임스탬프를 추가하는데, 타임스탬프는 바로 앞 문장의 타임스탬프에 (그 문장의 단어 수 × 0.2초)를 더해 계산한다. 예시; (5:03) The end.
13. 출력 앞뒤에는 설명, 라벨, 인사말, 질문, 주석 등 불필요한 내용을 절대 붙이지 않는다.
14. 문법 설명에는 굵게, 기울임, 코드표시, 수식표시 같은 스타일 기호를 사용하지 않는다.

[출력 형식]
각 항목은 아래 3줄 형식으로 출력한다.
타임스탬프 포함 영어 원문
한글 번역 (직역 우선, 필요하면 괄호로 의역 병기, 타임 스탬프 안붙임)
문법적 설명(분석 형식: "[표현1]: 의미(뉘앙스); [표현2]: 의미(뉘앙스); [표현3]: 의미(뉘앙스); 문법: 핵심구조+시제/절/태+구문 역할+왜이렇게; 해석팁: 전체 흐름" 전문 영어 교사처럼 정확·상세하게, 최대 200자. 출처 병기하지 마.)

유튜브 transcript:`);
                }}
                className="px-6 py-4 bg-zinc-800 text-zinc-400 text-xs font-black uppercase tracking-widest rounded-2xl hover:text-white transition-all"
              >
                초기화
              </button>
              <button 
                onClick={onClose}
                className="flex-1 py-4 bg-purple-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl active:scale-95 transition-all shadow-lg shadow-purple-600/20"
              >
                저장 후 닫기
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
