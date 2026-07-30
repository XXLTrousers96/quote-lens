import { IllustrationRow } from './illustration-types';

export interface CategorizedMetadata {
  carrier: string;
  product: string;
  payPeriodLabel: string;
  issueAge: number;
  faceAmount: number;
  annualPremium: number;
  totalPremium: number;
}

/**
 * Cleans filename by stripping extension, date markers (e.g. - 021323), and duplicate markers (e.g. (1), (2)).
 */
export function cleanFileName(fileName: string): string {
  let name = fileName.replace(/\.csv$/i, '').trim();
  // Strip duplicate suffixes like (1), (2), (3)
  name = name.replace(/\s*\(\d+\)\s*$/g, '').trim();
  // Strip trailing date markers like - 021323 or - 2023-02-13
  name = name.replace(/[-_\s]+\d{6,8}\s*$/g, '').trim();
  return name;
}

/**
 * Derives carrier, product name, pay period label, issue age, face amount, and total premium from raw illustration rows and filename.
 */
export function categorizeIllustration(
  fileName: string,
  rows: IllustrationRow[]
): CategorizedMetadata {
  const cleaned = cleanFileName(fileName);
  const words = cleaned.split(/\s+/);
  const carrier = words[0] || 'Unknown';
  const product = words.slice(1).join(' ') || cleaned;

  const issueAge = rows.length > 0 ? rows[0].age : 0;
  const faceAmount = rows.length > 0 ? rows[0].deathBenefit : 0;
  const annualPremium = rows.length > 0 ? rows[0].totalPayment : 0;
  
  let totalPremium = 0;
  for (const r of rows) {
    totalPremium += r.totalPayment;
  }

  // Count consecutive payment years starting from Year 1
  let consecutivePaymentYears = 0;
  for (const r of rows) {
    if (r.totalPayment > 0) {
      consecutivePaymentYears++;
    } else {
      break;
    }
  }

  let payPeriodLabel = '';
  if (consecutivePaymentYears === 1) {
    payPeriodLabel = 'Single Pay';
  } else if (consecutivePaymentYears > 1 && consecutivePaymentYears <= 99) {
    const lastPaymentRow = rows[consecutivePaymentYears - 1];
    if (lastPaymentRow && lastPaymentRow.age >= 100) {
      payPeriodLabel = 'Full Pay';
    } else {
      payPeriodLabel = `${consecutivePaymentYears} Pay`;
    }
  } else if (consecutivePaymentYears > 99) {
    payPeriodLabel = 'Full Pay';
  } else {
    payPeriodLabel = '0 Pay';
  }

  return {
    carrier,
    product,
    payPeriodLabel,
    issueAge,
    faceAmount,
    annualPremium,
    totalPremium,
  };
}
