import { useState } from 'react';
import MoleculeShape from '../common/MoleculeShape.jsx';
import ChemicalText from '../common/ChemicalText.jsx';
import { useGame } from '../../context/GameContext.jsx';

// Phase 2: 교사용 실시간 학생 화면 모니터링
// 4x5 썸네일로 전체 학생 이해도를 보고, 한 화면을 선택해 구두 피드백에 활용한다.
export default function Phase1MoleculeBuilder() {
  const { currentMission, advanceMission } = useGame();
  const required = currentMission.phase1.requiredMolecules;
  const students = getDemoStudents(currentMission.id);
  const [selectedId, setSelectedId] = useState(students[0].id);
  const selected = students.find((student) => student.id === selectedId) || students[0];
  const counts = summarize(students);

  return (
    <div className="flex flex-col gap-3 h-full">
      <header className="text-center">
        <h2 className="text-2xl font-bold text-slate-800">실시간 학생 화면</h2>
        <p className="text-slate-700 text-base mt-1">
          학생들의 분자 조립 화면을 한눈에 확인하고, 도움이 필요한 화면을 선택해 설명합니다. 필요한 분자:{' '}
          <span className="font-bold">
            <ChemicalText>{required.join(', ')}</ChemicalText>
          </span>
        </p>
      </header>

      <ClassStatusBoard counts={counts} selected={selected} missionTitle={currentMission.title} />

      <section className="grid grid-cols-[1.15fr_0.85fr] gap-3 flex-1 min-h-0">
        <div className="rounded-2xl bg-white border border-slate-200 shadow p-3 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-slate-700">학생 화면 모니터링</h3>
            <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
              <Legend color="bg-emerald-400" label="이해 양호" />
              <Legend color="bg-amber-400" label="확인 필요" />
              <Legend color="bg-rose-500" label="도움 필요" />
            </div>
          </div>

          <div className="grid grid-cols-5 grid-rows-4 gap-2 flex-1 min-h-0">
            {students.map((student) => (
              <StudentScreenTile
                key={student.id}
                student={student}
                selected={student.id === selected.id}
                onSelect={() => setSelectedId(student.id)}
              />
            ))}
          </div>
        </div>

        <SelectedScreen
          student={selected}
          missionTitle={currentMission.title}
          onNext={advanceMission}
        />
      </section>
    </div>
  );
}

function ClassStatusBoard({ counts, selected, missionTitle }) {
  return (
    <section className="rounded-2xl border-2 border-slate-200 bg-white px-5 py-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-sm font-bold text-slate-500">학급 현황판 · {missionTitle}</div>
          <p className="mt-1 text-lg font-semibold text-slate-800">
            이해 양호 {counts.good}명, 확인 필요 {counts.warn}명, 도움 필요 {counts.risk}명
          </p>
          <p className="mt-1 text-base text-slate-600">
            현재 선택 화면: {selected.displayName} · {selected.coachingPoint}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <StatusMetric label="양호" value={counts.good} className="text-emerald-600 bg-emerald-50 border-emerald-100" />
          <StatusMetric label="확인" value={counts.warn} className="text-amber-600 bg-amber-50 border-amber-100" />
          <StatusMetric label="도움" value={counts.risk} className="text-rose-600 bg-rose-50 border-rose-100" />
        </div>
      </div>
    </section>
  );
}

function StatusMetric({ label, value, className }) {
  return (
    <div className={`min-w-16 rounded-xl border px-3 py-2 ${className}`}>
      <div className="text-2xl font-bold leading-none">{value}</div>
      <div className="mt-1 text-xs font-bold">{label}</div>
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      {label}
    </span>
  );
}

