import { EstateWealthTransferCalculatedData } from './estate-wealth-transfer-calcs';
import { formatCurrency } from './premium-moic-format';

export function formatIrr(irrDecimal: number): string {
  if (isNaN(irrDecimal) || !isFinite(irrDecimal)) return '—';
  const pct = irrDecimal * 100;
  return `${pct.toFixed(2)}%`;
}

export interface EstateWealthTransferTitles {
  mainTitle: string;
  groupTaxableTitle: string;
  groupLifeTitle: string;
  col1Title: string;
  col2Title: string;
  col3Title: string;
  col4Title: string;
  colPolicy2Title?: string;
  colIrrTitle?: string;
}

export function buildEstateWealthTransferExport(
  data: EstateWealthTransferCalculatedData,
  titles: EstateWealthTransferTitles
): { html: string; text: string } {
  const font = 'Arial, Helvetica, sans-serif';

  // Determine active columns
  const activeHeaders: string[] = [
    titles.col1Title,
    titles.col2Title,
    titles.col3Title,
    titles.col4Title,
  ];

  if (data.isPolicy2Active && titles.colPolicy2Title) {
    activeHeaders.push(titles.colPolicy2Title);
  }

  if (data.includeIrrColumn && titles.colIrrTitle) {
    activeHeaders.push(titles.colIrrTitle);
  }

  const totalCols = activeHeaders.length;
  const lifeColSpan = (data.isPolicy2Active ? 1 : 0) + 1 + (data.includeIrrColumn ? 1 : 0);

  // 1. Build Outlook-Safe Inline HTML Table
  let html = `<table border="1" cellpadding="0" cellspacing="0" style="border-collapse: collapse; font-family: ${font}; font-size: 13px; width: 100%; max-width: 850px; margin: 0; padding: 0; border: 1px solid #0f172a;">\n`;

  // Row 1: Main Title Header (Colspan totalCols)
  html += '  <thead>\n';
  html += `    <tr style="background-color: #0f172a;">\n`;
  html += `      <th colspan="${totalCols}" bgcolor="#0f172a" align="center" style="background-color: #0f172a; color: #ffffff; font-family: ${font}; font-size: 13px; font-weight: bold; padding: 10px; text-align: center; border: 1px solid #0f172a;">${titles.mainTitle}</th>\n`;
  html += `    </tr>\n`;

  // Row 2: Subheader Groups (Rowspan 2 on Col 1)
  html += `    <tr style="background-color: #1e293b;">\n`;
  html += `      <th rowspan="2" bgcolor="#1e293b" align="center" style="background-color: #1e293b; color: #ffffff; font-family: ${font}; font-size: 12px; font-weight: bold; padding: 8px; text-align: center; border: 1px solid #334155;">${titles.col1Title}</th>\n`;
  html += `      <th colspan="2" bgcolor="#1e293b" align="center" style="background-color: #1e293b; color: #ffffff; font-family: ${font}; font-size: 12px; font-weight: bold; padding: 8px; text-align: center; border: 1px solid #334155;">${titles.groupTaxableTitle}</th>\n`;
  html += `      <th colspan="${lifeColSpan}" bgcolor="#0f172a" align="center" style="background-color: #0f172a; color: #7dd3fc; font-family: ${font}; font-size: 12px; font-weight: bold; padding: 8px; text-align: center; border: 1px solid #334155;">${titles.groupLifeTitle}</th>\n`;
  html += `    </tr>\n`;

  // Row 3: Scenario Column Headers (Col 1 is rowSpanned above)
  html += `    <tr style="background-color: #0f172a;">\n`;
  html += `      <th bgcolor="#0f172a" align="right" style="background-color: #0f172a; color: #ffffff; font-family: ${font}; font-size: 12px; font-weight: bold; padding: 8px 12px; text-align: right; border: 1px solid #334155;">${titles.col2Title}</th>\n`;
  html += `      <th bgcolor="#0f172a" align="right" style="background-color: #0f172a; color: #ffffff; font-family: ${font}; font-size: 12px; font-weight: bold; padding: 8px 12px; text-align: right; border: 1px solid #334155;">${titles.col3Title}</th>\n`;
  html += `      <th bgcolor="#0f172a" align="right" style="background-color: #0f172a; color: #ffffff; font-family: ${font}; font-size: 12px; font-weight: bold; padding: 8px 12px; text-align: right; border: 1px solid #334155;">${titles.col4Title}</th>\n`;

  if (data.isPolicy2Active && titles.colPolicy2Title) {
    html += `      <th bgcolor="#0f172a" align="right" style="background-color: #0f172a; color: #ffffff; font-family: ${font}; font-size: 12px; font-weight: bold; padding: 8px 12px; text-align: right; border: 1px solid #334155;">${titles.colPolicy2Title}</th>\n`;
  }

  if (data.includeIrrColumn && titles.colIrrTitle) {
    html += `      <th bgcolor="#0f172a" align="right" style="background-color: #0f172a; color: #7dd3fc; font-family: ${font}; font-size: 12px; font-weight: bold; padding: 8px 12px; text-align: right; border: 1px solid #334155;">${titles.colIrrTitle}</th>\n`;
  }

  html += `    </tr>\n`;
  html += '  </thead>\n';

  // Body Data Rows
  html += '  <tbody>\n';
  data.rows.forEach((r, idx) => {
    const isEven = idx % 2 === 0;
    const bg = isEven ? '#ffffff' : '#f8fafc';

    const col1 = `${r.year} (Age ${r.age})`;
    const col2 = formatCurrency(r.scenario1_InEstate);
    const col3 = formatCurrency(r.scenario2_OutEstate);
    const col4 = formatCurrency(r.scenario3_DeathBenefit);

    html += `    <tr style="background-color: ${bg};">\n`;
    html += `      <td bgcolor="${bg}" align="center" style="background-color: ${bg}; color: #0f172a; font-family: ${font}; font-size: 13px; padding: 8px 12px; text-align: center; border: 1px solid #cbd5e1;">${col1}</td>\n`;
    html += `      <td bgcolor="${bg}" align="right" style="background-color: ${bg}; color: #0f172a; font-family: ${font}; font-size: 13px; padding: 8px 12px; text-align: right; border: 1px solid #cbd5e1;">${col2}</td>\n`;
    html += `      <td bgcolor="${bg}" align="right" style="background-color: ${bg}; color: #0f172a; font-family: ${font}; font-size: 13px; padding: 8px 12px; text-align: right; border: 1px solid #cbd5e1;">${col3}</td>\n`;
    html += `      <td bgcolor="#f1f5f9" align="right" style="background-color: #f1f5f9; color: #0f172a; font-family: ${font}; font-size: 13px; font-weight: bold; padding: 8px 12px; text-align: right; border: 1px solid #cbd5e1;">${col4}</td>\n`;

    if (data.isPolicy2Active && r.policy2_DeathBenefit !== undefined) {
      const colP2 = formatCurrency(r.policy2_DeathBenefit);
      html += `      <td bgcolor="#f1f5f9" align="right" style="background-color: #f1f5f9; color: #0f172a; font-family: ${font}; font-size: 13px; font-weight: bold; padding: 8px 12px; text-align: right; border: 1px solid #cbd5e1;">${colP2}</td>\n`;
    }

    if (data.includeIrrColumn) {
      const colIrr = formatIrr(r.deathBenefitIrr);
      html += `      <td bgcolor="#e0f2fe" align="right" style="background-color: #e0f2fe; color: #0369a1; font-family: ${font}; font-size: 13px; font-weight: bold; padding: 8px 12px; text-align: right; border: 1px solid #bae6fd;">${colIrr}</td>\n`;
    }

    html += `    </tr>\n`;
  });
  html += '  </tbody>\n</table>';

  // 2. Build TSV Plain Text Fallback
  let text = `${titles.mainTitle}\n`;
  text += activeHeaders.join('\t') + '\n';
  data.rows.forEach((r) => {
    const lineParts = [
      `${r.year} (Age ${r.age})`,
      formatCurrency(r.scenario1_InEstate),
      formatCurrency(r.scenario2_OutEstate),
      formatCurrency(r.scenario3_DeathBenefit),
    ];
    if (data.isPolicy2Active && r.policy2_DeathBenefit !== undefined) {
      lineParts.push(formatCurrency(r.policy2_DeathBenefit));
    }
    if (data.includeIrrColumn) {
      lineParts.push(formatIrr(r.deathBenefitIrr));
    }
    text += lineParts.join('\t') + '\n';
  });

  return { html, text };
}
