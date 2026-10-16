import check from '@assets/vip/check.webp';
import { maskSrc } from '../components/maskSrc';
import { HtmlText, MaskIcon } from '../../../components';
import { useNav } from '../../../kit/Navigator';
import { useMembershipEligibility } from '../../../kit/membership';
import { findPlan, withEligibility, type VipPlan } from '../data';
import { familyPlansData, findV3Plan, trialGuideData, withBadge, type V3Plan } from '../data.plans';
import { completeSubscription, noononeStore, useNoonone } from '../store';
import { VIPOverlay } from '../components/VIPOverlay';
import { DashedBorder, PlanMembers, SubscriptionButton } from '../components/plans/parts';
import { QUICK_PAY_MS } from '../components/plans/useQuickPay';
import { user } from '../../../data';
import { useEffect, useRef, useState } from 'react';
import s from './PlanDetailsOverlayScreen.module.css';

type Variant = 'landing' | 'planSelect' | 'family';
type Params = { planCode?: string; variant?: Variant };

const stripHtml = (v: string) => v.replace(/<[^>]*>/g, '');

function Reminder({ r, info }: { r: { iconUrl?: string; title: string; description: string }; info?: boolean }) {
  return (
    <div className={info ? s.infoReminder : s.reminder}>
      <div className={s.reminderHeader}>
        {r.iconUrl && <img className={s.reminderIcon} src={r.iconUrl} alt="" />}
        <span className={info ? s.infoReminderTitle : s.reminderTitle}>{r.title}</span>
      </div>
      <div className={info ? s.infoReminderBody : s.reminderBody}>{r.description}</div>
    </div>
  );
}

/** in-sheet createSubscription (demo) → completeSubscription pops overlay + journey back to the landing */
function usePayInSheet() {
  const nav = useNav();
  const [loading, setLoading] = useState(false);
  const t = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(t.current), []);
  const pay = (plan: VipPlan) => {
    noononeStore.patch({ selectedPlan: plan, trialGuideShown: true });
    setLoading(true);
    t.current = setTimeout(() => completeSubscription(nav, plan), QUICK_PAY_MS);
  };
  return { pay, loading };
}

/**
 * VIPPopupUtil.showPlanDetailDialog → VIPGenericOverlayScreen(VIPPlanDetailsPopup) — the review sheet the landing's
 * sticky "Start free trial" opens once (variant `landing`, REGULAR popup, landing paymentBottomSheet + reviewContainer).
 * `planSelect`: VIPQuickPlanSelectV3Screen's first CTA tap → VIPUtil.showInfoOverlay (VIPInfoOverlayScreen with
 * trialGuideData.planSelect + subscriptionButton(overlayRef, allowPayment = true)).
 * `family`: VIPFamilyPlansScreen → showPlanDetailDialog(type FAMILY_PLAN) → VIPFamilyPlanDetailsPopup.
 */
