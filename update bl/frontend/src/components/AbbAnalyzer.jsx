import React from 'react';
import { Loader, UploadCloud, Download, AlertCircle, Building2, Calendar, Target, FileText, X, TrendingUp, PieChart, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { generateMonthlySummary } from '../utils/abbCalculator';

const AbbAnalyzer = ({ 
    files, removeFile, dragActive, loading, error, results, abbData, proprietorName, 
    sisterFirms, pdfPassword, accountType, sanctionedLimit, 
    handleDrag, handleDrop, handleChange, handleProcess, 
    setProprietorName, setPdfPassword, setSisterFirms, setAccountType, 
    setSanctionedLimit, fileInputRef, downloadExcel 
}) => {
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
                                    autoComplete="new-password"
                                    data-lpignore="true"
                                />
                            </div>
                            <div className="form-group mb-0">
                                <label className="label">PDF Password</label>
                                <input 
                                    type="password" 
                                    placeholder="If encrypted" 
                                    value={pdfPassword} 
                                    onChange={e => setPdfPassword(e.target.value)}
                                    className="input-field"
                                    autoComplete="new-password"
                                    data-lpignore="true"
                                />
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
                        <h2 className="mb-2">{files?.length > 0 ? `Loaded ${files.length} Document(s)` : "Multi-Statement Vault"}</h2>
                        <p className="text-secondary mb-6">Drag & drop multiple PDF bank statements</p>
                        
                        {files?.length > 0 && (
                            <div className="w-full flex flex-col gap-2 mb-6" style={{ maxHeight: '150px', overflowY: 'auto', padding: '0 10px' }}>
                                {files.map((f, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-deep border border-glow p-3 rounded-lg text-sm">
                                        <div className="flex items-center gap-3 truncate">
                                            <FileText size={16} className="text-primary" />
                                            <span className="truncate text-primary-glow">{f.name}</span>
                                        </div>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                                            className="hover:text-red-400 transition-colors"
                                            style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer' }}
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <input 
                            ref={fileInputRef}
                            type="file" 
                            className="hidden" 
                            style={{ display: 'none' }}
                            accept="application/pdf"
                            multiple
                            onChange={handleChange}
                        />
                        
                        <div className="flex gap-4 w-full">
                            <button 
                                type="button" 
                                className="btn btn-ghost flex-1" 
                                onClick={() => fileInputRef.current.click()}
                            >
                                {files?.length > 0 ? 'Add More' : 'Browse Files'}
                            </button>
                            
                            {files?.length > 0 && (
                                <button 
                                    className="btn btn-primary flex-1" 
                                    onClick={handleProcess} 
                                    disabled={loading}
                                >
                                    {loading ? <Loader className="animate-spin mx-auto" /> : 'Commence Aggregate Scan'}
                                </button>
                            )}
                        </div>

                        {error && <div className="text-danger mt-4 flex items-center justify-center gap-2">
                            <AlertCircle size={16} /> {error}
                        </div>}
                    </div>
                </div>
            ) : (
                <div className="animate-fade-in">
                    <div className="glass-card mb-8">
                        <div className="flex flex-wrap gap-4 justify-between items-center mb-8">
                            <h2 className="gradient-text flex items-center gap-2">
                                <Activity size={24} /> Institutional ABB Report
                            </h2>
                            <div className="flex gap-2">
                                <button className="btn btn-primary" onClick={() => downloadExcel(results, abbData)} style={{ background: 'var(--success)', border: 'none' }}>
                                    <Download size={18} /> Full Excel Report
                                </button>
                            </div>
                        </div>

                        {/* 📊 ADVANCED GRAPHICAL ANALYTICS WIDGETS */}
                        {(() => {
                            const summary = generateMonthlySummary(results.dataset_3, abbData);
                            const grandTotal = summary.find(r => r.Month === "GRAND TOTAL") || {};
                            const netBto = parseFloat(grandTotal["Net BTO (Excl. Cash) (₹)"] || 0);
                            const cashDep = parseFloat(grandTotal["Total Cash Deposit (₹)"] || 0);
                            const totalCr = parseFloat(grandTotal["Total BTO (₹)"] || 1);
                            const digitalRatio = totalCr > 0 ? Math.min(100, (netBto / totalCr) * 100) : 0;
                            const bounceRatio = parseFloat(grandTotal["Inward Outward Chq Bounce Ratio"]?.replace('%', '') || 0);

                            return (
                                <div className="grid lg-grid-cols-3 md-grid-cols-2 gap-4 mb-8">
                                    {/* 🟢 DIGITAL PENETRATION GAUGE */}
                                    <div className="chart-card flex flex-col items-center justify-center text-center p-6 bg-deep/40 border border-glow/30">
                                        <h4 className="text-xs text-secondary uppercase tracking-widest mb-4">Digital BTO Intensity</h4>
                                        <div className="gauge-svg-container" style={{ width: '120px', height: '120px' }}>
                                            <svg viewBox="0 0 100 100" className="w-full h-full">
                                                <circle className="gauge-bg" cx="50" cy="50" r="40" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                                                <motion.circle 
                                                    cx="50" cy="50" r="40" fill="transparent" 
                                                    stroke="var(--primary)" strokeWidth="8" strokeLinecap="round"
                                                    strokeDasharray="251.2"
                                                    initial={{ strokeDashoffset: 251.2 }}
                                                    animate={{ strokeDashoffset: 251.2 - (251.2 * (digitalRatio / 100)) }}
                                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                                    style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ top: '30%' }}>
                                                <span className="text-2xl font-bold text-white">{Math.round(digitalRatio)}%</span>
                                                <span className="text-[8px] uppercase text-primary">Digital</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 🔴 HEALTH / BOUNCE MATRIX */}
                                    <div className="chart-card p-6 bg-deep/40 border border-glow/30 flex flex-col justify-between">
                                        <div>
                                            <h4 className="text-xs text-secondary uppercase tracking-widest mb-2">Health Parameters</h4>
                                            <p className="text-sm text-white flex justify-between border-b border-white/5 py-2">
                                                <span>Total Bounce Ratio</span>
                                                <span className={`font-bold ${bounceRatio > 3 ? 'text-red-400' : 'text-emerald-400'}`}>{bounceRatio.toFixed(2)}%</span>
                                            </p>
                                            <p className="text-sm text-white flex justify-between border-b border-white/5 py-2">
                                                <span>History Span</span>
                                                <span className="text-primary font-bold">{abbData.historySpanInDays} Days</span>
                                            </p>
                                        </div>
                                        <div className="mt-4">
                                            <div className={`text-center py-2 rounded-md text-xs font-bold ${bounceRatio < 5 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                                                {bounceRatio < 5 ? "OPTIMAL LIQUIDITY" : "CRITICAL OVERLEVERAGE"}
                                            </div>
                                        </div>
                                    </div>

                                    {/* 🔵 BTO COMPOSITION BARS */}
                                    <div className="chart-card p-6 bg-deep/40 border border-glow/30 col-span-full lg:col-span-1">
                                        <h4 className="text-xs text-secondary uppercase tracking-widest mb-4">Composition Matrix (BTO)</h4>
                                        <div className="flex flex-col gap-3">
                                            <div>
                                                <div className="flex justify-between text-[10px] text-muted mb-1">
                                                    <span>NET DIGITAL CR</span>
                                                    <span>₹{netBto.toLocaleString()}</span>
                                                </div>
                                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                                    <motion.div 
                                                        initial={{ width: 0 }} animate={{ width: `${(netBto/totalCr)*100}%` }}
                                                        transition={{ duration: 1, delay: 0.2 }}
                                                        className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex justify-between text-[10px] text-muted mb-1">
                                                    <span>PHYSICAL CASH</span>
                                                    <span>₹{cashDep.toLocaleString()}</span>
                                                </div>
                                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                                    <motion.div 
                                                        initial={{ width: 0 }} animate={{ width: `${(cashDep/totalCr)*100}%` }}
                                                        transition={{ duration: 1, delay: 0.4 }}
                                                        className="h-full bg-warning/70"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        <div className="w-full border-t border-white/5 my-6 pt-4">
                            <h4 className="text-sm font-semibold text-primary/80 mb-4 flex items-center gap-2">
                                <TrendingUp size={16} /> NBFC Institutional Benchmarks
                            </h4>
                        </div>

                        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
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
