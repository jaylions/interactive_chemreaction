import { useEffect, useState } from 'react';
import { DndContext, useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import Atom from '../common/Atom.jsx';
import DropZone from '../common/DropZone.jsx';
import MoleculeCard from '../common/MoleculeCard.jsx';
import MoleculePopup from '../common/MoleculePopup.jsx';
import ChemicalText from '../common/ChemicalText.jsx';
import { ATOM_LIST } from '../../constants/atoms.js';
import { matchMolecule } from '../../utils/molecules.js';
import { useGame } from '../../context/GameContext.jsx';
import { useDragSensors } from '../../hooks/useDragSensors.js';

// Phase 1: 분자 조립
// - 하단 원자 바구니에서 원자를 무한 드래그
// - 작업영역에 누적된 원자가 어떤 분자와 정확히 일치하면 자동으로 '분자 카드'로 병합되어 잠금해제
// - 잘못된 조합은 막지 않음. 학생이 직접 작업영역의 원자를 클릭해 제거하거나 '비우기' 버튼으로 초기화
// - 필요한 분자를 모두 한 번 이상 조립하면 Phase 2로
export default function Phase1MoleculeBuilder() {
  const { currentMission, unlockedMolecules, unlockMolecule, setPhase } = useGame();
  const required = currentMission.phase1.requiredMolecules;

  const sensors = useDragSensors();

  // 작업영역에 놓인 원자 개수
  const [workspace, setWorkspace] = useState({}); // { C: 1, H: 4 }
  // 방금 완성된 분자 — 팝업으로 확인할 때까지 잠금해제를 보류
  const [pendingMolecule, setPendingMolecule] = useState(null);

  const unlocked = unlockedMolecules[currentMission.id] || [];
  const allUnlocked = required.every((f) => unlocked.includes(f));

  // workspace가 정확히 어떤 필요 분자와 일치하면 확인 팝업을 띄움.
  // 팝업이 이미 떠 있으면 새 매칭은 무시.
  useEffect(() => {
    if (pendingMolecule) return;
    const formula = matchMolecule(workspace);
    if (formula && required.includes(formula)) {
      setPendingMolecule(formula);
    }
  }, [workspace, required, pendingMolecule]);

  const onDragEnd = (event) => {
    // 팝업 떠 있는 동안은 새 원자 추가 차단
    if (pendingMolecule) return;
    const { active, over } = event;
    if (!over) return;
    const atomSymbol = active.data?.current?.atomSymbol;
    if (!atomSymbol) return;
    if (over.id !== 'workspace') return;

    setWorkspace((prev) => ({
      ...prev,
      [atomSymbol]: (prev[atomSymbol] || 0) + 1,
    }));
  };

  const removeAtom = (sym) => {
    if (pendingMolecule) return;
    setWorkspace((prev) => {
      const n = (prev[sym] || 0) - 1;
      const next = { ...prev };
      if (n <= 0) delete next[sym];
      else next[sym] = n;
      return next;
    });
  };

  const clearWorkspace = () => {
    if (pendingMolecule) return;
    setWorkspace({});
  };

  const confirmMolecule = () => {
    if (!pendingMolecule) return;
    unlockMolecule(pendingMolecule);
    setWorkspace({});
    setPendingMolecule(null);
  };

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      <div className="flex flex-col gap-3">
        <header className="text-center">
          <h2 className="text-2xl font-bold text-slate-800">분자 조립소</h2>
          <p className="text-slate-700 text-base mt-1">
            아래 원자 바구니에서 원자를 끌어와 분자를 만들어 보세요. 필요한 분자:{' '}
            <span className="font-bold">
              <ChemicalText>{required.join(', ')}</ChemicalText>
            </span>
          </p>
          <p className="text-sm text-slate-500">
            작업영역의 원자를 클릭하면 한 개씩 빼낼 수 있어요.
          </p>
        </header>

        <section className="grid grid-cols-[1fr_auto] gap-3">
          {/* 작업영역 (인터랙티브 화학식 + 원자 모형) */}
          <DropZone
            id="workspace"
            className="min-h-[200px] flex flex-col items-center justify-center gap-2"
            placeholder="여기에 원자를 끌어다 놓으세요"
          >
            <FormulaDisplay workspace={workspace} />
            <div className="flex flex-wrap items-center justify-center gap-3">
              {expandWorkspace(workspace).map((sym, i) => (
                <button
                  key={`${sym}-${i}`}
                  type="button"
                  onClick={() => removeAtom(sym)}
                  className="hover:opacity-70 transition"
                  title="클릭하여 빼내기"
                >
                  <Atom symbol={sym} size={56} />
                </button>
              ))}
            </div>
          </DropZone>

          {/* 우측 패널: 잠금해제된 분자 카드 */}
          <aside className="w-64 rounded-xl bg-white border border-slate-200 shadow p-3">
            <h4 className="text-lg font-bold text-slate-700 mb-2 text-center">완성한 분자</h4>
            <div className="flex flex-col gap-3 items-center">
              {required.map((f) => (
                <div
                  key={f}
                  className={unlocked.includes(f) ? '' : 'opacity-30 grayscale'}
                >
                  <MoleculeCard
                    formula={f}
                    dragId={`unlock-preview-${f}`}
                    dragData={{ preview: true }}
                    size="sm"
                  />
                </div>
              ))}
            </div>
          </aside>
        </section>

        {/* 원자 바구니 - 가로 한 줄 (세로 공간 절약) */}
        <section className="rounded-xl bg-white border border-slate-200 shadow px-3 py-1.5 flex items-center justify-center gap-4">
          <h4 className="text-base font-bold text-slate-600 shrink-0">
            원자 바구니
          </h4>
          <div className="flex gap-4">
            {ATOM_LIST.map((sym) => (
              <AtomSource key={sym} symbol={sym} />
            ))}
          </div>
        </section>

        <div className="flex justify-center gap-3">
          <button
            className="rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-5 py-2 text-base"
            onClick={clearWorkspace}
          >
            작업영역 비우기
          </button>
          <button
            className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-7 py-2 text-base disabled:bg-slate-300"
            disabled={!allUnlocked}
            onClick={() => setPhase(2)}
          >
            다음 단계로 →
          </button>
        </div>

        {pendingMolecule && (
          <MoleculePopup
            formula={pendingMolecule}
            onConfirm={confirmMolecule}
          />
        )}
      </div>
    </DndContext>
  );
}

