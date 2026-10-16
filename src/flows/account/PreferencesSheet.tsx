import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { Pressable, Switch } from '../../components';
import { useNav } from '../../kit/Navigator';
import { AccountSection, AccountSectionItem, SheetBody, SheetButtons } from './components/AccountSection';
import { copy } from './data';
import { AccountIconImg } from './icons';
import { setAccountState, useAccountState } from './store';
import styles from './inner.module.css';

const p = copy.preferences;
const confirmSpring = { type: 'spring' as const, mass: 1, damping: 18, stiffness: 190 };

/**
 * NoonAccountPreferences: haptics switch + clear-cache row (2,2 dashed section).
 * Clear cache fades the list out (250ms) and swaps in NoonAccountClearCacheConfirmation:
 * header drops from -100 and buttons rise from +100 on a spring (18/190), fade 300ms.
 */
export function PreferencesSheet() {
  const nav = useNav();
  const { haptics } = useAccountState();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  const onConfirm = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      nav.back();
      nav.toast(p.cleared, { tone: 'success' });
    }, 900);
  };

  return (
    <SheetBody>
      <AnimatePresence mode="wait" initial={false}>
        {!confirming ? (
          <motion.div key="list" className={styles.listContainer} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            <AccountSection dash="2,2" className={styles.mt12}>
              <AccountSectionItem
                before={<AccountIconImg name="haptics" />}
                title={p.hapticsTitle}
                subtitle={p.hapticsDescription}
                titleClass={styles.prefTitle}
                subtitleClass={styles.prefSubtitle}
                after={<Switch value={haptics} label={p.hapticsTitle} onChange={(v) => setAccountState({ haptics: v })} />}
              />
              <AccountSectionItem
                before={<AccountIconImg name="clearCache" />}
                title={p.clearCacheTitle}
                subtitle={p.clearCacheDescription}
                titleClass={styles.prefTitle}
                subtitleClass={styles.prefSubtitle}
                onPress={() => setConfirming(true)}
              />
            </AccountSection>
          </motion.div>
        ) : (
          <motion.div key="confirm" className={styles.cacheContainer} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}>
            <motion.div initial={{ y: -100 }} animate={{ y: 0 }} exit={{ y: -100, transition: { duration: 0.2 } }} transition={confirmSpring}>
              <div className={styles.cacheHeader}>
                <Pressable className={styles.cacheBack} onClick={() => setConfirming(false)} aria-label="Back">
                  {/* points left; getChevronStyle on master tests `!I18n.isRTL` (a function), so it never flips */}
                  <AccountIconImg name="clearCacheChevron" flipRtl />
                </Pressable>
                <span className={styles.cacheTitle}>{p.clearCacheTitle}</span>
              </div>
              <div className={styles.cacheCard}>
                <span className={styles.cacheText}>{p.clearCacheConfirm}</span>
              </div>
            </motion.div>
            <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100, transition: { duration: 0.2 } }} transition={confirmSpring}>
              <SheetButtons
                cancelClass={styles.cacheCancel}
                confirmClass={styles.cacheYes}
                cancelLabel={copy.cancel}
                confirmLabel={p.clearCacheYes}
                onCancel={nav.back}
                onConfirm={onConfirm}
                disabled={loading}
                loading={loading}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </SheetBody>
  );
}
