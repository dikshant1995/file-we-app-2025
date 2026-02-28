import React, { useState, useEffect } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { db } from '../../config/firebase';
import { collection, query, getDocs, doc, setDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { UserPlus, Trash2, Shield, Mail, Lock, User, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import './UserManager.css';

// This is required to create users without logging out the current CEO
// We use the same config but a different app name to isolate the auth instance
const firebaseConfig = {
    apiKey: "AIzaSyCRcHH37y5rLy34xSW1OdSy5MklnSnuO6o",
    authDomain: "laxmi-credit.firebaseapp.com",
    projectId: "laxmi-credit",
    storageBucket: "laxmi-credit.firebasestorage.app",
    messagingSenderId: "439589007843",
    appId: "1:439589007843:web:63d32a89b258686144f0d6"
};

const secondaryApp = getApps().find(app => app.name === 'Secondary')
    || initializeApp(firebaseConfig, 'Secondary');
const secondaryAuth = getAuth(secondaryApp);

const UserManager = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Form State
    const [formData, setFormData] = useState({
        displayName: '',
        email: '',
        password: '',
        role: 'manager'
    });

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'users'));
            const querySnapshot = await getDocs(q);
            const userList = [];
            querySnapshot.forEach((doc) => {
                userList.push({ id: doc.id, ...doc.data() });
            });
            setUsers(userList);
        } catch (error) {
            console.error("Error fetching users:", error);
            setMessage({ type: 'error', text: 'Failed to synchronize neural user records.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        setMessage({ type: '', text: '' });

        try {
            // 1. Create content in secondary auth instance
            const userCredential = await createUserWithEmailAndPassword(secondaryAuth, formData.email, formData.password);
            const newUser = userCredential.user;

            // 2. Create profile in primary firestore
            const profileData = {
                uid: newUser.uid,
                email: formData.email,
                displayName: formData.displayName,
                role: formData.role,
                createdAt: Timestamp.now(),
                status: 'active'
            };

            await setDoc(doc(db, 'users', newUser.uid), profileData);

            // 3. Cleanup secondary instance (logout the newly created user from secondary instance)
            await secondaryAuth.signOut();

            setMessage({ type: 'success', text: `Access Authorized: ${formData.displayName} is now active.` });
            setFormData({ displayName: '', email: '', password: '', role: 'employee' });
            fetchUsers();
        } catch (error) {
            console.error("Error creating user:", error);
            setMessage({ type: 'error', text: error.message.includes('email-already-in-use') ? 'This email is already authorized in the system.' : 'Authorization Failed: ' + error.message });
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteUser = async (uid, name) => {
        if (!window.confirm(`Are you sure you want to REVOKE access for ${name}? This action is permanent.`)) return;

        setActionLoading(true);
        try {
            await deleteDoc(doc(db, 'users', uid));
            // Note: Firebase Client SDK doesn't allow deleting AUTH users easily for security.
            // We delete the Firestore profile which effectively blocks their dashboard access 
            // because our app requires a Firestore profile to function.

            setMessage({ type: 'success', text: `Access Revoked for ${name}.` });
            fetchUsers();
        } catch (error) {
            console.error("Error deleting user:", error);
            setMessage({ type: 'error', text: 'De-authorization failed.' });
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="user-manager-container">
            <div className="um-header">
                <div>
                    <h1>Nexus Control: User Authorization</h1>
                    <p>Manage enterprise-level access protocols and departmental roles.</p>
                </div>
                <button className="btn-refresh" onClick={fetchUsers} disabled={loading}>
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            <div className="um-grid">
                {/* Create User Section */}
                <div className="glass-panel um-form-section">
                    <div className="section-title">
                        <UserPlus size={20} color="#00ff88" />
                        <h3>Authorize New Identity</h3>
                    </div>

                    <form onSubmit={handleCreateUser} className="um-form">
                        <div className="um-input-group">
                            <label><User size={14} /> Full Name</label>
                            <input
                                type="text"
                                value={formData.displayName}
                                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                placeholder="Employee or Manager Name"
                                required
                            />
                        </div>

                        <div className="um-input-group">
                            <label><Mail size={14} /> Corporate Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="name@laxmicredit.com"
                                required
                            />
                        </div>

                        <div className="um-input-group">
                            <label><Lock size={14} /> Temporary Access Key</label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="Min 8 characters"
                                minLength={8}
                                required
                            />
                        </div>

                        <div className="um-input-group">
                            <label><Shield size={14} /> Assigned Role</label>
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                className="um-select"
                            >
                                <option value="manager" className="opt-dark">System Manager (Full Policy Access)</option>
                                <option value="employee" className="opt-dark">Field Agent (Employee - Leads Only)</option>
                            </select>
                        </div>

                        {message.text && (
                            <div className={`um-status-message ${message.type}`}>
                                {message.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
                                <span>{message.text}</span>
                            </div>
                        )}

                        <button type="submit" className="btn-authorize" disabled={actionLoading}>
                            {actionLoading ? "Syncing Neural Data..." : "ACTIVATE IDENTITY"}
                        </button>
                    </form>
                </div>

                {/* User List Section */}
                <div className="glass-panel um-list-section">
                    <div className="section-title">
                        <Shield size={20} color="#00ff88" />
                        <h3>Authorized Personnel</h3>
                    </div>

                    <div className="um-table-container">
                        <table className="um-table">
                            <thead>
                                <tr>
                                    <th>Identity</th>
                                    <th>Department/Role</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="4" className="td-loading">Scanning networks...</td></tr>
                                ) : users.map(u => (
                                    <tr key={u.uid}>
                                        <td>
                                            <div className="td-name">{u.displayName}</div>
                                            <div className="td-email">{u.email}</div>
                                        </td>
                                        <td>
                                            <span className={`role-badge ${u.role}`}>
                                                {u.role?.toUpperCase()}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="status-indicator"></span>
                                            Active
                                        </td>
                                        <td>
                                            {u.role !== 'ceo' && (
                                                <button
                                                    className="btn-revoke"
                                                    title="Revoke Access"
                                                    onClick={() => handleDeleteUser(u.uid, u.displayName)}
                                                    disabled={actionLoading}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                            {u.role === 'ceo' && <Lock size={16} color="rgba(255,255,255,0.2)" />}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserManager;
