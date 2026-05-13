import { useMemo, useState } from 'react';
import { DndContext } from '@dnd-kit/core';
import WordCard from '../common/WordCard.jsx';
import DropZone from '../common/DropZone.jsx';
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
    if (!acceptsBySide[slot.side].has(label)) return;
    // 같은 라벨이 다른 슬롯에 이미 채워져 있으면 거절
    if (Object.values(filled).includes(label)) return;
    // 이 슬롯이 이미 차있으면 덮어쓰지 않음
    if (filled[slot.id]) return;

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
      <div className="flex flex-col h-full gap-6">
        <header className="text-center">
          <h2 className="text-2xl font-bold text-slate-800">{currentMission.title}</h2>
          <p className="text-slate-600 mt-1">{currentMission.description}</p>
          <p className="text-sm text-slate-500 mt-2">
            반응물과 생성물에 해당하는 단어 카드를 드래그해 올바른 자리에 놓아보세요.
          </p>
        </header>

        {/* 중앙 식 영역 */}
        <section className="flex items-center justify-center gap-3 flex-1">
          <SlotGroup slots={reactantSlots} filled={filled} onRemove={removeFromSlot} />
          <Arrow />
          <SlotGroup slots={productSlots} filled={filled} onRemove={removeFromSlot} />
        </section>

        {/* 단어 카드 풀 */}
        <section className="flex flex-wrap justify-center gap-3">
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

        <div className="flex justify-center gap-3">
          <button
            className="rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold px-4 py-2"
            onClick={resetAll}
          >
            모두 초기화
          </button>
          <button
            className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-2 disabled:bg-slate-300"
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

function SlotGroup({ slots, filled, onRemove }) {
  return (
    <div className="flex items-center gap-2">
      {slots.map((slot, idx) => (
        <div key={slot.id} className="flex items-center gap-2">
          <DropZone
            id={slot.id}
            data={{ slotId: slot.id }}
            className="min-w-[140px] min-h-[72px] flex items-center justify-center"
            placeholder="여기에 놓기"
          >
            {filled[slot.id] && (
              <FilledChip label={filled[slot.id]} onRemove={() => onRemove(slot.id)} />
            )}
          </DropZone>
          {idx < slots.length - 1 && <span className="text-2xl font-bold">+</span>}
        </div>
      ))}
    </div>
  );
}

function FilledChip({ label, onRemove }) {
  return (
    <div className="relative rounded-xl bg-emerald-100 text-emerald-700 font-bold px-4 py-2 border border-emerald-300">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold shadow flex items-center justify-center"
        aria-label="빼내기"
      >
        ×
      </button>
    </div>
  );
}

function Arrow() {
  return <span className="text-3xl font-bold text-slate-600 mx-2">→</span>;
}