export function PlanDetailsOverlayScreen({ params }: { params: Params }) {
  const nav = useNav();
  const variant: Variant = params?.variant ?? 'landing';
  const trialEligible = useMembershipEligibility((st) => st.trialEligible);
  const { paymentMethod } = useNoonone();
  const base = (findV3Plan(params?.planCode) as V3Plan | undefined) ?? findPlan(params?.planCode);
  const plan = withEligibility(base, trialEligible) as V3Plan;
  const { pay, loading } = usePayInSheet();
  const hasPay = !!paymentMethod;
  const toPayment = () => {
    noononeStore.patch({ selectedPlan: plan });
    nav.push('noonone/payment', { planCode: plan.planCode });
  };

  if (variant === 'planSelect') {
    const g = trialGuideData.planSelect;
    return (
      <VIPOverlay sheetClassName={s.transparentSheet}>
        <div className={s.info}>
          <div className={s.infoTitle}>{g.title}</div>
          <div className={s.infoBody}>
            <HtmlText value={g.text(plan)} className={s.infoBodyText} />
          </div>
          {g.reminder && <Reminder r={g.reminder} info />}
          <div className={s.infoSubWrap}>
            <div className={s.infoSubBorder} />
            <SubscriptionButton
              title={plan.buttonText}
              showPayment={hasPay}
              paymentMethod={paymentMethod}
              onPress={() => pay(plan)}
              onPayWith={toPayment}
              isLoading={loading}
              className={hasPay ? s.buttonPay : s.button}
              textClassName={s.buttonTextPay}
            />
          </div>
        </div>
      </VIPOverlay>
    );
  }

  if (variant === 'family') {
    const sheet = familyPlansData.familyPlanSheet;
    const fp = familyPlansData.plans.find((p) => p.planCode === params?.planCode) ?? familyPlansData.plans[1];
    const price = stripHtml(fp.monthlyPrice);
    return (
      <VIPOverlay sheetClassName={`${s.paymentSheet} ${s.paymentSheetGrey}`}>
        <div className={s.familyContent}>
          <div className={s.familyHeader}>
            <span className={s.familyTitle}>{sheet.title}</span>
            <HtmlText value={sheet.subTitle.replace('{{price}}', price)} className={s.familySub} />
          </div>
          <div className={s.familyCard}>
            <div className={s.familyCardTitleRow}>
              <span className={s.familyCardTitle}>{fp.title}</span>
              <div className={s.membersBox}>
                <PlanMembers members={[{ name: user.firstName }]} size={32} max={fp.maxNumMembers} overlap={12} emptyBg="var(--nk-color-border)" emptyBorder="var(--nk-palette-white)" />
              </div>
            </div>
            <div className={s.invoice}>
              <DashedBorder strokeWidth={3} strokeSpacing={5} strokeHeight={1} color="var(--nk-color-border)" />
              <div className={s.invoiceInner}>
                {sheet.invoiceDetails(fp).map((it) => (
                  <div key={it.title} className={s.invoiceItem}>
                    <div className={s.invoiceText}>
                      <span className={s.invoiceTitle}>{it.title}</span>
                      <span className={s.invoiceSub}>{it.subtitle}</span>
                    </div>
                    <HtmlText value={it.value} className={s.invoiceValue} />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className={s.familyNote}>
            <HtmlText value={sheet.text} />
          </div>
          <div className={s.familySeparator} />
          <div className={s.familyButtonContainer}>
            <SubscriptionButton
              title={fp.buttonText}
              showPayment={hasPay}
              paymentMethod={paymentMethod}
              onPress={() => pay(fp)}
              onPayWith={() => {
                noononeStore.patch({ selectedPlan: fp });
                nav.push('noonone/payment', { planCode: fp.planCode });
              }}
              isLoading={loading}
              className={hasPay ? s.buttonPay : s.button}
              textClassName={s.buttonText}
            />
          </div>
        </div>
      </VIPOverlay>
    );
  }

  // REGULAR — VIPPlanDetailsPopup (showPlan = !isCobrand → true)
  const g = trialGuideData.landing;
  const v3 = withBadge(plan);
  return (
    <VIPOverlay sheetClassName={s.paymentSheet}>
      <div className={s.review}>
        <div className={s.headerContainer}>
          {g.title && <span className={s.popupTitle}>{stripHtml(g.title)}</span>}
          {g.subTitle && <HtmlText value={g.subTitle} className={s.subTitle} />}
        </div>
        <div className={s.planContent}>
          <div className={s.titleContainer}>
            <span className={s.planTitle}>{`noon One ${v3.title}`}</span>
            {v3.badge && (
              <div className={s.trialWrap}>
                <div className={s.trialTag}>
                  <HtmlText value={v3.badge} className={s.trialText} />
                </div>
              </div>
            )}
          </div>
          <div className={s.priceContainer}>
            <span className={s.monthlyPrice}>{v3.monthlyPrice.replace(/<br>/g, '').replace(/<\/?b>/g, '')}</span>
          </div>
          {v3.benefitsV2?.length > 0 && (
            <div className={s.benefitsContainer}>
              <DashedBorder strokeWidth={2} strokeSpacing={4} strokeHeight={1} color="var(--nk-color-vip-dash15)" />
              <div className={s.benefitsInner}>
                {v3.benefitsV2.map((b) => (
                  <div key={b.title} className={s.benefitItem}>
                    <MaskIcon src={maskSrc(check)} size={12} color="var(--nk-palette-catalog-tag-gradient-end)" className={s.benefitIcon} />
                    <span className={s.benefitText}>{stripHtml(b.title)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <HtmlText value={g.text} className={s.body} />
        {g.reminder && <Reminder r={g.reminder} />}
        <div className={s.separator} />
        <div className={s.buttonContainer}>
          <SubscriptionButton
            title={plan.buttonText}
            showPayment={hasPay}
            paymentMethod={paymentMethod}
            onPress={() => pay(plan)}
            onPayWith={toPayment}
            isLoading={loading}
            className={hasPay ? s.buttonPay : s.button}
            textClassName={hasPay ? `${s.buttonText} ${s.buttonTextPay}` : s.buttonText}
          />
        </div>
      </div>
    </VIPOverlay>
  );
}