function StudentScreenTile({ student, selected, onSelect }) {
  const tone = toneByLevel(student.level);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative flex flex-col rounded-xl border-2 bg-slate-50 p-2 text-left transition overflow-hidden ${
        selected ? 'border-indigo-500 shadow-md' : 'border-slate-200 hover:border-indigo-200'
      }`}
    >
      <div className={`absolute left-0 top-0 h-full w-2 ${tone.bar}`} />
      <div className="pl-2 flex items-center justify-between gap-1">
        <span className="text-xs font-bold text-slate-700">{student.displayName}</span>
        <span className={`h-2.5 w-2.5 rounded-full ${tone.dot}`} />
      </div>
      <MiniStudentScreen student={student} />
      <div className="pl-2 mt-1 text-[11px] font-semibold text-slate-500 truncate">
        {student.screenLabel}
      </div>
    </button>
  );
}

function MiniStudentScreen({ student }) {
  return (
    <div className="mt-1 ml-2 flex-1 rounded-lg bg-white border border-slate-200 p-1.5 flex flex-col justify-center">
      <div className="grid grid-cols-2 gap-1">
        {student.workspace.slice(0, 4).map((formula, index) => (
          <div key={`${formula}-${index}`} className="h-9 rounded bg-slate-50 flex items-center justify-center">
            <MoleculePreview formula={formula} compact />
          </div>
        ))}
        {student.atomChips.slice(0, 4).map((chip, index) => (
          <div
            key={`${chip}-${index}`}
            className="h-9 rounded bg-slate-50 flex items-center justify-center text-[11px] font-mono font-bold text-slate-700"
          >
            {chip}
          </div>
        ))}
      </div>
    </div>
  );
}

function SelectedScreen({ student, missionTitle, onNext }) {
  const tone = toneByLevel(student.level);

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow p-4 flex flex-col min-h-0">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="text-xl font-bold text-slate-800">{student.displayName} 화면 확대</h3>
          <p className="text-sm text-slate-500">{missionTitle}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-bold text-white ${tone.bar}`}>
          {student.levelLabel}
        </span>
      </div>

      <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 mb-3 flex-1 min-h-0">
        <div className="text-xs font-bold text-slate-500 mb-2">선택한 학생의 현재 조립 화면</div>
        <div className="grid grid-cols-2 gap-3">
          {student.workspace.map((formula, index) => (
            <div
              key={`${formula}-${index}`}
              className="min-h-24 flex justify-center items-center rounded-xl bg-white border border-slate-200 py-2"
            >
              <MoleculePreview formula={formula} />
            </div>
          ))}
          {student.atomChips.map((chip, index) => (
            <div
              key={`${chip}-${index}`}
              className="min-h-24 flex items-center justify-center rounded-xl bg-white border border-slate-200 py-2 font-mono text-2xl font-bold text-slate-700"
            >
              {chip}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2">
        <InfoBlock label="관찰 포인트" text={student.issue} tone={student.level === 'risk' ? 'rose' : 'amber'} />
        <InfoBlock label="교사가 말로 던질 질문" text={student.coachingPoint} tone="indigo" />
      </div>

      <div className="flex justify-end pt-3">
        <button
          type="button"
          onClick={onNext}
          className="rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold px-5 py-2"
        >
          형성평가로 이동 →
        </button>
      </div>
    </div>
  );
}

function MoleculePreview({ formula, compact = false }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className={compact ? 'w-12 h-8' : 'w-28 h-16'}>
        <MoleculeShape formula={formula} className="w-full h-full" />
      </div>
      <div className={compact ? 'text-[10px] font-semibold text-slate-700' : 'text-sm font-semibold text-slate-700'}>
        {formula.split(/(\d+)/).map((piece, i) =>
          /^\d+$/.test(piece) ? <sub key={i}>{piece}</sub> : <span key={i}>{piece}</span>
        )}
      </div>
    </div>
  );
}

function InfoBlock({ label, text, tone }) {
  const colors = {
    rose: 'bg-rose-50 border-rose-100 text-rose-700',
    amber: 'bg-amber-50 border-amber-100 text-amber-700',
    indigo: 'bg-indigo-50 border-indigo-100 text-indigo-700',
  };

  return (
    <div className={`rounded-xl border p-3 ${colors[tone]}`}>
      <div className="text-xs font-bold mb-1">{label}</div>
      <p className="text-sm font-semibold text-slate-700">{text}</p>
    </div>
  );
}

function toneByLevel(level) {
  if (level === 'good') {
    return { bar: 'bg-emerald-500', dot: 'bg-emerald-400' };
  }
  if (level === 'warn') {
    return { bar: 'bg-amber-400', dot: 'bg-amber-400' };
  }
  return { bar: 'bg-rose-500', dot: 'bg-rose-500' };
}

function summarize(students) {
  return students.reduce(
    (acc, student) => {
      acc[student.level] += 1;
      return acc;
    },
    { good: 0, warn: 0, risk: 0 }
  );
}

