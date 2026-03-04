import React, { useState } from 'react';
import { Mail, Download, Search, MessageCircle, Copy, Trash2, Plus, Share2 } from 'lucide-react';
import './LeadManager.css';

const LeadManager = ({ userRole }) => {
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
        const loadLeads = async () => {
            try {
                const response = await fetch('/api/leads');
                let serverLeads = [];
                if (response.ok) {
                    serverLeads = await response.json();
                    console.log(`✅ Loaded ${serverLeads.length} leads from server`);
                }

                const stored = localStorage.getItem('laxmi_leads');
                const localLeads = stored ? JSON.parse(stored) : [];

                // Combine and de-duplicate by mobile (or ID)
                const combined = [...serverLeads, ...(Array.isArray(localLeads) ? localLeads : [])];
                const uniqueLeads = Array.from(new Map(combined.map(item => [item.id || item.mobile, item])).values());

                setLeads(uniqueLeads.length > 0 ? uniqueLeads : mockLeads);
            } catch (err) {
                console.error('Error loading leads:', err);
                const stored = localStorage.getItem('laxmi_leads');
                setLeads(stored ? JSON.parse(stored) : mockLeads);
            }
        };
        loadLeads();
        window.addEventListener('storage', loadLeads);
        return () => window.removeEventListener('storage', loadLeads);
    }, []);

    // Filter by Search and Date
    const filteredLeads = leads.filter(lead => {
        const matchesSearch = (lead?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (lead?.mobile || '').includes(searchTerm) ||
            (lead?.company || lead?.employer || '').toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;
        if (dateFilter === 'all') return true;

        if (!lead?.timestamp) return true;
        const [datePart] = lead.timestamp.split(', ');
        if (!datePart) return true;
        const [day, month, year] = datePart.split('/').map(Number);
        const leadDate = new Date(year, month - 1, day);
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const diffTime = now.getTime() - leadDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        switch (dateFilter) {
            case 'today': return diffDays <= 0;
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

    const handleDelete = (id) => {
        if (userRole !== 'ceo') {
            alert('SECURITY VIOLATION: Access Denied. Only CEO identities can purge neural lead records.');
            return;
        }
        if (window.confirm('PROTOCOL WARNING: Are you sure you want to permanently delete this identity data?')) {
            const updated = leads.filter(l => l.id !== id);
            setLeads(updated);
            localStorage.setItem('laxmi_leads', JSON.stringify(updated.filter(l => !l.id.startsWith('m'))));
        }
    };

    const handleDownloadCSV = () => {
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
                `"${l.company || l.employer}"`,
                l.totalIncome || l.monthlyIncome,
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
        const message = `*New Lead Detail from LaxmiCredit*%0A%0A*Name:* ${lead?.name}%0A*Mobile:* ${lead?.mobile}%0A*Company:* ${lead?.company || lead?.employer}%0A*Income:* ₹${lead?.totalIncome || lead?.monthlyIncome}%0A*Banks:* ${lead?.selectedBanks}`;
        window.open(`https://wa.me/?text=${message}`, '_blank');
    };

    const handleEmailShare = (lead) => {
        const subject = `Lead Detail: ${lead?.name}`;
        const body = `Customer Lead Information:\n\nName: ${lead?.name}\nMobile: ${lead?.mobile}\nCompany: ${lead?.company || lead?.employer}\nMonthly Income: ₹${lead?.totalIncome || lead?.monthlyIncome}\nExisting EMI: ₹${lead?.existingEMI}\nInterested Banks: ${lead?.selectedBanks}\n\nTimestamp: ${lead?.timestamp}`;
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    const handleCopyLead = (lead) => {
        const text = `
LOAN LEAD DETAILS
-----------------
Name: ${lead?.name || 'N/A'}
Mobile: ${lead?.mobile || 'N/A'}
Monthly Income: ₹${Number(lead?.totalIncome || lead?.monthlyIncome || 0).toLocaleString()}
Monthly Incentives: ₹${Number(lead?.incentives || 0).toLocaleString()}
Employer: ${lead?.company || lead?.employer || 'N/A'}
Location: ${lead?.city || 'N/A'}, ${lead?.state || 'N/A'}
Timestamp: ${lead?.timestamp || 'N/A'}

SELECTED BANKS:
${(lead?.selectedBanks || '').split(',').map(b => `- ${b.trim()}`).join('\n') || 'None'}
        `.trim();

        navigator.clipboard.writeText(text).then(() => {
            alert('Full lead data copied to clipboard!');
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
                                    <div className="lead-name">{lead?.name || 'Anonymous'}</div>
                                    <div className="lead-time">{lead?.timestamp || 'N/A'}</div>
                                </td>
                                <td>
                                    <div className="lead-mobile">{lead?.mobile || 'N/A'}</div>
                                </td>
                                <td>
                                    <div className="lead-company">{lead?.company || lead?.employer || 'N/A'}</div>
                                    <div className="lead-income">₹{(lead?.totalIncome || lead?.monthlyIncome || 0).toLocaleString()} p.m.</div>
                                </td>
                                <td>
                                    <div className="lead-banks">
                                        {(lead?.selectedBanks || '').split(',').map((bank, index) => (
                                            bank.trim() && <span key={index} className="bank-tag">{bank.trim()}</span>
                                        ))}
                                    </div>
                                    <div className="lead-emi">Existing EMI: ₹{lead?.existingEMI || 0}</div>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            className="action-btn-advanced wa"
                                            title="WhatsApp Customer"
                                            onClick={() => handleWhatsAppShare(lead)}
                                        >
                                            <MessageCircle size={20} color="#25D366" strokeWidth={2.5} style={{ opacity: 1, visibility: 'visible' }} />
                                        </button>
                                        <button
                                            className="action-btn-advanced mail"
                                            title="Email Lead Details"
                                            onClick={() => handleEmailShare(lead)}
                                        >
                                            <Mail size={20} color="#EA4335" strokeWidth={2.5} style={{ opacity: 1, visibility: 'visible' }} />
                                        </button>
                                        <button
                                            className="action-btn-advanced share"
                                            title="Copy Lead Data"
                                            onClick={() => handleCopyLead(lead)}
                                        >
                                            <Copy size={18} color="#00d4ff" strokeWidth={2.5} />
                                        </button>
                                        <button
                                            className="action-btn-advanced delete"
                                            title="Delete Lead"
                                            onClick={() => handleDelete(lead?.id)}
                                        >
                                            <Trash2 size={18} color="#ff4444" strokeWidth={2} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredLeads.length === 0 && (
                            <tr>
                                <td colSpan="6" className="empty-state">
                                    No leads found matching your criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LeadManager;
