import { ATOMS } from '../../constants/atoms.js';

// 반응 전 / 반응 후 원자 개수 현황판
// before, after: { C: 1, H: 4, ... }
// shown: 어떤 원자만 표시할지 (예: ['C','H','O']) — 미션마다 다르게 지정
export default function AtomCounter({ before = {}, after = {}, shown }) {
  const atoms = shown && shown.length ? shown : Object.keys(ATOMS);

  return (
    <div className="rounded-xl bg-white shadow border border-slate-200 p-3 w-56">
      <h4 className="text-sm font-bold text-slate-700 mb-2 text-center">원자 개수 현황</h4>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-slate-500">
            <th className="py-1 text-left">원자</th>
            <th className="py-1 text-center">반응 전</th>
            <th className="py-1 text-center">반응 후</th>
          </tr>
        </thead>
        <tbody>
          {atoms.map((sym) => {
            const b = before[sym] || 0;
            const a = after[sym] || 0;
            const match = b === a;
            return (
              <tr key={sym} className={match ? 'text-emerald-600' : 'text-rose-500'}>
                <td className="py-1">
                  {ATOMS[sym]?.name}({sym})
                </td>
                <td className="py-1 text-center font-mono">{b}</td>
                <td className="py-1 text-center font-mono">{a}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
