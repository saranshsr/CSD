import { useEffect, useRef, useState } from 'react';
import { Pressable } from '../../components';
import { useNav } from '../../kit/Navigator';
import { copy } from './data';
import { AccountImageImg } from './icons';
import { setAccountState, useAccountState } from './store';
import styles from './inner.module.css';

const ITEM = 36;
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const pad = (n: number) => String(n).padStart(2, '0');
const daysIn = (y: number, m: number) => new Date(y, m + 1, 0).getDate();

/** One snapping column of the iOS-style date wheel (react-native-date-picker, mode="date", locale en-GB). */
function WheelColumn({ items, index, onChange, disabledFrom }: { items: string[]; index: number; onChange: (i: number) => void; disabledFrom?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => {
    const el = ref.current;
    if (el && Math.round(el.scrollTop / ITEM) !== index) el.scrollTo({ top: index * ITEM, behavior: el.scrollTop === 0 && index > 0 ? 'auto' : 'smooth' });
  }, [index]);
  return (
    <div
      ref={ref}
      className={styles.wheelCol}
      onScroll={(e) => {
        const el = e.currentTarget;
        clearTimeout(timer.current);
        timer.current = setTimeout(() => {
          const i = Math.max(0, Math.min(items.length - 1, Math.round(el.scrollTop / ITEM)));
          onChange(disabledFrom !== undefined && i >= disabledFrom ? disabledFrom - 1 : i);
        }, 90);
      }}
    >
      <div className={styles.wheelPad} />
      {items.map((label, i) => (
        <div key={label + i} className={styles.wheelItem} data-disabled={disabledFrom !== undefined && i >= disabledFrom} onClick={() => onChange(i)}>
          {label}
        </div>
      ))}
      <div className={styles.wheelPad} />
    </div>
  );
}

/**
 * DatePickerScreen overlay (plain bottom Overlay, not the floating account sheet) opened from the Birthday card: NoonAccountBirthdayPickerTitle, date wheel
 * (maximumDate = today), NoonAccountBirthdayPickerNote (orange tint, note icon), DONE PrimaryButton (r8).
 */
export function BirthdayPickerSheet() {
  const nav = useNav();
  const { draft } = useAccountState();
  const today = new Date();
  const init = draft?.birthDate ? new Date(draft.birthDate) : today;
  const [y, setY] = useState(init.getFullYear());
  const [m, setM] = useState(init.getMonth());
  const [d, setD] = useState(init.getDate());

  const years = Array.from({ length: 101 }, (_, i) => String(today.getFullYear() - 100 + i));
  const dayCount = daysIn(y, m);
  const days = Array.from({ length: dayCount }, (_, i) => String(i + 1));
  const isThisYear = y === today.getFullYear();
  const isThisMonth = isThisYear && m === today.getMonth();
  const day = Math.min(d, dayCount);

  const onDone = () => {
    const picked = new Date(y, m, day) > today ? today : new Date(y, m, day);
    setAccountState((s) => ({ draft: s.draft ? { ...s.draft, birthDate: `${picked.getFullYear()}-${pad(picked.getMonth() + 1)}-${pad(picked.getDate())}` } : s.draft }));
    nav.back();
  };

  return (
    <div className={styles.dpSheet}>
      <div className={styles.dpTitle}>
        <span className={styles.dpTitleText}>{copy.birthdayPicker.title}</span>
        <span className={styles.dpSubtitle}>{copy.birthdayPicker.subtitle}</span>
      </div>
      <div className={styles.wheel}>
        <span className={styles.wheelHighlight} />
        <WheelColumn items={days} index={day - 1} onChange={(i) => setD(i + 1)} disabledFrom={isThisMonth ? today.getDate() : undefined} />
        <div style={{ flex: 1.8, height: '100%', display: 'flex' }}>
          <WheelColumn items={MONTHS} index={m} onChange={setM} disabledFrom={isThisYear ? today.getMonth() + 1 : undefined} />
        </div>
        <WheelColumn items={years} index={years.indexOf(String(y))} onChange={(i) => setY(Number(years[i]))} />
      </div>
      <div className={styles.dpNote}>
        <AccountImageImg name="note" style={{ marginTop: 2 }} />
        <span>
          <b>{copy.birthdayPicker.noteBold} </b>
          {copy.birthdayPicker.note}
        </span>
      </div>
      <Pressable className={styles.dpDone} onClick={onDone} scale={0.98}>
        {copy.birthdayPicker.done}
      </Pressable>
    </div>
  );
}
