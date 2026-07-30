import { CashValueGainsCalculatedData } from './cash-value-gains-calcs';
import { formatCurrency } from './premium-moic-format';

export function formatGainsCurrency(amount: number): string {
  const rounded = Math.round(amount);
  if (rounded < 0) {
    return '-$' + Math.abs(rounded).toLocaleString('en-US');
  }
  return '$' + rounded.toLocaleString('en-US');
}

export function buildCashValueGainsExport(
  data: CashValueGainsCalculatedData
): { html: string; text: string } {
  const font = 'Arial, Helvetica, sans-serif';

  // 1. Build Outlook-Safe Inline HTML Table matching Excel screenshot
  let html = `<table border="1" cellpadding="0" cellspacing="0" style="border-collapse: collapse; font-family: ${font}; font-size: 13px; width: 100%; max-width: 600px; margin: 0; padding: 0; border: 1px solid #000000;">\n`;

  // Row 1: Top Black Header (Colspan 3)
  html += '  <thead>\n';
  html += `    <tr style="background-color: #000000;">\n`;
  html += `      <th colspan="3" bgcolor="#000000" align="center" style="background-color: #000000; color: #ffffff; font-family: ${font}; font-size: 13px; font-weight: bold; padding: 10px; text-align: center; border: 1px solid #000000;">${data.headerTitle}</th>\n`;
  html += `    </tr>\n`;

  // Row 2: Gray Summary Row
  html += `    <tr style="background-color: #c0c0c0;">\n`;
  html += `      <th bgcolor="#c0c0c0" align="center" style="background-color: #c0c0c0; color: #000000; font-family: ${font}; font-size: 13px; font-weight: bold; padding: 8px 12px; text-align: center; border: 1px solid #000000;">${formatCurrency(data.annualPremium)}</th>\n`;
  html += `      <th bgcolor="#c0c0c0" align="center" style="background-color: #c0c0c0; color: #000000; font-family: ${font}; font-size: 13px; font-weight: bold; padding: 8px 12px; text-align: center; border: 1px solid #000000;">${data.paymentYearsCount}</th>\n`;
  html += `      <th bgcolor="#c0c0c0" align="center" style="background-color: #c0c0c0; color: #000000; font-family: ${font}; font-size: 13px; font-weight: bold; padding: 8px 12px; text-align: center; border: 1px solid #000000;">${formatCurrency(data.totalPremiumPaid)}</th>\n`;
  html += `    </tr>\n`;

  // Row 3: Black Column Headers
  html += `    <tr style="background-color: #000000;">\n`;
  html += `      <th bgcolor="#000000" align="center" style="background-color: #000000; color: #ffffff; font-family: ${font}; font-size: 13px; font-weight: bold; padding: 8px 12px; text-align: center; border: 1px solid #000000;">Surrender Value</th>\n`;
  html += `      <th bgcolor="#000000" align="center" style="background-color: #000000; color: #ffffff; font-family: ${font}; font-size: 13px; font-weight: bold; padding: 8px 12px; text-align: center; border: 1px solid #000000;">Year</th>\n`;
  html += `      <th bgcolor="#000000" align="center" style="background-color: #000000; color: #ffffff; font-family: ${font}; font-size: 13px; font-weight: bold; padding: 8px 12px; text-align: center; border: 1px solid #000000;">Tax-deferred Gains</th>\n`;
  html += `    </tr>\n`;
  html += '  </thead>\n';

  // Body Data Rows
  html += '  <tbody>\n';
  data.milestoneRows.forEach((r) => {
    const col1Text = formatCurrency(r.surrenderValue);
    const col2Text = r.year.toString();
    const col3Text = formatGainsCurrency(r.taxDeferredGains);

    html += `    <tr style="background-color: #ffffff;">\n`;
    html += `      <td bgcolor="#ffffff" align="center" style="background-color: #ffffff; color: #000000; font-family: ${font}; font-size: 13px; padding: 8px 12px; text-align: center; border: 1px solid #000000;">${col1Text}</td>\n`;
    html += `      <td bgcolor="#ffffff" align="center" style="background-color: #ffffff; color: #000000; font-family: ${font}; font-size: 13px; padding: 8px 12px; text-align: center; border: 1px solid #000000;">${col2Text}</td>\n`;
    html += `      <td bgcolor="#ffffff" align="center" style="background-color: #ffffff; color: #000000; font-family: ${font}; font-size: 13px; padding: 8px 12px; text-align: center; border: 1px solid #000000;">${col3Text}</td>\n`;
    html += `    </tr>\n`;
  });
  html += '  </tbody>\n</table>';

  // 2. Build TSV Plain Text Fallback
  let text = `${data.headerTitle}\n`;
  text += `${formatCurrency(data.annualPremium)}\t${data.paymentYearsCount}\t${formatCurrency(data.totalPremiumPaid)}\n`;
  text += `Surrender Value\tYear\tTax-deferred Gains\n`;
  data.milestoneRows.forEach((r) => {
    text += `${formatCurrency(r.surrenderValue)}\t${r.year}\t${formatGainsCurrency(r.taxDeferredGains)}\n`;
  });

  return { html, text };
}
