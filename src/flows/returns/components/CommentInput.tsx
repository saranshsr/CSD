import { copy } from '../data';
import styles from '../submit.module.css';

const MAX = 500;

/** features/afs/common/utils/afsInputUtils.ts validateText (min/max, 4+ spaces, 5+ repeated chars) */
export function validateNote(text: string, { mandatory, minLength = 0, maxLength = MAX }: { mandatory: boolean; minLength?: number; maxLength?: number }) {
  const t = text.trim();
  const len = Array.from(t).length;
  const min = mandatory ? Math.min(Math.max(minLength, 0), MAX) : 0;
  const max = Math.max(Math.min(maxLength, MAX), min);
  if (len === 0) return mandatory ? { validationText: copy.minChars(min), isTextValid: false } : { validationText: `0/${max}`, isTextValid: true };
  if (/[ ]{4,}/.test(t)) return { validationText: copy.multipleSpaces, isTextValid: false };
  if (/([\p{L}\p{N}_])\1{4,}/u.test(t)) return { validationText: copy.repeatedChars, isTextValid: false };
  if (len < min) return { validationText: copy.remainingChars(min - len), isTextValid: false };
  if (len > max) return { validationText: copy.maxChars(max), isTextValid: false };
  return { validationText: `${len}/${max}`, isTextValid: true };
}

/** components/AFSReturnsCommentInput — 14/500 multiline, r12, 1px #D0D4DD, 72–180 px; counter 12/400, invalid 12/500 orange */
export function CommentInput({ note, placeholder, minLength, maxLength, mandatory, onChange }: { note: string; placeholder: string; minLength: number; maxLength: number; mandatory: boolean; onChange: (v: string) => void }) {
  const { validationText, isTextValid } = validateNote(note, { mandatory, minLength, maxLength });
  return (
    <div className={styles.note}>
      <textarea className={styles.noteInput} value={note} placeholder={placeholder} maxLength={Math.min(maxLength, MAX)} onChange={(e) => onChange(e.target.value)} />
      <span className={[styles.noteCounter, !isTextValid && styles.noteInvalid].filter(Boolean).join(' ')}>{validationText}</span>
    </div>
  );
}
