import { useEffect, useState } from 'react';
import { Icon } from '../../../components';
import { ref } from '../../../foundations/tokens';

/** NoonDeal timer pill: 24h, r12, #404553, 10/600 white digits, "· {n} left". */
export function DealTimer({ seconds = 3 * 3600 + 25 * 60, left }: { seconds?: number; left?: string }) {
  const [s, setS] = useState(seconds);
  useEffect(() => {
    const t = setInterval(() => setS((x) => Math.max(0, x - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  const hh = String(Math.floor(s / 3600)).padStart(2, '0');
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, height: 24, padding: '0 10px', borderRadius: 12, background: 'var(--nk-color-text-legacy)', color: ref.color('textInverse'), font: 'var(--nk-type-home-text11-semibold-lh1)', fontVariantNumeric: 'tabular-nums' }}>
      <Icon name="clock" size={14} />
      {hh}:{mm}:{ss}
      {left && (
        <>
          <span style={{ width: 2, height: 2, borderRadius: 1, background: ref.palette('white'), margin: '0 2px' }} />
          {left}
        </>
      )}
    </span>
  );
}
