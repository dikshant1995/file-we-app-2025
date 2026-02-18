const ImportExport = () => {
  return (
    <div className="import-export-container">
      <h2>📥 Import / Export Configurations</h2>
      <p>Backup and restore bank configurations</p>

      <div style={{display: 'grid', gap: '30px', marginTop: '30px'}}>
        <div style={{padding: '30px', background: '#f8f9fa', borderRadius: '12px'}}>
          <h3>📤 Export Configuration</h3>
          <p style={{color: '#7f8c8d', marginBottom: '20px'}}>Download all bank configurations as JSON</p>
          <button style={{padding: '15px 30px', background: '#667eea', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer'}}>
            Download All Configs
          </button>
        </div>

        <div style={{padding: '30px', background: '#f8f9fa', borderRadius: '12px'}}>
          <h3>📥 Import Configuration</h3>
          <p style={{color: '#7f8c8d', marginBottom: '20px'}}>Upload JSON file to restore configurations</p>
          <input type="file" accept=".json" style={{marginBottom: '15px'}} />
          <br />
          <button style={{padding: '15px 30px', background: '#11998e', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer'}}>
            Import Configs
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportExport;
