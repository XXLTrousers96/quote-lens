import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useIllustrations } from '../lib/illustrations-context';
import { defaultOutputModuleId, getOutputModule } from '../output-modules';
import { OutputModuleSelector } from '../components/output-module-selector';
import { Upload } from 'lucide-react';

export const AnalysisPage: React.FC = () => {
  const { illustrations, referenceAge, setReferenceAge } = useIllustrations();
  const [selectedModuleId, setSelectedModuleId] = useState<string>(defaultOutputModuleId);

  const activeModule = getOutputModule(selectedModuleId);
  const { Component } = activeModule;

  if (illustrations.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-base font-semibold text-slate-900">No Illustrations Loaded</h2>
        <p className="text-xs text-slate-500">
          Upload carrier illustration CSV files on the Upload page to generate comparison tables.
        </p>
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-medium transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Go to Upload</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Comparison Analysis</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Generate deliverable table and copy formatted text for email or export to CSV.
        </p>
      </div>

      <OutputModuleSelector
        selectedModuleId={selectedModuleId}
        onSelectModuleId={setSelectedModuleId}
      />

      <div>
        <Component
          illustrations={illustrations}
          referenceAge={referenceAge}
          onReferenceAgeChange={setReferenceAge}
        />
      </div>
    </div>
  );
};
