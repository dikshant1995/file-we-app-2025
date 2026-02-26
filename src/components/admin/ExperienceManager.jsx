import React, { useState, useEffect } from 'react';
import { MessageSquare, Trash2, Calendar, User, Search } from 'lucide-react';
import './LeadManager.css'; // Reusing some table styles

const ExperienceManager = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const loadFeedback = () => {
            try {
                const stored = localStorage.getItem('laxmi_feedback');
                const localFeedback = stored ? JSON.parse(stored) : [];
                setFeedbacks(Array.isArray(localFeedback) ? localFeedback : []);
            } catch (err) {
                console.error('Error parsing feedback:', err);
                setFeedbacks([]);
            }
        };
        loadFeedback();

        window.addEventListener('storage', loadFeedback);
        return () => window.removeEventListener('storage', loadFeedback);
    }, []);

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this feedback pulse?')) {
            const updated = feedbacks.filter(f => f.id !== id);
            setFeedbacks(updated);
            localStorage.setItem('laxmi_feedback', JSON.stringify(updated));
        }
    };

    const filteredFeedbacks = feedbacks.filter(f =>
        f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.text.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="lead-manager-container">
            <div className="lead-header">
                <div>
                    <h2>Experience Feedback Pulses</h2>
                    <p>Insights shared by users via the landing page suggestion box</p>
                </div>
                <div className="lead-stats">
                    <div className="stat-item">
                        <span className="stat-label">Total Pulses</span>
                        <span className="stat-value">{feedbacks.length}</span>
                    </div>
                </div>
            </div>

            <div className="lead-controls glass-panel">
                <div className="search-box">
                    <Search size={18} color="#ffffff" strokeWidth={2.5} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search feedback content or names..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="leads-table-wrapper glass-panel">
                <table className="leads-table">
                    <thead>
                        <tr>
                            <th style={{ width: '20%' }}><User size={14} style={{ marginRight: 8 }} /> User</th>
                            <th style={{ width: '60%' }}><MessageSquare size={14} style={{ marginRight: 8 }} /> Experience / Suggestion</th>
                            <th style={{ width: '15%' }}><Calendar size={14} style={{ marginRight: 8 }} /> Received</th>
                            <th style={{ width: '5%' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredFeedbacks.length > 0 ? (
                            filteredFeedbacks.map(f => (
                                <tr key={f.id}>
                                    <td>
                                        <div className="lead-name">{f.name}</div>
                                    </td>
                                    <td>
                                        <div style={{ color: '#fff', lineHeight: '1.6', fontSize: '0.95rem' }}>
                                            {f.text}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="lead-time">{f.timestamp}</div>
                                    </td>
                                    <td>
                                        <button
                                            className="action-btn-advanced mail"
                                            title="Delete Pulse"
                                            onClick={() => handleDelete(f.id)}
                                            style={{ borderColor: 'rgba(239, 68, 68, 0.2)' }}
                                        >
                                            <Trash2 size={18} color="#ef4444" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                    No feedback pulses detected in the system.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ExperienceManager;
