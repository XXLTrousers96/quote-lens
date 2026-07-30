import { PremiumMoicCalculatedRow } from './premium-moic-calcs';
import { formatCurrency, formatPercent, formatMoic } from './premium-moic-format';
import { premiumMoicStyles } from './premium-moic-styles';

export function buildPremiumMoicExport(
  allRows: PremiumMoicCalculatedRow[],
  refAge: number
): { html: string; text: string } {
  // Only export visible (non-hidden) rows
  const rows = allRows.filter((r) => !r.hidden);

  const headers = [
    'Product Name',
    'Annual Premium',
    `# Payments to Age ${refAge}`,
    `Total Premium to Age ${refAge}`,
    'Premium as % of Face',
    'MOIC',
  ];

  const font = premiumMoicStyles.fontFamily;
  let html = `<table border="1" cellpadding="0" cellspacing="0" style="border-collapse: collapse; font-family: ${font}; font-size: 13px; width: 100%; max-width: 850px; margin: 0; padding: 0; border: 1px solid #cbd5e1;">\n`;

  // Header Row
  html += '  <thead>\n    <tr style="background-color: #0f172a;">\n';
  headers.forEach((h, i) => {
    const isNum = i > 0;
    const align = isNum ? 'right' : 'left';
    const bg = '#0f172a';
    html += `      <th bgcolor="${bg}" align="${align}" style="background-color: ${bg}; color: #ffffff; font-family: ${font}; font-size: 13px; font-weight: bold; padding: 10px 14px; text-align: ${align}; border: 1px solid #334155;">${h}</th>\n`;
  });
  html += '    </tr>\n  </thead>\n';

  // Body Rows
  html += '  <tbody>\n';
  rows.forEach((r, idx) => {
    const isEven = idx % 2 === 0;
    const defaultBg = isEven ? '#ffffff' : '#f8fafc';

    const col1Text = r.productDisplayName;
    const col2Text = formatCurrency(r.annualPremium);
    const col3Text = r.paymentsToRefAge.toString();
    const col4Text = formatCurrency(r.totalPremiumToRefAge);
    const col5Text = formatPercent(r.premiumPctOfFace);
    const col6Text = formatMoic(r.moic);

    html += '    <tr>\n';
    html += `      <td bgcolor="#f1f5f9" align="left" style="background-color: #f1f5f9; color: #0f172a; font-family: ${font}; font-size: 13px; font-weight: 600; padding: 9px 14px; text-align: left; border: 1px solid #cbd5e1;">${col1Text}</td>\n`;
    html += `      <td bgcolor="${defaultBg}" align="right" style="background-color: ${defaultBg}; color: #0f172a; font-family: ${font}; font-size: 13px; padding: 9px 14px; text-align: right; border: 1px solid #cbd5e1;">${col2Text}</td>\n`;
    html += `      <td bgcolor="${defaultBg}" align="right" style="background-color: ${defaultBg}; color: #0f172a; font-family: ${font}; font-size: 13px; padding: 9px 14px; text-align: right; border: 1px solid #cbd5e1;">${col3Text}</td>\n`;
    html += `      <td bgcolor="${defaultBg}" align="right" style="background-color: ${defaultBg}; color: #0f172a; font-family: ${font}; font-size: 13px; padding: 9px 14px; text-align: right; border: 1px solid #cbd5e1;">${col4Text}</td>\n`;
    html += `      <td bgcolor="#1e293b" align="right" style="background-color: #1e293b; color: #ffffff; font-family: ${font}; font-size: 13px; font-weight: bold; padding: 9px 14px; text-align: right; border: 1px solid #0f172a;">${col5Text}</td>\n`;
    html += `      <td bgcolor="#e0f2fe" align="right" style="background-color: #e0f2fe; color: #0369a1; font-family: ${font}; font-size: 13px; font-weight: bold; padding: 9px 14px; text-align: right; border: 1px solid #bae6fd;">${col6Text}</td>\n`;
    html += '    </tr>\n';
  });
  html += '  </tbody>\n</table>';

  // Plain-text TSV fallback
  let text = headers.join('\t') + '\n';
  rows.forEach((r) => {
    const line = [
      r.productDisplayName,
      formatCurrency(r.annualPremium),
      r.paymentsToRefAge,
      formatCurrency(r.totalPremiumToRefAge),
      formatPercent(r.premiumPctOfFace),
      formatMoic(r.moic),
    ].join('\t');
    text += line + '\n';
  });

  return { html, text };
}
