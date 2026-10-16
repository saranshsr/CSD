import { Button, Pressable, Text } from '../../../components';
import { useNav } from '../../../kit/Navigator';
import { launches, type LaunchItem } from '../data.modules';
import styles from './LaunchModule.module.css';

/**
 * NEW LAUNCHES (Figma 1337:6582): dark inset card (r20, 351×420 at 375, margin 12) with the two-tone title
 * ("NEW" white, "LAUNCHES" lime), the sub line, and a rail of LaunchCards (213×327, gap 14) clipped inside the card.
 */
export function LaunchModule() {
  const nav = useNav();
  return (
    <section className={styles.module} aria-label="New launches">
      <h2 className={styles.title}>
        {launches.title[0]} <span className={styles.accent}>{launches.title[1]}</span>
      </h2>
      <p className={styles.sub}>{launches.sub}</p>
      <div className={`nk-hscroll ${styles.rail}`}>
        {launches.items.map((it) => (
          <LaunchCard key={it.id} item={it} onPress={() => nav.push('plp/listing', { query: it.query })} />
        ))}
      </div>
    </section>
  );
}

function LaunchCard({ item: it, onPress }: { item: LaunchItem; onPress: () => void }) {
  return (
    <div className={styles.card}>
      <Pressable className={styles.cardBody} onClick={onPress} scale={0.98} aria-label={it.title}>
        <img loading="lazy" decoding="async" className={styles.image} src={it.image} alt="" width={187} height={187} draggable={false} />
        <span className={styles.copy}>
          <Text variant="text16SemiboldLh20" color="textStrong" className={styles.cardTitle} lines={1}>
            {it.title}
          </Text>
          <Text variant="body" color="var(--nk-palette-new-black)" lines={2}>
            {it.body}
          </Text>
        </span>
      </Pressable>
      <Button variant="dark" className={styles.cta} onClick={onPress}>
        {it.cta}
      </Button>
    </div>
  );
}
