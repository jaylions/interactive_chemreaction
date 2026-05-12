import { useDroppable } from '@dnd-kit/core';

// 범용 드롭 영역. dnd-kit useDroppable로 동작.
// id, data, className, placeholder, children
export default function DropZone({ id, data, className = '', placeholder, children }) {
  const { setNodeRef, isOver } = useDroppable({ id, data });

  return (
    <div
      ref={setNodeRef}
      className={`transition-colors rounded-xl border-2 border-dashed p-3 ${
        isOver ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 bg-slate-50'
      } ${className}`}
    >
      {children || (
        <div className="text-slate-400 text-sm text-center">{placeholder}</div>
      )}
    </div>
  );
}
