import type { CSSProperties } from 'react';
import { DashedDivider, Pressable, Text } from '../../../components';
import { ref } from '../../../foundations/tokens';
import { useNav } from '../../../kit/Navigator';
import chevron from '@assets/home/2025/offers/chevron.svg';
import { offerTickets, type OfferTicket } from '../data.modules';
import styles from './OfferTickets.module.css';

/**
 * Offers for you (Figma 1337:5485): a rail of live ticket cards, 132×172, gap 12, gutter 12. Each ticket is a 2.5px
 * gradient stroke (r24) around a 122×162 artwork panel (r20); title, sub copy and CTA are live text, with a dashed
 * divider and two notches at y=136. The title row comes from `<Module>` in HomeScreen.
 */
export function OfferTickets() {
  const nav = useNav();
  return (
    <div className={`nk-hscroll ${styles.rail}`}>
      {offerTickets.map((t) => (
        <Ticket key={t.id} ticket={t} onPress={() => nav.push('plp/listing', { query: t.query })} />
      ))}
    </div>
  );
}

function Ticket({ ticket: t, onPress }: { ticket: OfferTicket; onPress: () => void }) {
  return (
    <Pressable className={styles.ticket} style={{ '--home-ticket-border': t.border } as CSSProperties} onClick={onPress} scale={0.97} aria-label={`${t.title}, ${t.cta}`}>
      <span className={styles.panel}>
        <img loading="lazy" decoding="async" className={styles.art} src={t.art} alt="" draggable={false} />
        <span className={styles.copy}>
          <Text variant="bodyBold" color="textInverse" className={styles.title}>
            {t.title}
          </Text>
          <span className={t.subSize === 'sm' ? styles.subSm : styles.subMd}>
            {t.sub.map((line) => (
              <span key={line} className={styles.subLine}>
                {line}
              </span>
            ))}
          </span>
        </span>
        <span className={styles.divider}>
          <DashedDivider color={ref.palette('whiteAlpha40')} inset={0} />
        </span>
        <span className={styles.cta}>
          {t.cta}
          <img loading="lazy" decoding="async" src={chevron} alt="" width={12} height={12} className="nk-flip-rtl" />
        </span>
      </span>
      <span className={`${styles.notch} ${styles.notchStart}`} />
      <span className={`${styles.notch} ${styles.notchEnd}`} />
    </Pressable>
  );
}
