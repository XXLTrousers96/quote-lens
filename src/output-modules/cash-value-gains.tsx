import React, { useState } from 'react';
import { OutputModule, OutputModuleProps } from './types';
import { computeCashValueGains } from './cash-value-gains-calcs';
import { buildCashValueGainsExport, formatGainsCurrency } from './cash-value-gains-html-export';
import { buildCashValueGainsCsv } from './cash-value-gains-csv-export';
import { downloadCsvFile } from './premium-moic-csv-export';
import { formatCurrency } from './premium-moic-format';
import { copyHtmlAndText } from '../lib/clipboard';
import { Copy, Check, Download, Plus } from 'lucide-react';

export const CashValueGainsComponent: React.FC<OutputModuleProps> = ({ illustrations }) => {
  const [selectedId, setSelectedId] = useState<string>(
    illustrations.length > 0 ? illustrations[0].id : ''
  );
  const [milestones, setMilestones] = useState<number[]>([10, 20, 30]);
  const [newMilestoneInput, setNewMilestoneInput] = useState<string>('');
  const [customHeader, setCustomHeader] = useState<string>('');
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const activeIllustration = illustrations.find((i) => i.id === selectedId) || illustrations[0];

  if (!activeIllustration) {
    return null;
  }

  const calculatedData = computeCashValueGains(activeIllustration, milestones, customHeader);

  const handleCopyForEmail = async () => {
    try {
      const { html, text } = buildCashValueGainsExport(calculatedData);
      const res = await copyHtmlAndText(html, text);
      if (res.success) {
        setCopyStatus('success');
        setTimeout(() => setCopyStatus('idle'), 3500);
      } else {
        setCopyStatus('error');
        setErrorMessage(res.message || 'Failed to copy to clipboard.');
      }
    } catch (err: any) {
      setCopyStatus('error');
      setErrorMessage(err.message || 'Failed to generate copy buffer.');
    }
  };

  const handleDownloadCsv = () => {
    const csvStr = buildCashValueGainsCsv(calculatedData);
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const fileName = `quotelens-single-policy-gains-${dateStr}.csv`;
    downloadCsvFile(csvStr, fileName);
  };

  const addMilestone = () => {
    const yr = parseInt(newMilestoneInput, 10);
    if (!isNaN(yr) && yr > 0 && yr <= 120 && !milestones.includes(yr)) {
      const next = [...milestones, yr].sort((a, b) => a - b);
      setMilestones(next);
      setNewMilestoneInput('');
    }
  };

  const removeMilestone = (year: number) => {
    if (milestones.length > 1) {
      setMilestones(milestones.filter((y) => y !== year));
    }
  };

  return (
    <div className="space-y-4">
      {/* Control Bar: Policy Selector, Milestones & Actions */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Policy Selector */}
          <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
            <span>Select Policy:</span>
            <select
              value={activeIllustration.id}
              onChange={(e) => setSelectedId(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer max-w-xs"
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

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={handleCopyForEmail}
              className={`flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-semibold transition-colors ${
                copyStatus === 'success'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              {copyStatus === 'success' ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy for Email</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadCsv}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Download CSV</span>
            </button>
          </div>
        </div>

        {/* Milestone Years & Header Customization */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-600">Milestone Years:</span>
            <div className="flex items-center gap-1">
              {milestones.map((yr) => (
                <span
                  key={yr}
                  className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-mono font-medium border border-slate-200"
                >
                  Yr {yr}
                  {milestones.length > 1 && (
                    <button
                      onClick={() => removeMilestone(yr)}
                      className="text-slate-400 hover:text-rose-600 ml-0.5"
                    >
                      ×
                    </button>
                  )}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-1 ml-1">
              <input
                type="number"
                placeholder="Yr"
                min="1"
                max="100"
                value={newMilestoneInput}
                onChange={(e) => setNewMilestoneInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addMilestone();
                }}
                className="w-12 bg-slate-50 border border-slate-300 rounded px-1.5 py-0.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
              <button
                onClick={addMilestone}
                className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-200"
                title="Add milestone year"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-600">Header Title:</span>
            <input
              type="text"
              value={customHeader}
              placeholder={calculatedData.headerTitle}
              onChange={(e) => setCustomHeader(e.target.value)}
              className="w-44 bg-slate-50 border border-slate-300 rounded px-2 py-0.5 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>
        </div>
      </div>

      {/* Copy Alert */}
      {copyStatus === 'success' && (
        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded text-emerald-900 text-xs font-medium flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Copied table cleanly to clipboard. Ready to paste into Outlook or Word.</span>
        </div>
      )}

      {copyStatus === 'error' && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded text-rose-900 text-xs font-medium flex items-center justify-between gap-2">
          <span>{errorMessage}</span>
          <button onClick={() => setCopyStatus('idle')} className="underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Primary Deliverable Table matching screenshot */}
      <div className="bg-white rounded-lg border border-slate-950 overflow-hidden max-w-xl mx-auto shadow-xs">
        <table className="w-full text-center border-collapse text-xs">
          <thead>
            {/* Header Row 1: Black Header */}
            <tr className="bg-black text-white font-bold">
              <th colSpan={3} className="py-2.5 px-3 text-center border-b border-black text-sm tracking-wide">
                {calculatedData.headerTitle}
              </th>
            </tr>

            {/* Header Row 2: Gray Summary Subheader Row */}
            <tr className="bg-slate-300 text-black font-bold text-xs border-b border-black">
              <th className="py-2 px-3 border-r border-black font-bold text-center">
                {formatCurrency(calculatedData.annualPremium)}
              </th>
              <th className="py-2 px-3 border-r border-black font-bold text-center">
                {calculatedData.paymentYearsCount}
              </th>
              <th className="py-2 px-3 font-bold text-center">
                {formatCurrency(calculatedData.totalPremiumPaid)}
              </th>
            </tr>

            {/* Header Row 3: Black Column Titles */}
            <tr className="bg-black text-white font-bold text-xs">
              <th className="py-2 px-3 border-r border-slate-800 text-center w-1/3">Surrender Value</th>
              <th className="py-2 px-3 border-r border-slate-800 text-center w-1/3">Year</th>
              <th className="py-2 px-3 text-center w-1/3">Tax-deferred Gains</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-black text-xs font-medium text-slate-900">
            {calculatedData.milestoneRows.map((r) => (
              <tr key={r.year} className="bg-white hover:bg-slate-50">
                <td className="py-2 px-3 border-r border-black font-mono text-center">
                  {formatCurrency(r.surrenderValue)}
                </td>
                <td className="py-2 px-3 border-r border-black font-mono text-center">{r.year}</td>
                <td className="py-2 px-3 font-mono text-center font-semibold">
                  {formatGainsCurrency(r.taxDeferredGains)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const cashValueGainsModule: OutputModule = {
  id: 'cash-value-gains',
  label: 'Single Policy Cash Value & Gains',
  description: 'Single illustration milestone breakdown for surrender values and tax-deferred gains.',
  Component: CashValueGainsComponent,
};
