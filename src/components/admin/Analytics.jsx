import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import './Analytics.css';

const Analytics = () => {
  const [stats, setStats] = useState({
    total: 0,
    hasBanks: 0,
    noBanks: 0,
    topCompanies: []
  });

  useEffect(() => {
    try {
      const localLeads = JSON.parse(localStorage.getItem('laxmi_leads') || '[]');
      
      // Basic Analytics Calculations
      const count = localLeads.length;
      const hasSelected = localLeads.filter(l => l.selectedBanks && l.selectedBanks.length > 0).length;
      
      // Company frequency
      const companies = {};
      localLeads.forEach(l => {
        const c = l.company?.toUpperCase() || 'UNSPECIFIED';
        if (c !== 'UNSPECIFIED') companies[c] = (companies[c] || 0) + 1;
      });
      const sortedCompanies = Object.entries(companies)
        .sort((a,b) => b[1] - a[1])
        .slice(0, 5);

      setStats({
        total: count,
        hasBanks: hasSelected,
        noBanks: count - hasSelected,
        topCompanies: sortedCompanies
      });
    } catch (e) {
      console.error('Failed to compute analytics', e);
    }
  }, []);

  const conversionRate = stats.total > 0 ? Math.round((stats.hasBanks / stats.total) * 100) : 0;
  const dashOffset = (1 - (conversionRate / 100)) * 251.2;

  return (
    <div className="analytics-container animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, background: 'linear-gradient(to right, #00d4ff, #00ff88)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Strategic Intelligence Terminal
          </h2>
          <p style={{ opacity: 0.6, marginTop: '5px' }}>Real-time synchronization of localized lead metadata</p>
        </div>
      </div>

      <div className="analytics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div className="analytics-card glass-panel">
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>Captured Leads</span>
          <div className="big-number" style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', marginTop: '10px' }}>{stats.total}</div>
        </div>
        <div className="analytics-card glass-panel" style={{ borderLeft: '3px solid #00ff88' }}>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>Active Selects</span>
          <div className="big-number" style={{ fontSize: '2.5rem', fontWeight: 800, color: '#00ff88', marginTop: '10px' }}>{stats.hasBanks}</div>
        </div>
        <div className="analytics-card glass-panel">
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>Conversion Intensity</span>
          <div className="big-number" style={{ fontSize: '2.5rem', fontWeight: 800, color: '#00d4ff', marginTop: '10px' }}>{conversionRate}%</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '30px' }} className="responsive-analytics-layout">
        {/* Chart View */}
        <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h3 style={{ marginBottom: '30px', alignSelf: 'flex-start' }}>Pipeline Conversion Distribution</h3>
          
          <div style={{ position: 'relative', width: '200px', height: '200px' }}>
            <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
              <motion.circle 
                cx="50" cy="50" r="40" 
                fill="transparent" 
                stroke="url(#cyanGrad)" 
                strokeWidth="10"
                strokeLinecap="round"
                initial={{ strokeDasharray: "0, 251.2" }}
                animate={{ strokeDasharray: `${(conversionRate/100) * 251.2}, 251.2` }}
                transition={{ duration: 2, ease: "easeOut" }}
              />
              <defs>
                <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00d4ff" />
                  <stop offset="100%" stopColor="#00ff88" />
                </linearGradient>
              </defs>
            </svg>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{conversionRate}%</div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginTop: '5px', textTransform: 'uppercase' }}>Hit Rate</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px', marginTop: '30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#00ff88' }}></div>
              <span>Proceeded Leads ({stats.hasBanks})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
              <span>Abandoned ({stats.noBanks})</span>
            </div>
          </div>
        </div>

        {/* Side Top List */}
        <div className="glass-panel" style={{ padding: '30px' }}>
          <h3 style={{ marginBottom: '20px' }}>Volume Concentrations</h3>
          <p style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '20px' }}>Top Company Domains by Application Count</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {stats.topCompanies.length > 0 ? stats.topCompanies.map(([name, count], i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>🏢 {name}</span>
                <span style={{ color: '#00d4ff', fontWeight: 'bold' }}>{count}x</span>
              </div>
            )) : (
              <div style={{ fontStyle: 'italic', opacity: 0.5, textAlign: 'center', marginTop: '20px' }}>
                Collecting data...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
