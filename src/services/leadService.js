// ============================================================
//  LEAD SERVICE - LOCAL, FIREBASE FIRESTORE & GOOGLE SHEETS SYNC
// ============================================================
import { db } from '../config/firebase.js';
import { doc, setDoc } from 'firebase/firestore';

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzgAGkw2nw1MdYob_-liwla8M79HQVnqgZKhxFJ_unSsFo0q2aM2cWlwlKTeZpCi2K0og/exec';

/**
 * Saves a lead safely to:
 * 1. LocalStorage (immediate offline/local persistence)
 * 2. Firebase Firestore 'leads' collection (immediate cloud database sync)
 * 3. Google Sheets (non-blocking background sync)
 *
 * @param {Object} formData  - raw formData state from CustomerLoanForm
 * @param {Object} submissionData - the processed submission sent to loan engine
 */
export const saveLead = async (formData = {}, submissionData = {}) => {
    try {
        const rawForm = formData || {};
        const subData = submissionData || {};
        const metaData = subData._metadata || {};

        // ── Build existing loans summary safely ──────────────────────────────
        const existingLoans = subData.loansForBT || metaData.existingLoans || rawForm.existingLoans || [];
        const loansArr = Array.isArray(existingLoans) ? existingLoans : [];

        const personalLoans = loansArr
            .filter(l => l && l.type !== 'Credit Card')
            .map(l => `${l.lender || 'Unknown'} (EMI: ₹${l.monthlyEMI || 0}, POS: ₹${l.outstandingAmount || 0})`)
            .join(' | ') || 'None';

        const creditCards = loansArr
            .filter(l => l && l.type === 'Credit Card')
            .map(l => `${l.lender || 'Unknown'} (Used: ₹${l.creditLimitUsed || 0})`)
            .join(' | ') || 'None';

        // ── Unified Customer Info ────────────────────────────────────────────
        const customerName = rawForm.customerName || metaData.customerName || subData.customerName || 'Anonymous Customer';
        const mobileNumber = rawForm.mobileNumber || metaData.mobileNumber || subData.mobileNumber || '';
        const companyName = rawForm.companyName || metaData.companyName || subData.companyName || '';
        const category = rawForm.category || metaData.category || subData.category || 'General';
        const basicSalary = Number(rawForm.basicSalary || metaData.basicSalary || subData.basicSalary || 0);
        const monthlyIncome = Number(subData.monthlyIncome || rawForm.totalMonthlyIncome || rawForm.monthlyIncome || basicSalary || 0);
        const existingEMI = Number(subData.existingEMI || rawForm.existingEMI || 0);
        const wantsBT = (subData.wantsBT || rawForm.wantsBT) ? 'Yes' : 'No';

        const now = new Date();
        const leadId = Date.now();
        const leadDocId = mobileNumber ? `lead_${mobileNumber.replace(/\D/g, '')}` : `lead_${leadId}`;

        // ── Build the lead payload ────────────────────────────────────────────
        const lead = {
            id: leadId,
            docId: leadDocId,
            timestamp: now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
            createdAt: now.toISOString(),
            name: customerName,
            mobile: mobileNumber,
            basicSalary: basicSalary,
            incentive1: Number(rawForm.incentiveMonth1 || metaData.incentiveMonth1 || 0),
            incentive2: Number(rawForm.incentiveMonth2 || metaData.incentiveMonth2 || 0),
            incentive3: Number(rawForm.incentiveMonth3 || metaData.incentiveMonth3 || 0),
            totalIncome: monthlyIncome,
            company: companyName,
            category: category,
            employment: rawForm.employmentType || metaData.employmentType || subData.employmentType || 'Salaried',
            existingEMI: existingEMI,
            wantsBT: wantsBT,
            personalLoans: personalLoans,
            creditCards: creditCards,
            state: rawForm.state || metaData.state || subData.state || '',
            city: rawForm.city || metaData.city || subData.city || '',
            age: rawForm.age || metaData.age || subData.age || '',
            salaryMode: rawForm.salaryMode || metaData.salaryMode || subData.salaryMode || 'Bank Transfer',
            maritalStatus: rawForm.maritalStatus || metaData.maritalStatus || subData.maritalStatus || '',
            livingStatus: rawForm.livingStatus || metaData.livingStatus || subData.livingStatus || '',
            status: 'New',
            selectedBanks: ''
        };

        // ── STEP 1: PERSIST LOCALLY (IMMEDIATE) ───────────────────────────────
        try {
            const localLeads = JSON.parse(localStorage.getItem('laxmi_leads') || '[]');
            // Replace if same mobile exists, or prepend
            const filtered = localLeads.filter(l => l.mobile !== lead.mobile);
            filtered.unshift(lead);
            localStorage.setItem('laxmi_leads', JSON.stringify(filtered.slice(0, 200)));

            const customerDb = JSON.parse(localStorage.getItem('laxmi_customer_database') || '[]');
            customerDb.unshift({
                ...lead,
                id: `CUST-${leadId}`,
                rawInputs: rawForm
            });
            localStorage.setItem('laxmi_customer_database', JSON.stringify(customerDb.slice(0, 200)));
            console.log('💾 Lead saved locally to laxmi_leads and laxmi_customer_database');
        } catch (localErr) {
            console.warn('⚠️ LocalStorage save error:', localErr);
        }

        // ── STEP 2: FIREBASE FIRESTORE SYNC (CLOUD REALTIME DATABASE) ─────────
        try {
            await setDoc(doc(db, 'leads', leadDocId), lead, { merge: true });
            console.log('🔥 Lead successfully saved to Cloud Firestore:', leadDocId);
        } catch (fsErr) {
            console.error('❌ Firestore lead save error:', fsErr);
        }

        // Notify any active window listeners
        try {
            window.dispatchEvent(new Event('storage'));
        } catch (e) {}

        // ── STEP 3: GOOGLE SHEETS SYNC (NON-BLOCKING BACKGROUND) ──────────────
        if (APPS_SCRIPT_URL && APPS_SCRIPT_URL !== 'PASTE_YOUR_APPS_SCRIPT_URL_HERE') {
            fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify(lead),
            }).then(() => console.log('✅ Google Sheets synced'))
              .catch(e => console.warn('⚠️ Google Sheets background sync notice:', e));
        }

        return lead;
    } catch (err) {
        console.error('❌ leadService: Failed to save lead:', err);
    }
};

