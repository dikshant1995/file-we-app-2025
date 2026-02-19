// ============================================================
//  GOOGLE SHEETS LEAD SERVICE
//  Paste your Apps Script Web App URL below after deployment.
// ============================================================

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwouXL7JZQO0wjmc6w6PhpYQBDrDg8kk_e53h3DzN2FmBwwyYeiDP_Vi7FnSUY5KuQ2Hg/exec';

/**
 * Sends a lead row to Google Sheets.
 * Silent fail — never blocks the user from seeing results.
 *
 * @param {Object} formData  - raw formData state from CustomerLoanForm
 * @param {Object} submissionData - the processed submission sent to loan engine
 */
export const saveLead = async (formData, submissionData) => {
    if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL === 'PASTE_YOUR_APPS_SCRIPT_URL_HERE') {
        console.warn('⚠️  leadService: Apps Script URL not set. Skipping lead save.');
        return;
    }

    try {
        // ── Build existing loans summary ─────────────────────────────────────────
        const personalLoans = (submissionData._metadata?.existingLoans || [])
            .filter(l => l.type !== 'Credit Card')
            .map(l => `${l.lender || 'Unknown'} (EMI: ₹${l.monthlyEMI || 0}, POS: ₹${l.outstandingAmount || 0})`)
            .join(' | ');

        const creditCards = (submissionData._metadata?.existingLoans || [])
            .filter(l => l.type === 'Credit Card')
            .map(l => `${l.lender || 'Unknown'} (Used: ₹${l.creditLimitUsed || 0})`)
            .join(' | ');

        // ── Build the lead payload ────────────────────────────────────────────────
        const lead = {
            timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
            name: formData.customerName || '',
            mobile: formData.mobileNumber || '',
            basicSalary: formData.basicSalary || 0,
            incentive1: formData.incentiveMonth1 || 0,
            incentive2: formData.incentiveMonth2 || 0,
            incentive3: formData.incentiveMonth3 || 0,
            totalIncome: submissionData.monthlyIncome || 0,
            company: formData.companyName || '',
            category: formData.category || '',
            employment: formData.employmentType || '',
            existingEMI: submissionData.existingEMI || 0,
            wantsBT: submissionData.wantsBT ? 'Yes' : 'No',
            personalLoans: personalLoans || 'None',
            creditCards: creditCards || 'None',
        };

        await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            // Apps Script requires text/plain to avoid CORS preflight
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify(lead),
        });

        console.log('✅ Lead saved to Google Sheets:', lead.name, lead.mobile);
    } catch (err) {
        // Never block the user — just log the error
        console.error('❌ leadService: Failed to save lead:', err.message);
    }
};
