import { motion } from 'motion/react';
import { Pressable, Text } from '../../components';
import { useNav } from '../../kit/Navigator';
import { sortOptions } from './data';
import { plpStore, usePlpStore } from './store';

/** Sort sheet (FilterSortSection): radio list; picking an option commits, closes and the grid reorders with layout animation. */
export function SortSheet() {
  const nav = useNav();
  const { sort } = usePlpStore();
  return (
    <div style={{ padding: '4px 0 12px' }}>
      <Text variant="titleSmall" color="textMuted" style={{ display: 'block', padding: '4px 16px 8px' }}>
        Sort by
      </Text>
      {sortOptions.map((o) => {
        const on = o.id === sort;
        return (
          <Pressable
            key={o.id}
            scale={0.98}
            onClick={() => {
              plpStore.set({ sort: o.id });
              setTimeout(nav.back, 180);
            }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '14px 16px', font: `${on ? 600 : 500} 15px/20px var(--nk-font-family)`, color: on ? 'var(--nk-color-brand-blue)' : 'var(--nk-color-text-body)' }}
          >
            {o.label}
            <span style={{ width: 20, height: 20, borderRadius: 10, border: `2px solid ${on ? 'var(--nk-color-brand-blue)' : 'var(--nk-color-border-strong)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {on && <motion.span layoutId="sort-radio" style={{ width: 10, height: 10, borderRadius: 5, background: 'var(--nk-color-brand-blue)' }} />}
            </span>
          </Pressable>
        );
      })}
    </div>
  );
}
