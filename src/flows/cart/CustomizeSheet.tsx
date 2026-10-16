import { useState } from 'react';
import { Lottie } from '../../components';
import atcLoader from '@assets/cart/atc-loader-animation.lottie';
import { useDemoStore } from '../../kit/DemoStore';
import { useNav } from '../../kit/Navigator';
import type { ScreenProps } from '../../kit/types';
import { cartItemExtras, t } from './data';
import styles from './customize.module.css';

/** noon-en.json noon_product_custom_edit_msg / noon_product_custom_save */
const s = { title: 'Edit Your Custom Message', save: 'save message' };

/**
 * NoonCartCustomizeOverlayScreen — opened from the item's "Text: … Edit" row.
 * Title 19 bold, one 44h outlined input per answer (floating 12px label, 14 semibold value, n/limit counter),
 * full-width 48h r8 CTA (#3866DF, disabled #F0F1F4 / #CBCFD7) with the ATC loader Lottie while saving.
 */
export function CustomizeSheet({ params }: ScreenProps<{ productId?: string }>) {
  const productId = params.productId ?? 'p1';
  const nav = useNav();
  const { cart, updateLine } = useDemoStore();
  const line = cart.find((l) => l.product.id === productId);
  const questions = cartItemExtras[productId]?.customizationQuestions ?? [];
  const initial = Object.fromEntries(questions.map((q) => [q.code, line?.customization?.find((a) => a.code === q.code)?.answer ?? '']));
  const [values, setValues] = useState<Record<string, string>>(initial);
  const [loading, setLoading] = useState(false);

  // isCtaDisabled: any empty input, or every input untouched
  const untouched = questions.filter((q) => values[q.code] === initial[q.code]).length;
  const disabled = questions.some((q) => !values[q.code]?.length) || untouched === questions.length;

  const save = () => {
    setLoading(true);
    setTimeout(() => {
      updateLine(productId, { customization: questions.map((q) => ({ code: q.code, question: q.question, answer: values[q.code] })) });
      nav.toast(t.customSaved, { tone: 'success' });
      nav.back();
    }, 900);
  };

  return (
    <div className={styles.container}>
      <div className={styles.title}>{s.title}</div>
      <div className={styles.list} style={{ overflowX: questions.length > 1 ? 'auto' : 'hidden' }}>
        {questions.map((q, i) => (
          <div key={q.code} className={styles.answer} style={questions.length > 1 ? { width: 'calc(100% - 48px)', flexShrink: 0 } : undefined}>
            <label className={styles.inputBox}>
              <span className={styles.label}>{q.question}</span>
              <input
                autoFocus={i === 0}
                className={styles.input}
                value={values[q.code] ?? ''}
                maxLength={q.charLimit}
                placeholder={q.placeholder}
                onChange={(e) => setValues((v) => ({ ...v, [q.code]: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && !disabled && !loading && save()}
              />
              <span className={styles.counter}>{`${values[q.code]?.length || 0}/${q.charLimit}`}</span>
            </label>
          </div>
        ))}
      </div>
      <button type="button" className={[styles.button, disabled || loading ? styles.buttonDisabled : ''].join(' ')} disabled={disabled || loading} onClick={save}>
        {loading ? <Lottie src={atcLoader} loop size={32} /> : <span className={[styles.buttonText, disabled ? styles.buttonTextDisabled : ''].join(' ')}>{s.save}</span>}
      </button>
    </div>
  );
}
