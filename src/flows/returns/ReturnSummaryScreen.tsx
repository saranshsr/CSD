import { ProductImage, Screen } from '../../components';
import { useNav } from '../../kit/Navigator';
import { icons } from './assets';
import { AFSBackHeader } from './components/AFSBackHeader';
import { AFSButton, Svg, Tap } from './components/AFSButton';
import { Dashed } from './components/Dashed';
import { copy, resolveProduct } from './data';
import { PRODUCT_PHOTO, pickupAddress, recordFor, returnsStore } from './store';
import styles from './summary.module.css';

/**
 * AFSReturnsRequestSummaryScreen (features/afs/returns/screens/AFSReturnsRequestSummaryScreen): return details
 * (requested date, return ID, reason, comment), pickup address + date/time, uploaded images, Continue Shopping.
 * Data = the details payload's `returnSummary` (SD). MAPPING.md §12.
 */
export function ReturnSummaryScreen({ params }: { params: { productId?: string; returnNr?: string } }) {
  const nav = useNav();
  const product = resolveProduct(params.productId);
  const returns = returnsStore.useReturns();
  const r = returns.find((x) => (params.returnNr ? x.returnItemNr === params.returnNr : x.productId === product.id)) ?? recordFor(product.id, params.returnNr);
  const address = pickupAddress(r.addressCode);
  return (
    <Screen
      background="bgSubtle"
      overlayHeader
      safeTop={false}
      header={<AFSBackHeader solid title={copy.titleRequestSummary} onBack={() => nav.back()} />}
      footer={
        <div className={styles.footer}>
          <AFSButton size="lg" title={copy.continueShopping} onPress={() => nav.switchTab('home')} />
        </div>
      }
      contentStyle={{ paddingBottom: 0 }}
    >
      <div className={styles.list}>
        <section className={styles.card}>
          <div className={styles.headerBlock}>
            <span className={styles.cardTitle}>{copy.returnDetailsSmall}</span>
            <div className={styles.tiles}>
              <div className={styles.tile}>
                <span className={styles.tileTitle}>{copy.requestedDate}</span>
                <span className={styles.tileValue}>{r.requestedAt}</span>
              </div>
              <div className={styles.tile}>
                <span className={styles.tileTitle}>{copy.dailyReturnId}</span>
                <span className={styles.tileValue}>{r.returnItemNr}</span>
              </div>
            </div>
          </div>
          <Dashed />
          <div className={styles.reason}>
            <div className={styles.reasonHead}>
              <span className={styles.reasonTitle}>{r.reason}</span>
              {r.subReason && <span className={styles.small}>{r.subReason}</span>}
            </div>
            {r.comment && (
              <div className={styles.comment}>
                <span className={styles.small}>{r.comment}</span>
              </div>
            )}
          </div>
        </section>

        <section className={styles.pickup}>
          <div className={[styles.pickupRow, styles.pickupRowAddress].join(' ')}>
            <span className={styles.pickupIcon}>
              <Svg src={icons.pickupLocation} size={22} />
            </span>
            <div className={styles.pickupText}>
              <span className={styles.pickupTitle}>{copy.pickupAddress}</span>
              <div className={styles.pickupValues}>
                <span className={styles.small}>
                  {address.name}, {address.address}
                </span>
                <span className={styles.small} dir="ltr">
                  {address.phone}
                </span>
              </div>
            </div>
          </div>
          {r.pickupDateTime && (
            <>
              <Dashed />
              <div className={styles.pickupRow}>
                <span className={styles.pickupIcon}>
                  <Svg src={icons.pickupTime} size={22} />
                </span>
                <div className={styles.pickupText}>
                  <span className={styles.pickupTitle}>{copy.pickupDateTime}</span>
                  <span className={styles.small}>{r.pickupDateTime}</span>
                </div>
              </div>
            </>
          )}
        </section>

        {r.images.length > 0 && (
          <section className={styles.images}>
            <span className={styles.cardTitle}>{copy.uploadedImages}</span>
            <div className={['nk-hscroll', styles.imagesList].join(' ')}>
              {r.images.map((src, i) => (
                <Tap key={`${src}-${i}`} className={styles.image} onPress={() => nav.toast('Image gallery (NoonImageGalleryScreen)')}>
                  {src === PRODUCT_PHOTO ? <ProductImage product={product} width="100%" height="100%" /> : <img src={src} alt="" className={styles.img} />}
                </Tap>
              ))}
            </div>
          </section>
        )}
      </div>
    </Screen>
  );
}
