import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { easing, fieldMotion, handoff } from '../../motion/presets';
import { Pressable } from '../Pressable/Pressable';
import { OriginIcon } from '../Icon/OriginIcon';
import searchIcon from '@assets/icons/noon-search-bar.webp';
import cameraIcon from '@assets/icons/noon-search-bar-camera.webp';
// bappzaar NoonThemeManager.icons.back() / ThemeManager.icons.clearInput() (@3x)
import backIcon from '@assets/shared/search-bar/back.webp';
import clearIcon from '@assets/shared/search-bar/clear-input.webp';
import { field, searchBar as t } from '../../foundations/tokens';
import styles from './SearchBar.module.css';

/**
 * Home search pill (NoonSearchBarButton): 52h, r12, 1px #D7DAE3, 20px search-bar.webp, 24px search-bar-camera.webp.
 * `rotatingWords` reproduces the "Search <word>" vertical ticker (30px rows, ease-out-back); `rotatingPrefix` changes "Search".
 *
 * `variant="2025"` (opt-in, Homepage Revamp 2025, Figma iRE9RwO94eMAyW3j3XKNXW · 1337:6727): lighter 1px gray400 border,
 * 15/18 Medium placeholder in textProduct, 18 search icon 4 from the text, 12 gaps to a 24 divider and a 20 camera.
 * Pass the Figma artwork through `icons` (search / camera / divider); defaults are unchanged.
 */
export function SearchBarButton({
  onPress,
  placeholder = 'What are you looking for?',
  rotatingWords,
  rotatingPrefix = 'Search',
  camera = true,
  height = t.height,
  variant = 'default',
  icons,
}: {
  onPress?: () => void;
  placeholder?: string;
  rotatingWords?: string[];
  rotatingPrefix?: string;
  camera?: boolean;
  height?: number;
  variant?: 'default' | '2025';
  icons?: { search?: string; camera?: string; divider?: string };
}) {
  const v2025 = variant === '2025';
  // NoonSearchBarButton: 20 × 20 search-bar.webp, 24 × 24 search-bar-camera.webp. The 2025 variant keeps those
  // sizes when it shows the bappzaar artwork; Figma artwork passed through `icons` renders at the Figma 18 / 20.
  const iconSize = v2025 && icons?.search ? 18 : t.iconSize;
  const cameraSize = v2025 && icons?.camera ? 20 : t.cameraSize;
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!rotatingWords?.length) return;
    const t = setInterval(() => setI((x) => (x + 1) % rotatingWords.length), 2200);
    return () => clearInterval(t);
  }, [rotatingWords]);

  return (
    <Pressable className={`${styles.bar}${v2025 ? ` ${styles.v2025}` : ''}`} style={{ height }} onClick={onPress} scale={t.pressScale}>
      <span className={styles.lead}>
      <img src={icons?.search ?? searchIcon} alt="" width={iconSize} height={iconSize} />
      <span className={styles.placeholder}>
        {rotatingWords?.length ? (
          <>
            {rotatingPrefix}&nbsp;
            <span className={styles.ticker}>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={i}
                  className={styles.word}
                  initial={{ y: t.tickerHeight, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -t.tickerHeight, opacity: 0 }}
                  transition={{ duration: 0.45, ease: easing.backOut }}
                >
                  {rotatingWords[i]}
                </motion.span>
              </AnimatePresence>
            </span>
          </>
        ) : (
          placeholder
        )}
      </span>
      </span>
      {camera && (
        <>
          {icons?.divider ? (
            <span className={styles.dividerArt}>
              <img src={icons.divider} alt="" width={24} height={1} />
            </span>
          ) : (
            <span className={styles.divider} />
          )}
          <img src={icons?.camera ?? cameraIcon} alt="" width={cameraSize} height={cameraSize} />
        </>
      )}
    </Pressable>
  );
}

