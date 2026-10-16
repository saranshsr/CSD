import { Pressable } from '../../../components';
import { useNav } from '../../../kit/Navigator';
import { footerCopy } from '../data';
import { AccountIconImg, accountImages, type AccountImage } from '../icons';
import { AccountSection } from './AccountSection';
import styles from '../account.module.css';

const socials: { id: string; icon: AccountImage }[] = [
  { id: 'facebook', icon: 'facebook' },
  { id: 'twitter', icon: 'twitter' },
  { id: 'linkedin', icon: 'linkedin' },
  { id: 'instagram', icon: 'instagram' },
];

/** NoonAccountFooter: Policies · Sell on noon, 4 social buttons (icons tinted slateGray), version + copyright. */
export function AccountFooter() {
  const nav = useNav();
  return (
    <AccountSection>
      <div className={styles.footerLinks}>
        <Pressable className={styles.footerLink} onClick={() => nav.sheet('account/policies')}>
          {footerCopy.policies}
        </Pressable>
        <Pressable className={styles.footerLink} onClick={() => nav.toast('Opens sell.noon.com')}>
          {footerCopy.sellOnNoon}&nbsp;
          <AccountIconImg name="sellOnNoon" />
        </Pressable>
      </div>
      <div className={styles.footerBottom}>
        <div className={styles.socials}>
          {socials.map((s) => {
            const img = accountImages[s.icon];
            return (
              <Pressable key={s.id} className={styles.social} aria-label={s.id} onClick={() => nav.toast(`Opens noon on ${s.id}`)}>
                <span className={styles.socialIcon} style={{ width: img.w, height: img.h, WebkitMaskImage: `url(${img.src})`, maskImage: `url(${img.src})` }} />
              </Pressable>
            );
          })}
        </div>
        <span className={styles.version}>{footerCopy.version}</span>
        <span className={styles.legal}>{footerCopy.copyright}</span>
      </div>
    </AccountSection>
  );
}
