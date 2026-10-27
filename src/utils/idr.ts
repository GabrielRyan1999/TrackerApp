const idrFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

/**
 * Formats integer amount into standard Indonesian Rupiah format: "Rp 8.500.000"
 */
export function formatIDR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return 'Rp 0';
  }
  return idrFormatter.format(Math.round(amount));
}

/**
 * Formats large amounts into compact representation for tight spaces like gauge center or chips:
 * e.g., 8500000 -> "Rp 8,5 jt", 450000 -> "Rp 450 rb"
 */
export function formatCompactIDR(amount: number): string {
  if (!amount || isNaN(amount)) return 'Rp 0';
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (abs >= 1_000_000_000) {
    const val = (abs / 1_000_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 });
    return `${sign}Rp ${val} M`;
  }
  if (abs >= 1_000_000) {
    const val = (abs / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 });
    return `${sign}Rp ${val} jt`;
  }
  if (abs >= 1_000) {
    const val = (abs / 1_000).toLocaleString('id-ID', { maximumFractionDigits: 0 });
    return `${sign}Rp ${val} rb`;
  }
  return `${sign}Rp ${abs}`;
}

/**
 * Parses user input strings like "8,5jt", "8.5jt", "500rb", "50k", "8.500.000", "8500000"
 * into clean integer rupiah.
 */
export function parseIDR(input: string): number {
  if (!input) return 0;
  
  // Clean whitespace and "rp" prefix
  const s = input.trim().toLowerCase().replace(/^rp\.?\s*/i, '').replace(/\s+/g, '');
  if (!s) return 0;

  // Pattern matches:
  // Group 1: numerical part (e.g. "8,5", "8.5", "500", "8.500.000")
  // Group 2: unit ("jt", "juta", "rb", "ribu", "k", "m")
  const m = s.match(/^([\d.,]+)(jt|juta|rb|ribu|k|m)?$/);
  if (!m) {
    // Fallback: extract all digits
    const digitsOnly = s.replace(/\D/g, '');
    const num = parseInt(digitsOnly, 10);
    return isNaN(num) ? 0 : num;
  }

  const numPart = m[1];
  const unit = m[2];

  if (unit) {
    // When there's a unit, dots and commas could be decimal separators
    // e.g. "8.5jt" or "8,5jt" both mean 8.5 million
    // If multiple dots exist (e.g. 1.500rb), strip thousands dots
    let normalized = numPart;
    if ((numPart.match(/\./g) || []).length > 1) {
      normalized = numPart.replace(/\./g, '');
    } else {
      normalized = numPart.replace(',', '.');
    }

    const n = parseFloat(normalized);
    if (isNaN(n)) return 0;

    let mult = 1;
    if (unit === 'jt' || unit === 'juta') mult = 1_000_000;
    else if (unit === 'rb' || unit === 'ribu' || unit === 'k') mult = 1_000;
    else if (unit === 'm') mult = 1_000_000_000;

    return Math.round(n * mult);
  }

  // Without unit, dot is thousand separator in id-ID (e.g. "8.500.000")
  // Comma is decimal separator if any, but IDR has no decimals
  const clean = numPart.replace(/\./g, '').replace(/,/g, '.');
  const n = Math.round(parseFloat(clean));
  return isNaN(n) ? 0 : n;
}