/**
 * Editable search field (NoonSearchScreen): 52h, r12, 1px #DFDFDF, back icon inside.
 * `fill` plays the handoff "picked suggestion" fill: the text before `from` holds, the rest fades in on the
 * S-curve over 320ms (re-run it by changing `key`). `onFieldPress` makes the field a read-only button
 * (the PLP's search bar: tapping it goes back to editing) and keeps the camera instead of the clear (x).
 */
export interface SearchInputProps {
  value: string;
  onChange: (v: string) => void;
  onBack?: () => void;
  autoFocus?: boolean;
  placeholder?: string;
  right?: ReactNode;
  onSubmit?: (v: string) => void;
  onFieldPress?: () => void;
  fill?: { from: number; key: number };
  /** `field`: Field DS M-SearchBar look (opt-in); `default` (NoonSearchScreen) is unchanged */
  variant?: 'default' | 'field';
  /** field variant: `H48` (padding 12, 24 icons, B14 Medium, default) · `H44` (padding 10 / 12, 20 icons, B12 Medium) */
  fieldSize?: 'H48' | 'H44';
  /** field variant: Sm elevation shadow */
  elevation?: boolean;
  /** field variant: leading icon; default Origin `search` (or a back arrow with `onBack`); `null` removes it */
  iconLeft?: ReactNode | null;
  /** field variant: first trailing icon (default: `right`; the clear (x) replaces it while typing unless set) */
  iconRight?: ReactNode;
  /** field variant: second trailing icon, after a 1 × 24 borderSubtle divider */
  iconRightTwo?: ReactNode;
  /** default variant: keep the camera while typing (the live app) instead of swapping it for the clear (x) */
  keepCamera?: boolean;
}

/** the handoff "picked suggestion" fill, shared by both SearchInput looks */
function useFill(value: string, fill?: { from: number; key: number }) {
  const [filling, setFilling] = useState(false);
  useEffect(() => {
    if (!fill || fill.from >= value.length) return;
    setFilling(true);
    const t = setTimeout(() => setFilling(false), 400); // 320ms fade + a frame of slack (also when the tab is in the background)
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fill?.key]);
  return filling;
}

function FillCopy({ value, fill }: { value: string; fill: { from: number; key: number } }) {
  return (
    <span className={styles.fillCopy} aria-hidden>
      <span>{value.slice(0, fill.from)}</span>
      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.32, ease: handoff.easeInOut }}>
        {value.slice(fill.from)}
      </motion.span>
    </span>
  );
}

/**
 * Editable search field. Default: NoonSearchScreen (52h, r12, back icon inside). `variant="field"` (opt-in): Field DS
 * M-SearchBar (`@field-ds/components` SearchBar/SearchBar.tsx, Figma 892:244) — H48 (padding 12, 24px icons, B14
 * Medium) or H44 (padding 10 / 12, 20px icons, B12 Medium), surfacePrimary, 1px borderSubtle, r12, gap 8, optional Sm
 * `elevation`, Origin `search` icon (Field tertiary → primary once focused or typed), `iconRight` + `iconRightTwo`
 * after a 1 × 24 divider, auto clear (x) while typing, placeholder Field textPrimary at rest / textTertiary focused,
 * press scale .98 over 160ms. `fill`, `onFieldPress`, `onBack`, `onSubmit` work in both looks.
 */
export function SearchInput(props: SearchInputProps) {
  return props.variant === 'field' ? <FieldSearchInput {...props} /> : <KitSearchInput {...props} />;
}

