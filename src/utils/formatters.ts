import { format, parseISO, isValid } from 'date-fns';

/**
 * Format a number as Indian Currency (₹)
 * Example: 4250000 -> ₹42,50,000
 */
export function formatCurrency(amount: number | string | undefined | null, showSymbol = true): string {
  if (amount === undefined || amount === null || amount === '') {
    return showSymbol ? '₹0' : '0';
  }

  const parsed = typeof amount === 'string' ? parseFloat(amount.toString().replace(/[^0-9.-]+/g, '')) : amount;
  if (typeof parsed !== 'number' || isNaN(parsed)) {
    return showSymbol ? '₹0' : '0';
  }

  const isNegative = parsed < 0;
  const absAmount = Math.abs(Math.round(parsed));

  // Indian Numbering System formatting
  const str = absAmount.toString();
  let lastThree = str.substring(str.length - 3);
  const otherNumbers = str.substring(0, str.length - 3);
  
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  
  const formatted = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
  const prefix = isNegative ? '-' : '';
  const symbol = showSymbol ? '₹' : '';

  return `${prefix}${symbol}${formatted}`;
}

/**
 * Compact currency for charts and KPI cards (e.g. ₹42.5 L or ₹1.2 Cr)
 */
export function formatCompactCurrency(amount: number): string {
  if (!amount || isNaN(amount)) return '₹0';
  const abs = Math.abs(amount);
  if (abs >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (abs >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`;
  }
  if (abs >= 1000) {
    return `₹${(amount / 1000).toFixed(1)} K`;
  }
  return formatCurrency(amount);
}

/**
 * Format a date string
 */
export function formatDate(dateStr: string | undefined | null, formatStr = 'dd MMM yyyy'): string {
  if (!dateStr) return '—';
  try {
    const date = typeof dateStr === 'string' ? parseISO(dateStr) : new Date(dateStr);
    if (!isValid(date)) return dateStr;
    return format(date, formatStr);
  } catch {
    return dateStr || '—';
  }
}

/**
 * Format date time
 */
export function formatDateTime(dateStr: string | undefined | null): string {
  return formatDate(dateStr, 'dd MMM yyyy, hh:mm a');
}

/**
 * Convert number into Words in Indian Rupees format for official receipts
 * e.g. 52400 -> "Fifty Two Thousand Four Hundred Rupees Only"
 */
export function numberToWordsRupees(num: number): string {
  if (!num || isNaN(num) || num === 0) return 'Zero Rupees Only';

  const a = [
    '', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ',
    'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(n: number): string {
    if ((n = Math.floor(n)) === 0) return '';
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : ' ');
    if (n < 1000) return inWords(Math.floor(n / 100)) + 'Hundred ' + (n % 100 !== 0 ? inWords(n % 100) : '');
    if (n < 100000) return inWords(Math.floor(n / 1000)) + 'Thousand ' + (n % 1000 !== 0 ? inWords(n % 1000) : '');
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + 'Lakh ' + (n % 100000 !== 0 ? inWords(n % 100000) : '');
    return inWords(Math.floor(n / 10000000)) + 'Crore ' + (n % 10000000 !== 0 ? inWords(n % 10000000) : '');
  }

  const result = inWords(Math.round(num)).trim();
  return `${result} Rupees Only`;
}

/**
 * Generate unique IDs for entities
 */
export function generateId(prefix: 'MB' | 'INV' | 'LN' | 'PAY' | 'TXN' | 'DOC' | 'NOTIF' | 'PLAN' | 'LOG' | 'RCPT'): string {
  const timestamp = Date.now().toString().slice(-4);
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${timestamp}${randomNum}`.slice(0, 10);
}