function getDemoStudents(missionId) {
  const base = missionId === 'mission1'
    ? [
        screen('익명 학생 1', 'risk', ['CH4'], ['O'], 'O2 미완성', '산소 기체를 O 원자 1개로 생각하고 있습니다.', '산소 기체는 원자 하나일까요, O2 분자일까요?'),
        screen('익명 학생 2', 'warn', ['CO2'], ['H'], 'CO2에 H 추가', '이산화 탄소와 물의 원자 구성을 섞어 생각하고 있습니다.', '이산화 탄소라는 이름에 들어 있는 원자만 말해 볼까요?'),
        screen('익명 학생 3', 'good', ['CH4', 'O2', 'CO2', 'H2O'], [], '필요 분자 완성', '필요한 분자를 모두 완성했습니다.', '이제 이 분자들을 반응물과 생성물로 나누어 볼까요?'),
        screen('익명 학생 4', 'risk', ['H2O'], ['O'], 'H2O에 O 추가', '물과 과산화 수소를 혼동하고 있습니다.', 'H2O에서 산소는 몇 개 들어 있나요?'),
      ]
    : [
        screen('익명 학생 1', 'risk', ['H2O'], ['O'], '아래첨자 혼동', '분자식의 아래첨자를 정확히 읽지 못하고 있습니다.', '작은 숫자는 분자 수일까요, 원자 수일까요?'),
        screen('익명 학생 2', 'warn', ['O2'], ['H'], '마지막 분자 조립 중', '필요 분자 중 하나를 아직 완성하지 못했습니다.', '아직 만들지 않은 분자의 이름은 무엇인가요?'),
        screen('익명 학생 3', 'good', ['H2O', 'O2'], [], '필요 분자 완성', '필요한 분자를 완성했습니다.', '다음 단계에서는 분자 개수를 어떻게 조절해야 할까요?'),
        screen('익명 학생 4', 'risk', [], ['N'], '원자/분자 혼동', '기체 분자를 원자 하나로 표현하려고 합니다.', 'N과 N2는 같은 의미일까요?'),
      ];

  const fillers = [
    screen('익명 학생 5', 'good', ['CH4', 'O2'], [], '순조롭게 진행', '반응물 분자를 안정적으로 만들고 있습니다.', '이 분자가 반응 전 물질인지 확인해 볼까요?'),
    screen('익명 학생 6', 'warn', ['H2O'], ['H'], '수소 개수 확인 필요', '수소 원자 개수를 다시 세어 볼 필요가 있습니다.', '수소 원자가 몇 개 모이면 물이 될까요?'),
    screen('익명 학생 7', 'good', ['CO2', 'H2O'], [], '생성물 완성', '생성물 분자를 잘 만들고 있습니다.', '이 두 분자는 반응 후에 생기는 물질일까요?'),
    screen('익명 학생 8', 'risk', [], ['C', 'H', 'H'], 'CH4 미완성', '메테인의 수소 원자 수가 부족합니다.', '메테인 하나에는 수소가 몇 개 필요할까요?'),
    screen('익명 학생 9', 'warn', ['O2'], ['O'], '산소 추가 중', '산소 분자와 산소 원자를 구분하는 중입니다.', 'O2에서 작은 2는 무엇을 뜻하나요?'),
    screen('익명 학생 10', 'good', ['CH4', 'CO2'], [], '분자식 이해 양호', '분자식과 분자 모형을 잘 연결하고 있습니다.', '완성한 분자의 이름을 말해 볼까요?'),
    screen('익명 학생 11', 'warn', ['H2O'], [], '다음 분자 대기', '하나의 분자를 완성하고 다음 분자를 고르는 중입니다.', '다음으로 필요한 분자는 무엇인가요?'),
    screen('익명 학생 12', 'good', ['O2', 'H2O'], [], '조립 안정', '필요한 원자 개수를 안정적으로 맞추고 있습니다.', '이 분자를 식의 어느 쪽에 놓아야 할까요?'),
    screen('익명 학생 13', 'risk', ['CO2'], ['O'], '산소 과다', '이산화 탄소에 산소를 더 붙이려 하고 있습니다.', '이산화 탄소에서 산소는 이미 몇 개인가요?'),
    screen('익명 학생 14', 'warn', [], ['H', 'H', 'O'], '물 조립 직전', '물 분자 조립 직전 상태입니다.', '지금 원자 조합을 화학식으로 쓰면 무엇일까요?'),
    screen('익명 학생 15', 'good', ['CH4', 'O2', 'H2O'], [], '대부분 완성', '대부분의 필요 분자를 완성했습니다.', '아직 빠진 분자는 무엇인가요?'),
    screen('익명 학생 16', 'warn', ['CH4'], ['C'], '탄소 중복', '메테인을 만든 뒤 탄소를 추가하려 합니다.', '완성된 분자에 원자를 더 붙이면 같은 물질일까요?'),
    screen('익명 학생 17', 'good', ['CO2'], [], 'CO2 완성', '이산화 탄소를 정확히 완성했습니다.', '탄소와 산소 개수를 다시 말해 볼까요?'),
    screen('익명 학생 18', 'risk', [], ['O'], '산소 원자 1개', '산소 기체를 원자 하나로 보고 있습니다.', '산소 기체의 분자식은 O인가요, O2인가요?'),
    screen('익명 학생 19', 'warn', ['H2O'], ['H', 'H'], '수소 추가 시도', '이미 완성된 물에 수소를 더 넣으려 합니다.', 'H2O에서 H2는 수소가 몇 개라는 뜻일까요?'),
    screen('익명 학생 20', 'good', ['CH4', 'O2', 'CO2'], [], '마지막 분자 대기', '마지막 분자만 남은 상태입니다.', '생성물 중 아직 만들지 않은 분자는 무엇인가요?'),
  ];

  return [...base, ...fillers].slice(0, 20).map((student, index) => ({
    ...student,
    id: `student-${index + 1}`,
  }));
}

function screen(displayName, level, workspace, atomChips, screenLabel, issue, coachingPoint) {
  const levelLabel = {
    good: '이해 양호',
    warn: '확인 필요',
    risk: '도움 필요',
  }[level];

  return {
    displayName,
    level,
    levelLabel,
    workspace,
    atomChips,
    screenLabel,
    issue,
    coachingPoint,
  };
}
