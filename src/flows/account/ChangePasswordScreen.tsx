import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Header, Icon, Pressable, Screen, Spinner } from '../../components';
import { useNav } from '../../kit/Navigator';
import { copy, passwordValidations } from './data';
import styles from './inner.module.css';
import { ref } from '../../foundations/tokens';

const c = copy.password;
type Field = 'currentPassword' | 'newPassword' | 'confirmNewPassword';

/**
 * PasswordEditScreen (features/auth): "Change Password" 22/bold, three 45px outlined inputs with a floating
 * notch label (13px, white bg) and eye toggles, live password-rule checklist, sticky SUBMIT footer (r8).
 */
export function ChangePasswordScreen() {
  const nav = useNav();
  const [values, setValues] = useState<Record<Field, string>>({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
  const [hidden, setHidden] = useState<Record<Field, boolean>>({ currentPassword: true, newPassword: true, confirmNewPassword: true });
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const tests = passwordValidations.map((v) => ({ ...v, isPassed: v.regex.test(values.newPassword) }));
  const errors: Partial<Record<Field, string>> = {};
  if (!values.currentPassword) errors.currentPassword = c.required;
  else if (!tests.every((t) => t.isPassed)) errors.newPassword = c.invalid;
  else if (values.newPassword !== values.confirmNewPassword) errors.confirmNewPassword = c.mismatch;
  const isValid = Object.keys(errors).length === 0;

  const onSubmit = () => {
    setSubmitted(true);
    if (!isValid) return;
    setSaving(true);
    setTimeout(() => {
      nav.back();
      nav.toast('Password updated', { tone: 'success' });
    }, 700);
  };

  const field = (id: Field, label: string) => (
    <div className={styles.pwField}>
      <span className={styles.pwLabel}>{label}</span>
      <input
        className={styles.pwInput}
        data-error={submitted && !!errors[id]}
        type={hidden[id] ? 'password' : 'text'}
        value={values[id]}
        autoComplete="off"
        onChange={(e) => setValues((v) => ({ ...v, [id]: e.target.value }))}
      />
      <button type="button" className={styles.pwEye} aria-label={hidden[id] ? 'Show password' : 'Hide password'} onClick={() => setHidden((h) => ({ ...h, [id]: !h[id] }))}>
        {hidden[id] ? <EyeOff size={18} strokeWidth={1.8} /> : <Eye size={18} strokeWidth={1.8} />}
      </button>
      {submitted && errors[id] && <div className={styles.pwError}>{errors[id]}</div>}
    </div>
  );

  return (
    <Screen
      background="bgSurface"
      header={<Header back />}
      footer={
        <div className={styles.pwFooter}>
          <Pressable className={styles.pwSubmit} disabled={saving} onClick={onSubmit} scale={0.98}>
            {saving ? <Spinner color={ref.color('textInverse')} track={ref.palette('whiteAlpha35')} /> : c.submit}
          </Pressable>
        </div>
      }
    >
      <div className={styles.pwScroll}>
        <div className={styles.pwTitle}>{c.title}</div>
        <div className={styles.pwForm}>
          {field('currentPassword', c.current)}
          {field('newPassword', c.next)}
          {field('confirmNewPassword', c.confirm)}
          <div>
            <div className={styles.pwReqTitle}>{c.requirement}</div>
            {tests.map((t) => (
              <div key={t.description} className={styles.pwReq} data-passed={t.isPassed}>
                <Icon name="checkCircle" size={16} color={t.isPassed ? 'var(--nk-color-success)' : 'var(--nk-color-acct-password-muted)'} />
                {t.description}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Screen>
  );
}
