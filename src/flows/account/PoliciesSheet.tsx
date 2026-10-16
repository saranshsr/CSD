import { useNav } from '../../kit/Navigator';
import { AccountSection, AccountSectionItem, SheetBody } from './components/AccountSection';
import { copy } from './data';
import { AccountIconImg, type AccountIcon } from './icons';
import { useAccountState } from './store';
import styles from './inner.module.css';

const p = copy.policies;
const rowStyle = { paddingTop: 16, paddingBottom: 16 };
const iconGap = { marginInlineEnd: 10 };

/** NoonAccountPolicies (footer "Policies"): Legal / Orders & Returns / Support sections. Warranty policy only for SA, AE, EG. */
export function PoliciesSheet() {
  const nav = useNav();
  const { country } = useAccountState();
  const showWarranty = country === 'SA' || country === 'AE' || country === 'EG';

  // master: dismiss, then push noon.WebViewScreen with the policy route (or the help-centre URL)
  const open = (path: string) => {
    nav.back();
    nav.toast(`Opens ${path.startsWith('/') ? `noon.com${path}` : path} in the web view`);
  };

  const row = (icon: AccountIcon, title: string, path: string) => (
    <AccountSectionItem key={path} before={<AccountIconImg name={icon} />} beforeStyle={iconGap} rowStyle={rowStyle} title={title} onPress={() => open(path)} />
  );

  return (
    <SheetBody>
      <div className={styles.policies}>
        <span className={styles.policyLabel} style={{ display: 'block' }}>
          {p.legal}
        </span>
        <AccountSection dash="2,2" className={styles.policySection}>
          {row('termsOfUse', p.termsOfUse, '/terms-of-use')}
          {row('termsOfSale', p.termsOfSale, '/terms-of-sale')}
          {row('privacyPolicy', p.privacyPolicy, '/privacy-policy')}
        </AccountSection>

        <span className={`${styles.policyLabel} ${styles.policyLabelSpaced}`} style={{ display: 'block' }}>
          {p.ordersReturns}
        </span>
        <AccountSection dash="2,2" className={styles.policySection}>
          {showWarranty && row('warrantyPolicy', p.warrantyPolicy, '/warranty-policy')}
          {row('returnPolicy', p.returnPolicy, '/return-policy')}
        </AccountSection>

        <span className={`${styles.policyLabel} ${styles.policyLabelSpaced}`} style={{ display: 'block' }}>
          {p.support}
        </span>
        <AccountSection dash="2,2" className={styles.policySection}>
          {row('customerHappiness', p.customerHappiness, 'help.noon.com/portal/en/home')}
        </AccountSection>
      </div>
    </SheetBody>
  );
}
