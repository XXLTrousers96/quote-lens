import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIllustrations } from '../lib/illustrations-context';
import { formatCurrency } from '../output-modules/premium-moic-format';
import { Trash2, ArrowRight, ArrowUp, ArrowDown, Edit2, RotateCcw, Eye, EyeOff } from 'lucide-react';

export const IllustrationsList: React.FC = () => {
  const {
    illustrations,
    removeIllustration,
    moveIllustration,
    updateCustomDisplayName,
    resetCustomDisplayName,
    toggleIllustrationVisibility,
    clearAll,
  } = useIllustrations();

  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>('');
  const navigate = useNavigate();

  if (illustrations.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
        <p className="text-xs text-slate-500">No illustrations loaded in current session.</p>
      </div>
    );
  }

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

  return (
    <div className="space-y-3">
      {/* Table Action Bar */}
      <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200">
        <div className="text-xs font-semibold text-slate-900 flex items-center gap-2">
          <span>Loaded Session Illustrations</span>
          <span className="px-2 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-700 rounded border border-slate-200">
            {illustrations.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowClearConfirm(true)}
            className="px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded transition-colors"
          >
            Clear All
          </button>

          <button
            onClick={() => navigate('/analysis')}
            className="px-3 py-1.5 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white rounded transition-colors inline-flex items-center gap-1.5"
          >
            <span>View Comparison</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-5 max-w-xs w-full shadow-lg border border-slate-200 space-y-3 text-xs">
            <h4 className="font-semibold text-slate-900">Clear all illustrations?</h4>
            <p className="text-slate-500">This will remove all uploaded files from session memory.</p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-100 rounded border border-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearAll();
                  setShowClearConfirm(false);
                }}
                className="px-3 py-1.5 font-medium bg-rose-600 hover:bg-rose-700 text-white rounded"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <th className="py-2.5 px-3 text-center w-16">Order</th>
                <th className="py-2.5 px-3">Carrier</th>
                <th className="py-2.5 px-3">Product Name</th>
                <th className="py-2.5 px-3">Pay Pattern</th>
                <th className="py-2.5 px-3 text-right">Issue Age</th>
                <th className="py-2.5 px-3 text-right">Face Amount</th>
                <th className="py-2.5 px-3 text-right">Annual Premium</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {illustrations.map((ill, index) => {
                const isFirst = index === 0;
                const isLast = index === illustrations.length - 1;
                const displayName = ill.customDisplayName || `${ill.product} — ${ill.payPeriodLabel}`;

                return (
                  <tr
                    key={ill.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      ill.hidden ? 'opacity-40 bg-slate-100' : ''
                    }`}
                  >
                    {/* Order & Movement Controls */}
                    <td className="py-2 px-2 text-center border-r border-slate-100">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => toggleIllustrationVisibility(ill.id)}
                          title={ill.hidden ? 'Show row' : 'Hide row'}
                          className="p-0.5 text-slate-500 hover:text-slate-900"
                        >
                          {ill.hidden ? <EyeOff className="w-3.5 h-3.5 text-rose-500" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          disabled={isFirst}
                          onClick={() => moveIllustration(ill.id, 'up')}
                          className="p-0.5 text-slate-400 hover:text-slate-900 disabled:opacity-20"
                          title="Move up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          disabled={isLast}
                          onClick={() => moveIllustration(ill.id, 'down')}
                          className="p-0.5 text-slate-400 hover:text-slate-900 disabled:opacity-20"
                          title="Move down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    <td className="py-2.5 px-3 font-semibold text-slate-900">{ill.carrier}</td>

                    {/* Inline Editable Product Name */}
                    <td className="py-2.5 px-3 text-slate-800 font-medium group">
                      {editingId === ill.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEditing(ill.id);
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                            autoFocus
                            className="bg-white border border-slate-400 rounded px-2 py-0.5 text-xs font-semibold text-slate-900 w-full focus:outline-none focus:ring-1 focus:ring-slate-900"
                          />
                          <button
                            onClick={() => saveEditing(ill.id)}
                            className="px-2 py-0.5 bg-slate-900 text-white rounded text-[11px]"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-2">
                          <span
                            onClick={() => startEditing(ill.id, displayName)}
                            className="cursor-pointer hover:underline flex items-center gap-1.5"
                            title="Click to edit product display name"
                          >
                            <span>{displayName}</span>
                            <Edit2 className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </span>

                          {ill.customDisplayName && (
                            <button
                              onClick={() => resetCustomDisplayName(ill.id)}
                              title="Reset name"
                              className="p-0.5 text-slate-400 hover:text-slate-700 shrink-0"
                            >
                              <RotateCcw className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>

                    <td className="py-2.5 px-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {ill.payPeriodLabel}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-right text-slate-600 font-mono">{ill.issueAge}</td>
                    <td className="py-2.5 px-3 text-right text-slate-900 font-semibold font-mono">
                      {formatCurrency(ill.faceAmount)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-900 font-mono">
                      {formatCurrency(ill.annualPremium)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => removeIllustration(ill.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
