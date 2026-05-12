import React, { useState } from 'react';
import axios from 'axios';
import { Activity, ShieldCheck } from 'lucide-react';

const calculateEMI = (principal, annualInterestRate, tenureInYears) => {
    const monthlyInterestRate = annualInterestRate / 12 / 100;
    const numberOfMonths = tenureInYears * 12;

    if (monthlyInterestRate === 0) {
        return principal / numberOfMonths;
    }

    const emi = principal * monthlyInterestRate *
        (Math.pow(1 + monthlyInterestRate, numberOfMonths)) /
        (Math.pow(1 + monthlyInterestRate, numberOfMonths) - 1);

    return Math.round(emi);
};

const EligibilityChecker = () => {
    const [formData, setFormData] = useState({
        loan_amount: 1000000,
        gst_vintage: 3,
        itr_vintage: 2,
        residence_type: 'OWNED',
        office_type: 'OWNED',
        pincode: '342001',
        pdf_password: '',
        num_active_loans: 0,
        total_active_emi: 0,
        num_active_business_loans: 0,
        total_business_loan_emi: 0
    });
    const [file, setFile] = useState(null);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);

    // Interactive EMI Calculator State
    const [calcAmount, setCalcAmount] = useState(1500000);
    const [calcRoi, setCalcRoi] = useState(17.5);
    const [calcTenure, setCalcTenure] = useState(3);

    const calculatedEMIValue = calculateEMI(calcAmount, calcRoi, calcTenure);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const data = new FormData();
        data.append('file', file);
        Object.keys(formData).forEach(key => {
            if (key === 'pdf_password') {
                if (formData[key]) data.append('password', formData[key]);
            } else {
                data.append(key, formData[key]);
            }
        });

        try {
            const apiBase = import.meta.env.VITE_API_URL || (window.location.origin.includes('localhost') ? 'http://localhost:8000' : '/api-bl');
            const res = await axios.post(`${apiBase}/api/evaluate-eligibility`, data);
            setResults(res.data.results);
        } catch (err) {
            alert("Error evaluating eligibility");
        }
        setLoading(false);
    };

    return (
        <div className="animate-fade-in">
            <header className="mb-8 text-center">
                <h1 className="gradient-text mb-4">Business Loan Eligibility Check</h1>
                <p className="text-secondary">Verify lender compatibility with our smart evaluation engine.</p>
            </header>
            
            <div className="grid lg-grid-cols-2 gap-8">
                {/* Form Side */}
                <div className="glass-card">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        <div className="form-group">
                            <label className="label">Loan Amount Required (₹)</label>
                            <input 
                                type="number" 
                                value={formData.loan_amount}
                                onChange={(e) => setFormData({...formData, loan_amount: e.target.value})}
                                className="input-field"
                                placeholder="Enter amount"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="form-group">
                                <label className="label">GST Vintage (Years)</label>
                                <input 
                                    type="number" 
                                    value={formData.gst_vintage}
                                    onChange={(e) => setFormData({...formData, gst_vintage: e.target.value})}
                                    className="input-field"
                                />
                            </div>
                            <div className="form-group">
                                <label className="label">ITR Vintage (Years)</label>
                                <input 
                                    type="number" 
                                    value={formData.itr_vintage}
                                    onChange={(e) => setFormData({...formData, itr_vintage: e.target.value})}
                                    className="input-field"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="form-group">
                                <label className="label">Residence Type</label>
                                <select 
                                    value={formData.residence_type}
                                    onChange={(e) => setFormData({...formData, residence_type: e.target.value})}
                                    className="select-field"
                                >
                                    <option value="OWNED">Owned</option>
                                    <option value="RENTED">Rented</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="label">Office Type</label>
                                <select 
                                    value={formData.office_type}
                                    onChange={(e) => setFormData({...formData, office_type: e.target.value})}
                                    className="select-field"
                                >
                                    <option value="OWNED">Owned</option>
                                    <option value="RENTED">Rented</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="form-group">
                                <label className="label">Account Type</label>
                                <select 
                                    value={formData.account_type || 'savings'}
                                    onChange={(e) => setFormData({...formData, account_type: e.target.value})}
                                    className="select-field"
                                >
                                    <option value="savings">Savings/Current</option>
                                    <option value="limit">CC/OD Limit</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="label">Sanctioned Limit (₹)</label>
                                <input 
                                    type="number" 
                                    disabled={formData.account_type !== 'limit'}
                                    value={formData.sanctioned_limit || 0}
                                    onChange={(e) => setFormData({...formData, sanctioned_limit: e.target.value})}
                                    className="input-field"
                                    placeholder="e.g. 500000"
                                />
                            </div>
                        </div>

                        <div className="border-t border-white/5 pt-4">
                            <h4 className="text-sm font-semibold text-primary mb-4">Live Loans & Obligations</h4>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="form-group">
                                    <label className="label">Total Active Loans</label>
                                    <input 
                                        type="number" 
                                        value={formData.num_active_loans}
                                        onChange={(e) => setFormData({...formData, num_active_loans: parseInt(e.target.value) || 0})}
                                        className="input-field"
                                        placeholder="e.g. 2"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="label">Total EMI (₹ / month)</label>
                                    <input 
                                        type="number" 
                                        value={formData.total_active_emi}
                                        onChange={(e) => setFormData({...formData, total_active_emi: parseFloat(e.target.value) || 0})}
                                        className="input-field"
                                        placeholder="e.g. 25000"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label className="label">Active Business Loans</label>
                                    <input 
                                        type="number" 
                                        value={formData.num_active_business_loans}
                                        onChange={(e) => setFormData({...formData, num_active_business_loans: parseInt(e.target.value) || 0})}
                                        className="input-field"
                                        placeholder="e.g. 1"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="label">Business Loan EMI (₹ / mo)</label>
                                    <input 
                                        type="number" 
                                        value={formData.total_business_loan_emi}
                                        onChange={(e) => setFormData({...formData, total_business_loan_emi: parseFloat(e.target.value) || 0})}
                                        className="input-field"
                                        placeholder="e.g. 15000"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="label">PDF Password (Optional)</label>
                            <input 
                                type="password" 
                                value={formData.pdf_password}
                                onChange={(e) => setFormData({...formData, pdf_password: e.target.value})}
                                className="input-field"
                                placeholder="If statement is encrypted"
                            />
                        </div>
                        <div className="form-group">
                            <label className="label">Upload Bank Statement (PDF)</label>
                            <div className="file-dropzone" onClick={() => document.getElementById('file-upload').click()}>
                                <div className="icon-circle">
                                    <Activity size={24} />
                                </div>
                                <p className="text-secondary">Click to upload or drag statement here</p>
                                <input 
                                    id="file-upload"
                                    type="file" 
                                    onChange={(e) => setFile(e.target.files[0])}
                                    className="hidden"
                                    style={{ display: 'none' }}
                                    required
                                />
                                {file && <p className="mt-4 text-primary font-bold">{file.name}</p>}
                            </div>
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="btn btn-primary"
                        >
                            {loading ? 'Evaluating...' : 'Check Eligibility'}
                        </button>
                    </form>
                </div>

                {/* Results Side */}
                <div className="flex flex-col gap-4">
                    <h2 className="mb-4 text-primary flex items-center gap-2">
                        <ShieldCheck size={24} /> Eligible Lenders
                    </h2>
                    {results ? (
                        results.map((r, i) => (
                            <div key={i} className={`elevated-card animate-fade-in`} style={{ animationDelay: `${i * 0.1}s` }}>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-primary">{r.lender_name}</h3>
                                    <span className={`badge ${r.status === 'ELIGIBLE' ? 'badge-success' : 'badge-danger'}`}>
                                        {r.status}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <div className="flex justify-between items-end border-b border-white/5 pb-2">
                                        <div>
                                            <p className="text-secondary text-sm">Max Loan Eligibility</p>
                                            <p className="text-3xl font-extrabold text-white">₹{r.max_loan_amount.toLocaleString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-muted uppercase">EMI Capacity</p>
                                            <p className="text-lg font-bold text-primary">₹{r.emi_capacity.toLocaleString()}/mo</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex justify-between items-center text-xs text-muted py-1">
                                        <span>ROI: {r.roi}% Fixed</span>
                                        <span>Tenure: 3 Years</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs text-muted py-1 border-b border-white/5 pb-2">
                                        <span>Calculated EMI: ₹{r.calculated_emi?.toLocaleString()}/mo</span>
                                        <span>ATO Ratio: {r.ato_ratio}%</span>
                                    </div>

                                    <p className="text-secondary text-sm mt-2">Calculated Custom ABB</p>
                                    <p className="text-xl font-bold">₹{r.custom_abb.toLocaleString()}</p>

                                    {r.deducted_emi > 0 && (
                                        <div className="mt-2 p-2 rounded bg-white/5 border border-white/5 flex justify-between text-xs">
                                            <span className="text-muted">Raw Capacity: ₹{r.raw_emi_capacity.toLocaleString()}</span>
                                            <span className="text-danger font-semibold">Deducted ({r.deducted_type}): -₹{r.deducted_emi.toLocaleString()}</span>
                                        </div>
                                    )}
                                    
                                    {r.deep_analytics && (
                                        <div className="grid grid-cols-2 gap-2 mt-2">
                                            <div className="bg-white/5 p-2 rounded">
                                                <p className="text-[10px] text-muted uppercase">Net BTO (Digital)</p>
                                                <p className="text-sm font-bold text-success">₹{r.deep_analytics.net_bto.toLocaleString()}</p>
                                                <p className="text-[10px] text-muted mt-1">Ratio: {r.deep_analytics.digital_ratio}</p>
                                            </div>
                                            <div className="bg-white/5 p-2 rounded">
                                                <p className="text-[10px] text-muted uppercase">Bounce Ratio</p>
                                                <p className={`text-sm font-bold ${parseFloat(r.deep_analytics.bounce_ratio) > 5 ? 'text-danger' : 'text-primary'}`}>
                                                    {r.deep_analytics.bounce_ratio}
                                                </p>
                                            </div>
                                            {r.deep_analytics.peak_utilisation !== 'N/A' && (
                                                <div className="bg-white/5 p-2 rounded col-span-2">
                                                    <p className="text-[10px] text-muted uppercase">Peak Limit Utilisation</p>
                                                    <p className="text-sm font-bold text-warning">{r.deep_analytics.peak_utilisation}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {r.reasons.length > 0 && (
                                        <div className="mt-2 p-3 bg-deep rounded-md border border-subtle">
                                            {r.reasons.map((reason, j) => (
                                                <p key={j} className="text-danger text-xs flex gap-2">
                                                    <span>•</span> {reason}
                                                </p>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="glass-card flex flex-col items-center justify-center p-12 text-center">
                            <Activity size={48} className="text-muted mb-4 opacity-20" />
                            <p className="text-muted italic">
                                Upload a statement and submit the form to see eligible lenders.
                            </p>
                        </div>
                    )}

                    {/* Interactive EMI Calculator Card */}
                    <div className="glass-card border border-primary/20 bg-primary/5 p-6 rounded-xl mt-4">
                        <h3 className="text-primary font-bold mb-4 flex items-center gap-2 text-lg">
                            <Activity size={22} className="text-primary animate-pulse" /> Interactive EMI Calculator (PL Standard)
                        </h3>
                        <div className="flex flex-col gap-4">
                            <div className="form-group">
                                <div className="flex justify-between text-xs mb-1 font-semibold text-white">
                                    <span>Loan Amount</span>
                                    <span>₹{calcAmount.toLocaleString()}</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="100000" 
                                    max="5000000" 
                                    step="50000"
                                    value={calcAmount} 
                                    onChange={(e) => setCalcAmount(parseInt(e.target.value))}
                                    className="w-full accent-primary h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="form-group">
                                    <div className="flex justify-between text-xs mb-1 font-semibold text-white">
                                        <span>ROI</span>
                                        <span>{calcRoi}%</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="10" 
                                        max="30" 
                                        step="0.25"
                                        value={calcRoi} 
                                        onChange={(e) => setCalcRoi(parseFloat(e.target.value))}
                                        className="w-full accent-primary h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>
                                <div className="form-group">
                                    <div className="flex justify-between text-xs mb-1 font-semibold text-white">
                                        <span>Tenure</span>
                                        <span>{calcTenure} Years</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="1" 
                                        max="5" 
                                        step="1"
                                        value={calcTenure} 
                                        onChange={(e) => setCalcTenure(parseInt(e.target.value))}
                                        className="w-full accent-primary h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>
                            </div>
                            <div className="mt-2 p-4 rounded bg-white/5 border border-white/5 text-center">
                                <p className="text-secondary text-xs uppercase tracking-wider">Estimated Monthly EMI</p>
                                <p className="text-4xl font-extrabold text-primary mt-1">₹{calculatedEMIValue.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default EligibilityChecker;
