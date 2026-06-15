import { useMemo, useState } from 'react';
import { DndContext } from '@dnd-kit/core';
import MoleculeCard from '../common/MoleculeCard.jsx';
import DropZone from '../common/DropZone.jsx';
import AtomCounter from '../common/AtomCounter.jsx';
import ChemEquation from '../common/ChemEquation.jsx';
import AIAssistantPanel from '../common/AIAssistantPanel.jsx';
import { useGame } from '../../context/GameContext.jsx';
import { MOLECULES } from '../../constants/atoms.js';
import { atomsEqual, buildKoreanReaction, countByFormula, tallyAtoms } from '../../utils/molecules.js';
import { useDragSensors } from '../../hooks/useDragSensors.js';
import MissionSummary from '../MissionSummary.jsx';

// Phase 2: 계수 맞추기
// - 좌: 반응물 영역, 우: 생성물 영역
// - 하단 팔레트의 분자를 영역으로 드래그
// - 각 카드의 X 버튼으로 개별 제거, '모두 비우기'로 전체 초기화
// - 영역 밖으로 드래그해도 삭제 가능 (보조 동작)
// - 양쪽 영역의 분자 구성이 정답과 일치하면 클리어 오버레이
export default function Phase2Balancer() {
  const { currentMission, missionIndex, advanceMission } = useGame();
  const palette = currentMission.phase2.palette;
  const target = currentMission.phase2.target;

  // 배치된 분자: [{ instanceId, formula }]
  const [reactants, setReactants] = useState([]);
  const [products, setProducts] = useState([]);

  const sensors = useDragSensors();

  const reactantAtoms = useMemo(() => tallyAtoms(reactants), [reactants]);
  const productAtoms = useMemo(() => tallyAtoms(products), [products]);
  const reactantCounts = useMemo(() => countByFormula(reactants), [reactants]);
  const productCounts = useMemo(() => countByFormula(products), [products]);

  // target에 등장하는 모든 분자의 구성 원자 합집합
  const shownAtoms = useMemo(() => {
    const set = new Set();
    const allFormulas = [
      ...Object.keys(target.reactants),
      ...Object.keys(target.products),
    ];
    for (const formula of allFormulas) {
      const comp = MOLECULES[formula]?.composition || {};
      for (const sym of Object.keys(comp)) set.add(sym);
    }
    return Array.from(set);
  }, [target]);

  // 클리어 조건: 좌우 원자 일치 + 정답 계수와 일치
  const isBalanced = useMemo(() => {
    if (reactants.length === 0 || products.length === 0) return false;
    if (!atomsEqual(reactantAtoms, productAtoms)) return false;
    return matchesTarget(reactantCounts, target.reactants) &&
           matchesTarget(productCounts, target.products);
  }, [reactants.length, products.length, reactantAtoms, productAtoms, reactantCounts, productCounts, target]);

  const onDragEnd = (event) => {
    const { active, over } = event;
    const data = active.data?.current || {};

    // 영역 밖으로 드래그 → 삭제
    if (!over) {
      if (data.instanceId) removeInstance(data.from, data.instanceId);
      return;
    }

    // 팔레트 → 영역 (새 인스턴스 추가). 잘못된 위치는 그냥 무시.
    if (data.fromPalette) {
      const newItem = { instanceId: crypto.randomUUID(), formula: data.formula };
      if (over.id === 'reactant-zone') setReactants((arr) => [...arr, newItem]);
      else if (over.id === 'product-zone') setProducts((arr) => [...arr, newItem]);
      return;
    }

    // 영역 간 이동
    if (data.instanceId) {
      const dest = over.id;
      if (dest !== 'reactant-zone' && dest !== 'product-zone') return;
      const moveTo = dest === 'reactant-zone' ? 'reactant' : 'product';
      if (data.from === moveTo) return;

      const sourceArr = data.from === 'reactant' ? reactants : products;
      const item = sourceArr.find((m) => m.instanceId === data.instanceId);
      if (!item) return;
      removeInstance(data.from, data.instanceId);
      if (moveTo === 'reactant') setReactants((arr) => [...arr, item]);
      else setProducts((arr) => [...arr, item]);
    }
  };

  const removeInstance = (from, instanceId) => {
    if (from === 'reactant') {
      setReactants((arr) => arr.filter((m) => m.instanceId !== instanceId));
    } else if (from === 'product') {
      setProducts((arr) => arr.filter((m) => m.instanceId !== instanceId));
    }
  };

  const clearAll = () => {
    setReactants([]);
    setProducts([]);
  };

  const koreanReaction = buildKoreanReaction(currentMission.phase0.slots);

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      <div className="flex flex-col h-full gap-2 relative">
        <header className="text-center flex flex-col items-center gap-2">
          <h2 className="text-2xl font-bold text-slate-800">계수 맞추기</h2>

          {/* 정답 박스 — 정적, 학생이 만들어야 할 목표 */}
          <div className="rounded-xl bg-amber-50 border-2 border-amber-200 px-5 py-2 flex items-center gap-3">
            <span className="text-sm font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded shrink-0">정답</span>
            <span className="text-xl font-bold text-slate-800">{koreanReaction}</span>
          </div>

          {/* 현재 화학식 박스 — 학생이 카드를 놓을 때마다 실시간 변화하는 핵심 부분 */}
          <div className="rounded-2xl bg-sky-50 border-2 border-sky-300 px-7 py-3 flex items-center gap-3 shadow-md transition-colors">
            <span className="text-base font-bold text-sky-700 bg-sky-200 px-3 py-1 rounded shrink-0">현재</span>
            <ChemEquation
              reactants={reactantCounts}
              products={productCounts}
              placeholder="?"
              className="text-4xl"
            />
          </div>

          <p className="text-sm text-slate-500">
            카드의 × 버튼으로 개별 삭제, 영역 밖으로 끌어내도 삭제됩니다.
          </p>
        </header>

        <BalancerAssistant
          missionTitle={currentMission.title}
          reactants={reactants}
          products={products}
          reactantAtoms={reactantAtoms}
          productAtoms={productAtoms}
          isBalanced={isBalanced}
        />

        {/* 메인 작업 영역 - 각 영역 위에 반응물/생성물 라벨로 명확히 구분 */}
        <section className="flex-1 grid grid-cols-[1fr_auto_1fr_auto] gap-2 items-stretch">
          <div className="flex flex-col">
            <div className="text-center text-lg font-bold text-rose-700 bg-rose-100 border-2 border-rose-300 border-b-0 rounded-t-xl py-1.5">
              반응물 (반응 전)
            </div>
            <DropZone
              id="reactant-zone"
              className="flex-1 min-h-[180px] flex flex-wrap items-center justify-center gap-2 rounded-t-none border-t-0"
              placeholder="여기에 반응물 분자를 놓으세요"
            >
              {reactants.map((m) => (
                <MoleculeCard
                  key={m.instanceId}
                  formula={m.formula}
                  dragId={`r-${m.instanceId}`}
                  dragData={{ instanceId: m.instanceId, from: 'reactant' }}
                  onRemove={() => removeInstance('reactant', m.instanceId)}
                />
              ))}
            </DropZone>
          </div>

          <div className="flex items-center text-5xl font-bold text-slate-600 px-1">→</div>

          <div className="flex flex-col">
            <div className="text-center text-lg font-bold text-emerald-700 bg-emerald-100 border-2 border-emerald-300 border-b-0 rounded-t-xl py-1.5">
              생성물 (반응 후)
            </div>
            <DropZone
              id="product-zone"
              className="flex-1 min-h-[180px] flex flex-wrap items-center justify-center gap-2 rounded-t-none border-t-0"
              placeholder="여기에 생성물 분자를 놓으세요"
            >
              {products.map((m) => (
                <MoleculeCard
                  key={m.instanceId}
                  formula={m.formula}
                  dragId={`p-${m.instanceId}`}
                  dragData={{ instanceId: m.instanceId, from: 'product' }}
                  onRemove={() => removeInstance('product', m.instanceId)}
                />
              ))}
            </DropZone>
          </div>

          <AtomCounter before={reactantAtoms} after={productAtoms} shown={shownAtoms} />
        </section>

        {/* 분자 팔레트 */}
        <section className="rounded-xl bg-white border border-slate-200 shadow p-3">
          <h4 className="text-base font-bold text-slate-600 mb-2">분자 팔레트 (무한 사용 가능)</h4>
          <div className="flex justify-center gap-4">
            {palette.map((formula) => (
              <PaletteItem key={formula} formula={formula} />
            ))}
          </div>
        </section>

        <div className="flex justify-center">
          <button
            className="rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-5 py-2 text-base"
            onClick={clearAll}
          >
            모두 비우기
          </button>
        </div>

        {isBalanced && (
          <MissionSummary missionIndex={missionIndex} onAdvance={advanceMission} />
        )}
      </div>
    </DndContext>
  );
}

