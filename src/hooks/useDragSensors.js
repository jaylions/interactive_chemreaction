import { MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';

// 공용 dnd-kit 센서 설정.
// - 터치 모니터(학교 교실 환경)에서 PointerSensor가 일관되게 동작하지 않아
//   MouseSensor와 TouchSensor를 명시적으로 분리해 등록한다.
// - 터치는 약간의 누름 시간(delay)을 둬서 페이지 스크롤 의도와 드래그 의도를
//   구분한다(짧게 톡 치면 스크롤, 살짝 누르고 끌면 드래그).
export function useDragSensors() {
  return useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 4 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 120, tolerance: 6 },
    })
  );
}
