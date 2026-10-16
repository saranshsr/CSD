import { useNav } from '../../kit/Navigator';
import type { ScreenProps } from '../../kit/types';
import { HtmlText } from '../../components';

export interface PromiseInfoParams {
  title?: string;
  textContent?: string;
}

/**
 * src/screens/LearnMoreScreen (opened by NoonCheckoutShipment showPromiseDetailsInfo): padding 40/37, title 32/700,
 * HtmlView 16 #404553 (marginBottom 64), 48h $accentColor r8 "GOT IT" 14/700 white.
 */
export function PromiseInfoScreen({ params }: ScreenProps<PromiseInfoParams>) {
  const nav = useNav();
  return (
    <div style={{ padding: '40px 37px 15px', background: 'var(--nk-color-bg-surface)' }}>
      {params.title && (
        <div style={{ paddingBottom: 15 }}>
          <div style={{ font: 'var(--nk-type-chk-text32-bold-lh38)', color: 'var(--nk-color-text-legacy)', paddingBottom: 8 }}>{params.title} </div>
        </div>
      )}
      {params.textContent && (
        <div style={{ paddingBottom: 15 }}>
          <HtmlText value={params.textContent} stylesheet={{ p: { display: 'block', marginBottom: 64, fontSize: 16, lineHeight: '22px', color: 'var(--nk-color-text-legacy)' } }} />
        </div>
      )}
      <button
        type="button"
        onClick={nav.back}
        style={{ width: '100%', height: 48, border: 0, borderRadius: 'var(--nk-radius-r8)', background: 'var(--nk-color-cta)', color: 'var(--nk-color-text-inverse)', font: 'var(--nk-type-text14-bold-lh1)', cursor: 'pointer' }}
      >
        GOT IT
      </button>
    </div>
  );
}
