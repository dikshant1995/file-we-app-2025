// ============================================================
//  GOOGLE SHEETS LEAD SERVICE
//  Paste your Apps Script Web App URL below after deployment.
// ============================================================

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzgAGkw2nw1MdYob_-liwla8M79HQVnqgZKhxFJ_unSsFo0q2aM2cWlwlKTeZpCi2K0og/exec';

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

        // ── Build the lead payload (REORDERED TO MATCH GOOGLE SHEETS) ──────────
        const lead = {
            timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
            name: formData.customerName || '',
            mobile: formData.mobileNumber || '',
            company: formData.employmentType === 'government' ? 'Government' : (formData.companyName || 'Private'),
            category: formData.employmentType === 'government' ? 'GOVT' : (formData.category || ''),
            basicSalary: formData.basicSalary || 0,
            totalIncome: submissionData.monthlyIncome || 0,
            wantsBT: submissionData.wantsBT ? 'Yes' : 'No',
            existingEMI: submissionData.existingEMI || 0,
            personalLoans: personalLoans || 'None',
            employment: formData.employmentType || '',
            creditCards: creditCards || 'None',
            gap1: '', // Placeholder for Column M
            state: formData.state || submissionData.state || '',
            city: formData.city || submissionData.city || '',
        };

        // ── PERSIST LOCALLY FOR ADMIN PANEL (IMMEDIATE) ─────────────────────────
        try {
            const localLeads = JSON.parse(localStorage.getItem('laxmi_leads') || '[]');
            const leadWithId = { ...lead, id: Date.now() };
            localLeads.unshift(leadWithId);
            localStorage.setItem('laxmi_leads', JSON.stringify(localLeads.slice(0, 50)));
            console.log('💾 Lead captured immediately for local pipeline');
        } catch (localErr) {
            console.warn('⚠️ Local save failed but continuing...', localErr);
        }

        // ── GOOGLE SHEETS & BACKEND SYNC (NON-BLOCKING) ──────────────────────────
        fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify(lead),
        }).then(() => console.log('✅ Google Sheets synced'))
            .catch(e => console.warn('⚠️ Google Sheets sync failed:', e));

        fetch('/api/leads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(lead)
        }).then(() => console.log('✅ Backend synced'))
            .catch(e => console.warn('⚠️ Backend sync failed:', e));
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
    if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL === 'PASTE_YOUR_APPS_SCRIPT_URL_HERE') return;

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

        await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify(payload),
        });

        // ── UPDATE LOCAL PERSISTENCE WITH SELECTIONS ─────────────────────────────
        try {
            const localLeads = JSON.parse(localStorage.getItem('laxmi_leads') || '[]');
            const updatedLeads = localLeads.map(l => {
                if (l.mobile === payload.mobile && l.name === payload.name) {
                    return { ...l, selectedBanks: payload.selectedBanks };
                }
                return l;
            });
            localStorage.setItem('laxmi_leads', JSON.stringify(updatedLeads));
            console.log('💾 Local lead updated with bank selections');
        } catch (localErr) {
            console.warn('⚠️ Could not update local lead:', localErr);
        }
        // ─────────────────────────────────────────────────────────────────────────

        console.log('✅ Bank selection saved:', payload.selectedBanks);
    } catch (err) {
        console.error('❌ leadService: Failed to save bank selection:', err.message);
    }
};