/**
 * Updates or creates lead with customer's bank selection.
 * Called when user clicks "Proceed with Selected Banks".
 *
 * @param {Object} metadata       - from CustomerResultsDisplay props (has name, mobile, etc.)
 * @param {Array}  selectedBanks  - array of bank name strings user selected
 */
export const saveSelectedBanks = async (metadata = {}, selectedBanks = []) => {
    try {
        const meta = metadata || {};
        const customerName = meta.customerName || meta.name || 'Anonymous Customer';
        const mobileNumber = meta.mobileNumber || meta.mobile || '';
        const selectedBanksStr = Array.isArray(selectedBanks) ? selectedBanks.join(', ') : String(selectedBanks || '');

        const payload = {
            action: 'bank_selection',
            timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
            updatedAt: new Date().toISOString(),
            name: customerName,
            mobile: mobileNumber,
            selectedBanks: selectedBanksStr,
            bankCount: Array.isArray(selectedBanks) ? selectedBanks.length : 1,
            totalIncome: Number(meta.totalIncome || meta.monthlyIncome || 0),
            company: meta.companyName || meta.company || '',
            state: meta.state || '',
            city: meta.city || '',
            status: 'Selected'
        };

        const leadDocId = mobileNumber ? `lead_${mobileNumber.replace(/\D/g, '')}` : `lead_${Date.now()}`;

        // ── STEP 1: UPDATE LOCAL PERSISTENCE ─────────────────────────────────
        try {
            const localLeads = JSON.parse(localStorage.getItem('laxmi_leads') || '[]');
            let found = false;
            const updatedLeads = localLeads.map(l => {
                if (mobileNumber && l.mobile === mobileNumber) {
                    found = true;
                    return { ...l, selectedBanks: selectedBanksStr, status: 'Selected' };
                }
                return l;
            });

            if (!found) {
                updatedLeads.unshift({
                    id: Date.now(),
                    docId: leadDocId,
                    ...payload
                });
            }

            localStorage.setItem('laxmi_leads', JSON.stringify(updatedLeads));
            console.log('💾 Local lead updated with bank selections:', selectedBanksStr);
        } catch (localErr) {
            console.warn('⚠️ Could not update local lead:', localErr);
        }

        // ── STEP 2: UPDATE FIREBASE FIRESTORE (CLOUD REALTIME DATABASE) ───────
        try {
            await setDoc(doc(db, 'leads', leadDocId), {
                ...payload,
                docId: leadDocId
            }, { merge: true });
            console.log('🔥 Selected banks saved to Cloud Firestore:', leadDocId);
        } catch (fsErr) {
            console.error('❌ Firestore selection save error:', fsErr);
        }

        // Notify active windows
        try {
            window.dispatchEvent(new Event('storage'));
        } catch (e) {}

        // ── STEP 3: GOOGLE SHEETS (NON-BLOCKING BACKGROUND) ───────────────────
        if (APPS_SCRIPT_URL && APPS_SCRIPT_URL !== 'PASTE_YOUR_APPS_SCRIPT_URL_HERE') {
            fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify(payload),
            }).then(() => console.log('✅ Google Sheets bank selection synced'))
              .catch(e => console.warn('⚠️ Google Sheets sync notice:', e));
        }

        return true;
    } catch (err) {
        console.error('❌ leadService: Failed to save bank selection:', err);
        return false;
    }
};
