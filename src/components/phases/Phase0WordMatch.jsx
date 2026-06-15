import { useMemo, useState } from 'react';
import { DndContext } from '@dnd-kit/core';
import WordCard from '../common/WordCard.jsx';
import DropZone from '../common/DropZone.jsx';
import ChemicalText from '../common/ChemicalText.jsx';
import AIAssistantPanel from '../common/AIAssistantPanel.jsx';
import { useGame } from '../../context/GameContext.jsx';
import { useDragSensors } from '../../hooks/useDragSensors.js';

// Phase 0: 한글 명칭(단어) 카드 매칭
// - 반응물/생성물 *내부* 순서는 무관하게 통과 (side만 검증).
//   예: 미션 1에서 '이산화 탄소'/'물'은 product 슬롯 어디에 놓아도 OK.
// - 잘못된 side에 놓거나 함정 카드는 막힘 (alert 없이 단순히 무시).
// - 채워진 슬롯은 X 버튼으로 빼낼 수 있고, 하단 '모두 초기화'로 전체 리셋.
export default function Phase0WordMatch() {
  const { currentMission, setPhase } = useGame();
  const { slots, cards } = currentMission.phase0;

  // slotId -> label (정답으로 채워진 카드)
  const [filled, setFilled] = useState({});
  const [demoFeedback, setDemoFeedback] = useState(null);

  const allDone = slots.every((s) => filled[s.id]);

  // side별 허용 라벨 풀 (반응물 풀, 생성물 풀)
  const acceptsBySide = useMemo(() => ({
    reactant: new Set(
      slots.filter((s) => s.side === 'reactant').map((s) => s.accepts)
    ),
    product: new Set(
      slots.filter((s) => s.side === 'product').map((s) => s.accepts)
    ),
  }), [slots]);

  const sensors = useDragSensors();

  const onDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;
    const slot = slots.find((s) => s.id === over.id);
    if (!slot) return;
    const label = active.data?.current?.label;
    if (!label) return;

    // 슬롯의 side에 해당하는 라벨인지만 검증 (순서 자유)
    if (!acceptsBySide[slot.side].has(label)) {
      setDemoFeedback(makeDemoFeedback(label, slot.side, currentMission.title));
      return;
    }
    // 같은 라벨이 다른 슬롯에 이미 채워져 있으면 거절
    if (Object.values(filled).includes(label)) {
      setDemoFeedback({
        type: '중복 사용',
        summary: `${label} 카드를 이미 다른 자리에 사용했어요.`,
        prompt: '같은 물질을 여러 번 써야 할 때는 카드를 또 놓는 것이 맞는지, 나중에 계수로 표현하는 것이 맞는지 생각해 보세요.',
      });
      return;
    }
    // 이 슬롯이 이미 차있으면 덮어쓰지 않음
    if (filled[slot.id]) {
      setDemoFeedback({
        type: '슬롯 충돌',
        summary: '이미 채워진 자리에 다른 카드를 놓으려고 했어요.',
        prompt: '먼저 지금 놓인 카드가 반응물인지 생성물인지 확인한 뒤, 필요하면 X 버튼으로 빼고 다시 놓아 보세요.',
      });
      return;
    }

    setDemoFeedback(null);
    setFilled((prev) => ({ ...prev, [slot.id]: label }));
  };

  const removeFromSlot = (slotId) =>
    setFilled((prev) => {
      const next = { ...prev };
      delete next[slotId];
      return next;
    });

  const resetAll = () => setFilled({});

  const reactantSlots = slots.filter((s) => s.side === 'reactant');
  const productSlots = slots.filter((s) => s.side === 'product');

  // 같은 카드가 두 슬롯에 동시에 정답인 경우는 없음(미션 데이터 기준).
  // 따라서 한 번 채워지면 해당 카드는 비활성화하여 이중 사용 방지.
  const usedLabels = new Set(Object.values(filled));

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      <div className="flex flex-col h-full gap-8">
        <header className="text-center">
          <h2 className="text-4xl font-bold text-slate-800">{currentMission.title}</h2>
          <p className="text-slate-600 text-xl mt-2">
            <ChemicalText>{currentMission.description}</ChemicalText>
          </p>
          <p className="text-base text-slate-500 mt-3">
            반응물과 생성물에 해당하는 단어 카드를 드래그해 올바른 자리에 놓아보세요.
          </p>
        </header>

        <DemoAiFeedbackPanel feedback={demoFeedback} missionTitle={currentMission.title} />

        {/* 중앙 식 영역 */}
        <section className="flex items-center justify-center gap-4 flex-1">
          <SlotGroup slots={reactantSlots} filled={filled} onRemove={removeFromSlot} />
          <Arrow />
          <SlotGroup slots={productSlots} filled={filled} onRemove={removeFromSlot} />
        </section>

        {/* 단어 카드 풀 */}
        <section className="flex flex-wrap justify-center gap-4">
          {cards.map((label, i) => (
            <WordCard
              key={`${label}-${i}`}
              label={label}
              dragId={`word-${label}-${i}`}
              dragData={{ label }}
              disabled={usedLabels.has(label)}
            />
          ))}
        </section>

        <div className="flex justify-center gap-4">
          <button
            className="rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-6 py-3 text-lg"
            onClick={resetAll}
          >
            모두 초기화
          </button>
          <button
            className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 py-3 text-lg disabled:bg-slate-300"
            disabled={!allDone}
            onClick={() => setPhase(1)}
          >
            다음 단계로 →
          </button>
        </div>
      </div>
    </DndContext>
  );
}

