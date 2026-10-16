import { useNav } from '../../kit/Navigator';
import { AccountSection, AccountSectionItem, SheetBody } from './components/AccountSection';
import { copy, countryFlags, supportedCountries } from './data';
import { AccountIconImg } from './icons';
import { useAccountState } from './store';
import styles from './inner.module.css';

/**
 * NoonAccountCountrySelector in NoonAccountBottomSheetScreen: "Select your country" (19/700), then a 2,2-dashed section
 * of flag rows (paddingVertical 16) with radio icons. Picking a country dismisses the sheet and opens the
 * full-screen change-country lottie (fade-in modal, 300ms).
 */
export function CountrySheet() {
  const nav = useNav();
  const { country } = useAccountState();

  const onSelect = (id: string) => {
    nav.back();
    nav.push('account/changeCountry', { country: id }, { presentation: 'modal', transition: 'fade' });
  };

  return (
    <SheetBody>
      <div className={styles.countryContent}>
        <div className={styles.countryHeader}>
          <span className={styles.countryTitle}>{copy.selectCountry}</span>
        </div>
        <AccountSection dash="2,2" className={styles.mt12}>
          {supportedCountries.map((c) => {
            const selected = c.id === country;
            return (
              <AccountSectionItem
                key={c.id}
                before={<img src={countryFlags[c.id]} alt="" width={27} height={17} style={{ display: 'block' }} />}
                title={c.label}
                after={<AccountIconImg name={selected ? 'radioOn' : 'radioOff'} />}
                rowStyle={{ paddingTop: 16, paddingBottom: 16 }}
                onPress={selected ? undefined : () => onSelect(c.id)}
              />
            );
          })}
        </AccountSection>
      </div>
    </SheetBody>
  );
}
