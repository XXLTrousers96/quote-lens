import { Illustration, IllustrationRow } from './illustration-types';
import { categorizeIllustration } from './categorize';

/**
 * Strips formatting (quotes, $, %, commas) and converts string to float number.
 */
function cleanNumber(val: string | undefined): number {
  if (!val) return 0;
  let str = val.trim().replace(/^"|"$/g, '');
  const isPercent = str.includes('%');
  str = str.replace(/[$,%]/g, '').trim();
  const num = parseFloat(str);
  if (isNaN(num)) return 0;
  return isPercent ? num / 100 : num;
}

/**
 * Parses raw CSV string into an Illustration object.
 */
export function parseCsvText(rawText: string, fileName: string): Illustration {
  // Remove UTF-8 BOM if present
  let text = rawText;
  if (text.charCodeAt(0) === 0xfeff) {
    text = text.slice(1);
  }

  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);

  if (lines.length < 2) {
    throw new Error(`File "${fileName}" does not contain header and data rows.`);
  }

  // Parse header line to map indices (case-insensitive & clean quotes)
  const headerLine = lines[0];
  const headers = headerLine.split(',').map((h) => h.trim().replace(/^"|"$/g, '').toLowerCase());

  // Expected column index mapping with defaults
  const findIdx = (candidates: string[], defaultIdx: number): number => {
    for (const cand of candidates) {
      const idx = headers.findIndex((h) => h === cand || h.includes(cand));
      if (idx !== -1) return idx;
    }
    return defaultIdx;
  };

  const yearIdx = findIdx(['year'], 0);
  const ageIdx = findIdx(['age'], 1);
  const totalPaymentIdx = findIdx(['total payment', 'payment', 'premium'], 2);
  const afterTaxIdx = findIdx(['after tax outlay', 'after tax', 'outlay'], 3);
  const accountValIdx = findIdx(['account value', 'account val'], 4);
  const surrenderValIdx = findIdx(['surrender value', 'surrender val'], 5);
  const deathBenefitIdx = findIdx(['death benefit', 'face amount'], 6);
  const fixedRateIdx = findIdx(['fixed interest rate', 'fixed rate'], 7);
  const indexedRateIdx = findIdx(['indexed interest rate', 'indexed rate'], 8);

  const rows: IllustrationRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    const parts = line.split(',');

    // Skip empty lines or footer summary lines
    if (parts.length < 2) continue;

    const row: IllustrationRow = {
      year: Math.round(cleanNumber(parts[yearIdx])),
      age: Math.round(cleanNumber(parts[ageIdx])),
      totalPayment: cleanNumber(parts[totalPaymentIdx]),
      afterTaxOutlay: cleanNumber(parts[afterTaxIdx]),
      accountValue: cleanNumber(parts[accountValIdx]),
      surrenderValue: cleanNumber(parts[surrenderValIdx]),
      deathBenefit: cleanNumber(parts[deathBenefitIdx]),
      fixedInterestRate: cleanNumber(parts[fixedRateIdx]),
      indexedInterestRate: cleanNumber(parts[indexedRateIdx]),
    };

    // Valid row must have year > 0 and age > 0
    if (row.year > 0 && row.age > 0) {
      rows.push(row);
    }
  }

  if (rows.length === 0) {
    throw new Error(`File "${fileName}" contained no valid numeric illustration data rows.`);
  }

  // Sort rows by Year ascending
  rows.sort((a, b) => a.year - b.year);

  const meta = categorizeIllustration(fileName, rows);
  const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  return {
    id,
    fileName,
    carrier: meta.carrier,
    product: meta.product,
    payPeriodLabel: meta.payPeriodLabel,
    issueAge: meta.issueAge,
    faceAmount: meta.faceAmount,
    annualPremium: meta.annualPremium,
    totalPremium: meta.totalPremium,
    rows,
  };
}
