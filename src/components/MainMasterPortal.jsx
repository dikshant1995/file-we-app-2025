import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, ShieldCheck, Briefcase, UserCircle2, ArrowRight, Sparkles, Instagram, Mail, MessageSquare, Send, Star, Lock, FileCheck, Landmark, Scale, MonitorSmartphone, RefreshCw, FileText, Building2, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import './MainMasterPortal.css';
import './FuturisticLanding.css'; // Reuse components styled earlier like founder and testimonials

const MainMasterPortal = ({ onAdminClick }) => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      name: "Rajat Khandelwal",
      role: "Senior Consultant, Jaipur",
      text: "Needed quick capital for family obligations. Laxmi Credit calculated my exact eligibility across 12+ banks and secured a ₹15L Personal Loan within 24 hours at the lowest interest rate.",
      rating: 5
    },
    {
      name: "Arjun Mehta",
      role: "Software Engineer",
      text: "I was struggling to find a personal loan with a 710 CIBIL score. Their neural analysis directed me to Piramal Finance where I got ₹8L disbursed in 24 hours.",
      rating: 5
    },
    {
      name: "Neha Deshmukh",
      role: "Project Lead, Pune",
      text: "The Balance Transfer calculator helped me consolidate 3 high-interest personal loans into a single low-interest offer, saving over ₹2.4 Lakhs in total repayment!",
      rating: 5
    },
    {
      name: "Vikram Malhotra",
      role: "Financial Analyst",
      text: "The speed at comparing multiple institutional policies simultaneously is beyond state-of-the-art. No better place for precise credit access analytics today.",
      rating: 5
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  return (
    <div className="master-portal">
      <div className="portal-bg-glow" />
      <div className="portal-grid" />

      <div className="portal-content">
        {/* Header - InCred Elevated Sticky Header */}
        <header className="portal-header-wrapper">
          <div className="portal-header">
            <div className="portal-logo" style={{ cursor: 'pointer' }} onClick={() => window.location.href = '/'}>
              <span 
                style={{ 
                  fontSize: '1.9rem', 
                  fontWeight: 900, 
                  fontStyle: 'italic', 
                  fontFamily: "'Mulish', 'Plus Jakarta Sans', sans-serif", 
                  letterSpacing: '-0.8px',
                  background: 'linear-gradient(135deg, #F58220 0%, #1E40AF 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: 'inline-block'
                }}
              >
                Laxmi credit
              </span>
            </div>
            <div className="portal-nav-actions">
              <button
                className="nav-admin-btn"
                onClick={onAdminClick}
                style={{
                  background: '#F58220',
                  border: 'none',
                  color: '#ffffff',
                  padding: '9px 22px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontFamily: "'Mulish', 'Plus Jakarta Sans', sans-serif",
                  boxShadow: '0 4px 14px rgba(245, 130, 32, 0.35)'
                }}
              >
                <Lock size={14} />
                <span>ADMIN</span>
              </button>
            </div>
          </div>
        </header>

        {/* Hero Section - Balanced 2-Column Layout */}
        <section className="portal-hero" style={{ padding: '10px 20px 0px', maxWidth: '1280px', margin: '0 auto' }}>
          <div className="hero-2col-wrapper" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px', alignItems: 'flex-end' }}>
            
            {/* Left Column: Headline & CTA Button */}
            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', paddingBottom: '40px' }}>
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="hero-title-main"
                style={{ fontFamily: "'Mulish', 'Plus Jakarta Sans', sans-serif", lineHeight: 1.22, marginBottom: '1.2rem', textAlign: 'left' }}
              >
                <span style={{ display: 'block', fontWeight: 300, fontSize: '2.2rem', color: '#555555', letterSpacing: '-0.4px' }}>
                  Analyze Personal Loan Offers up to
                </span>
                <span 
                  style={{ 
                    display: 'block', 
                    fontWeight: 900, 
                    fontSize: '3.3rem', 
                    letterSpacing: '-1.2px', 
                    marginTop: '6px',
                    marginBottom: '6px',
                    background: 'linear-gradient(135deg, #1E40AF 0%, #F58220 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  ₹75 lakhs across 12+ Top Banks
                </span>
                <span style={{ display: 'block', fontWeight: 300, fontSize: '1.8rem', color: '#555555', letterSpacing: '-0.3px', marginTop: '4px' }}>
                  100% Digital & Instant Processing
                </span>
              </motion.h1>

              {/* Check Loan Eligibility Button */}
              <div style={{ marginBottom: '1rem', textAlign: 'left', display: 'flex', justifyContent: 'flex-start' }}>
                <Link to="/personal-loan" style={{ textDecoration: 'none' }}>
                  <motion.button
                    className="check-eligibility-btn"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      background: 'linear-gradient(135deg, #F58220 0%, #F47A20 100%)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '50px',
                      padding: '16px 48px',
                      cursor: 'pointer',
                      boxShadow: '0 10px 28px rgba(245, 130, 32, 0.4)',
                      textAlign: 'center',
                      display: 'inline-flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: "'Mulish', 'Plus Jakarta Sans', sans-serif"
                    }}
                  >
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.3px' }}>
                      Check loan eligibility
                    </span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, opacity: 0.95, marginTop: '2px' }}>
                      In less than a minute
                    </span>
                  </motion.button>
                </Link>
              </div>
            </div>

            {/* Right Column: Model Cutout (Standing flush on bottom) */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hero-model-right-slot"
              style={{ 
                display: 'flex', 
                alignItems: 'flex-end', 
                justifyContent: 'center',
                width: '100%',
                lineHeight: 0
              }}
            >
              <img 
                src="/incred-model-cutout.png" 
                alt="Laxmi Credit Model Cutout" 
                style={{
                  maxHeight: '510px',
                  maxWidth: '100%',
                  width: 'auto',
                  objectFit: 'contain',
                  display: 'block',
                  marginBottom: '0px'
                }}
              />
            </motion.div>

          </div>
        </section>

          {/* ===== MINI PROS FEATURE BANNER (InCred Style) ===== */}
          <motion.div 
            className="incred-mini-pros-banner"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={{
              background: 'linear-gradient(135deg, #1E40AF 0%, #2563EB 50%, #F58220 100%)',
              borderRadius: '24px',
              padding: '36px 40px',
              color: '#ffffff',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '30px',
              alignItems: 'center',
              maxWidth: '1280px',
              width: '100%',
              margin: '0 auto 3rem',
              boxShadow: '0 16px 36px rgba(30, 64, 175, 0.28)',
              position: 'relative',
              zIndex: 2
            }}
          >
            {/* Pro 1: Enquiry Less Loan */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '14px' }}>
              <div 
                style={{ 
                  width: '64px', 
                  height: '64px', 
                  borderRadius: '18px', 
                  background: 'rgba(255, 255, 255, 0.18)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  backdropFilter: 'blur(10px)',
                  boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.4), 0 8px 16px rgba(0, 0, 0, 0.12)',
                  border: '1px solid rgba(255, 255, 255, 0.25)'
                }}
              >
                <FileCheck size={32} color="#ffffff" strokeWidth={2.2} />
              </div>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: "'Mulish', 'Plus Jakarta Sans', sans-serif", color: '#ffffff', lineHeight: 1.3 }}>
                Enquiry Less Loan
              </span>
            </div>

            {/* Pro 2: No Collateral Required */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '14px' }}>
              <div 
                style={{ 
                  width: '64px', 
                  height: '64px', 
                  borderRadius: '18px', 
                  background: 'rgba(255, 255, 255, 0.18)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  backdropFilter: 'blur(10px)',
                  boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.4), 0 8px 16px rgba(0, 0, 0, 0.12)',
                  border: '1px solid rgba(255, 255, 255, 0.25)'
                }}
              >
                <Landmark size={32} color="#ffffff" strokeWidth={2.2} />
              </div>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: "'Mulish', 'Plus Jakarta Sans', sans-serif", color: '#ffffff', lineHeight: 1.3 }}>
                No Collateral Required
              </span>
            </div>

            {/* Pro 3: Comparison of 12 Banks in One Minute */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '14px' }}>
              <div 
                style={{ 
                  width: '64px', 
                  height: '64px', 
                  borderRadius: '18px', 
                  background: 'rgba(255, 255, 255, 0.18)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  backdropFilter: 'blur(10px)',
                  boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.4), 0 8px 16px rgba(0, 0, 0, 0.12)',
                  border: '1px solid rgba(255, 255, 255, 0.25)'
                }}
              >
                <Scale size={32} color="#ffffff" strokeWidth={2.2} />
              </div>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: "'Mulish', 'Plus Jakarta Sans', sans-serif", color: '#ffffff', lineHeight: 1.3 }}>
                Comparison of 12 Banks in One Minute
              </span>
            </div>
          </motion.div>

        {/* ===== VALUE PROPOSITION SECTION (InCred Style) ===== */}
        <section className="incred-value-props-section" style={{ padding: '60px 20px 50px', maxWidth: '1280px', margin: '0 auto' }}>
          
          {/* Main Heading (InCred Screenshot Exact Style & Color) */}
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{
              fontFamily: "'Outfit', 'Plus Jakarta Sans', 'Inter', sans-serif",
              fontSize: '2.7rem',
              fontWeight: 750,
              color: '#1E293B',
              textAlign: 'center',
              lineHeight: 1.25,
              marginBottom: '0px',
              letterSpacing: '-0.6px'
            }}
          >
            Why apply blindly when you can compare<br />
            exact bank offers in 60 seconds?
          </motion.h2>

          {/* Orange Accent Line Under Heading (as in InCred screenshot) */}
          <div 
            style={{ 
              width: '45px', 
              height: '3.5px', 
              background: '#F58220', 
              margin: '14px auto 24px', 
              borderRadius: '2px' 
            }} 
          />

          {/* Subheading (Ultra Light Grey Font & Weight as in InCred screenshot) */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{
              fontFamily: "'Space Grotesk', 'Outfit', 'Plus Jakarta Sans', sans-serif",
              fontSize: '1.25rem',
              color: '#475569',
              fontWeight: 500,
              textAlign: 'center',
              maxWidth: '840px',
              margin: '0 auto 3.5rem',
              lineHeight: 1.6,
              letterSpacing: '0.2px'
            }}
          >
            Discover your maximum loan amount and lowest interest rate across 12+ top banks — 100% enquiry-free.
          </motion.p>

          {/* 3 Pillars Grid */}
          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: '40px', 
              maxWidth: '1000px', 
              margin: '0 auto 3.5rem',
              textAlign: 'center'
            }}>
            {/* Pillar 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -6, scale: 1.04 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}
            >
              <div style={{ width: '90px', height: '90px', borderRadius: '26px', background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)', border: '1.5px solid #BFDBFE', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', boxShadow: '0 10px 25px rgba(37, 99, 235, 0.12)' }}>
                <Building2 size={46} color="#1D4ED8" strokeWidth={2.2} />
              </div>
              <h4 style={{ fontFamily: "'Outfit', 'Mulish', 'Plus Jakarta Sans', sans-serif", fontSize: '1.35rem', fontWeight: 850, color: '#0F172A', marginBottom: '3px' }}>
                12+ Lenders
              </h4>
              <p style={{ fontFamily: "'Mulish', 'Plus Jakarta Sans', sans-serif", fontSize: '1.1rem', color: '#475569', fontWeight: 600 }}>
                Comparison
              </p>
            </motion.div>

            {/* Pillar 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -6, scale: 1.04 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}
            >
              <div style={{ width: '90px', height: '90px', borderRadius: '26px', background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)', border: '1.5px solid #BFDBFE', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', boxShadow: '0 10px 25px rgba(37, 99, 235, 0.12)' }}>
                <Lock size={46} color="#1D4ED8" strokeWidth={2.2} />
              </div>
              <h4 style={{ fontFamily: "'Outfit', 'Mulish', 'Plus Jakarta Sans', sans-serif", fontSize: '1.35rem', fontWeight: 850, color: '#0F172A', marginBottom: '3px' }}>
                Zero CIBIL
              </h4>
              <p style={{ fontFamily: "'Mulish', 'Plus Jakarta Sans', sans-serif", fontSize: '1.1rem', color: '#475569', fontWeight: 600 }}>
                Impact
              </p>
            </motion.div>

            {/* Pillar 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -6, scale: 1.04 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.3 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}
            >
              <div style={{ width: '90px', height: '90px', borderRadius: '26px', background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)', border: '1.5px solid #BFDBFE', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', boxShadow: '0 10px 25px rgba(37, 99, 235, 0.12)' }}>
                <Zap size={46} color="#1D4ED8" strokeWidth={2.2} />
              </div>
              <h4 style={{ fontFamily: "'Outfit', 'Mulish', 'Plus Jakarta Sans', sans-serif", fontSize: '1.35rem', fontWeight: 850, color: '#0F172A', marginBottom: '3px' }}>
                100% Digital
              </h4>
              <p style={{ fontFamily: "'Mulish', 'Plus Jakarta Sans', sans-serif", fontSize: '1.1rem', color: '#475569', fontWeight: 600 }}>
                Process
              </p>
            </motion.div>
          </div>

          {/* Description Paragraph */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{
              fontFamily: "'Mulish', 'Inter', 'Plus Jakarta Sans', sans-serif",
              fontSize: '1.3rem',
              color: '#555555',
              fontWeight: 400,
              textAlign: 'center',
              maxWidth: '840px',
              margin: '0 auto 3rem',
              lineHeight: 1.6,
              letterSpacing: '0.3px'
            }}
          >
            Whether it's managing a medical emergency, planning a wedding, or renovating your home, we provide flexible repayment options and competitive personal loan interest rates tailored to your requirements.
          </motion.p>

          {/* Floating Application Bar (Peach / Orange Pill) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{
              background: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)',
              borderRadius: '50px',
              padding: '16px 36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              maxWidth: '820px',
              margin: '0 auto',
              boxShadow: '0 10px 30px rgba(245, 130, 32, 0.15)',
              border: '1px solid rgba(245, 130, 32, 0.2)'
            }}
          >
            <span style={{ fontFamily: "'Mulish', 'Plus Jakarta Sans', sans-serif", fontSize: '1.3rem', fontWeight: 800, color: '#1F2937', letterSpacing: '-0.3px' }}>
              Start your loan application
            </span>
            <Link to="/personal-loan" style={{ textDecoration: 'none' }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: 'linear-gradient(135deg, #F58220 0%, #F47A20 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '50px',
                  padding: '12px 36px',
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(245, 130, 32, 0.35)',
                  fontFamily: "'Mulish', 'Plus Jakarta Sans', sans-serif"
                }}
              >
                Apply now
              </motion.button>
            </Link>
          </motion.div>

        </section>

        {/* Narrative & Philosophy Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="philosophy-banner"
        >
          <div className="philosophy-flex">
            <div className="philosophy-icon-frame">
              <Cpu size={40} className="text-primary" style={{ color: '#6366f1' }} />
            </div>
            <div className="philosophy-content">
              <h3>Why shop for shoes, but settle for personal loans?</h3>
              <p>
                Think about it. When buying a pair of shoes, we compare <span className="highlight-text">10+ brands</span> and check multiple shops just to save a few hundred rupees. But for a life-altering <span className="highlight-text">5-year personal loan commitment</span>, millions just accept the very first offer.
              </p>
              <p style={{ marginTop: '0.5rem', fontSize: '0.95rem', opacity: 0.8 }}>
                Laxmi Credit was engineered to disrupt this. We use deep banking data to scan dozens of actual personal loan institutional policies in milliseconds, ensuring you save lakhs in interest and compounding repayments. Don't just take credit; command it.
              </p>
            </div>
          </div>
        </motion.div>

        {/* MAIN CHOICE BLOCKS */}
        <section className="portal-choices" style={{ justifyContent: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={{ width: '100%', maxWidth: '700px' }}
          >
            <Link to="/personal-loan" className="choice-card" style={{ '--card-accent': '#00d4ff', '--card-glow': 'rgba(0, 212, 255, 0.2)', '--card-glow-rgb': '0, 212, 255', padding: '2.5rem' }}>
              <div className="card-icon-box">
                <UserCircle2 size={36} />
              </div>
              <div className="card-label">Consumer Credit Engine</div>
              <h2 className="card-title" style={{ fontSize: '2rem' }}>Personal Loan Eligibility Checker</h2>
              <p className="card-description" style={{ fontSize: '1.05rem', lineHeight: '1.6' }}>
                Instantly analyze personal loan eligibility across 12+ premium Indian banks (HDFC, ICICI, Axis, Kotak, IDFC, IndusInd, and more). Consolidate high-interest debt through automated Balance Transfer (BT) calculations in milliseconds.
              </p>
              <div className="card-arrow" style={{ fontSize: '1.1rem', marginTop: '1.5rem' }}>
                Launch Personal Loan Engine <ArrowRight size={20} />
              </div>
            </Link>
          </motion.div>
        </section>

        {/* Reviews Section */}
        <section className="portal-section" style={{ background: 'rgba(0,0,0,0.2)' }}>
          <div className="section-header-center">
            <div className="section-tag" style={{ color: '#6366f1', marginBottom: '0.5rem', display: 'inline-block', letterSpacing: '2px', fontWeight: '700' }}>VALIDATION</div>
            <h2 className="section-title">Built on Trust, Driven by Logic</h2>
            <p className="section-subtitle">Real verification pulses from our diverse portfolio of successfully processed clients.</p>
          </div>

          <div className="portal-container" style={{ maxWidth: '800px' }}>
            <div className="testimonials-carousel-container" style={{ border: 'none', background: 'transparent', padding: 0 }}>
              <AnimatePresence mode='wait'>
                <motion.div
                  key={currentTestimonial}
                  className="testimonial-card featured-slide"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="quote-icon" style={{ opacity: 0.3 }}>“</div>
                  <p className="testimonial-text">{testimonials[currentTestimonial].text}</p>
                  <div className="testimonial-footer">
                    <div className="user-profile">
                      <div className="user-avatar" style={{ background: '#6366f1' }}>{testimonials[currentTestimonial].name.charAt(0)}</div>
                      <div className="user-info">
                        <div className="user-name" style={{ color: '#fff' }}>{testimonials[currentTestimonial].name}</div>
                        <div className="user-role">{testimonials[currentTestimonial].role}</div>
                      </div>
                    </div>
                    <div className="testimonial-rating">
                      {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                        <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />
                      ))}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
              
              <div className="carousel-controls" style={{ marginTop: '2rem' }}>
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    className={`carousel-dot ${i === currentTestimonial ? 'active' : ''}`}
                    onClick={() => setCurrentTestimonial(i)}
                    style={{ background: i === currentTestimonial ? '#6366f1' : 'rgba(255,255,255,0.2)' }}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Founder Profile Section */}
        <section className="holo-founder" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="founder-inner">
            <motion.div
              className="founder-img-wrap"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <div className="founder-hex-frame">
                <div className="hex-ring hex-ring-1" style={{ borderColor: '#6366f1' }} />
                <div className="hex-ring hex-ring-2" style={{ borderColor: '#a855f7' }} />
                <img src="/founder.jpg" alt="Dikshant Singh Rathore" className="founder-photo" />
              </div>
              <div className="founder-badge-holo" style={{ background: 'linear-gradient(90deg, #6366f1, #a855f7)' }}>
                <Sparkles size={12} /> LAXMI CREDIT VISIONARY
              </div>
            </motion.div>

            <motion.div
              className="founder-info"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <p className="founder-tag">ARCHITECT & FOUNDER • SINCE 2019</p>
              <h2 className="founder-name">DIKSHANT SINGH RATHORE</h2>

              <div className="founder-metrics">
                <div className="f-metric">
                  <span className="f-metric-val">6+</span>
                  <span className="f-metric-lbl">Years Experience</span>
                </div>
                <div className="f-metric-divider" />
                <div className="f-metric">
                  <span className="f-metric-val">12+</span>
                  <span className="f-metric-lbl">Bank Partners</span>
                </div>
                <div className="f-metric-divider" />
                <div className="f-metric">
                  <span className="f-metric-val">₹50Cr+</span>
                  <span className="f-metric-lbl">Processed</span>
                </div>
              </div>

              <div className="founder-vision-statement">
                <p>
                  "At Laxmi Credit, we're not just digitizing loans; we're architecting a financial revolution.
                  Our mission is to democratize credit access through neural-grade accuracy. We've built an engine
                  that doesn't just calculate—it understands the soul of banking policies."
                </p>
                <p>
                  "This is my vision: a world where complex eligibility is transparent, instant, and accessible to every dreamer.
                  We have created a truly revolutionary platform that bridges the gap between dreams and reality."
                </p>
              </div>

              <div className="founder-social-row">
                <a
                  href="https://instagram.com/dikshant_singh_rathore"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="founder-social"
                  style={{ borderColor: 'rgba(255,255,255,0.2)' }}
                >
                  <Instagram size={16} />
                  @dikshant_singh_rathore
                </a>
                <p className="founder-email" style={{ marginBottom: '15px' }}>
                  <Mail size={16} style={{ marginRight: '8px' }} /> dikshantsingh@laxmicredit.com
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="holo-footer">
          <div className="footer-line" />
          <div className="footer-content">
            <p>© 2026 Laxmi Credit — Engineered by <span className="text-glow">Dikshant Singh Rathore</span></p>
            <p className="footer-sub">Advanced Hybrid Lending Protocols • Unified Architecture</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default MainMasterPortal;
