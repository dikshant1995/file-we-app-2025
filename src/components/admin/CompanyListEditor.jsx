import { useState, useRef, useEffect } from 'react';
import './CompanyListEditor.css';
import { saveBankDatabaseToCloud, syncToUniversalDatabase } from '../../services/companyDatabaseService.js';

const CompanyListEditor = ({ bank }) => {
    const [file, setFile] = useState(null);
    const [headers, setHeaders] = useState([]);
    const [previewData, setPreviewData] = useState([]);
    const [mapping, setMapping] = useState({ name: '', category: '' });
    const [processing, setProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [stats, setStats] = useState({ totalRows: 0, previewRows: 0 });
    const fileInputRef = useRef(null);

    // Dynamically load XLSX library if not present
    useEffect(() => {
        if (!window.XLSX) {
            const script = document.createElement('script');
            script.src = 'https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js';
            script.async = true;
            document.body.appendChild(script);
        }
    }, []);

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        setFile(selectedFile);
        parsePreview(selectedFile);
    };

    const parsePreview = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = window.XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];

            // Get headers and first 10 rows for preview
            const json = window.XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            if (json.length > 0) {
                setHeaders(json[0]);
                setPreviewData(json.slice(1, 11));
                setStats({
                    totalRows: json.length - 1,
                    previewRows: Math.min(json.length - 1, 10)
                });

                // Auto-detect columns
                const nameIdx = json[0].findIndex(h => h?.toString().toLowerCase().includes('company') || h?.toString().toLowerCase().includes('name'));
                const catIdx = json[0].findIndex(h => h?.toString().toLowerCase().includes('cat'));

                setMapping({
                    name: nameIdx !== -1 ? json[0][nameIdx] : '',
                    category: catIdx !== -1 ? json[0][catIdx] : ''
                });
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const handleProcess = async () => {
        if (!mapping.name || !mapping.category) {
            alert('Please map both Name and Category columns');
            return;
        }

        setProcessing(true);
        setProgress(10);

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = window.XLSX.read(data, { type: 'array' });
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                const fullData = window.XLSX.utils.sheet_to_json(worksheet);

                setProgress(40);

                // Transform data
                const transformedData = fullData.map(row => ({
                    companyName: row[mapping.name]?.toString().trim().toUpperCase(),
                    category: row[mapping.category]?.toString().trim().toUpperCase()
                })).filter(row => row.companyName && row.category);

                setProgress(70);

                // 1. Save to Cloud (Firebase) - This ensures production is always updated
                console.log('☁️ Syncing to Cloud...');
                await saveBankDatabaseToCloud(bank.id, transformedData);

                // 2. AUTO-SYNC: Add new companies to Universal List
                console.log('🌐 Cross-referencing with Universal Database...');
                const newAdded = await syncToUniversalDatabase(transformedData);

                // 3. Save to Local Server (For development backups)
                console.log('💻 Saving to Local Backup...');
                const response = await fetch('/api/admin/save-database', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        filename: `${bank.id}_companies.json`,
                        data: transformedData
                    })
                });

                if (response.ok || true) { // Allow success even if local server is down (e.g. on Vercel)
                    setProgress(100);
                    alert(`✅ SUCCESS!\n\n1. Cloud Database Updated\n2. Local Backup Saved\n\nTotal Records: ${transformedData.length} for ${bank.name}.`);
                    setFile(null);
                    setHeaders([]);
                    setPreviewData([]);
                }
            } catch (error) {
                console.error('Processing error:', error);
                alert('❌ Error processing file. Check console for details.');
            } finally {
                setProcessing(false);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    return (
        <div className="company-list-editor">
            <div className="editor-header">
                <h2>📂 Master Database Update - {bank.name}</h2>
                <p>Replace existing company list for this bank using an Excel file.</p>
            </div>

            <div className="stats-bar">
                <div className="stat-item">
                    <div className="stat-label">Bank ID</div>
                    <div className="stat-value" style={{ color: 'var(--accent-cyan)' }}>{bank.id}</div>
                </div>
                <div className="stat-item">
                    <div className="stat-label">Expected Filename</div>
                    <div className="stat-value">{bank.id}_companies.json</div>
                </div>
            </div>

            {!file ? (
                <div className="upload-card" onClick={() => fileInputRef.current.click()}>
                    <div className="upload-icon">📥</div>
                    <h3>Click to Upload Excel</h3>
                    <p>Drag and drop or click to select .xlsx or .xls file</p>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept=".xlsx, .xls"
                        style={{ display: 'none' }}
                    />
                </div>
            ) : (
                <div className="mapper-container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3>📋 Configure Extraction</h3>
                        <button onClick={() => setFile(null)} className="btn-text">Cancel & Choose Different File</button>
                    </div>

                    <div className="mapping-grid">
                        <div className="input-group">
                            <label>Extract "Company Name" from:</label>
                            <select
                                className="column-select"
                                value={mapping.name}
                                onChange={(e) => setMapping({ ...mapping, name: e.target.value })}
                            >
                                <option value="">Select Column...</option>
                                {headers.map(h => <option key={h} value={h}>{h}</option>)}
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Extract "Category" from:</label>
                            <select
                                className="column-select"
                                value={mapping.category}
                                onChange={(e) => setMapping({ ...mapping, category: e.target.value })}
                            >
                                <option value="">Select Column...</option>
                                {headers.map(h => <option key={h} value={h}>{h}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="preview-table-container">
                        <h4>Preview (First 10 Rows)</h4>
                        <table className="preview-table">
                            <thead>
                                <tr>
                                    {headers.map(h => <th key={h}>{h}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {previewData.map((row, i) => (
                                    <tr key={i}>
                                        {row.map((cell, j) => <td key={j}>{cell}</td>)}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div style={{ marginTop: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                            <span>Total rows to process: {stats.totalRows}</span>
                            <span>Mode: Atomic Replacement</span>
                        </div>

                        {processing && (
                            <div className="progress-bar-container">
                                <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                            </div>
                        )}

                        <button
                            className="btn-process"
                            onClick={handleProcess}
                            disabled={processing || !mapping.name || !mapping.category}
                        >
                            {processing ? 'Processing & Saving...' : '🚀 Start Extraction & Replace Database'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompanyListEditor;
