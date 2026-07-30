import { Illustration } from '../lib/illustration-types';

export interface MilestoneRowCalculated {
  year: number;
  age: number;
  surrenderValue: number;
  accountValue: number;
  taxDeferredGains: number;
  hasWarning: boolean;
  actualYearUsed: number;
}

export interface CashValueGainsCalculatedData {
  illustrationId: string;
  illustrationName: string;
  annualPremium: number;
  paymentYearsCount: number;
  totalPremiumPaid: number;
  headerTitle: string;
  milestoneRows: MilestoneRowCalculated[];
}

export function computeCashValueGains(
  illustration: Illustration,
  milestoneYears: number[] = [10, 20, 30],
  customHeaderTitle?: string
): CashValueGainsCalculatedData {
  const { rows, annualPremium, totalPremium, product, payPeriodLabel, customDisplayName } = illustration;

  // Count payment years
  let paymentYearsCount = 0;
  for (const r of rows) {
    if (r.totalPayment > 0) {
      paymentYearsCount++;
    } else {
      break;
    }
  }

  // Determine interest rate label from first row if available
  let defaultInterestRateLabel = 'Cash Value Net';
  if (rows.length > 0 && rows[0].indexedInterestRate > 0) {
    const ratePct = (rows[0].indexedInterestRate * 100).toFixed(2).replace(/\.00$/, '');
    defaultInterestRateLabel = `Cash Value @${ratePct}% Net`;
  }

  const headerTitle = customHeaderTitle && customHeaderTitle.trim().length > 0
    ? customHeaderTitle.trim()
    : defaultInterestRateLabel;

  const milestoneRows: MilestoneRowCalculated[] = [];

  milestoneYears.forEach((targetYear) => {
    let exactRow = rows.find((r) => r.year === targetYear);
    let hasWarning = false;
    let actualYearUsed = targetYear;
    let surrenderVal = 0;
    let accountVal = 0;
    let age = 0;

    if (exactRow) {
      surrenderVal = exactRow.surrenderValue;
      accountVal = exactRow.accountValue;
      actualYearUsed = exactRow.year;
      age = exactRow.age;
    } else {
      // Find closest row
      const precedingRows = rows.filter((r) => r.year <= targetYear);
      if (precedingRows.length > 0) {
        const closest = precedingRows[precedingRows.length - 1];
        surrenderVal = closest.surrenderValue;
        accountVal = closest.accountValue;
        actualYearUsed = closest.year;
        age = closest.age;
        hasWarning = true;
      } else if (rows.length > 0) {
        surrenderVal = rows[0].surrenderValue;
        accountVal = rows[0].accountValue;
        actualYearUsed = rows[0].year;
        age = rows[0].age;
        hasWarning = true;
      }
    }

    const taxDeferredGains = surrenderVal - totalPremium;

    milestoneRows.push({
      year: targetYear,
      age,
      surrenderValue: surrenderVal,
      accountValue: accountVal,
      taxDeferredGains,
      hasWarning,
      actualYearUsed,
    });
  });

  const illustrationName = customDisplayName && customDisplayName.trim().length > 0
    ? customDisplayName.trim()
    : `${product} — ${payPeriodLabel}`;

  return {
    illustrationId: illustration.id,
    illustrationName,
    annualPremium,
    paymentYearsCount,
    totalPremiumPaid: totalPremium,
    headerTitle,
    milestoneRows,
  };
}
