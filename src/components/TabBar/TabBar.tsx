import { animate, motion, useMotionValue, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { tabBarScroll, TabBarScrollVisibility } from '../../kit/tabBarScroll';
import { duration, easing, spring } from '../../motion/presets';
import { useDemoStore } from '../../kit/DemoStore';
import { fieldMotion } from '../../motion/presets';
import { tabBar as tb } from '../../foundations/tokens';
import { OriginIcon } from '../Icon/OriginIcon';
import type { OriginIconName } from '../Icon/originIcons';
import { Pressable } from '../Pressable/Pressable';
import { MaskIcon } from '../MaskIcon/MaskIcon';
import { GlassFade } from '../Glass/Glass';
import { useNav } from '../../kit/Navigator';
import type { TabId } from '../../kit/types';
import home from '@assets/tabbar/home.webp';
import homeSelected from '@assets/tabbar/home-selected.webp';
import categories from '@assets/tabbar/categories.webp';
import categoriesSelected from '@assets/tabbar/categories-selected.webp';
// Deals: Origin Design System M-Icon/Bottomnav-Icon/deals-bag default / selected (All flows bottom nav 118:35938)
import deals from '@assets/tabbar/deals-bag.svg';
import dealsSelected from '@assets/tabbar/deals-bag-selected.svg';
import account from '@assets/tabbar/account.webp';
import accountSelected from '@assets/tabbar/account-selected.webp';
import cart from '@assets/tabbar/cart.webp';
import cartSelected from '@assets/tabbar/cart-selected.webp';
import styles from './TabBar.module.css';

/**
 * Bottom tabs, as NoonApp.getTabScreens on bappzaar master: Home · Categories · dynamic tab · Account · Cart.
 * The dynamic tab is CMS-driven (whoami tabConfig.dynamicTab → title / icon / linkUrl); live config (Oct 2026):
 * "Deals" → /noon-deals-ae.
 * Look = the app's native bar (NoonApp.getTab + getTabOptions → react-native-navigation UITabBar), 1:1: opaque white
 * with the 0.08 / 4 shadow, no indicator; each tab the tabbar webp at its native size (static 32pt, dynamic deals tab
 * 25pt; bappzaar's own @3x files) with iconInsets top 3, and the label in primaryFont semibold 14 — charcoalGreyColor
 * #404553, selected sapphire #1155CB. Selecting a tab swaps the icon and colour instantly, as UIKit does. The cart count
 * is BottomTabsCartIndicator → the native badge (accentColor #3866DF capsule, 18 high, 13pt white system text).
 */
const tabs: { id: TabId; label: string; icon: string; selected: string; size: number }[] = [
  { id: 'home', label: 'Home', icon: home, selected: homeSelected, size: 32 },
  { id: 'categories', label: 'Categories', icon: categories, selected: categoriesSelected, size: 32 },
  // 24-grid Origin glyph at 28 → the same ~24pt glyph as the 32pt webp tabs
  { id: 'deals', label: 'Deals', icon: deals, selected: dealsSelected, size: 28 },
  { id: 'account', label: 'Account', icon: account, selected: accountSelected, size: 32 },
  { id: 'cart', label: 'Cart', icon: cart, selected: cartSelected, size: 32 },
];

/** Field M-Bottomnav icons: outline `bottomnav-*`, the `-filled` sibling when active (OriginIcon `filled`). */
const fieldIcons: Record<TabId, OriginIconName> = {
  home: 'bottomnav-home',
  categories: 'bottomnav-categories',
  deals: 'bottomnav-deals-bag',
  account: 'bottomnav-profile',
  cart: 'bottomnav-cart',
};

/** The tab the glass bar was tapped from: the next tab root's bar slides its lens over from there. */
let switchingFrom: TabId | undefined;

export interface TabBarProps {
  active: TabId;
  /**
   * Look. Default (unset): **Liquid Glass**, the floating glass platter of bappzaar `noon/ios/liquid-upgrade` (iOS 26).
   * `'classic'`: the opaque pre-iOS-26 bar (bappzaar master, `UIDesignRequiresCompatibility` true). `'field'`: Field
   * Design System M-Bottomnav. Per flow: `defineFlow({ tabBar: { …, variant } })`.
   */
  variant?: 'classic' | 'field';
  /**
   * Glass only: hide on scroll (bappzaar ScrollVisibilityProvider) — follows the vertical scroll of the screen it sits
   * in (`<Screen>` content) and slides the platter off. The navigator turns it on for tab roots
   * (`tabBar.scrollHide`, default true); screens that drive the bar themselves (PLP, PDP) leave it off.
   */
  autoHide?: boolean;
  /** autoHide: the screen is covered (not on top) → release and restore the bar without animation */
  covered?: boolean;
}

export function TabBar({ active, variant, autoHide, covered }: TabBarProps) {
  if (variant === 'field') return <FieldTabBar active={active} />;
  if (variant === 'classic') return <NativeTabBar active={active} />;
  return <GlassTabBar active={active} autoHide={autoHide} covered={covered} />;
}

/**
 * Liquid Glass bottom nav — bappzaar `noon/ios/liquid-upgrade`: the same react-native-navigation UITabBar, which iOS 26
 * renders as a floating glass platter. Icons only (no labels; the tab name is the aria-label), no iconInsets; same tab
 * images and native badge. Web approximation of the system material: backdrop blur + saturate
 * over a translucent tint, a specular rim and sheen, the selected item in a lens capsule. Switching tabs slides the lens
 * from the old tab to the new one with a droplet stretch while the icon tints cross-fade; it swells under the finger. Content scrolls behind it (screens reserve layout.tabBar + inset, which the platter + its
 * bottom gap fill). Hide on scroll: `--nk-tab-hide` 0 → 1 (set by an ancestor, or by `autoHide`).
 */
function GlassTabBar({ active, autoHide, covered }: { active: TabId; autoHide?: boolean; covered?: boolean }) {
  const nav = useNav();
  const { cartBadge: cartCount } = useDemoStore();
  const reduced = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const hide = useMotionValue(0);
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;
  const ctl = useRef<TabBarScrollVisibility | null>(null);

  useEffect(() => {
    if (!autoHide) return;
    const host = ref.current?.parentElement;
    if (!host) return;
    const to = (v: number) => animate(hide, v, { duration: reducedRef.current ? 0 : duration.fast, ease: tabBarScroll.ease });
    const c = (ctl.current = new TabBarScrollVisibility(tabBarScroll, () => to(1), () => to(0)));
    // scroll doesn't bubble: listen in the capture phase and follow only the screen's own scroller (not rails)
    const onScroll = (e: Event) => {
      const el = e.target as HTMLElement;
      if (!el?.hasAttribute?.('data-screen-scroll')) return;
      c.onScroll({ y: el.scrollTop, contentHeight: el.scrollHeight, layoutHeight: el.clientHeight });
    };
    host.addEventListener('scroll', onScroll, { capture: true, passive: true });
    // publish the state on the screen, so docked footers follow the bar (NoonNativeStickyBar followEnabled)
    const off = hide.on('change', (v) => host.style.setProperty('--nk-tab-hide', String(v)));
    return () => {
      host.removeEventListener('scroll', onScroll, { capture: true });
      off();
      host.style.removeProperty('--nk-tab-hide');
    };
  }, [autoHide, hide]);

  useEffect(() => {
    if (!covered || !ctl.current) return;
    ctl.current.release();
    hide.jump(0);
  }, [covered, hide]);

  // tab switch: every tab root draws its own bar, so the new bar starts the lens on the tab that was tapped from
  const [from] = useState(() => {
    const prev = switchingFrom;
    switchingFrom = undefined;
    return prev && prev !== active && !reduced ? prev : active;
  });
  const [pressed, setPressed] = useState(false);
  const idx = tabs.findIndex((t) => t.id === active);
  const fromIdx = tabs.findIndex((t) => t.id === from);
  const travel = Math.abs(idx - fromIdx);
  const stretch = Math.min(travel * tb.glassLensStretch, tb.glassLensStretchMax);
  const slide = reduced ? { duration: 0 } : { type: 'spring' as const, stiffness: tb.glassLensStiffness, damping: tb.glassLensDamping };
  const tint = { duration: reduced ? 0 : tb.glassTintFade, ease: easing.out };
  const release = () => setPressed(false);
  return (
    <motion.nav ref={ref} className={styles.glassDock} data-variant="glass">
      <GlassFade className={styles.glassFade} />
      <div className={styles.glass}>
        <span className={styles.glassTrack} aria-hidden>
          <motion.span
            className={styles.glassLensSlot}
            style={{ width: `${100 / tabs.length}%` }}
            initial={{ x: `${fromIdx * 100}%` }}
            animate={{ x: `${idx * 100}%`, scale: pressed ? tb.glassPressScale : 1 }}
            transition={{ x: slide, scale: reduced ? { duration: 0 } : spring.bouncy }}
          >
            <motion.span
              className={styles.glassLens}
              initial={{ scaleX: 1, scaleY: 1 }}
              animate={travel ? { scaleX: [1, 1 + stretch, 1], scaleY: [1, 1 - tb.glassLensSquash, 1] } : undefined}
              transition={{ duration: tb.glassLensMorph, times: [0, 0.35, 1], ease: easing.out }}
            />
          </motion.span>
        </span>
        {tabs.map((t) => {
          const on = t.id === active;
          const size = Math.round(t.size * tb.glassIconScale);
          return (
            <Pressable
              key={t.id}
              className={styles.glassTab}
              data-active={on || undefined}
              scale={1}
              onClick={() => {
                if (!on) switchingFrom = active;
                nav.switchTab(t.id);
              }}
              onPointerDown={on ? () => setPressed(true) : undefined}
              onPointerUp={on ? release : undefined}
              onPointerLeave={on ? release : undefined}
              onPointerCancel={on ? release : undefined}
              aria-label={t.label}
              aria-current={on ? 'page' : undefined}
            >
              <motion.span className={styles.glassItem} whileTap={reduced ? undefined : { scale: tb.glassPressScale }} transition={spring.bouncy}>
                <span className={styles.glassIcon}>
                  {/* outline and filled cross-fade: the outline fades out as the filled icon fades in (the selected webps
                      are not drawn to cover the outline, so leaving it at full opacity shows it behind the filled one) */}
                  {/* both states in one colour (`tabBar.glassIcon`, #1D2539): the tab webps as masks, outline ↔ filled */}
                  <motion.span className={styles.glassIconLayer} initial={{ opacity: t.id === from ? 0 : 1 }} animate={{ opacity: on ? 0 : 1 }} transition={tint}>
                    <MaskIcon src={t.icon} size={size} color={tb.glassIcon} />
                  </motion.span>
                  <motion.span className={styles.glassIconSelected} initial={{ opacity: t.id === from ? 1 : 0 }} animate={{ opacity: on ? 1 : 0 }} transition={tint}>
                    <MaskIcon src={t.selected} size={size} color={tb.glassIcon} />
                  </motion.span>
                  {t.id === 'cart' && cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
                </span>
              </motion.span>
            </Pressable>
          );
        })}
      </div>
    </motion.nav>
  );
}

function NativeTabBar({ active }: { active: TabId }) {
  const nav = useNav();
  const { cartBadge: cartCount } = useDemoStore();
  return (
    <nav className={styles.bar}>
      {tabs.map((t) => {
        const on = t.id === active;
        return (
          <button key={t.id} type="button" className={styles.tab} data-active={on || undefined} onClick={() => nav.switchTab(t.id)} aria-label={t.label} aria-current={on ? 'page' : undefined}>
            <span className={styles.iconWrap}>
              <img src={on ? t.selected : t.icon} alt="" width={t.size} height={t.size} draggable={false} className={styles.icon} />
              {t.id === 'cart' && cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
            </span>
            <span className={styles.label}>{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

/**
 * Field DS M-Bottomnav (BottomNav.tsx): side padding 16, tabs flex 1; per tab a 4×43 r2 `text-n-icon/action`
 * indicator at the top, gap 8, 28px `bottomnav-*` icon (filled when active), gap 6, B11 label — Bold + action when
 * active, Medium + tertiary when not. Pressed opacity 0.7. Selection: 260ms standard ease — indicator fades + scaleX
 * 0.4 → 1, icon pops 1 → 1.08 → 1; label colour 200ms. Reduced motion snaps. Same tabs, `nav.switchTab` and cart badge
 * as the default bar; the iOS home bar is the `--nk-inset-bottom` padding.
 */
function FieldTabBar({ active }: { active: TabId }) {
  const nav = useNav();
  const { cartBadge: cartCount } = useDemoStore();
  const reduced = useReducedMotion();
  const select = reduced ? { duration: 0 } : { duration: fieldMotion.duration.lg, ease: fieldMotion.ease.standard };
  const colour = `color ${reduced ? 0 : fieldMotion.duration.base}s cubic-bezier(${fieldMotion.ease.standard.join(',')})`;
  return (
    <nav className={`${styles.bar} ${styles.fieldBar}`} data-variant="field">
      {tabs.map((t) => {
        const on = t.id === active;
        return (
          <Pressable
            key={t.id}
            className={styles.fieldTab}
            data-active={on || undefined}
            scale={1}
            whileTap={{ opacity: 0.7 }}
            onClick={() => nav.switchTab(t.id)}
            aria-label={t.label}
            aria-current={on ? 'page' : undefined}
          >
            <motion.span
              className={styles.fieldIndicator}
              initial={false}
              animate={{ opacity: on ? 1 : 0, scaleX: on ? 1 : 0.4 }}
              transition={select}
              aria-hidden
            />
            <span className={styles.fieldItem}>
              <motion.span className={styles.fieldIcon} initial={false} animate={{ scale: on ? [1, 1.08, 1] : 1 }} transition={{ ...select, times: on ? [0, 0.6, 1] : undefined }}>
                <OriginIcon name={fieldIcons[t.id]} filled={on} size={28} color={on ? 'var(--nk-field-text-action)' : 'var(--nk-field-text-tertiary)'} />
                {t.id === 'cart' && cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
              </motion.span>
              <span className={styles.fieldLabel} style={{ transition: colour }}>
                {t.label}
              </span>
            </span>
          </Pressable>
        );
      })}
    </nav>
  );
}
