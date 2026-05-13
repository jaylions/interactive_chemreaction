import { ATOMS } from '../../constants/atoms.js';

// 반응 전 / 반응 후 원자 개수 비교판.
// - 전체 매칭 시 emerald 배경/테두리로 강한 시각적 성공 피드백
// - 미매칭 항목은 rose, 매칭은 emerald, 비어있는 행은 회색으로 구분
// - 숫자는 큼직하게 표시해 학생이 한눈에 비교 가능
export default function AtomCounter({ before = {}, after = {}, shown }) {
  const atoms = shown && shown.length ? shown : Object.keys(ATOMS);
  const anyContent = atoms.some(
    (sym) => (before[sym] || 0) > 0 || (after[sym] || 0) > 0
  );
  const allMatch = atoms.every(
    (sym) => (before[sym] || 0) === (after[sym] || 0)
  );
  const success = anyContent && allMatch;

  return (
    <div
      className={`rounded-xl shadow-md border-2 p-3 w-60 transition-colors ${
        success
          ? 'bg-emerald-50 border-emerald-400'
          : 'bg-white border-slate-300'
      }`}
    >
      <h4 className="text-base font-bold text-slate-700 mb-2 text-center flex items-center justify-center gap-1.5">
        <span aria-hidden>⚖️</span>
        <span>원자 개수 비교</span>
      </h4>
      <table className="w-full">
        <thead>
          <tr className="text-xs text-slate-500 border-b border-slate-200">
            <th className="py-1 text-left font-medium">원자</th>
            <th className="py-1 text-center font-medium">반응 전</th>
            <th className="py-1 text-center font-medium">반응 후</th>
          </tr>
        </thead>
        <tbody>
          {atoms.map((sym) => {
            const b = before[sym] || 0;
            const a = after[sym] || 0;
            const match = b === a;
            const hasAny = b > 0 || a > 0;
            const valueClass = !hasAny
              ? 'text-slate-400'
              : match
              ? 'text-emerald-600'
              : 'text-rose-500';
            return (
              <tr
                key={sym}
                className="border-b border-slate-100 last:border-0"
              >
                <td className="py-1.5 text-sm font-medium text-slate-700">
                  {ATOMS[sym]?.name}({sym})
                </td>
                <td
                  className={`py-1.5 text-center font-mono font-bold text-2xl ${valueClass}`}
                >
                  {b}
                </td>
                <td
                  className={`py-1.5 text-center font-mono font-bold text-2xl ${valueClass}`}
                >
                  {a}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
