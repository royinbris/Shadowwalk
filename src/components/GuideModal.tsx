import React from 'react';
import {
  X, Printer, BookOpen, Headphones, Mic, Repeat, Settings,
  FileText, Hand, Keyboard, Sliders, Bot, Save, Sparkles
} from 'lucide-react';

interface GuideModalProps {
  onClose: () => void;
}

const Dot = ({ color = 'bg-blue-500' }: { color?: string }) => (
  <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${color}`} />
);

const Row = ({ term, children, color }: { term: string; children: React.ReactNode; color?: string }) => (
  <li className="flex items-start gap-3">
    <Dot color={color} />
    <div>
      <strong className="text-zinc-900 dark:text-zinc-100 block mb-0.5">{term}</strong>
      {children}
    </div>
  </li>
);

const Card = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
  <section className="space-y-5 bg-white dark:bg-zinc-900/30 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800/50 shadow-sm dark:shadow-none break-inside-avoid">
    <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4">
      {icon}
      <h3 className="text-lg font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-100">{title}</h3>
    </div>
    <ul className="space-y-3.5 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
      {children}
    </ul>
  </section>
);

const Key = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-block font-mono text-[11px] font-bold text-yellow-600 dark:text-yellow-500 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded px-1.5 py-0.5 mx-0.5">
    {children}
  </span>
);

export const GuideModal: React.FC<GuideModalProps> = ({ onClose }) => {
  const handlePrint = () => window.print();

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-200 overflow-hidden animate-in fade-in duration-200 h-[100dvh]">
      {/* Header */}
      <div
        className="flex-none flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/50 backdrop-blur-md no-print"
        style={{
          paddingTop: "calc(1rem + env(safe-area-inset-top))",
          paddingRight: "calc(1rem + env(safe-area-inset-right))",
          paddingLeft: "calc(1rem + env(safe-area-inset-left))",
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-blue-400" />
          </div>
          <h2 className="text-xl font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100">User Guide</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors text-zinc-700 dark:text-zinc-300"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 flex items-center justify-center transition-colors text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:px-24 xl:px-48 custom-print-area">
        <div className="max-w-4xl mx-auto space-y-10 pb-20">

          {/* Intro */}
          <section className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 uppercase tracking-tighter">
              Welcome to Shadowwalk
            </h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
              Shadowwalk는 유튜브 영상이나 내 음원 파일을 기반으로 영어 듣기·말하기(섀도잉)를 훈련하는 도구입니다.
              아래 순서대로 따라 하면 <strong className="text-zinc-800 dark:text-zinc-200">스크립트 만들기 → 학습 → 저장·복습</strong>까지 전 과정을 익힐 수 있습니다.
            </p>
          </section>

          {/* 1. 전체 흐름 */}
          <Card icon={<BookOpen className="w-5 h-5 text-emerald-400" />} title="전체 흐름 (5초 요약)">
            <Row term="① 스크립트 만들기" color="bg-emerald-500">
              라이브러리에서 <strong>New</strong>를 눌러 에디터에 자막을 붙여넣고, 필요하면 <strong>AI 정제</strong>로 번역·문법을 자동 생성합니다.
            </Row>
            <Row term="② 저장" color="bg-emerald-500">
              <strong>Save</strong>로 앱(라이브러리)에 저장하면 학습 화면으로 들어갑니다.
            </Row>
            <Row term="③ 학습" color="bg-emerald-500">
              화면 <strong>탭·스와이프 제스처</strong>와 <strong>Study Settings</strong>로 자동정지·반복·녹음을 활용해 섀도잉합니다.
            </Row>
            <Row term="④ 백업·복습" color="bg-emerald-500">
              카드의 <strong>저장(파일)</strong> 버튼으로 iCloud 등에 내보내고, <strong>불러오기</strong>로 다른 기기에서 이어 학습합니다.
            </Row>
          </Card>

          {/* 2. 스크립트 에디터 */}
          <Card icon={<Sparkles className="w-5 h-5 text-purple-400" />} title="① 스크립트 에디터 (Script Editor)">
            <p className="text-zinc-500 dark:text-zinc-400 -mt-1">
              유튜브 자막(타임코드 포함)이나 SRT/TXT를 붙여넣어 학습용 스크립트를 만듭니다.
              형식은 <code className="text-[12px] bg-zinc-100 dark:bg-zinc-800 px-1 rounded">Title:</code> / <code className="text-[12px] bg-zinc-100 dark:bg-zinc-800 px-1 rounded">URL:</code> 줄과 <code className="text-[12px] bg-zinc-100 dark:bg-zinc-800 px-1 rounded">(0:03.0) 문장</code> 형태입니다.
            </p>
            <Row term="AI 정제" color="bg-purple-500">
              본문을 AI에게 보내 한글 번역과 문법 설명을 문장마다 자동으로 채웁니다. (API 키 필요)
            </Row>
            <Row term="자동 수정" color="bg-purple-500">
              <code className="text-[12px] bg-zinc-100 dark:bg-zinc-800 px-1 rounded">12:34</code> 같은 시간 표기를 학습용 <code className="text-[12px] bg-zinc-100 dark:bg-zinc-800 px-1 rounded">(12:34)</code> 형식으로 일괄 변환합니다. (시간 표기가 감지될 때만 표시)
            </Row>
            <Row term="SRT 열기 / TXT 열기" color="bg-purple-500">
              자막 파일을 직접 불러와 본문 칸을 채웁니다.
            </Row>
            <Row term="프롬프트" color="bg-purple-500">
              AI 정제에 사용할 지시문(번역 톤, 문법 설명 방식 등)을 직접 편집합니다.
            </Row>
            <Row term="API" color="bg-purple-500">
              AI 제공자(Gemini / Cerebras / OpenRouter)와 API 키를 등록·테스트합니다.
            </Row>
            <Row term="영문만" color="bg-purple-500">
              번역·문법 줄을 잠시 숨겨 영어 원문만 보기/되돌리기를 토글합니다.
            </Row>
            <Row term="인쇄 (EN / ALL)" color="bg-purple-500">
              영어 문장만 또는 전체(번역·문법 포함)를 인쇄용 창으로 출력합니다.
            </Row>
            <Row term="복사 (ALL / EN / Title / URL)" color="bg-purple-500">
              전체·영어만·제목·URL을 각각 클립보드로 복사합니다.
            </Row>
            <Row term="저장 / Save" color="bg-purple-500">
              <strong>Save</strong>는 앱 라이브러리에 저장, <strong>저장</strong>은 .json 파일로 내보내기(파일 선택창)입니다.
            </Row>
          </Card>

          {/* 3. 라이브러리 */}
          <Card icon={<FileText className="w-5 h-5 text-sky-400" />} title="② 라이브러리 (Saved Scripts)">
            <Row term="New" color="bg-sky-500">빈 에디터를 열어 새 스크립트를 작성합니다.</Row>
            <Row term="음원+TXT" color="bg-sky-500">
              내 음원/영상 파일(mp3·m4a·mp4)과 자막 파일(txt·srt·json)을 <strong>함께</strong> 선택해 로컬 스크립트를 만듭니다.
            </Row>
            <Row term="불러오기" color="bg-sky-500">
              파일 선택창에서 .json 스크립트를 가져옵니다. 아이폰·맥의 <strong>파일 앱 / iCloud Drive</strong>에 접근할 수 있어 기기 간 이어 학습이 가능합니다.
            </Row>
            <Row term="박스 / 리스트 토글" color="bg-sky-500">
              저장된 스크립트를 카드(박스)형 또는 한 줄 리스트형으로 전환합니다. 선택은 자동 기억됩니다.
            </Row>
            <Row term="카드의 저장 / X" color="bg-sky-500">
              각 카드의 <strong>저장</strong>은 해당 스크립트를 파일로 내보내기, <strong>X</strong>는 삭제입니다. 카드 본문을 누르면 학습이 시작됩니다.
            </Row>
          </Card>

          {/* 4. 제스처 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card icon={<Hand className="w-5 h-5 text-blue-400" />} title="③ 화면 탭 제스처">
              <p className="text-zinc-500 dark:text-zinc-400 -mt-1">화면을 좌(25%)·중앙(50%)·우(25%)로 나눠, 누르는 횟수에 따라 동작이 달라집니다.</p>
              <Row term="왼쪽 25%" color="bg-blue-500">
                1회: 이전 문장 · 2회: 자동 멈춤 On/Off · 3회: 비디오백 패널
              </Row>
              <Row term="오른쪽 25%" color="bg-blue-500">
                1회: 다음 문장 · 2회: 구문 반복(루프 모드) · 3회: 가이드 열기
              </Row>
              <Row term="중앙 50%" color="bg-emerald-500">
                1회: 재생/일시정지 · 2회: 동기화(설정) 패널 · 3회: 녹음 패널
              </Row>
            </Card>

            <Card icon={<Sliders className="w-5 h-5 text-orange-400" />} title="③ 스와이프 ↑↓">
              <p className="text-zinc-500 dark:text-zinc-400 -mt-1">화면에서 위아래로 쓸어올리면 영역별로 값이 조절됩니다.</p>
              <Row term="왼쪽 위/아래" color="bg-orange-500">재생 <strong>속도</strong> 조절 (0.5x ~ 1.5x)</Row>
              <Row term="중앙 위/아래" color="bg-orange-500">자막 <strong>글자 크기</strong> 조절</Row>
              <Row term="오른쪽 위/아래" color="bg-orange-500">구간 <strong>반복 횟수</strong> 조절 (OFF / 숫자 / ∞)</Row>
            </Card>
          </div>

          {/* 5. Study Settings */}
          <Card icon={<Settings className="w-5 h-5 text-yellow-400" />} title="④ Study Settings — 다이얼 (값 조절)">
            <p className="text-zinc-500 dark:text-zinc-400 -mt-1">중앙 2회 탭으로 여는 설정 패널의 세로 다이얼들입니다. 위아래로 돌려 값을 바꿉니다.</p>
            <Row term="영상 크기 / 영자 크기 / 한문 크기" color="bg-cyan-500">
              영상 화면 배율(0~5단계), 영어 자막·한글 자막 글자 크기(1~7단계)를 각각 조절합니다.
            </Row>
            <Row term="재생 속도" color="bg-orange-500">0.5x~1.5x. 느린 속도로 연음·발음을 정확히 듣는 데 유용합니다.</Row>
            <Row term="재생 빽 (Seek Back)" color="bg-purple-500">
              문장으로 이동할 때 그 직전 지점에서 설정한 초(0~5초)만큼 앞당겨 재생을 시작합니다.
            </Row>
            <Row term="재생 반복" color="bg-emerald-500">한 구간을 몇 번 반복할지(0~20회). 0이면 반복 끄기입니다.</Row>
            <Row term="재생 대기" color="bg-cyan-500">자동정지나 반복 사이에 따라 말할 시간을 주는 대기 시간(0~10초)입니다.</Row>
          </Card>

          <Card icon={<Settings className="w-5 h-5 text-orange-400" />} title="④ Study Settings — 토글 (On/Off)">
            <Row term="영상전용 / 자막전용" color="bg-orange-500">
              영상만 보거나(자막 숨김), 자막만 보기(영상 정지). 둘은 동시에 켜지지 않습니다.
            </Row>
            <Row term="터치조작" color="bg-orange-500">영상 위 기본 컨트롤(재생바 등) 표시 여부입니다.</Row>
            <Row term="연속재생" color="bg-orange-500">문장이 끝나면 다음 문장으로 끊김 없이 이어 재생합니다.</Row>
            <Row term="대기시간" color="bg-yellow-500">
              대기 모드 전환(끄기 → 노랑 → 청록). 문장 간 따라 말하기 텀을 주는 방식입니다.
            </Row>
            <Row term="자동정지 (Auto-Pause)" color="bg-orange-500">문장이 끝날 때마다 자동으로 멈춰 섀도잉 시간을 확보합니다.</Row>
            <Row term="자동진행" color="bg-orange-500">반복이 끝나면 자동으로 다음 문장으로 넘어갑니다.</Row>
            <Row term="싱크패널 / 녹음패널" color="bg-orange-500">
              하단에 싱크 조절 다이얼 또는 녹음 컨트롤을 표시합니다. (둘 중 하나만 열림)
            </Row>
            <Row term="Gesture Guide / API Key Settings" color="bg-zinc-400">
              제스처 요약 카드를 열거나 AI API 키를 설정합니다. 아래 <strong>테마</strong>로 색상 변경, <strong>Reset All Settings</strong>로 기본값 복원이 가능합니다.
            </Row>
          </Card>

          {/* 6. 핵심 기능 */}
          <Card icon={<Repeat className="w-5 h-5 text-orange-400" />} title="핵심 학습 기능">
            <Row term="Auto-Pause (자동 일시정지)" color="bg-orange-500">
              문장 끝마다 멈춰, 방금 들은 문장을 곧바로 따라 말할 수 있게 합니다.
            </Row>
            <Row term="Loop (구간 반복)" color="bg-orange-500">
              한 문장 또는 구문 묶음을 정한 횟수(또는 무한)만큼 반복합니다. 안 들리는 연음·억양을 집중 공략할 때 필수입니다.
            </Row>
            <Row term="Sync (싱크 조절)" color="bg-orange-500">
              자막과 소리가 어긋날 때 싱크 패널 다이얼로 0.1초 단위로 자막 타이밍을 맞춥니다.
            </Row>
            <Row term="녹음 패널" color="bg-red-500">
              내 발음을 녹음(<Key>B</Key> 시작 / <Key>N</Key> 종료)하고 원어민 발음(<Key>V</Key>)과 번갈아 들으며 비교합니다.
            </Row>
          </Card>

          {/* 7. AI 도우미 */}
          <Card icon={<Bot className="w-5 h-5 text-blue-400" />} title="AI 도우미 (Gemini)">
            <Row term="질문 보내기" color="bg-blue-500">
              모르는 단어·표현을 입력하면 AI가 뜻과 용법을 설명합니다. 단축키 <Key>A</Key>로 패널을 엽니다.
            </Row>
            <Row term="현재 문장 복사" color="bg-blue-500">
              좌측 버튼은 지금 보고 있는 문장을 입력칸에 채워, 그 문장에 대해 바로 질문할 수 있게 합니다.
            </Row>
            <Row term="단어/TTS" color="bg-purple-500">
              <Key>C</Key>로 단어 듣기(TTS)를 사용할 수 있습니다.
            </Row>
          </Card>

          {/* 8. 키보드 단축키 */}
          <Card icon={<Keyboard className="w-5 h-5 text-cyan-400" />} title="키보드 단축키 (PC)">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2.5 text-sm not-italic">
              {[
                ['속도', '- / ='], ['영상 크기', '_ / +'], ['글자 크기', "; / '"],
                ['반복 횟수', '[ / ]'], ['구문 Loop', 'L'], ['커스텀 Loop', 'X'],
                ['전체 화면', 'Z / Enter'], ['전체 반복', 'R'], ['대기 모드', 'W'],
                ['자동정지', 'P'], ['단어/TTS', 'C'], ['Gemini', 'A'],
                ['세팅 모달', 'S'], ['녹음 시작', 'B'], ['녹음 종료', 'N'],
                ['발음 재생', 'V'], ['녹음 패널', '\\'], ['백버튼 패널', 'Q'],
                ['영상 전용', 'F'], ['자막 전용', 'T'],
              ].map(([label, key]) => (
                <div key={label} className="flex items-center justify-between gap-2 border-b border-zinc-200/60 dark:border-zinc-800/60 pb-1">
                  <span className="text-zinc-600 dark:text-zinc-400">{label}</span>
                  <span className="text-right">{key.split(' / ').map((k, i) => (
                    <React.Fragment key={k}>{i > 0 && <span className="text-zinc-400 text-xs"> / </span>}<Key>{k}</Key></React.Fragment>
                  ))}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Shadowing Tips */}
          <section className="space-y-6 mt-4 bg-blue-50 dark:bg-blue-950/20 p-8 rounded-3xl border border-blue-200 dark:border-blue-900/30 relative overflow-hidden break-inside-avoid">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Headphones className="w-48 h-48 text-blue-500" />
            </div>
            <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-3 border-b border-blue-200 dark:border-blue-900/50 pb-4">
                <Mic className="w-6 h-6 text-blue-400" />
                <h3 className="text-2xl font-black uppercase tracking-widest text-blue-400">How to Master Shadowing</h3>
              </div>
              <div className="space-y-6 text-zinc-700 dark:text-zinc-300">
                <div className="bg-white/80 dark:bg-black/20 p-6 rounded-2xl border border-zinc-200 dark:border-blue-500/10">
                  <h4 className="text-lg font-bold text-zinc-900 dark:text-white mb-2 flex items-center gap-2">
                    <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">Step 1</span>
                    자막 없이 소리에만 집중
                  </h4>
                  <p className="leading-relaxed">
                    <strong className="text-blue-500">자막전용을 끄고</strong> 들리는 소리(연음·강세·리듬)에만 귀를 기울이세요. 전체 흐름과 맥락을 유추하는 것이 듣기 향상의 핵심입니다.
                  </p>
                </div>
                <div className="bg-white/80 dark:bg-black/20 p-6 rounded-2xl border border-zinc-200 dark:border-emerald-500/10">
                  <h4 className="text-lg font-bold text-zinc-900 dark:text-white mb-2 flex items-center gap-2">
                    <span className="bg-emerald-600 text-white text-xs px-2 py-0.5 rounded-full">Step 2</span>
                    Auto-Pause로 끊어 듣고 확인
                  </h4>
                  <p className="leading-relaxed">
                    자막을 켜고 <strong className="text-emerald-400">자동정지</strong>를 활성화하세요. 문장이 끝날 때마다 멈추면, 들은 소리와 실제 텍스트를 대조하며 놓친 단어·연음을 확인합니다.
                  </p>
                </div>
                <div className="bg-white/80 dark:bg-black/20 p-6 rounded-2xl border border-zinc-200 dark:border-orange-500/10">
                  <h4 className="text-lg font-bold text-zinc-900 dark:text-white mb-2 flex items-center gap-2">
                    <span className="bg-orange-600 text-white text-xs px-2 py-0.5 rounded-full">Step 3</span>
                    Loop + 녹음으로 똑같이 따라 말하기
                  </h4>
                  <p className="leading-relaxed">
                    어려운 문장은 <strong className="text-orange-400">Loop</strong>로 반복시키고, <strong className="text-red-400">녹음 패널</strong>로 내 발음을 녹음해 원어민과 번갈아 들으며 비교하세요. 내 목소리가 원어민과 화음처럼 겹칠 때까지 반복합니다.
                  </p>
                </div>
                <div className="bg-white/80 dark:bg-black/20 p-6 rounded-2xl border border-zinc-200 dark:border-purple-500/10">
                  <h4 className="text-lg font-bold text-zinc-900 dark:text-white mb-2 flex items-center gap-2">
                    <span className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full">Step 4</span>
                    파일로 저장하고 복습
                  </h4>
                  <p className="leading-relaxed">
                    학습한 스크립트는 <Save className="inline w-4 h-4 mb-0.5 text-purple-400" /> <strong className="text-purple-400">저장</strong> 버튼으로 iCloud 등에 내보내 두세요. 다른 기기에서 <strong>불러오기</strong>로 열어 자투리 시간에 복습하면 기억에 훨씬 오래 남습니다.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <div className="text-center pt-8 border-t border-zinc-200 dark:border-zinc-800/50">
            <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">
              Consistent practice is the key to fluency.
            </p>
          </div>

        </div>
      </div>

      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          .custom-print-area, .custom-print-area * { visibility: visible; }
          .custom-print-area {
            position: absolute; left: 0; top: 0; width: 100%;
            background: white !important; color: black !important; overflow: visible !important;
          }
          .custom-print-area p, .custom-print-area li, .custom-print-area span { color: #333 !important; }
          .custom-print-area h1, .custom-print-area h3, .custom-print-area h4, .custom-print-area strong {
            color: #000 !important; -webkit-text-fill-color: #000 !important;
          }
          .no-print { display: none !important; }
        }
      `}} />
    </div>
  );
};
