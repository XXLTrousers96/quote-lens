export function formatCurrency(amount: number): string {
  const rounded = Math.round(amount);
  return '$' + rounded.toLocaleString('en-US');
}

export function formatPercent(decimalVal: number): string {
  const pct = Math.round(decimalVal * 100);
  return `${pct}%`;
}

export function formatMoic(moic: number | null): string {
  if (moic === null || isNaN(moic)) return '—';
  return `${moic.toFixed(1)}x`;
}
