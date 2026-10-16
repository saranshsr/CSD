import { useMemo } from 'react';
import { Header, Screen, Text } from '../../components';
import type { ScreenProps } from '../../kit/types';
import { productById } from '../../data';
import { SfDeliveryCard, deliveryVariants, type DeliveryVariant } from './components/storefront/SfDeliveryCard';
import { pdpContent } from './data';
import styles from './pdp.module.css';

const labels: Record<DeliveryVariant, string> = {
  crossSell: 'crossSell — Variant6',
  noCrossSell: 'noCrossSell — No MP cross sell',
  market: 'market',
  express: 'express — express only',
  global: 'global — Global',
};

/** Every `SfDeliveryCard` variant for one product (PDP Redesign xPr9Ln37JGSBGvNtrsyD0y · 3583:109620), for review and snapshots. */
export function DeliveryVariantsScreen({ params }: ScreenProps<{ productId: string }>) {
  const product = productById(params.productId);
  const content = useMemo(() => pdpContent(product), [product]);
  return (
    <Screen header={<Header title="Delivery information" />} background="bgPage">
      <div className={styles.list} style={{ paddingTop: 12 }}>
        {deliveryVariants.map((v) => (
          <section key={v}>
            <Text variant="caption" color="textSecondary" style={{ display: 'block', padding: '0 14px 6px' }}>
              {labels[v]}
            </Text>
            <SfDeliveryCard content={content} variant={v} />
          </section>
        ))}
      </div>
    </Screen>
  );
}
