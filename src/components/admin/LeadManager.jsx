import React, { useState } from 'react';
import { Mail, Share2, Download, Search, MessageCircle } from 'lucide-react';
import './LeadManager.css';

const LeadManager = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [leads, setLeads] = useState([]);
    const [selectedLeadIds, setSelectedLeadIds] = useState(new Set());
    const [dateFilter, setDateFilter] = useState('all'); // 'today', '2days', 'week', 'month', '3months', '6months', 'all'

    // Initial mock data to keep UI populated
    const mockLeads = [
        { id: 'm1', timestamp: '21/02/2026, 17:05:12', name: 'Vikram Singh', mobile: '9876543210', company: 'Tata Consultancy Services', totalIncome: 125000, existingEMI: 15000, selectedBanks: 'HDFC, ICICI, AXIS', status: 'New' },
        { id: 'm2', timestamp: '21/02/2026, 16:42:05', name: 'Anjali Sharma', mobile: '9988776655', company: 'Google India', totalIncome: 210000, existingEMI: 0, selectedBanks: 'Standard Chartered, Kotak', status: 'Contacted' },
        { id: 'm3', timestamp: '21/02/2026, 15:20:11', name: 'Rahul Verma', mobile: '9122334455', company: 'Reliance Industries', totalIncome: 85000, existingEMI: 5000, selectedBanks: 'HDFC, SBI', status: 'Qualified' }
    ];

    // Load Leads from Persistence
    React.useEffect(() => {
        const loadLeads = () => {
            try {
                const stored = localStorage.getItem('laxmi_leads');
                const localLeads = stored ? JSON.parse(stored) : [];
                // Safely spread only if localLeads is an array
                setLeads([...(Array.isArray(localLeads) ? localLeads : []), ...mockLeads]);
            } catch (err) {
                console.error('Error parsing leads:', err);
                setLeads([...mockLeads]);
            }
        };
        loadLeads();
        window.addEventListener('storage', loadLeads);
        return () => window.removeEventListener('storage', loadLeads);
    }, []);

    // Filter by Search and Date
    const filteredLeads = leads.filter(lead => {
        // Search Filter
        const matchesSearch = (lead.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (lead.mobile || '').includes(searchTerm) ||
            (lead.company || '').toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;

        // Date Filter
        if (dateFilter === 'all') return true;

        // Parse date from "DD/MM/YYYY, HH:MM:SS"
        if (!lead?.timestamp) return true; // Show items with missing timestamp at top/unsorted
        const [datePart] = lead.timestamp.split(', ');
        const [day, month, year] = datePart.split('/').map(Number);
        const leadDate = new Date(year, month - 1, day);
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const diffTime = now.getTime() - leadDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        switch (dateFilter) {
            case 'today': return diffDays === 0;
            case '2days': return diffDays <= 1;
            case 'week': return diffDays <= 7;
            case 'month': return diffDays <= 30;
            case '3months': return diffDays <= 90;
            case '6months': return diffDays <= 180;
            default: return true;
        }
    });

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

    const handleDownloadCSV = () => {
        // Priority: Selected Leads > Filtered Leads
        const exportData = selectedLeadIds.size > 0
            ? leads.filter(l => selectedLeadIds.has(l.id))
            : filteredLeads;

        if (exportData.length === 0) {
            alert('No leads found for current selection/filter.');
            return;
        }

        const headers = ['Timestamp', 'Name', 'Mobile', 'Company', 'Monthly Income', 'Existing EMI', 'Selected Banks'];
        const csvContent = [
            headers.join(','),
            ...exportData.map(l => [
                l.timestamp,
                `"${l.name}"`,
                l.mobile,
                `"${l.company}"`,
                l.totalIncome,
                l.existingEMI,
                `"${l.selectedBanks}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const filterStr = dateFilter !== 'all' ? `_${dateFilter}` : '';
        a.download = `LaxmiCredit_Leads${filterStr}_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const handleWhatsAppShare = (lead) => {
        const message = `*New Lead Detail from LaxmiCredit*%0A%0A*Name:* ${lead.name}%0A*Mobile:* ${lead.mobile}%0A*Company:* ${lead.company}%0A*Income:* ₹${lead.totalIncome}%0A*Banks:* ${lead.selectedBanks}`;
        window.open(`https://wa.me/?text=${message}`, '_blank');
    };

    const handleEmailShare = (lead) => {
        const subject = `Lead Detail: ${lead.name}`;
        const body = `Customer Lead Information:\n\nName: ${lead.name}\nMobile: ${lead.mobile}\nCompany: ${lead.company}\nMonthly Income: ₹${lead.totalIncome}\nExisting EMI: ₹${lead.existingEMI}\nInterested Banks: ${lead.selectedBanks}\n\nTimestamp: ${lead.timestamp}`;
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    const handleCopyLead = (lead) => {
        const text = `Customer: ${lead.name} (${lead.mobile})\nCompany: ${lead.company}\nIncome: ₹${lead.totalIncome}\nExisting EMI: ₹${lead.existingEMI}\nInterested Banks: ${lead.selectedBanks}\nTimestamp: ${lead.timestamp}`;
        navigator.clipboard.writeText(text).then(() => {
            alert(`Summary for ${lead.name} copied to clipboard!`);
        });
    };

    return (
        <div className="lead-manager-container">
            <div className="lead-header">
                <div>
                    <h2>Lead Management Pipeline</h2>
                    <p>Track and action institutional eligibility inquiries</p>
                </div>
                <div className="download-group">
                    <select
                        className="date-filter-select"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                    >
                        <option value="today">Today's Leads</option>
                        <option value="2days">Last 2 Days</option>
                        <option value="week">Past Week</option>
                        <option value="month">Past Month</option>
                        <option value="3months">Past 3 Months</option>
                        <option value="6months">Past 6 Months</option>
                        <option value="all">Till Date (All)</option>
                    </select>
                    <button className="btn-download-advanced" onClick={handleDownloadCSV}>
                        <Download size={18} />
                        {selectedLeadIds.size > 0 ? `Download Selection (${selectedLeadIds.size})` : 'Download Filtered Leads'}
                    </button>
                </div>
            </div>

            <div className="lead-controls glass-panel">
                <div className="search-box">
                    <Search size={18} color="#ffffff" strokeWidth={2.5} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Filter by name, mobile or company..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="lead-stats">
                    <div className="stat-item">
                        <span className="stat-label">Total Leads</span>
                        <span className="stat-value">{leads.length}</span>
                    </div>
                </div>
            </div>

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
                            <th>Customer</th>
                            <th>Mobile</th>
                            <th>Employment / Income</th>
                            <th>Eligibility Details</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLeads.map(lead => (
                            <tr key={lead.id} className={selectedLeadIds.has(lead.id) ? 'selected-row' : ''}>
                                <td className="checkbox-col">
                                    <input
                                        type="checkbox"
                                        className="lead-checkbox"
                                        checked={selectedLeadIds.has(lead.id)}
                                        onChange={() => handleSelectLead(lead.id)}
                                    />
                                </td>
                                <td>
                                    <div className="lead-name">{lead.name}</div>
                                    <div className="lead-time">{lead.timestamp}</div>
                                </td>
                                <td>
                                    <div className="lead-mobile">{lead.mobile}</div>
                                </td>
                                <td>
                                    <div className="lead-company">{lead.company}</div>
                                    <div className="lead-income">₹{lead.totalIncome.toLocaleString()} p.m.</div>
                                </td>
                                <td>
                                    <div className="lead-banks">
                                        {lead.selectedBanks.split(',').map(bank => (
                                            <span key={bank} className="bank-tag">{bank.trim()}</span>
                                        ))}
                                    </div>
                                    <div className="lead-emi">Existing EMI: ₹{lead.existingEMI}</div>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            className="action-btn-advanced wa"
                                            title="Quick Actions: WhatsApp Customer"
                                            onClick={() => handleWhatsAppShare(lead)}
                                        >
                                            <MessageCircle size={18} color="#25D366" strokeWidth={2.5} />
                                        </button>
                                        <button
                                            className="action-btn-advanced mail"
                                            title="Quick Actions: Email Lead Details"
                                            onClick={() => handleEmailShare(lead)}
                                        >
                                            <Mail size={18} color="#EA4335" strokeWidth={2.5} />
                                        </button>
                                        <button
                                            className="action-btn-advanced share"
                                            title="Copy Lead Data"
                                            onClick={() => handleCopyLead(lead)}
                                        >
                                            <Share2 size={18} color="#00d4ff" strokeWidth={2.5} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LeadManager;
