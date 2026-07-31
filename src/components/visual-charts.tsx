import React, { useState } from 'react';
import { Illustration } from '../lib/illustration-types';
import { computeEstateWealthTransfer } from '../output-modules/estate-wealth-transfer-calcs';
import { formatCurrency } from '../output-modules/premium-moic-format';
import { formatIrr } from '../output-modules/estate-wealth-transfer-html-export';
import { TrendingUp, BarChart3, SlidersHorizontal, Info } from 'lucide-react';

interface VisualChartsProps {
  illustrations: Illustration[];
}

export const VisualCharts: React.FC<VisualChartsProps> = ({ illustrations }) => {
  const [selectedId1, setSelectedId1] = useState<string>(
    illustrations.length > 0 ? illustrations[0].id : ''
  );
  const [activeChartTab, setActiveChartTab] = useState<'irr' | 'wealth'>('irr');
  const [assumedReturnPct, setAssumedReturnPct] = useState<number>(6.0);
  const [estateTaxPct] = useState<number>(40);
  const [hoveredPoint, setHoveredPoint] = useState<any | null>(null);

  const illustration1 = illustrations.find((i) => i.id === selectedId1) || illustrations[0];

  if (!illustration1) {
    return null;
  }

  const milestoneYears = [1, 5, 10, 15, 20, 25, 30, 35, 40];
  const fullData = computeEstateWealthTransfer(
    illustration1,
    undefined,
    true,
    assumedReturnPct / 100,
    estateTaxPct / 100,
    0.24
  );

  const milestoneData = computeEstateWealthTransfer(
    illustration1,
    undefined,
    true,
    assumedReturnPct / 100,
    estateTaxPct / 100,
    0.24,
    milestoneYears
  );

  // SVG Chart Dimensions
  const width = 800;
  const height = 360;
  const padding = { top: 40, right: 30, bottom: 50, left: 60 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  // Prepare IRR Line Chart Data (Years 1 to 40)
  const maxIrr = Math.max(...fullData.rows.slice(1).map((r) => r.deathBenefitIrr), 0.30);
  const minIrr = 0;

  const lineRows = fullData.rows.filter((r) => r.year >= 1 && r.year <= 40);

  const pointsIrr1 = lineRows.map((r, i) => {
    const x = padding.left + (i / (lineRows.length - 1)) * graphWidth;
    const clampedIrr = Math.min(r.deathBenefitIrr, maxIrr);
    const y = padding.top + graphHeight - ((clampedIrr - minIrr) / (maxIrr - minIrr)) * graphHeight;
    return { x, y, year: r.year, age: r.age, irr: r.deathBenefitIrr, db: r.scenario3_DeathBenefit };
  });

  const pathD1 = pointsIrr1.reduce(
    (acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
    ''
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-5">
      {/* Chart Control Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        {/* Chart Selector Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setActiveChartTab('irr')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeChartTab === 'irr'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Death Benefit IRR Curve</span>
          </button>

          <button
            onClick={() => setActiveChartTab('wealth')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeChartTab === 'wealth'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Estate Wealth Comparison</span>
          </button>
        </div>

        {/* Policy Selector & Assumptions */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-700">Policy:</span>
            <select
              value={illustration1.id}
              onChange={(e) => setSelectedId1(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer max-w-xs"
            >
              {illustrations.map((ill) => {
                const label = ill.customDisplayName || `${ill.carrier} ${ill.product} — ${ill.payPeriodLabel}`;
                return (
                  <option key={ill.id} value={ill.id}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>

          {activeChartTab === 'wealth' && (
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold text-slate-700">Taxable Return:</span>
              <input
                type="number"
                step="0.5"
                min="0"
                max="15"
                value={assumedReturnPct}
                onChange={(e) => setAssumedReturnPct(Number(e.target.value) || 6.0)}
                className="w-12 bg-slate-50 border border-slate-300 rounded px-1.5 py-0.5 text-xs font-bold text-slate-900 text-right focus:outline-none"
              />
              <span className="font-bold text-slate-500">%</span>
            </div>
          )}
        </div>
      </div>

      {/* CHART 1: Death Benefit IRR Curve */}
      {activeChartTab === 'irr' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">Annualized Death Benefit IRR % (Years 1 to 40)</span>
            <span>Hover over data points for details</span>
          </div>

          <div className="relative bg-slate-50 rounded-lg p-2 border border-slate-200 overflow-x-auto">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-h-[380px]">
              {/* Grid Lines & Y-Axis Scale */}
              {[0, 0.05, 0.10, 0.15, 0.20, 0.25, 0.30].map((val) => {
                const y = padding.top + graphHeight - ((val - minIrr) / (maxIrr - minIrr)) * graphHeight;
                return (
                  <g key={val}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={width - padding.right}
                      y2={y}
                      stroke="#e2e8f0"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={padding.left - 10}
                      y={y + 4}
                      fill="#64748b"
                      fontSize="10"
                      textAnchor="end"
                      fontWeight="500"
                    >
                      {formatIrr(val)}
                    </text>
                  </g>
                );
              })}

              {/* X-Axis Labels (Policy Years) */}
              {lineRows.filter((_, i) => i % 5 === 0 || i === lineRows.length - 1).map((r) => {
                const idx = lineRows.findIndex((row) => row.year === r.year);
                const x = padding.left + (idx / (lineRows.length - 1)) * graphWidth;
                return (
                  <g key={r.year}>
                    <line x1={x} y1={padding.top + graphHeight} x2={x} y2={padding.top + graphHeight + 5} stroke="#94a3b8" />
                    <text
                      x={x}
                      y={padding.top + graphHeight + 20}
                      fill="#475569"
                      fontSize="10"
                      textAnchor="middle"
                      fontWeight="600"
                    >
                      Yr {r.year}
                    </text>
                  </g>
                );
              })}

              {/* Main Line Path */}
              <path d={pathD1} fill="none" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

              {/* Data Point Circles */}
              {pointsIrr1.map((p, idx) => (
                <circle
                  key={idx}
                  cx={p.x}
                  cy={p.y}
                  r={hoveredPoint?.year === p.year ? "6" : "3.5"}
                  fill={hoveredPoint?.year === p.year ? "#0f172a" : "#0284c7"}
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="cursor-pointer transition-all"
                  onMouseEnter={() => setHoveredPoint(p)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              ))}
            </svg>

            {/* Hover Tooltip Overlay */}
            {hoveredPoint && (
              <div className="absolute top-4 right-4 bg-slate-900 text-white p-3 rounded-lg text-xs shadow-lg space-y-1 border border-slate-700 animate-in fade-in duration-150">
                <div className="font-bold text-sky-400">
                  Policy Year {hoveredPoint.year} <span className="text-slate-300 font-normal">(Age {hoveredPoint.age})</span>
                </div>
                <div>Death Benefit: <span className="font-mono font-bold text-white">{formatCurrency(hoveredPoint.db)}</span></div>
                <div>Death Benefit IRR: <span className="font-mono font-bold text-emerald-400">{formatIrr(hoveredPoint.irr)}</span></div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CHART 2: Estate Wealth Transfer Comparison Bar Chart */}
      {activeChartTab === 'wealth' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">Taxable Portfolio vs. Life Insurance Death Benefit at Key Ages</span>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-slate-400 inline-block"></span> Taxable In Estate ({estateTaxPct}%)</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-slate-700 inline-block"></span> Taxable Out Estate (24%)</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-sky-600 inline-block"></span> Life Insurance DB</span>
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-2 border border-slate-200 overflow-x-auto">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-h-[380px]">
              {(() => {
                const maxVal = Math.max(
                  ...milestoneData.rows.map((r) => Math.max(r.scenario1_InEstate, r.scenario2_OutEstate, r.scenario3_DeathBenefit))
                );
                const step = maxVal / 4;

                return (
                  <>
                    {[0, 1, 2, 3, 4].map((i) => {
                      const val = step * i;
                      const y = padding.top + graphHeight - (val / maxVal) * graphHeight;
                      return (
                        <g key={i}>
                          <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#e2e8f0" strokeDasharray="4 4" />
                          <text x={padding.left - 8} y={y + 4} fill="#64748b" fontSize="10" textAnchor="end">
                            {formatCurrency(val)}
                          </text>
                        </g>
                      );
                    })}

                    {milestoneData.rows.map((r, groupIdx) => {
                      const groupWidth = graphWidth / milestoneData.rows.length;
                      const groupX = padding.left + groupIdx * groupWidth + groupWidth * 0.15;
                      const barWidth = (groupWidth * 0.7) / 3;

                      const h1 = (r.scenario1_InEstate / maxVal) * graphHeight;
                      const h2 = (r.scenario2_OutEstate / maxVal) * graphHeight;
                      const h3 = (r.scenario3_DeathBenefit / maxVal) * graphHeight;

                      const y1 = padding.top + graphHeight - h1;
                      const y2 = padding.top + graphHeight - h2;
                      const y3 = padding.top + graphHeight - h3;

                      return (
                        <g key={r.year}>
                          <rect x={groupX} y={y1} width={barWidth - 2} height={h1} fill="#94a3b8" rx="2" />
                          <rect x={groupX + barWidth} y={y2} width={barWidth - 2} height={h2} fill="#334155" rx="2" />
                          <rect x={groupX + barWidth * 2} y={y3} width={barWidth - 2} height={h3} fill="#0284c7" rx="2" />

                          <text
                            x={groupX + barWidth * 1.5}
                            y={padding.top + graphHeight + 20}
                            fill="#475569"
                            fontSize="10"
                            textAnchor="middle"
                            fontWeight="600"
                          >
                            Yr {r.year} (Age {r.age})
                          </text>
                        </g>
                      );
                    })}
                  </>
                );
              })()}
            </svg>
          </div>
        </div>
      )}

      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>
          Visual charts render 100% client-side with SVG vector graphic scaling.
        </span>
      </div>
    </div>
  );
};
