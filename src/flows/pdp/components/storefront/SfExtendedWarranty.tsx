import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { OriginIcon, Pressable, type OriginIconName } from '../../../../components';
import { useNav } from '../../../../kit/Navigator';
import { tween } from '../../../../motion/presets';
import accidentalCreative from '@assets/pdp/storefront/c/warranty-accidental.svg';
import extendedCreative from '@assets/pdp/storefront/c/warranty-accidental-extended.svg';
import partnerLogo from '@assets/pdp/storefront/c/protect4less-logo.webp';
import { money, type PdpContent } from '../../data';
import { pdpSfcTokens } from '../../tokens.sfC';
import { Card } from '../Sections';
import styles from './SfExtendedWarranty.module.css';
import { useReduceMotion } from '../../../../motion/reducedMotion';

export const sfWarrantyCopy = {
  title: 'Extended warranty', // Figma 3499:75493
  by: 'by', // I3499:75494;1222:216670
  usps: ['Chosen by 100+ people', 'Authorised repair centers', 'Genuine parts guaranteed'], // USPs animation_final
  select: 'Select', // I3499:75515;1473:261409
  selected: 'Selected', // kit state (not in the Figma)
  added: (name: string) => `${name} added`,
  removed: (name: string) => `${name} removed`,
};

/** `lines`: the name as Figma breaks it — line 1 full width, line 2 hugging the 16px chevron */
type Plan = { id: string; validity: string; name: string; lines: [string, string]; creative: string; usps: { icon: OriginIconName; text: string }[]; price: number };

/** Demo plans (Figma 3499:75496 / 75516). Price = share of the product price (floor 49), else the design's 449. */
export function warrantyPlans(price?: number): Plan[] {
  const [a, b] = pdpSfcTokens.warrantyShare;
  const at = (share: number) => (price ? Math.max(pdpSfcTokens.warrantyMin, Math.round(price * share)) : pdpSfcTokens.warrantyFallback);
  return [
    {
      id: 'adp',
      validity: '1 YEAR',
      name: 'Accidental Damage Protection',
      lines: ['Accidental Damage', 'Protection'],
      creative: accidentalCreative,
      usps: [
        { icon: 'calendar-check', text: 'Active from date of purchase' },
        { icon: 'water-drop', text: 'Covers liquid damages' },
        { icon: 'truck-noon', text: 'Free pickup & delivery' },
      ],
      price: at(a),
    },
    {
      id: 'adp-ew',
      validity: '1 YEAR ACCIDENTAL + 1 YEAR EXTENDED',
      name: 'Accidental Damage & Extended Warranty',
      lines: ['Accidental Damage &', 'Extended Warranty'],
      creative: extendedCreative,
      usps: [
        // New PDP 64:5731: same Date / Delivery icons as plan 1, the accident glyph in the middle
        { icon: 'calendar-check', text: 'Active from date of purchase' },
        { icon: 'warning-triangle', text: 'Covers all accidental damages' },
        { icon: 'truck-noon', text: 'Free pickup & delivery' },
      ],
      price: at(b),
    },
  ];
}

/** "by PROTECT4LESS" → USP lines, rotating (y 8 → 0 / −8, tween fast) — Figma "USPs animation_final". */
function UspTicker() {
  const lines = sfWarrantyCopy.usps.length + 1;
  const [i, setI] = useState(0);
  const reduce = useReduceMotion();
  useEffect(() => {
    // reduced motion: the first line stays (no auto-rotation)
    if (reduce) return;
    const t = setInterval(() => setI((n) => (n + 1) % lines), pdpSfcTokens.tickerMs);
    return () => clearInterval(t);
  }, [lines, reduce]);
  return (
    <span className={styles.ticker} aria-live="off">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span key={i} className={styles.tickerLine} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -8, opacity: 0 }} transition={tween('fast', 'out')}>
          {i === 0 ? (
            <>
              {sfWarrantyCopy.by}
              <img alt="Protect4Less" src={partnerLogo} className={styles.partnerLogo} />
            </>
          ) : (
            sfWarrantyCopy.usps[i - 1]
          )}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/**
 * Storefront "Extended warranty" (Figma 3499:75479 "Details"): white r16 card, p12, gap 12; 15/700 title + rotating
 * partner/USP ticker; a scroll row (gap 12) of 270-wide plan cards — alice-blue r12 frame with a 12/700 sapphire
 * validity line over a white r12 card: 40px creative + name 14/500 + 16px chevron, three 12/16 USP rows (16px icons),
 * then a top-bordered footer with the 16/700 price and a "Select" outline button (r8, padding 8·24).
 * Selecting toggles one plan. No previous component: new section (no SD data yet — plans are derived).
 */
export function SfExtendedWarranty({ content, price }: { content: PdpContent; price?: number }) {
  const nav = useNav();
  const [selected, setSelected] = useState<string>();
  // electronics-style products only: the SD shipping items carry a warranty row
  if (!content.additional.some((a) => a.icon === 'warranty')) return null;
  const plans = warrantyPlans(price);
  const toggle = (p: Plan) => {
    const on = selected !== p.id;
    setSelected(on ? p.id : undefined);
    nav.toast(on ? sfWarrantyCopy.added(p.name) : sfWarrantyCopy.removed(p.name));
  };
  return (
    <Card contentGap={12}>
      <div className={styles.head}>
        <h3 className={styles.title}>{sfWarrantyCopy.title}</h3>
        <UspTicker />
      </div>
      <div className={styles.row}>
        {plans.map((p) => (
          <div key={p.id} className={styles.plan}>
            <span className={styles.validity}>{p.validity}</span>
            <div className={styles.planCard}>
              <button type="button" className={styles.name} onClick={() => nav.toast(p.name)}>
                <img alt="" src={p.creative} className={styles.creative} />
                <span className={styles.nameText} aria-label={p.name}>
                  <span className={styles.nameLine}>{p.lines[0]}</span>
                  <span className={styles.nameLast}>
                    {p.lines[1]}
                    <OriginIcon name="chevron-right" size={16} color="var(--nk-color-text-legacy)" className="pdp-flip" />
                  </span>
                </span>
              </button>
              <div className={styles.usps}>
                {p.usps.map((u) => (
                  <div key={u.text} className={styles.usp}>
                    <OriginIcon name={u.icon} size={18} color="var(--nk-palette-secondary-text-color)" />
                    <span className={styles.uspText}>{u.text}</span>
                  </div>
                ))}
              </div>
              <div className={styles.footer}>
                <span className={styles.price}>{money(p.price)}</span>
                <Pressable className={styles.select} data-selected={selected === p.id || undefined} aria-pressed={selected === p.id} onClick={() => toggle(p)}>
                  {selected === p.id ? sfWarrantyCopy.selected : sfWarrantyCopy.select}
                </Pressable>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
