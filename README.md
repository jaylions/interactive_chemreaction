# 화학 반응식 맞추기 (chem-reaction-app)

중학교 과학 3 — `Ⅰ. 화학 반응의 규칙과 에너지 변화 / 3. 화학 반응식` 단원용 인터랙티브 학습 앱.

## 실행

```bash
npm install
npm run dev
```

## 디렉터리 구조

```
src/
├── App.jsx                       # 16:9 레이아웃 + GameProvider
├── main.jsx
├── index.css                     # Tailwind + atom-sphere 컴포넌트 스타일
├── constants/
│   ├── atoms.js                  # ATOMS (C/H/O/N), MOLECULES 정의
│   └── missions.js               # 3개 미션 시나리오 (phase0/1/2 + 암호)
├── context/
│   └── GameContext.jsx           # 전역 상태: 미션 인덱스 / phase / 잠금해제 분자 / 암호
├── utils/
│   └── molecules.js              # 원자 매칭, 합산, 비교 유틸
└── components/
    ├── MissionContainer.jsx      # 현재 phase에 따라 라우팅
    ├── PasswordGate.jsx          # 미션 2·3 진입 암호
    ├── common/
    │   ├── Atom.jsx              # radial-gradient 구형 원자
    │   ├── MoleculeCard.jsx      # 분자 카드 (draggable)
    │   ├── WordCard.jsx          # 한글 단어 카드 (draggable)
    │   ├── DropZone.jsx          # useDroppable 래퍼
    │   └── AtomCounter.jsx       # 반응 전/후 원자 개수 표
    └── phases/
        ├── Phase0WordMatch.jsx   # 단어 카드 매칭
        ├── Phase1MoleculeBuilder.jsx  # 원자 → 분자 조립
        └── Phase2Balancer.jsx    # 분자 → 계수 맞추기
```

## 진행 흐름

```
미션1 (phase0 → phase1 → phase2) → 암호 0427
미션2 (gate → phase0 → phase1 → phase2) → 암호 1903
미션3 (gate → phase0 → phase1 → phase2) → done
```

## dnd-kit 사용 패턴

- 각 Phase 컴포넌트가 자체 `<DndContext>`를 가지고 phase별 onDragEnd 로직을 정의.
- 무한 드래그가 필요한 소스(원자 바구니, 분자 팔레트)는 `onPointerUp`에서 카운터를 증가시켜 매번 새 draggable id를 할당하는 방식으로 구현 (`AtomSource`, `PaletteItem`).
- 드롭 영역은 `DropZone` 공통 컴포넌트로 통일. `over.id`로 식별.
- 영역 밖 드롭(= `over === null`) 시 인스턴스를 제거 → Phase 2에서 카드 삭제 기능으로 사용.

## 오답 처리

- 잘못된 슬롯/조합/위치에 드롭되면 `window.alert('다시 해봐요!')`로 알림.
- 잘못된 카드는 원래 위치로 돌아감(상태를 변경하지 않음).

## TODO / 확장 포인트

- 클리어 애니메이션 강화 (현재는 단순 fadeIn 오버레이).
- 분자 카드 dragOverlay로 드래그 미리보기 보강.
- 형성평가(일산화 탄소 연소) 보너스 미션 추가.
