import React, { useState } from 'react';
import { Lock, User, ShieldAlert } from 'lucide-react';

const AdminLogin = ({ onLoginSuccess }) => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        setError('');
        // 🔐 PRESET CREDENTIALS (Can be changed by user as requested)
        const DEFAULT_USER = 'laxmi_admin';
        const DEFAULT_PASS = 'laxmi@2025';

        if (credentials.username === DEFAULT_USER && credentials.password === DEFAULT_PASS) {
            onLoginSuccess();
        } else {
            setError('Access Denied: Incorrect Secure ID or Credentials.');
        }
    };

    return (
        <div className="flex items-center justify-center" style={{ minHeight: '60vh' }}>
            <div className="glass-card w-full max-w-md animate-fade-in" style={{ padding: '3rem' }}>
                <div className="text-center mb-8">
                    <div className="icon-circle" style={{ width: '60px', height: '60px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', marginBottom: '1.5rem' }}>
                        <Lock size={28} />
                    </div>
                    <h2 className="gradient-text text-2xl font-bold">Secure Admin Link</h2>
                    <p className="text-secondary mt-2 text-sm">Enter clearance code to modify systemic policies.</p>
                </div>

                <form onSubmit={handleLogin} className="flex flex-col gap-6">
                    <div className="form-group mb-0">
                        <label className="label">Admin ID</label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input 
                                type="text" 
                                className="input-field" 
                                style={{ paddingLeft: '40px' }}
                                placeholder="Enter ID"
                                required
                                value={credentials.username}
                                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="form-group mb-0">
                        <label className="label">Secure Key</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input 
                                type="password" 
                                className="input-field" 
                                style={{ paddingLeft: '40px' }}
                                placeholder="••••••••"
                                required
                                value={credentials.password}
                                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 p-3 rounded text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse">
                            <ShieldAlert size={16} />
                            {error}
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary w-full mt-2">
                        Initialize Authorization
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
