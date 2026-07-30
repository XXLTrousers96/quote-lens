import { OutputModule } from './types';
import { premiumMoicModule } from './premium-moic';
import { cashValueGainsModule } from './cash-value-gains';
import { estateWealthTransferModule } from './estate-wealth-transfer';

export const outputModules: OutputModule[] = [
  premiumMoicModule,
  cashValueGainsModule,
  estateWealthTransferModule,
];

export const defaultOutputModuleId = outputModules[0].id;

export function getOutputModule(id: string): OutputModule {
  return outputModules.find((m) => m.id === id) ?? outputModules[0];
}
