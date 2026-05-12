import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { MOLECULES } from '../../constants/atoms.js';
import MoleculeShape from './MoleculeShape.jsx';

// 분자 카드: 실제 분자 모양(SVG) + 분자식 라벨.
// dnd-kit draggable로 동작. onRemove를 받으면 우상단에 X 버튼이 떠 삭제 가능.
export default function MoleculeCard({
  formula,
  dragId,
  dragData,
  size = 'md',
  onRemove,
}) {
  const mol = MOLECULES[formula];
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: dragId,
    data: dragData,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  if (!mol) return null;

  const dims =
    size === 'sm' ? 'w-24 h-16' :
    size === 'lg' ? 'w-44 h-28' :
                    'w-32 h-20';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="relative flex flex-col items-center gap-1 rounded-2xl bg-white px-3 py-2 shadow-md border border-slate-200 cursor-grab active:cursor-grabbing"
    >
      {onRemove && (
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold shadow flex items-center justify-center"
          aria-label="삭제"
        >
          ×
        </button>
      )}

      <div className={dims}>
        <MoleculeShape formula={formula} className="w-full h-full" />
      </div>
      <div className="text-sm font-semibold text-slate-700">
        {prettyFormula(mol.formula)}
      </div>
    </div>
  );
}

// CH4 → CH₄ (숫자를 아래첨자로)
function prettyFormula(formula) {
  return formula.split(/(\d+)/).map((piece, i) =>
    /^\d+$/.test(piece) ? <sub key={i}>{piece}</sub> : <span key={i}>{piece}</span>
  );
}
