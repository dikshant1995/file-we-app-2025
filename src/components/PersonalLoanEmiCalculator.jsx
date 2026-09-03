import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, ShieldCheck, IndianRupee, Percent, Calendar, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const PersonalLoanEmiCalculator = () => {
  const [loanAmount, setLoanAmount] = useState(300000);
  const [interestRate, setInterestRate] = useState(16);
  const [tenureYears, setTenureYears] = useState(3);

  // EMI Formula: E = P * r * (1 + r)^n / ((1 + r)^n - 1)
  const { emi, totalInterest, totalAmount, principalPercent, interestPercent } = useMemo(() => {
    const P = Number(loanAmount) || 0;
    const annualRate = Number(interestRate) || 0;
    const n = (Number(tenureYears) || 1) * 12;

    if (P <= 0 || annualRate <= 0 || n <= 0) {
      return { emi: 0, totalInterest: 0, totalAmount: P, principalPercent: 100, interestPercent: 0 };
    }

    const r = annualRate / 12 / 100;
    const factor = Math.pow(1 + r, n);
    const calculatedEmi = Math.round((P * r * factor) / (factor - 1));
    const calculatedTotal = calculatedEmi * n;
    const calculatedInterest = Math.max(0, calculatedTotal - P);

    const pPct = Math.round((P / calculatedTotal) * 100);
    const iPct = 100 - pPct;

    return {
      emi: calculatedEmi,
      totalInterest: calculatedInterest,
      totalAmount: calculatedTotal,
      principalPercent: pPct,
      interestPercent: iPct
    };
  }, [loanAmount, interestRate, tenureYears]);

  // Indian currency formatter
  const formatIndian = (num) => {
    return new Intl.NumberFormat('en-IN').format(Math.round(num));
  };

  // Slider progress percentages for CSS styling
  const amountPercent = ((loanAmount - 50000) / (1500000 - 50000)) * 100;
  const ratePercent = ((interestRate - 10) / (36 - 10)) * 100;
  const tenurePercent = ((tenureYears - 1) / (5 - 1)) * 100;

  // Donut chart SVG stroke calculations
  const radius = 68;
  const circumference = 2 * Math.PI * radius; // ~427.25
  const principalStroke = (principalPercent / 100) * circumference;
  const interestStroke = circumference - principalStroke;

  return (
    <section 
      id="emi-calculator"
      style={{
        padding: '90px 20px 80px',
        maxWidth: '1280px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 2
      }}
    >
      {/* Background ambient glow behind calculator */}
      <div 
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '80%',
          height: '60%',
          background: 'radial-gradient(ellipse at center, rgba(245, 130, 32, 0.08) 0%, rgba(37, 99, 235, 0.05) 50%, transparent 80%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
          zIndex: -1
        }}
      />

      {/* Header with InCred styling */}
      <div style={{ textAlign: 'center', marginBottom: '45px' }}>
        <div 
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(245, 130, 32, 0.1)',
            border: '1px solid rgba(245, 130, 32, 0.25)',
            borderRadius: '50px',
            padding: '6px 18px',
            fontSize: '0.85rem',
            fontWeight: 700,
            color: '#EA580C',
            marginBottom: '14px',
            textTransform: 'uppercase',
            letterSpacing: '0.8px'
          }}
        >
          <Sparkles size={15} />
          <span>Interactive Rate Engine</span>
        </div>

        <h2
          style={{
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            fontSize: '2.6rem',
            fontWeight: 800,
            color: '#111827',
            margin: '0 0 14px 0',
            letterSpacing: '-0.6px',
            lineHeight: 1.2
          }}
        >
          Personal Loan EMI Calculator
        </h2>

        {/* Orange Accent Underline Bar */}
        <div 
          style={{ 
            width: '56px', 
            height: '4px', 
            background: 'linear-gradient(90deg, #F58220 0%, #EA580C 100%)', 
            borderRadius: '4px', 
            margin: '0 auto' 
          }} 
        />
        <p 
          style={{ 
            fontFamily: "'Inter', sans-serif", 
            fontSize: '1.05rem', 
            color: '#4B5563', 
            marginTop: '14px',
            maxWidth: '640px',
            margin: '14px auto 0',
            lineHeight: 1.5
          }}
        >
          Tailor your loan parameters in real-time and visualize principal versus interest breakdown before applying.
        </p>
      </div>

      {/* Main Elevated Card Wrapper */}
      <div
        style={{
          background: 'linear-gradient(145deg, #FFFFFF 0%, #FAFCFF 100%)',
          borderRadius: '32px',
          boxShadow: '0 20px 60px -15px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(229, 231, 235, 0.9)',
          padding: '48px 44px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '48px',
          alignItems: 'stretch'
        }}
      >
        {/* Left Column: Sliders & Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '34px' }}>
          
          {/* Input 1: Loan Amount */}
          <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '22px 24px', border: '1px solid #EEF2F6', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IndianRupee size={17} color="#2563EB" />
                </div>
                <label 
                  style={{ 
                    fontFamily: "'Inter', sans-serif", 
                    fontSize: '1.05rem', 
                    fontWeight: 700, 
                    color: '#1F2937' 
                  }}
                >
                  Loan Amount<span style={{ color: '#EF4444', marginLeft: '2px' }}>*</span>
                </label>
              </div>

              {/* Amount Pill Display */}
              <div 
                style={{ 
                  background: 'linear-gradient(135deg, #EFF6FF 0%, #F0FDF4 100%)', 
                  borderRadius: '14px', 
                  padding: '8px 20px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px',
                  border: '1.5px solid #BFDBFE',
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)'
                }}
              >
                <span style={{ color: '#1E40AF', fontWeight: 700, fontSize: '1.1rem' }}>₹</span>
                <span 
                  style={{ 
                    fontFamily: "'Inter', sans-serif", 
                    fontSize: '1.25rem', 
                    fontWeight: 800, 
                    color: '#1E3A8A',
                    letterSpacing: '-0.2px'
                  }}
                >
                  {formatIndian(loanAmount)}
                </span>
              </div>
            </div>

            {/* Custom Range Slider */}
            <div style={{ position: 'relative', margin: '14px 0 10px' }}>
              <input 
                type="range"
                min={50000}
                max={1500000}
                step={25000}
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                style={{
                  width: '100%',
                  height: '8px',
                  borderRadius: '6px',
                  outline: 'none',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  background: `linear-gradient(to right, #1E40AF 0%, #2563EB ${amountPercent}%, #E2E8F0 ${amountPercent}%, #E2E8F0 100%)`,
                  cursor: 'pointer'
                }}
              />
            </div>

            {/* Slider Min/Max Labels */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748B', fontWeight: 500, fontFamily: "'Inter', sans-serif" }}>
              <span>₹50,000</span>
              <span>₹15,00,000 (15 L)</span>
            </div>

            {/* Quick Amount Presets */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
              {[100000, 300000, 500000, 1000000, 1500000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setLoanAmount(amt)}
                  style={{
                    background: loanAmount === amt ? '#1E40AF' : '#F8FAFC',
                    color: loanAmount === amt ? '#FFFFFF' : '#475569',
                    border: `1px solid ${loanAmount === amt ? '#1E40AF' : '#E2E8F0'}`,
                    borderRadius: '10px',
                    padding: '6px 14px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: loanAmount === amt ? '0 4px 10px rgba(30, 64, 175, 0.25)' : 'none'
                  }}
                >
                  ₹{amt >= 100000 ? `${amt / 100000}L` : `${amt / 1000}k`}
                </button>
              ))}
            </div>
          </div>

          {/* Input 2: Interest Rate */}
          <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '22px 24px', border: '1px solid #EEF2F6', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Percent size={16} color="#EA580C" />
                </div>
                <label 
                  style={{ 
                    fontFamily: "'Inter', sans-serif", 
                    fontSize: '1.05rem', 
                    fontWeight: 700, 
                    color: '#1F2937' 
                  }}
                >
                  Interest Rate<span style={{ color: '#EF4444', marginLeft: '2px' }}>*</span>
                </label>
              </div>

              {/* Rate Pill Display */}
              <div 
                style={{ 
                  background: '#FFF7ED', 
                  borderRadius: '14px', 
                  padding: '8px 20px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px',
                  border: '1.5px solid #FFEDD5',
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)'
                }}
              >
                <span style={{ color: '#EA580C', fontWeight: 700, fontSize: '1.05rem' }}>%</span>
                <span 
                  style={{ 
                    fontFamily: "'Inter', sans-serif", 
                    fontSize: '1.25rem', 
                    fontWeight: 800, 
                    color: '#9A3412' 
                  }}
                >
                  {interestRate}
                </span>
              </div>
            </div>

            {/* Custom Range Slider */}
            <div style={{ position: 'relative', margin: '14px 0 10px' }}>
              <input 
                type="range"
                min={10}
                max={36}
                step={0.5}
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                style={{
                  width: '100%',
                  height: '8px',
                  borderRadius: '6px',
                  outline: 'none',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  background: `linear-gradient(to right, #EA580C 0%, #F58220 ${ratePercent}%, #E2E8F0 ${ratePercent}%, #E2E8F0 100%)`,
                  cursor: 'pointer'
                }}
              />
            </div>

            {/* Slider Min/Max Labels */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748B', fontWeight: 500, fontFamily: "'Inter', sans-serif" }}>
              <span>Min 10%</span>
              <span>Max 36%</span>
            </div>
          </div>

          {/* Input 3: Loan Tenure */}
          <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '22px 24px', border: '1px solid #EEF2F6', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Calendar size={16} color="#16A34A" />
                </div>
                <label 
                  style={{ 
                    fontFamily: "'Inter', sans-serif", 
                    fontSize: '1.05rem', 
                    fontWeight: 700, 
                    color: '#1F2937' 
                  }}
                >
                  Loan Tenure<span style={{ color: '#EF4444', marginLeft: '2px' }}>*</span>
                </label>
              </div>

              {/* Tenure Pill Display */}
              <div 
                style={{ 
                  background: '#F0FDF4', 
                  borderRadius: '14px', 
                  padding: '8px 20px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px',
                  border: '1.5px solid #BBF7D0',
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)'
                }}
              >
                <span style={{ color: '#15803D', fontWeight: 700, fontSize: '0.95rem' }}>Yr</span>
                <span 
                  style={{ 
                    fontFamily: "'Inter', sans-serif", 
                    fontSize: '1.25rem', 
                    fontWeight: 800, 
                    color: '#14532D' 
                  }}
                >
                  {tenureYears}
                </span>
              </div>
            </div>

            {/* Custom Range Slider */}
            <div style={{ position: 'relative', margin: '14px 0 10px' }}>
              <input 
                type="range"
                min={1}
                max={5}
                step={1}
                value={tenureYears}
                onChange={(e) => setTenureYears(Number(e.target.value))}
                style={{
                  width: '100%',
                  height: '8px',
                  borderRadius: '6px',
                  outline: 'none',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  background: `linear-gradient(to right, #16A34A 0%, #22C55E ${tenurePercent}%, #E2E8F0 ${tenurePercent}%, #E2E8F0 100%)`,
                  cursor: 'pointer'
                }}
              />
            </div>

            {/* Slider Min/Max Labels */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748B', fontWeight: 500, fontFamily: "'Inter', sans-serif" }}>
              <span>Min 1 year</span>
              <span>Max 5 years</span>
            </div>

            {/* Quick Tenure Pills */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
              {[1, 2, 3, 4, 5].map((yr) => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => setTenureYears(yr)}
                  style={{
                    flex: 1,
                    background: tenureYears === yr ? '#16A34A' : '#F8FAFC',
                    color: tenureYears === yr ? '#FFFFFF' : '#475569',
                    border: `1px solid ${tenureYears === yr ? '#16A34A' : '#E2E8F0'}`,
                    borderRadius: '10px',
                    padding: '8px 0',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    textAlign: 'center',
                    boxShadow: tenureYears === yr ? '0 4px 10px rgba(22, 163, 74, 0.25)' : 'none'
                  }}
                >
                  {yr} {yr === 1 ? 'Year' : 'Yrs'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Premium High-Gloss Summary Card */}
        <div
          style={{
            background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
            borderRadius: '28px',
            border: '1.5px solid #E2E8F0',
            padding: '38px 36px',
            textAlign: 'center',
            boxShadow: '0 16px 36px -10px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative'
          }}
        >
          {/* Header Tag */}
          <div style={{ width: '100%' }}>
            <span 
              style={{ 
                fontFamily: "'Inter', sans-serif", 
                fontSize: '1rem', 
                fontWeight: 600, 
                color: '#64748B',
                textTransform: 'uppercase',
                letterSpacing: '0.6px'
              }}
            >
              Your Monthly EMI
            </span>

            {/* Huge Hero EMI Amount with Gradient Text */}
            <div 
              style={{ 
                fontFamily: "'Inter', -apple-system, sans-serif", 
                fontSize: '3.2rem', 
                fontWeight: 900, 
                background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                margin: '10px 0 4px',
                letterSpacing: '-1.2px',
                lineHeight: 1.1
              }}
            >
              ₹{formatIndian(emi)}
            </div>

            <div 
              style={{ 
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#F1F5F9',
                borderRadius: '20px',
                padding: '4px 14px',
                fontSize: '0.85rem', 
                color: '#475569', 
                fontWeight: 600,
                marginBottom: '28px' 
              }}
            >
              <span>{interestRate}% Annual Interest</span>
              <span>•</span>
              <span>{tenureYears * 12} Months</span>
            </div>
          </div>

          {/* High-End Illustrated Donut Chart with Drop-Shadow */}
          <div style={{ position: 'relative', width: '176px', height: '176px', margin: '0 auto 28px' }}>
            <svg width="176" height="176" viewBox="0 0 176 176" style={{ transform: 'rotate(-90deg)', filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.06))' }}>
              <defs>
                <linearGradient id="principalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FB923C" />
                  <stop offset="100%" stopColor="#EA580C" />
                </linearGradient>
                <linearGradient id="interestGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#1E40AF" />
                </linearGradient>
              </defs>

              {/* Background Full Track */}
              <circle
                cx="88"
                cy="88"
                r={radius}
                fill="none"
                stroke="#F1F5F9"
                strokeWidth="22"
              />

              {/* Orange Slice: Principal Amount */}
              <circle
                cx="88"
                cy="88"
                r={radius}
                fill="none"
                stroke="url(#principalGrad)"
                strokeWidth="22"
                strokeDasharray={`${principalStroke} ${circumference}`}
                strokeDashoffset="0"
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 0.4s ease' }}
              />

              {/* Blue Slice: Total Interest */}
              <circle
                cx="88"
                cy="88"
                r={radius}
                fill="none"
                stroke="url(#interestGrad)"
                strokeWidth="22"
                strokeDasharray={`${interestStroke} ${circumference}`}
                strokeDashoffset={-principalStroke}
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 0.4s ease, stroke-dashoffset 0.4s ease' }}
              />
            </svg>

            {/* Center Donut Hub */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                pointerEvents: 'none'
              }}
            >
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                Principal
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#EA580C' }}>
                {principalPercent}%
              </div>
            </div>
          </div>

          {/* Two Sleek Metric Sub-Cards */}
          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '14px', 
              width: '100%', 
              maxWidth: '380px',
              marginBottom: '20px'
            }}
          >
            {/* Principal Sub-Card */}
            <div 
              style={{ 
                background: '#FFF7ED', 
                border: '1px solid #FFEDD5', 
                borderRadius: '16px', 
                padding: '14px 12px',
                textAlign: 'center' 
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '4px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#EA580C' }} />
                <span style={{ fontSize: '0.82rem', color: '#9A3412', fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>
                  Principal
                </span>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1F2937', fontFamily: "'Inter', sans-serif" }}>
                ₹{formatIndian(loanAmount)}
              </div>
            </div>

            {/* Total Interest Sub-Card */}
            <div 
              style={{ 
                background: '#EFF6FF', 
                border: '1px solid #DBEAFE', 
                borderRadius: '16px', 
                padding: '14px 12px',
                textAlign: 'center' 
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '4px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#1E40AF' }} />
                <span style={{ fontSize: '0.82rem', color: '#1E3A8A', fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>
                  Total Interest
                </span>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1F2937', fontFamily: "'Inter', sans-serif" }}>
                ₹{formatIndian(totalInterest)}
              </div>
            </div>
          </div>

          {/* Total Amount Payable Banner */}
          <div 
            style={{ 
              width: '100%', 
              maxWidth: '380px',
              background: '#F8FAFC',
              borderRadius: '14px',
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px',
              border: '1px solid #E2E8F0'
            }}
          >
            <span style={{ fontSize: '0.9rem', color: '#64748B', fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>
              Total Amount Payable
            </span>
            <span style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0F172A', fontFamily: "'Inter', sans-serif" }}>
              ₹{formatIndian(totalAmount)}
            </span>
          </div>

          {/* Interactive CTA Button */}
          <Link to="/personal-loan" style={{ textDecoration: 'none', width: '100%', maxWidth: '380px' }}>
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 12px 30px rgba(245, 130, 32, 0.45)' }}
              whileTap={{ scale: 0.98 }}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #F58220 0%, #EA580C 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '50px',
                padding: '16px 28px',
                fontSize: '1.08rem',
                fontWeight: 750,
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(245, 130, 32, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                fontFamily: "'Inter', sans-serif",
                letterSpacing: '0.2px'
              }}
            >
              <span>Check Offers for ₹{formatIndian(loanAmount)}</span>
              <ArrowRight size={19} />
            </motion.button>
          </Link>

          {/* Trust Footnote */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '14px', fontSize: '0.78rem', color: '#94A3B8' }}>
            <ShieldCheck size={14} color="#16A34A" />
            <span>Instant eligibility verification • No credit score impact</span>
          </div>

        </div>
      </div>
    </section>
  );
};

export default PersonalLoanEmiCalculator;
