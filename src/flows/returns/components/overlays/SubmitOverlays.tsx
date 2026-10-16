import { useEffect, useState, type ReactNode } from 'react';
import { user } from '../../../../data';
import { Icon, type IconName } from '../../../../components';
import { icons } from '../../assets';
import { addresses, copy, evidenceConfig, type estimatedRefund } from '../../data';
import { AFSButton, Svg, Tap } from '../AFSButton';
import { CommentInput, validateNote } from '../CommentInput';
import { Dashed } from '../Dashed';
import { ReturnsOverlay } from '../ReturnsOverlay';
import { DepthCarousel } from '../sections/PhotoGuide';
import styles from './overlays.module.css';

interface OverlayProps {
  open: boolean;
  onClosed: () => void;
}

/** screens/AFSReturnsRefundDetailsOverlayScreen — white card, no scroll padding */
export function RefundDetailsOverlay({ open, onClosed, refund }: OverlayProps & { refund: ReturnType<typeof estimatedRefund> }) {
  return (
    <ReturnsOverlay open={open} onClosed={onClosed} cardClassName={styles.cardWhite} contentClassName={styles.rdContent}>
      {() => (
        <>
          <div className={styles.rdTitleBox}>
            <span className={styles.rdTitle}>{refund.detailsTitle}</span>
          </div>
          <div className={styles.rdBody}>
            <div className={styles.rdRows}>
              {refund.rows.map((r) => (
                <div key={r.title + r.amount} className={styles.rdRow}>
                  <span className={styles.rdRowTitle}>{r.title}</span>
                  <span className={styles.rdRowAmount}>{r.amount}</span>
                </div>
              ))}
              <div className={styles.rdSep}>
                <Dashed color="var(--nk-color-border-strong)" />
              </div>
              <div className={styles.rdRow}>
                <span className={styles.rdTotalTitle}>{refund.total.title}</span>
                <span className={styles.rdTotalAmount}>{refund.total.amount}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </ReturnsOverlay>
  );
}

/** screens/AFSReturnsUploadImageOverlayScreen — "Open camera" / "Upload from gallery" rows */
export function UploadImageOverlay({ open, onClosed, onCamera, onGallery }: OverlayProps & { onCamera: () => void; onGallery: () => void }) {
  const rows: [string, string, () => void][] = [
    [icons.camera, copy.openCamera, onCamera],
    [icons.gallery, copy.uploadFromGallery, onGallery],
  ];
  return (
    <ReturnsOverlay open={open} onClosed={onClosed}>
      {(close) => (
        <div className={styles.upList}>
          {rows.map(([icon, label, fn]) => (
            <Tap
              key={label}
              className={styles.upButton}
              onPress={() => {
                fn();
                close();
              }}
            >
              <span className={styles.upButtonContent}>
                <span className={styles.upIconBox}>
                  <Svg src={icon} size={20} />
                </span>
                <span className={styles.upText}>{label}</span>
              </span>
              <Svg src={icons.chevronRightGray} size={20} flipRtl />
            </Tap>
          ))}
        </div>
      )}
    </ReturnsOverlay>
  );
}

const guideIcons: IconName[] = ['camera', 'scan', 'tag'];

/** screens/AFSReturnsImageGuidelineOverlayScreen — depth carousel (108×108, auto 2000 ms), instructions, "Got it" */
export function ImageGuidelineOverlay({ open, onClosed, photos }: OverlayProps & { photos: ReactNode[] }) {
  return (
    <ReturnsOverlay open={open} onClosed={onClosed} contentClassName={styles.igContent}>
      {(close) => (
        <div className={styles.ig}>
          {photos.length > 0 && <DepthCarousel items={photos} />}
          <div className={styles.igInstructions}>
            <span className={styles.igTitle}>{evidenceConfig.uploadGuideline.title}</span>
            <div>
              {evidenceConfig.uploadGuideline.sectionsV2.map((t, i) => (
                <div key={t} className={styles.igItem}>
                  {/* SD sectionsV2[].iconUrl (28) → kit glyph */}
                  <span className={styles.igIcon}>
                    <Icon name={guideIcons[i % guideIcons.length]} size={16} />
                  </span>
                  <span className={styles.igText}>{t}</span>
                </div>
              ))}
            </div>
          </div>
          <AFSButton size="md" variant="inverted" title={copy.photoGuideCta} onPress={close} />
        </div>
      )}
    </ReturnsOverlay>
  );
}

/** screens/AFSReturnsEvidenceSkipOverlayScreen — mandatory note before skipping photos */
export function EvidenceSkipOverlay({ open, onClosed, note: initial, onConfirm }: OverlayProps & { note: string; onConfirm: (note: string) => void }) {
  const [note, setNote] = useState(initial);
  useEffect(() => setNote(initial), [initial, open]);
  const { minLength, maxLength, title } = evidenceConfig.comment;
  const valid = validateNote(note, { mandatory: true, minLength, maxLength }).isTextValid;
  return (
    <ReturnsOverlay open={open} onClosed={onClosed} cardClassName={styles.cardWhite} contentClassName={styles.skContent}>
      {(close) => (
        <div className={styles.sk}>
          <Svg src={icons.note} size={50} />
          <div className={styles.skHeaderText}>
            <span className={styles.skTitle}>{copy.skipTitle}</span>
            <span className={styles.skDesc}>{copy.skipDesc}</span>
          </div>
          <div className={styles.skFull}>
            <CommentInput note={note} placeholder={title} minLength={minLength} maxLength={maxLength} mandatory onChange={setNote} />
          </div>
          <AFSButton
            size="md"
            variant="inverted"
            style={{ minHeight: 52 }}
            title={copy.skipConfirm}
            disabled={!valid}
            onPress={() => {
              onConfirm(note.trim());
              close();
            }}
          />
        </div>
      )}
    </ReturnsOverlay>
  );
}

/** screens/AFSReturnsPickupAddressOverlayScreen + components/AFSReturnsAddressItem */
export function PickupAddressOverlay({ open, onClosed, selected, onConfirm }: OverlayProps & { selected: string; onConfirm: (code: string) => void }) {
  const [current, setCurrent] = useState(selected);
  useEffect(() => setCurrent(selected), [selected, open]);
  return (
    <ReturnsOverlay open={open} onClosed={onClosed} contentClassName={styles.paContent}>
      {(close) => (
        <div className={styles.pa}>
          <div className={styles.paList}>
            {addresses.map((a) => {
              const on = a.code === current;
              return (
                <Tap key={a.code} className={[styles.paItem, on && styles.paItemOn].filter(Boolean).join(' ')} onPress={() => setCurrent(a.code)}>
                  <span className={[styles.paHeader, on && styles.paHeaderOn].filter(Boolean).join(' ')}>
                    <span className={styles.paHeaderContent}>
                      <span className={[styles.paIconBox, on && styles.paIconBoxOn].filter(Boolean).join(' ')}>
                        <Svg src={on ? icons.addressSelected : icons.addressUnselected} size={20} />
                      </span>
                      <span className={styles.paLabel}>{a.label || copy.unnamedAddress}</span>
                      {a.distance && <span className={[styles.paDistance, on && styles.paDistanceOn].filter(Boolean).join(' ')}>{a.distance}</span>}
                    </span>
                    <Svg src={on ? icons.radioChecked2 : icons.radioUnchecked2} size={20} />
                  </span>
                  <span className={styles.paDetails}>
                    <span className={styles.paArea}>{a.area}</span>
                    <Dashed />
                    <span className={styles.paCustomer}>
                      <span>{`${user.firstName} ${user.lastName},`}</span>
                      <span dir="ltr">{a.phone}</span>
                      {a.verified && <Svg src={icons.verifiedGreen} size={14} />}
                    </span>
                  </span>
                </Tap>
              );
            })}
          </div>
          <AFSButton
            size="lg"
            variant="inverted"
            title={copy.confirm}
            onPress={() => {
              onConfirm(current);
              close();
            }}
          />
        </div>
      )}
    </ReturnsOverlay>
  );
}
