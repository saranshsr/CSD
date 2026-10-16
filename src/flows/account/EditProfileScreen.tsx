import { motion } from 'motion/react';
import { useEffect, useState, type ReactNode } from 'react';
import { Pressable, Screen, Spinner } from '../../components';
import { useNav } from '../../kit/Navigator';
import { copy, dietaryPreferences, nationalities, type ProfileValues } from './data';
import { AccountIconImg, type AccountIcon } from './icons';
import { setAccountState, useAccountState } from './store';
import styles from './inner.module.css';
import { ref } from '../../foundations/tokens';

const e = copy.editProfile;
type Option = { id: string; label: string; icon: AccountIcon };
const genderOptions: Option[] = [
  { id: 'M', label: e.male, icon: 'male' },
  { id: 'F', label: e.female, icon: 'female' },
];
const residentOptions: Option[] = [
  { id: 'Tourist', label: e.touristYes, icon: 'airplane' },
  { id: 'Non-Tourist', label: e.touristNo, icon: 'home' },
];

/** Mock of the server's profileCompletionPercentage: 72% + 7 per filled optional field (gender, birthday, nationality, diet). */
const completionFor = (p: ProfileValues) => Math.min(100, 72 + 7 * [p.gender, p.birthDate, p.nationalityCountryCode, p.dietaryPreference].filter(Boolean).length);
const formatDate = (iso: string) => {
  const [y, m, d] = iso.split('-');
  return `${d}-${m}-${y}`;
};

/** AddressV2FormInput: label centred at 13px, floats to 11px / -12px (60ms) when focused or filled. */
function FloatingInput({ label, value, onChange, error }: { label: string; value: string; onChange: (v: string) => void; error?: string }) {
  const [focused, setFocused] = useState(false);
  const floating = focused || !!value;
  return (
    <div className={styles.field}>
      <input
        className={styles.fieldInput}
        data-error={!!error}
        value={value}
        maxLength={50}
        autoCapitalize="words"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(ev) => onChange(ev.target.value)}
      />
      <div className={styles.fieldLabel}>
        <motion.span className={styles.fieldLabelText} initial={false} animate={{ y: floating ? -12 : 0, scale: floating ? 11 / 13 : 1 }} transition={{ duration: 0.06 }}>
          {label}
        </motion.span>
      </div>
      {error && <div className={styles.fieldError}>{error}</div>}
    </div>
  );
}

/** NoonAccountSectionCard: white r16 card, 16/700 title, 13/500 blueGray700 subtitle, optional absolutely-placed right action. */
function SectionCard({ title, subtitle, right, children }: { title: string; subtitle?: string; right?: ReactNode; children: ReactNode }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardTitleRow}>
        <span className={styles.cardTitle}>{title}</span>
      </div>
      {right && <div className={styles.cardRight}>{right}</div>}
      {subtitle && <div className={styles.cardSubtitle}>{subtitle}</div>}
      {children}
    </div>
  );
}

/** NoonAccountOptionSelector: two r14 tiles (icon · label · radio), selected label weight 600. */
function OptionSelector({ title, options, selected, onSelect }: { title: string; options: Option[]; selected: string; onSelect: (id: string) => void }) {
  return (
    <div className={styles.optCard}>
      <div className={styles.optTitle}>{title}</div>
      <div className={styles.optRow}>
        {options.map((o) => {
          const isSel = selected === o.id;
          return (
            <Pressable key={o.id} className={styles.opt} onClick={() => onSelect(o.id)} scale={0.97}>
              <AccountIconImg name={o.icon} />
              <span className={styles.optLabel} data-selected={isSel}>
                {o.label}
              </span>
              <AccountIconImg name={isSel ? 'radioOn' : 'radioOff'} />
            </Pressable>
          );
        })}
      </div>
    </div>
  );
}

/**
 * NoonAccountEditProfileScreen → NoonAccountEditProfileForm inside NoonAccountEditProfileLayout:
 * white header (36px back + "Your profile"), #F9F9FB scroll with name inputs, phone, gender, resident status,
 * birthday (picker sheet; locked once saved), nationality (4 quick tiles + View all), dietary chips (UAE only),
 * and the footer with "Complete your profile" % badge + Save (grey until the form is dirty).
 */
