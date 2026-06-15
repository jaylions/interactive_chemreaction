import { createContext, useCallback, useContext, useMemo, useReducer } from 'react';
import { MISSIONS } from '../constants/missions.js';

const GameContext = createContext(null);

// 게임 전체 진행 상태:
// - missionIndex: 현재 미션 인덱스 (0~2)
// - phase: 현재 미션 내 단계 (0 | 1 | 2 | 'done')
//   * 0: 단어 카드 매칭
//   * 1: 분자 조립
//   * 2: 계수 맞추기 (클리어 시 다음 미션 진입 암호 입력 폼이 오버레이로 표시)
//   * 'done': 모든 미션 종료
// - unlockedMolecules: 각 미션 Phase 1에서 조립 완료한 분자(팔레트 풀)

const initialState = {
  missionIndex: 0,
  phase: 0,
  unlockedMolecules: { mission1: [], mission2: [], mission3: [] },
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_PHASE':
      return { ...state, phase: action.phase };

    case 'UNLOCK_MOLECULE': {
      const id = MISSIONS[state.missionIndex].id;
      const current = state.unlockedMolecules[id] || [];
      if (current.includes(action.formula)) return state;
      return {
        ...state,
        unlockedMolecules: {
          ...state.unlockedMolecules,
          [id]: [...current, action.formula],
        },
      };
    }

    case 'ADVANCE_MISSION': {
      const nextIndex = state.missionIndex + 1;
      if (nextIndex >= MISSIONS.length) {
        return { ...state, phase: 'done' };
      }
      return {
        ...state,
        missionIndex: nextIndex,
        phase: 0, // 암호 입력은 클리어 오버레이에서 끝났으므로 바로 phase 0로
      };
    }

    case 'JUMP_TO': {
      const missionIndex = Math.min(
        Math.max(action.missionIndex, 0),
        MISSIONS.length - 1
      );
      return {
        ...state,
        missionIndex,
        phase: action.phase,
      };
    }

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const currentMission = MISSIONS[state.missionIndex];

  const setPhase = useCallback((phase) => dispatch({ type: 'SET_PHASE', phase }), []);
  const unlockMolecule = useCallback(
    (formula) => dispatch({ type: 'UNLOCK_MOLECULE', formula }),
    []
  );
  const advanceMission = useCallback(() => dispatch({ type: 'ADVANCE_MISSION' }), []);
  const jumpTo = useCallback(
    (missionIndex, phase = 0) => dispatch({ type: 'JUMP_TO', missionIndex, phase }),
    []
  );
  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

  const value = useMemo(
    () => ({
      ...state,
      currentMission,
      setPhase,
      unlockMolecule,
      advanceMission,
      jumpTo,
      reset,
    }),
    [state, currentMission, setPhase, unlockMolecule, advanceMission, jumpTo, reset]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame은 GameProvider 내부에서만 사용할 수 있습니다.');
  return ctx;
}
