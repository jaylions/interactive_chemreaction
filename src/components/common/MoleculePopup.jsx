import { MOLECULES } from '../../constants/atoms.js';
import MoleculeShape from './MoleculeShape.jsx';

// Phase 1에서 학생이 원자를 조합해 새 분자를 완성했을 때 띄우는 확인 팝업.
// 분자 이름 · 입체 모형 · 화학식을 한 번에 큼직하게 보여주고,
// '확인'을 눌러야 다음 단계로 진행. 학교 칠판에서 멀리서 봐도 잘 보이도록 크게.
export default function MoleculePopup({ formula, onConfirm }) {
  const mol = MOLECULES[formula];
  if (!mol) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl px-10 py-8 shadow-2xl max-w-2xl w-full text-center">
        <div className="text-5xl mb-2">✨</div>
        <h3 className="text-3xl font-bold text-emerald-600 mb-1">새 분자 완성!</h3>
        <p className="text-slate-500 text-base mb-5">
          분자의 이름·모형·화학식을 확인해 보세요
        </p>

        <div className="rounded-2xl bg-slate-50 border-2 border-slate-200 px-6 py-5 mb-6 flex flex-col items-center gap-4">
          <div className="w-80 h-56">
            <MoleculeShape formula={formula} className="w-full h-full" />
          </div>
          <div className="text-4xl font-bold text-slate-700">
            {mol.name}
          </div>
          <div className="font-mono font-bold text-7xl text-slate-900 leading-none">
            {prettyFormula(formula)}
          </div>
        </div>

        <button
          type="button"
          onClick={onConfirm}
          autoFocus
          className="rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-12 py-4 text-xl"
        >
          확인
        </button>
      </div>
    </div>
  );
}

// CH4 → CH₄ (아래첨자, 본문과 비례 유지)
function prettyFormula(formula) {
  return formula.split(/(\d+)/).map((piece, i) =>
    /^\d+$/.test(piece) ? (
      <sub key={i} className="text-[0.65em]">{piece}</sub>
    ) : (
      <span key={i}>{piece}</span>
    )
  );
}
