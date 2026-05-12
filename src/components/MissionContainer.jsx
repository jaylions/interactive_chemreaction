import { useGame } from '../context/GameContext.jsx';
import Phase0WordMatch from './phases/Phase0WordMatch.jsx';
import Phase1MoleculeBuilder from './phases/Phase1MoleculeBuilder.jsx';
import Phase2Balancer from './phases/Phase2Balancer.jsx';

// 현재 미션의 phase에 맞춰 적절한 컴포넌트를 렌더링
export default function MissionContainer() {
  const { phase, currentMission, missionIndex, reset } = useGame();

  if (phase === 'done') {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="bg-white rounded-2xl shadow-xl px-10 py-8 text-center max-w-lg">
          <div className="text-6xl mb-3">🏆</div>
          <h2 className="text-3xl font-bold text-emerald-600 mb-2">모든 미션 클리어!</h2>
          <p className="text-slate-600 mb-6">
            화학 반응식을 멋지게 완성했어요. 수업에서 배운 내용을 잘 정리해 보세요.
          </p>
          <button
            className="rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold px-6 py-3"
            onClick={reset}
          >
            처음부터 다시 하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[760px] flex flex-col">
      {/* 진행 표시 */}
      <div className="flex items-center justify-between px-6 py-2 bg-white border-b border-slate-200 rounded-t-2xl">
        <div className="font-bold text-slate-700">{currentMission.title}</div>
        <div className="text-sm text-slate-500">
          진행: 미션 {missionIndex + 1} / 3 · Phase {phase}
        </div>
      </div>

      <main className="flex-1 p-4">
        {phase === 0 && <Phase0WordMatch />}
        {phase === 1 && <Phase1MoleculeBuilder />}
        {phase === 2 && <Phase2Balancer />}
      </main>
    </div>
  );
}