function DemoAiFeedbackPanel({ feedback, missionTitle }) {
  const fallback = {
    type: '대기 중',
    summary: 'AI 조수가 풀이 과정을 살펴보고 있어요.',
    prompt: '카드를 놓으면 필요한 순간에 짧은 힌트가 나타납니다.',
  };
  const data = feedback || fallback;

  return (
    <AIAssistantPanel
      status={data.type}
      summary={data.summary}
      detail={data.prompt}
      missionTitle={missionTitle}
      tone="sky"
    />
  );
}

function makeDemoFeedback(label, side, missionTitle) {
  const sideText = side === 'reactant' ? '반응물' : '생성물';
  const oppositeText = side === 'reactant' ? '생성물' : '반응물';

  if (label.includes('수소') || label.includes('질소') || label.includes('이산화 탄소')) {
    return {
      type: '함정 카드 감지',
      summary: `${label} 카드는 ${missionTitle}의 ${sideText} 자리에 들어가기 어렵습니다.`,
      prompt: `${label}이 실제로 이 반응에서 처음부터 필요한 물질인지, 아니면 반응 뒤에 만들어지는 물질인지 확인해 보세요.`,
    };
  }

  return {
    type: '반응 전후 구분 오류',
    summary: `${label} 카드를 ${sideText} 쪽에 놓았지만, 이 물질은 ${oppositeText} 쪽에서 생각해야 합니다.`,
    prompt: '이 물질은 반응이 일어나기 전부터 있었나요, 아니면 반응 후에 생겼나요?',
  };
}

function SlotGroup({ slots, filled, onRemove }) {
  return (
    <div className="flex items-center gap-3">
      {slots.map((slot, idx) => (
        <div key={slot.id} className="flex items-center gap-3">
          <DropZone
            id={slot.id}
            data={{ slotId: slot.id }}
            className="min-w-[200px] min-h-[100px] flex items-center justify-center"
            placeholder="여기에 놓기"
          >
            {filled[slot.id] && (
              <FilledChip label={filled[slot.id]} onRemove={() => onRemove(slot.id)} />
            )}
          </DropZone>
          {idx < slots.length - 1 && <span className="text-4xl font-bold text-slate-600">+</span>}
        </div>
      ))}
    </div>
  );
}

function FilledChip({ label, onRemove }) {
  return (
    <div className="relative rounded-2xl bg-emerald-100 text-emerald-700 font-bold px-6 py-3 text-2xl border-2 border-emerald-300">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-lg font-bold shadow flex items-center justify-center"
        aria-label="빼내기"
      >
        ×
      </button>
    </div>
  );
}

function Arrow() {
  return <span className="text-5xl font-bold text-slate-600 mx-3">→</span>;
}
