import React, { useState, useRef } from 'react';
import { useIllustrations } from '../lib/illustrations-context';
import { Upload, X, Check, AlertCircle } from 'lucide-react';

export const UploadDropZone: React.FC = () => {
  const { addFiles, parseErrors, dismissError, clearErrors } = useIllustrations();
  const [isDragging, setIsDragging] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      clearErrors();
      const count = await addFiles(e.dataTransfer.files);
      if (count > 0) {
        setSuccessMsg(`Added ${count} file${count > 1 ? 's' : ''}`);
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      clearErrors();
      const count = await addFiles(e.target.files);
      if (count > 0) {
        setSuccessMsg(`Added ${count} file${count > 1 ? 's' : ''}`);
        setTimeout(() => setSuccessMsg(null), 3000);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-slate-600 bg-slate-100'
            : 'border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          multiple
          accept=".csv"
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-2">
          <Upload className="w-6 h-6 text-slate-400" />
          <div className="text-xs text-slate-600 font-medium">
            Drag & drop illustration CSVs here, or <span className="font-semibold text-slate-900 underline">select files</span>
          </div>
        </div>
      </div>

      {/* Success Banner */}
      {successMsg && (
        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-800 text-xs font-medium flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Parse Error Banners */}
      {parseErrors.length > 0 && (
        <div className="space-y-1.5">
          {parseErrors.map((err, idx) => (
            <div
              key={idx}
              className="p-2.5 bg-rose-50 border border-rose-200 rounded-md text-rose-800 text-xs flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="font-semibold truncate">{err.fileName}:</span>
                <span className="truncate">{err.message}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  dismissError(err.fileName);
                }}
                className="text-rose-600 hover:text-rose-900 p-0.5 shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
