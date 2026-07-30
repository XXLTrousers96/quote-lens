import React, { useState } from 'react';
import { OutputModule, OutputModuleProps } from './types';
import { computeEstateWealthTransfer } from './estate-wealth-transfer-calcs';
import { buildEstateWealthTransferExport, formatIrr, EstateWealthTransferTitles } from './estate-wealth-transfer-html-export';
import { buildEstateWealthTransferCsv } from './estate-wealth-transfer-csv-export';
import { downloadCsvFile } from './premium-moic-csv-export';
import { formatCurrency } from './premium-moic-format';
import { copyHtmlAndText } from '../lib/clipboard';
import { Copy, Check, Download, SlidersHorizontal, Edit2, RotateCcw, Percent } from 'lucide-react';

export const EstateWealthTransferComponent: React.FC<OutputModuleProps> = ({ illustrations }) => {
  const [selectedId1, setSelectedId1] = useState<string>(
    illustrations.length > 0 ? illustrations[0].id : ''
  );
  const [selectedId2, setSelectedId2] = useState<string>('none'); // 'none' or illustration.id
  const [includeIrr, setIncludeIrr] = useState<boolean>(true);

  const [assumedReturnPct, setAssumedReturnPct] = useState<number>(6.0);
  const [estateTaxPct, setEstateTaxPct] = useState<number>(40);
  const [incomeTaxPct, setIncomeTaxPct] = useState<number>(24);
  const [viewMode, setViewMode] = useState<'milestones' | 'full'>('milestones');

  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const illustration1 = illustrations.find((i) => i.id === selectedId1) || illustrations[0];
  const illustration2 = selectedId2 !== 'none' ? illustrations.find((i) => i.id === selectedId2) : undefined;

  if (!illustration1) {
    return null;
  }

  const milestoneYears = [1, 5, 10, 15, 20, 25, 30, 35, 40];
  const activeMilestones = viewMode === 'milestones' ? milestoneYears : undefined;

  const calculatedData = computeEstateWealthTransfer(
    illustration1,
    illustration2,
    includeIrr,
    assumedReturnPct / 100,
    estateTaxPct / 100,
    incomeTaxPct / 100,
    activeMilestones
  );

  // Default Titles
  const defaultMainTitle = `Value at Death: Taxable Portfolio (${assumedReturnPct}% Gross) vs. Life Insurance`;
  const defaultGroupTaxable = `Taxable Portfolio (${assumedReturnPct}% Gross)`;
  const defaultGroupLife = `Life Insurance Solutions`;
  const defaultCol1 = `Year (Age)`;
  const defaultCol2 = `Scenario 1: In Estate (${estateTaxPct}%)`;
  const defaultCol3 = `Scenario 2: Out of Estate (${incomeTaxPct}%)`;
  const defaultCol4 = illustration2 ? `Scenario 3: ${calculatedData.illustrationName}` : `Scenario 3: Death Benefit`;
  const defaultColPolicy2 = illustration2 ? `Scenario 4: ${calculatedData.policy2Name}` : undefined;
  const defaultColIrr = `Death Benefit IRR %`;

  // Custom Titles State
  const [customTitles, setCustomTitles] = useState<Partial<EstateWealthTransferTitles>>({});
  const [editingTitleKey, setEditingTitleKey] = useState<string | null>(null);
  const [editingTitleVal, setEditingTitleVal] = useState<string>('');

  const activeTitles: EstateWealthTransferTitles = {
    mainTitle: customTitles.mainTitle || defaultMainTitle,
    groupTaxableTitle: customTitles.groupTaxableTitle || defaultGroupTaxable,
    groupLifeTitle: customTitles.groupLifeTitle || defaultGroupLife,
    col1Title: customTitles.col1Title || defaultCol1,
    col2Title: customTitles.col2Title || defaultCol2,
    col3Title: customTitles.col3Title || defaultCol3,
    col4Title: customTitles.col4Title || defaultCol4,
    colPolicy2Title: customTitles.colPolicy2Title || defaultColPolicy2,
    colIrrTitle: customTitles.colIrrTitle || defaultColIrr,
  };

  const handleCopyForEmail = async () => {
    try {
      const { html, text } = buildEstateWealthTransferExport(calculatedData, activeTitles);
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
    const csvStr = buildEstateWealthTransferCsv(calculatedData, activeTitles);
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const fileName = `quotelens-wealth-transfer-${dateStr}.csv`;
    downloadCsvFile(csvStr, fileName);
  };

  const startEditingTitle = (key: keyof EstateWealthTransferTitles, currentVal: string) => {
    setEditingTitleKey(key);
    setEditingTitleVal(currentVal);
  };

  const saveTitle = (key: keyof EstateWealthTransferTitles) => {
    if (editingTitleVal.trim()) {
      setCustomTitles((prev) => ({ ...prev, [key]: editingTitleVal.trim() }));
    }
    setEditingTitleKey(null);
  };

  const resetAllTitles = () => {
    setCustomTitles({});
  };

  const hasCustomTitles = Object.keys(customTitles).length > 0;
  const lifeColSpan = (illustration2 ? 1 : 0) + 1 + (includeIrr ? 1 : 0);
  const totalCols = 3 + lifeColSpan;

  return (
    <div className="space-y-4">
      {/* Control Bar */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Policy & IRR Controls */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-700">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-900">Policy 1:</span>
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

            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-900">Policy 2:</span>
              <select
                value={selectedId2}
                onChange={(e) => setSelectedId2(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer max-w-xs"
              >
                <option value="none">None</option>
                {illustrations
                  .filter((ill) => ill.id !== illustration1.id)
                  .map((ill) => {
                    const label = ill.customDisplayName || `${ill.carrier} ${ill.product} — ${ill.payPeriodLabel}`;
                    return (
                      <option key={ill.id} value={ill.id}>
                        {label}
                      </option>
                    );
                  })}
              </select>
            </div>

            {/* IRR Toggle Button */}
            <button
              onClick={() => setIncludeIrr(!includeIrr)}
              className={`px-2.5 py-1 rounded border text-xs font-semibold inline-flex items-center gap-1 transition-colors ${
                includeIrr
                  ? 'bg-sky-50 text-sky-800 border-sky-300'
                  : 'bg-slate-100 text-slate-500 border-slate-200 hover:text-slate-900'
              }`}
              title="Toggle Death Benefit IRR column"
            >
              <Percent className="w-3 h-3" />
              <span>IRR Column: {includeIrr ? 'On' : 'Off'}</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            {hasCustomTitles && (
              <button
                onClick={resetAllTitles}
                className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 inline-flex items-center gap-1"
                title="Reset all editable table headers"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Headers</span>
              </button>
            )}

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

        {/* Assumptions & View Mode Toggle */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-4 text-slate-700">
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold text-slate-900">Taxable Gross Return:</span>
              <input
                type="number"
                step="0.5"
                min="0"
                max="20"
                value={assumedReturnPct}
                onChange={(e) => setAssumedReturnPct(Number(e.target.value) || 6.0)}
                className="w-14 bg-slate-50 border border-slate-300 rounded px-1.5 py-0.5 text-xs font-bold text-slate-900 text-right focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
              <span className="font-bold text-slate-500">%</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-900">Estate Tax:</span>
              <input
                type="number"
                step="1"
                min="0"
                max="60"
                value={estateTaxPct}
                onChange={(e) => setEstateTaxPct(Number(e.target.value) || 40)}
                className="w-12 bg-slate-50 border border-slate-300 rounded px-1.5 py-0.5 text-xs font-bold text-slate-900 text-right focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
              <span className="font-bold text-slate-500">%</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-900">Cap Gains / Income Tax:</span>
              <input
                type="number"
                step="1"
                min="0"
                max="50"
                value={incomeTaxPct}
                onChange={(e) => setIncomeTaxPct(Number(e.target.value) || 24)}
                className="w-12 bg-slate-50 border border-slate-300 rounded px-1.5 py-0.5 text-xs font-bold text-slate-900 text-right focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
              <span className="font-bold text-slate-500">%</span>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded border border-slate-200 font-medium">
            <button
              onClick={() => setViewMode('milestones')}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                viewMode === 'milestones'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Milestone Years
            </button>
            <button
              onClick={() => setViewMode('full')}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                viewMode === 'full'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Full Schedule
            </button>
          </div>
        </div>
      </div>

      {/* Copy Alert */}
      {copyStatus === 'success' && (
        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded text-emerald-900 text-xs font-medium flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Copied comparison table cleanly to clipboard. Ready to paste into Outlook or Word.</span>
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

      {/* Main Deliverable Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              {/* Row 1: Top Main Header */}
              <tr className="bg-slate-900 text-white text-xs font-bold border-b border-slate-800">
                <th colSpan={totalCols} className="py-2.5 px-3 text-center border-r border-slate-800 group">
                  {editingTitleKey === 'mainTitle' ? (
                    <div className="flex items-center justify-center gap-2 max-w-lg mx-auto">
                      <input
                        type="text"
                        value={editingTitleVal}
                        onChange={(e) => setEditingTitleVal(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveTitle('mainTitle');
                          if (e.key === 'Escape') setEditingTitleKey(null);
                        }}
                        autoFocus
                        className="bg-white border border-slate-400 rounded px-2 py-1 text-xs font-bold text-slate-900 w-full focus:outline-none"
                      />
                      <button
                        onClick={() => saveTitle('mainTitle')}
                        className="px-2.5 py-1 bg-sky-600 text-white rounded text-xs"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => startEditingTitle('mainTitle', activeTitles.mainTitle)}
                      className="cursor-pointer hover:underline inline-flex items-center gap-2"
                      title="Click to edit top table title"
                    >
                      <span>{activeTitles.mainTitle}</span>
                      <Edit2 className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  )}
                </th>
              </tr>

              {/* Row 2: Group Headers */}
              <tr className="bg-slate-800 text-white text-xs font-semibold border-b border-slate-700">
                <th rowSpan={2} className="py-2 px-3 border-r border-slate-700 text-center align-middle font-bold group">
                  {editingTitleKey === 'col1Title' ? (
                    <div className="flex items-center justify-center gap-1">
                      <input
                        type="text"
                        value={editingTitleVal}
                        onChange={(e) => setEditingTitleVal(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveTitle('col1Title');
                          if (e.key === 'Escape') setEditingTitleKey(null);
                        }}
                        autoFocus
                        className="bg-white border border-slate-400 rounded px-1.5 py-0.5 text-xs text-slate-900 w-20"
                      />
                      <button onClick={() => saveTitle('col1Title')} className="px-1.5 py-0.5 bg-sky-600 text-white text-[11px] rounded">Save</button>
                    </div>
                  ) : (
                    <span
                      onClick={() => startEditingTitle('col1Title', activeTitles.col1Title)}
                      className="cursor-pointer hover:underline inline-flex items-center gap-1"
                      title="Click to edit column header"
                    >
                      <span>{activeTitles.col1Title}</span>
                      <Edit2 className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100" />
                    </span>
                  )}
                </th>

                <th colSpan={2} className="py-2 px-3 border-r border-slate-700 text-center group">
                  {editingTitleKey === 'groupTaxableTitle' ? (
                    <div className="flex items-center justify-center gap-1">
                      <input
                        type="text"
                        value={editingTitleVal}
                        onChange={(e) => setEditingTitleVal(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveTitle('groupTaxableTitle');
                          if (e.key === 'Escape') setEditingTitleKey(null);
                        }}
                        autoFocus
                        className="bg-white border border-slate-400 rounded px-2 py-0.5 text-xs text-slate-900 w-full"
                      />
                      <button onClick={() => saveTitle('groupTaxableTitle')} className="px-2 py-0.5 bg-sky-600 text-white text-[11px] rounded">Save</button>
                    </div>
                  ) : (
                    <span
                      onClick={() => startEditingTitle('groupTaxableTitle', activeTitles.groupTaxableTitle)}
                      className="cursor-pointer hover:underline inline-flex items-center gap-1"
                      title="Click to edit group title"
                    >
                      <span>{activeTitles.groupTaxableTitle}</span>
                      <Edit2 className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100" />
                    </span>
                  )}
                </th>

                <th colSpan={lifeColSpan} className="py-2 px-3 text-center bg-slate-950 text-sky-300 group">
                  {editingTitleKey === 'groupLifeTitle' ? (
                    <div className="flex items-center justify-center gap-1">
                      <input
                        type="text"
                        value={editingTitleVal}
                        onChange={(e) => setEditingTitleVal(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveTitle('groupLifeTitle');
                          if (e.key === 'Escape') setEditingTitleKey(null);
                        }}
                        autoFocus
                        className="bg-white border border-slate-400 rounded px-2 py-0.5 text-xs text-slate-900 w-full"
                      />
                      <button onClick={() => saveTitle('groupLifeTitle')} className="px-2 py-0.5 bg-sky-600 text-white text-[11px] rounded">Save</button>
                    </div>
                  ) : (
                    <span
                      onClick={() => startEditingTitle('groupLifeTitle', activeTitles.groupLifeTitle)}
                      className="cursor-pointer hover:underline inline-flex items-center gap-1"
                      title="Click to edit group title"
                    >
                      <span>{activeTitles.groupLifeTitle}</span>
                      <Edit2 className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100" />
                    </span>
                  )}
                </th>
              </tr>

              {/* Row 3: Scenario Column Headers */}
              <tr className="bg-slate-800 text-white text-xs font-semibold border-b border-slate-700">
                {/* Col 2 */}
                <th className="py-2 px-3 border-r border-slate-700 text-right group">
                  {editingTitleKey === 'col2Title' ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={editingTitleVal}
                        onChange={(e) => setEditingTitleVal(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveTitle('col2Title');
                          if (e.key === 'Escape') setEditingTitleKey(null);
                        }}
                        autoFocus
                        className="bg-white border border-slate-400 rounded px-1.5 py-0.5 text-xs text-slate-900 w-full"
                      />
                      <button onClick={() => saveTitle('col2Title')} className="px-1.5 py-0.5 bg-sky-600 text-white text-[11px] rounded">Save</button>
                    </div>
                  ) : (
                    <span
                      onClick={() => startEditingTitle('col2Title', activeTitles.col2Title)}
                      className="cursor-pointer hover:underline inline-flex items-center gap-1 justify-end"
                    >
                      <span>{activeTitles.col2Title}</span>
                      <Edit2 className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100" />
                    </span>
                  )}
                </th>

                {/* Col 3 */}
                <th className="py-2 px-3 border-r border-slate-700 text-right group">
                  {editingTitleKey === 'col3Title' ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={editingTitleVal}
                        onChange={(e) => setEditingTitleVal(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveTitle('col3Title');
                          if (e.key === 'Escape') setEditingTitleKey(null);
                        }}
                        autoFocus
                        className="bg-white border border-slate-400 rounded px-1.5 py-0.5 text-xs text-slate-900 w-full"
                      />
                      <button onClick={() => saveTitle('col3Title')} className="px-1.5 py-0.5 bg-sky-600 text-white text-[11px] rounded">Save</button>
                    </div>
                  ) : (
                    <span
                      onClick={() => startEditingTitle('col3Title', activeTitles.col3Title)}
                      className="cursor-pointer hover:underline inline-flex items-center gap-1 justify-end"
                    >
                      <span>{activeTitles.col3Title}</span>
                      <Edit2 className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100" />
                    </span>
                  )}
                </th>

                {/* Col 4: Policy 1 */}
                <th className="py-2 px-3 border-r border-slate-700 text-right bg-slate-900 text-white group">
                  {editingTitleKey === 'col4Title' ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={editingTitleVal}
                        onChange={(e) => setEditingTitleVal(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveTitle('col4Title');
                          if (e.key === 'Escape') setEditingTitleKey(null);
                        }}
                        autoFocus
                        className="bg-white border border-slate-400 rounded px-1.5 py-0.5 text-xs text-slate-900 w-full"
                      />
                      <button onClick={() => saveTitle('col4Title')} className="px-1.5 py-0.5 bg-sky-600 text-white text-[11px] rounded">Save</button>
                    </div>
                  ) : (
                    <span
                      onClick={() => startEditingTitle('col4Title', activeTitles.col4Title)}
                      className="cursor-pointer hover:underline inline-flex items-center gap-1 justify-end"
                    >
                      <span>{activeTitles.col4Title}</span>
                      <Edit2 className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100" />
                    </span>
                  )}
                </th>

                {/* Col Policy 2 (if active) */}
                {illustration2 && (
                  <th className="py-2 px-3 border-r border-slate-700 text-right bg-slate-900 text-white group">
                    {editingTitleKey === 'colPolicy2Title' ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={editingTitleVal}
                          onChange={(e) => setEditingTitleVal(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveTitle('colPolicy2Title');
                            if (e.key === 'Escape') setEditingTitleKey(null);
                          }}
                          autoFocus
                          className="bg-white border border-slate-400 rounded px-1.5 py-0.5 text-xs text-slate-900 w-full"
                        />
                        <button onClick={() => saveTitle('colPolicy2Title')} className="px-1.5 py-0.5 bg-sky-600 text-white text-[11px] rounded">Save</button>
                      </div>
                    ) : (
                      <span
                        onClick={() => startEditingTitle('colPolicy2Title', activeTitles.colPolicy2Title || '')}
                        className="cursor-pointer hover:underline inline-flex items-center gap-1 justify-end"
                      >
                        <span>{activeTitles.colPolicy2Title}</span>
                        <Edit2 className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100" />
                      </span>
                    )}
                  </th>
                )}

                {/* Col IRR (if active) */}
                {includeIrr && (
                  <th className="py-2 px-3 text-right bg-sky-950 text-sky-200 group">
                    {editingTitleKey === 'colIrrTitle' ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={editingTitleVal}
                          onChange={(e) => setEditingTitleVal(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveTitle('colIrrTitle');
                            if (e.key === 'Escape') setEditingTitleKey(null);
                          }}
                          autoFocus
                          className="bg-white border border-slate-400 rounded px-1.5 py-0.5 text-xs text-slate-900 w-full"
                        />
                        <button onClick={() => saveTitle('colIrrTitle')} className="px-1.5 py-0.5 bg-sky-600 text-white text-[11px] rounded">Save</button>
                      </div>
                    ) : (
                      <span
                        onClick={() => startEditingTitle('colIrrTitle', activeTitles.colIrrTitle || '')}
                        className="cursor-pointer hover:underline inline-flex items-center gap-1 justify-end"
                      >
                        <span>{activeTitles.colIrrTitle}</span>
                        <Edit2 className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100" />
                      </span>
                    )}
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {calculatedData.rows.map((r, i) => (
                <tr key={r.year} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                  <td className="py-2.5 px-3 font-semibold text-slate-900 border-r border-slate-300 text-center font-mono">
                    Yr {r.year} <span className="text-slate-500 font-normal">(Age {r.age})</span>
                  </td>

                  {/* Scenario #1 */}
                  <td className="py-2.5 px-3 text-right text-slate-700 border-r border-slate-300 font-mono">
                    {formatCurrency(r.scenario1_InEstate)}
                  </td>

                  {/* Scenario #2 */}
                  <td className="py-2.5 px-3 text-right text-slate-700 border-r border-slate-300 font-mono">
                    {formatCurrency(r.scenario2_OutEstate)}
                  </td>

                  {/* Scenario #3: Policy 1 DB */}
                  <td className="py-2.5 px-3 text-right bg-slate-100 text-slate-900 font-bold border-r border-slate-300 font-mono">
                    {formatCurrency(r.scenario3_DeathBenefit)}
                  </td>

                  {/* Policy 2 DB (if active) */}
                  {illustration2 && r.policy2_DeathBenefit !== undefined && (
                    <td className="py-2.5 px-3 text-right bg-slate-100 text-slate-900 font-bold border-r border-slate-300 font-mono">
                      {formatCurrency(r.policy2_DeathBenefit)}
                    </td>
                  )}

                  {/* Death Benefit IRR % (if active) */}
                  {includeIrr && (
                    <td className="py-2.5 px-3 text-right bg-sky-100 text-sky-900 font-bold font-mono">
                      {formatIrr(r.deathBenefitIrr)}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const estateWealthTransferModule: OutputModule = {
  id: 'estate-wealth-transfer',
  label: 'Estate Wealth Transfer & Tax Arbitrage',
  description: 'Compares taxable portfolio growth (in vs. out of estate) against life insurance tax-free death benefit and IRR.',
  Component: EstateWealthTransferComponent,
};
