// 🛡️ SECURE PROXY ROUTE
// Direct Google Sheets URL has been moved to the server for protection
const PROXY_URL = '/api/leads/save';

/**
 * Sends a lead row to Google Sheets.
 * Silent fail — never blocks the user from seeing results.
 *
 * @param {Object} formData  - raw formData state from CustomerLoanForm
 * @param {Object} submissionData - the processed submission sent to loan engine
 */
export const saveLead = async (formData, submissionData) => {
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
            state: formData.state || submissionData.state || '',
            city: formData.city || submissionData.city || '',
        };

        await fetch(PROXY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(lead),
        });

        console.log('✅ Lead saved to Google Sheets:', lead.name, lead.mobile);
    } catch (err) {
        // Never block the user — just log the error
        console.error('❌ leadService: Failed to save lead:', err.message);
    }
};

/**
 * Sends the customer's bank selection to Google Sheets.
 * Called when user clicks "Proceed with Selected Banks".
 *
 * @param {Object} metadata       - from CustomerResultsDisplay props (has name, mobile, etc.)
 * @param {Array}  selectedBanks  - array of bank name strings user selected
 */
export const saveSelectedBanks = async (metadata, selectedBanks) => {
    try {
        const payload = {
            action: 'bank_selection',
            timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
            name: metadata?.customerName || metadata?.name || '',
            mobile: metadata?.mobileNumber || metadata?.mobile || '',
            selectedBanks: selectedBanks.join(', '),
            bankCount: selectedBanks.length,
            totalIncome: metadata?.totalIncome || '',
            company: metadata?.company || '',
            state: metadata?.state || '',
            city: metadata?.city || '',
        };

        await fetch(PROXY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        console.log('✅ Bank selection saved:', payload.selectedBanks);
    } catch (err) {
        console.error('❌ leadService: Failed to save bank selection:', err.message);
    }
};

