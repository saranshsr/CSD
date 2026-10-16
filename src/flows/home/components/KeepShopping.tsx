import type { CSSProperties } from 'react';
import { MaskIcon, Pressable, Text } from '../../../components';
import { ref } from '../../../foundations/tokens';
import { useNav } from '../../../kit/Navigator';
import searchIcon from '@assets/home/2025/keep/search.svg';
import { keepCaret, recentItems, type RecentItem } from '../data.modules';
import styles from './KeepShopping.module.css';

/**
 * Keep shopping for (Figma 1337:5804): rail of RecentCards, gutter 12, gap 12. Three kinds share one card:
 * recently searched (114×130 box, search icon, "n Viewed" chip), viewed list (107×122, "2 days ago" tag, purple chip)
 * and saved collections (100×114 tinted box, 13/16 name, "n Products"). The title row comes from `<Module>`.
 */
export function KeepShopping() {
  const nav = useNav();
  return (
    <div className={`nk-hscroll ${styles.rail}`}>
      {recentItems.map((it) => (
        <RecentCard key={it.id} item={it} onPress={() => nav.push('plp/listing', { query: it.query })} />
      ))}
    </div>
  );
}

function RecentCard({ item: it, onPress }: { item: RecentItem; onPress: () => void }) {
  const boxClass = it.kind === 'collection' ? styles.boxCollection : it.kind === 'viewed' ? styles.boxViewed : styles.boxSearch;
  const imgStyle: CSSProperties = { width: it.img.width, height: it.img.height, transform: `translate(calc(-50% + ${it.img.dx}px), calc(-50% + ${it.img.dy}px))` };
  const chipClass = it.kind === 'search' ? styles.chipViewed : it.kind === 'viewed' ? styles.chipProducts : it.chipTinted ? styles.chipCollection : styles.chipPlain;
  const caretColor = it.kind === 'viewed' ? 'var(--nk-color-home-keep-purple)' : ref.color('link');
  return (
    <Pressable className={styles.card} style={{ width: it.kind === 'collection' ? it.box.width : undefined }} onClick={onPress} scale={0.97} aria-label={`${it.label}, ${it.chip}`}>
      <span className={`${styles.box} ${boxClass}`} style={{ width: it.box.width, height: it.box.height }}>
        <img loading="lazy" decoding="async" className={styles.img} src={it.image} alt="" style={imgStyle} draggable={false} />
        {it.tag && <span className={`${styles.tag} ${it.kind === 'collection' ? styles.tagSoft : ''}`}>{it.tag}</span>}
      </span>
      <span className={`${styles.text} ${it.kind === 'collection' ? '' : styles.textInset}`}>
        <span className={styles.nameRow}>
          {it.kind === 'search' && <img loading="lazy" decoding="async" src={searchIcon} alt="" width={14} height={14} />}
          <Text variant="text13SemiboldLh16" color="var(--nk-palette-dark-navy-alpha92)" className={styles.name} style={it.kind === 'collection' ? undefined : { font: 'var(--nk-type-home-text14-medium-lh16)' }} lines={1}>
            {it.label}
          </Text>
        </span>
        <span className={`${styles.chip} ${chipClass}`}>
          {it.chip}
          <MaskIcon src={keepCaret} size={12} color={caretColor} className={styles.caret} />
        </span>
      </span>
    </Pressable>
  );
}
