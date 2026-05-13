import { GameProvider } from './context/GameContext.jsx';
import MissionContainer from './components/MissionContainer.jsx';

// 학교 보급용 작은 노트북(약 1280×720, 1366×768)을 기준으로 사이즈를 잡음.
// 더 큰 화면에서는 가운데 정렬되어 표시되고, 콘텐츠가 길어지면 세로로 늘어남.
export default function App() {
  return (
    <GameProvider>
      <div className="min-h-screen flex items-start justify-center p-2 sm:p-3">
        <div className="w-full max-w-[1100px] min-h-[620px] bg-slate-50 rounded-2xl shadow-2xl border border-slate-200">
          <MissionContainer />
        </div>
      </div>
    </GameProvider>
  );
}
