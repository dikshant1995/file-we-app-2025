import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, ShieldCheck, IndianRupee, Percent, Calendar, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const PersonalLoanEmiCalculator = () => {
  const [loanAmount, setLoanAmount] = useState(300000);
  const [interestRate, setInterestRate] = useState(11);
  const [tenureYears, setTenureYears] = useState(5);

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
  const amountPercent = ((loanAmount - 50000) / (15000000 - 50000)) * 100;
  const ratePercent = ((interestRate - 10) / (36 - 10)) * 100;
  const tenurePercent = ((tenureYears - 1) / (7 - 1)) * 100;

  // Donut chart SVG stroke calculations
  const radius = 68;
  const circumference = 2 * Math.PI * radius; // ~427.25
  const principalStroke = (principalPercent / 100) * circumference;
  const interestStroke = circumference - principalStroke;

  return (
    <section 
      id="emi-calculator"
      style={{
        padding: '30px 20px 60px',
        maxWidth: '980px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 2
      }}
    >
      {/* Background ambient glow behind calculator */}
      <div 
        style={{
          position: 'absolute',
          top: '15%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '70%',
          height: '50%',
          background: 'radial-gradient(ellipse at center, rgba(245, 130, 32, 0.08) 0%, rgba(37, 99, 235, 0.05) 50%, transparent 80%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
          zIndex: -1
        }}
      />

      {/* Header with InCred styling */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2
          style={{
            fontFamily: 'Outfit, "Plus Jakarta Sans", Inter, sans-serif',
            fontSize: 'clamp(28px, 4vw, 43px)',
            fontWeight: 750,
            fontStyle: 'normal',
            color: 'rgb(66, 66, 66)',
            lineHeight: '54px',
            margin: 0,
            letterSpacing: '-0.5px'
          }}
        >
          Personal Loan <span style={{ color: 'rgb(245, 130, 32)', fontFamily: 'Outfit, "Plus Jakarta Sans", Inter, sans-serif', fontWeight: 750 }}>EMI</span> Calculator
        </h2>

        {/* Orange Accent Underline Bar */}
        <div 
          style={{ 
            width: '42px', 
            height: '3.5px', 
            backgroundColor: '#F58220', 
            borderRadius: '2px', 
            margin: '14px auto 0' 
          }} 
        />
        <p 
          style={{ 
            fontFamily: "'Inter', sans-serif", 
            fontSize: '0.98rem', 
            color: '#4B5563', 
            marginTop: '12px',
            maxWidth: '580px',
            margin: '12px auto 0',
            lineHeight: 1.5
          }}
        >
          Tailor your loan parameters in real-time and visualize principal versus interest breakdown before applying.
        </p>
      </div>

      {/* Main Compact Elevated Card Wrapper */}
      <div
        style={{
          background: 'linear-gradient(145deg, #FFFFFF 0%, #FAFCFF 100%)',
          borderRadius: '28px',
          boxShadow: '0 18px 50px -15px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(229, 231, 235, 0.9)',
          padding: '36px 32px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '32px',
          alignItems: 'stretch'
        }}
      >
        {/* Left Column: Sliders & Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '22px' }}>
          
          {/* Input 1: Loan Amount */}
          <div style={{ background: '#FFFFFF', borderRadius: '18px', padding: '18px 20px', border: '1px solid #EEF2F6', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
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
                {loanAmount >= 10000000 && (
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#2563EB', marginLeft: '4px', background: '#DBEAFE', padding: '2px 8px', borderRadius: '6px' }}>
                    {(loanAmount / 10000000).toFixed(loanAmount % 10000000 === 0 ? 0 : 2)} Cr
                  </span>
                )}
              </div>
            </div>

            {/* Custom Range Slider */}
            <div style={{ position: 'relative', margin: '14px 0 10px' }}>
              <input 
                type="range"
                min={50000}
                max={15000000}
                step={50000}
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
              <span>₹1,50,00,000 (1.5 Cr)</span>
            </div>

            {/* Quick Amount Presets */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
              {[
                { val: 500000, label: '₹5L' },
                { val: 1500000, label: '₹15L' },
                { val: 2500000, label: '₹25L' },
                { val: 5000000, label: '₹50L' },
                { val: 10000000, label: '₹1 Cr' },
                { val: 15000000, label: '₹1.5 Cr' }
              ].map((item) => (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => setLoanAmount(item.val)}
                  onMouseEnter={(e) => {
                    if (loanAmount !== item.val) {
                      e.currentTarget.style.background = '#EFF6FF';
                      e.currentTarget.style.borderColor = '#3B82F6';
                      e.currentTarget.style.color = '#1D4ED8';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (loanAmount !== item.val) {
                      e.currentTarget.style.background = '#F8FAFC';
                      e.currentTarget.style.borderColor = '#E2E8F0';
                      e.currentTarget.style.color = '#475569';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }
                  }}
                  style={{
                    background: loanAmount === item.val ? '#1E40AF' : '#F8FAFC',
                    color: loanAmount === item.val ? '#FFFFFF' : '#475569',
                    border: `1px solid ${loanAmount === item.val ? '#1E40AF' : '#E2E8F0'}`,
                    borderRadius: '10px',
                    padding: '6px 14px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: loanAmount === item.val ? '0 4px 10px rgba(30, 64, 175, 0.25)' : 'none'
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input 2: Interest Rate */}
          <div style={{ background: '#FFFFFF', borderRadius: '18px', padding: '18px 20px', border: '1px solid #EEF2F6', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Percent size={15} color="#EA580C" />
                </div>
                <label 
                  style={{ 
                    fontFamily: "'Inter', sans-serif", 
                    fontSize: '1rem', 
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
                  borderRadius: '12px', 
                  padding: '6px 16px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px',
                  border: '1.5px solid #FFEDD5',
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)'
                }}
              >
                <span style={{ color: '#EA580C', fontWeight: 700, fontSize: '0.95rem' }}>%</span>
                <span 
                  style={{ 
                    fontFamily: "'Inter', sans-serif", 
                    fontSize: '1.15rem', 
                    fontWeight: 800, 
                    color: '#9A3412' 
                  }}
                >
                  {interestRate}
                </span>
              </div>
            </div>

            {/* Custom Range Slider */}
            <div style={{ position: 'relative', margin: '10px 0 8px' }}>
              <input 
                type="range"
                min={10}
                max={36}
                step={0.5}
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                style={{
                  width: '100%',
                  height: '7px',
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
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#64748B', fontWeight: 500, fontFamily: "'Inter', sans-serif" }}>
              <span>Min 10%</span>
              <span>Max 36%</span>
            </div>
          </div>

          {/* Input 3: Loan Tenure */}
          <div style={{ background: '#FFFFFF', borderRadius: '18px', padding: '18px 20px', border: '1px solid #EEF2F6', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Calendar size={15} color="#16A34A" />
                </div>
                <label 
                  style={{ 
                    fontFamily: "'Inter', sans-serif", 
                    fontSize: '1rem', 
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
                  borderRadius: '12px', 
                  padding: '6px 16px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px',
                  border: '1.5px solid #BBF7D0',
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)'
                }}
              >
                <span style={{ color: '#15803D', fontWeight: 700, fontSize: '0.9rem' }}>Yr</span>
                <span 
                  style={{ 
                    fontFamily: "'Inter', sans-serif", 
                    fontSize: '1.15rem', 
                    fontWeight: 800, 
                    color: '#14532D' 
                  }}
                >
                  {tenureYears}
                </span>
              </div>
            </div>

            {/* Custom Range Slider */}
            <div style={{ position: 'relative', margin: '10px 0 8px' }}>
              <input 
                type="range"
                min={1}
                max={7}
                step={1}
                value={tenureYears}
                onChange={(e) => setTenureYears(Number(e.target.value))}
                style={{
                  width: '100%',
                  height: '7px',
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
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#64748B', fontWeight: 500, fontFamily: "'Inter', sans-serif" }}>
              <span>Min 1 year</span>
              <span>Max 7 years</span>
            </div>

            {/* Quick Tenure Pills */}
            <div style={{ display: 'flex', gap: '6px', marginTop: '12px', flexWrap: 'wrap' }}>
              {[1, 2, 3, 4, 5, 6, 7].map((yr) => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => setTenureYears(yr)}
                  onMouseEnter={(e) => {
                    if (tenureYears !== yr) {
                      e.currentTarget.style.background = '#F0FDF4';
                      e.currentTarget.style.borderColor = '#22C55E';
                      e.currentTarget.style.color = '#15803D';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (tenureYears !== yr) {
                      e.currentTarget.style.background = '#F8FAFC';
                      e.currentTarget.style.borderColor = '#E2E8F0';
                      e.currentTarget.style.color = '#475569';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }
                  }}
                  style={{
                    flex: '1 1 0',
                    minWidth: '40px',
                    background: tenureYears === yr ? '#16A34A' : '#F8FAFC',
                    color: tenureYears === yr ? '#FFFFFF' : '#475569',
                    border: `1px solid ${tenureYears === yr ? '#16A34A' : '#E2E8F0'}`,
                    borderRadius: '8px',
                    padding: '6px 0',
                    fontSize: '0.82rem',
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
            borderRadius: '24px',
            border: '1.5px solid #E2E8F0',
            padding: '28px 24px',
            textAlign: 'center',
            boxShadow: '0 12px 30px -10px rgba(0, 0, 0, 0.05)',
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
                fontSize: '0.92rem', 
                fontWeight: 600, 
                color: '#64748B',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              Your Monthly EMI
            </span>

            {/* Huge Hero EMI Amount with Gradient Text */}
            <div 
              style={{ 
                fontFamily: "'Inter', -apple-system, sans-serif", 
                fontSize: '2.6rem', 
                fontWeight: 900, 
                background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                margin: '6px 0 2px',
                letterSpacing: '-1px',
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
                borderRadius: '16px',
                padding: '3px 12px',
                fontSize: '0.8rem', 
                color: '#475569', 
                fontWeight: 600,
                marginBottom: '18px' 
              }}
            >
              <span>{interestRate}% Annual Interest</span>
              <span>•</span>
              <span>{tenureYears * 12} Months</span>
            </div>
          </div>

          {/* High-End Illustrated Donut Chart with Drop-Shadow */}
          <div style={{ position: 'relative', width: '180px', height: '180px', margin: '0 auto 20px' }}>
            <svg 
              className="emi-donut-svg"
              width="180" 
              height="180" 
              viewBox="0 0 180 180" 
              style={{ 
                width: '180px',
                height: '180px',
                minWidth: '180px',
                minHeight: '180px',
                display: 'block',
                transform: 'rotate(-90deg)', 
                filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.06))' 
              }}
            >
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
                cx="90"
                cy="90"
                r="68"
                fill="none"
                stroke="#F1F5F9"
                strokeWidth="22"
              />

              {/* Orange Slice: Principal Amount */}
              <circle
                cx="90"
                cy="90"
                r="68"
                fill="none"
                stroke="url(#principalGrad)"
                strokeWidth="22"
                strokeDasharray={`${(principalPercent / 100) * 427.26} 427.26`}
                strokeDashoffset="0"
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
              />

              {/* Blue Slice: Total Interest */}
              <circle
                cx="90"
                cy="90"
                r="68"
                fill="none"
                stroke="url(#interestGrad)"
                strokeWidth="22"
                strokeDasharray={`${((100 - principalPercent) / 100) * 427.26} 427.26`}
                strokeDashoffset={-((principalPercent / 100) * 427.26)}
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 0.3s cubic-bezier(0.4, 0, 0.2, 1), stroke-dashoffset 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
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
                pointerEvents: 'none',
                width: '100%'
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Principal
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#EA580C', lineHeight: 1.1 }}>
                {principalPercent}%
              </div>
            </div>
          </div>

          {/* Two Sleek Metric Sub-Cards */}
          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '10px', 
              width: '100%', 
              maxWidth: '340px',
              marginBottom: '16px'
            }}
          >
            {/* Principal Sub-Card */}
            <div 
              style={{ 
                background: '#FFF7ED', 
                border: '1px solid #FFEDD5', 
                borderRadius: '14px', 
                padding: '10px 8px',
                textAlign: 'center' 
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', marginBottom: '2px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EA580C' }} />
                <span style={{ fontSize: '0.78rem', color: '#9A3412', fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>
                  Principal
                </span>
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1F2937', fontFamily: "'Inter', sans-serif" }}>
                ₹{formatIndian(loanAmount)}
              </div>
            </div>

            {/* Total Interest Sub-Card */}
            <div 
              style={{ 
                background: '#EFF6FF', 
                border: '1px solid #DBEAFE', 
                borderRadius: '14px', 
                padding: '10px 8px',
                textAlign: 'center' 
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', marginBottom: '2px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#1E40AF' }} />
                <span style={{ fontSize: '0.78rem', color: '#1E3A8A', fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>
                  Total Interest
                </span>
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1F2937', fontFamily: "'Inter', sans-serif" }}>
                ₹{formatIndian(totalInterest)}
              </div>
            </div>
          </div>

          {/* Total Amount Payable Banner */}
          <div 
            style={{ 
              width: '100%', 
              maxWidth: '340px',
              background: '#F8FAFC',
              borderRadius: '12px',
              padding: '8px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '18px',
              border: '1px solid #E2E8F0'
            }}
          >
            <span style={{ fontSize: '0.84rem', color: '#64748B', fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>
              Total Payable
            </span>
            <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0F172A', fontFamily: "'Inter', sans-serif" }}>
              ₹{formatIndian(totalAmount)}
            </span>
          </div>

          {/* Interactive CTA Button */}
          <Link to="/personal-loan" style={{ textDecoration: 'none', width: '100%', maxWidth: '340px' }}>
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 10px 24px rgba(245, 130, 32, 0.4)' }}
              whileTap={{ scale: 0.98 }}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #F58220 0%, #EA580C 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '50px',
                padding: '14px 24px',
                fontSize: '1.05rem',
                fontWeight: 750,
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(245, 130, 32, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontFamily: "'Inter', sans-serif",
                letterSpacing: '0.2px'
              }}
            >
              <span>Check Offers</span>
              <ArrowRight size={18} />
            </motion.button>
          </Link>

        </div>
      </div>
    </section>
  );
};

export default PersonalLoanEmiCalculator;
