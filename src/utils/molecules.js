import { MOLECULES } from '../constants/atoms.js';

// 작업영역에 모인 원자 카운트(예: { C: 1, H: 4 })에서
// 정확히 일치하는 분자 식별자(formula)를 찾는다. 없으면 null.
export function matchMolecule(atomCount) {
  const normalized = Object.fromEntries(
    Object.entries(atomCount).filter(([, v]) => v > 0)
  );
  const keys = Object.keys(normalized);

  for (const formula of Object.keys(MOLECULES)) {
    const comp = MOLECULES[formula].composition;
    const compKeys = Object.keys(comp);
    if (compKeys.length !== keys.length) continue;
    const sameKeys = compKeys.every((k) => normalized[k] === comp[k]);
    if (sameKeys) return formula;
  }
  return null;
}

// 분자 배치 목록(예: [{ formula: 'O2' }, { formula: 'O2' }])에 대해
// 전체 원자 개수를 합산한다.
export function tallyAtoms(placements) {
  const tally = {};
  for (const { formula } of placements) {
    const comp = MOLECULES[formula]?.composition || {};
    for (const [atom, n] of Object.entries(comp)) {
      tally[atom] = (tally[atom] || 0) + n;
    }
  }
  return tally;
}

// 두 원자 카운트 객체가 동일한지(질량 보존) 비교
export function atomsEqual(a, b) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of keys) {
    if ((a[k] || 0) !== (b[k] || 0)) return false;
  }
  return true;
}

// 사용자가 놓은 분자별 개수를 카운트한다.
// 반환: { CH4: 1, O2: 2, ... }
export function countByFormula(placements) {
  const out = {};
  for (const { formula } of placements) {
    out[formula] = (out[formula] || 0) + 1;
  }
  return out;
}

// {CH4: 1, O2: 2} 같은 분자별 계수 객체에서 총 원자 카운트 계산
// 학습지 정리 페이지에서 정답 기준 원자 개수를 계산할 때 사용
export function tallyFromCoefficients(coefficients) {
  const tally = {};
  for (const [formula, count] of Object.entries(coefficients)) {
    const comp = MOLECULES[formula]?.composition || {};
    for (const [atom, n] of Object.entries(comp)) {
      tally[atom] = (tally[atom] || 0) + n * count;
    }
  }
  return tally;
}

// 미션의 슬롯 정의에서 한글 반응식 문자열 생성
// 예: "메테인 + 산소 → 이산화 탄소 + 물"
export function buildKoreanReaction(slots) {
  const r = slots
    .filter((s) => s.side === 'reactant')
    .map((s) => s.accepts)
    .join(' + ');
  const p = slots
    .filter((s) => s.side === 'product')
    .map((s) => s.accepts)
    .join(' + ');
  return `${r} → ${p}`;
}
