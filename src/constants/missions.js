// 미션 시나리오 정의
// - phase0: 단어 카드 매칭 (반응물/생성물 슬롯 + 함정 카드 1~2개)
// - phase1: 분자 조립 (필요한 분자 목록)
// - phase2: 계수 맞추기 (정답 계수 + 사용 가능한 분자 팔레트)
// - enterPassword: 미션 2·3 진입에 필요한 암호 (교사가 PPT로 안내).
//   미션 1은 처음 시작이라 필요 없음.

export const MISSIONS = [
  {
    id: 'mission1',
    title: '미션 1. 메테인 연소 반응',
    description:
      '메테인(CH₄)이 연소하여 물과 이산화 탄소가 생성되는 반응을 화학 반응식으로 나타내 보자.',
    phase0: {
      slots: [
        { id: 'm1-r1', side: 'reactant', accepts: '메테인' },
        { id: 'm1-r2', side: 'reactant', accepts: '산소' },
        { id: 'm1-p1', side: 'product',  accepts: '이산화 탄소' },
        { id: 'm1-p2', side: 'product',  accepts: '물' },
      ],
      cards: ['메테인', '산소', '이산화 탄소', '물', '수소', '질소'], // 뒤 두 개가 함정
    },
    phase1: {
      requiredMolecules: ['CH4', 'O2', 'CO2', 'H2O'],
    },
    phase2: {
      // 정답: CH4 + 2 O2 -> CO2 + 2 H2O
      target: {
        reactants: { CH4: 1, O2: 2 },
        products:  { CO2: 1, H2O: 2 },
      },
      palette: ['CH4', 'O2', 'CO2', 'H2O'],
    },
  },
  {
    id: 'mission2',
    title: '미션 2. 과산화 수소 분해 반응',
    description:
      '과산화 수소(H₂O₂)가 물과 산소로 분해되는 반응을 화학 반응식으로 나타내 보자.',
    enterPassword: 'chemistry',
    phase0: {
      slots: [
        { id: 'm2-r1', side: 'reactant', accepts: '과산화 수소' },
        { id: 'm2-p1', side: 'product',  accepts: '물' },
        { id: 'm2-p2', side: 'product',  accepts: '산소' },
      ],
      cards: ['과산화 수소', '물', '산소', '이산화 탄소'], // 마지막이 함정
    },
    phase1: {
      requiredMolecules: ['H2O2', 'H2O', 'O2'],
    },
    phase2: {
      // 정답: 2 H2O2 -> 2 H2O + O2
      target: {
        reactants: { H2O2: 2 },
        products:  { H2O: 2, O2: 1 },
      },
      palette: ['H2O2', 'H2O', 'O2'],
    },
  },
  {
    id: 'mission3',
    title: '미션 3. 이산화 질소 생성 반응',
    description:
      '질소 기체와 산소 기체가 반응하여 이산화 질소 기체를 생성하는 반응을 화학 반응식으로 나타내 보자.',
    enterPassword: 'science',
    phase0: {
      slots: [
        { id: 'm3-r1', side: 'reactant', accepts: '질소' },
        { id: 'm3-r2', side: 'reactant', accepts: '산소' },
        { id: 'm3-p1', side: 'product',  accepts: '이산화 질소' },
      ],
      cards: ['질소', '산소', '이산화 질소', '이산화 탄소'], // 마지막이 함정
    },
    phase1: {
      requiredMolecules: ['N2', 'O2', 'NO2'],
    },
    phase2: {
      // 정답: N2 + 2 O2 -> 2 NO2
      target: {
        reactants: { N2: 1, O2: 2 },
        products:  { NO2: 2 },
      },
      palette: ['N2', 'O2', 'NO2'],
    },
  },
];
