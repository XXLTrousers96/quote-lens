import { Illustration } from '../lib/illustration-types';

export interface PremiumMoicCalculatedRow {
  illustrationId: string;
  productDisplayName: string;
  defaultDisplayName: string;
  hasCustomName: boolean;
  hidden: boolean;
  carrier: string;
  product: string;
  payPeriodLabel: string;
  annualPremium: number;
  paymentsToRefAge: number;
  totalPremiumToRefAge: number;
  faceAmount: number;
  premiumPctOfFace: number;
  deathBenefitAtRefAge: number;
  moic: number | null;
  hasWarning: boolean;
  actualAgeUsed: number;
}

export function computePremiumMoicRow(
  illustration: Illustration,
  refAge: number
): PremiumMoicCalculatedRow {
  const { rows, faceAmount, annualPremium, product, payPeriodLabel, carrier, customDisplayName, hidden } = illustration;

  let totalPremiumToRefAge = 0;
  let paymentsToRefAge = 0;

  for (const r of rows) {
    if (r.age <= refAge) {
      totalPremiumToRefAge += r.totalPayment;
      if (r.totalPayment > 0) {
        paymentsToRefAge++;
      }
    }
  }

  let exactRow = rows.find((r) => r.age === refAge);
  let hasWarning = false;
  let actualAgeUsed = refAge;
  let deathBenefitAtRefAge = 0;

  if (exactRow) {
    deathBenefitAtRefAge = exactRow.deathBenefit;
    actualAgeUsed = exactRow.age;
  } else {
    const precedingRows = rows.filter((r) => r.age <= refAge);
    if (precedingRows.length > 0) {
      const closest = precedingRows[precedingRows.length - 1];
      deathBenefitAtRefAge = closest.deathBenefit;
      actualAgeUsed = closest.age;
      hasWarning = true;
    } else if (rows.length > 0) {
      deathBenefitAtRefAge = rows[0].deathBenefit;
      actualAgeUsed = rows[0].age;
      hasWarning = true;
    }
  }

  const premiumPctOfFace = faceAmount > 0 ? totalPremiumToRefAge / faceAmount : 0;
  const moic = totalPremiumToRefAge > 0 ? deathBenefitAtRefAge / totalPremiumToRefAge : null;
  
  const defaultDisplayName = `${product} — ${payPeriodLabel}`;
  const productDisplayName = customDisplayName && customDisplayName.trim().length > 0
    ? customDisplayName.trim()
    : defaultDisplayName;

  return {
    illustrationId: illustration.id,
    productDisplayName,
    defaultDisplayName,
    hasCustomName: Boolean(customDisplayName && customDisplayName.trim().length > 0),
    hidden: Boolean(hidden),
    carrier,
    product,
    payPeriodLabel,
    annualPremium,
    paymentsToRefAge,
    totalPremiumToRefAge,
    faceAmount,
    premiumPctOfFace,
    deathBenefitAtRefAge,
    moic,
    hasWarning,
    actualAgeUsed,
  };
}
