// {CH4: 1, O2: 2} 형태의 분자별 계수 객체 두 개(reactants, products)를
// "CH₄ + 2O₂ → CO₂ + 2H₂O" 같은 화학 반응식 JSX로 렌더링한다.
// - MissionSummary(정답 정리)와 Phase2Balancer(사용자 배치 실시간 표시) 양쪽에서 사용.
// - placeholder: 한쪽이 비어있을 때 표시할 기호 (기본 "?")
export default function ChemEquation({
  reactants,
  products,
  placeholder = '?',
  className = '',
}) {
  return (
    <span
      className={`font-mono font-bold text-slate-800 inline-flex flex-wrap items-baseline gap-1 ${className}`}
    >
      <Side coeffs={reactants} placeholder={placeholder} />
      <span className="mx-2">→</span>
      <Side coeffs={products} placeholder={placeholder} />
    </span>
  );
}

function Side({ coeffs, placeholder }) {
  const entries = Object.entries(coeffs).filter(([, n]) => n > 0);
  if (entries.length === 0) {
    return <span className="text-slate-400">{placeholder}</span>;
  }
  return (
    <>
      {entries.map(([formula, count], i) => (
        <span key={formula} className="inline-flex items-baseline">
          {i > 0 && <span className="mx-1">+</span>}
          {count > 1 && <span>{count}</span>}
          <FormulaText formula={formula} />
        </span>
      ))}
    </>
  );
}

// CH4 → CH₄ (숫자를 아래첨자로)
function FormulaText({ formula }) {
  return (
    <span>
      {formula.split(/(\d+)/).map((piece, i) =>
        /^\d+$/.test(piece) ? (
          <sub key={i} className="text-[0.75em]">{piece}</sub>
        ) : (
          <span key={i}>{piece}</span>
        )
      )}
    </span>
  );
}