function KitSearchInput({
  value,
  onChange,
  onBack,
  autoFocus,
  placeholder = 'What are you looking for?',
  right,
  onSubmit,
  onFieldPress,
  fill,
  keepCamera,
}: SearchInputProps) {
  const filling = useFill(value, fill);
  const showClear = !!value && !onFieldPress && !keepCamera;
  return (
    <div className={`${styles.bar} ${styles.input}`}>
      {onBack && (
        <Pressable onClick={onBack} aria-label="Back" style={{ display: 'flex' }}>
          {/* NoonSearchBarBackButton: back.webp at 20 × 20 */}
          <img src={backIcon} alt="" width={20} height={20} className={styles.flipRtl} />
        </Pressable>
      )}
      <span className={styles.fieldWrap}>
        <input
          className={styles.field}
          value={value}
          placeholder={placeholder}
          autoFocus={autoFocus}
          readOnly={!!onFieldPress}
          onClick={onFieldPress}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSubmit?.(value)}
          style={filling ? { color: 'transparent' } : undefined}
        />
        {filling && fill && <FillCopy value={value} fill={fill} />}
      </span>
      {showClear ? (
        <Pressable onClick={() => onChange('')} aria-label="Clear" style={{ display: 'flex' }}>
          {/* NoonSearchBar clearIcon: clear-input.webp at its 18 × 18 size */}
          <img src={clearIcon} alt="" width={18} height={18} />
        </Pressable>
      ) : (
        // NoonSearchBarImageSearchButton: search-bar-camera.webp at 24 × 24
        right ?? <img src={cameraIcon} alt="" width={24} height={24} />
      )}
    </div>
  );
}

function FieldSearchInput({
  value,
  onChange,
  onBack,
  autoFocus,
  placeholder = 'What are you looking for?',
  right,
  onSubmit,
  onFieldPress,
  fill,
  fieldSize = 'H48',
  elevation,
  iconLeft,
  iconRight,
  iconRightTwo,
}: SearchInputProps) {
  const filling = useFill(value, fill);
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  const icon = fieldSize === 'H44' ? 20 : 24;
  const active = focused || !!value;
  const lead =
    iconLeft === null ? null : iconLeft !== undefined ? (
      iconLeft
    ) : onBack ? (
      <Pressable onClick={onBack} aria-label="Back" style={{ display: 'flex' }}>
        <OriginIcon name="arrow-left" size={icon} color={field.textPrimary} className={styles.flipRtl} />
      </Pressable>
    ) : (
      <OriginIcon name="search" size={icon} color={active ? field.textPrimary : field.textTertiary} />
    );
  const showClear = iconRight === undefined && !!value && !onFieldPress;
  const trail = showClear ? (
    <Pressable
      onClick={() => {
        onChange('');
        inputRef.current?.focus();
      }}
      aria-label="Clear search"
      style={{ display: 'flex' }}
    >
      <OriginIcon name="cross" size={icon} color={field.textTertiary} />
    </Pressable>
  ) : (
    iconRight ?? right
  );
  const slot = { width: icon, height: icon };
  return (
    <motion.div
      className={`${styles.fieldBar}${elevation ? ` ${styles.fieldElevated}` : ''}`}
      data-size={fieldSize}
      data-focused={focused || undefined}
      whileTap={{ scale: fieldMotion.pressScale }}
      transition={{ duration: fieldMotion.duration.sm, ease: fieldMotion.ease.standard }}
      onClick={() => inputRef.current?.focus()}
    >
      {lead != null && (
        <span className={styles.fieldSlot} style={slot}>
          {lead}
        </span>
      )}
      <span className={styles.fieldWrap}>
        <input
          ref={inputRef}
          type="search"
          enterKeyHint="search"
          className={`${styles.field} ${styles.fieldInput}`}
          value={value}
          placeholder={placeholder}
          aria-label={placeholder}
          autoFocus={autoFocus}
          autoCapitalize="none"
          autoCorrect="off"
          readOnly={!!onFieldPress}
          onClick={onFieldPress}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSubmit?.(value)}
          style={filling ? { color: 'transparent' } : undefined}
        />
        {filling && fill && <FillCopy value={value} fill={fill} />}
      </span>
      {trail != null && (
        <span className={styles.fieldSlot} style={slot}>
          {trail}
        </span>
      )}
      {iconRightTwo != null && (
        <>
          <span className={styles.fieldDivider} />
          <span className={styles.fieldSlot} style={slot}>
            {iconRightTwo}
          </span>
        </>
      )}
    </motion.div>
  );
}
