import { MOLECULES } from '../../constants/atoms.js';
import MoleculeShape from './MoleculeShape.jsx';

// Phase 1에서 학생이 원자를 조합해 새 분자를 완성했을 때 띄우는 확인 팝업.
// 분자 이름 · 입체 모형 · 화학식을 한 번에 보여주고, '확인'을 눌러야 다음 단계로 진행.
export default function MoleculePopup({ formula, onConfirm }) {
  const mol = MOLECULES[formula];
  if (!mol) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl px-8 py-6 shadow-2xl max-w-md w-full text-center">
        <div className="text-4xl mb-1">✨</div>
        <h3 className="text-xl font-bold text-emerald-600 mb-1">새 분자 완성!</h3>
        <p className="text-slate-500 text-xs mb-3">
          분자의 이름·모형·화학식을 확인해 보세요
        </p>

        <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 mb-4 flex flex-col items-center gap-2">
          <div className="w-44 h-28">
            <MoleculeShape formula={formula} className="w-full h-full" />
          </div>
          <div className="text-base font-semibold text-slate-600">
            {mol.name}
          </div>
          <div className="font-mono font-bold text-3xl text-slate-800">
            {prettyFormula(formula)}
          </div>
        </div>

        <button
          type="button"
          onClick={onConfirm}
          autoFocus
          className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 py-2.5"
        >
          확인
        </button>
      </div>
    </div>
  );
}

// CH4 → CH₄
function prettyFormula(formula) {
  return formula.split(/(\d+)/).map((piece, i) =>
    /^\d+$/.test(piece) ? (
      <sub key={i} className="text-[0.7em]">{piece}</sub>
    ) : (
      <span key={i}>{piece}</span>
    )
  );
}
