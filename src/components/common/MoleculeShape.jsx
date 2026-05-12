import { useId } from 'react';
import { ATOMS, MOLECULES } from '../../constants/atoms.js';

const ATOM_RADIUS = 13;
const VIEW_BOX = '-70 -45 140 90';

// 분자 layout(원자 좌표)을 SVG로 렌더링.
// 중학교 단계에 맞춰 결합선 없이 원자가 서로 맞닿는 입자모형으로 표현.
// 각 원자는 radial-gradient로 구체감을 부여.
export default function MoleculeShape({ formula, className = '' }) {
  const mol = MOLECULES[formula];
  const id = useId();
  if (!mol?.layout) return null;

  const { atoms } = mol.layout;

  return (
    <svg
      viewBox={VIEW_BOX}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label={`${mol.name} 분자 모형`}
    >
      <defs>
        {Object.entries(ATOMS).map(([sym, meta]) => (
          <radialGradient
            key={sym}
            id={`grad-${id}-${sym}`}
            cx="35%"
            cy="30%"
            r="70%"
          >
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="55%" stopColor={meta.color} />
            <stop offset="100%" stopColor={darken(meta.color)} />
          </radialGradient>
        ))}
      </defs>

      {atoms.map((a, i) => (
        <g key={`a-${i}`}>
          <circle
            cx={a.x}
            cy={a.y}
            r={ATOM_RADIUS}
            fill={`url(#grad-${id}-${a.sym})`}
            stroke={a.sym === 'H' ? '#cbd5e1' : 'none'}
            strokeWidth={a.sym === 'H' ? 0.5 : 0}
          />
          <text
            x={a.x}
            y={a.y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="12"
            fontWeight="700"
            fill={ATOMS[a.sym].textColor}
            style={{ userSelect: 'none', pointerEvents: 'none' }}
          >
            {a.sym}
          </text>
        </g>
      ))}
    </svg>
  );
}

function darken(hex) {
  const c = hex.replace('#', '');
  const r = Math.max(0, parseInt(c.slice(0, 2), 16) - 60);
  const g = Math.max(0, parseInt(c.slice(2, 4), 16) - 60);
  const b = Math.max(0, parseInt(c.slice(4, 6), 16) - 60);
  return `rgb(${r}, ${g}, ${b})`;
}
