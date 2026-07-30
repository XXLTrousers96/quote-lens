import React from 'react';
import { UploadDropZone } from '../components/upload-drop-zone';
import { IllustrationsList } from '../components/illustrations-list';

export const UploadPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Upload Illustrations</h1>
        <p className="text-xs text-slate-500 mt-1">
          Select or drag carrier illustration CSV files into the workspace.
        </p>
      </div>

      <UploadDropZone />

      <IllustrationsList />
    </div>
  );
};
