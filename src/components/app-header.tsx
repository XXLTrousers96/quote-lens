import React from 'react';
import { NavLink } from 'react-router-dom';
import { useIllustrations } from '../lib/illustrations-context';

export const AppHeader: React.FC = () => {
  const { illustrations } = useIllustrations();

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Minimal Brand Title */}
          <div className="flex items-center gap-3">
            <span className="font-semibold text-base tracking-tight text-white">QuoteLens</span>
            <span className="text-slate-500 text-xs font-normal">|</span>
            <span className="text-xs text-slate-400 font-medium">Illustration Analytics</span>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`
              }
            >
              <span>Upload</span>
              {illustrations.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 text-[10px] rounded bg-slate-700 text-slate-200 font-medium">
                  {illustrations.length}
                </span>
              )}
            </NavLink>

            <NavLink
              to="/analysis"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`
              }
            >
              Analysis
            </NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
};
