import { motion } from 'motion/react';
import { useState } from 'react';
import radioOff from '@assets/vip/radio-green-unselected.svg';
import mCheckbox from '@assets/vip/m-checkbox.png';
import { HtmlText } from '../../../components';
import { useNav } from '../../../kit/Navigator';
import { membershipActions, useIsNoonOneMember } from '../../../kit/membership';
import { findPlan, toMembershipPlan } from '../data';
import { planOptionData } from '../data.plans';
import { VIPButton } from '../components/VIPButton';
import { VIPOverlay, useVipOverlay } from '../components/VIPOverlay';
import s from './PlanOptionOverlayScreen.module.css';

type Opt = (typeof planOptionData.plan)[number] & { tag?: { text: string }; savingsAmount?: string };

function Shimmer() {
  return (
    <motion.span
      style={{ position: 'absolute', top: -10, width: 10, height: 40, opacity: 0.75, background: 'var(--nk-palette-white)', rotate: 23 }}
      initial={{ left: '-20%' }}
      animate={{ left: '120%' }}
      transition={{ duration: 1.2, delay: 1.5, repeat: Infinity, repeatDelay: 1.5, ease: 'linear' }}
    />
  );
}

/** PlanOptionCard: title (b16 medium → bold when selected), price • description, savings / legacy tag (shimmer), m-checkbox / radio */
function Card({ plan, selected, onSelect }: { plan: Opt; selected: boolean; onSelect: () => void }) {
  const price = (plan.monthlyPrice || '').replace(/<[^>]*>/g, '').trim();
  const desc = (plan.description || '').replace(/<[^>]*>/g, '').trim();
  return (
    <motion.button type="button" className={`nk-pressable ${s.card} ${selected ? s.cardSelected : ''}`} disabled={selected} whileTap={{ opacity: 0.9 }} onClick={onSelect}>
      <div className={s.cardContent}>
        <div className={s.cardText}>
          <span className={`${s.planTitle} ${selected ? s.planTitleSelected : ''}`}>{plan.title}</span>
          <div className={s.metaRow}>
            {price && !desc.includes(price) && <span className={s.meta}>{price}</span>}
            {price && desc && <span className={s.meta}>•</span>}
            {desc && <HtmlText value={plan.description} className={s.meta} />}
            {plan.savingsAmount && (
              <span className={s.savings}>
                <span className={s.savingsText}>{plan.savingsAmount}</span>
                <Shimmer />
              </span>
            )}
            {plan.tag?.text && !plan.savingsAmount && (
              <span className={s.tagGradient}>
                <span className={s.tagContent}>
                  <HtmlText value={plan.tag.text} className={s.tagText} />
                  <Shimmer />
                </span>
              </span>
            )}
          </div>
        </div>
        <span className={s.selection}>{selected ? <img src={mCheckbox} width={24} height={24} alt="" /> : <img src={radioOff} width={20} height={20} alt="" />}</span>
      </div>
    </motion.button>
  );
}

function Content() {
  const nav = useNav();
  const { close } = useVipOverlay();
  const member = useIsNoonOneMember();
  const d = planOptionData;
  const [code, setCode] = useState(d.plan.find((p) => p.isSelected)?.planCode ?? d.plan[0].planCode);
  const onContinue = () =>
    close(() => {
      // master: onContinue(selectedPlan) → caller (VIPCancelMembershipV2Screen) changes / keeps the plan
      if (member) {
        membershipActions.changePlan(toMembershipPlan(findPlan(code)));
        nav.toast('Your plan has been updated', { tone: 'success' });
      }
    });
  return (
    <div className={s.feedback}>
      <div className={s.container}>
        <div className={s.header}>
          <span className={s.title}>{d.title}</span>
          <HtmlText value={d.subTitle} className={s.subTitle} />
        </div>
        <div className={s.plans}>
          {(d.plan as Opt[]).map((p) => (
            <Card key={p.planCode} plan={p} selected={p.planCode === code} onSelect={() => setCode(p.planCode)} />
          ))}
        </div>
        <div className={s.buttons}>
          {d.buttons.map((b) => (
            <VIPButton key={b.cta} className={`${s.button} ${d.buttons.length === 1 ? s.buttonFull : ''} ${s.buttonPrimary}`} textClassName={s.buttonText} title={b.text} onPress={onContinue} />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * features/vip/screens/VIPPlanOptionOverlayScreen (VIPUtil.showPlanOptionOverlay). On master its only caller is
 * VIPCancelMembershipV2Screen (cancellation "switch plan instead" step) — management side; ported for completeness.
 * Sheet: transparent VIPOverlayBottomSheet, card inset 6, r18, #F9F9FB.
 */
export function PlanOptionOverlayScreen() {
  return (
    <VIPOverlay sheetClassName={s.sheet}>
      <Content />
    </VIPOverlay>
  );
}
