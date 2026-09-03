import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Calculator, CheckCircle2 } from 'lucide-react';
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
  const radius = 62;
  const circumference = 2 * Math.PI * radius; // ~389.55
  const principalStroke = (principalPercent / 100) * circumference;
  const interestStroke = circumference - principalStroke;

  return (
    <section 
      id="emi-calculator"
      style={{
        padding: '80px 20px 70px',
        maxWidth: '1240px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 2
      }}
    >
      {/* Section Title matching user screenshot */}
      <div style={{ textAlign: 'center', marginBottom: '45px' }}>
        <h2
          style={{
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            fontSize: '2.5rem',
            fontWeight: 700,
            color: '#1F2937',
            margin: '0 0 14px 0',
            letterSpacing: '-0.5px'
          }}
        >
          Personal Loan EMI Calculator
        </h2>
        {/* InCred Accent Underline Bar */}
        <div 
          style={{ 
            width: '52px', 
            height: '4px', 
            background: '#F58220', 
            borderRadius: '4px', 
            margin: '0 auto' 
          }} 
        />
        <p 
          style={{ 
            fontFamily: "'Inter', sans-serif", 
            fontSize: '1rem', 
            color: '#6B7280', 
            marginTop: '14px',
            maxWidth: '600px',
            margin: '14px auto 0'
          }}
        >
          Plan your budget with real-time monthly repayment calculations across partner banks
        </p>
      </div>

      {/* Main Calculator Card */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '28px',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.06)',
          border: '1px solid #E5E7EB',
          padding: '48px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '50px',
          alignItems: 'center'
        }}
      >
        {/* Left Column: Sliders & Quick Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Input 1: Loan Amount */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <label 
                style={{ 
                  fontFamily: "'Inter', sans-serif", 
                  fontSize: '1.05rem', 
                  fontWeight: 600, 
                  color: '#1F2937' 
                }}
              >
                Loan Amount<span style={{ color: '#EF4444' }}>*</span>
              </label>

              {/* Amount Pill Display */}
              <div 
                style={{ 
                  background: '#F3F4F6', 
                  borderRadius: '12px', 
                  padding: '8px 18px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px',
                  border: '1px solid #E5E7EB'
                }}
              >
                <span style={{ color: '#6B7280', fontWeight: 600, fontSize: '1.05rem' }}>₹</span>
                <span 
                  style={{ 
                    fontFamily: "'Inter', sans-serif", 
                    fontSize: '1.15rem', 
                    fontWeight: 700, 
                    color: '#111827',
                    letterSpacing: '0.2px'
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
                  background: `linear-gradient(to right, #1E40AF 0%, #2563EB ${amountPercent}%, #E5E7EB ${amountPercent}%, #E5E7EB 100%)`,
                  cursor: 'pointer'
                }}
              />
            </div>

            {/* Slider Min/Max Labels */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', color: '#6B7280', fontFamily: "'Inter', sans-serif" }}>
              <span>₹50,000</span>
              <span>₹15,00,000 (15 L)</span>
            </div>

            {/* Quick Amount Presets */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
              {[100000, 300000, 500000, 1000000, 1500000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setLoanAmount(amt)}
                  style={{
                    background: loanAmount === amt ? '#EFF6FF' : '#F9FAFB',
                    color: loanAmount === amt ? '#1D4ED8' : '#4B5563',
                    border: `1px solid ${loanAmount === amt ? '#93C5FD' : '#E5E7EB'}`,
                    borderRadius: '8px',
                    padding: '4px 12px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  ₹{amt >= 100000 ? `${amt / 100000}L` : `${amt / 1000}k`}
                </button>
              ))}
            </div>
          </div>

          {/* Input 2: Interest Rate */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <label 
                style={{ 
                  fontFamily: "'Inter', sans-serif", 
                  fontSize: '1.05rem', 
                  fontWeight: 600, 
                  color: '#1F2937' 
                }}
              >
                Interest Rate<span style={{ color: '#EF4444' }}>*</span>
              </label>

              {/* Rate Pill Display */}
              <div 
                style={{ 
                  background: '#F3F4F6', 
                  borderRadius: '12px', 
                  padding: '8px 18px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px',
                  border: '1px solid #E5E7EB'
                }}
              >
                <span style={{ color: '#6B7280', fontWeight: 600, fontSize: '1rem' }}>%</span>
                <span 
                  style={{ 
                    fontFamily: "'Inter', sans-serif", 
                    fontSize: '1.15rem', 
                    fontWeight: 700, 
                    color: '#111827' 
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
                  background: `linear-gradient(to right, #1E40AF 0%, #2563EB ${ratePercent}%, #E5E7EB ${ratePercent}%, #E5E7EB 100%)`,
                  cursor: 'pointer'
                }}
              />
            </div>

            {/* Slider Min/Max Labels */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', color: '#6B7280', fontFamily: "'Inter', sans-serif" }}>
              <span>Min 10%</span>
              <span>Max 36%</span>
            </div>
          </div>

          {/* Input 3: Loan Tenure */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <label 
                style={{ 
                  fontFamily: "'Inter', sans-serif", 
                  fontSize: '1.05rem', 
                  fontWeight: 600, 
                  color: '#1F2937' 
                }}
              >
                Loan Tenure<span style={{ color: '#EF4444' }}>*</span>
              </label>

              {/* Tenure Pill Display */}
              <div 
                style={{ 
                  background: '#F3F4F6', 
                  borderRadius: '12px', 
                  padding: '8px 18px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px',
                  border: '1px solid #E5E7EB'
                }}
              >
                <span style={{ color: '#6B7280', fontWeight: 600, fontSize: '0.95rem' }}>Yr</span>
                <span 
                  style={{ 
                    fontFamily: "'Inter', sans-serif", 
                    fontSize: '1.15rem', 
                    fontWeight: 700, 
                    color: '#111827' 
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
                  background: `linear-gradient(to right, #1E40AF 0%, #2563EB ${tenurePercent}%, #E5E7EB ${tenurePercent}%, #E5E7EB 100%)`,
                  cursor: 'pointer'
                }}
              />
            </div>

            {/* Slider Min/Max Labels */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', color: '#6B7280', fontFamily: "'Inter', sans-serif" }}>
              <span>Min 1 year</span>
              <span>Max 5 years</span>
            </div>

            {/* Quick Tenure Pills */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              {[1, 2, 3, 4, 5].map((yr) => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => setTenureYears(yr)}
                  style={{
                    flex: 1,
                    background: tenureYears === yr ? '#EFF6FF' : '#F9FAFB',
                    color: tenureYears === yr ? '#1D4ED8' : '#4B5563',
                    border: `1px solid ${tenureYears === yr ? '#93C5FD' : '#E5E7EB'}`,
                    borderRadius: '8px',
                    padding: '6px 0',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    textAlign: 'center'
                  }}
                >
                  {yr} {yr === 1 ? 'Year' : 'Years'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic EMI Breakdown & 2-Tone Donut Chart */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '24px',
            border: '1px solid #E5E7EB',
            padding: '36px 32px',
            textAlign: 'center',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <span 
            style={{ 
              fontFamily: "'Inter', sans-serif", 
              fontSize: '1rem', 
              fontWeight: 500, 
              color: '#4B5563' 
            }}
          >
            Your Monthly EMI
          </span>

          {/* Huge Hero EMI Amount */}
          <div 
            style={{ 
              fontFamily: "'Inter', sans-serif", 
              fontSize: '2.8rem', 
              fontWeight: 800, 
              color: '#111827', 
              margin: '8px 0 2px',
              letterSpacing: '-0.8px'
            }}
          >
            ₹{formatIndian(emi)}
          </div>

          <span 
            style={{ 
              fontFamily: "'Inter', sans-serif", 
              fontSize: '0.9rem', 
              color: '#6B7280', 
              marginBottom: '26px' 
            }}
          >
            {interestRate}% Interest Per Annum
          </span>

          {/* Interactive Donut Chart matching screenshot */}
          <div style={{ position: 'relative', width: '160px', height: '160px', margin: '0 auto 26px' }}>
            <svg width="160" height="160" viewBox="0 0 160 160" style={{ transform: 'rotate(-90deg)' }}>
              {/* Background Full Track */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke="#F3F4F6"
                strokeWidth="20"
              />

              {/* Orange Slice: Principal Amount */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke="#F58220"
                strokeWidth="20"
                strokeDasharray={`${principalStroke} ${circumference}`}
                strokeDashoffset="0"
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 0.3s ease' }}
              />

              {/* Blue Slice: Total Interest */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke="#1E40AF"
                strokeWidth="20"
                strokeDasharray={`${interestStroke} ${circumference}`}
                strokeDashoffset={-principalStroke}
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 0.3s ease, stroke-dashoffset 0.3s ease' }}
              />
            </svg>

            {/* Center Donut Badge */}
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
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>
                Tenure
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827' }}>
                {tenureYears * 12}M
              </div>
            </div>
          </div>

          {/* Legend Grid */}
          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '20px', 
              width: '100%', 
              maxWidth: '360px',
              marginBottom: '24px',
              paddingBottom: '20px',
              borderBottom: '1px solid #F3F4F6'
            }}
          >
            {/* Total Interest (Blue) */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#1E40AF', display: 'inline-block' }} />
                <span style={{ fontSize: '0.88rem', color: '#4B5563', fontWeight: 500, fontFamily: "'Inter', sans-serif" }}>
                  Total Interest
                </span>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', fontFamily: "'Inter', sans-serif" }}>
                ₹{formatIndian(totalInterest)}
              </div>
            </div>

            {/* Principal Amount (Orange) */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#F58220', display: 'inline-block' }} />
                <span style={{ fontSize: '0.88rem', color: '#4B5563', fontWeight: 500, fontFamily: "'Inter', sans-serif" }}>
                  Principal Amount
                </span>
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', fontFamily: "'Inter', sans-serif" }}>
                ₹{formatIndian(loanAmount)}
              </div>
            </div>
          </div>

          {/* Total Payable Row */}
          <div style={{ marginBottom: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.9rem', color: '#6B7280', fontWeight: 500, fontFamily: "'Inter', sans-serif" }}>
              Total Amount
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#111827', fontFamily: "'Inter', sans-serif" }}>
              ₹{formatIndian(totalAmount)}
            </div>
          </div>

          {/* Check Eligibility CTA Button */}
          <Link to="/personal-loan" style={{ textDecoration: 'none', width: '100%' }}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #F58220 0%, #EA580C 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '50px',
                padding: '14px 28px',
                fontSize: '1.05rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 8px 22px rgba(245, 130, 32, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                fontFamily: "'Inter', sans-serif"
              }}
            >
              <span>Check Eligibility with this EMI</span>
              <ArrowRight size={18} />
            </motion.button>
          </Link>

        </div>
      </div>
    </section>
  );
};

export default PersonalLoanEmiCalculator;
