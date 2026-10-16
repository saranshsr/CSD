import { Button } from '../../components';
import { useNav } from '../../kit/Navigator';
import type { ScreenProps } from '../../kit/types';
import { FormTitle, SubmitButton } from './components/ProviderForm';
import { RichText } from './components/RewardsPrimitives';
import { earnProviders, findEarnProvider, rt } from './data.rewards';
import { checkoutServerColors } from './tokens';
import styles from './components/providerForm.module.css';

/** NoonProviderEarnHelpOverlayScreen — "How it works?" title block, html terms, optional T&C link, "GOT IT". */
export function ProviderEarnHelpScreen({ params }: ScreenProps<{ code?: string }>) {
  const nav = useNav();
  const provider = findEarnProvider(params.code ?? '') ?? earnProviders[0];
  const page = provider.details.earnPage;
  return (
    <div className={styles.sheet}>
      <FormTitle title={rt.noon_how_it_works} logo={page.icon} color={provider.details.genericThemeColor} isVouchersProvider={false} />
      <div className={styles.helpTerms}>
        {provider.details.terms.map((term) => (
          <RichText key={term} value={term} />
        ))}
      </div>
      <div className={styles.helpButtons}>
        {provider.details.termsExternalUrl && (
          <Button variant="noonDotted" titleCase className={styles.termsLink}>
            Terms &amp; Conditions
          </Button>
        )}
        <SubmitButton text="GOT IT" bg={page.submitButton.background.colors[0] ?? checkoutServerColors.black} textColor={page.submitButton.textColor} onPress={() => nav.back()} minHeight={50} inset={false} />
      </div>
    </div>
  );
}
