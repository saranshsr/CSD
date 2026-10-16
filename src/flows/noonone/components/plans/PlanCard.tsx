import { motion } from 'motion/react';
import { maskSrc } from '../maskSrc';
import radioOn from '@assets/vip/radio-green-selected.svg';
import radioOff from '@assets/vip/radio-green-unselected.svg';
import check from '@assets/vip/check.webp';
import { HtmlText, MaskIcon } from '../../../../components';
import type { V3Bundle, V3Plan } from '../../data.plans';
import { ChevronLeftRounded, DashedBorder } from './parts';
import s from './PlanCard.module.css';

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(' ');

/** VIPQuickPlanSelectV3Screen Plan: savings tag shimmer (white 10×40 bar, 23°, left −20% → 120%, 1200ms after 1500ms, repeat) */
function SavingsTag({ text, shimmer }: { text: string; shimmer?: boolean }) {
  return (
    <span className={s.savings}>
      <span className={s.savingsText}>{text}</span>
      {shimmer && (
        <motion.span
          style={{ position: 'absolute', top: -10, width: 10, height: 40, opacity: 0.75, background: 'var(--nk-palette-white)', rotate: 23 }}
          initial={{ left: '-20%' }}
          animate={{ left: '120%' }}
          transition={{ duration: 1.2, delay: 1.5, repeat: Infinity, repeatDelay: 1.5, ease: 'linear' }}
        />
      )}
    </span>
  );
}

function Badge({ html, selected }: { html: string; selected: boolean }) {
  return (
    <div className={cx(s.trial, selected ? s.trialSelected : s.trialUnselected)}>
      <HtmlText value={html} className={selected ? s.trialTextSelected : s.trialText} />
    </div>
  );
}

function Benefits({ items, bundle }: { items: { title: string }[]; bundle?: boolean }) {
  return (
    <div className={cx(s.benefits, bundle && s.benefitsBundle)}>
      {!bundle && <DashedBorder className={s.dashedTop} strokeWidth={2} strokeSpacing={5} strokeHeight={1} color="var(--nk-palette-black-alpha10)" />}
      {items.map((b, i) => (
        <div key={i} className={s.benefit}>
          <MaskIcon src={maskSrc(check)} size={16} color="var(--nk-color-text-body)" className={bundle ? undefined : s.benefitIcon} />
          <HtmlText value={b.title} className={s.benefitText} />
        </div>
      ))}
    </div>
  );
}

/**
 * VIPQuickPlanSelectV3Screen/Plan/Plan.tsx — non-animated pricing branch (`animatePrice` is a server flag; the demo
 * plans don't set it, see mapping). Selected: #329537 border, green trial gradient; tap selects (disabled when selected).
 */
export function PlanCard({ plan, selected, onSelect }: { plan: V3Plan; selected: boolean; onSelect: (p: V3Plan) => void }) {
  const badge = plan.badge;
  return (
    <button
      type="button"
      className={cx('nk-pressable', s.planContainer, badge && (selected ? s.withBadgeSelected : s.withBadgeUnselected), selected && s.planContainerSelected)}
      disabled={selected}
      onClick={() => onSelect(plan)}
      style={{ cursor: selected ? 'default' : 'pointer' }}
    >
      <div className={cx(s.inner, badge && (selected ? s.innerBadgeSelected : s.innerBadgeUnselected))}>
        {badge && <Badge html={badge} selected={selected} />}
        <div className={cx(s.planButton, badge && s.planButtonBadge)}>
          <div className={s.titleRow}>
            <span className={s.planTitle}>{plan.title}</span>
            <span className={s.radio}>
              <img src={selected ? radioOn : radioOff} alt="" />
            </span>
          </div>
          <div className={s.priceSection}>
            {plan.monthlyPrice && <div className={s.monthlyPrice}>{plan.monthlyPrice.replace(/<br>/g, '').replace(/<\/?b>/g, '')}</div>}
            {plan.descriptionHtml && (
              <div className={s.priceContainer}>
                <HtmlText value={plan.descriptionHtml} className={s.description} />
                {plan.savingPct && <SavingsTag text={plan.savingPct} />}
              </div>
            )}
          </div>
          {plan.benefitsV2.length > 0 && <Benefits items={plan.benefitsV2} />}
        </div>
      </div>
    </button>
  );
}

