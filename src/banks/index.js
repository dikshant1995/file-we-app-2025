// Export all bank configurations
import { kotakConfig } from './kotak/config.js';
import { hdfcConfig } from './hdfc/config.js';
import { iciciConfig } from './icici/config.js';
import { bandhanConfig } from './bandhan/config.js';
import { cholaConfig } from './chola/config.js';
import { tataConfig } from './tata/config.js';
import { poonawalaConfig } from './poonawala/config.js';
import { axisFinConfig } from './axis-fin/config.js';
import { shriRamConfig } from './shri-ram/config.js';
import { piramalConfig } from './piramal/config.js';
import { indusindConfig } from './indusind/config.js';
import { idfcConfig } from './idfc/config.js';

// Re-export individual configs
export { kotakConfig, hdfcConfig, iciciConfig, bandhanConfig, cholaConfig, tataConfig, poonawalaConfig, axisFinConfig, shriRamConfig, piramalConfig, indusindConfig, idfcConfig };

// Export all bank configurations as an array
export const allBankConfigs = [
  kotakConfig,
  hdfcConfig,
  iciciConfig,
  bandhanConfig,
  cholaConfig,
  tataConfig,
  poonawalaConfig,
  axisFinConfig,
  shriRamConfig,
  piramalConfig,
  indusindConfig,
  idfcConfig
];