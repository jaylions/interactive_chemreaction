import { useMemo, useState } from 'react';
import { DndContext } from '@dnd-kit/core';
import MoleculeCard from '../common/MoleculeCard.jsx';
import DropZone from '../common/DropZone.jsx';
import AtomCounter from '../common/AtomCounter.jsx';
import ChemEquation from '../common/ChemEquation.jsx';
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
        <header className="text-center flex flex-col items-center gap-1.5">
          <h2 className="text-lg font-bold text-slate-800">계수 맞추기</h2>
          {/* 정답/현재 식을 한 박스에 두 줄로 배치 — 세로 공간 절약 */}
          <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-2 flex flex-col gap-1 items-stretch min-w-[320px]">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded shrink-0">정답</span>
              <span className="text-sm font-semibold text-slate-800">{koreanReaction}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-sky-700 bg-sky-100 px-1.5 py-0.5 rounded shrink-0">현재</span>
              <ChemEquation
                reactants={reactantCounts}
                products={productCounts}
                placeholder="?"
                className="text-base"
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-500">
            카드의 × 버튼으로 개별 삭제, 영역 밖으로 끌어내도 삭제됩니다.
          </p>
        </header>

        {/* 메인 작업 영역 */}
        <section className="flex-1 grid grid-cols-[1fr_auto_1fr_auto] gap-2 items-stretch">
          <DropZone
            id="reactant-zone"
            className="min-h-[200px] flex flex-wrap items-center justify-center gap-2"
            placeholder="반응물 영역"
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

          <div className="flex items-center text-4xl font-bold text-slate-600 px-1">→</div>

          <DropZone
            id="product-zone"
            className="min-h-[200px] flex flex-wrap items-center justify-center gap-2"
            placeholder="생성물 영역"
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

          <AtomCounter before={reactantAtoms} after={productAtoms} shown={shownAtoms} />
        </section>

        {/* 분자 팔레트 */}
        <section className="rounded-xl bg-white border border-slate-200 shadow p-3">
          <h4 className="text-sm font-bold text-slate-600 mb-2">분자 팔레트 (무한 사용 가능)</h4>
          <div className="flex justify-center gap-4">
            {palette.map((formula) => (
              <PaletteItem key={formula} formula={formula} />
            ))}
          </div>
        </section>

        <div className="flex justify-center">
          <button
            className="rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold px-4 py-2"
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