function BalancerAssistant({
  missionTitle,
  reactants,
  products,
  reactantAtoms,
  productAtoms,
  isBalanced,
}) {
  if (isBalanced) {
    return (
      <AIAssistantPanel
        status="완성"
        summary="반응 전후 원자 수가 같아졌어요."
        detail="계수는 분자의 개수를 나타내고, 아래첨자는 분자 속 원자 개수를 나타낸다는 점을 확인해 보세요."
        missionTitle={missionTitle}
        tone="amber"
      />
    );
  }

  if (reactants.length === 0 && products.length === 0) {
    return (
      <AIAssistantPanel
        status="대기 중"
        summary="AI 조수가 반응식의 원자 수를 비교할 준비를 하고 있어요."
        detail="분자 카드를 반응물과 생성물 쪽에 놓으면, 어느 원자 수가 맞지 않는지 함께 확인할 수 있습니다."
        missionTitle={missionTitle}
        tone="amber"
      />
    );
  }

  const mismatch = firstMismatch(reactantAtoms, productAtoms);
  if (mismatch) {
    return (
      <AIAssistantPanel
        status="원자 수 비교"
        summary={`${mismatch.atom} 원자 수가 아직 맞지 않아요.`}
        detail={`반응 전 ${mismatch.before}개, 반응 후 ${mismatch.after}개입니다. 아래첨자는 바꾸지 말고 분자 카드의 개수로 맞춰 보세요.`}
        missionTitle={missionTitle}
        tone="amber"
      />
    );
  }

  return (
    <AIAssistantPanel
      status="계수 확인"
      summary="원자 수는 맞아 보이지만 정답 계수와 배치가 더 정확해야 해요."
      detail="반응물과 생성물 쪽에 필요한 분자가 빠지거나 더 들어가지 않았는지 확인해 보세요."
      missionTitle={missionTitle}
      tone="amber"
    />
  );
}

function firstMismatch(before, after) {
  const names = { C: '탄소(C)', H: '수소(H)', O: '산소(O)', N: '질소(N)' };
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  for (const key of keys) {
    if ((before[key] || 0) !== (after[key] || 0)) {
      return {
        atom: names[key] || key,
        before: before[key] || 0,
        after: after[key] || 0,
      };
    }
  }
  return null;
}

// 한 분자에 대해 새로운 인스턴스를 발생시키는 팔레트 항목
function PaletteItem({ formula }) {
  const [pickCount, setPickCount] = useState(0);
  const dragId = `palette-${formula}-${pickCount}`;
  return (
    <div
      onPointerUp={() => setPickCount((c) => c + 1)}
      className="touch-none"
    >
      <MoleculeCard
        formula={formula}
        dragId={dragId}
        dragData={{ fromPalette: true, formula }}
      />
    </div>
  );
}

// 사용자의 분자별 개수가 정답 계수와 일치하는지 검사 (최소 정수 계수 기준).
function matchesTarget(actual, target) {
  const tKeys = Object.keys(target);
  const aKeys = Object.keys(actual);
  if (tKeys.length !== aKeys.length) return false;
  return tKeys.every((k) => actual[k] === target[k]);
}
