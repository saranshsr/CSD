import { useEffect, useState } from 'react';
import { OriginIcon, Pressable, ProductImage, QuickAdd } from '../../../components';
import { ref } from '../../../foundations/tokens';
import { useNav } from '../../../kit/Navigator';
import { currency, formatPrice } from '../../../data';
import { megaDeals, type BzHeader, type BzWrap } from '../data.feed';
import { bz } from '../tokens.feed';
import { BzModuleWrapper } from './BzModuleWrapper';
import styles from './MegaDeals.module.css';

/** Timer.ts with enableRecursive: an end time in the past rolls forward in 24 h steps → the next 06:00 UTC (10:00 Dubai). */
function nextReset(now: number) {
  const d = new Date(now);
  const t = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 6);
  return t > now ? t : t + 864e5;
}
const pad = (n: number) => String(n).padStart(2, '0');

/**
 * hpMegaDealModule → NoonMegaDealsModule (marketplaces/noon/components/Module/NoonMegaDealsModule): CMS bg #efeeff,
 * innerPadding top 10. Header "Mega deals" (title max width W · 0.34 when a timer and a link share the row) with
 * "View all" in the CMS link colour; the countdown tab (138×35, concave 12 shoulders, #0a0a0a) hangs from the
 * module's top edge, centred; hourglass 15 + "HH : MM : SS" 14/19 bold white, ticking every second.
 * Grid: 2 columns × 2 rows filled column-first, slot floor((W − 12 · 3) / 2) = 177, padding 0 12, gaps 12, 12 under
 * the header. Slot: white r10, p6, 16 below; image 165 × (3.85 / 3) · 177 = 227 r8 cover with the CMS tag
 * (#9242f8, 8/4 padding, bottom-end r12, 12/600 white) and quick add; title 14/18 600 black 2 lines; price 18 bold,
 * was 14/18 600 #989FB3 struck, discount 14/18 600 #2DAF32. Tap → PDP.
 */
export function MegaDeals({ wrap, header }: { wrap: BzWrap; header?: BzHeader }) {
  const nav = useNav();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);
  const left = Math.max(0, nextReset(now) - now) / 1000;
  const h = Math.floor(left / 3600);
  const m = Math.floor((left % 3600) / 60);
  const s = Math.floor(left % 60);
  const cols = [0, 1].map((c) => [megaDeals[c * 2], megaDeals[c * 2 + 1]].filter(Boolean));

  return (
    <BzModuleWrapper wrap={wrap} header={header} className={styles.module}>
      <div className={styles.timer} aria-label={`Ends in ${h} hours ${m} minutes ${s} seconds`}>
        <svg width="138" height="35" viewBox="0 0 138 35" aria-hidden className={styles.tab}>
          <path d="M0 0H138Q126 0 126 12V25Q126 35 116 35H22Q12 35 12 25V12Q12 0 0 0Z" fill="currentColor" />
        </svg>
        <span className={styles.timerRow}>
          <OriginIcon name="hourglass" size={15} color={ref.color('textInverse')} />
          <span>
            {pad(h)} : {pad(m)} : {pad(s)}
          </span>
        </span>
      </div>
      <div className={styles.grid}>
        {cols.map((col, c) => (
          <div key={c} className={styles.column}>
            {col.map(({ product: p, tag }) => {
              const pct = p.was ? Math.round(((p.was - p.price) / p.was) * 100) : 0;
              return (
                <Pressable asDiv key={p.id} className={styles.slot} style={{ width: bz.megaWidth }} scale={1} onClick={() => nav.push('pdp/detail', { productId: p.id })} aria-label={p.title}>
                  <span className={styles.image} style={{ height: bz.megaImageHeight }}>
                    <ProductImage product={p} height="100%" fit="cover" />
                    {tag && <span className={styles.tag}>{tag}</span>}
                    <span className={styles.quick}>
                      <QuickAdd productId={p.id} />
                    </span>
                  </span>
                  <span className={styles.details}>
                    <span className={styles.title}>{p.title}</span>
                    <span className={styles.offer}>
                      <b>
                        {currency} {formatPrice(p.price)}
                      </b>
                      {p.was && <s>{formatPrice(p.was)}</s>}
                      {pct > 0 && <em>{pct}%</em>}
                    </span>
                  </span>
                </Pressable>
              );
            })}
          </div>
        ))}
      </div>
    </BzModuleWrapper>
  );
}
