import { useNav } from '../../kit/Navigator';
import { AccountSection, AccountSectionItem, SheetBody } from './components/AccountSection';
import { copy, deactivationConfig, nationalities } from './data';
import { AccountIconImg } from './icons';
import { setAccountState, useAccountState } from './store';
import styles from './inner.module.css';

function RadioList({ title, items, selected, onSelect }: { title: string; items: { id: string; label: string }[]; selected?: string; onSelect: (id: string) => void }) {
  return (
    <SheetBody>
      <div className={styles.countryContent}>
        <div className={styles.countryHeader}>
          <span className={styles.countryTitle}>{title}</span>
        </div>
        <AccountSection dash="2,2" className={styles.mt12}>
          {items.map((it) => (
            <AccountSectionItem
              key={it.id}
              before={null}
              beforeStyle={{ marginInlineEnd: 0 }}
              title={it.label}
              rowStyle={{ paddingTop: 16, paddingBottom: 16 }}
              after={<AccountIconImg name={selected === it.id ? 'radioOn' : 'radioOff'} />}
              onPress={() => onSelect(it.id)}
            />
          ))}
        </AccountSection>
      </div>
    </SheetBody>
  );
}

/**
 * Stand-in for noon.ListingOverlayScreen (deletion reasons). The real overlay is a generic list in src/screens;
 * rendered here in the account sheet style.
 */
export function DeletionReasonSheet() {
  const nav = useNav();
  const { deletionReason } = useAccountState();
  return (
    <RadioList
      title={copy.deletion.reasonPlaceholder}
      selected={deletionReason}
      items={deactivationConfig.reasons.map((r) => ({ id: r.reasonCode, label: r.name }))}
      onSelect={(id) => {
        setAccountState({ deletionReason: id });
        nav.back();
      }}
    />
  );
}

/** Stand-in for noon.PersonalizedExperienceNationalityListingScreen ("View all" on the Nationality card). */
export function NationalitySheet() {
  const nav = useNav();
  const { draft } = useAccountState();
  return (
    <RadioList
      title={copy.editProfile.nationalityTitle}
      selected={draft?.nationalityCountryCode}
      items={nationalities.countries.map((c) => ({ id: c.countryCode, label: c.name }))}
      onSelect={(id) => {
        setAccountState((s) => ({ draft: s.draft ? { ...s.draft, nationalityCountryCode: id } : s.draft }));
        nav.back();
      }}
    />
  );
}
