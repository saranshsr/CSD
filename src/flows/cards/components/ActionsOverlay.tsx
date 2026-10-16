import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { cardsIcons, t, type SavedCard } from '../data';
import { cardsEasing, cardsMetrics, cardsTimings } from '../tokens';
import { formatAdditionDate, formatIssuerName, formatMasked, getNicknameError } from '../utils';
import { PaymentButtonV2 } from './primitives';
import s from './components.module.css';

export type EditAction = 'EDIT_CARD_NICKNAME' | 'SET_AS_DEFAULT_CARD' | 'DELETE_CARD';

const ms = (n: number) => n / 1000;
/** PaymentCardActionsScreen getOverlayMovement() = window height × 0.5 (kit device 844) */
const OVERLAY_MOVEMENT = 844 * 0.5;

/** components/PaymentCardActionButton — 24pt icon over a 12pt label in a hairline tile. */
function ActionButton({ icon, title, onPress }: { icon: string; title: string; onPress: () => void }) {
  return (
    <motion.button type="button" className={s.actionBtn} whileTap={{ scale: 0.96 }} transition={{ duration: 0 }} onClick={onPress}>
      <img src={icon} width={24} height={24} alt="" />
      <span className={s.actionBtnText}>{title}</span>
    </motion.button>
  );
}

/** components/PaymentActionConfirmation — title + description drop in from the top, buttons rise from the bottom. */
function ActionConfirmation({ title, description, actionText, dangerous, onConfirm, onDismiss }: { title: string; description: string; actionText: string; dangerous?: boolean; onConfirm: () => void; onDismiss: () => void }) {
  const enter = { duration: ms(cardsTimings.actions + 20), delay: 0.04, times: [0, 0.5, 1] };
  const exit = { duration: ms(cardsTimings.actions) };
  return (
    <div className={s.confirm}>
      <motion.div className={s.confirmText} initial={{ y: -100 }} animate={{ y: [-100, 2, 0], transition: enter }} exit={{ y: -100, transition: exit }}>
        <span className={s.confirmTitle}>{title}</span>
        <span className={s.confirmDescription}>{description}</span>
      </motion.div>
      <motion.div className={s.confirmActions} initial={{ y: 60 }} animate={{ y: [60, -2, 0], transition: enter }} exit={{ y: 60, transition: exit }}>
        <PaymentButtonV2 className={s.flex1} title={t.cancel} onPress={onDismiss} variant="outline" size="sm" />
        <PaymentButtonV2 className={s.flex1} title={actionText} onPress={onConfirm} variant={dangerous ? 'danger' : 'primary'} size="sm" data-testid="confirm-action" />
      </motion.div>
    </div>
  );
}

/** components/PaymentEditNickname — centred bold input + "Update name" (validateOnMount / validateOnChange). */
function EditNickname({ initialNickname, onConfirm, onDismiss }: { initialNickname: string; onConfirm: (n: string) => void; onDismiss: () => void }) {
  const [value, setValue] = useState(initialNickname ?? '');
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const id = setTimeout(() => ref.current?.focus(), 60);
    return () => clearTimeout(id);
  }, []);
  // validateNickname.ts — an emptied existing nickname is invalid (empty message), special characters show the error
  const message = getNicknameError(value);
  const isValid = !((initialNickname && !value.trim()) || message);
  const submit = () => {
    const next = value.trim();
    if (initialNickname === next || !next) return onDismiss();
    onConfirm(next);
  };
  return (
    <motion.div className={s.nickname} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: ms(cardsTimings.actions) }}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (isValid) submit();
        }}
      >
        <input ref={ref} className={s.nicknameInput} value={value} maxLength={50} onChange={(e) => setValue(e.target.value)} aria-label={t.editName} />
        {!isValid && !!message && <div className={s.nicknameError}>{message}</div>}
        <PaymentButtonV2 style={isValid || !message ? { marginTop: -10 } : undefined} title={t.updateName} onPress={submit} disabled={!isValid} />
      </form>
    </motion.div>
  );
}

/**
 * screens/PaymentCardActionsScreen (shown with navigator.showOverlay over the list) + hooks/usePaymentEditActions.
 * The floating white panel slides up once the selected card has flown to its resting spot.
 */