// 원자 바구니의 각 원자 소스(드래그할 때마다 새 인스턴스를 만들기 위한 ID는 매번 갱신)
function AtomSource({ symbol }) {
  const [pickCount, setPickCount] = useState(0);
  const id = `atom-source-${symbol}-${pickCount}`;
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    data: { atomSymbol: symbol },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onPointerUp={() => setPickCount((c) => c + 1)}
      className="cursor-grab active:cursor-grabbing touch-none select-none"
    >
      <Atom symbol={symbol} size={48} />
    </div>
  );
}

function expandWorkspace(ws) {
  const out = [];
  for (const [sym, n] of Object.entries(ws)) {
    for (let i = 0; i < n; i++) out.push(sym);
  }
  return out;
}

// 작업영역의 누적 원자 카운트를 화학식 형태로 표시.
// 학생들이 화학식의 아래첨자/구조를 익히도록 인터랙티브하게 갱신.
// 원자 순서: C → H → N → O (탄소 화합물 표기 관행을 따르되 4종에 한정)
const FORMULA_ORDER = ['C', 'H', 'N', 'O'];

function FormulaDisplay({ workspace }) {
  const parts = FORMULA_ORDER
    .map((sym) => ({ sym, n: workspace[sym] || 0 }))
    .filter(({ n }) => n > 0);

  return (
    <div className="min-h-[56px] flex items-center justify-center px-4">
      {parts.length === 0 ? (
        <span className="text-slate-400 text-base">
          원자를 끌어다 놓으면 화학식이 표시돼요
        </span>
      ) : (
        <div className="flex items-baseline gap-0.5 text-5xl font-bold text-slate-800 font-mono">
          {parts.map(({ sym, n }) => (
            <span key={sym} className="flex items-baseline">
              <span>{sym}</span>
              {n > 1 && <sub className="text-3xl">{n}</sub>}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
