import React, { useState } from 'react';
import { Mail, Share2, Download, Search, MessageCircle } from 'lucide-react';
import './LeadManager.css';

const LeadManager = () => {
    const [searchTerm, setSearchTerm] = useState('');

    // Mock data based on the structure in leadService.js
    const mockLeads = [
        {
            id: 1,
            timestamp: '21/02/2026, 17:05:12',
            name: 'Vikram Singh',
            mobile: '9876543210',
            company: 'Tata Consultancy Services',
            totalIncome: 125000,
            existingEMI: 15000,
            selectedBanks: 'HDFC, ICICI, AXIS',
            status: 'New'
        },
        {
            id: 2,
            timestamp: '21/02/2026, 16:42:05',
            name: 'Anjali Sharma',
            mobile: '9988776655',
            company: 'Google India',
            totalIncome: 210000,
            existingEMI: 0,
            selectedBanks: 'Standard Chartered, Kotak',
            status: 'Contacted'
        },
        {
            id: 3,
            timestamp: '21/02/2026, 15:20:11',
            name: 'Rahul Verma',
            mobile: '9122334455',
            company: 'Reliance Industries',
            totalIncome: 85000,
            existingEMI: 5000,
            selectedBanks: 'HDFC, SBI',
            status: 'Qualified'
        }
    ];

    const filteredLeads = mockLeads.filter(lead =>
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.mobile.includes(searchTerm) ||
        lead.company.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDownloadCSV = () => {
        const headers = ['Timestamp', 'Name', 'Mobile', 'Company', 'Monthly Income', 'Existing EMI', 'Selected Banks'];
        const csvContent = [
            headers.join(','),
            ...filteredLeads.map(l => [
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
        a.download = `LaxmiCredit_Leads_${new Date().toISOString().split('T')[0]}.csv`;
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

    return (
        <div className="lead-manager-container">
            <div className="lead-header">
                <div>
                    <h2>Lead Management Pipeline</h2>
                    <p>Track and action institutional eligibility inquiries</p>
                </div>
                <button className="btn-download-all" onClick={handleDownloadCSV}>
                    <Download size={18} />
                    Download Lead Sheet
                </button>
            </div>

            <div className="lead-controls glass-panel">
                <div className="search-box">
                    <Search size={18} color="#ffffff" strokeWidth={2.5} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search by name, mobile or company..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="lead-stats">
                    <div className="stat-item">
                        <span className="stat-label">Total Leads</span>
                        <span className="stat-label">Total Leads</span>
                        <span className="stat-value">{mockLeads.length}</span>
                    </div>
                </div>
            </div>

            <div className="leads-table-wrapper glass-panel">
                <table className="leads-table">
                    <thead>
                        <tr>
                            <th>Customer</th>
                            <th>Mobile</th>
                            <th>Employment / Income</th>
                            <th>Eligibility Details</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLeads.map(lead => (
                            <tr key={lead.id}>
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
                                            className="action-btn wa"
                                            title="Share on WhatsApp"
                                            onClick={() => handleWhatsAppShare(lead)}
                                        >
                                            <MessageCircle size={20} strokeWidth={2.5} />
                                        </button>
                                        <button
                                            className="action-btn mail"
                                            title="Share via Email"
                                            onClick={() => handleEmailShare(lead)}
                                        >
                                            <Mail size={18} strokeWidth={2.5} />
                                        </button>
                                        <button className="action-btn share" title="Copy Details">
                                            <Share2 size={18} color="#ffffff" strokeWidth={2.5} />
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
