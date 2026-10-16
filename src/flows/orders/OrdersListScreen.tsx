import { AnimatePresence, motion, useScroll, useTransform } from 'motion/react';
import { useRef, useState } from 'react';
import { MarketplaceWordmark, MaskIcon, NeedHelpButton, OriginIcon, Pressable, Screen } from '../../components';
import { ref } from '../../foundations/tokens';
import { useNav } from '../../kit/Navigator';
import { haptic } from '../../motion/haptics';
import { handoff } from '../../motion/presets';
import { art } from './assets';
import { ActiveOrderCard, HistoryOrderCard } from './components/OrderCards';
import { activeOrders, historyOrders, matchesFilter, orderFilters, type OrderFilter } from './data';
import { pressDip, reveal } from './motion';
import styles from './orders.module.css';

/**
 * My orders (PDS reference one-flows "orderlisting"): back + "Search all orders", filter chips (Filter ▾, Delivered,
 * Cancelled, Returns, supermall, express), "Active" order card, "Order history" cards, chat FAB. The header is pinned
 * (bappzaar O2DOrdersV2Screen headerArea): over the first 16 / 16 / 20 px of scroll its backdrop goes antiFlashWhite →
 * white, its bottom corners 0 → 10 and its shadow 0 → 0.1 (useO2DOrdersListingAnimation). Chips filter the history (and hide Active); tap again to clear.
 */
export function OrdersListScreen() {
  const nav = useNav();
  // useO2DOrdersListingAnimation: HEADER_COLOR / RADIUS / SHADOW_SCROLL_RANGE 16 / 16 / 20, HEADER_CORNER_RADIUS 10
  const scrollRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({ container: scrollRef });
  const whiteOpacity = useTransform(scrollY, [0, 16], [0, 1]);
  const radius = useTransform(scrollY, [0, 16], [0, 10]);
  const shadowOpacity = useTransform(scrollY, [0, 20], [0, 1]);
  const [filter, setFilter] = useState<OrderFilter>(null);
  // content reveals once after the push; filter swaps cross-fade instead
  const [swapped, setSwapped] = useState(false);
  const r = (i: number) => reveal(i, !swapped);
  const active = activeOrders.filter((o) => matchesFilter(o, filter));
  const history = historyOrders.filter((o) => matchesFilter(o, filter));
  const pick = (id: OrderFilter) => {
    haptic('tap');
    setSwapped(true);
    setFilter((f) => (f === id ? null : id));
  };

  return (
    <Screen
      ref={scrollRef}
      background="bgPage"
      safeTop={false}
      contentStyle={{ paddingBottom: 0 }}
      header={
        <div className={styles.listTop}>
          {/* headerBackdrop: white layer + shadow layer fade in over the page grey (headerBackdropStyle) */}
          <motion.span className={styles.headerShadow} style={{ opacity: shadowOpacity, borderBottomLeftRadius: radius, borderBottomRightRadius: radius }} aria-hidden />
          <motion.span className={styles.headerWhite} style={{ opacity: whiteOpacity, borderBottomLeftRadius: radius, borderBottomRightRadius: radius }} aria-hidden />
          <motion.div className={styles.searchRow} {...reveal(0)}>
            <Pressable className={styles.circleBtn} onClick={nav.back} aria-label="Back">
              <OriginIcon name="chevron-left" size={20} />
            </Pressable>
            <Pressable className={styles.searchPill} scale={0.98} onClick={() => nav.toast('Search orders — demo only')}>
              <OriginIcon name="search" size={20} />
              <span>Search all orders</span>
            </Pressable>
          </motion.div>
          <motion.div className={`${styles.filterRow} nk-hscroll`} {...reveal(1)}>
            <Pressable className={styles.chip} data-filter {...pressDip} onClick={() => nav.toast('Filters — demo only')}>
              <OriginIcon name="preferences" size={16} />
              Filter
              <OriginIcon name="caret-down" size={16} />
            </Pressable>
            {orderFilters.map((f) => (
              <Pressable key={f.id} className={styles.chip} data-logo={f.id === 'supermall' || f.id === 'express' || undefined} data-on={filter === f.id || undefined} aria-pressed={filter === f.id} {...pressDip} onClick={() => pick(f.id)}>
                {f.id === 'supermall' ? (
                  <MarketplaceWordmark kind="supermall" height={18} />
                ) : f.id === 'express' ? (
                  <MaskIcon src={art.expressWordmark} width={60} height={18} color={filter === 'express' ? ref.color('primary') : ref.color('textPrimary')} />
                ) : (
                  f.label
                )}
              </Pressable>
            ))}
          </motion.div>
        </div>
      }
      overlay={<NeedHelpButton collapsed aboveTabBar={false} label="Chat with us" onPress={() => nav.toast('Connecting you to support…')} />}
    >

      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div key={filter ?? 'all'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: handoff.fade.io, ease: handoff.easeInOut }}>
          {active.length > 0 && (
            <section className={styles.section}>
              <motion.h2 className={styles.sectionTitle} {...r(2)}>
                Active
              </motion.h2>
              {active.map((o, i) => (
                <motion.div key={o.id} {...r(3 + i)}>
                  <ActiveOrderCard order={o} />
                </motion.div>
              ))}
            </section>
          )}
          <section className={`${styles.section} ${styles.sectionHistory}`} style={active.length ? undefined : { paddingTop: 16 }}>
            <motion.h2 className={styles.sectionTitle} {...r(4)}>
              Order history
            </motion.h2>
            <div className={styles.cards}>
              {history.length === 0 && (
                <div className={styles.empty}>
                  <OriginIcon name="order-box" size={40} color={ref.color('textTertiary')} />
                  <strong>No orders match this filter</strong>
                  <span>Try another filter or clear it to see all your orders</span>
                </div>
              )}
              {history.map((o, i) => (
                <motion.div key={o.id} {...r(5 + Math.min(i, 3))}>
                  <HistoryOrderCard order={o} />
                </motion.div>
              ))}
            </div>
          </section>
        </motion.div>
      </AnimatePresence>
    </Screen>
  );
}
