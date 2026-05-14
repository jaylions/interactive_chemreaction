// 일반 텍스트 안에 들어있는 화학식 패턴(원소 + 숫자)을 자동으로
// <sub>으로 감싸 아래첨자로 렌더링한다.
// 예: "메테인(CH4)이 연소" → "메테인(CH₄)이 연소"
//
// 매칭 규칙: 대문자(+선택적 소문자) 뒤에 숫자가 바로 오는 패턴.
// - "CH4", "H2O", "H2O2", "NO2" 등이 자동 처리됨
// - "원자 4개", "H 2개"(공백 사이) 같은 평문은 건드리지 않음
export default function ChemicalText({ children, className }) {
  if (typeof children !== 'string') {
    return <span className={className}>{children}</span>;
  }
  const parts = [];
  const regex = /([A-Z][a-z]?)(\d+)/g;
  let lastIndex = 0;
  let m;
  let key = 0;
  while ((m = regex.exec(children)) !== null) {
    if (m.index > lastIndex) {
      parts.push(
        <span key={`t-${key++}`}>{children.slice(lastIndex, m.index)}</span>
      );
    }
    parts.push(
      <span key={`f-${key++}`}>
        {m[1]}
        <sub className="text-[0.75em]">{m[2]}</sub>
      </span>
    );
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < children.length) {
    parts.push(
      <span key={`t-${key++}`}>{children.slice(lastIndex)}</span>
    );
  }
  return <span className={className}>{parts}</span>;
}
