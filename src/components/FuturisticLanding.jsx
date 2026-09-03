import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, ArrowLeft, ShieldCheck, Zap, Globe, Lock, Instagram, MessageSquare, Send, ChevronDown, Cpu, BarChart3, Fingerprint, Mail, FileText, Building2, FileCheck, Landmark, Scale, MonitorSmartphone, RefreshCw } from 'lucide-react';
import './FuturisticLanding.css';


const FuturisticLanding = ({ onGetStarted, onAdminClick, onBlogClick }) => {
  const [tick, setTick] = useState(0);
  const [feedbackName, setFeedbackName] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isStickyCta, setIsStickyCta] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsStickyCta(true);
      } else {
        setIsStickyCta(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 80);
    return () => clearInterval(interval);
  }, []);

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;

    const newFeedback = {
      id: Date.now().toString(),
      name: feedbackName.trim() || 'Anonymous Customer',
      text: feedbackText.trim(),
      timestamp: new Date().toLocaleString(),
    };

    const existingFeedback = JSON.parse(localStorage.getItem('laxmi_feedback') || '[]');
    localStorage.setItem('laxmi_feedback', JSON.stringify([newFeedback, ...existingFeedback]));

    setIsSubmitted(true);
    setFeedbackName('');
    setFeedbackText('');

    setTimeout(() => setIsSubmitted(false), 5000);
  };

  const stats = [
    { value: '12+', label: 'Partner Banks' },
    { value: '₹50Cr+', label: 'Loans Processed' },
    { value: '6 Yrs', label: 'Industry Experience' },
    { value: '99.8%', label: 'Accuracy Rate' },
  ];

  const features = [
    { icon: <Cpu size={22} />, title: 'Neural Processing', desc: 'AI engine analyzes 200+ eligibility parameters', color: '#00d4ff' },
    { icon: <ShieldCheck size={22} />, title: 'Bank-Grade Security', desc: '256-bit encrypted data transmission', color: '#00ff88' },
    { icon: <BarChart3 size={22} />, title: 'Real-Time Analytics', desc: 'Live comparison across 12+ lenders', color: '#7c3aed' },
    { icon: <Fingerprint size={22} />, title: 'Smart Profiling', desc: 'Personalized offers based on your profile', color: '#ff0080' },
    { icon: <Globe size={22} />, title: 'Universal Access', desc: 'Available 24/7 across all devices', color: '#0080ff' },
    { icon: <Zap size={22} />, title: 'Instant Results', desc: 'Get your eligibility in milliseconds', color: '#f59e0b' },
  ];

  const testimonials = [
    {
      name: "Arjun Mehta",
      role: "Software Engineer",
      text: "I was struggling to find a personal loan with a 710 CIBIL score. This AI directed me to Piramal Finance where I got ₹8L disbursed in 24 hours. The accuracy is 100%!",
      rating: 5
    },
    {
      name: "Priya Sharma",
      role: "Corporate Lead",
      text: "The balance transfer logic saved me ₹4.2 Lakhs on my existing high-interest personal loan. Laxmi AI showed me Kotak's 10.99% offer which I didn't even know existed.",
      rating: 5
    },
    {
      name: "Vikram Malhotra",
      role: "Business Consultant",
      text: "Needed a quick medical emergency loan. The speed of Laxmi AI in comparing 12+ bank policies at once is unbelievable. Got my HDFC 10sec disbursal instantly!",
      rating: 5
    },
    {
      name: "Sneha Reddy",
      role: "Bank Professional",
      text: "Even as a banker, I use this tool to verify current institutional multipliers. It's the most up-to-date policy engine in the Indian market today.",
      rating: 5
    },
    {
      name: "Rohan Das",
      role: "New to Credit",
      text: "I had zero loan history. Laxmi AI identified me as a 'Fresh Category A' profile and helped me secure my first ₹5L loan from ICICI bank without any hassle.",
      rating: 5
    },
    {
      name: "Anjali Gupta",
      role: "Project Manager",
      text: "Transparent, fast, and incredibly accurate. It tells you the rejection reasons before you even apply, saving your CIBIL from unnecessary hard hits.",
      rating: 5
    }
  ];

  return (
    <div className="holo-landing">
      {/* Animated background layers */}
      <div className="holo-bg-base" />
      <div className="holo-grid" />
      <div className="holo-scanline" />
      <div className="holo-orb holo-orb-1" />
      <div className="holo-orb holo-orb-2" />
      <div className="holo-orb holo-orb-3" />

      {/* Data stream lines */}
      <div className="data-streams">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={`data-stream stream-${i + 1}`} />
        ))}
      </div>


      {/* ===== INCRED STYLE HEADER ===== */}
      <header className="holo-header">
        <div className="header-inner-nav">
          <div className="nav-left" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="neural-logo-small" style={{ cursor: 'pointer' }} onClick={() => window.location.href = '/'}>
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
          </div>
        </div>
      </header>

      {/* ===== HERO ===== */}
      <section className="holo-hero" style={{ padding: '10px 20px 0px', maxWidth: '1280px', margin: '0 auto' }}>
        <div className="hero-2col-wrapper" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px', alignItems: 'flex-end' }}>
          
          {/* Left Column: Headline & CTA Button */}
          <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', paddingBottom: '40px' }}>
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="hero-hook-title"
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

            {/* Check loan eligibility button linked to application form page */}
            <div style={{ marginBottom: '1rem', textAlign: 'left', display: 'flex', justifyContent: 'flex-start' }}>
              <motion.button
                className="check-eligibility-btn"
                onClick={onGetStarted}
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
            <span style={{ fontSize: '1.25rem', fontWeight: 100, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", color: '#ffffff', lineHeight: 1.3, letterSpacing: '0.4px' }}>
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
            <span style={{ fontSize: '1.25rem', fontWeight: 100, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", color: '#ffffff', lineHeight: 1.3, letterSpacing: '0.4px' }}>
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
            <span style={{ fontSize: '1.25rem', fontWeight: 100, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", color: '#ffffff', lineHeight: 1.3, letterSpacing: '0.4px' }}>
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
            color: 'rgb(66, 66, 66)',
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

        {/* Subheading (Ultra-thin Hairline Inter font matching InCred screenshot media_1788377725268.png) */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            fontSize: '23px',
            color: '#718096',
            fontWeight: 100,
            fontStyle: 'normal',
            textAlign: 'center',
            maxWidth: '860px',
            margin: '0 auto 3.5rem',
            lineHeight: '34px',
            letterSpacing: '0.4px'
          }}
        >
          Discover your pre approved maximum loan amount and lowest interest rate across 12+ top banks — 100% enquiry-free.
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
          }}
        >
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
            <h4 style={{ fontFamily: "'Outfit', 'Mulish', 'Plus Jakarta Sans', 'Inter', sans-serif", fontSize: '1.35rem', fontWeight: 850, color: '#0F172A', marginBottom: '3px' }}>
              12+ Lenders
            </h4>
            <p style={{ fontFamily: "'Mulish', 'Plus Jakarta Sans', 'Inter', sans-serif", fontSize: '1.1rem', color: '#475569', fontWeight: 600 }}>
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
            <h4 style={{ fontFamily: "'Outfit', 'Mulish', 'Plus Jakarta Sans', 'Inter', sans-serif", fontSize: '1.35rem', fontWeight: 850, color: '#0F172A', marginBottom: '3px' }}>
              Zero CIBIL
            </h4>
            <p style={{ fontFamily: "'Mulish', 'Plus Jakarta Sans', 'Inter', sans-serif", fontSize: '1.1rem', color: '#475569', fontWeight: 600 }}>
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
            <h4 style={{ fontFamily: "'Outfit', 'Mulish', 'Plus Jakarta Sans', 'Inter', sans-serif", fontSize: '1.35rem', fontWeight: 850, color: '#0F172A', marginBottom: '3px' }}>
              100% Digital
            </h4>
            <p style={{ fontFamily: "'Mulish', 'Plus Jakarta Sans', 'Inter', sans-serif", fontSize: '1.1rem', color: '#475569', fontWeight: 600 }}>
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
            fontSize: '1.25rem',
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

      {/* Steps to Apply Section (InCred Style Exact Grid) */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        style={{ marginTop: '5rem', marginBottom: '4rem' }}
      >
        {/* Section Title */}
        <h2 
          style={{
            fontFamily: "'Outfit', 'Plus Jakarta Sans', 'Inter', sans-serif",
            fontStyle: 'normal',
            fontWeight: 750,
            fontSize: '43px',
            lineHeight: '54px',
            color: 'rgb(66, 66, 66)',
            textAlign: 'center',
            marginBottom: '0px',
            letterSpacing: '-0.6px'
          }}
        >
          Steps to Check Loan Eligibility & Compare Offers
        </h2>

        {/* Small Orange Underline (Single centered line exact as InCred) */}
        <div 
          style={{ 
            width: '32px', 
            height: '3px', 
            background: '#F58220', 
            margin: '10px auto 36px', 
            borderRadius: '2px' 
          }} 
        />

        {/* 6 Steps Grid (3x2) */}
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '24px', 
            maxWidth: '1200px', 
            margin: '0 auto' 
          }}
        >
          {/* Step 1 */}
          <motion.div 
            whileHover={{ y: -3 }}
            transition={{ duration: 0.2 }}
            style={{
              background: '#ffffff',
              border: '1px solid #EAEFF5',
              borderRadius: '16px',
              padding: '24px 20px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)'
            }}
          >
            <span 
              style={{ 
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", 
                fontSize: '4.5rem', 
                fontWeight: 700, 
                background: 'linear-gradient(135deg, #F58220 0%, #2563EB 60%, #1E40AF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                lineHeight: 1,
                minWidth: '40px',
                display: 'inline-block'
              }}
            >
              1
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <h4 
                style={{ 
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", 
                  fontSize: '1.02rem', 
                  color: '#1E293B', 
                  fontWeight: 700,
                  margin: 0,
                  lineHeight: 1.3
                }}
              >
                Enter Your Basic Details
              </h4>
              <p 
                style={{ 
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", 
                  fontSize: '0.88rem', 
                  color: '#4B5563', 
                  fontWeight: 400,
                  lineHeight: 1.45,
                  margin: 0
                }}
              >
                Provide your name, mobile number, city, age, and employment type.
              </p>
            </div>
          </motion.div>

          {/* Step 2 */}
          <motion.div 
            whileHover={{ y: -3 }}
            transition={{ duration: 0.2 }}
            style={{
              background: '#ffffff',
              border: '1px solid #EAEFF5',
              borderRadius: '16px',
              padding: '24px 20px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)'
            }}
          >
            <span 
              style={{ 
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", 
                fontSize: '4.5rem', 
                fontWeight: 700, 
                background: 'linear-gradient(135deg, #F58220 0%, #2563EB 60%, #1E40AF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                lineHeight: 1,
                minWidth: '40px',
                display: 'inline-block'
              }}
            >
              2
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <h4 
                style={{ 
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", 
                  fontSize: '1.02rem', 
                  color: '#1E293B', 
                  fontWeight: 700,
                  margin: 0,
                  lineHeight: 1.3
                }}
              >
                Add Income & Financial Information
              </h4>
              <p 
                style={{ 
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", 
                  fontSize: '0.88rem', 
                  color: '#4B5563', 
                  fontWeight: 400,
                  lineHeight: 1.45,
                  margin: 0
                }}
              >
                Enter salary/business income, bank transfer mode, incentives, and other income details.
              </p>
            </div>
          </motion.div>

          {/* Step 3 */}
          <motion.div 
            whileHover={{ y: -3 }}
            transition={{ duration: 0.2 }}
            style={{
              background: '#ffffff',
              border: '1px solid #EAEFF5',
              borderRadius: '16px',
              padding: '24px 20px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)'
            }}
          >
            <span 
              style={{ 
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", 
                fontSize: '4.5rem', 
                fontWeight: 700, 
                background: 'linear-gradient(135deg, #F58220 0%, #2563EB 60%, #1E40AF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                lineHeight: 1,
                minWidth: '40px',
                display: 'inline-block'
              }}
            >
              3
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <h4 
                style={{ 
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", 
                  fontSize: '1.02rem', 
                  color: '#1E293B', 
                  fontWeight: 700,
                  margin: 0,
                  lineHeight: 1.3
                }}
              >
                Declare Existing Loan Obligations
              </h4>
              <p 
                style={{ 
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", 
                  fontSize: '0.88rem', 
                  color: '#4B5563', 
                  fontWeight: 400,
                  lineHeight: 1.45,
                  margin: 0
                }}
              >
                Add running EMIs, credit card dues, and other financial commitments.
              </p>
            </div>
          </motion.div>

          {/* Step 4 */}
          <motion.div 
            whileHover={{ y: -3 }}
            transition={{ duration: 0.2 }}
            style={{
              background: '#ffffff',
              border: '1px solid #EAEFF5',
              borderRadius: '16px',
              padding: '24px 20px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)'
            }}
          >
            <span 
              style={{ 
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", 
                fontSize: '4.5rem', 
                fontWeight: 700, 
                background: 'linear-gradient(135deg, #F58220 0%, #2563EB 60%, #1E40AF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                lineHeight: 1,
                minWidth: '40px',
                display: 'inline-block'
              }}
            >
              4
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <h4 
                style={{ 
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", 
                  fontSize: '1.02rem', 
                  color: '#1E293B', 
                  fontWeight: 700,
                  margin: 0,
                  lineHeight: 1.3
                }}
              >
                AI Eligibility Engine Analyzes Your Profile
              </h4>
              <p 
                style={{ 
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", 
                  fontSize: '0.88rem', 
                  color: '#4B5563', 
                  fontWeight: 400,
                  lineHeight: 1.45,
                  margin: 0
                }}
              >
                Our engine evaluates your profile against multiple bank and NBFC policies instantly.
              </p>
            </div>
          </motion.div>

          {/* Step 5 */}
          <motion.div 
            whileHover={{ y: -3 }}
            transition={{ duration: 0.2 }}
            style={{
              background: '#ffffff',
              border: '1px solid #EAEFF5',
              borderRadius: '16px',
              padding: '24px 20px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)'
            }}
          >
            <span 
              style={{ 
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", 
                fontSize: '4.5rem', 
                fontWeight: 700, 
                background: 'linear-gradient(135deg, #F58220 0%, #2563EB 60%, #1E40AF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                lineHeight: 1,
                minWidth: '40px',
                display: 'inline-block'
              }}
            >
              5
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <h4 
                style={{ 
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", 
                  fontSize: '1.02rem', 
                  color: '#1E293B', 
                  fontWeight: 700,
                  margin: 0,
                  lineHeight: 1.3
                }}
              >
                Compare Eligible Loan Offers
              </h4>
              <p 
                style={{ 
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", 
                  fontSize: '0.88rem', 
                  color: '#4B5563', 
                  fontWeight: 400,
                  lineHeight: 1.45,
                  margin: 0
                }}
              >
                View maximum eligible amount, ROI, EMI, tenure, and approval probability across lenders side-by-side.
              </p>
            </div>
          </motion.div>

          {/* Step 6 */}
          <motion.div 
            whileHover={{ y: -3 }}
            transition={{ duration: 0.2 }}
            style={{
              background: '#ffffff',
              border: '1px solid #EAEFF5',
              borderRadius: '16px',
              padding: '24px 20px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)'
            }}
          >
            <span 
              style={{ 
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", 
                fontSize: '4.5rem', 
                fontWeight: 700, 
                background: 'linear-gradient(135deg, #F58220 0%, #2563EB 60%, #1E40AF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                lineHeight: 1,
                minWidth: '40px',
                display: 'inline-block'
              }}
            >
              6
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <h4 
                style={{ 
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", 
                  fontSize: '1.02rem', 
                  color: '#1E293B', 
                  fontWeight: 700,
                  margin: 0,
                  lineHeight: 1.3
                }}
              >
                Select the Best Offer & Apply
              </h4>
              <p 
                style={{ 
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", 
                  fontSize: '0.88rem', 
                  color: '#4B5563', 
                  fontWeight: 400,
                  lineHeight: 1.45,
                  margin: 0
                }}
              >
                Choose the most suitable bank/NBFC and connect with a loan expert to complete the application process.
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>

        {/* Full-Width InCred-Style Fixed Sliding Sticky Bottom Bar */}
        <AnimatePresence>
          {isStickyCta && (
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                width: '100%',
                zIndex: 1000,
                background: '#FFF0E5',
                padding: '10px 20px',
                borderTop: '1px solid #FFE0D1',
                boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: '20px',
                  maxWidth: '1200px',
                  width: '100%'
                }}
              >
                <span 
                  style={{ 
                    fontFamily: "'Mulish', 'Inter', 'Plus Jakarta Sans', sans-serif", 
                    fontSize: '1.25rem', 
                    fontWeight: 700, 
                    color: '#4A5568', 
                    letterSpacing: '-0.2px' 
                  }}
                >
                  Start your loan application
                </span>
                <motion.button
                  onClick={onGetStarted}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  style={{
                    background: '#F58220',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '50px',
                    padding: '8px 28px',
                    fontSize: '1.05rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(245, 130, 32, 0.35)',
                    fontFamily: "'Mulish', 'Plus Jakarta Sans', sans-serif"
                  }}
                >
                  Apply now
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ===== FEATURES GRID ===== */}
      <section className="holo-features">
        <div className="section-header">
          <div className="section-tag">CAPABILITIES</div>
          <h2>Powered by Advanced <span className="gradient-text-ai">Neural Intelligence</span></h2>
          <p>Every calculation is backed by real-time data from 12+ banking APIs</p>
        </div>

        <div className="features-grid">
          {features.map((f, i) => (
            <motion.div
              key={i}
              className="feature-holo-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              style={{ '--card-color': f.color }}
            >
              <div className="fhc-icon" style={{ color: f.color, background: `${f.color}15`, border: `1px solid ${f.color}30` }}>
                {f.icon}
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
              <div className="fhc-glow" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== TESTIMONIALS SECTION ===== */}
      <section className="holo-testimonials">
        <div className="section-header">
          <div className="section-tag">SUCCESS PULSES</div>
          <h2>Verified <span className="gradient-text-ai">User Experiences</span></h2>
          <p>Real-time feedback from our latest neural processing cycles</p>
        </div>

        <div className="testimonials-carousel-container">
          <AnimatePresence mode='wait'>
            <motion.div
              key={currentTestimonial}
              className="testimonial-card featured-slide"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <div className="quote-icon">“</div>
              <p className="testimonial-text">{testimonials[currentTestimonial].text}</p>
              <div className="testimonial-footer">
                <div className="user-profile">
                  <div className="user-avatar">{testimonials[currentTestimonial].name.charAt(0)}</div>
                  <div className="user-info">
                    <div className="user-name">{testimonials[currentTestimonial].name}</div>
                    <div className="user-role">{testimonials[currentTestimonial].role}</div>
                  </div>
                </div>
                <div className="testimonial-rating">
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <Sparkles key={i} size={12} color="#f59e0b" fill="#f59e0b" />
                  ))}
                </div>
              </div>
              <div className="card-neural-lines" />
            </motion.div>
          </AnimatePresence>

          <div className="carousel-controls">
            {testimonials.map((_, i) => (
              <button
                key={i}
                className={`carousel-dot ${i === currentTestimonial ? 'active' : ''}`}
                onClick={() => setCurrentTestimonial(i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ===== FOUNDER SECTION ===== */}
      <section className="holo-founder">
        <div className="founder-inner">
          <motion.div
            className="founder-img-wrap"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="founder-hex-frame">
              <div className="hex-ring hex-ring-1" />
              <div className="hex-ring hex-ring-2" />
              <img src="./founder.jpg" alt="Dikshant Singh Rathore" className="founder-photo" />
            </div>
            <div className="founder-badge-holo">
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
                We have created a truly revolutionary platform that bridges the gap between dreams and reality,
                and we are only just beginning to rewrite the rules of the industry."
              </p>
            </div>

            <div className="founder-social-row">
              <a
                href="https://instagram.com/dikshant_singh_rathore"
                target="_blank"
                rel="noopener noreferrer"
                className="founder-social"
              >
                <Instagram size={16} />
                @dikshant_singh_rathore
              </a>
              <p className="founder-email" style={{ marginBottom: '15px' }}>
                <Mail size={16} /> dikshantsingh@laxmicredit.com
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== SUGGESTION BOX ===== */}
      <section className="holo-suggestion">
        <motion.div
          className="suggestion-panel glass-card"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="suggestion-left">
            <div className="sug-icon"><MessageSquare size={24} color="#00d4ff" /></div>
            <div>
              <h3>Help Us Improve</h3>
              <p>Your feedback shapes the future of this AI</p>
            </div>
          </div>
          <form className="suggestion-form" onSubmit={handleFeedbackSubmit}>
            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="feedback-success"
              >
                <Zap size={16} color="#00ff88" />
                <span>Neural Pulse Received. Thank you for the insight!</span>
              </motion.div>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Your Name (Optional)"
                  className="glass-input"
                  value={feedbackName}
                  onChange={(e) => setFeedbackName(e.target.value)}
                />
                <textarea
                  placeholder="Share your suggestions or report an issue..."
                  className="glass-input"
                  rows="2"
                  required
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                />
                <button type="submit" className="btn-primary-ai">
                  <Send size={14} /> Send Feedback
                </button>
              </>
            )}
          </form>
        </motion.div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="holo-footer">
        <div className="footer-line" />
        <div className="footer-content">
          <p>© 2026 Laxmi Omni Architect — Engineered by <span className="text-glow">Dikshant Singh Rathore</span></p>
          <p className="footer-sub">Universal Polymath Core • Synchronized Messaging • 256-bit Encryption</p>
        </div>
      </footer>

      {/* Neural AI Chatbot */}
    </div>
  );
};

export default FuturisticLanding;
