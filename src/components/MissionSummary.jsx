import { useState } from 'react';
import { ATOMS, MOLECULES } from '../constants/atoms.js';
import { MISSIONS } from '../constants/missions.js';
import { buildKoreanReaction, tallyFromCoefficients } from '../utils/molecules.js';

// 미션 클리어 시 표시되는 학습지 답안 정리 페이지.
// 학생이 활동지에 직접 적을 수 있도록 한글 반응식 / 완성된 화학 반응식 /
// 반응 전후 원자 개수 / (미션 3) 계수의 비 활용을 정리해서 보여준다.
// 다음 미션이 있으면 진입 암호 입력 폼, 없으면 완료 버튼.
export default function MissionSummary({ missionIndex, onAdvance }) {
  const mission = MISSIONS[missionIndex];
  const nextMission = MISSIONS[missionIndex + 1];
  const isLast = !nextMission;

  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  const koreanReaction = buildKoreanReaction(mission.phase0.slots);
  const beforeCount = tallyFromCoefficients(mission.phase2.target.reactants);
  const afterCount = tallyFromCoefficients(mission.phase2.target.products);
  const shownAtoms = collectAtoms(mission.phase2.target);

  const onSubmit = (e) => {
    e.preventDefault();
    if (input.trim() === nextMission.enterPassword) {
      onAdvance();
    } else {
      setError(true);
      setInput('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl px-8 py-6 shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto">
        <div className="text-center mb-4">
          <div className="text-5xl mb-2">🎉</div>
          <h3 className="text-2xl font-bold text-emerald-600">참 잘했어요!</h3>
          <p className="text-sm text-slate-500 mt-1">{mission.title}</p>
        </div>

        <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 mb-5">
          <h4 className="text-base font-bold text-slate-700 mb-3 flex items-center gap-2">
            <span>📒</span> 학습지 답안 정리
          </h4>
          <div className="space-y-3">
            <Row label="한글 반응식">
              <span className="text-base text-slate-800">{koreanReaction}</span>
            </Row>
            <Row label="완성된 화학 반응식">
              <ChemEquation target={mission.phase2.target} />
            </Row>
            <Row label="반응 전후 원자 개수">
              <AtomCountTable
                before={beforeCount}
                after={afterCount}
                atoms={shownAtoms}
              />
            </Row>
            {missionIndex === 2 && (
              <Row label="계수의 비 활용 (NO₂ 분자 50개 생성 시)">
                <Mission3Extra target={mission.phase2.target} />
              </Row>
            )}
          </div>
        </div>

        {isLast ? (
          <div className="flex justify-center">
            <button
              className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 py-3"
              onClick={onAdvance}
            >
              수업 마치기
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col items-center gap-2">
            <p className="text-sm text-slate-600">
              다음 미션 진입 암호를 입력하세요.
            </p>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  if (error) setError(false);
                }}
                maxLength={24}
                autoFocus
                className={`border-2 rounded-xl px-4 py-2 text-center text-lg font-mono focus:outline-none w-56 ${
                  error
                    ? 'border-rose-400 focus:border-rose-500'
                    : 'border-slate-300 focus:border-emerald-400'
                }`}
                placeholder="암호 입력"
              />
              <button
                type="submit"
                className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-2"
              >
                입장
              </button>
            </div>
            {error && (
              <p className="text-xs text-rose-500">암호가 일치하지 않습니다.</p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div>
      <div className="text-xs font-semibold text-slate-500 mb-1">{label}</div>
      <div className="bg-white border border-slate-200 rounded-lg px-3 py-2">
        {children}
      </div>
    </div>
  );
}

function ChemEquation({ target }) {
  return (
    <span className="font-mono font-bold text-lg text-slate-800 flex flex-wrap items-center gap-1">
      <Side coeffs={target.reactants} />
      <span className="mx-2">→</span>
      <Side coeffs={target.products} />
    </span>
  );
}

function Side({ coeffs }) {
  const entries = Object.entries(coeffs);
  return (
    <>
      {entries.map(([formula, count], i) => (
        <span key={formula} className="flex items-center">
          {i > 0 && <span className="mx-1">+</span>}
          {count > 1 && <span>{count}</span>}
          <FormulaText formula={formula} />
        </span>
      ))}
    </>
  );
}

function FormulaText({ formula }) {
  return (
    <span>
      {formula.split(/(\d+)/).map((piece, i) =>
        /^\d+$/.test(piece) ? <sub key={i}>{piece}</sub> : <span key={i}>{piece}</span>
      )}
    </span>
  );
}

function collectAtoms(target) {
  const set = new Set();
  for (const formula of [...Object.keys(target.reactants), ...Object.keys(target.products)]) {
    const comp = MOLECULES[formula]?.composition || {};
    for (const atom of Object.keys(comp)) set.add(atom);
  }
  return Array.from(set);
}

function AtomCountTable({ before, after, atoms }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-slate-500">
          <th className="py-1 text-left font-medium">원자</th>
          <th className="py-1 text-center font-medium">반응 전</th>
          <th className="py-1 text-center font-medium">반응 후</th>
        </tr>
      </thead>
      <tbody>
        {atoms.map((sym) => (
          <tr key={sym}>
            <td className="py-1 text-slate-700">
              {ATOMS[sym]?.name}({sym})
            </td>
            <td className="py-1 text-center font-mono font-bold">
              {before[sym] || 0}
            </td>
            <td className="py-1 text-center font-mono font-bold">
              {after[sym] || 0}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Mission3Extra({ target }) {
  const n2 = target.reactants.N2 || 0;
  const o2 = target.reactants.O2 || 0;
  const no2 = target.products.NO2 || 0;
  const scale = no2 > 0 ? 50 / no2 : 0;
  return (
    <div className="space-y-1 text-sm text-slate-800">
      <div>
        계수의 비 (N₂ : O₂ : NO₂) ={' '}
        <span className="font-mono font-bold">
          {n2} : {o2} : {no2}
        </span>
      </div>
      <div>
        반응한 질소 분자(N₂):{' '}
        <span className="font-mono font-bold">{n2 * scale}개</span>
      </div>
      <div>
        반응한 산소 분자(O₂):{' '}
        <span className="font-mono font-bold">{o2 * scale}개</span>
      </div>
    </div>
  );
}
