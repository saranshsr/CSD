import type { CardType } from './data';
import { tp } from './data.payment';

/**
 * NoonCheckoutAddPaymentCardScreen/validate.ts → src/utils/Validation.ts (getCardNumberError / getExpiryDateError /
 * getCVVError / getNicknameError), with a small stand-in for the `card-validator` package (brand prefixes,
 * lengths, Luhn, CVV size).
 */
export interface AddCardValues {
  card: string;
  expiry: string;
  cvv: string;
  nickname: string;
  rememberCard: boolean;
}

interface Brand {
  type: CardType | 'DISCOVER' | 'JCB' | 'DINERS' | 'UNIONPAY' | 'MAESTRO';
  pattern: RegExp;
  lengths: number[];
  cvvSize: number;
}

const brands: Brand[] = [
  { type: 'VISA', pattern: /^4/, lengths: [16, 18, 19], cvvSize: 3 },
  { type: 'MASTERCARD', pattern: /^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[01]|2720)/, lengths: [16], cvvSize: 3 },
  { type: 'AMEX', pattern: /^3[47]/, lengths: [15], cvvSize: 4 },
  { type: 'DINERS', pattern: /^(30[0-5]|309|36|38|39)/, lengths: [14, 16, 19], cvvSize: 3 },
  { type: 'DISCOVER', pattern: /^(6011|64[4-9]|65)/, lengths: [16, 19], cvvSize: 3 },
  { type: 'JCB', pattern: /^(2131|1800|35)/, lengths: [16, 17, 18, 19], cvvSize: 3 },
  { type: 'UNIONPAY', pattern: /^(62|81)/, lengths: [14, 15, 16, 17, 18, 19], cvvSize: 3 },
  { type: 'MAESTRO', pattern: /^(5018|5020|5038|6304|6759|676[1-3])/, lengths: [12, 13, 14, 15, 16, 17, 18, 19], cvvSize: 3 },
];

export const digits = (v: string) => v.replace(/\D/g, '');
export const detectBrand = (number: string) => brands.find((b) => b.pattern.test(digits(number)));

function luhn(n: string) {
  let sum = 0;
  for (let i = 0; i < n.length; i++) {
    let d = Number(n[n.length - 1 - i]);
    if (i % 2) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
}

const empty = (v: string) => (!v.trim() ? tp.form_validation_required_field : '');

export function getCardNumberError(card: string) {
  const e = empty(card);
  if (e) return e;
  const n = digits(card);
  const brand = detectBrand(n);
  return brand && brand.lengths.includes(n.length) && luhn(n) ? '' : tp.form_validation_card_field;
}

export function getExpiryDateError(expiry: string) {
  const e = empty(expiry);
  if (e) return e;
  const m = /^(0[1-9]|1[0-2])\/([0-9]{4}|[0-9]{2})$/.exec(expiry);
  if (!m) return tp.form_validation_expiry_date_field;
  const year = m[2].length === 2 ? 2000 + Number(m[2]) : Number(m[2]);
  const end = new Date(year, Number(m[1]), 1); // first day of the following month
  return end > new Date() ? '' : tp.form_validation_expiry_date_field;
}

export function getCVVError(cvv: string, card: string) {
  const e = empty(cvv);
  if (e) return e;
  const size = detectBrand(card)?.cvvSize ?? 3;
  return new RegExp(`^\\d{${size}}$`).test(cvv) ? '' : tp.form_validation_cvv_field;
}

export function getNicknameError(nickname: string) {
  return /^[a-zA-Z\p{Script=Arabic}0-9 ]*$/u.test(nickname) ? '' : tp.no_special_characters_only_validation;
}

export function validate(values: AddCardValues) {
  const errors: Partial<Record<keyof AddCardValues, string>> = {};
  const card = getCardNumberError(values.card);
  if (card) errors.card = card;
  const expiry = getExpiryDateError(values.expiry);
  if (expiry) errors.expiry = expiry;
  const cvv = getCVVError(values.cvv, values.card);
  if (cvv) errors.cvv = cvv;
  const nickname = getNicknameError(values.nickname);
  if (nickname) errors.nickname = nickname;
  return errors;
}

/** FormUtils.normalizeCardNumber(4, ' ') */
export const normalizeCardNumber = (next: string) =>
  digits(next)
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, '$1 ');

/** FormUtils.addCharacterAtPositions(2, '/') — typing "08" → "08/", deleting the slash removes it */
export function normalizeExpiry(current: string, next: string) {
  const d = digits(next).slice(0, 4);
  if (next.length < current.length && current.endsWith('/') && !next.endsWith('/')) return d.slice(0, 1);
  if (d.length >= 2) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return d;
}
