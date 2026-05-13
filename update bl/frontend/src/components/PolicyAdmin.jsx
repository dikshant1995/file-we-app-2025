import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PolicyAdmin = () => {
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchPolicies();
    }, []);

    const fetchPolicies = async () => {
        try {
            const apiBase = import.meta.env.VITE_API_URL || (window.location.origin.includes('localhost') ? 'http://localhost:8000' : '/api-bl');
            const res = await axios.get(`${apiBase}/api/policies`);
            setPolicies(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdate = (id, field, value) => {
        setPolicies(policies.map(p => p.id === id ? { ...p, [field]: value } : p));
    };

    const savePolicies = async () => {
        setSaving(true);
        try {
            const apiBase = import.meta.env.VITE_API_URL || (window.location.origin.includes('localhost') ? 'http://localhost:8000' : '/api-bl');
            await axios.post(`${apiBase}/api/policies`, policies);
            alert("Policies updated successfully!");
        } catch (err) {
            alert("Error saving policies");
        }
        setSaving(false);
    };

    if (loading) return <div className="p-12 text-center text-muted italic">Initializing secure policy link...</div>;

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-12">
                <header>
                    <h1 className="gradient-text mb-2">Deep Analytics Policy Command Center</h1>
                    <p className="text-secondary">Control forensic eligibility parameters and lender-specific risk thresholds.</p>
                </header>
                <div className="flex gap-4">
                    <button className="btn btn-ghost" onClick={fetchPolicies}>Reload Data</button>
                    <button 
                        onClick={savePolicies}
                        disabled={saving}
                        className="btn btn-primary"
                    >
                        {saving ? 'Syncing...' : 'Save All Changes'}
                    </button>
                </div>
            </div>

            <div className="glass-card p-0 overflow-hidden">
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1600px' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255, 255, 255, 0.03)' }}>
                                <th style={headerStyle}>Lender</th>
                                <th style={headerStyle}>ABB Dates</th>
                                <th style={headerStyle}>GST Vintage</th>
                                <th style={headerStyle}>ITR Policy</th>
                                <th style={headerStyle}>Residence</th>
                                <th style={headerStyle}>Office</th>
                                <th style={headerStyle}>Debit Credit Entries Requirement</th>
                                <th style={headerStyle}>Statement Period Required</th>
                                <th style={headerStyle}>Geo Meter (KM)</th>
                                <th style={headerStyle}>Utilisation Cap</th>
                                <th style={headerStyle}>AO/TO Percentage (%)</th>
                                <th style={headerStyle}>ABB Deduction Strategy</th>
                                <th style={headerStyle}>Co-App Logic</th>
                                <th style={headerStyle}>Live Loan Policy</th>
                            </tr>
                        </thead>
                        <tbody>
                            {policies.map(p => (
                                <tr key={p.id} className="hover:bg-white/5 transition-colors border-t border-glass-border">
                                    <td style={{ padding: '1.25rem', fontWeight: '800', color: 'var(--primary)', position: 'sticky', left: 0, background: 'var(--bg-surface)', zIndex: 10 }}>{p.name}</td>
                                    <td style={cellStyle}>
                                        <input 
                                            type="text" 
                                            value={p.abb_dates.join(', ')} 
                                            onChange={(e) => handleUpdate(p.id, 'abb_dates', e.target.value.split(',').map(v => parseInt(v.trim()) || 0))}
                                            className="input-field compact"
                                        />
                                    </td>
                                    <td style={cellStyle}>
                                        <input 
                                            type="text" 
                                            value={p.gst_vintage} 
                                            onChange={(e) => handleUpdate(p.id, 'gst_vintage', e.target.value)}
                                            className="input-field compact"
                                        />
                                    </td>
                                    <td style={cellStyle}>
                                        <input 
                                            type="text" 
                                            value={p.itr_vintage} 
                                            onChange={(e) => handleUpdate(p.id, 'itr_vintage', e.target.value)}
                                            className="input-field compact"
                                        />
                                    </td>
                                    <td style={cellStyle}>
                                        <select 
                                            value={p.rented_residence_allowed ? 'YES' : 'NO'} 
                                            onChange={(e) => handleUpdate(p.id, 'rented_residence_allowed', e.target.value === 'YES')}
                                            className="select-field compact"
                                        >
                                            <option value="YES">Rented OK</option>
                                            <option value="NO">Owned Only</option>
                                        </select>
                                    </td>
                                    <td style={cellStyle}>
                                        <select 
                                            value={p.rented_office_allowed ? 'YES' : 'NO'} 
                                            onChange={(e) => handleUpdate(p.id, 'rented_office_allowed', e.target.value === 'YES')}
                                            className="select-field compact"
                                        >
                                            <option value="YES">Rented OK</option>
                                            <option value="NO">Owned Only</option>
                                        </select>
                                    </td>
                                    <td style={cellStyle}>
                                        <input 
                                            type="text" 
                                            value={p.min_entries} 
                                            onChange={(e) => handleUpdate(p.id, 'min_entries', e.target.value)}
                                            className="input-field compact"
                                        />
                                    </td>
                                    <td style={cellStyle}>
                                        <input 
                                            type="text" 
                                            value={p.min_active_months || '6'} 
                                            onChange={(e) => handleUpdate(p.id, 'min_active_months', e.target.value)}
                                            className="input-field compact"
                                        />
                                    </td>
                                    <td style={cellStyle}>
                                        <input 
                                            type="text" 
                                            value={p.geo_meter_km} 
                                            onChange={(e) => handleUpdate(p.id, 'geo_meter_km', e.target.value)}
                                            className="input-field compact"
                                        />
                                    </td>
                                    <td style={cellStyle}>
                                        <input 
                                            type="text" 
                                            value={p.utilisation_cap || '80%'} 
                                            onChange={(e) => handleUpdate(p.id, 'utilisation_cap', e.target.value)}
                                            className="input-field compact"
                                        />
                                    </td>
                                    <td style={cellStyle}>
                                        <input 
                                            type="text" 
                                            value={p.ao_to_percentage || '15%'} 
                                            onChange={(e) => handleUpdate(p.id, 'ao_to_percentage', e.target.value)}
                                            className="input-field compact"
                                        />
                                    </td>
                                    <td style={cellStyle}>
                                        <select 
                                            value={p.obligation_source || 'Current_Active'} 
                                            onChange={(e) => handleUpdate(p.id, 'obligation_source', e.target.value)}
                                            className="select-field compact"
                                            style={{ minWidth: '200px' }}
                                        >
                                            <option value="Current_Active">All Active Loans EMI</option>
                                            <option value="Business_Active">Business Loans EMI Only</option>
                                            <option value="Last_3_Months_Active">Last 3M Business Loans EMI Only</option>
                                            <option value="Last_6_Months_Active">Last 6M Business Loans EMI Only</option>
                                        </select>
                                    </td>
                                    <td style={cellStyle}>
                                        <select 
                                            value={p.co_app_policy === 'YES' ? 'YES' : 'SINGLE APP'} 
                                            onChange={(e) => handleUpdate(p.id, 'co_app_policy', e.target.value)}
                                            className="select-field compact"
                                        >
                                            <option value="SINGLE APP">Single App</option>
                                            <option value="YES">Co-App Mandatory</option>
                                        </select>
                                    </td>
                                    <td style={cellStyle}>
                                        <input 
                                            type="text" 
                                            value={p.live_loan_policy} 
                                            onChange={(e) => handleUpdate(p.id, 'live_loan_policy', e.target.value)}
                                            className="input-field compact"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const headerStyle = {
    padding: '1.25rem',
    textAlign: 'left',
    color: 'var(--text-secondary)',
    fontSize: '0.7rem',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    whiteSpace: 'nowrap'
};

const cellStyle = {
    padding: '0.75rem 1.25rem',
    minWidth: '180px'
};

export default PolicyAdmin;
