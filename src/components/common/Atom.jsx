import { ATOMS } from '../../constants/atoms.js';

// 단일 원자 구형(sphere) 표현. radial-gradient + inset shadow로 입체감.
// size: px 단위
export default function Atom({ symbol, size = 56, draggableProps }) {
  const meta = ATOMS[symbol];
  if (!meta) return null;

  // radial-gradient: 하이라이트가 좌상단에 오도록
  const background = `radial-gradient(circle at 32% 30%, #ffffff 0%, ${meta.color} 45%, ${darken(meta.color)} 100%)`;

  return (
    <div
      {...draggableProps}
      className="atom-sphere"
      style={{
        width: size,
        height: size,
        background,
        color: meta.textColor,
        fontSize: size * 0.4,
        border: symbol === 'H' ? '1px solid #cbd5e1' : 'none',
      }}
      aria-label={`${meta.name}(${symbol})`}
    >
      {symbol}
    </div>
  );
}

// 간단한 색상 어둡게 처리 (그라데이션 끝점용)
function darken(hex) {
  const c = hex.replace('#', '');
  const r = Math.max(0, parseInt(c.slice(0, 2), 16) - 60);
  const g = Math.max(0, parseInt(c.slice(2, 4), 16) - 60);
  const b = Math.max(0, parseInt(c.slice(4, 6), 16) - 60);
  return `rgb(${r}, ${g}, ${b})`;
}
