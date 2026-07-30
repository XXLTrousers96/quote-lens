import { CashValueGainsCalculatedData } from './cash-value-gains-calcs';

export function buildCashValueGainsCsv(data: CashValueGainsCalculatedData): string {
  let csv = `"${data.headerTitle}","",""\n`;
  csv += `${Math.round(data.annualPremium)},${data.paymentYearsCount},${Math.round(data.totalPremiumPaid)}\n`;
  csv += `"Surrender Value","Year","Tax-deferred Gains"\n`;

  data.milestoneRows.forEach((r) => {
    csv += `${Math.round(r.surrenderValue)},${r.year},${Math.round(r.taxDeferredGains)}\n`;
  });

  return csv;
}
