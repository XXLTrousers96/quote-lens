import { EstateWealthTransferCalculatedData } from './estate-wealth-transfer-calcs';
import { EstateWealthTransferTitles } from './estate-wealth-transfer-html-export';

export function buildEstateWealthTransferCsv(
  data: EstateWealthTransferCalculatedData,
  titles: EstateWealthTransferTitles
): string {
  let csv = `"${titles.mainTitle.replace(/"/g, '""')}"\n`;

  const headers = [
    titles.col1Title,
    titles.col2Title,
    titles.col3Title,
    titles.col4Title,
  ];

  if (data.isPolicy2Active && titles.colPolicy2Title) {
    headers.push(titles.colPolicy2Title);
  }
  if (data.includeIrrColumn && titles.colIrrTitle) {
    headers.push(titles.colIrrTitle);
  }

  csv += headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(',') + '\n';

  data.rows.forEach((r) => {
    const lineParts: (string | number)[] = [
      `"${r.year} (Age ${r.age})"`,
      Math.round(r.scenario1_InEstate),
      Math.round(r.scenario2_OutEstate),
      Math.round(r.scenario3_DeathBenefit),
    ];

    if (data.isPolicy2Active && r.policy2_DeathBenefit !== undefined) {
      lineParts.push(Math.round(r.policy2_DeathBenefit));
    }
    if (data.includeIrrColumn) {
      lineParts.push((r.deathBenefitIrr * 100).toFixed(2));
    }

    csv += lineParts.join(',') + '\n';
  });

  return csv;
}
