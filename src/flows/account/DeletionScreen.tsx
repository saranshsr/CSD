import { useEffect, useState } from 'react';
import { Header, IconButton, Pressable, Screen, Spinner } from '../../components';
import { useNav } from '../../kit/Navigator';
import { copy, deactivationConfig } from './data';
import { AccountImageImg } from './icons';
import { setAccountState, useAccountState } from './store';
import styles from './inner.module.css';
import { ref } from '../../foundations/tokens';

const c = copy.deletion;

/**
 * NoonAccountDeletionScreen (modal from Account security): uppercase steel heading, reason picker
 * (ListingOverlayScreen → reasons sheet), server T&C list, agreement checkbox, warning, and the
 * full-width accent PrimaryButton (disabled grey until a reason + agreement).
 */
export function DeletionScreen() {
  const nav = useNav();
  const { deletionReason: reason } = useAccountState();
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => () => setAccountState({ deletionReason: undefined }), []);
  const selected = deactivationConfig.reasons.find((r) => r.reasonCode === reason);

  const onDelete = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      nav.reset('account/signedOut');
      nav.toast('Your account deletion request has been submitted');
    }, 900);
  };

  return (
    <Screen
      background="bgSurface"
      header={<Header back={false} right={<IconButton icon="close" variant="plain" onPress={nav.back} label="Close" />} align="left" />}
      footer={
        <div className={styles.delFooter}>
          <Pressable className={styles.primaryBtn} disabled={!agreed || !selected || loading} onClick={onDelete} scale={0.98}>
            {loading ? <Spinner color={ref.color('textInverse')} track={ref.palette('whiteAlpha35')} /> : c.heading.toUpperCase()}
          </Pressable>
        </div>
      }
    >
      <div className={styles.delScroll}>
        <div className={styles.delHeading}>{c.heading.toUpperCase()}</div>
        <div className={styles.delReason}>
          <div className={styles.delBold}>{c.reasonLabel}</div>
          <Pressable className={styles.delReasonBtn} data-active={!!selected} onClick={() => nav.sheet('account/deletionReason')} scale={0.99}>
            <span>{selected?.name ?? c.reasonPlaceholder}</span>
            <AccountImageImg name="arrowRight" flipRtl />
          </Pressable>
        </div>
        <div className={styles.delTerms}>
          <div className={styles.delBold}>{c.termsTitle}</div>
          <div className={styles.delText}>{deactivationConfig.subtext}</div>
          <div className={styles.delTermsList}>
            {deactivationConfig.terms.map((term, i) => (
              <div key={i} className={styles.delTerm}>
                <span className={styles.delText}>{`${i + 1}.`}</span>
                <span
                  className={styles.delTermBody}
                  dangerouslySetInnerHTML={{ __html: term }}
                  onClick={(e) => {
                    const a = (e.target as HTMLElement).closest('a');
                    if (a) {
                      e.preventDefault();
                      nav.toast(`Opens noon.com${a.getAttribute('href')} in the web view`);
                    }
                  }}
                />
              </div>
            ))}
          </div>
        </div>
        <Pressable className={styles.delAgree} onClick={() => setAgreed((a) => !a)} scale={0.99}>
          <AccountImageImg name={agreed ? 'checkboxOn' : 'checkboxOff'} />
          {c.agree}
        </Pressable>
        <div className={styles.delWarning}>{c.warning}</div>
      </div>
    </Screen>
  );
}
