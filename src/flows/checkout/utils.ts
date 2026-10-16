/** I18n.toCurrency(price, { precision: 2 }) — "1,447.00" */
export const formatAmount = (n: number, precision = 2) =>
  n.toLocaleString('en-US', { minimumFractionDigits: precision, maximumFractionDigits: precision });

/** getCVVErrorFromType: 4 digits for AMEX, else 3 */
export const isCvvValid = (cvv: string, cardType?: string) => /^\d+$/.test(cvv) && cvv.length === (cardType?.toUpperCase() === 'AMEX' ? 4 : 3);
