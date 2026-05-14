import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

// Phase 0에서 사용하는 한글 명칭 단어 카드 (예: '메테인', '산소')
export default function WordCard({ label, dragId, dragData, disabled = false }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: dragId,
    data: dragData,
    disabled,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`rounded-2xl bg-white px-7 py-4 shadow-md border-2 border-slate-300 text-2xl font-bold text-slate-800 select-none touch-none ${
        disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-grab active:cursor-grabbing hover:border-slate-400'
      }`}
    >
      {label}
    </div>
  );
}
