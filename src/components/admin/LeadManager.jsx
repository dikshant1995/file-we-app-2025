import React, { useState, useEffect, useMemo } from 'react';
import { 
    Mail, Download, Search, MessageCircle, Copy, Trash2, 
    Share2, Check, FileSpreadsheet, Eye, X, Calendar, 
    Filter, ArrowUpRight, CheckCircle2, RefreshCw, UserCheck, Building, Phone, IndianRupee
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { db } from '../../config/firebase.js';
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import './LeadManager.css';

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const AVAILABLE_YEARS = [2024, 2025, 2026, 2027, 2028];

const LeadManager = ({ userRole }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [leads, setLeads] = useState([]);
    const [selectedLeadIds, setSelectedLeadIds] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [copiedLeadId, setCopiedLeadId] = useState(null);

    // Filter states
    const [dateFilter, setDateFilter] = useState('all'); // 'today', 'week', 'month', 'specific_month', 'all'
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // 0-11
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // e.g. 2026

    // Modals
    const [activeShareLead, setActiveShareLead] = useState(null);
    const [activeDetailLead, setActiveDetailLead] = useState(null);

    // Initial mock fallback data
    const mockLeads = [
        { 
            id: 'm1', 
            timestamp: '04/09/2026, 14:30:00', 
            createdAt: '2026-09-04T09:00:00.000Z',
            name: 'Vikram Singh', 
            mobile: '9876543210', 
            company: 'Tata Consultancy Services', 
            category: 'CAT A',
            totalIncome: 125000, 
            basicSalary: 65000,
            existingEMI: 15000, 
            city: 'Mumbai',
            state: 'Maharashtra',
            selectedBanks: 'HDFC, ICICI, AXIS', 
            status: 'New' 
        },
        { 
            id: 'm2', 
            timestamp: '02/09/2026, 11:20:15', 
            createdAt: '2026-09-02T05:50:00.000Z',
            name: 'Anjali Sharma', 
            mobile: '9988776655', 
            company: 'Google India', 
            category: 'Super A',
            totalIncome: 210000, 
            basicSalary: 110000,
            existingEMI: 0, 
            city: 'Bengaluru',
            state: 'Karnataka',
            selectedBanks: 'Standard Chartered, Kotak', 
            status: 'Contacted' 
        },
        { 
            id: 'm3', 
            timestamp: '15/08/2026, 16:45:00', 
            createdAt: '2026-08-15T11:15:00.000Z',
            name: 'Rahul Verma', 
            mobile: '9122334455', 
            company: 'Reliance Industries', 
            category: 'CAT A',
            totalIncome: 85000, 
            basicSalary: 45000,
            existingEMI: 5000, 
            city: 'Delhi',
            state: 'Delhi',
            selectedBanks: 'HDFC, SBI', 
            status: 'Qualified' 
        }
    ];

    // Load Leads from Firebase Firestore and LocalStorage
    const fetchLeads = async () => {
        setLoading(true);
        try {
            let firestoreLeads = [];
            try {
                const leadsSnap = await getDocs(collection(db, 'leads'));
                firestoreLeads = leadsSnap.docs.map(d => ({
                    ...d.data(),
                    id: d.data().id || d.id
                }));
                console.log(`🔥 Loaded ${firestoreLeads.length} leads from Firestore`);
            } catch (fsErr) {
                console.warn('⚠️ Firestore fetch error, relying on local:', fsErr);
            }

            const stored = localStorage.getItem('laxmi_leads');
            const localLeads = stored ? JSON.parse(stored) : [];

            // Combine and de-duplicate by ID / mobile
            const combined = [...firestoreLeads, ...(Array.isArray(localLeads) ? localLeads : [])];
            const uniqueMap = new Map();
            combined.forEach(item => {
                const key = item.id || `${item.mobile}_${item.name}`;
                if (!uniqueMap.has(key)) {
                    uniqueMap.set(key, item);
                }
            });

            const uniqueLeads = Array.from(uniqueMap.values());
            setLeads(uniqueLeads.length > 0 ? uniqueLeads : mockLeads);
        } catch (err) {
            console.error('Error loading leads:', err);
            const stored = localStorage.getItem('laxmi_leads');
            setLeads(stored ? JSON.parse(stored) : mockLeads);
        } finally {
            setLoading(false);
        }
    };

    // Real-time Firestore Cloud Listener
    useEffect(() => {
        setLoading(true);
        let unsubscribe = () => {};
        try {
            unsubscribe = onSnapshot(collection(db, 'leads'), (snapshot) => {
                const firestoreLeads = snapshot.docs.map(d => ({
                    ...d.data(),
                    id: d.data().id || d.id
                }));
                console.log(`🔥 Real-time leads sync: ${firestoreLeads.length} leads in Firestore`);

                const stored = localStorage.getItem('laxmi_leads');
                const localLeads = stored ? JSON.parse(stored) : [];

                const combined = [...firestoreLeads, ...(Array.isArray(localLeads) ? localLeads : [])];
                const uniqueMap = new Map();
                combined.forEach(item => {
                    const key = item.id || `${item.mobile}_${item.name}`;
                    if (!uniqueMap.has(key)) {
                        uniqueMap.set(key, item);
                    }
                });

                const uniqueLeads = Array.from(uniqueMap.values());
                setLeads(uniqueLeads.length > 0 ? uniqueLeads : mockLeads);
                setLoading(false);
            }, (fsErr) => {
                console.warn('⚠️ Real-time listener fallback:', fsErr);
                fetchLeads();
            });
        } catch (e) {
            fetchLeads();
        }

        const handleStorageChange = () => fetchLeads();
        window.addEventListener('storage', handleStorageChange);

        return () => {
            unsubscribe();
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    // Robust Lead Date Parser
    const parseLeadDate = (lead) => {
        if (!lead) return null;
        if (lead.createdAt) {
            const d = new Date(lead.createdAt);
            if (!isNaN(d.getTime())) return d;
        }
        if (typeof lead.id === 'number' && lead.id > 1600000000000) {
            return new Date(lead.id);
        }
        if (lead.timestamp) {
            const direct = new Date(lead.timestamp);
            if (!isNaN(direct.getTime())) return direct;

            // Handle dd/mm/yyyy or dd/mm/yyyy, hh:mm:ss
            const parts = lead.timestamp.split(',');
            if (parts.length > 0) {
                const datePart = parts[0].trim();
                const bits = datePart.split(/[\/\-]/);
                if (bits.length === 3) {
                    if (bits[0].length === 4) {
                        return new Date(Number(bits[0]), Number(bits[1]) - 1, Number(bits[2]));
                    } else {
                        return new Date(Number(bits[2]), Number(bits[1]) - 1, Number(bits[0]));
                    }
                }
            }
        }
        return null;
    };

    // Filter Leads based on Search & Active Date Filter
    const filteredLeads = useMemo(() => {
        const now = new Date();
        const todayZero = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        return leads.filter(lead => {
            // Search term match
            const q = searchTerm.toLowerCase();
            const matchesSearch = !searchTerm ||
                (lead?.name || '').toLowerCase().includes(q) ||
                (lead?.mobile || '').includes(q) ||
                (lead?.company || lead?.employer || '').toLowerCase().includes(q) ||
                (lead?.city || '').toLowerCase().includes(q) ||
                (lead?.selectedBanks || '').toLowerCase().includes(q);

            if (!matchesSearch) return false;
            if (dateFilter === 'all') return true;

            const leadDate = parseLeadDate(lead);
            if (!leadDate) return true; // Keep if date unparseable

            const leadZero = new Date(leadDate.getFullYear(), leadDate.getMonth(), leadDate.getDate());

            if (dateFilter === 'today') {
                return leadZero.getTime() === todayZero.getTime();
            }

            if (dateFilter === 'week') {
                // This week: from start of current week (Monday) to today/end of week
                const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay(); // 1=Mon ... 7=Sun
                const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (dayOfWeek - 1));
                const endOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (7 - dayOfWeek), 23, 59, 59);
                return leadDate >= startOfWeek && leadDate <= endOfWeek;
            }

            if (dateFilter === 'month') {
                // This month (calendar month of current date)
                return leadDate.getMonth() === now.getMonth() && leadDate.getFullYear() === now.getFullYear();
            }

            if (dateFilter === 'specific_month') {
                // Specific month & year selected by user
                return leadDate.getMonth() === Number(selectedMonth) && leadDate.getFullYear() === Number(selectedYear);
            }

            return true;
        });
    }, [leads, searchTerm, dateFilter, selectedMonth, selectedYear]);

    // Selection Handlers
    const handleSelectLead = (id) => {
        const newSelected = new Set(selectedLeadIds);
        if (newSelected.has(id)) newSelected.delete(id);
        else newSelected.add(id);
        setSelectedLeadIds(newSelected);
    };

    const handleSelectAll = () => {
        if (selectedLeadIds.size === filteredLeads.length) {
            setSelectedLeadIds(new Set());
        } else {
            setSelectedLeadIds(new Set(filteredLeads.map(l => l.id)));
        }
    };

    // Status updater
    const handleUpdateStatus = async (leadId, newStatus) => {
        const updated = leads.map(l => l.id === leadId ? { ...l, status: newStatus } : l);
        setLeads(updated);
        localStorage.setItem('laxmi_leads', JSON.stringify(updated));

        try {
            const leadDocId = typeof leadId === 'string' && leadId.startsWith('lead_') ? leadId : `lead_${leadId}`;
            await updateDoc(doc(db, 'leads', leadDocId), { status: newStatus });
        } catch (e) {
            console.warn('Could not update status in Firestore:', e);
        }
    };

    // Lead Deletion
    const handleDelete = async (id) => {
        if (userRole !== 'ceo') {
            alert('SECURITY VIOLATION: Access Denied. Only CEO identities can purge lead records.');
            return;
        }
        if (window.confirm('PROTOCOL WARNING: Are you sure you want to permanently delete this lead record?')) {
            const updated = leads.filter(l => l.id !== id);
            setLeads(updated);
            localStorage.setItem('laxmi_leads', JSON.stringify(updated));

            try {
                const leadDocId = typeof id === 'string' && id.startsWith('lead_') ? id : `lead_${id}`;
                await deleteDoc(doc(db, 'leads', leadDocId));
            } catch (e) {
                console.warn('Could not delete from Firestore:', e);
            }
        }
    };

    // Excel Export Feature (.xlsx)
    const handleDownloadExcel = () => {
        const exportData = selectedLeadIds.size > 0
            ? leads.filter(l => selectedLeadIds.has(l.id))
            : filteredLeads;

        if (exportData.length === 0) {
            alert('No leads found for current selection/filter.');
            return;
        }

        const rows = exportData.map((l, index) => ({
            'S.No': index + 1,
            'Lead ID': l.id || `LD-${index + 1}`,
            'Date & Time': l.timestamp || (l.createdAt ? new Date(l.createdAt).toLocaleString('en-IN') : 'N/A'),
            'Customer Name': l.name || 'Anonymous',
            'Mobile Number': l.mobile || 'N/A',
            'Company / Employer': l.company || l.employer || 'N/A',
            'Company Category': l.category || 'N/A',
            'Employment Type': l.employment || 'Salaried',
            'Net Monthly Income (₹)': Number(l.totalIncome || l.monthlyIncome || 0),
            'Basic Salary (₹)': Number(l.basicSalary || 0),
            'Monthly Incentives (₹)': (Number(l.incentive1 || 0) + Number(l.incentive2 || 0) + Number(l.incentive3 || 0)),
            'Existing Total EMI (₹)': Number(l.existingEMI || 0),
            'Balance Transfer (BT)': l.wantsBT || 'No',
            'Personal Loans Summary': l.personalLoans || 'None',
            'Credit Cards Summary': l.creditCards || 'None',
            'City': l.city || 'N/A',
            'State': l.state || 'N/A',
            'Age': l.age || 'N/A',
            'Salary Mode': l.salaryMode || 'N/A',
            'Marital Status': l.maritalStatus || 'N/A',
            'Residence Status': l.livingStatus || 'N/A',
            'Pre-approved / Selected Banks': l.selectedBanks || 'None Selected',
            'Lead Status': l.status || 'New'
        }));

        const worksheet = XLSX.utils.json_to_sheet(rows);

        // Auto-size columns for crystal-clear readability
        const columnWidths = [
            { wch: 6 },  // S.No
            { wch: 18 }, // Lead ID
            { wch: 22 }, // Date & Time
            { wch: 22 }, // Customer Name
            { wch: 14 }, // Mobile Number
            { wch: 28 }, // Company
            { wch: 16 }, // Category
            { wch: 16 }, // Employment Type
            { wch: 22 }, // Net Monthly Income
            { wch: 16 }, // Basic Salary
            { wch: 20 }, // Incentives
            { wch: 20 }, // Existing EMI
            { wch: 20 }, // BT
            { wch: 30 }, // Personal Loans
            { wch: 25 }, // Credit Cards
            { wch: 18 }, // City
            { wch: 18 }, // State
            { wch: 8 },  // Age
            { wch: 16 }, // Salary Mode
            { wch: 16 }, // Marital Status
            { wch: 18 }, // Living Status
            { wch: 32 }, // Selected Banks
            { wch: 14 }, // Lead Status
        ];
        worksheet['!cols'] = columnWidths;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'LaxmiCredit Leads');

        let filterSuffix = dateFilter;
        if (dateFilter === 'specific_month') {
            filterSuffix = `${MONTH_NAMES[selectedMonth]}_${selectedYear}`;
        }
        const fileName = `LaxmiCredit_Leads_${filterSuffix}_${new Date().toISOString().slice(0, 10)}.xlsx`;
        XLSX.writeFile(workbook, fileName);
    };

    // Format text dossier for sharing
    const generateLeadShareText = (lead) => {
        return `🌟 *LAXMICREDIT LOAN LEAD DOSSIER* 🌟
--------------------------------------
👤 *Customer Name:* ${lead?.name || 'N/A'}
📱 *Mobile Number:* ${lead?.mobile || 'N/A'}
🏢 *Company:* ${lead?.company || lead?.employer || 'N/A'} (Cat: ${lead?.category || 'General'})
💼 *Employment:* ${lead?.employment || 'Salaried'}
💰 *Net Monthly Income:* ₹${Number(lead?.totalIncome || lead?.monthlyIncome || 0).toLocaleString('en-IN')}
💵 *Basic Salary:* ₹${Number(lead?.basicSalary || 0).toLocaleString('en-IN')}
💳 *Existing EMIs:* ₹${Number(lead?.existingEMI || 0).toLocaleString('en-IN')}
🔄 *Balance Transfer (BT):* ${lead?.wantsBT || 'No'}
📍 *Location:* ${lead?.city || 'N/A'}, ${lead?.state || 'N/A'}
🏛️ *Selected / Eligible Banks:* ${lead?.selectedBanks || 'All Applicable'}
📅 *Date Logged:* ${lead?.timestamp || (lead?.createdAt ? new Date(lead?.createdAt).toLocaleString('en-IN') : 'N/A')}
--------------------------------------
*Laxmi Omni Systems - Financial Services Division*`.trim();
    };

    // WhatsApp Share
    const handleWhatsAppShare = (lead) => {
        const message = encodeURIComponent(generateLeadShareText(lead));
        window.open(`https://wa.me/?text=${message}`, '_blank');
    };

    // Email Share
    const handleEmailShare = (lead) => {
        const subject = encodeURIComponent(`Loan Lead Dossier: ${lead?.name || 'Customer'} [${lead?.mobile || ''}]`);
        const body = encodeURIComponent(generateLeadShareText(lead));
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    };

    // Native Web Share API
    const handleNativeShare = async (lead) => {
        const text = generateLeadShareText(lead);
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Lead: ${lead?.name || 'Customer'}`,
                    text: text
                });
            } catch (err) {
                console.log('Share dismissed or cancelled:', err);
            }
        } else {
            handleCopyLead(lead);
        }
    };

    // Copy to Clipboard
    const handleCopyLead = (lead) => {
        const text = generateLeadShareText(lead);
        navigator.clipboard.writeText(text).then(() => {
            setCopiedLeadId(lead?.id);
            setTimeout(() => setCopiedLeadId(null), 2500);
        });
    };

    return (
        <div className="lead-manager-container">
            {/* Header Area */}
            <div className="lead-header">
                <div>
                    <div className="lead-title-badge">INSTITUTIONAL PIPELINE</div>
                    <h2>Lead Management System</h2>
                    <p>Real-time loan applications with smart period filtering, Excel export, and instant sharing</p>
                </div>
                <div className="header-actions">
                    <button className="btn-refresh-leads" onClick={fetchLeads} title="Reload live leads">
                        <RefreshCw size={16} className={loading ? 'spinning' : ''} />
                        <span>Refresh</span>
                    </button>
                    <button className="btn-download-advanced" onClick={handleDownloadExcel}>
                        <FileSpreadsheet size={18} />
                        <span>
                            {selectedLeadIds.size > 0 
                                ? `Export Selected Excel (${selectedLeadIds.size})` 
                                : `Download Excel (.xlsx)`}
                        </span>
                    </button>
                </div>
            </div>

            {/* Comprehensive Date & Period Filter Toolbar */}
            <div className="filter-toolbar glass-panel">
                <div className="filter-group-title">
                    <Calendar size={18} className="filter-icon" />
                    <span>View Leads By:</span>
                </div>

                <div className="date-filter-pills">
                    <button 
                        className={`filter-pill ${dateFilter === 'today' ? 'active' : ''}`}
                        onClick={() => setDateFilter('today')}
                    >
                        Today
                    </button>
                    <button 
                        className={`filter-pill ${dateFilter === 'week' ? 'active' : ''}`}
                        onClick={() => setDateFilter('week')}
                    >
                        This Week
                    </button>
                    <button 
                        className={`filter-pill ${dateFilter === 'month' ? 'active' : ''}`}
                        onClick={() => setDateFilter('month')}
                    >
                        This Month
                    </button>
                    <button 
                        className={`filter-pill ${dateFilter === 'specific_month' ? 'active' : ''}`}
                        onClick={() => setDateFilter('specific_month')}
                    >
                        Specific Month & Year
                    </button>
                    <button 
                        className={`filter-pill ${dateFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setDateFilter('all')}
                    >
                        All Time
                    </button>
                </div>

                {/* Specific Month & Year Selectors (Displayed when 'specific_month' is active) */}
                {dateFilter === 'specific_month' && (
                    <div className="specific-date-selectors">
                        <div className="selector-field">
                            <label>Month:</label>
                            <select 
                                value={selectedMonth} 
                                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                className="custom-period-select"
                            >
                                {MONTH_NAMES.map((m, idx) => (
                                    <option key={idx} value={idx}>{m}</option>
                                ))}
                            </select>
                        </div>
                        <div className="selector-field">
                            <label>Year:</label>
                            <select 
                                value={selectedYear} 
                                onChange={(e) => setSelectedYear(Number(e.target.value))}
                                className="custom-period-select"
                            >
                                {AVAILABLE_YEARS.map(yr => (
                                    <option key={yr} value={yr}>{yr}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {/* Filter Summary Banner & Search Controls */}
            <div className="lead-controls glass-panel">
                <div className="search-box">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search by customer name, mobile, company, city, or bank..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button className="clear-search-btn" onClick={() => setSearchTerm('')}>
                            <X size={14} />
                        </button>
                    )}
                </div>

                <div className="lead-stats-row">
                    <div className="filter-summary-tag">
                        <Filter size={14} />
                        <span>
                            {dateFilter === 'today' && 'Showing: Today’s Leads'}
                            {dateFilter === 'week' && 'Showing: Leads from This Week'}
                            {dateFilter === 'month' && 'Showing: Leads from This Month'}
                            {dateFilter === 'specific_month' && `Showing: ${MONTH_NAMES[selectedMonth]} ${selectedYear}`}
                            {dateFilter === 'all' && 'Showing: All Time Leads'}
                        </span>
                    </div>

                    <div className="stat-item">
                        <span className="stat-label">Filtered Leads</span>
                        <span className="stat-value">{filteredLeads.length}</span>
                    </div>

                    <div className="stat-item">
                        <span className="stat-label">Total Leads</span>
                        <span className="stat-value text-muted">{leads.length}</span>
                    </div>
                </div>
            </div>

            {/* Leads Table */}
            <div className="leads-table-wrapper glass-panel">
                <table className="leads-table">
                    <thead>
                        <tr>
                            <th className="checkbox-col">
                                <input
                                    type="checkbox"
                                    className="lead-checkbox"
                                    checked={filteredLeads.length > 0 && selectedLeadIds.size === filteredLeads.length}
                                    onChange={handleSelectAll}
                                />
                            </th>
                            <th>Customer & Date</th>
                            <th>Contact & Location</th>
                            <th>Employment & Income</th>
                            <th>Selected Banks & Status</th>
                            <th style={{ textAlign: 'center' }}>Share & Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLeads.map(lead => (
                            <tr key={lead?.id} className={selectedLeadIds.has(lead?.id) ? 'selected-row' : ''}>
                                <td className="checkbox-col">
                                    <input
                                        type="checkbox"
                                        className="lead-checkbox"
                                        checked={selectedLeadIds.has(lead?.id)}
                                        onChange={() => handleSelectLead(lead?.id)}
                                    />
                                </td>
                                <td>
                                    <div 
                                        className="lead-name clickable-lead" 
                                        onClick={() => setActiveDetailLead(lead)}
                                        title="Click to inspect full dossier"
                                    >
                                        {lead?.name || 'Anonymous Applicant'}
                                        <ArrowUpRight size={13} className="inspect-icon" />
                                    </div>
                                    <div className="lead-time">
                                        <Calendar size={11} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                                        {lead?.timestamp || (lead?.createdAt ? new Date(lead?.createdAt).toLocaleString('en-IN') : 'N/A')}
                                    </div>
                                </td>
                                <td>
                                    <div className="lead-mobile">
                                        <Phone size={12} style={{ marginRight: '4px', verticalAlign: 'middle', color: '#00d4ff' }} />
                                        {lead?.mobile || 'N/A'}
                                    </div>
                                    <div className="lead-location">
                                        {lead?.city ? `${lead.city}${lead.state ? `, ${lead.state}` : ''}` : 'Location Unspecified'}
                                    </div>
                                </td>
                                <td>
                                    <div className="lead-company">
                                        <Building size={12} style={{ marginRight: '4px', verticalAlign: 'middle', color: '#a855f7' }} />
                                        {lead?.company || lead?.employer || 'Self / Unspecified'}
                                        {lead?.category && <span className="cat-chip">{lead.category}</span>}
                                    </div>
                                    <div className="lead-income">
                                        ₹{(Number(lead?.totalIncome || lead?.monthlyIncome || 0)).toLocaleString('en-IN')} <span className="p-m">p.m.</span>
                                    </div>
                                </td>
                                <td>
                                    <div className="lead-banks">
                                        {(lead?.selectedBanks || 'All Eligible').split(',').map((bank, index) => (
                                            bank.trim() && <span key={index} className="bank-tag">{bank.trim()}</span>
                                        ))}
                                    </div>
                                    <div className="lead-status-row">
                                        <select
                                            className={`lead-status-dropdown status-${(lead?.status || 'new').toLowerCase()}`}
                                            value={lead?.status || 'New'}
                                            onChange={(e) => handleUpdateStatus(lead?.id, e.target.value)}
                                        >
                                            <option value="New">🟢 New</option>
                                            <option value="Contacted">🟡 Contacted</option>
                                            <option value="Qualified">🔵 Qualified</option>
                                            <option value="Closed">🟣 Closed</option>
                                        </select>
                                        <span className="lead-emi-badge">EMI: ₹{lead?.existingEMI || 0}</span>
                                    </div>
                                </td>
                                <td>
                                    <div className="action-buttons-cell">
                                        {/* Main Share Lead Button */}
                                        <button
                                            className="btn-share-lead-main"
                                            title="Share Lead (WhatsApp, Email, Copy, System)"
                                            onClick={() => setActiveShareLead(lead)}
                                        >
                                            <Share2 size={15} />
                                            <span>Share Lead</span>
                                        </button>

                                        {/* CEO Delete Action */}
                                        {userRole === 'ceo' && (
                                            <button
                                                className="btn-delete-lead"
                                                title="Delete Lead"
                                                onClick={() => handleDelete(lead?.id)}
                                            >
                                                <Trash2 size={15} color="#ff4444" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredLeads.length === 0 && (
                            <tr>
                                <td colSpan="6" className="empty-state">
                                    <div className="empty-state-content">
                                        <Calendar size={36} color="rgba(255,255,255,0.2)" />
                                        <p>No leads found for the selected filter criteria.</p>
                                        <button className="btn-reset-filter" onClick={() => { setDateFilter('all'); setSearchTerm(''); }}>
                                            Reset Filter to All Time
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* SHARE MODAL DIALOG */}
            {activeShareLead && (
                <div className="modal-overlay" onClick={() => setActiveShareLead(null)}>
                    <div className="share-modal-container glass-panel" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-header-info">
                                <Share2 size={20} color="#00d4ff" />
                                <h3>Share Customer Lead</h3>
                            </div>
                            <button className="close-btn" onClick={() => setActiveShareLead(null)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="share-lead-preview">
                            <div className="preview-label">PREVIEW DOSSIER:</div>
                            <div className="lead-preview-card">
                                <div className="preview-top">
                                    <span className="preview-name">{activeShareLead?.name || 'Anonymous Applicant'}</span>
                                    <span className="preview-mobile">{activeShareLead?.mobile}</span>
                                </div>
                                <div className="preview-details-grid">
                                    <div><strong>Company:</strong> {activeShareLead?.company || 'N/A'}</div>
                                    <div><strong>Monthly Income:</strong> ₹{Number(activeShareLead?.totalIncome || activeShareLead?.monthlyIncome || 0).toLocaleString('en-IN')}</div>
                                    <div><strong>Existing EMI:</strong> ₹{Number(activeShareLead?.existingEMI || 0).toLocaleString('en-IN')}</div>
                                    <div><strong>Location:</strong> {activeShareLead?.city || 'N/A'}</div>
                                    <div className="col-span-2"><strong>Selected Banks:</strong> {activeShareLead?.selectedBanks || 'All Applicable'}</div>
                                </div>
                            </div>
                        </div>

                        <div className="share-options-grid">
                            <button 
                                className="share-action-card wa-card"
                                onClick={() => { handleWhatsAppShare(activeShareLead); setActiveShareLead(null); }}
                            >
                                <MessageCircle size={26} color="#25D366" />
                                <div>
                                    <div className="action-title">WhatsApp</div>
                                    <div className="action-desc">Share directly via WhatsApp chat</div>
                                </div>
                            </button>

                            <button 
                                className="share-action-card mail-card"
                                onClick={() => { handleEmailShare(activeShareLead); setActiveShareLead(null); }}
                            >
                                <Mail size={26} color="#EA4335" />
                                <div>
                                    <div className="action-title">Email</div>
                                    <div className="action-desc">Send structured email dispatch</div>
                                </div>
                            </button>

                            <button 
                                className="share-action-card copy-card"
                                onClick={() => handleCopyLead(activeShareLead)}
                            >
                                {copiedLeadId === activeShareLead?.id ? (
                                    <CheckCircle2 size={26} color="#00ff88" />
                                ) : (
                                    <Copy size={26} color="#00d4ff" />
                                )}
                                <div>
                                    <div className="action-title">
                                        {copiedLeadId === activeShareLead?.id ? 'Copied to Clipboard!' : 'Copy Dossier'}
                                    </div>
                                    <div className="action-desc">Copy full text to paste anywhere</div>
                                </div>
                            </button>

                            {navigator.share && (
                                <button 
                                    className="share-action-card native-card"
                                    onClick={() => { handleNativeShare(activeShareLead); setActiveShareLead(null); }}
                                >
                                    <ArrowUpRight size={26} color="#ffab00" />
                                    <div>
                                        <div className="action-title">System Share</div>
                                        <div className="action-desc">Open device native share sheet</div>
                                    </div>
                                </button>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button className="btn-modal-close" onClick={() => setActiveShareLead(null)}>
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* FULL LEAD DETAIL INSPECTION MODAL */}
            {activeDetailLead && (
                <div className="modal-overlay" onClick={() => setActiveDetailLead(null)}>
                    <div className="detail-modal-container glass-panel" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-header-info">
                                <UserCheck size={22} color="#00ff88" />
                                <div>
                                    <h3>{activeDetailLead?.name || 'Customer'} - Lead Dossier</h3>
                                    <span className="lead-time-sub">{activeDetailLead?.timestamp || 'N/A'}</span>
                                </div>
                            </div>
                            <button className="close-btn" onClick={() => setActiveDetailLead(null)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="detail-sections">
                            <div className="detail-section">
                                <h4>Identity & Contact</h4>
                                <div className="detail-grid">
                                    <div className="detail-field">
                                        <span className="detail-label">Full Name:</span>
                                        <span className="detail-val">{activeDetailLead?.name || 'N/A'}</span>
                                    </div>
                                    <div className="detail-field">
                                        <span className="detail-label">Mobile Number:</span>
                                        <span className="detail-val font-mono">{activeDetailLead?.mobile || 'N/A'}</span>
                                    </div>
                                    <div className="detail-field">
                                        <span className="detail-label">Age:</span>
                                        <span className="detail-val">{activeDetailLead?.age || 'N/A'} years</span>
                                    </div>
                                    <div className="detail-field">
                                        <span className="detail-label">Marital Status:</span>
                                        <span className="detail-val">{activeDetailLead?.maritalStatus || 'N/A'}</span>
                                    </div>
                                    <div className="detail-field">
                                        <span className="detail-label">City:</span>
                                        <span className="detail-val">{activeDetailLead?.city || 'N/A'}</span>
                                    </div>
                                    <div className="detail-field">
                                        <span className="detail-label">State:</span>
                                        <span className="detail-val">{activeDetailLead?.state || 'N/A'}</span>
                                    </div>
                                    <div className="detail-field">
                                        <span className="detail-label">Living Status:</span>
                                        <span className="detail-val">{activeDetailLead?.livingStatus || 'N/A'}</span>
                                    </div>
                                    <div className="detail-field">
                                        <span className="detail-label">Salary Mode:</span>
                                        <span className="detail-val">{activeDetailLead?.salaryMode || 'Bank Transfer'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h4>Employment & Compensation</h4>
                                <div className="detail-grid">
                                    <div className="detail-field">
                                        <span className="detail-label">Company / Employer:</span>
                                        <span className="detail-val highlight">{activeDetailLead?.company || activeDetailLead?.employer || 'N/A'}</span>
                                    </div>
                                    <div className="detail-field">
                                        <span className="detail-label">Category:</span>
                                        <span className="detail-val cat-chip">{activeDetailLead?.category || 'General'}</span>
                                    </div>
                                    <div className="detail-field">
                                        <span className="detail-label">Net In-Hand Salary:</span>
                                        <span className="detail-val text-neon-cyan">₹{Number(activeDetailLead?.totalIncome || activeDetailLead?.monthlyIncome || 0).toLocaleString('en-IN')} p.m.</span>
                                    </div>
                                    <div className="detail-field">
                                        <span className="detail-label">Basic Salary:</span>
                                        <span className="detail-val">₹{Number(activeDetailLead?.basicSalary || 0).toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="detail-field">
                                        <span className="detail-label">Total Existing EMI:</span>
                                        <span className="detail-val text-warning">₹{Number(activeDetailLead?.existingEMI || 0).toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="detail-field">
                                        <span className="detail-label">Balance Transfer (BT):</span>
                                        <span className="detail-val">{activeDetailLead?.wantsBT || 'No'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h4>Existing Obligations & Selected Banks</h4>
                                <div className="detail-notes">
                                    <p><strong>Personal Loans:</strong> {activeDetailLead?.personalLoans || 'None recorded'}</p>
                                    <p><strong>Credit Cards:</strong> {activeDetailLead?.creditCards || 'None recorded'}</p>
                                </div>
                                <div className="selected-banks-box">
                                    <span className="detail-label">Shortlisted Banks:</span>
                                    <div className="lead-banks" style={{ marginTop: '8px' }}>
                                        {(activeDetailLead?.selectedBanks || 'All Banks').split(',').map((bank, index) => (
                                            bank.trim() && <span key={index} className="bank-tag">{bank.trim()}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer detail-modal-footer">
                            <div className="footer-left">
                                <button 
                                    className="btn-share-lead-main"
                                    onClick={() => {
                                        const lead = activeDetailLead;
                                        setActiveDetailLead(null);
                                        setActiveShareLead(lead);
                                    }}
                                >
                                    <Share2 size={16} />
                                    <span>Share This Lead</span>
                                </button>
                            </div>
                            <button className="btn-modal-close" onClick={() => setActiveDetailLead(null)}>
                                Close Dossier
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeadManager;
