import { GameProvider, useGame } from './context/GameContext.jsx';
import MissionContainer from './components/MissionContainer.jsx';
import { useState } from 'react';

export default function App() {
  return (
    <GameProvider>
      <AppShell />
    </GameProvider>
  );
}

// Phase 0(단어 매칭) 화면은 학생들이 학교 칠판에서 멀리서 봐도 잘 보이도록
// 외곽 컨테이너를 가로 1.5배, 세로 1.3배로 확대.
// 나머지 Phase는 작은 노트북 기준 1100×620 사이즈를 유지.
// 세로는 가운데 정렬해서 큰 화면(전자칠판)에서 가운데에 떠 있게.
function AppShell() {
  const { phase } = useGame();
  const isPhase0 = phase === 0;
  const sizeClass = isPhase0
    ? 'max-w-[1650px] min-h-[800px]'
    : 'max-w-[1100px] min-h-[620px]';

  return (
    <div className="min-h-screen flex items-center justify-center p-2 sm:p-3">
      <div
        className={`w-full ${sizeClass} bg-slate-50 rounded-2xl shadow-2xl border border-slate-200 transition-[max-width] duration-300`}
      >
        <MissionContainer />
      </div>
      <DevJumpPanel />
    </div>
  );
}

function DevJumpPanel() {
  const { jumpTo, reset } = useGame();
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed top-3 right-3 z-[60]">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="rounded-full bg-slate-800/80 hover:bg-slate-900 text-white text-xs font-bold px-3 py-2 shadow-lg"
      >
        테스트
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white/95 border border-slate-200 shadow-lg p-2">
          <div className="flex items-center justify-between mb-1 px-1">
            <div className="text-[11px] font-bold text-slate-500">테스트 이동</div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs font-bold text-slate-400 hover:text-slate-700"
            >
              닫기
            </button>
          </div>
          <div className="grid grid-cols-3 gap-1">
            <button className="dev-jump-btn" onClick={() => jumpTo(0, 0)}>M1-1</button>
            <button className="dev-jump-btn" onClick={() => jumpTo(0, 1)}>M1-2</button>
            <button className="dev-jump-btn" onClick={() => jumpTo(0, 2)}>M1-3</button>
            <button className="dev-jump-btn col-span-3" onClick={() => jumpTo(1, 0)}>M2 교사용 모니터링</button>
            <button className="dev-jump-btn col-span-2" onClick={() => jumpTo(2, 0)}>M3 형성평가</button>
            <button className="dev-jump-btn" onClick={reset}>처음</button>
          </div>
        </div>
      )}
    </div>
  );
}
