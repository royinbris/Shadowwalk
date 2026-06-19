import React from 'react';
import { X, Printer, BookOpen, Headphones, Mic, Repeat, Settings } from 'lucide-react';

interface GuideModalProps {
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-zinc-950 text-zinc-200 overflow-hidden animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex-none flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md no-print">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-blue-400" />
          </div>
          <h2 className="text-xl font-black uppercase tracking-widest text-zinc-100">User Guide & Tips</h2>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors text-zinc-300"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:px-24 xl:px-48 custom-print-area">
        <div className="max-w-4xl mx-auto space-y-12 pb-20">
          
          {/* Intro section */}
          <section className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 uppercase tracking-tighter">
              Welcome to Shadowwalk
            </h1>
            <p className="text-lg text-zinc-400 leading-relaxed font-medium">
              Shadowwalk는 유튜브 영상을 기반으로 영어 듣기(Listening)와 말하기(Speaking)를 극대화할 수 있도록 설계된 강력한 섀도잉(Shadowing) 훈련 도구입니다. 이 가이드를 통해 앱의 모든 기능과 최적의 학습 방법을 익혀보세요.
            </p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Core Features */}
            <section className="space-y-6 bg-zinc-900/30 p-6 rounded-2xl border border-zinc-800/50">
              <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
                <Settings className="w-5 h-5 text-purple-400" />
                <h3 className="text-xl font-bold uppercase tracking-widest text-zinc-100">기본 조작법 (Gestures)</h3>
              </div>
              <ul className="space-y-4 text-zinc-300">
                <li className="flex items-start gap-3">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                  <div>
                    <strong className="text-zinc-100 block mb-0.5">화면 중앙 터치 (1번)</strong>
                    영상을 재생하거나 일시정지합니다.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                  <div>
                    <strong className="text-zinc-100 block mb-0.5">화면 좌/우 터치 (1번)</strong>
                    이전 문장, 혹은 다음 문장으로 즉시 이동합니다. (가장자리 50px은 오터치 방지 영역입니다)
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <div>
                    <strong className="text-zinc-100 block mb-0.5">화면 중앙 터치 (2번 연속)</strong>
                    설정 메뉴(동기화, 오프셋 등)를 열거나 닫습니다.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <div>
                    <strong className="text-zinc-100 block mb-0.5">화면 좌/우 터치 (2번 연속)</strong>
                    자동 일시정지(Auto-pause) 켜기/끄기 또는 반복 모드(Loop)를 변경합니다.
                  </div>
                </li>
              </ul>
            </section>

            {/* Key Functions */}
            <section className="space-y-6 bg-zinc-900/30 p-6 rounded-2xl border border-zinc-800/50">
              <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
                <Repeat className="w-5 h-5 text-orange-400" />
                <h3 className="text-xl font-bold uppercase tracking-widest text-zinc-100">핵심 학습 기능</h3>
              </div>
              <ul className="space-y-4 text-zinc-300">
                <li className="flex items-start gap-3">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                  <div>
                    <strong className="text-zinc-100 block mb-0.5">Auto-Pause (자동 일시정지)</strong>
                    문장이 끝날 때마다 영상이 자동으로 멈춥니다. 방금 들은 문장을 따라 말할 수 있는(Shadowing) 시간을 확보해 줍니다.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                  <div>
                    <strong className="text-zinc-100 block mb-0.5">Loop (구간 반복)</strong>
                    선택한 문장 1개, 혹은 앞뒤 3개의 문장 묶음을 무한 반복합니다. 잘 들리지 않는 연음이나 억양을 파악할 때 필수적입니다.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                  <div>
                    <strong className="text-zinc-100 block mb-0.5">Sync (싱크 조절)</strong>
                    자막과 영상의 싱크가 맞지 않을 때, 화면 하단의 다이얼을 돌려 0.1초 단위로 자막 타이밍을 미세 조정할 수 있습니다.
                  </div>
                </li>
              </ul>
            </section>
          </div>

          {/* Shadowing Tips */}
          <section className="space-y-6 mt-12 bg-blue-950/20 p-8 rounded-3xl border border-blue-900/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Headphones className="w-48 h-48 text-blue-500" />
            </div>
            
            <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-3 border-b border-blue-900/50 pb-4">
                <Mic className="w-6 h-6 text-blue-400" />
                <h3 className="text-2xl font-black uppercase tracking-widest text-blue-400">How to Master Shadowing</h3>
              </div>
              
              <div className="space-y-8 text-zinc-300">
                <div className="bg-black/20 p-6 rounded-2xl border border-blue-500/10">
                  <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">Step 1</span> 
                    자막 없이 오직 소리에만 집중하기
                  </h4>
                  <p className="leading-relaxed">
                    처음 영상을 볼 때는 자막을 완전히 가리거나 보지 않으려 노력하세요. 
                    들리는 소리(연음, 강세, 리듬) 자체에 귀를 기울이며 전체적인 흐름과 맥락을 유추하는 것이 듣기 능력 향상의 핵심입니다.
                  </p>
                </div>

                <div className="bg-black/20 p-6 rounded-2xl border border-emerald-500/10">
                  <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    <span className="bg-emerald-600 text-white text-xs px-2 py-0.5 rounded-full">Step 2</span> 
                    Auto-Pause와 함께 끊어 듣고 확인하기
                  </h4>
                  <p className="leading-relaxed">
                    자막을 켜고 <strong className="text-emerald-400">Auto-pause(자동 멈춤)</strong> 모드를 활성화하세요. 
                    한 문장이 끝날 때마다 영상이 멈추면, 방금 들었던 소리와 실제 텍스트(자막)를 대조하며 내가 놓쳤던 단어나 연음을 확인합니다.
                  </p>
                </div>

                <div className="bg-black/20 p-6 rounded-2xl border border-orange-500/10">
                  <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    <span className="bg-orange-600 text-white text-xs px-2 py-0.5 rounded-full">Step 3</span> 
                    구간 반복(Loop)으로 원어민처럼 따라 말하기
                  </h4>
                  <p className="leading-relaxed">
                    입에 잘 붙지 않는 어려운 문장은 <strong className="text-orange-400">Loop(반복)</strong> 모드를 켜서 해당 문장을 무한 반복시킵니다. 
                    원어민의 발음, 억양, 속도를 100% 똑같이 흉내 낸다는 느낌으로 입 밖으로 소리 내어 따라 말하세요 (Shadowing). 
                    내 목소리가 원어민 목소리와 완전히 겹쳐져 화음처럼 들릴 때까지 반복하는 것이 가장 좋습니다.
                  </p>
                </div>

                <div className="bg-black/20 p-6 rounded-2xl border border-purple-500/10">
                  <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    <span className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full">Step 4</span> 
                    구글 드라이브 동기화 및 복습
                  </h4>
                  <p className="leading-relaxed">
                    학습이 끝난 스크립트는 구글 드라이브 아이콘을 눌러 저장해두세요. 
                    출퇴근길이나 자투리 시간에 모바일로 접속하여, 이전에 훈련했던 영상을 다시 들으며 복습하면 기억에 훨씬 오래 남습니다.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Footer note */}
          <div className="text-center pt-8 border-t border-zinc-800/50">
            <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">
              Consistent practice is the key to fluency.
            </p>
          </div>

        </div>
      </div>

      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .custom-print-area, .custom-print-area * {
            visibility: visible;
          }
          .custom-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
            overflow: visible !important;
          }
          .custom-print-area p, .custom-print-area li {
            color: #333 !important;
          }
          .custom-print-area h1, .custom-print-area h3, .custom-print-area h4, .custom-print-area strong {
            color: #000 !important;
            -webkit-text-fill-color: #000 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}} />
    </div>
  );
};
