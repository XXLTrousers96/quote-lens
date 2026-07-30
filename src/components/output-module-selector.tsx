import React from 'react';
import { outputModules, getOutputModule } from '../output-modules';

interface OutputModuleSelectorProps {
  selectedModuleId: string;
  onSelectModuleId: (id: string) => void;
}

export const OutputModuleSelector: React.FC<OutputModuleSelectorProps> = ({
  selectedModuleId,
  onSelectModuleId,
}) => {
  const activeModule = getOutputModule(selectedModuleId);

  return (
    <div className="bg-white p-3.5 rounded-lg border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div>
        <label htmlFor="output-module-select" className="text-xs font-semibold text-slate-900 block">
          Output Module
        </label>
        {activeModule.description && (
          <p className="text-xs text-slate-500">{activeModule.description}</p>
        )}
      </div>

      <div className="w-full sm:w-auto">
        <select
          id="output-module-select"
          value={selectedModuleId}
          onChange={(e) => onSelectModuleId(e.target.value)}
          className="w-full sm:w-56 bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
        >
          {outputModules.map((module) => (
            <option key={module.id} value={module.id}>
              {module.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
