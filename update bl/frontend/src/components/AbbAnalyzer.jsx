import React, { useState, useRef } from 'react';
import { Building2, Upload, FileText, Lock, Plus, Trash2, Calendar, FileDown, Download, AlertCircle, FileBarChart, Loader, UploadCloud, Eye, EyeOff, Landmark, Activity, X, Target } from 'lucide-react';
import { generatePdfFromElement } from '../utils/pdfGenerator';
import FinancialReportTemplate from './FinancialReportTemplate';

const AccountBucket = ({ bucket, index, onUpdate, onRemove, isOnly }) => {
    const [dragActive, setDragActive] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const fileInputRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(e.type === "dragenter" || e.type === "dragover");
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files?.length) {
            const newFiles = Array.from(e.dataTransfer.files);
            onUpdate(index, { files: [...bucket.files, ...newFiles] });
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files?.length) {
            const newFiles = Array.from(e.target.files);
            onUpdate(index, { files: [...bucket.files, ...newFiles] });
        }
    };

    const removeFile = (fileIdx) => {
        const updatedFiles = bucket.files.filter((_, i) => i !== fileIdx);
        onUpdate(index, { files: updatedFiles });
    };

    return (
        <div className="glass-card mb-6 border-l-4 border-primary relative animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
            {!isOnly && (
                <button 
                    onClick={() => onRemove(index)}
                    className="absolute top-4 right-4 text-muted hover:text-danger transition-colors"
                    title="Remove this account"
                >
                    <X size={20} />
                </button>
            )}

            <div className="flex items-center gap-3 mb-6">
                <div className="icon-circle" style={{ margin: 0, width: 32, height: 32, background: 'var(--primary-glow)' }}>
                    <Landmark size={18} className="text-primary" />
                </div>
                <h4 className="m-0 uppercase tracking-tighter font-bold text-sm">Account Partition #{index + 1}</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Password Section */}
                <div className="form-group mb-0">
                    <label className="label text-xs uppercase opacity-70">Partition Password</label>
                    <div className="relative" style={{ position: 'relative' }}>
                        <input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="If statements are encrypted" 
                            value={bucket.password} 
                            onChange={e => onUpdate(index, { password: e.target.value })}
                            className="input-field"
                            style={{ paddingRight: '2.5rem' }}
                            autoComplete="new-password"
                            name={`partition_pwd_${index}`}
                        />
                        <button 
                            type="button" 
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                    
                    <label className="label text-xs uppercase opacity-70 mt-4">Bank Override</label>
                    <select 
                        value={bucket.bank_name || ''} 
                        onChange={e => onUpdate(index, { bank_name: e.target.value })}
                        className="select-field"
                        style={{ padding: '0.6rem 1rem', fontSize: '13px' }}
                    >
                        <option value="">Auto-Detect Bank</option>
                        <option value="ICICI">ICICI Bank</option>
                        <option value="HDFC">HDFC Bank</option>
                        <option value="SBI">SBI Bank</option>
                        <option value="AXIS">Axis Bank</option>
                        <option value="KOTAK">Kotak Mahindra</option>
                        <option value="IDFC">IDFC First Bank</option>
                        <option value="INDUSIND">IndusInd Bank</option>
                        <option value="AU">AU Small Finance</option>
                        <option value="IDBI">IDBI Bank</option>
                        <option value="BOB">Bank of Baroda (BOB)</option>
                        <option value="BOI">Bank of India (BOI)</option>
                        <option value="CENTRAL">Central Bank of India</option>
                        <option value="CANARA">Canara Bank</option>
                        <option value="BOM">Bank of Maharashtra</option>
                        <option value="UCO">UCO Bank</option>
                        <option value="CUB">City Union Bank</option>
                    </select>
                </div>

                {/* Dropzone Section */}
                <div className="md:col-span-2">
                    <div 
                        className={`file-dropzone compact ${dragActive ? 'drag-active' : ''}`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current.click()}
                        style={{ minHeight: '120px', padding: '1rem' }}
                    >
                        <input 
                            ref={fileInputRef}
                            type="file" 
                            multiple 
                            hidden 
                            onChange={handleFileChange} 
                            accept="application/pdf"
                        />
                        
                        {bucket.files.length > 0 ? (
                            <div className="w-full text-left">
                                <div className="flex justify-between items-center mb-2 px-1">
                                    <span className="text-xs font-bold text-primary uppercase">{bucket.files.length} File(s) in this Bucket</span>
                                    <span className="text-[10px] text-muted">Click to add more</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {bucket.files.map((file, fIdx) => (
                                        <div key={fIdx} className="flex items-center gap-2 bg-white/5 border border-white/10 px-2 py-1 rounded text-[11px] max-w-full">
                                            <span className="truncate" style={{ maxWidth: '150px' }}>{file.name}</span>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); removeFile(fIdx); }}
                                                className="text-muted hover:text-danger"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2">
                                <UploadCloud size={24} className="text-muted" />
                                <span className="text-xs text-muted text-center font-medium">Drop SBI/HDFC etc. PDFs here<br/>(Multiple parts supported)</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const AbbAnalyzer = ({ 
    bankAccounts, setBankAccounts, loading, error, results, abbData, proprietorName, 
    sisterFirms, accountType, sanctionedLimit, handleProcess, 
    setProprietorName, setSisterFirms, setAccountType, 
    setSanctionedLimit, downloadExcel 
}) => {
    const [isGeneratingPdf, setIsGeneratingPdf] = React.useState(false);

    const handlePdfDownload = async () => {
        setIsGeneratingPdf(true);
        try {
            await generatePdfFromElement('pdf-report-container', `Financial_Report_${proprietorName || 'Applicant'}.pdf`);
        } catch (error) {
            console.error(error);
        } finally {
            setIsGeneratingPdf(false);
        }
    };
    
    const addAccount = () => {
        setBankAccounts([...bankAccounts, { id: Date.now(), files: [], password: '', bank_name: '' }]);
    };

    const removeAccount = (index) => {
        const updated = bankAccounts.filter((_, i) => i !== index);
        setBankAccounts(updated);
    };

    const updateAccount = (index, updates) => {
        const updated = [...bankAccounts];
        updated[index] = { ...updated[index], ...updates };
        setBankAccounts(updated);
    };

    return (
        <div className="animate-fade-in">
            {!results ? (
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <div className="glass-card mb-8">
                        <h3 className="mb-6 flex items-center gap-3">
                            <Target size={24} className="text-primary" /> Global Configuration
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="form-group mb-0">
                                <label className="label">Proprietor Name</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. John Doe" 
                                    value={proprietorName} 
                                    onChange={e => setProprietorName(e.target.value)}
                                    className="input-field"
                                />
                            </div>
                            <div className="form-group mb-0">
                                <label className="label">Sister / Family Firms</label>
                                <input 
                                    type="text" 
                                    placeholder="Comma separated list" 
                                    value={sisterFirms} 
                                    onChange={e => setSisterFirms(e.target.value)}
                                    className="input-field"
                                    autoComplete="off"
                                    name="sister_firms_input_no_autofill"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-group mb-0">
                                <label className="label">Primary Account Type</label>
                                <select 
                                    value={accountType} 
                                    onChange={e => setAccountType(e.target.value)}
                                    className="select-field"
                                >
                                    <option value="savings">Current / Savings Account</option>
                                    <option value="limit">Limit / Cash Credit (CC) Account</option>
                                </select>
                            </div>

                            {accountType === 'limit' && (
                                <div className="form-group mb-0">
                                    <label className="label">Sanctioned Limit (₹)</label>
                                    <input 
                                        type="number" 
                                        placeholder="e.g. 500000" 
                                        value={sanctionedLimit} 
                                        onChange={e => setSanctionedLimit(e.target.value)}
                                        className="input-field"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Dynamic Account Buckets */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-4 px-1">
                            <h3 className="m-0 flex items-center gap-3">
                                <Landmark size={24} className="text-primary" /> Bank Account Partitions
                            </h3>
                            <button 
                                onClick={addAccount}
                                className="btn btn-ghost compact flex items-center gap-2 text-primary border-primary/20 hover:bg-primary/10"
                                style={{ borderRadius: '20px', padding: '0.4rem 1.2rem' }}
                            >
                                <Plus size={16} /> Add Another Account
                            </button>
                        </div>

                        {bankAccounts.map((bucket, idx) => (
                            <AccountBucket 
                                key={bucket.id}
                                bucket={bucket}
                                index={idx}
                                isOnly={bankAccounts.length === 1}
                                onUpdate={updateAccount}
                                onRemove={removeAccount}
                            />
                        ))}
                    </div>

                    <button 
                        className="btn btn-primary w-full py-6 flex items-center justify-center gap-3 text-lg font-bold shadow-lg shadow-primary/20" 
                        onClick={handleProcess} 
                        disabled={loading}
                        style={{ height: 'auto', borderRadius: '16px' }}
                    >
                        {loading ? <Loader className="animate-spin" /> : (
                            <>
                                <Activity size={24} /> Commence Consolidated Analysis
                            </>
                        )}
                    </button>

                    {error && <div className="text-danger mt-6 flex items-center justify-center gap-2 p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                        <AlertCircle size={20} /> <span className="font-medium">{error}</span>
                    </div>}
                </div>
            ) : (
                <div className="animate-fade-in">
                    {/* Results Section remains identical in logic but can be polished */}
                    <div className="glass-card mb-8">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="gradient-text">Institutional ABB Report</h2>
                            {!abbData.error && (
                                <div className="flex gap-2">
                                    <button 
                                        className="btn btn-primary" 
                                        onClick={handlePdfDownload} 
                                        disabled={isGeneratingPdf}
                                        style={{ background: 'var(--primary)', border: 'none' }}
                                    >
                                        <FileBarChart size={18} /> {isGeneratingPdf ? 'Generating...' : 'PDF Report'}
                                    </button>
                                    <button className="btn btn-primary" onClick={() => downloadExcel(results, abbData, proprietorName, sisterFirms)} style={{ background: 'var(--success)', border: 'none' }}>
                                        <Download size={18} /> Excel Report
                                    </button>
                                </div>
                            )}
                        </div>

                        {abbData.error ? (
                            <div className="text-danger flex flex-col items-center justify-center p-8 bg-red-500/10 rounded-lg border border-red-500/20">
                                <AlertCircle size={48} className="mb-4" />
                                <h3 className="font-bold text-xl mb-2">Analysis Failed</h3>
                                <p className="text-center">{abbData.error}</p>
                            </div>
                        ) : (
                            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
                                {abbData.comparisons.map((item, i) => (
                                <div key={i} className="elevated-card" style={{ animationDelay: `${i * 0.1}s` }}>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="icon-circle" style={{ margin: 0, width: 40, height: 40 }}>
                                            <Building2 size={20} />
                                        </div>
                                        <h3 className="text-primary">{item.name}</h3>
                                    </div>
                                    <div className="flex flex-col gap-4">
                                        {item.calculations.map((calc, j) => (
                                            <div key={j} className="p-4 rounded-lg bg-deep border-l-4 border-primary">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="badge badge-success" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', borderColor: 'var(--primary-glow)' }}>
                                                        {calc.timeframe} Days
                                                    </span>
                                                    <span className="text-xl font-bold">₹{calc.abb.toLocaleString()}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-muted">
                                                    <Calendar size={12} />
                                                    <span>Dates: {Array.isArray(calc.dates) ? calc.dates.join(', ') : calc.dates}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        )}
                    </div>
                </div>
            )}
            
            {/* Hidden template for PDF generation */}
            {!abbData?.error && results && (
                <FinancialReportTemplate 
                    results={results} 
                    abbData={abbData} 
                    proprietorName={proprietorName} 
                    sisterFirms={sisterFirms} 
                    accountType={accountType} 
                />
            )}
        </div>
    );
};

export default AbbAnalyzer;
