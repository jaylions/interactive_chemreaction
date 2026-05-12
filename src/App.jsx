import { GameProvider } from './context/GameContext.jsx';
import MissionContainer from './components/MissionContainer.jsx';

// 노트북 화면 비율을 권장 사이즈로 잡되, 콘텐츠가 길어지면 자연스럽게 늘어나도록
// aspect-ratio 강제 대신 min-height만 두고 overflow는 허용.
export default function App() {
  return (
    <GameProvider>
      <div className="min-h-screen flex items-start justify-center p-4">
        <div className="w-full max-w-[1280px] min-h-[760px] bg-slate-50 rounded-2xl shadow-2xl border border-slate-200">
          <MissionContainer />
        </div>
      </div>
    </GameProvider>
  );
}
