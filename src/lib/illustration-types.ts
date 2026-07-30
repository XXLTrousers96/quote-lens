export interface IllustrationRow {
  year: number;
  age: number;
  totalPayment: number;
  afterTaxOutlay: number;
  accountValue: number;
  surrenderValue: number;
  deathBenefit: number;
  fixedInterestRate: number;
  indexedInterestRate: number;
}

export interface Illustration {
  id: string;
  fileName: string;
  carrier: string;
  product: string;
  payPeriodLabel: string;
  customDisplayName?: string;
  hidden?: boolean;
  issueAge: number;
  faceAmount: number;
  annualPremium: number;
  totalPremium: number;
  rows: IllustrationRow[];
}

export interface ParseError {
  fileName: string;
  message: string;
}
