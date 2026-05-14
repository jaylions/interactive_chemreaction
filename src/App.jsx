import { GameProvider, useGame } from './context/GameContext.jsx';
import MissionContainer from './components/MissionContainer.jsx';

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
    </div>
  );
}
