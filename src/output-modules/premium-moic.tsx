import React, { useState } from 'react';
import { OutputModule, OutputModuleProps } from './types';
import { computePremiumMoicRow } from './premium-moic-calcs';
import { formatCurrency, formatPercent, formatMoic } from './premium-moic-format';
import { buildPremiumMoicExport } from './premium-moic-html-export';
import { buildPremiumMoicCsv, downloadCsvFile } from './premium-moic-csv-export';
import { copyHtmlAndText } from '../lib/clipboard';
import { useIllustrations } from '../lib/illustrations-context';
import { Copy, Check, Download, AlertTriangle, ArrowUp, ArrowDown, Eye, EyeOff, Edit2, RotateCcw } from 'lucide-react';

export const PremiumMoicComponent: React.FC<OutputModuleProps> = ({
  illustrations,
  referenceAge,
  onReferenceAgeChange,
}) => {
  const {
    moveIllustration,
    updateCustomDisplayName,
    resetCustomDisplayName,
    toggleIllustrationVisibility,
  } = useIllustrations();

  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>('');
  const [isCustomAge, setIsCustomAge] = useState<boolean>(
    ![80, 85, 90, 95, 100].includes(referenceAge)
  );

  const calculatedRows = illustrations.map((ill) =>
    computePremiumMoicRow(ill, referenceAge)
  );

  const handleCopyForEmail = async () => {
    try {
      const { html, text } = buildPremiumMoicExport(calculatedRows, referenceAge);
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
    const csvStr = buildPremiumMoicCsv(calculatedRows, referenceAge);
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const fileName = `quotelens-premium-moic-age${referenceAge}-${dateStr}.csv`;
    downloadCsvFile(csvStr, fileName);
  };

  const startEditing = (id: string, currentName: string) => {
    setEditingId(id);
    setEditingText(currentName);
  };

  const saveEditing = (id: string) => {
    if (editingText.trim()) {
      updateCustomDisplayName(id, editingText.trim());
    }
    setEditingId(null);
  };

  const warningsPresent = calculatedRows.some((r) => !r.hidden && r.hasWarning);
  const visibleCount = calculatedRows.filter((r) => !r.hidden).length;

  return (
    <div className="space-y-4">
      {/* Target Age & Export Control Bar */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
          <span>Target Age:</span>
          {!isCustomAge ? (
            <select
              value={referenceAge}
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'custom') {
                  setIsCustomAge(true);
                } else {
                  onReferenceAgeChange?.(Number(val));
                }
              }}
              className="bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
            >
              {[80, 85, 90, 95, 100].map((age) => (
                <option key={age} value={age}>
                  Age {age}
                </option>
              ))}
              <option value="custom">Custom...</option>
            </select>
          ) : (
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="50"
                max="120"
                value={referenceAge}
                onChange={(e) => onReferenceAgeChange?.(Number(e.target.value) || 90)}
                className="w-16 bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
              <button
                onClick={() => setIsCustomAge(false)}
                className="text-[11px] text-slate-500 hover:text-slate-900 underline"
              >
                Presets
              </button>
            </div>
          )}

          <span className="text-slate-400 text-xs ml-2">
            ({visibleCount} of {illustrations.length} visible)
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleCopyForEmail}
            disabled={visibleCount === 0}
            className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-semibold transition-colors ${
              copyStatus === 'success'
                ? 'bg-emerald-700 text-white'
                : 'bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-50'
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
            disabled={visibleCount === 0}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      {/* Copy Status Alert */}
      {copyStatus === 'success' && (
        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded text-emerald-900 text-xs font-medium flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Copied cleanly to clipboard. Ready to paste into Outlook or Word.</span>
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

      {/* Deliverable Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-900 text-white text-xs font-semibold">
                <th className="py-2.5 px-3 border-b border-slate-800 border-r border-slate-800 w-16 text-center">
                  Order
                </th>
                <th className="py-2.5 px-3 border-b border-slate-800 border-r border-slate-800">
                  Product Name <span className="text-[10px] font-normal text-slate-400">(Click to edit)</span>
                </th>
                <th className="py-2.5 px-3 border-b border-slate-800 border-r border-slate-800 text-right">
                  Annual Premium
                </th>
                <th className="py-2.5 px-3 border-b border-slate-800 border-r border-slate-800 text-right">
                  # Pmts to {referenceAge}
                </th>
                <th className="py-2.5 px-3 border-b border-slate-800 border-r border-slate-800 text-right">
                  Total Prem to {referenceAge}
                </th>
                <th className="py-2.5 px-3 border-b border-slate-800 border-r border-slate-800 text-right bg-slate-900 text-white">
                  % of Face
                </th>
                <th className="py-2.5 px-3 border-b border-slate-800 text-right bg-sky-950 text-sky-200">
                  MOIC
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {calculatedRows.map((r, index) => {
                const isFirst = index === 0;
                const isLast = index === calculatedRows.length - 1;

                return (
                  <tr
                    key={r.illustrationId}
                    className={`transition-colors ${
                      r.hidden ? 'opacity-40 bg-slate-100' : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Order & Reordering Controls */}
                    <td className="py-2 px-2 bg-slate-50 border-r border-slate-300 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => toggleIllustrationVisibility(r.illustrationId)}
                          title={r.hidden ? 'Show row in deliverable' : 'Hide row from deliverable'}
                          className="p-0.5 text-slate-500 hover:text-slate-900"
                        >
                          {r.hidden ? <EyeOff className="w-3.5 h-3.5 text-rose-500" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          disabled={isFirst}
                          onClick={() => moveIllustration(r.illustrationId, 'up')}
                          className="p-0.5 text-slate-400 hover:text-slate-900 disabled:opacity-20"
                          title="Move up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          disabled={isLast}
                          onClick={() => moveIllustration(r.illustrationId, 'down')}
                          className="p-0.5 text-slate-400 hover:text-slate-900 disabled:opacity-20"
                          title="Move down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Inline Editable Product Name Column */}
                    <td className="py-2 px-3 bg-slate-100 font-semibold text-slate-900 border-r border-slate-300 group">
                      {editingId === r.illustrationId ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEditing(r.illustrationId);
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                            autoFocus
                            className="bg-white border border-slate-400 rounded px-2 py-0.5 text-xs font-semibold text-slate-900 w-full focus:outline-none focus:ring-1 focus:ring-slate-900"
                          />
                          <button
                            onClick={() => saveEditing(r.illustrationId)}
                            className="px-2 py-0.5 bg-slate-900 text-white rounded text-[11px]"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-2">
                          <span
                            onClick={() => startEditing(r.illustrationId, r.productDisplayName)}
                            className="cursor-pointer hover:underline flex items-center gap-1.5"
                            title="Click to edit product display name"
                          >
                            <span>{r.productDisplayName}</span>
                            <Edit2 className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </span>

                          <div className="flex items-center gap-1 shrink-0">
                            {r.hasCustomName && (
                              <button
                                onClick={() => resetCustomDisplayName(r.illustrationId)}
                                title="Reset to auto-generated product name"
                                className="p-0.5 text-slate-400 hover:text-slate-700"
                              >
                                <RotateCcw className="w-3 h-3" />
                              </button>
                            )}

                            {r.hasWarning && (
                              <span
                                title={`Illustration ended at age ${r.actualAgeUsed}`}
                                className="inline-flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 px-1 py-0.5 rounded font-normal border border-amber-200"
                              >
                                <AlertTriangle className="w-3 h-3" />
                                Age {r.actualAgeUsed}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Annual Premium */}
                    <td className="py-2.5 px-3 text-right text-slate-700 border-r border-slate-300 font-mono">
                      {formatCurrency(r.annualPremium)}
                    </td>

                    {/* # Pmts to RefAge */}
                    <td className="py-2.5 px-3 text-right text-slate-700 border-r border-slate-300 font-mono">
                      {r.paymentsToRefAge}
                    </td>

                    {/* Total Prem to RefAge */}
                    <td className="py-2.5 px-3 text-right text-slate-700 border-r border-slate-300 font-mono">
                      {formatCurrency(r.totalPremiumToRefAge)}
                    </td>

                    {/* Premium as % of Face */}
                    <td className="py-2.5 px-3 text-right bg-slate-800 text-white font-bold border-r border-slate-900 font-mono">
                      {formatPercent(r.premiumPctOfFace)}
                    </td>

                    {/* MOIC */}
                    <td className="py-2.5 px-3 text-right bg-sky-100 text-sky-900 font-bold font-mono">
                      {formatMoic(r.moic)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {warningsPresent && (
          <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500">
            Note: One or more visible illustrations ended prior to age {referenceAge}. Calculation used closest available row.
          </div>
        )}
      </div>
    </div>
  );
};

export const premiumMoicModule: OutputModule = {
  id: 'premium-moic',
  label: 'Premium & MOIC',
  description: 'Compares annual premiums, total outlay to target age, % of face, and MOIC.',
  Component: PremiumMoicComponent,
};
