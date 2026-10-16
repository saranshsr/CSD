import { motion, useScroll, useTransform } from 'motion/react';
import { useRef, useState } from 'react';
import { HtmlText, Icon } from '../../../components';
import { useNav } from '../../../kit/Navigator';
import { SubscribeButton } from '../components/offers/SubscribeButton';
import { ChevronLeft } from '../components/offers/Primitives';
import { yangoBundle } from '../data.offers';
import { completeSubscription, noononeStore } from '../store';
import { offersTokens as T } from '../tokens';
import styles from './BundleScreen.module.css';

/**
 * VIPBundleV2Screen (VIPUtil.showBundleScreen / landing `/activate` / deep link /noon-one-bundle?code=yango) — full-screen
 * modal themed by the server `style` (Yango Play: near-black). Gradient 40px title, "One plan, double the perks" benefit
 * grid with gradient + highlight text, "New plan" card with trial pill, sticky white CTA on a #222 bar. The status-bar scrim
 * fades in over 20px of scroll. Success → dismissModal + landing success animation.
 */
export function BundleScreen() {
  const nav = useNav();
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({ container: scrollRef });
  const statusOpacity = useTransform(scrollY, [0, T.headerFade], [0, 1], { clamp: true });
  const { plan, headerTitle, benefitsTitle, benefits, planTitle, pillText } = yangoBundle;

  // handleButtonPress: no refund / renewal note for a new subscriber → handlePayment (quick payment with saved card)
  const subscribe = () => {
    noononeStore.patch({ selectedPlan: plan });
    setLoading(true);
    setTimeout(() => completeSubscription(nav, plan), T.apiMs);
  };

  return (
    <div className={styles.container}>
      <motion.div className={styles.statusBar} style={{ opacity: statusOpacity }} />
      <button type="button" className={`nk-pressable ${styles.backButton}`} onClick={nav.back} aria-label="Close">
        <span className={styles.backIcon}>
          <ChevronLeft width={11} height={22} color="var(--nk-palette-white)" />
        </span>
      </button>
      <div ref={scrollRef} className={`nk-scroll ${styles.list}`}>
        <div className={styles.listContent}>
          <div className={styles.headerContainer}>
            <span className={styles.headerLogo}>
              <span className={styles.logoMark}>Yango</span>
              <span className={styles.logoPlay}>Play</span>
            </span>
            <span className={styles.headerTitle}>{headerTitle}</span>
          </div>

          <div className={styles.benefitsSection}>
            <div className={styles.benefitsTitleRow}>
              <span className={`${styles.titleLine} ${styles.titleLineFlipped}`} />
              <HtmlText value={benefitsTitle} className={styles.benefitsTitle} />
              <span className={styles.titleLine} />
            </div>
            <div className={styles.benefits}>
              {benefits.map((b, i) => (
                <div key={i} className={styles.benefit}>
                  <span className={styles.benefitIconBox}>
                    <Icon name={b.icon} size={22} color="var(--nk-palette-white)" />
                  </span>
                  <HtmlText value={b.text} className={styles.benefitText} />
                </div>
              ))}
            </div>
          </div>

          <div className={styles.plansCard}>
            <div className={styles.planContainer}>
              <div className={styles.plansHeader}>
                <span className={styles.plansHeaderText}>{planTitle}</span>
                {!!(pillText || plan.trialMessage) && (
                  <span className={styles.trialPill}>
                    <span className={styles.trialPillText}>{pillText || plan.trialMessage}</span>
                  </span>
                )}
              </div>
              <div className={styles.planButton}>
                <div className={styles.planRow}>
                  <div className={styles.planInfo}>
                    <span className={styles.planTitle}>{plan.title}</span>
                    {!!plan.description && <HtmlText value={plan.description} className={styles.planDescription} />}
                  </div>
                  <div className={styles.price}>
                    <HtmlText value={plan.monthlyPrice} className={styles.priceText} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.buttonContainer}>
        <SubscribeButton title={plan.buttonText} className={styles.button} textClassName={styles.buttonText} loading={loading} onPress={subscribe} />
      </div>
    </div>
  );
}
