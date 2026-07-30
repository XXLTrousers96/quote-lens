import React from 'react';
import { Illustration } from '../lib/illustration-types';

export interface OutputModuleProps {
  illustrations: Illustration[];
  referenceAge: number;
  onReferenceAgeChange?: (newAge: number) => void;
}

export interface OutputModule {
  id: string;
  label: string;
  description?: string;
  Component: React.FC<OutputModuleProps>;
}
