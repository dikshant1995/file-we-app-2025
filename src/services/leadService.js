// ============================================================
//  LEAD SERVICE - LOCAL, GOOGLE SHEETS & FIREBASE FIRESTORE SYNC
// ============================================================
import { db } from '../config/firebase.js';
import { doc, setDoc } from 'firebase/firestore';

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
            age: formData.age || submissionData.age || '',
            salaryMode: formData.salaryMode || submissionData.salaryMode || '',
            maritalStatus: formData.maritalStatus || submissionData.maritalStatus || '',
            livingStatus: formData.livingStatus || submissionData.livingStatus || '',
        };

        // ── PERSIST LOCALLY FOR ADMIN PANEL (IMMEDIATE) ─────────────────────────
        try {
            const localLeads = JSON.parse(localStorage.getItem('laxmi_leads') || '[]');
            const leadWithId = { ...lead, id: Date.now() };
            localLeads.unshift(leadWithId);
            localStorage.setItem('laxmi_leads', JSON.stringify(localLeads.slice(0, 100)));

            const customerDb = JSON.parse(localStorage.getItem('laxmi_customer_database') || '[]');
            customerDb.unshift({
                ...lead,
                id: `CUST-${Date.now()}`,
                rawInputs: formData
            });
            localStorage.setItem('laxmi_customer_database', JSON.stringify(customerDb.slice(0, 200)));
            // ── FIREBASE FIRESTORE SYNC (CLOUD REALTIME) ─────────────────────────
            try {
                const leadDocId = `lead_${leadWithId.id}`;
                setDoc(doc(db, 'leads', leadDocId), {
                    ...leadWithId,
                    createdAt: new Date().toISOString(),
                    status: 'New'
                }, { merge: true })
                    .then(() => console.log('🔥 Lead saved to Firebase Firestore collection: leads'))
                    .catch(e => console.warn('⚠️ Firestore lead save error:', e));
            } catch (fsErr) {
                console.warn('⚠️ Firestore lead sync error:', fsErr);
            }
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

            // ── FIREBASE FIRESTORE SYNC ──────────────────────────────────────────
            const matchingLead = localLeads.find(l => l.mobile === payload.mobile && l.name === payload.name);
            if (matchingLead && matchingLead.id) {
                const leadDocId = `lead_${matchingLead.id}`;
                setDoc(doc(db, 'leads', leadDocId), { selectedBanks: payload.selectedBanks }, { merge: true })
                    .then(() => console.log('🔥 Lead banks updated in Firestore'))
                    .catch(e => console.warn('⚠️ Firestore bank update error:', e));
            }
        } catch (localErr) {
            console.warn('⚠️ Could not update local lead:', localErr);
        }
        // ─────────────────────────────────────────────────────────────────────────

        console.log('✅ Bank selection saved:', payload.selectedBanks);
    } catch (err) {
        console.error('❌ leadService: Failed to save bank selection:', err.message);
    }
};
