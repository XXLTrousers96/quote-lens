import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { IllustrationsProvider } from './lib/illustrations-context';
import { AppHeader } from './components/app-header';
import { UploadPage } from './pages/index';
import { AnalysisPage } from './pages/analysis';

export const App: React.FC = () => {
  return (
    <IllustrationsProvider>
      <HashRouter>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
          <AppHeader />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<UploadPage />} />
              <Route path="/analysis" element={<AnalysisPage />} />
            </Routes>
          </main>
        </div>
      </HashRouter>
    </IllustrationsProvider>
  );
};

export default App;
