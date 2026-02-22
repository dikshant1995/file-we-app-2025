import { useState } from 'react';
import './AdminLogin.css';

const AdminLogin = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (data.success) {
                setTimeout(() => {
                    onLogin();
                    setIsSubmitting(false);
                }, 800);
            } else {
                setError('Unauthorized: Invalid Institutional Credentials');
                setIsSubmitting(false);
            }
        } catch (err) {
            setError('Connection Error: Security service unreachable');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="admin-login-overlay professional-grid-bg">
            <div className="login-card glass-morphism">
                <div className="login-header">
                    <div className="security-icon">🛡️</div>
                    <h1>Institutional Governance</h1>
                    <p>Secure Access Control for Policy Management</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="username">Administrator ID</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter Admin ID"
                            required
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Security Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && <div className="login-error">{error}</div>}

                    <button
                        type="submit"
                        className={`btn-login ${isSubmitting ? 'submitting' : ''}`}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Authenticating...' : 'Establish Secure Session'}
                    </button>
                </form>

                <div className="login-footer">
                    <p>© 2026 Bank Governance Protocol v2.5</p>
                    <small>Restricted Access - Monitoring Enabled</small>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
