import { abflConfig } from './config.js';
import { calculateAbflEligibility as calculateFrontendAbflEligibility } from '../../../src/banks/abfl/calculator.js';

export const calculateAbflEligibility = (userData = {}) => {
  return calculateFrontendAbflEligibility(userData);
};
