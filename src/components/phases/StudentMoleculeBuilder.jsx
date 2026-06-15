import { useEffect, useState } from 'react';
import { DndContext, useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import Atom from '../common/Atom.jsx';
import DropZone from '../common/DropZone.jsx';
import MoleculeCard from '../common/MoleculeCard.jsx';
import MoleculePopup from '../common/MoleculePopup.jsx';
import ChemicalText from '../common/ChemicalText.jsx';
import AIAssistantPanel from '../common/AIAssistantPanel.jsx';
import { ATOM_LIST } from '../../constants/atoms.js';
import { matchMolecule } from '../../utils/molecules.js';
import { useGame } from '../../context/GameContext.jsx';
import { useDragSensors } from '../../hooks/useDragSensors.js';

// M1 학생용 분자 조립 화면.
// 학생은 원자를 끌어와 분자를 만들고, AI 조수는 현재 조립 상태만 짧게 안내한다.
export default function StudentMoleculeBuilder() {
  const { currentMission, unlockedMolecules, unlockMolecule, setPhase } = useGame();
  const required = currentMission.phase1.requiredMolecules;
  const sensors = useDragSensors();
  const [workspace, setWorkspace] = useState({});
  const [pendingMolecule, setPendingMolecule] = useState(null);

  const unlocked = unlockedMolecules[currentMission.id] || [];
  const allUnlocked = required.every((f) => unlocked.includes(f));

  useEffect(() => {
    if (pendingMolecule) return;
    const formula = matchMolecule(workspace);
    if (formula && required.includes(formula)) {
      setPendingMolecule(formula);
    }
  }, [workspace, required, pendingMolecule]);

  const onDragEnd = (event) => {
    if (pendingMolecule) return;
    const { active, over } = event;
    if (!over || over.id !== 'workspace') return;
    const atomSymbol = active.data?.current?.atomSymbol;
    if (!atomSymbol) return;

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

        <MoleculeAssistant
          workspace={workspace}
          pendingMolecule={pendingMolecule}
          required={required}
          missionTitle={currentMission.title}
        />

        <section className="grid grid-cols-[1fr_auto] gap-3">
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

          <aside className="w-64 rounded-xl bg-white border border-slate-200 shadow p-3">
            <h4 className="text-lg font-bold text-slate-700 mb-2 text-center">완성한 분자</h4>
            <div className="flex flex-col gap-3 items-center">
              {required.map((f) => (
                <div key={f} className={unlocked.includes(f) ? '' : 'opacity-30 grayscale'}>
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

        <section className="rounded-xl bg-white border border-slate-200 shadow px-3 py-1.5 flex items-center justify-center gap-4">
          <h4 className="text-base font-bold text-slate-600 shrink-0">원자 바구니</h4>
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
          <MoleculePopup formula={pendingMolecule} onConfirm={confirmMolecule} />
        )}
      </div>
    </DndContext>
  );
}

function MoleculeAssistant({ workspace, pendingMolecule, required, missionTitle }) {
  const atomTotal = Object.values(workspace).reduce((sum, n) => sum + n, 0);

  if (pendingMolecule) {
    return (
      <AIAssistantPanel
        status="분자 확인"
        summary={`${pendingMolecule} 조합이 완성된 것 같아요.`}
        detail="팝업에서 분자 모양과 화학식을 확인한 뒤 완성한 분자로 등록해 보세요."
        missionTitle={missionTitle}
        tone="emerald"
      />
    );
  }

  if (atomTotal === 0) {
    return (
      <AIAssistantPanel
        status="대기 중"
        summary="AI 조수가 원자 조립 과정을 살펴보고 있어요."
        detail={`${required.join(', ')} 중 하나를 만들 수 있도록 원자를 하나씩 놓아 보세요.`}
        missionTitle={missionTitle}
        tone="emerald"
      />
    );
  }

  const formulaText = Object.entries(workspace)
    .map(([sym, n]) => `${sym}${n > 1 ? n : ''}`)
    .join(' ');

  return (
    <AIAssistantPanel
      status="조립 중"
      summary={`현재 작업영역에는 ${formulaText} 조합이 있어요.`}
      detail="필요한 분자와 원자 개수가 정확히 맞는지 비교해 보세요. 너무 많이 놓은 원자는 클릭해서 뺄 수 있습니다."
      missionTitle={missionTitle}
      tone="emerald"
    />
  );
}

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
