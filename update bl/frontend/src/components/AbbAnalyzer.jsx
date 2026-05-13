import React, { useState } from 'react';
import { Loader, UploadCloud, Download, AlertCircle, Building2, Calendar, Target, X, Eye, EyeOff } from 'lucide-react';

const AbbAnalyzer = ({ 
    files, setFiles, dragActive, loading, error, results, abbData, proprietorName, 
    sisterFirms, pdfPassword, accountType, sanctionedLimit, 
    handleDrag, handleDrop, handleChange, handleProcess, 
    setProprietorName, setPdfPassword, setSisterFirms, setAccountType, 
    setSanctionedLimit, fileInputRef, downloadExcel 
}) => {
    const [showPassword, setShowPassword] = useState(false);
    return (
        <div className="animate-fade-in">
            {!results ? (
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <div className="glass-card mb-8">
                        <h3 className="mb-6 flex items-center gap-3">
                            <Target size={24} className="text-primary" /> Extraction & Target Config
                        </h3>
                        
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="form-group mb-0">
                                <label className="label">Proprietor Name</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. John Doe" 
                                    value={proprietorName} 
                                    onChange={e => setProprietorName(e.target.value)}
                                    className="input-field"
                                    autoComplete="off"
                                />
                            </div>
                            <div className="form-group mb-0">
                                <label className="label">PDF Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        placeholder="If encrypted" 
                                        value={pdfPassword} 
                                        onChange={e => setPdfPassword(e.target.value)}
                                        className="input-field"
                                        autoComplete="new-password"
                                        style={{ paddingRight: '3rem' }}
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{ 
                                            position: 'absolute', 
                                            right: '1rem', 
                                            top: '50%', 
                                            transform: 'translateY(-50%)',
                                            border: 'none',
                                            background: 'transparent',
                                            color: 'var(--text-muted)',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}
                                        className="hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="form-group mb-6">
                            <label className="label">Sister / Family Firms</label>
                            <input 
                                type="text" 
                                placeholder="Comma separated list" 
                                value={sisterFirms} 
                                onChange={e => setSisterFirms(e.target.value)}
                                className="input-field"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="form-group mb-0">
                                <label className="label">Account Type</label>
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

                    <div 
                        className={`file-dropzone ${dragActive ? 'drag-active' : ''}`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <div className="icon-circle">
                            <UploadCloud size={32} strokeWidth={1.5} />
                        </div>
                        
                        <div className="flex flex-col items-center w-full mb-4">
                            {files && files.length > 0 ? (
                                <div className="w-full px-4">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="m-0 text-sm uppercase tracking-wider text-primary">{files.length} Statement(s) Selected</h4>
                                        <button 
                                            type="button" 
                                            onClick={(e) => { e.stopPropagation(); setFiles([]); fileInputRef.current.value = ''; }}
                                            className="text-xs text-danger hover:underline"
                                            style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
                                        >
                                            Clear All
                                        </button>
                                    </div>
                                    <div style={{ maxHeight: '120px', overflowY: 'auto', textAlign: 'left' }} className="w-full custom-scrollbar mb-4 bg-white/5 p-3 rounded-lg border border-white/10">
                                        {files.map((f, idx) => (
                                            <div key={idx} className="flex justify-between items-center text-sm mb-2 pb-2 border-b border-white/5 last:border-0 last:mb-0 last:pb-0">
                                                <span className="truncate font-medium" title={f.name} style={{ maxWidth: '85%' }}>
                                                    📁 {f.name} <span style={{ opacity: 0.5, fontSize: '0.75rem' }}>({(f.size / 1024).toFixed(0)} KB)</span>
                                                </span>
                                                <button 
                                                    type="button" 
                                                    onClick={(e) => { 
                                                        e.stopPropagation(); 
                                                        const updated = files.filter((_, i) => i !== idx);
                                                        setFiles(updated);
                                                        if (updated.length === 0) fileInputRef.current.value = '';
                                                    }}
                                                    className="text-muted hover:text-danger transition-colors"
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <h2 className="m-0 mb-1">Ready for Analysis</h2>
                            )}
                        </div>
                        
                        <p className="text-secondary mb-6 text-center">Drop your PDF bank statements here (supports multiple files) or browse</p>
                        
                        <input 
                            ref={fileInputRef}
                            type="file" 
                            multiple
                            className="hidden" 
                            style={{ display: 'none' }}
                            accept="application/pdf"
                            onChange={handleChange}
                        />
                        
                        {files && files.length > 0 ? (
                            <div className="flex gap-4 w-full">
                                <button className="btn btn-ghost flex-1" onClick={() => fileInputRef.current.click()}>Add More</button>
                                <button className="btn btn-primary flex-1" onClick={handleProcess} disabled={loading}>
                                    {loading ? <Loader className="animate-spin" /> : `Analyze ${files.length} Statement(s)`}
                                </button>
                            </div>
                        ) : (
                            <button className="btn btn-ghost" onClick={() => fileInputRef.current.click()}>Browse Files</button>
                        )}
                        {error && <div className="text-danger mt-4 flex items-center justify-center gap-2">
                            <AlertCircle size={16} /> {error}
                        </div>}
                    </div>
                </div>
            ) : (
                <div className="animate-fade-in">
                    <div className="glass-card mb-8">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="gradient-text">Institutional ABB Report</h2>
                            <button className="btn btn-primary" onClick={() => downloadExcel(results, abbData)} style={{ background: 'var(--success)', border: 'none' }}>
                                <Download size={18} /> Excel Report
                            </button>
                        </div>

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
                    </div>
                </div>
            )}
        </div>
    );
};

export default AbbAnalyzer;
