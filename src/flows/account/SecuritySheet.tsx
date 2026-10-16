import { useEffect, useState } from 'react';
import { Skeleton } from '../../components';
import { useNav } from '../../kit/Navigator';
import { AccountSection, AccountSectionItem, SheetBody } from './components/AccountSection';
import { copy } from './data';
import { AccountIconImg, type AccountIcon } from './icons';
import styles from './inner.module.css';

const s = copy.security;

const icon = (name: AccountIcon) => (
  <span className={styles.iconBox24}>
    <AccountIconImg name={name} />
  </span>
);

/** NoonAccountSecuritySettingsLoader: 3 skeleton rows (24 circle, 55% / 75% lines, 14 chevron) in a 2,2 section, margin 12. */
function SecurityLoader({ rows }: { rows: number }) {
  return (
    <div className={styles.listContainer}>
      <AccountSection dash="2,2" style={{ margin: 12 }}>
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className={styles.skelRow}>
            <Skeleton width={24} height={24} radius={12} style={{ marginInlineEnd: 14 }} />
            <span className={styles.skelText}>
              <Skeleton width="55%" height={16} radius={4} />
              <Skeleton width="75%" height={12} radius={4} />
            </span>
            <Skeleton width={14} height={14} radius={4} />
          </div>
        ))}
      </AccountSection>
    </div>
  );
}

/**
 * NoonAccountSecuritySettings (Account security row → NoonAccountUtils.showSecuritySettingsModal).
 * Shows the loader while biometrics status is checked (mocked 700ms), then Edit Password / Manage devices / Account deletion.
 * Biometrics are treated as already set up, so the "Setup FaceID/Fingerprint" row stays hidden (as on a configured device).
 */
export function SecuritySheet() {
  const nav = useNav();
  const [checking, setChecking] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setChecking(false), 700);
    return () => clearTimeout(t);
  }, []);

  const go = (route: string, presentation?: 'modal') => {
    nav.back();
    nav.push(route, {}, presentation ? { presentation } : undefined);
  };

  return (
    <SheetBody>
      {checking ? (
        <SecurityLoader rows={3} />
      ) : (
        <div className={styles.listContainer}>
          <AccountSection dash="2,2" style={{ marginTop: 12, marginLeft: 12, marginRight: 12 }}>
            <AccountSectionItem
              before={icon('editPassword')}
              title={s.editPasswordTitle}
              subtitle={s.editPasswordSubtitle}
              titleClass={styles.securityTitle}
              subtitleClass={styles.securitySubtitle}
              onPress={() => go('account/changePassword')}
            />
            <AccountSectionItem
              before={icon('manageDevices')}
              title={s.manageDevicesTitle}
              subtitle={s.manageDevicesSubtitle}
              titleClass={styles.securityTitle}
              subtitleClass={styles.securitySubtitle}
              onPress={() => go('account/manageDevices')}
            />
            <AccountSectionItem
              before={icon('trashCan')}
              title={s.deletionTitle}
              subtitle={s.deletionSubtitle}
              titleClass={styles.securityTitle}
              subtitleClass={styles.securitySubtitle}
              onPress={() => go('account/deletion', 'modal')}
            />
          </AccountSection>
        </div>
      )}
    </SheetBody>
  );
}
