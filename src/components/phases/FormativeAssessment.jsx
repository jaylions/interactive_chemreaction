import AIAssistantPanel from '../common/AIAssistantPanel.jsx';
import ChemEquation from '../common/ChemEquation.jsx';
import { useGame } from '../../context/GameContext.jsx';

export default function FormativeAssessment() {
  const { currentMission, advanceMission } = useGame();

  return (
    <div className="h-full flex flex-col gap-4">
      <header className="text-center">
        <h2 className="text-3xl font-bold text-slate-800">형성평가 안내</h2>
        <p className="text-slate-600 text-lg mt-2">
          지금부터 학습지의 형성평가를 풀며 오늘 배운 내용을 확인합니다.
        </p>
      </header>

      <AIAssistantPanel
        status="평가 준비"
        summary="화학 반응식을 완성하는 절차와 계수의 의미를 스스로 설명해 보세요."
        detail="아래첨자는 바꾸지 않고, 계수를 조절해 반응 전후 원자 수가 같아지는지 확인합니다."
        missionTitle={currentMission.title}
        tone="amber"
      />

      <section className="grid grid-cols-[1fr_0.9fr] gap-4 flex-1">
        <div className="rounded-2xl bg-white border border-slate-200 shadow p-6 flex flex-col justify-center">
          <div className="text-sm font-bold text-amber-700 mb-2">학습지 형성평가</div>
          <h3 className="text-2xl font-bold text-slate-800 mb-4">
            일산화 탄소가 산소와 반응하여 이산화 탄소가 되는 반응
          </h3>

          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 mb-5">
            <div className="text-sm font-semibold text-slate-500 mb-2">계수 맞추기 전</div>
            <ChemEquation
              reactants={{ CO: 1, O2: 1 }}
              products={{ CO2: 1 }}
              className="text-4xl"
            />
          </div>

          <ol className="space-y-3 text-lg text-slate-700 list-decimal list-inside">
            <li>반응물과 생성물을 구분해 보세요.</li>
            <li>반응 전후 C, O 원자 수를 각각 세어 보세요.</li>
            <li>아래첨자를 바꾸지 말고 계수로 화학 반응식을 완성하세요.</li>
            <li>완성된 반응식의 계수비가 입자 수의 비와 어떻게 연결되는지 설명하세요.</li>
          </ol>
        </div>

        <aside className="rounded-2xl bg-white border border-slate-200 shadow p-6 flex flex-col">
          <h3 className="text-xl font-bold text-slate-800 mb-4">확인할 평가 항목</h3>
          <div className="space-y-3 flex-1">
            <AssessmentItem
              title="화학 반응식 작성"
              text="반응물과 생성물을 바르게 배치하고, 화학식을 사용해 반응식을 완성한다."
            />
            <AssessmentItem
              title="계수와 아래첨자 구분"
              text="계수는 입자 수, 아래첨자는 분자 안 원자 수임을 구분한다."
            />
            <AssessmentItem
              title="계수비 해석"
              text="완성된 화학 반응식의 계수비를 입자 수의 비로 해석한다."
            />
            <AssessmentItem
              title="설명하기"
              text="왜 그 계수가 필요한지 원자 수 보존과 연결해 설명한다."
            />
          </div>

          <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4 mb-4">
            <div className="text-sm font-bold text-emerald-700 mb-1">정리 질문</div>
            <p className="text-slate-700 font-semibold">
              일산화 탄소 분자 2개가 반응할 때 필요한 산소 분자는 몇 개인가요?
            </p>
          </div>

          <button
            type="button"
            onClick={advanceMission}
            className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-3"
          >
            형성평가 마치기
          </button>
        </aside>
      </section>
    </div>
  );
}

function AssessmentItem({ title, text }) {
  return (
    <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
      <div className="font-bold text-slate-800">{title}</div>
      <p className="text-sm text-slate-600 mt-1">{text}</p>
    </div>
  );
}