/**
 * VIPQuickPlanSelectV3Screen/Plan/BundlePlan.tsx — bundle card (title + radio, 32/600 price, description with the
 * struck-through original price + savings tag, benefits minus the partner one) and "Choose 1 of N:" partner tiles
 * (last benefit + bundleTag pill). Shown in its settled state (animatedValue 4): the intro price/strike-through
 * sequence only runs on master's first render of a server bundle with `animationConfig`.
 */
export function BundlePlanCard({ bundle, selectedPlanCode, onSelect, onBundleTag }: { bundle: V3Bundle; selectedPlanCode: string; onSelect: (p: V3Plan) => void; onBundleTag?: (p: V3Plan) => void }) {
  const current = bundle.plans.find((p) => p.planCode === selectedPlanCode) ?? bundle.plans[0];
  const selected = current.planCode === selectedPlanCode;
  const badge = current.badge;
  const [, rest] = (current.monthlyPrice || '').split(/(?<=\d)(?=\/)/);
  return (
    <div
      role="button"
      tabIndex={0}
      className={cx('nk-pressable', s.planContainer, badge && (selected ? s.withBadgeSelected : s.withBadgeUnselected), selected && s.planContainerSelected)}
      onClick={() => !selected && onSelect(current)}
    >
      <div className={cx(s.inner, badge && (selected ? s.innerBadgeSelected : s.innerBadgeUnselected))}>
        {badge && <Badge html={badge} selected={selected} />}
        <div className={cx(s.planButton, badge && s.planButtonBadge)}>
          <div className={s.titleRow}>
            <span className={s.planTitle}>{bundle.title}</span>
            <span className={s.radio}>
              <img src={selected ? radioOn : radioOff} alt="" />
            </span>
          </div>
          <div className={s.priceSection} style={{ marginBottom: -7 }}>
            <div className={s.bundleRow} style={{ transform: 'translateY(-7.5px) scale(0.5)', transformOrigin: 'left center', height: 32 }}>
              <span className={s.bundlePrice}>
                {current.monthlyPrice.split('/')[0]}
                {rest ?? ''}
              </span>
            </div>
            {current.descriptionHtml && (
              <div className={s.priceContainer} style={{ transform: 'translateY(-11px)' }}>
                <HtmlText value={current.descriptionHtml} className={s.description} />
                {current.savingPct && <SavingsTag text={current.savingPct} />}
              </div>
            )}
          </div>
          <Benefits items={current.benefitsV2.slice(0, -1)} bundle />
          <div className={s.bundlePlans}>
            <div className={s.bundleHeader}>{`Choose 1 of ${bundle.plans.length}:`}</div>
            <div className={s.bundlePlansRow}>
              {bundle.plans.map((p) => {
                const on = p.planCode === selectedPlanCode;
                const benefit = p.benefitsV2[p.benefitsV2.length - 1];
                return (
                  <button
                    key={p.planCode}
                    type="button"
                    className={cx('nk-pressable', s.bundleTile, on && s.bundleTileSelected, p.bundleTagHtml && s.lessPadding)}
                    disabled={on}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(p);
                    }}
                  >
                    <div className={s.bundleTitleRow}>
                      <span className={s.bundleTitle}>{p.title}</span>
                    </div>
                    {benefit && <HtmlText value={benefit.title} className={s.bundleBenefit} />}
                    {p.bundleTagHtml && (
                      <span
                        className={s.bundleTag}
                        onClick={(e) => {
                          e.stopPropagation();
                          onBundleTag?.(p);
                        }}
                      >
                        <HtmlText value={p.bundleTagHtml} />
                        <ChevronLeftRounded width={12} height={12} style={{ transform: 'rotate(180deg)', marginTop: 2 }} />
                      </span>
                    )}
                    <span className={s.bundleCheck}>
                      <img src={on ? radioOn : radioOff} alt="" />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
