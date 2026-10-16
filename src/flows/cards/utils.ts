import { t, type BrandId } from './data';

/** utils/PaymentCardDataFormatter.formatMasked — '411111******1111' → '****1111' */
export const formatMasked = (ccMasked: string) => ccMasked.substring(8);

/** PaymentCardDataFormatter.formatAdditionDate — Intl { year: '2-digit', month: '2-digit' } */
export const formatAdditionDate = (iso?: string) => (iso ? new Intl.DateTimeFormat('en-AE', { year: '2-digit', month: '2-digit' }).format(new Date(iso)) : '');

/** PaymentCardDataFormatter.formatIssuerName — title-cases every word */
export const formatIssuerName = (name: string) => name.trim().replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

/* ── utils/CardTypeUtils.ts ─────────────────────────────────────────────── */

const MADA_BINS = [
  '406127', '410685', '417633', '422817', '422818', '422819', '428331', '440533', '440647', '446393', '446471', '446672', '455036', '455708', '457865',
  '457997', '474491', '483010', '483011', '483012', '484783', '486094', '486095', '486096', '489317', '489318', '489319', '493428', '504300', '506968',
  '508160', '513213', '520058', '521076', '524130', '524514', '529415', '529741', '530060', '530906', '531095', '532013', '535825', '535989', '536023',
  '537767', '539931', '543085', '543357', '549760', '554180', '557606', '558848', '585263', '588845', '588846', '588847', '588848', '588849', '588850',
  '588982', '588983', '589005', '589206', '604906', '605141', '636120', '968201', '968202', '968203', '968204', '968205', '968206', '968207', '968208',
  '968209', '968210', '968211',
];
const MADA_REGEX = new RegExp(`^(${MADA_BINS.join('|')})`);

/** card-validator's prefix patterns (partial input friendly), mapped like TYPE_MAPPING. */
const NETWORKS: { id: BrandId; test: RegExp; lengths: number[]; cvv: number }[] = [
  { id: 'visa', test: /^4/, lengths: [16, 18, 19], cvv: 3 },
  { id: 'mastercard', test: /^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[01]|2720)/, lengths: [16], cvv: 3 },
  { id: 'amex', test: /^3[47]/, lengths: [15], cvv: 4 },
  { id: 'diners_club', test: /^3(0[0-5]?|[689])/, lengths: [14, 16, 19], cvv: 3 },
  { id: 'discover', test: /^6(011|5|4[4-9])/, lengths: [16, 19], cvv: 3 },
  { id: 'jcp', test: /^35/, lengths: [16, 17, 18, 19], cvv: 3 },
  { id: 'union_pay', test: /^62/, lengths: [14, 15, 16, 17, 18, 19], cvv: 3 },
];

const digits = (s: string) => s.replace(/\D/g, '');

function network(cardNumber: string) {
  const n = digits(cardNumber);
  if (!n) return undefined;
  return NETWORKS.find((x) => x.test.test(n));
}

export function getTypeFromNumber(cardNumber: string): BrandId | null {
  const n = digits(cardNumber);
  if (!n) return null;
  if (MADA_REGEX.test(n)) return n.startsWith('4') ? 'mada_visa' : 'mada_mastercard';
  return network(n)?.id ?? null;
}

/** ccType the API would return for a new card */
export function ccTypeFromNumber(cardNumber: string): string {
  const type = getTypeFromNumber(cardNumber);
  if (type === 'mada_visa' || type === 'mada_mastercard') return 'MADA';
  return (type ?? 'visa').toUpperCase();
}

/* ── utils/PaymentValidation.ts ─────────────────────────────────────────── */

function luhn(n: string) {
  let sum = 0;
  for (let i = 0; i < n.length; i++) {
    let d = Number(n[n.length - 1 - i]);
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
}

export function getCardNumberError(cardNumber: string) {
  if (!cardNumber.trim()) return '';
  const n = digits(cardNumber);
  const net = network(n);
  const valid = !!net && net.lengths.includes(n.length) && luhn(n);
  return valid ? '' : t.invalidCard;
}

export function isValidExpiryDate(expiry: string) {
  const m = /^(0[1-9]|1[0-2])\/([0-9]{4}|[0-9]{2})$/.exec(expiry);
  if (!m) return false;
  const year = m[2].length === 2 ? 2000 + Number(m[2]) : Number(m[2]);
  const firstOfNextMonth = new Date(year, Number(m[1]), 1); // dayjs('01/MM/YY').add(1, 'M')
  return firstOfNextMonth.getTime() > Date.now();
}

export function getExpiryDateError(expiry: string) {
  if (!expiry.trim()) return '';
  return isValidExpiryDate(expiry) ? '' : t.invalidExpiry;
}

export function getCVVError(cvv: string, cardNumber: string) {
  if (!cvv.trim()) return '';
  const size = network(cardNumber)?.cvv;
  const ok = /^\d+$/.test(cvv) && (size ? cvv.length === size : cvv.length === 3 || cvv.length === 4);
  return ok ? '' : t.invalidCvv;
}

/** PaymentValidation.isAlphanumericWithSpaces / getNicknameError */
export function getNicknameError(nickname: string) {
  return /^[a-zA-Z\p{Script=Arabic}0-9 ]*$/u.test(nickname) ? '' : t.noSpecialChars;
}

/* ── src/utils/FormUtils (normalizers used by PaymentCardFormV2) ─────────── */

/** FormUtils.normalizeCardNumber(4, ' ', current, next) — digits only, a space every 4. */
export function normalizeCardNumber(next: string) {
  return digits(next)
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, '$1 ');
}

/** FormUtils.addCharacterAtPositions(2, '/', current, next) — MM/YY, removes the slash on backspace. */
export function normalizeExpiry(current: string, next: string) {
  const d = digits(next).slice(0, 4);
  const deleting = next.length < current.length;
  if (d.length < 2 || (deleting && d.length === 2 && current.endsWith('/'))) return d;
  return `${d.slice(0, 2)}/${d.slice(2)}`;
}
