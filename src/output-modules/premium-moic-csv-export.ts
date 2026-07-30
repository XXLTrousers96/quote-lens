import { PremiumMoicCalculatedRow } from './premium-moic-calcs';

export function buildPremiumMoicCsv(
  allRows: PremiumMoicCalculatedRow[],
  refAge: number
): string {
  const rows = allRows.filter((r) => !r.hidden);

  const headers = [
    'Product Name',
    'Annual Premium',
    `# Payments to Age ${refAge}`,
    `Total Premium to Age ${refAge}`,
    'Premium as % of Face',
    'MOIC',
  ];

  let csv = headers.map((h) => `"${h}"`).join(',') + '\n';

  rows.forEach((r) => {
    const moicVal = r.moic !== null ? r.moic.toFixed(2) : '';
    const pctVal = (r.premiumPctOfFace * 100).toFixed(2);

    const line = [
      `"${r.productDisplayName.replace(/"/g, '""')}"`,
      Math.round(r.annualPremium),
      r.paymentsToRefAge,
      Math.round(r.totalPremiumToRefAge),
      pctVal,
      moicVal,
    ].join(',');

    csv += line + '\n';
  });

  return csv;
}

export function downloadCsvFile(csvContent: string, fileName: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
