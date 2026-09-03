import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import html2pdf from 'html2pdf.js';
import './CustomerResultsDisplay.css';
import { saveSelectedBanks } from '../services/leadService.js';

const CustomerResultsDisplay = ({ results, metadata, aiResult, aiInsight, onNewCalculation }) => {
  const [sortBy, setSortBy] = useState('loanAmount');
  const [filterEligible, setFilterEligible] = useState('all');
  const [selectedBanks, setSelectedBanks] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // null | 'success' | 'error'
  const [expandedBank, setExpandedBank] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!results || results.length === 0) {
    return (
      <div className="no-results-state">
        <h2>No Results to Display</h2>
        <p>Please re-run the calculation with valid data.</p>
        <button onClick={onNewCalculation} className="btn-primary">Try Again</button>
      </div>
    );
  }

  // Handle bank selection
  const handleBankSelect = (bankName, isEligible) => {
    if (!isEligible) return; // Don't allow selecting rejected banks

    if (selectedBanks.includes(bankName)) {
      setSelectedBanks(selectedBanks.filter(name => name !== bankName));
    } else {
      setSelectedBanks([...selectedBanks, bankName]);
    }
  };

  // Handle submit — sends selection to Google Sheets
  const handleSubmitSelection = async () => {
    if (selectedBanks.length === 0) {
      setSubmitStatus('noselect');
      return;
    }
    setSubmitting(true);
    setSubmitStatus(null);
    try {
      await saveSelectedBanks(metadata, selectedBanks);
      setSubmitStatus('success');
    } catch {
      setSubmitStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  // Separate eligible and rejected banks
  const eligibleBanks = results.filter(r => r.eligible);
  const rejectedBanks = results.filter(r => !r.eligible);

  // Sort eligible banks
  const sortedEligibleBanks = [...eligibleBanks].sort((a, b) => {
    if (sortBy === 'loanAmount') {
      return (b.loanAmount || 0) - (a.loanAmount || 0);
    } else if (sortBy === 'emi') {
      return (a.monthlyEMI || 0) - (b.monthlyEMI || 0);
    } else {
      return a.bankName.localeCompare(b.bankName);
    }
  });

  // Get best offer
  const bestOffer = sortedEligibleBanks.length > 0 ? sortedEligibleBanks[0] : null;

  // Calculate statistics
  const stats = {
    totalBanks: results.length,
    eligibleCount: eligibleBanks.length,
    rejectedCount: rejectedBanks.length,
    avgLoanAmount: eligibleBanks.length > 0
      ? Math.round(eligibleBanks.reduce((sum, b) => sum + (b.loanAmount || 0), 0) / eligibleBanks.length)
      : 0
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    const lakhs = (amount / 100000).toFixed(2);
    return `₹${lakhs}L`;
  };

  const formatNumber = (num) => {
    if (!num) return 'N/A';
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const generateCustomerSummaryHtml = () => {
    const applicantName = metadata?.customerName || metadata?.name || 'Valued Customer';
    const mobileNumber = metadata?.mobileNumber || 'N/A';
    const ageText = metadata?.age ? `${metadata.age} Yrs` : 'N/A';
    const maritalText = metadata?.maritalStatus 
      ? (metadata.maritalStatus.charAt(0).toUpperCase() + metadata.maritalStatus.slice(1)) 
      : 'N/A';
    
    // Location & Living Status
    const locationParts = [metadata?.city, metadata?.state].filter(Boolean);
    const locationText = locationParts.length > 0 ? locationParts.join(', ') : 'India';
    const livingText = metadata?.livingStatus 
      ? (metadata.livingStatus.charAt(0).toUpperCase() + metadata.livingStatus.slice(1)) 
      : 'Owned/Rented';

    // Employment
    const companyName = metadata?.companyName || results?.find(r => r.companyName)?.companyName || 'LaxmiCredit';
    const employmentText = metadata?.employmentType 
      ? (metadata.employmentType === 'government' ? 'Government Employee' : 'Salaried Professional')
      : 'Salaried Professional';
    const categoryTier = results?.find(r => r.category)?.category || metadata?.category || 'Category B';

    // Income
    const rawSalary = parseFloat(metadata?.basicSalary) || parseFloat(metadata?.monthlyIncome) || 0;
    const salaryText = rawSalary > 0 ? `₹${rawSalary.toLocaleString('en-IN')}` : 'N/A';
    const salaryModeText = metadata?.salaryMode 
      ? (metadata.salaryMode === 'bank' ? 'Bank Credit' : metadata.salaryMode.toUpperCase()) 
      : 'Bank Credit';

    // Existing Obligations
    const existingLoansList = Array.isArray(metadata?.existingLoans) ? metadata.existingLoans : [];
    const totalExistingEMI = existingLoansList.reduce((sum, loan) => sum + (parseFloat(loan.emi) || 0), 0);
    const existingLoansText = totalExistingEMI > 0 
      ? `₹${totalExistingEMI.toLocaleString('en-IN')}/mo (${existingLoansList.length} Active Loans)`
      : 'Zero Active Loans (Nil EMI)';

    const reportDate = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const approvalRate = Math.round((stats.eligibleCount / stats.totalBanks) * 100);

    const formatLakhs = (amt) => amt ? `₹${(amt / 100000).toFixed(2)}L` : 'N/A';
    const formatInr = (amt) => amt ? `₹${amt.toLocaleString('en-IN')}` : 'N/A';

    const rowsHtml = sortedEligibleBanks.map((b, idx) => `
      <tr style="background: ${b === bestOffer ? '#FFF7ED' : (idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC')}; border-bottom: 1px solid #E2E8F0;">
        <td style="padding: 10px 12px; font-weight: 700; color: rgb(66, 66, 66); font-size: 13px;">
          ${b.bankName} ${b === bestOffer ? '<span style="color: #F58220; font-size: 11px; margin-left: 4px; font-weight: 800;">★ Top Pick</span>' : ''}
        </td>
        <td style="padding: 10px 12px; text-align: right; font-weight: 800; color: #F58220; font-size: 14px;">
          ${formatLakhs(b.loanAmount)}
        </td>
        <td style="padding: 10px 12px; text-align: right; font-weight: 750; color: #1E40AF; font-size: 13px;">
          ${formatInr(b.monthlyEMI)}
        </td>
        <td style="padding: 10px 12px; text-align: center; font-weight: 600; color: rgb(66, 66, 66); font-size: 13px;">
          ${b.roi || 11}%
        </td>
        <td style="padding: 10px 12px; text-align: center; font-weight: 600; color: rgb(66, 66, 66); font-size: 13px;">
          ${b.tenure || 5} Years
        </td>
        <td style="padding: 10px 12px; text-align: center;">
          <span style="background: #ECFDF5; color: #15803D; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 10px; border: 1px solid #A7F3D0;">
            Pre-Approved
          </span>
        </td>
      </tr>
    `).join('');

    return `
      <div style="width: 760px; padding: 20px 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: rgb(66, 66, 66); background: #ffffff; box-sizing: border-box;">
        
        <!-- PAGE 1: EXECUTIVE ASSESSMENT SUMMARY -->
        <div style="min-height: 980px; display: flex; flex-direction: column; justify-content: space-between; page-break-after: always; break-after: always; margin-bottom: 20px;">
          <div>
            <!-- Header with Branding -->
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2.5px solid #F58220; padding-bottom: 12px; margin-bottom: 18px;">
              <div>
                <div style="font-size: 22px; font-weight: 800; color: #1E40AF; letter-spacing: -0.5px;">
                  Laxmi <span style="color: #F58220;">Credit</span>
                </div>
                <div style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px;">
                  LaxmiCredit • Multi-Bank Institutional Lending Engine
                </div>
              </div>
              <div style="text-align: right;">
                <span style="background: #EEF3FA; color: #1E40AF; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px; border: 1px solid #BFDBFE; display: inline-block; margin-bottom: 4px;">
                  🛡️ Zero CIBIL Score Impact
                </span>
                <div style="font-size: 11px; color: #64748b;">
                  Assessment Date: ${reportDate}
                </div>
              </div>
            </div>

            <!-- Title -->
            <div style="text-align: center; margin-bottom: 18px;">
              <h1 style="font-size: 24px; font-weight: 800; color: rgb(66, 66, 66); margin: 0 0 4px 0;">
                Personal Loan <span style="color: #F58220;">Eligibility Summary</span>
              </h1>
              <p style="font-size: 13px; color: #64748b; margin: 0;">
                Verified institutional evaluation across ${results.length} leading partner banking institutions
              </p>
            </div>

            <!-- Customer Application Details (Complete Profile Form Data) -->
            <div style="background: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 10px; padding: 12px 16px; margin-bottom: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: 1.5px solid #E2E8F0; padding-bottom: 5px;">
                <div style="font-size: 11px; font-weight: 800; color: #1E40AF; text-transform: uppercase; letter-spacing: 0.5px;">
                  📋 Verified Customer Application Information
                </div>
                <div style="font-size: 10px; color: #15803D; font-weight: 700; background: #ECFDF5; padding: 2px 8px; border-radius: 10px; border: 1px solid #A7F3D0;">
                  ✓ Form Verified
                </div>
              </div>

              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="width: 25%; vertical-align: top; padding: 3px 6px 5px 0;">
                    <div style="font-size: 9.5px; color: #64748b; text-transform: uppercase; font-weight: 600;">Applicant Name</div>
                    <div style="font-size: 12.5px; font-weight: 750; color: rgb(66, 66, 66); margin-top: 1px;">${applicantName}</div>
                  </td>
                  <td style="width: 25%; vertical-align: top; padding: 3px 6px 5px 0;">
                    <div style="font-size: 9.5px; color: #64748b; text-transform: uppercase; font-weight: 600;">Mobile Number</div>
                    <div style="font-size: 12.5px; font-weight: 750; color: rgb(66, 66, 66); margin-top: 1px;">${mobileNumber}</div>
                  </td>
                  <td style="width: 25%; vertical-align: top; padding: 3px 6px 5px 0;">
                    <div style="font-size: 9.5px; color: #64748b; text-transform: uppercase; font-weight: 600;">Age & Marital Status</div>
                    <div style="font-size: 12.5px; font-weight: 750; color: rgb(66, 66, 66); margin-top: 1px;">${ageText} • ${maritalText}</div>
                  </td>
                  <td style="width: 25%; vertical-align: top; padding: 3px 0 5px 0;">
                    <div style="font-size: 9.5px; color: #64748b; text-transform: uppercase; font-weight: 600;">Location & Residence</div>
                    <div style="font-size: 12.5px; font-weight: 750; color: rgb(66, 66, 66); margin-top: 1px;">${locationText} (${livingText})</div>
                  </td>
                </tr>
                <tr>
                  <td style="width: 25%; vertical-align: top; padding: 5px 6px 2px 0; border-top: 1px dashed #E2E8F0;">
                    <div style="font-size: 9.5px; color: #64748b; text-transform: uppercase; font-weight: 600;">Employer Organization</div>
                    <div style="font-size: 12.5px; font-weight: 750; color: rgb(66, 66, 66); margin-top: 1px;">${companyName}</div>
                  </td>
                  <td style="width: 25%; vertical-align: top; padding: 5px 6px 2px 0; border-top: 1px dashed #E2E8F0;">
                    <div style="font-size: 9.5px; color: #64748b; text-transform: uppercase; font-weight: 600;">Employment & Tier</div>
                    <div style="font-size: 12.5px; font-weight: 750; color: rgb(66, 66, 66); margin-top: 1px;">${employmentText} (${categoryTier})</div>
                  </td>
                  <td style="width: 25%; vertical-align: top; padding: 5px 6px 2px 0; border-top: 1px dashed #E2E8F0;">
                    <div style="font-size: 9.5px; color: #64748b; text-transform: uppercase; font-weight: 600;">Net Monthly Salary</div>
                    <div style="font-size: 12.5px; font-weight: 750; color: #1E40AF; margin-top: 1px;">${salaryText} <span style="font-size: 9.5px; font-weight: normal; color: #64748b;">(${salaryModeText})</span></div>
                  </td>
                  <td style="width: 25%; vertical-align: top; padding: 5px 0 2px 0; border-top: 1px dashed #E2E8F0;">
                    <div style="font-size: 9.5px; color: #64748b; text-transform: uppercase; font-weight: 600;">Active Loan Obligations</div>
                    <div style="font-size: 12.5px; font-weight: 750; color: rgb(66, 66, 66); margin-top: 1px;">${existingLoansText}</div>
                  </td>
                </tr>
              </table>
            </div>

            <!-- Key Highlights (4 Metrics) -->
            <table style="width: 100%; border-collapse: separate; border-spacing: 8px; margin-bottom: 18px; margin-left: -8px; margin-right: -8px;">
              <tr>
                <td style="width: 25%; background: #FFF4EC; border: 1.5px solid #F58220; border-radius: 10px; padding: 12px; text-align: center;">
                  <div style="font-size: 10px; font-weight: 700; color: #F58220; text-transform: uppercase;">Highest Sanction</div>
                  <div style="font-size: 20px; font-weight: 800; color: #F58220; margin: 3px 0 1px;">
                    ${bestOffer ? formatLakhs(bestOffer.loanAmount) : 'N/A'}
                  </div>
                  <div style="font-size: 10px; color: #9a3412; font-weight: 600;">${bestOffer?.bankName || 'Top Offer'}</div>
                </td>
                <td style="width: 25%; background: #EEF3FA; border: 1.5px solid #BFDBFE; border-radius: 10px; padding: 12px; text-align: center;">
                  <div style="font-size: 10px; font-weight: 700; color: #1E40AF; text-transform: uppercase;">Optimal Monthly EMI</div>
                  <div style="font-size: 20px; font-weight: 800; color: #1E40AF; margin: 3px 0 1px;">
                    ${bestOffer ? formatInr(bestOffer.monthlyEMI) : 'N/A'}
                  </div>
                  <div style="font-size: 10px; color: #1E40AF; font-weight: 600;">Per Month</div>
                </td>
                <td style="width: 25%; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 12px; text-align: center;">
                  <div style="font-size: 10px; font-weight: 700; color: rgb(66, 66, 66); text-transform: uppercase;">Interest Rate</div>
                  <div style="font-size: 20px; font-weight: 800; color: rgb(66, 66, 66); margin: 3px 0 1px;">
                    ${bestOffer?.roi || 11}%
                  </div>
                  <div style="font-size: 10px; color: #64748b; font-weight: 600;">p.a. onwards</div>
                </td>
                <td style="width: 25%; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 12px; text-align: center;">
                  <div style="font-size: 10px; font-weight: 700; color: #15803D; text-transform: uppercase;">Approval Success</div>
                  <div style="font-size: 20px; font-weight: 800; color: #15803D; margin: 3px 0 1px;">
                    ${approvalRate}%
                  </div>
                  <div style="font-size: 10px; color: #15803D; font-weight: 600;">${stats.eligibleCount} of ${stats.totalBanks} Approved</div>
                </td>
              </tr>
            </table>

            <!-- Spotlight Best Offer Card -->
            ${bestOffer ? `
              <div style="background: #FFF9F5; border: 2px solid #F58220; border-radius: 12px; padding: 16px 20px; margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #FED7AA; padding-bottom: 8px; margin-bottom: 12px;">
                  <div>
                    <span style="background: #F58220; color: #ffffff; font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 12px; letter-spacing: 0.5px; margin-right: 8px;">
                      ⭐ TOP RECOMMENDED OFFER
                    </span>
                    <span style="font-size: 18px; font-weight: 800; color: rgb(66, 66, 66);">
                      ${bestOffer.bankName}
                    </span>
                  </div>
                  <span style="background: #EEF3FA; color: #1E40AF; font-size: 11px; font-weight: 750; padding: 3px 10px; border-radius: 12px;">
                    Pre-Approved
                  </span>
                </div>
                <table style="width: 100%; border: none;">
                  <tr>
                    <td style="width: 25%;">
                      <div style="font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 600;">Sanctioned Limit</div>
                      <div style="font-size: 20px; font-weight: 800; color: #F58220; margin-top: 2px;">${formatLakhs(bestOffer.loanAmount)}</div>
                    </td>
                    <td style="width: 25%;">
                      <div style="font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 600;">Monthly EMI</div>
                      <div style="font-size: 20px; font-weight: 800; color: #1E40AF; margin-top: 2px;">${formatInr(bestOffer.monthlyEMI)}</div>
                    </td>
                    <td style="width: 25%;">
                      <div style="font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 600;">Interest Rate (ROI)</div>
                      <div style="font-size: 20px; font-weight: 800; color: rgb(66, 66, 66); margin-top: 2px;">${bestOffer.roi}%</div>
                    </td>
                    <td style="width: 25%;">
                      <div style="font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 600;">Tenure</div>
                      <div style="font-size: 20px; font-weight: 800; color: rgb(66, 66, 66); margin-top: 2px;">${bestOffer.tenure} Years</div>
                    </td>
                  </tr>
                </table>
              </div>
            ` : ''}
          </div>

          <!-- Page 1 Footer -->
          <div style="border-top: 1px solid #E2E8F0; padding-top: 8px; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8;">
            <span>LaxmiCredit Multi-Bank Rule Engine • Confidential Eligibility Assessment</span>
            <span>Page 1 of 2</span>
          </div>
        </div>

        <!-- PAGE 2: COMPARATIVE OFFERS TABLE & NEXT STEPS -->
        <div style="min-height: 980px; display: flex; flex-direction: column; justify-content: space-between; padding-top: 10px;">
          <div>
            <!-- Page 2 Header -->
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #E2E8F0; padding-bottom: 8px; margin-bottom: 16px;">
              <div style="font-size: 17px; font-weight: 800; color: rgb(66, 66, 66);">
                Pre-Approved <span style="color: #F58220;">Bank Offers Comparison</span>
              </div>
              <div style="font-size: 11px; color: #64748b;">
                Applicant: <strong>${applicantName}</strong>
              </div>
            </div>

            <!-- Comparison Table -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <thead>
                <tr style="background: linear-gradient(135deg, #1E40AF 0%, #2563EB 60%, #F58220 100%); color: #ffffff;">
                  <th style="padding: 8px 12px; text-align: left; font-size: 11px; font-weight: 700; border-radius: 4px 0 0 0;">Lending Institution</th>
                  <th style="padding: 8px 12px; text-align: right; font-size: 11px; font-weight: 700;">Loan Sanction</th>
                  <th style="padding: 8px 12px; text-align: right; font-size: 11px; font-weight: 700;">Monthly EMI</th>
                  <th style="padding: 8px 12px; text-align: center; font-size: 11px; font-weight: 700;">ROI</th>
                  <th style="padding: 8px 12px; text-align: center; font-size: 11px; font-weight: 700;">Tenure</th>
                  <th style="padding: 8px 12px; text-align: center; font-size: 11px; font-weight: 700; border-radius: 0 4px 0 0;">Status</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
              </tbody>
            </table>

            <!-- Next Steps -->
            <div style="background: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 10px; padding: 14px 18px; margin-bottom: 16px;">
              <div style="font-size: 11px; font-weight: 800; color: #1E40AF; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;">
                ⚡ 3 Simple Steps to Claim Your Loan Sanction
              </div>
              <table style="width: 100%; border: none; font-size: 11px;">
                <tr>
                  <td style="width: 33%; vertical-align: top; padding-right: 10px;">
                    <strong style="color: #F58220;">1. Select Preferred Bank</strong>
                    <div style="color: #64748b; margin-top: 2px; line-height: 1.4;">Choose the offer best matching your required amount or lowest monthly EMI.</div>
                  </td>
                  <td style="width: 33%; vertical-align: top; padding-right: 10px;">
                    <strong style="color: #1E40AF;">2. Digital Verification</strong>
                    <div style="color: #64748b; margin-top: 2px; line-height: 1.4;">Fast-track 100% paperless KYC and salary account verification.</div>
                  </td>
                  <td style="width: 33%; vertical-align: top;">
                    <strong style="color: #15803D;">3. Instant Disbursement</strong>
                    <div style="color: #64748b; margin-top: 2px; line-height: 1.4;">Approved loan amount is credited directly into your salary bank account.</div>
                  </td>
                </tr>
              </table>
            </div>

            <!-- Advisory -->
            <div style="background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 6px; padding: 10px 14px; font-size: 10px; color: #92400E; line-height: 1.4;">
              <strong>Advisory Notice:</strong> The terms and sanction amounts presented herein represent algorithmic pre-approvals based on multi-bank credit policy rules. Final sanction and disbursal remain subject to bank document verification. Soft inquiry has zero impact on your CIBIL score.
            </div>
          </div>

          <!-- Page 2 Footer -->
          <div style="border-top: 1px solid #E2E8F0; padding-top: 8px; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8;">
            <span>LaxmiCredit Multi-Bank Rule Engine • Zero Bureau Impact Guaranteed</span>
            <span>Page 2 of 2</span>
          </div>
        </div>
      </div>
    `;
  };

  const handleDownloadReport = async () => {
    if (isDownloading) return;
    try {
      setIsDownloading(true);

      const rawFullName = metadata?.customerName || metadata?.name || metadata?.applicantName || 'Customer';
      // Extract FIRST NAME ONLY
      const firstName = String(rawFullName).trim().split(/\s+/)[0] || 'Customer';
      const cleanFirstName = firstName.replace(/[^a-zA-Z0-9]/g, '') || 'Customer';
      const cleanFileName = `${cleanFirstName}_Loan_Eligibility_Report.pdf`;

      const reportHtml = generateCustomerSummaryHtml();

      const opt = {
        margin: [6, 6, 6, 6],
        filename: cleanFileName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(reportHtml).save();
    } catch (err) {
      console.error('PDF download error, fallback to print:', err);
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="customer-results-display">
      {/* Results Header */}
      <div className="results-header">
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 style={{
            fontFamily: 'Outfit, "Plus Jakarta Sans", Inter, sans-serif',
            fontStyle: 'normal',
            fontWeight: 750,
            color: 'rgb(66, 66, 66)',
            fontSize: '43px',
            lineHeight: '54px',
            margin: '0 0 6px 0'
          }}>
            Institutional <span style={{ color: '#F58220' }}>Eligibility Analysis</span>
          </h2>
          <div style={{ width: '42px', height: '3.5px', backgroundColor: '#F58220', borderRadius: '2px', margin: '0 auto 12px' }} />

          {/* Executive Applicant & Company Profile Bar */}
          <div className="report-applicant-strip" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '10px',
            margin: '16px auto 14px',
            maxWidth: '850px'
          }}>
            <span className="category-pill" style={{
              background: '#F8FAFC',
              color: 'rgb(66, 66, 66)',
              padding: '7px 18px',
              borderRadius: '20px',
              fontSize: '0.92rem',
              fontWeight: 700,
              border: '1px solid #E2E8F0',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              Category: <strong>{results.find(r => r.category)?.category || metadata?.category || 'Category B'}</strong>
            </span>
            <span style={{
              background: '#EEF3FA',
              color: '#1E40AF',
              padding: '7px 18px',
              borderRadius: '20px',
              fontSize: '0.92rem',
              fontWeight: 700,
              border: '1px solid #BFDBFE',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              🛡️ Zero CIBIL Impact
            </span>
          </div>

          <p style={{
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            fontSize: '1.02rem',
            color: 'rgb(66, 66, 66)',
            lineHeight: '1.6',
            maxWidth: '750px',
            margin: '12px auto 0',
            fontWeight: 500,
            textWrap: 'balance'
          }}>
            Verified assessment results across {results.length} banking institutions with zero impact on CIBIL score.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', flexWrap: 'wrap', marginTop: '20px' }}>
            <button 
              className="btn-edit-details"
              onClick={onNewCalculation}
              style={{
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontWeight: 700,
                color: '#1E40AF',
                fontSize: '16px',
                background: '#EEF3FA',
                border: '1.5px solid #BFDBFE',
                borderRadius: '50px',
                padding: '13px 28px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(30, 64, 175, 0.08)'
              }}
            >
              <span>✏️</span> Edit / Change Details
            </button>

            <button 
              className="btn-download-pdf" 
              onClick={handleDownloadReport}
              disabled={isDownloading}
              style={{
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
                fontStyle: 'normal',
                fontWeight: 750,
                color: 'rgb(255, 255, 255)',
                fontSize: '18px',
                lineHeight: 'normal',
                background: isDownloading ? '#9ca3af' : 'rgb(245, 130, 32)',
                border: 'none',
                borderRadius: '50px',
                padding: '14px 36px',
                cursor: isDownloading ? 'wait' : 'pointer',
                boxShadow: '0 4px 16px rgba(245, 130, 32, 0.35)',
                transition: 'all 0.25s ease',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                opacity: isDownloading ? 0.8 : 1
              }}
            >
              {isDownloading ? 'Downloading Report...' : 'Download your eligibility report'}
            </button>
          </div>
        </div>
      </div>

      {/* 🧠 NEURAL PREDICTION BANNER */}
      {aiResult && (
        <div className="neural-prediction-banner">
          <div className="neural-icon">🧠</div>
          <div className="neural-content">
            <h3>Neural AI Prediction</h3>
            <p className="neural-desc">Our brain has analyzed 3 Crore historical patterns for your profile.</p>
            <div className="neural-stats">
              <div className="neural-stat">
                <span className="stat-label">AI Estimated Sanction:</span>
                <span className="stat-value">₹{aiResult.predictedAmount.toLocaleString()}</span>
              </div>
              <div className="neural-stat">
                <span className="stat-label">Neural Confidence:</span>
                <div className="confidence-container">
                  <div className="confidence-bar" style={{ width: `${aiResult.confidence}%` }}></div>
                  <span className="confidence-text">{aiResult.confidence}%</span>
                </div>
              </div>
            </div>
            <p className="neural-insight">
              {aiResult.predictedAmount > (stats?.avgLoanAmount || 0) 
                ? "✨ Insight: Our AI detects hidden eligibility beyond standard rules."
                : "🔍 Insight: Your profile matches standard high-approval patterns."}
            </p>
          </div>
        </div>
      )}

      {/* 🗣️ LINGUISTIC AI INSIGHT (Human Voice) */}
      {aiInsight && (
        <div className={`ai-insight-bubble ${aiInsight.tone}`}>
          <div className="advisor-header">
            <span className="advisor-label">Personal Financial Advisor</span>
            <div className="pulse-indicator"></div>
          </div>
          <div className="insight-text">
            {aiInsight.message.split('**').map((part, i) => 
              i % 2 === 1 ? <strong key={i}>{part}</strong> : part
            )}
          </div>
        </div>
      )}

      {/* 📊 VISUAL ANALYTICS SUITE (Pie/Bars Comparison) */}
      {eligibleBanks.length > 0 && (
        <div className="visual-analytics-container">
          {/* Bar Comparison Chart */}
          <div className="chart-card">
            <h4>Top Eligible Offer Comparison</h4>
            <div className="bar-chart-wrapper">
              {sortedEligibleBanks.slice(0, 5).map((bank, i) => {
                const maxPossibleInView = sortedEligibleBanks[0].loanAmount || 1;
                const percentage = ((bank.loanAmount || 0) / maxPossibleInView) * 100;
                return (
                  <div key={i} className="comparison-bar-row">
                    <div className="bar-info">
                      <span className="bar-bank-name">{bank.bankName}</span>
                      <span className="bar-amount">{formatCurrency(bank.loanAmount)}</span>
                    </div>
                    <div className="bar-track">
                      <motion.div 
                        className="bar-fill"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${percentage}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Success Pie Gauge */}
          <div className="chart-card">
            <h4>Approval Success Rate</h4>
            <div className="gauge-flex">
              <div className="gauge-svg-container">
                <svg className="gauge-svg" viewBox="0 0 100 100">
                  <defs>
                    <linearGradient id="gradientGauge" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#1E40AF" />
                      <stop offset="50%" stopColor="#2563EB" />
                      <stop offset="100%" stopColor="#F58220" />
                    </linearGradient>
                  </defs>
                  {/* Background Ring */}
                  <circle className="gauge-bg" cx="50" cy="50" r="40" />
                  {/* Filled Ring */}
                  <motion.circle 
                    className="gauge-fill" 
                    cx="50" cy="50" r="40"
                    initial={{ strokeDasharray: "0, 251.2" }}
                    whileInView={{ strokeDasharray: `${(Math.round((stats.eligibleCount / stats.totalBanks) * 100) / 100) * 251.2}, 251.2` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
                  />
                </svg>
                <div className="gauge-content-center">
                  <div className="gauge-percentage" style={{ color: '#1E40AF' }}>
                    {Math.round((stats.eligibleCount / stats.totalBanks) * 100)}%
                  </div>
                  <div className="gauge-label" style={{ color: 'rgb(66, 66, 66)' }}>Approved</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card" style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', padding: '22px 18px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
          <div className="stat-value" style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.85rem', fontWeight: 800, color: '#1E40AF', marginBottom: '8px' }}>
            {stats.eligibleCount}/{stats.totalBanks}
          </div>
          <div className="stat-label" style={{ fontSize: '0.82rem', color: 'rgb(66, 66, 66)', fontWeight: 750, textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 1, display: 'block' }}>
            Institutions Evaluated
          </div>
        </div>

        {bestOffer && (
          <>
            <div className="stat-card highlight" style={{ background: '#FFF4EC', border: '2px solid #f58220', padding: '22px 18px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 6px 20px rgba(245, 130, 32, 0.12)' }}>
              <div className="stat-value" style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.85rem', fontWeight: 800, color: '#f58220', marginBottom: '8px' }}>
                {formatCurrency(bestOffer.loanAmount)}
              </div>
              <div className="stat-label" style={{ fontSize: '0.82rem', color: '#f58220', fontWeight: 750, textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 1, display: 'block' }}>
                Maximum Opportunity ({bestOffer.bankName})
              </div>
            </div>

            <div className="stat-card" style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', padding: '22px 18px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
              <div className="stat-value" style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.85rem', fontWeight: 800, color: '#1E40AF', marginBottom: '8px' }}>
                {formatNumber(bestOffer.monthlyEMI)}
              </div>
              <div className="stat-label" style={{ fontSize: '0.82rem', color: 'rgb(66, 66, 66)', fontWeight: 750, textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 1, display: 'block' }}>
                Optimal Monthly Obligation
              </div>
            </div>
          </>
        )}

        <div className="stat-card" style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', padding: '22px 18px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
          <div className="stat-value" style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.85rem', fontWeight: 800, color: '#1E40AF', marginBottom: '8px' }}>
            {formatCurrency(stats.avgLoanAmount)}
          </div>
          <div className="stat-label" style={{ fontSize: '0.82rem', color: 'rgb(66, 66, 66)', fontWeight: 750, textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 1, display: 'block' }}>
            Mean Approval Value
          </div>
        </div>
      </div>

      {/* Best Offer Highlight */}
      {bestOffer && (
        <div className="best-offer-card" style={{ background: '#FFF4EC', border: '2px solid #f58220', borderRadius: '20px', padding: '32px', marginBottom: '36px', boxShadow: '0 10px 30px rgba(245, 130, 32, 0.12)' }}>
          <div className="best-offer-badge" style={{ background: '#f58220', color: '#ffffff', padding: '5px 14px', borderRadius: '50px', fontSize: '0.72rem', fontWeight: 750, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'inline-block', marginBottom: '16px' }}>OPTIMAL SELECTION</div>
          <div className="best-offer-content">
            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.6rem', fontWeight: 750, color: 'rgb(66, 66, 66)', margin: '0 0 24px 0' }}>{bestOffer.bankName}</h3>
            <div className="best-offer-details" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
              <div className="detail-item">
                <span className="label" style={{ fontSize: '0.8rem', color: 'rgb(66, 66, 66)', marginBottom: '4px', fontWeight: 650, textTransform: 'uppercase', display: 'block' }}>Loan Amount</span>
                <span className="value large" style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2rem', fontWeight: 800, color: '#f58220', display: 'block' }}>{formatCurrency(bestOffer.loanAmount)}</span>
              </div>
              <div className="detail-item">
                <span className="label" style={{ fontSize: '0.8rem', color: 'rgb(66, 66, 66)', marginBottom: '4px', fontWeight: 650, textTransform: 'uppercase', display: 'block' }}>Monthly EMI</span>
                <span className="value" style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 800, color: '#1E40AF', display: 'block' }}>{formatNumber(bestOffer.monthlyEMI)}</span>
              </div>
              <div className="detail-item">
                <span className="label" style={{ fontSize: '0.8rem', color: 'rgb(66, 66, 66)', marginBottom: '4px', fontWeight: 650, textTransform: 'uppercase', display: 'block' }}>Interest Rate</span>
                <span className="value" style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 800, color: '#f58220', display: 'block' }}>{bestOffer.interestRate}%</span>
              </div>
              <div className="detail-item">
                <span className="label" style={{ fontSize: '0.8rem', color: 'rgb(66, 66, 66)', marginBottom: '4px', fontWeight: 650, textTransform: 'uppercase', display: 'block' }}>Loan Tenure</span>
                <span className="value" style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 800, color: '#1E40AF', display: 'block' }}>{bestOffer.loanTenure} years</span>
              </div>
            </div>
            {bestOffer.calculationMethod && (
              <div className="calculation-method" style={{ textAlign: 'right', marginTop: '10px', opacity: 0.6 }}>
                <small>Method: {bestOffer.calculationMethod}</small>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filter and Sort Controls */}
      <div className="controls-bar">
        <div className="filter-group">
          <label>Show:</label>
          <select 
            value={filterEligible} 
            onChange={(e) => setFilterEligible(e.target.value)}
          >
            <option value="all">All Banks ({results.length})</option>
            <option value="eligible">Approved Only ({eligibleBanks.length})</option>
            <option value="rejected">Rejected Only ({rejectedBanks.length})</option>
          </select>
        </div>

        {filterEligible !== 'rejected' && (
          <div className="sort-group">
            <label>Sort by:</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="loanAmount">Highest Loan Amount</option>
              <option value="emi">Lowest EMI</option>
              <option value="bank">Bank Name (A-Z)</option>
            </select>
          </div>
        )}
      </div>

      {/* Explicit Clean Page Break for PDF Export */}
      <div className="pdf-page-break" style={{ pageBreakBefore: 'always', breakBefore: 'always' }} />

      {/* All Bank Results */}
      <div className="all-banks-results">
        <h3 style={{ fontFamily: 'Outfit, "Plus Jakarta Sans", Inter, sans-serif', fontWeight: 750, color: 'rgb(66, 66, 66)', fontSize: '1.5rem', marginBottom: '20px' }}>
          Your Pre-Approved <span style={{ color: '#F58220' }}>Loan Amount Options</span>
        </h3>

        <div className="banks-grid">
          {(filterEligible === 'eligible' ? sortedEligibleBanks :
            filterEligible === 'rejected' ? rejectedBanks :
              [...sortedEligibleBanks, ...rejectedBanks]).map((bank, index) => (
                <div
                  key={index}
                  className={`bank-card ${bank.eligible ? 'eligible' : 'rejected'} ${bank === bestOffer ? 'best' : ''}`}
                  onClick={() => bank.eligible && handleBankSelect(bank.bankName, true)}
                >
                  <div className="bank-card-header">
                    {bank.eligible && (
                      <div 
                        className={`selection-checkbox ${selectedBanks.includes(bank.bankName) ? 'selected' : ''}`}
                        style={{
                          position: 'absolute',
                          left: '16px',
                          width: '22px',
                          height: '22px',
                          minWidth: '22px',
                          borderRadius: '6px',
                          border: selectedBanks.includes(bank.bankName) ? '2px solid #ffffff' : '2px solid rgba(255, 255, 255, 0.7)',
                          background: selectedBanks.includes(bank.bankName) ? '#ffffff' : 'rgba(255, 255, 255, 0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s',
                          boxShadow: selectedBanks.includes(bank.bankName) ? '0 2px 8px rgba(0, 0, 0, 0.2)' : 'none',
                          cursor: 'pointer'
                        }}
                      >
                        {selectedBanks.includes(bank.bankName) && <span style={{ color: '#1E40AF', fontSize: '14px', fontWeight: 'bold' }}>✓</span>}
                      </div>
                    )}

                    <h4>{bank.bankName}</h4>

                    {!bank.eligible && (
                      <div className="status-badge rejected" style={{ position: 'absolute', right: '16px' }}>
                        ✕ Ineligible
                      </div>
                    )}
                  </div>

                  <div className="bank-card-body">
                    {bank.eligible ? (
                      <>
                        {/* CAPPING ALERTS */}
                        {(bank.loanCappedByBank || bank.bachelorCapped) && (
                          <div className="capping-alert-box" style={{ 
                            background: '#FFF4EC', 
                            border: '1px solid #FED7AA', 
                            padding: '12px', 
                            borderRadius: '10px', 
                            marginBottom: '15px' 
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#F58220', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '4px' }}>
                              <span style={{ fontSize: '1.1rem' }}>⚠️</span> 
                              {bank.bachelorCapped ? 'BACHELOR LIMIT APPLIED' : 'BANK MAXIMUM CAP APPLIED'}
                            </div>
                            <div style={{ fontSize: '0.82rem', color: 'rgb(66, 66, 66)' }}>
                              Total Eligibility: <span style={{ textDecoration: 'line-through' }}>{formatCurrency(bank.calculatedLoanBeforeCap || bank.regularMaxLoan)}</span>
                            </div>
                            {bank.bachelorCapped && bank.bachelorCapReason && (
                              <div style={{ fontSize: '0.72rem', marginTop: '4px', fontStyle: 'italic', color: 'rgb(66, 66, 66)' }}>
                                Reason: {bank.bachelorCapReason}
                              </div>
                            )}
                          </div>
                        )}

                        {/* BT MODE DISPLAY */}
                        {(bank.isBTMode || bank.btType?.includes('BT') || bank.calculationMethod?.includes('BT')) ? (
                          <div className="bt-mode-display" style={{ background: '#EEF3FA', border: '1px solid #BFDBFE', padding: '14px 16px', borderRadius: '10px', marginBottom: '16px' }}>
                            <div className="bt-badge" style={{ fontSize: '0.75rem', fontWeight: 750, color: '#1E40AF', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Liability Consolidation</div>
                            <div className="bt-breakdown" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <div className="bt-item" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                                <span className="bt-label" style={{ color: 'rgb(66, 66, 66)', fontWeight: 500 }}>Total Loan Amount</span>
                                <span className="bt-value" style={{ fontWeight: 750, color: '#1E40AF' }}>{formatCurrency(bank.loanAmount)}</span>
                              </div>
                              <div className="bt-item" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'rgb(66, 66, 66)' }}>
                                <span className="bt-label" style={{ fontWeight: 500 }}>Existing Liabilities Clear</span>
                                <span className="bt-value" style={{ fontWeight: 750 }}>- {formatCurrency(bank.totalDebtCleared || bank.btTotalOutstanding)}</span>
                              </div>
                              <div style={{ height: '1px', background: '#BFDBFE', margin: '4px 0' }}></div>
                              <div className="bt-item" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.98rem', color: '#1E40AF', fontWeight: 800 }}>
                                <span className="bt-label">Net Disbursement</span>
                                <span className="bt-value">{formatCurrency(bank.freshAmountDisbursed)}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="main-amount">
                            <span className="label">Approved Loan Amount</span>
                            <span className="amount">{formatCurrency(bank.loanAmount)}</span>
                          </div>
                        )}

                        {/* DETAILED ANALYSIS SECTION */}
                        <div className="detailed-analysis-section" style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                          {(() => {
                            const method = (bank.calculationMethod || '').toLowerCase();
                            const isCombined = method.includes('combined') || method.includes('dual') || method.includes('both');
                            const isFoir = method.includes('foir');
                            const isMultiplier = method.includes('multiplier');
                            
                            const showFoir = isCombined || isFoir || (!isMultiplier);
                            const showMultiplier = isCombined || isMultiplier || (!isFoir);
                            
                            return (
                              <div className="details-expanded-content" style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px 14px', borderRadius: '10px' }}>
                                <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                  <span className="d-label" style={{ color: 'rgb(66, 66, 66)', fontWeight: 500 }}>Company Tier</span>
                                  <span className="d-value" style={{ fontWeight: 700, color: 'rgb(66, 66, 66)' }}>Category {bank.category || 'A'}</span>
                                </div>
                                
                                {showFoir && bank.details?.foirPercentage && (
                                  <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                    <span className="d-label" style={{ color: 'rgb(66, 66, 66)', fontWeight: 500 }}>FOIR Cap</span>
                                    <span className="d-value" style={{ fontWeight: 700, color: '#1E40AF' }}>{bank.details.foirPercentage}</span>
                                  </div>
                                )}

                                {showMultiplier && bank.details?.multiplier && (
                                  <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                    <span className="d-label" style={{ color: 'rgb(66, 66, 66)', fontWeight: 500 }}>Multiplier</span>
                                    <span className="d-value" style={{ fontWeight: 700, color: '#1E40AF' }}>{bank.details.multiplier}</span>
                                  </div>
                                )}

                                {(bank.incentiveConsidered > 0 || bank.details?.incentiveConsidered > 0) && (
                                  <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#1E40AF' }}>
                                    <span className="d-label" style={{ fontWeight: 500 }}>Incentive Credit</span>
                                    <span className="d-value" style={{ fontWeight: 750 }}>+{formatNumber(bank.incentiveConsidered || bank.details.incentiveConsidered)}</span>
                                  </div>
                                )}

                                {(bank.ccObligation > 0 || bank.details?.creditCardObligation > 0) && (
                                  <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'rgb(66, 66, 66)' }}>
                                    <span className="d-label" style={{ fontWeight: 500 }}>CC Obligation Deduction</span>
                                    <span className="d-value" style={{ fontWeight: 750 }}>-{formatNumber(bank.ccObligation || bank.details.creditCardObligation)}</span>
                                  </div>
                                )}

                                {bank.nonSelectedEMI > 0 && (
                                  <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'rgb(66, 66, 66)' }}>
                                    <span className="d-label" style={{ fontWeight: 500 }}>External EMI Adjustment</span>
                                    <span className="d-value" style={{ fontWeight: 750 }}>-{formatNumber(bank.nonSelectedEMI)}</span>
                                  </div>
                                )}
                                
                                {bank.details?.limitingFactor && (
                                  <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', borderTop: '1px solid #e2e8f0', paddingTop: '6px', marginTop: '4px' }}>
                                    <span className="d-label" style={{ color: 'rgb(66, 66, 66)', fontWeight: 500 }}>Limiting Parameter</span>
                                    <span className="d-value" style={{ color: '#F58220', fontWeight: 700 }}>{bank.details.limitingFactor}</span>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      </>
                    ) : (
                      <div className="rejected-body">
                        <div className="rejection-reason">
                          <span style={{ fontWeight: 'bold' }}>Exclusion:</span> {bank.reason || 'Criteria mismatch'}
                        </div>
                        {bank.category && (
                          <div className="rejected-meta" style={{ marginTop: '8px', color: 'rgb(66, 66, 66)', fontSize: '0.78rem' }}>
                            Identified Profile: Category {bank.category}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="details-grid">
                    <div className="detail">
                      <span className="detail-label">Monthly EMI</span>
                      <span className="detail-value" style={{ color: '#1E40AF' }}>{formatNumber(bank.monthlyEMI)}</span>
                    </div>
                    <div className="detail">
                      <span className="detail-label">ROI</span>
                      <span className="detail-value" style={{ color: '#F58220' }}>{bank.interestRate}%</span>
                    </div>
                    <div className="detail">
                      <span className="detail-label">Tenure</span>
                      <span className="detail-value" style={{ color: 'rgb(66, 66, 66)' }}>{bank.loanTenure}Y</span>
                    </div>
                  </div>
                </div>
              ))}
        </div>
      </div>

      {/* Floating Submit Bar */}
      {eligibleBanks.length > 0 && (
        <div className="selection-submit-bar">
          <div>
            <div style={{ color: '#111827', fontWeight: 750, fontSize: '1rem', fontFamily: 'Outfit, sans-serif' }}>
              {selectedBanks.length} Bank{selectedBanks.length !== 1 ? 's' : ''} Selected
            </div>
            <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
              Select the banks you prefer to proceed with
            </div>
          </div>

          <button 
            onClick={handleSubmitSelection}
            disabled={selectedBanks.length === 0 || submitting}
            className="table-submit-btn"
            style={{ margin: 0 }}
          >
            {submitting ? 'Processing...' : 'Proceed with Selected Banks'}
          </button>
        </div>
      )}

      {/* Submission Status Overlay */}
      {submitStatus && (
        <div className="status-overlay" style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: '#ffffff',
            border: `2px solid ${submitStatus === 'success' ? '#16a34a' : '#ef4444'}`,
            padding: '40px',
            borderRadius: '20px',
            textAlign: 'center',
            maxWidth: '500px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
            color: '#111827'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>
              {submitStatus === 'success' ? '✅' : '❌'}
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '10px', color: '#111827', fontFamily: 'Outfit, sans-serif', fontWeight: 750 }}>
              {submitStatus === 'success' ? 'Application Received!' : 'Submission Failed'}
            </h3>
            <p style={{ color: '#4b5563', marginBottom: '30px', fontSize: '0.95rem' }}>
              {submitStatus === 'success' 
                ? 'Your preferred banks have been notified. Our customer support team will contact you shortly to process your application.'
                : 'There was an error communicating with our server. Please try again or contact support.'}
            </p>
            <button 
              onClick={() => setSubmitStatus(null)}
              style={{
                background: '#F58220',
                color: '#ffffff',
                border: 'none',
                padding: '12px 36px',
                borderRadius: '50px',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerResultsDisplay;
