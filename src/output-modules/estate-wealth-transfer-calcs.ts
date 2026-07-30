import { Illustration } from '../lib/illustration-types';

export interface EstateWealthTransferRowCalculated {
  year: number;
  age: number;
  grossEarnings: number;
  investmentBalanceNoTax: number;
  scenario1_InEstate: number;
  scenario2_OutEstate: number;
  scenario3_DeathBenefit: number;
  policy2_DeathBenefit?: number;
  deathBenefitIrr: number;
  cumulativeOutlay: number;
}

export interface EstateWealthTransferCalculatedData {
  illustrationId: string;
  illustrationName: string;
  policy2Id?: string;
  policy2Name?: string;
  isPolicy2Active: boolean;
  includeIrrColumn: boolean;
  initialOutlay: number;
  assumedReturn: number;
  estateTaxRate: number;
  incomeTaxRate: number;
  rows: EstateWealthTransferRowCalculated[];
}

export function computeEstateWealthTransfer(
  illustration1: Illustration,
  illustration2?: Illustration,
  includeIrrColumn: boolean = true,
  assumedReturn: number = 0.06,
  estateTaxRate: number = 0.40,
  incomeTaxRate: number = 0.24,
  milestoneYears?: number[]
): EstateWealthTransferCalculatedData {
  const { rows, customDisplayName, product, payPeriodLabel, carrier } = illustration1;

  const illustrationName = customDisplayName && customDisplayName.trim().length > 0
    ? customDisplayName.trim()
    : `${carrier} ${product} — ${payPeriodLabel}`;

  let policy2Name = '';
  if (illustration2) {
    policy2Name = illustration2.customDisplayName && illustration2.customDisplayName.trim().length > 0
      ? illustration2.customDisplayName.trim()
      : `${illustration2.carrier} ${illustration2.product} — ${illustration2.payPeriodLabel}`;
  }

  const initialOutlay = rows.length > 0 ? rows[0].totalPayment : 0;
  let cumulativeOutlay = 0;
  let simulatedTaxableBalance = 0;

  const calculatedRows: EstateWealthTransferRowCalculated[] = [];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const year = r.year;
    const age = r.age;
    const payment = r.totalPayment;

    cumulativeOutlay += payment;

    if (i === 0) {
      simulatedTaxableBalance = payment * (1 + assumedReturn);
    } else {
      simulatedTaxableBalance = (simulatedTaxableBalance + payment) * (1 + assumedReturn);
    }

    const grossEarnings = (simulatedTaxableBalance / (1 + assumedReturn)) * assumedReturn;
    const investmentBalanceNoTax = simulatedTaxableBalance;

    // Scenario #1 & #2
    const scenario1_InEstate = investmentBalanceNoTax * (1 - estateTaxRate);
    const taxableGain = Math.max(0, investmentBalanceNoTax - cumulativeOutlay);
    const scenario2_OutEstate = investmentBalanceNoTax - (taxableGain * incomeTaxRate);

    // Scenario #3: Policy 1 Death Benefit
    const scenario3_DeathBenefit = r.deathBenefit;

    // Policy 2 Death Benefit (if active)
    let policy2_DeathBenefit: number | undefined;
    if (illustration2) {
      const r2 = illustration2.rows.find((row) => row.year === year);
      policy2_DeathBenefit = r2 ? r2.deathBenefit : 0;
    }

    // Death Benefit IRR % (Policy 1)
    let deathBenefitIrr = 0;
    if (cumulativeOutlay > 0 && scenario3_DeathBenefit > 0 && year > 0) {
      deathBenefitIrr = Math.pow(scenario3_DeathBenefit / cumulativeOutlay, 1 / year) - 1;
    }

    calculatedRows.push({
      year,
      age,
      grossEarnings,
      investmentBalanceNoTax,
      scenario1_InEstate,
      scenario2_OutEstate,
      scenario3_DeathBenefit,
      policy2_DeathBenefit,
      deathBenefitIrr,
      cumulativeOutlay,
    });
  }

  const finalRows = milestoneYears && milestoneYears.length > 0
    ? calculatedRows.filter((r) => milestoneYears.includes(r.year))
    : calculatedRows;

  return {
    illustrationId: illustration1.id,
    illustrationName,
    policy2Id: illustration2?.id,
    policy2Name: policy2Name || undefined,
    isPolicy2Active: Boolean(illustration2),
    includeIrrColumn,
    initialOutlay,
    assumedReturn,
    estateTaxRate,
    incomeTaxRate,
    rows: finalRows,
  };
}