export function CardActionsOverlay({
  card,
  open,
  onRequestClose,
  onClosed,
  onSetDefault,
  onDelete,
  onRename,
  initialAction = null,
}: {
  card: SavedCard;
  open: boolean;
  onRequestClose: () => void;
  onClosed: () => void;
  onSetDefault: (card: SavedCard) => void;
  onDelete: (card: SavedCard) => void;
  onRename: (card: SavedCard, nickname: string) => void;
  initialAction?: EditAction | null;
}) {
  const [action, setAction] = useState<EditAction | null>(initialAction);
  const [selected, setSelected] = useState(card);
  const masked = formatMasked(selected.ccMasked);
  const nicknamePlaceholder = selected.nickname || (selected.cardIssuerName ? formatIssuerName(selected.cardIssuerName) : '');
  const title = nicknamePlaceholder || masked;
  const added = selected.lastAddedAt ? formatAdditionDate(selected.lastAddedAt) : '';
  const info = nicknamePlaceholder ? `${masked}${added ? `  •  ${t.addedOn(added)}` : ''}` : t.addedOn(added);

  const onBackground = () => (action ? setAction(null) : onRequestClose());

  const panelHeight = action === 'EDIT_CARD_NICKNAME' ? cardsMetrics.editNicknameOverlayHeight : cardsMetrics.actionsOverlayHeight;

  return (
    <div className={s.actionsRoot} style={{ pointerEvents: open ? 'auto' : 'none' }} onClick={onBackground}>
      <motion.div
        className={s.actionsPanel}
        style={{ bottom: cardsMetrics.overlayBottomSpacing }}
        initial={{ y: OVERLAY_MOVEMENT, height: cardsMetrics.actionsOverlayHeight }}
        animate={{
          y: open ? 0 : OVERLAY_MOVEMENT,
          height: panelHeight,
          transition: {
            y: { delay: open ? ms(cardsTimings.firstRound + cardsTimings.waitBetweenRounds) : 0, duration: ms(cardsTimings.secondRound), ease: cardsEasing.outQuad },
            height: { duration: ms(cardsTimings.actions), ease: cardsEasing.outQuad },
          },
        }}
        onAnimationComplete={() => {
          if (!open) onClosed();
        }}
        onClick={(e) => e.stopPropagation()}
        data-testid="card-actions"
      >
        <AnimatePresence initial={false}>
          {action === null && (
            <motion.div
              key="main"
              className={s.actionsMain}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: [0, 0.7, 1], scale: [0.9, 1.01, 1], transition: { delay: 0.05, duration: ms(cardsTimings.actions + 10), times: [0, 0.5, 1] } }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: ms(cardsTimings.actions) } }}
            >
              <span className={s.actionsTitle}>{title}</span>
              <span className={s.actionsInfo}>{info}</span>
              <div className={s.actionsRow}>
                <ActionButton icon={cardsIcons.edit.src} title={selected.nickname ? t.editName : t.addName} onPress={() => setAction('EDIT_CARD_NICKNAME')} />
                {!selected.isDefault && <ActionButton icon={cardsIcons.check.src} title={t.setAsDefault} onPress={() => setAction('SET_AS_DEFAULT_CARD')} />}
                <ActionButton icon={cardsIcons.trash.src} title={t.deleteCard} onPress={() => setAction('DELETE_CARD')} />
              </div>
            </motion.div>
          )}
          {action === 'EDIT_CARD_NICKNAME' && (
            <EditNickname
              key="nickname"
              initialNickname={selected.nickname}
              onConfirm={(n) => {
                setSelected((c) => ({ ...c, nickname: n }));
                onRename(selected, n);
                setAction(null);
              }}
              onDismiss={() => setAction(null)}
            />
          )}
          {action === 'SET_AS_DEFAULT_CARD' && (
            <motion.div key="default" className={s.actionsLayer}>
              <ActionConfirmation
                title={t.setAsDefaultTitle(masked)}
                description={t.setAsDefaultDescription}
                actionText={t.setAsDefault}
                onConfirm={() => {
                  setAction(null);
                  onSetDefault(selected);
                }}
                onDismiss={() => setAction(null)}
              />
            </motion.div>
          )}
          {action === 'DELETE_CARD' && (
            <motion.div key="delete" className={s.actionsLayer}>
              <ActionConfirmation
                title={t.deleteCardTitle(masked)}
                description={t.deleteCardDescription}
                actionText={t.yesDelete}
                dangerous
                onConfirm={() => {
                  setAction(null);
                  onDelete(selected);
                }}
                onDismiss={() => setAction(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
