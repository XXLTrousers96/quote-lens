import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Illustration, ParseError } from './illustration-types';
import { parseCsvText } from './csv-parser';

interface IllustrationsContextType {
  illustrations: Illustration[];
  parseErrors: ParseError[];
  referenceAge: number;
  addFiles: (files: FileList | File[]) => Promise<number>;
  removeIllustration: (id: string) => void;
  moveIllustration: (id: string, direction: 'up' | 'down') => void;
  updateCustomDisplayName: (id: string, name: string) => void;
  resetCustomDisplayName: (id: string) => void;
  toggleIllustrationVisibility: (id: string) => void;
  clearAll: () => void;
  setReferenceAge: (age: number) => void;
  dismissError: (fileName: string) => void;
  clearErrors: () => void;
}

const IllustrationsContext = createContext<IllustrationsContextType | undefined>(undefined);

export const IllustrationsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [illustrations, setIllustrations] = useState<Illustration[]>([]);
  const [parseErrors, setParseErrors] = useState<ParseError[]>([]);
  const [referenceAge, setReferenceAge] = useState<number>(90);

  const addFiles = async (files: FileList | File[]): Promise<number> => {
    const fileArray = Array.from(files);
    const newIllustrations: Illustration[] = [];
    const newErrors: ParseError[] = [];

    for (const file of fileArray) {
      if (!file.name.toLowerCase().endsWith('.csv')) {
        newErrors.push({
          fileName: file.name,
          message: 'Only CSV files are supported.',
        });
        continue;
      }

      try {
        const text = await file.text();
        const parsed = parseCsvText(text, file.name);
        newIllustrations.push(parsed);
      } catch (err: any) {
        newErrors.push({
          fileName: file.name,
          message: err.message || 'Failed to parse CSV file.',
        });
      }
    }

    if (newIllustrations.length > 0) {
      setIllustrations((prev) => [...prev, ...newIllustrations]);
    }
    if (newErrors.length > 0) {
      setParseErrors((prev) => [...prev, ...newErrors]);
    }

    return newIllustrations.length;
  };

  const removeIllustration = (id: string) => {
    setIllustrations((prev) => prev.filter((item) => item.id !== id));
  };

  const moveIllustration = (id: string, direction: 'up' | 'down') => {
    setIllustrations((prev) => {
      const idx = prev.findIndex((item) => item.id === id);
      if (idx === -1) return prev;
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= prev.length) return prev;

      const next = [...prev];
      const temp = next[idx];
      next[idx] = next[targetIdx];
      next[targetIdx] = temp;
      return next;
    });
  };

  const updateCustomDisplayName = (id: string, name: string) => {
    setIllustrations((prev) =>
      prev.map((item) => (item.id === id ? { ...item, customDisplayName: name } : item))
    );
  };

  const resetCustomDisplayName = (id: string) => {
    setIllustrations((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const { customDisplayName, ...rest } = item;
          return rest;
        }
        return item;
      })
    );
  };

  const toggleIllustrationVisibility = (id: string) => {
    setIllustrations((prev) =>
      prev.map((item) => (item.id === id ? { ...item, hidden: !item.hidden } : item))
    );
  };

  const clearAll = () => {
    setIllustrations([]);
    setParseErrors([]);
  };

  const dismissError = (fileName: string) => {
    setParseErrors((prev) => prev.filter((e) => e.fileName !== fileName));
  };

  const clearErrors = () => {
    setParseErrors([]);
  };

  return (
    <IllustrationsContext.Provider
      value={{
        illustrations,
        parseErrors,
        referenceAge,
        addFiles,
        removeIllustration,
        moveIllustration,
        updateCustomDisplayName,
        resetCustomDisplayName,
        toggleIllustrationVisibility,
        clearAll,
        setReferenceAge,
        dismissError,
        clearErrors,
      }}
    >
      {children}
    </IllustrationsContext.Provider>
  );
};

export const useIllustrations = (): IllustrationsContextType => {
  const context = useContext(IllustrationsContext);
  if (!context) {
    throw new Error('useIllustrations must be used within an IllustrationsProvider');
  }
  return context;
};
