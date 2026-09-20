import React, { useEffect, useState } from 'react';

import { useReduceMotion } from '../lesson/useReduceMotion';

/**
 * docs/UI.md §6.4: a Chapter 1 line chart draws on over 800 ms. Reduce motion
 * skips straight to the finished chart.
 */
export default function DrawOnChart({
  bars,
  children,
}: {
  bars: number;
  children: (visibleCount: number) => React.ReactNode;
}) {
  const reduced = useReduceMotion();
  const [count, setCount] = useState(reduced ? bars : 1);

  useEffect(() => {
    if (reduced) {
      setCount(bars);
      return;
    }
    if (bars <= 1) return;
    const step = 800 / bars;
    let i = 1;
    const id = setInterval(() => {
      i += 1;
      setCount(i);
      if (i >= bars) clearInterval(id);
    }, step);
    return () => clearInterval(id);
  }, [bars, reduced]);

  return <>{children(Math.min(count, bars))}</>;
}
