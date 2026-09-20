import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/** docs/UI.md §10: reduce motion removes confetti, flicker and auto-playback. */
export function useReduceMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (alive) setReduced(value);
    });
    const sub = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (value) => setReduced(value)
    );
    return () => {
      alive = false;
      sub?.remove();
    };
  }, []);

  return reduced;
}