export function EditProfileScreen() {
  const nav = useNav();
  const { profile, draft, country, profileCompletion } = useAccountState();
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setAccountState({ draft: { ...profile } });
    return () => setAccountState({ draft: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const v = draft ?? profile;
  const set = (patch: Partial<ProfileValues>) => setAccountState((s) => ({ draft: { ...(s.draft ?? s.profile), ...patch } }));
  const dirty = (Object.keys(v) as (keyof ProfileValues)[]).some((k) => v[k] !== profile[k]);
  const errors = {
    firstName: profile.firstName && !v.firstName.trim() ? e.required : undefined,
    lastName: profile.lastName && !v.lastName.trim() ? e.required : undefined,
  };

  // Nationality quick-select: first 4 frequently used; a selection outside them replaces the 4th tile.
  const freq = nationalities.frequentlyUsed.slice(0, 4);
  const selectedNat = v.nationalityCountryCode;
  const extra = selectedNat && !freq.some((c) => c.countryCode === selectedNat) ? nationalities.countries.find((c) => c.countryCode === selectedNat) : undefined;
  const natTiles = extra ? [...freq.slice(0, 3), extra] : freq;

  const birthdayLocked = !!profile.birthDate;

  const onSave = () => {
    setTouched(true);
    if (!dirty || errors.firstName || errors.lastName) return;
    setSaving(true);
    setTimeout(() => {
      const next = { ...v, firstName: v.firstName.trim(), lastName: v.lastName.trim() };
      setAccountState({ profile: next, draft: next, profileCompletion: completionFor(next) });
      setSaving(false);
      nav.toast(e.saved, { tone: 'success' });
    }, 600);
  };

  return (
    <Screen
      background="bgSubtle"
      header={
        <div className={styles.epHeaderWrap}>
          <div className={styles.epHeader}>
            <Pressable onClick={nav.back} aria-label="Back" style={{ display: 'flex' }}>
              <AccountIconImg name="back" flipRtl />
            </Pressable>
            <span className={styles.epHeaderTitle}>{e.title}</span>
          </div>
        </div>
      }
      footer={
        <div className={styles.epFooter}>
          {profileCompletion !== 100 && (
            <div className={styles.epCompleteRow}>
              <span className={styles.epCompleteTitle}>{e.completeProfile}</span>
              <span className={styles.epBadgeRing}>
                <span className={styles.epBadge}>{`${profileCompletion}%`}</span>
              </span>
            </div>
          )}
          <Pressable className={styles.epSave} data-dirty={dirty} disabled={!dirty || saving} onClick={onSave} scale={0.98}>
            {saving ? <Spinner color={ref.color('textInverse')} track={ref.palette('whiteAlpha35')} /> : e.saveButton}
          </Pressable>
        </div>
      }
    >
      <div className={styles.epContent}>
        {/* NoonAccountCustomerDetailsSection */}
        <div className={styles.epNames}>
          <FloatingInput label={e.firstName} value={v.firstName} onChange={(x) => set({ firstName: x })} error={touched || v.firstName !== profile.firstName ? errors.firstName : undefined} />
          <FloatingInput label={e.lastName} value={v.lastName} onChange={(x) => set({ lastName: x })} error={touched || v.lastName !== profile.lastName ? errors.lastName : undefined} />
        </div>

        <SectionCard title={e.phoneTitle} subtitle={e.phoneSubtitle}>
          <Pressable className={styles.inputLike} onClick={() => nav.toast('Phone OTP verification lives in the auth flow (PrimaryPhoneVerificationV2Screen) — not in this kit')} scale={0.99}>
            <AccountIconImg name="phone" />
            <span className={v.phoneNumber ? styles.inputLikeText : styles.inputLikePlaceholder}>{v.phoneNumber || e.phonePlaceholder}</span>
            {!!v.phoneNumber && <AccountIconImg name="radioOn" />}
          </Pressable>
        </SectionCard>

        <OptionSelector title={e.genderTitle} options={genderOptions} selected={v.gender} onSelect={(id) => set({ gender: id as ProfileValues['gender'] })} />

        {country === 'AE' && (
          <OptionSelector title={e.touristTitle} options={residentOptions} selected={v.residentStatus} onSelect={(id) => set({ residentStatus: id as ProfileValues['residentStatus'] })} />
        )}

        <SectionCard title={e.birthdayTitle} subtitle={e.birthdaySubtitle}>
          <Pressable className={styles.inputLike} style={{ gap: 8, opacity: birthdayLocked ? 0.5 : 1 }} disabled={birthdayLocked} onClick={() => nav.sheet('account/birthday')} scale={0.99}>
            <AccountIconImg name="calendar" />
            <span className={v.birthDate ? styles.inputLikeText : styles.inputLikePlaceholder}>{v.birthDate ? formatDate(v.birthDate) : e.birthdayPlaceholder}</span>
          </Pressable>
        </SectionCard>

        <SectionCard
          title={e.nationalityTitle}
          subtitle={e.nationalitySubtitle}
          right={
            <Pressable className={styles.viewAll} onClick={() => nav.sheet('account/nationality')}>
              {e.viewAll}
            </Pressable>
          }
        >
          <div className={styles.natRow}>
            {natTiles.map((c) => (
              <Pressable key={c.countryCode} className={styles.natOpt} data-selected={selectedNat === c.countryCode} onClick={() => set({ nationalityCountryCode: c.countryCode })} scale={0.97}>
                <span className={styles.natLabel}>{c.name}</span>
              </Pressable>
            ))}
          </div>
        </SectionCard>

        {country === 'AE' && (
          <SectionCard title={e.dietaryTitle} subtitle={e.dietarySubtitle}>
            <div className={styles.chips}>
              {dietaryPreferences.map((p) => (
                <Pressable key={p.id} className={styles.chip} data-selected={v.dietaryPreference === p.id} onClick={() => set({ dietaryPreference: p.id })} scale={0.96}>
                  {p.label}
                </Pressable>
              ))}
            </div>
          </SectionCard>
        )}
      </div>
    </Screen>
  );
}
