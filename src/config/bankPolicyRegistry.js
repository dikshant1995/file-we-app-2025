// Central Master Registry of all 19 Institution Policies from BANKS POLICYS.xlsx
import { AXIS_BANK_EXCEL_POLICY } from './axisBankPolicy.js';
import { INDUSIND_BANK_EXCEL_POLICY } from './indusindBankPolicy.js';
import { HDFC_BANK_EXCEL_POLICY } from './hdfcBankPolicy.js';
import { ICICI_BANK_EXCEL_POLICY } from './iciciBankPolicy.js';
import { KOTAK_BANK_EXCEL_POLICY } from './kotakBankPolicy.js';
import { TATA_BANK_EXCEL_POLICY } from './tataBankPolicy.js';
import { BAJAJ_BANK_EXCEL_POLICY } from './bajajBankPolicy.js';
import { BANDHAN_BANK_EXCEL_POLICY } from './bandhanBankPolicy.js';
import { IDFC_BANK_EXCEL_POLICY } from './idfcBankPolicy.js';
import { AU_BANK_EXCEL_POLICY } from './auBankPolicy.js';
import { AXIS_FINANCE_EXCEL_POLICY } from './axisFinPolicy.js';
import { CHOLA_BANK_EXCEL_POLICY } from './cholaBankPolicy.js';
import { LNT_BANK_EXCEL_POLICY } from './lntBankPolicy.js';
import { PIRAMAL_BANK_EXCEL_POLICY } from './piramalBankPolicy.js';
import { SMFG_BANK_EXCEL_POLICY } from './smfgBankPolicy.js';
import { INCRED_BANK_EXCEL_POLICY } from './incredBankPolicy.js';
import { POONAWALA_BANK_EXCEL_POLICY } from './poonawalaBankPolicy.js';
import { ABFL_BANK_EXCEL_POLICY } from './abflBankPolicy.js';
import { FINNABLE_BANK_EXCEL_POLICY } from './finnableBankPolicy.js';

export const BANK_EXCEL_POLICIES = {
  'axis-bank': AXIS_BANK_EXCEL_POLICY,
  'axis': AXIS_FINANCE_EXCEL_POLICY,
  'axis-fin': AXIS_FINANCE_EXCEL_POLICY,
  'indusind': INDUSIND_BANK_EXCEL_POLICY,
  'hdfc': HDFC_BANK_EXCEL_POLICY,
  'icici': ICICI_BANK_EXCEL_POLICY,
  'kotak': KOTAK_BANK_EXCEL_POLICY,
  'tata': TATA_BANK_EXCEL_POLICY,
  'bajaj': BAJAJ_BANK_EXCEL_POLICY,
  'bandhan': BANDHAN_BANK_EXCEL_POLICY,
  'idfc': IDFC_BANK_EXCEL_POLICY,
  'au-bank': AU_BANK_EXCEL_POLICY,
  'au': AU_BANK_EXCEL_POLICY,
  'chola': CHOLA_BANK_EXCEL_POLICY,
  'lnt': LNT_BANK_EXCEL_POLICY,
  'piramal': PIRAMAL_BANK_EXCEL_POLICY,
  'smfg': SMFG_BANK_EXCEL_POLICY,
  'incred': INCRED_BANK_EXCEL_POLICY,
  'poonawala': POONAWALA_BANK_EXCEL_POLICY,
  'abfl': ABFL_BANK_EXCEL_POLICY,
  'finnable': FINNABLE_BANK_EXCEL_POLICY
};

export const getExcelPolicyForBank = (id, name = '') => {
  const normId = String(id || '').toLowerCase().trim();
  const normName = String(name || '').toLowerCase().trim();

  if (normId === 'axis-bank' || (normName.includes('axis') && normName.includes('bank'))) {
    return AXIS_BANK_EXCEL_POLICY;
  }
  if (normId === 'axis' || normId === 'axis-fin' || normName.includes('axis finance')) {
    return AXIS_FINANCE_EXCEL_POLICY;
  }
  if (normId === 'indusind' || normName.includes('indusind')) {
    return INDUSIND_BANK_EXCEL_POLICY;
  }
  if (normId === 'hdfc' || normName.includes('hdfc')) {
    return HDFC_BANK_EXCEL_POLICY;
  }
  if (normId === 'icici' || normName.includes('icici')) {
    return ICICI_BANK_EXCEL_POLICY;
  }
  if (normId === 'kotak' || normName.includes('kotak')) {
    return KOTAK_BANK_EXCEL_POLICY;
  }
  if (normId === 'tata' || normName.includes('tata')) {
    return TATA_BANK_EXCEL_POLICY;
  }
  if (normId === 'bajaj' || normName.includes('bajaj')) {
    return BAJAJ_BANK_EXCEL_POLICY;
  }
  if (normId === 'bandhan' || normName.includes('bandhan')) {
    return BANDHAN_BANK_EXCEL_POLICY;
  }
  if (normId === 'idfc' || normName.includes('idfc')) {
    return IDFC_BANK_EXCEL_POLICY;
  }
  if (normId === 'au-bank' || normId === 'au' || normName.includes('au small') || normName.includes('au bank')) {
    return AU_BANK_EXCEL_POLICY;
  }
  if (normId === 'chola' || normName.includes('chola') || normName.includes('cholamandalam')) {
    return CHOLA_BANK_EXCEL_POLICY;
  }
  if (normId === 'lnt' || normName.includes('l&t') || normName.includes('lnt')) {
    return LNT_BANK_EXCEL_POLICY;
  }
  if (normId === 'piramal' || normName.includes('piramal')) {
    return PIRAMAL_BANK_EXCEL_POLICY;
  }
  if (normId === 'smfg' || normName.includes('smfg')) {
    return SMFG_BANK_EXCEL_POLICY;
  }
  if (normId === 'incred' || normName.includes('incred')) {
    return INCRED_BANK_EXCEL_POLICY;
  }
  if (normId === 'poonawala' || normName.includes('poonawala') || normName.includes('poonawalla')) {
    return POONAWALA_BANK_EXCEL_POLICY;
  }
  if (normId === 'abfl' || normName.includes('aditya birla') || normName.includes('abfl')) {
    return ABFL_BANK_EXCEL_POLICY;
  }
  if (normId === 'finnable' || normName.includes('finnable')) {
    return FINNABLE_BANK_EXCEL_POLICY;
  }

  return BANK_EXCEL_POLICIES[normId] || null;
};
