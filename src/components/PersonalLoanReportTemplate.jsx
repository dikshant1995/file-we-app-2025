import React, { useMemo } from 'react';

const PersonalLoanReportTemplate = ({ results, metadata }) => {
  // Extract lists
  const eligibleBanks = results ? results.filter(r => r.eligible) : [];
  const rejectedBanks = results ? results.filter(r => !r.eligible) : [];

  const formatCurrency = (amount) => {
    if (!amount) return '₹0';
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const now = new Date();
  const todayStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const uniqueReportId = useMemo(() => 'PL-' + Math.floor(100000 + Math.random() * 900000), []);

  const netSalary = parseFloat(metadata?.netSalary || 0);
  const totalIncentives = parseFloat(metadata?.incentives || 0) + parseFloat(metadata?.monthlyBonus || 0);
  const existingObligations = parseFloat(metadata?.totalObligation || 0);

  return (
    <div 
      id="pl-pdf-report-container" 
      style={{ 
        width: '210mm', 
        backgroundColor: '#f1f5f9', 
        position: 'absolute',
        left: '-9999px',
        top: 0,
        boxSizing: 'border-box',
        zIndex: -999,
        fontFamily: 'Inter, sans-serif'
      }}
    >
      {/* PAGE 1: EXECUTIVE SUMMARY */}
      <div className="pdf-page" style={{ width: '210mm', height: '297mm', padding: '16mm', backgroundColor: '#ffffff', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', backgroundColor: '#0f172a', color: '#ffffff', padding: '16px 20px', borderRadius: '10px', marginBottom: '20px', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ margin: '0 0 4px 0', fontSize: '22px', fontWeight: 800, color: 'white', WebkitTextFillColor: 'white' }}>PERSONAL LOAN ELIGIBILITY AUDIT</h1>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '10px', fontWeight: 600, letterSpacing: '1px', WebkitTextFillColor: '#94a3b8' }}>LAXMI CREDIT | Advanced Policy Engine</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: '0 0 2px 0', fontSize: '8px', color: '#94a3b8', textTransform: 'uppercase', WebkitTextFillColor: '#94a3b8' }}>Report ID & Timestamp</p>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: '#3b82f6', WebkitTextFillColor: '#3b82f6' }}>{uniqueReportId}</p>
              <p style={{ margin: '2px 0 0 0', fontSize: '9px', color: '#cbd5e1', WebkitTextFillColor: '#cbd5e1' }}>{todayStr} @ {timeStr}</p>
            </div>
          </div>
        </div>

        {/* Applicant Profile */}
        <div style={{ backgroundColor: '#f8fafc', borderRadius: '8px', padding: '14px 18px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#475569', fontWeight: 700, textTransform: 'uppercase' }}>Financial Profile Summary</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
            <div>
              <span style={{ fontSize: '9px', color: '#64748b', display: 'block', fontWeight: 500 }}>Applicant Name</span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>{metadata?.customerName || metadata?.name || 'Customer'}</span>
            </div>
            <div>
              <span style={{ fontSize: '9px', color: '#64748b', display: 'block', fontWeight: 500 }}>Company Name</span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>{metadata?.companyName || 'N/A'}</span>
            </div>
            <div>
              <span style={{ fontSize: '9px', color: '#64748b', display: 'block', fontWeight: 500 }}>Primary Category</span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#3b82f6' }}>CAT {metadata?.category || 'Unlisted'}</span>
            </div>
            <div>
              <span style={{ fontSize: '9px', color: '#64748b', display: 'block', fontWeight: 500 }}>Net Salary</span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#10b981' }}>{formatCurrency(netSalary)}</span>
            </div>
            <div>
              <span style={{ fontSize: '9px', color: '#64748b', display: 'block', fontWeight: 500 }}>Current EMI</span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#ef4444' }}>{formatCurrency(existingObligations)}</span>
            </div>
          </div>
        </div>

        {/* Educational Section */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#0f172a', fontWeight: 800, borderBottom: '2px solid #0f172a', paddingBottom: '6px' }}>UNDERSTANDING YOUR ASSESSMENT</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div style={{ backgroundColor: '#eff6ff', padding: '12px', borderRadius: '8px', border: '1px solid #dbeafe', borderLeft: '4px solid #3b82f6' }}>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '11px', color: '#1d4ed8' }}>1. The Multiplier Effect</h4>
              <p style={{ margin: 0, fontSize: '9px', color: '#1e3a8a', lineHeight: '1.4' }}>
                Banks assess your company's stability and assign it a <strong>Category (Tier)</strong>. Based on this category and your net salary, they apply a <strong>Multiplier</strong> (e.g., 20x to 30x your net salary) to determine the maximum loan amount they can risk lending you. Higher tiers get higher multipliers.
              </p>
            </div>
            <div style={{ backgroundColor: '#fef2f2', padding: '12px', borderRadius: '8px', border: '1px solid #fee2e2', borderLeft: '4px solid #ef4444' }}>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '11px', color: '#b91c1c' }}>2. FOIR (Fixed Obligation to Income Ratio)</h4>
              <p style={{ margin: 0, fontSize: '9px', color: '#7f1d1d', lineHeight: '1.4' }}>
                FOIR is the maximum percentage of your salary that banks allow to be consumed by total EMIs. For example, if the FOIR is 65% on a ₹1 Lakh salary, your total EMIs (existing + new loan) cannot exceed ₹65,000/month. This ensures you have enough disposable income.
              </p>
            </div>
            <div style={{ backgroundColor: '#ecfdf5', padding: '12px', borderRadius: '8px', border: '1px solid #d1fae5', borderLeft: '4px solid #10b981' }}>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '11px', color: '#047857' }}>3. Salary & Incentive Add-ons</h4>
              <p style={{ margin: 0, fontSize: '9px', color: '#064e3b', lineHeight: '1.4' }}>
                Alongside your fixed base salary, some banks consider a percentage of your variable pay (like bonuses or incentives) when calculating your total eligible income. We have automatically factored in your average incentives where applicable.
              </p>
            </div>
            <div style={{ backgroundColor: '#faf5ff', padding: '12px', borderRadius: '8px', border: '1px solid #f3e8ff', borderLeft: '4px solid #a855f7' }}>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '11px', color: '#7e22ce' }}>4. BT (Balance Transfer) Logic</h4>
              <p style={{ margin: 0, fontSize: '9px', color: '#581c87', lineHeight: '1.4' }}>
                If you have existing high-interest liabilities, a Balance Transfer allows you to consolidate them into a new loan. The bank clears your old debt, bypassing regular FOIR limits, and disburses the remaining <strong>Net Disbursement</strong> amount directly to you.
              </p>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div style={{ position: 'absolute', bottom: '16mm', left: '16mm', right: '16mm', borderTop: '1px solid #e2e8f0', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: '#64748b' }}>
          <span>LAXMI CREDIT SYSTEM AUTOMATION | CONFIDENTIAL FINANCIAL EVALUATION REPORT</span>
          <span style={{ fontWeight: 700 }}>Page 1 of 3</span>
        </div>
      </div>

      {/* PAGE 2: APPROVED BANKS */}
      <div className="pdf-page" style={{ width: '210mm', height: '297mm', padding: '16mm', backgroundColor: '#ffffff', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        <h2 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#0f172a', fontWeight: 800, borderBottom: '2px solid #0f172a', paddingBottom: '6px' }}>
          INSTITUTIONAL APPROVALS & CALCULATIONS
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {eligibleBanks.length > 0 ? eligibleBanks.slice(0, 5).map((bank, i) => (
            <div key={i} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '10px 15px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '13px', color: '#065f46', fontWeight: 800 }}>{bank.bankName}</h4>
                  <span style={{ fontSize: '8px', color: '#047857', fontWeight: 600, textTransform: 'uppercase' }}>Identified as Category {bank.category || metadata?.category || 'Unlisted'}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '9px', color: '#64748b', display: 'block' }}>Max Eligible Loan</span>
                  <span style={{ fontSize: '16px', color: '#10b981', fontWeight: 800 }}>{formatCurrency(bank.loanAmount)}</span>
                </div>
              </div>
              <div style={{ padding: '12px 15px', display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px' }}>
                <div>
                  <h5 style={{ margin: '0 0 8px 0', fontSize: '10px', color: '#475569', textTransform: 'uppercase' }}>Calculation Journey</h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '9px', backgroundColor: '#f8fafc', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>1. Base Salary Considered:</span>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>{formatCurrency(netSalary + (bank.details?.incentiveConsidered || bank.incentiveConsidered || 0))}</span>
                    </div>
                    {bank.details?.foirPercentage && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>2. FOIR Cap ({bank.details.foirPercentage}%):</span>
                        <span style={{ fontWeight: 600, color: '#3b82f6' }}>Max EMI Allowed: {formatCurrency((netSalary + (bank.details?.incentiveConsidered || bank.incentiveConsidered || 0)) * (parseFloat(bank.details.foirPercentage)/100))}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>3. Existing EMI Deducted:</span>
                      <span style={{ fontWeight: 600, color: '#ef4444' }}>-{formatCurrency(existingObligations)}</span>
                    </div>
                    {bank.details?.multiplier && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>4. Category Multiplier:</span>
                        <span style={{ fontWeight: 600, color: '#8b5cf6' }}>{bank.details.multiplier}x Applied</span>
                      </div>
                    )}
                    {bank.details?.limitingFactor && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>5. Limiting Factor:</span>
                        <span style={{ fontWeight: 600, color: '#b91c1c' }}>{bank.details.limitingFactor}</span>
                      </div>
                    )}
                    <div style={{ borderTop: '1px solid #e2e8f0', margin: '4px 0' }}></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#0f172a', fontWeight: 700 }}>Final Approved Loan:</span>
                      <span style={{ color: '#10b981', fontSize: '12px', fontWeight: 800 }}>{formatCurrency(bank.loanAmount)}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h5 style={{ margin: '0 0 8px 0', fontSize: '10px', color: '#475569', textTransform: 'uppercase' }}>Loan Offer Details</h5>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '4px' }}>
                      <span style={{ fontSize: '8px', color: '#64748b', display: 'block' }}>Monthly EMI</span>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a' }}>{formatCurrency(bank.monthlyEMI)}</span>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '4px' }}>
                      <span style={{ fontSize: '8px', color: '#64748b', display: 'block' }}>Interest Rate</span>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a' }}>{bank.interestRate}%</span>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '4px' }}>
                      <span style={{ fontSize: '8px', color: '#64748b', display: 'block' }}>Tenure</span>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a' }}>{bank.loanTenure} Years</span>
                    </div>
                  </div>
                  
                  {/* BT Breakdown if applicable */}
                  {(bank.isBTMode || bank.btType?.includes('BT') || bank.calculationMethod?.includes('BT')) && (
                    <div style={{ marginTop: '10px', background: 'rgba(239, 68, 68, 0.05)', padding: '8px', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                      <h6 style={{ margin: '0 0 4px 0', fontSize: '8px', color: '#b91c1c', textTransform: 'uppercase' }}>Liability Consolidation (BT)</h6>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px' }}>
                        <span style={{ color: '#64748b' }}>Existing Debt Cleared:</span>
                        <span style={{ color: '#ef4444', fontWeight: 600 }}>-{formatCurrency(bank.totalDebtCleared || bank.btTotalOutstanding)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 700, marginTop: '4px', borderTop: '1px solid rgba(239, 68, 68, 0.1)', paddingTop: '4px' }}>
                        <span style={{ color: '#0f172a' }}>Net Disbursement:</span>
                        <span style={{ color: '#10b981' }}>{formatCurrency(bank.freshAmountDisbursed)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )) : (
            <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', border: '1px dashed #cbd5e1', borderRadius: '8px', fontSize: '12px' }}>
              No institutional approvals based on the current financial profile.
            </div>
          )}
          
          {eligibleBanks.length > 5 && (
            <div style={{ textAlign: 'center', fontSize: '9px', color: '#64748b', fontStyle: 'italic', marginTop: '5px' }}>
              * Displaying top 5 approvals. Please see the web dashboard for additional offers.
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div style={{ position: 'absolute', bottom: '16mm', left: '16mm', right: '16mm', borderTop: '1px solid #e2e8f0', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: '#64748b' }}>
          <span>LAXMI CREDIT SYSTEM AUTOMATION | CONFIDENTIAL FINANCIAL EVALUATION REPORT</span>
          <span style={{ fontWeight: 700 }}>Page 2 of 3</span>
        </div>
      </div>

      {/* PAGE 3: REJECTIONS & SYSTEM AUDIT */}
      <div className="pdf-page" style={{ width: '210mm', height: '297mm', padding: '16mm', backgroundColor: '#ffffff', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        <h2 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#0f172a', fontWeight: 800, borderBottom: '2px solid #0f172a', paddingBottom: '6px' }}>
          INSTITUTIONAL REJECTIONS & SYSTEM AUDIT
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
          {rejectedBanks.length > 0 ? rejectedBanks.slice(0, 14).map((bank, i) => (
            <div key={i} style={{ border: '1px solid #fee2e2', borderRadius: '8px', backgroundColor: '#fff', overflow: 'hidden' }}>
              <div style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '8px 12px', borderBottom: '1px solid #fee2e2' }}>
                <h4 style={{ margin: 0, fontSize: '12px', color: '#b91c1c', fontWeight: 700 }}>{bank.bankName}</h4>
                {bank.category && <span style={{ fontSize: '7px', color: '#7f1d1d' }}>Category {bank.category} Policy Applied</span>}
              </div>
              <div style={{ padding: '10px 12px' }}>
                <span style={{ fontSize: '9px', color: '#64748b', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>Reason for Exclusion</span>
                <p style={{ margin: 0, fontSize: '10px', color: '#0f172a', fontWeight: 500, lineHeight: '1.4' }}>
                  {bank.reason || 'Did not meet core policy criteria.'}
                </p>
              </div>
            </div>
          )) : (
            <div style={{ gridColumn: '1 / -1', padding: '20px', textAlign: 'center', color: '#64748b', border: '1px dashed #cbd5e1', borderRadius: '8px', fontSize: '12px' }}>
              No institutional rejections.
            </div>
          )}
        </div>

        {/* Legal Disclaimer */}
        <div style={{ marginTop: 'auto', marginBottom: '20px', backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '6px', padding: '12px', fontSize: '8px', color: '#475569', lineHeight: '1.5' }}>
          <strong>REGULATORY COMPLIANCE & LEGAL NOTICE:</strong>
          <p style={{ margin: '4px 0 0 0' }}>
            This audit evaluation report is generated automatically by the Laxmi Credit Advanced Policy Engine based on the financial inputs provided (Salary, Company Category, existing Obligations). This document represents a numerical estimate of banking eligibility, multipliers, and FOIR calculations strictly under generic NBFC and Bank criteria. It is confidential, proprietary, and issued solely for initial screening and loan processing guidance. These numbers are non-binding estimates and are subject to detailed human underwriting, verification of original sources (KYC, Bank Statements, CIBIL), and final approval by the lending institutions. Calculations are dynamically compiled in INR.
          </p>
        </div>

        {/* Footer */}
        <div style={{ position: 'absolute', bottom: '16mm', left: '16mm', right: '16mm', borderTop: '1px solid #e2e8f0', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: '#64748b' }}>
          <span>LAXMI CREDIT SYSTEM AUTOMATION | CONFIDENTIAL FINANCIAL EVALUATION REPORT</span>
          <span style={{ fontWeight: 700 }}>Page 3 of 3</span>
        </div>
      </div>
    </div>
  );
};

export default PersonalLoanReportTemplate;
