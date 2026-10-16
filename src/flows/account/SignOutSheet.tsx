import { useNav } from '../../kit/Navigator';
import { AccountIconImg } from './icons';
import { SheetBody, SheetButtons } from './components/AccountSection';
import { copy } from './data';
import { setAccountState } from './store';
import styles from './inner.module.css';

export interface SignOutParams {
  /** current = this device (resets to signed-out), device = one other device, all = all other devices */
  kind?: 'current' | 'device' | 'all';
  deviceId?: string;
  title?: string;
  description?: string;
}

/**
 * NoonAccountSignOutConfirmation inside NoonAccountBottomSheetScreen: white r10 card (margin 12) with the 51px icon,
 * 18/600 title, 14/500 slate500 description, then Cancel (outline gray200) / Yes, sign out (errorRed) — r12, 14px vertical.
 * Reused by Manage devices with a custom title/description.
 */
export function SignOutSheet() {
  const nav = useNav();
  const { kind = 'current', deviceId, title, description } = nav.params as SignOutParams;

  const onConfirm = () => {
    nav.back();
    if (kind === 'current') {
      nav.reset('account/signedOut');
    } else if (kind === 'device') {
      setTimeout(() => {
        setAccountState((s) => ({ devices: s.devices.filter((d) => d.id !== deviceId) }));
        nav.toast(copy.devices.signedOutDevice);
      }, 600);
    } else {
      setTimeout(() => {
        setAccountState((s) => ({ devices: s.devices.filter((d) => d.currentDevice) }));
        nav.toast(copy.devices.signedOutAll);
      }, 600);
    }
  };

  return (
    <SheetBody>
      <div className={styles.signOutCard}>
        <div className={styles.signOutIcon}>
          <AccountIconImg name="signOutConfirm" />
        </div>
        <span className={styles.signOutTitle}>{title ?? copy.signOut.title}</span>
        <span className={styles.signOutDescription}>{description ?? copy.signOut.description}</span>
      </div>
      <SheetButtons
        className={styles.signOutButtons}
        cancelClass={styles.signOutCancel}
        confirmClass={styles.signOutYes}
        cancelLabel={copy.cancel}
        confirmLabel={copy.signOut.confirm}
        onCancel={nav.back}
        onConfirm={onConfirm}
      />
    </SheetBody>
  );
}
