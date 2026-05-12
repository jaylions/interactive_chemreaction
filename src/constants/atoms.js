// 원자 종류, 색상, 크기 등 시각적/도메인 메타데이터
// 색상은 tailwind.config.js의 `atom.{C|H|O|N}`과 일치시킴
export const ATOMS = {
  C: { symbol: 'C', name: '탄소', color: '#FACC15', textColor: '#1f2937' },
  H: { symbol: 'H', name: '수소', color: '#F8FAFC', textColor: '#1f2937' },
  O: { symbol: 'O', name: '산소', color: '#EF4444', textColor: '#ffffff' },
  N: { symbol: 'N', name: '질소', color: '#3B82F6', textColor: '#ffffff' },
};

export const ATOM_LIST = Object.keys(ATOMS); // ['C', 'H', 'O', 'N']

// 분자 정의:
// - composition: 분자 조립 매칭 및 원자 카운트용 (어떤 원자가 몇 개)
// - layout: 분자 카드 시각화용 (원자 좌표).
//   중학교 단계에서는 결합 차수를 아직 배우지 않으므로 결합선 없이
//   원자가 서로 맞닿는 입자모형으로 표현한다.
//   * 좌표는 SVG viewBox `-70 -45 140 90` 기준
//   * 원자 반경 13이므로 중심간 거리 ≈ 26으로 두면 서로 맞닿음
export const MOLECULES = {
  CH4: {
    formula: 'CH4',
    name: '메테인',
    composition: { C: 1, H: 4 },
    layout: {
      atoms: [
        { sym: 'C', x: 0,   y: 0   },
        { sym: 'H', x: 0,   y: -26 },
        { sym: 'H', x: 26,  y: 0   },
        { sym: 'H', x: 0,   y: 26  },
        { sym: 'H', x: -26, y: 0   },
      ],
    },
  },

  O2: {
    formula: 'O2',
    name: '산소',
    composition: { O: 2 },
    layout: {
      atoms: [
        { sym: 'O', x: -13, y: 0 },
        { sym: 'O', x: 13,  y: 0 },
      ],
    },
  },

  CO2: {
    formula: 'CO2',
    name: '이산화 탄소',
    composition: { C: 1, O: 2 },
    layout: {
      atoms: [
        { sym: 'O', x: -26, y: 0 },
        { sym: 'C', x: 0,   y: 0 },
        { sym: 'O', x: 26,  y: 0 },
      ],
    },
  },

  H2O: {
    formula: 'H2O',
    name: '물',
    composition: { H: 2, O: 1 },
    // 굽은형 V자 (H가 아래 양쪽)
    layout: {
      atoms: [
        { sym: 'O', x: 0,   y: 0  },
        { sym: 'H', x: -18, y: 18 },
        { sym: 'H', x: 18,  y: 18 },
      ],
    },
  },

  H2O2: {
    formula: 'H2O2',
    name: '과산화 수소',
    composition: { H: 2, O: 2 },
    // H-O-O-H 사슬, 양 끝 H가 살짝 위로 꺾임
    layout: {
      atoms: [
        { sym: 'H', x: -37, y: -10 },
        { sym: 'O', x: -13, y: 0   },
        { sym: 'O', x: 13,  y: 0   },
        { sym: 'H', x: 37,  y: -10 },
      ],
    },
  },

  N2: {
    formula: 'N2',
    name: '질소',
    composition: { N: 2 },
    layout: {
      atoms: [
        { sym: 'N', x: -13, y: 0 },
        { sym: 'N', x: 13,  y: 0 },
      ],
    },
  },

  NO2: {
    formula: 'NO2',
    name: '이산화 질소',
    composition: { N: 1, O: 2 },
    // 굽은형 V자 (O가 아래 양쪽)
    layout: {
      atoms: [
        { sym: 'N', x: 0,   y: -9 },
        { sym: 'O', x: -18, y: 9  },
        { sym: 'O', x: 18,  y: 9  },
      ],
    },
  },
};
