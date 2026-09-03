import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, ArrowLeft, ShieldCheck, Zap, Globe, Lock, Instagram, MessageSquare, Send, ChevronDown, Cpu, BarChart3, Fingerprint, Mail, FileText, Building2, FileCheck, Landmark, Scale, MonitorSmartphone, RefreshCw, Clock, Home, IndianRupee, Briefcase, UserCircle2 } from 'lucide-react';
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
      <section className="incred-value-props-section" style={{ padding: '60px 20px 10px', maxWidth: '1280px', margin: '0 auto' }}>
        
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
              alignItems: 'center',
              gap: '18px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)'
            }}
          >
            <span 
              style={{ 
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", 
                fontSize: '5.2rem', 
                fontWeight: 700, 
                background: 'linear-gradient(135deg, #F58220 0%, #2563EB 60%, #1E40AF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                lineHeight: 1.05,
                minWidth: '55px',
                padding: '2px 4px 6px 0',
                display: 'inline-block',
                flexShrink: 0
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
              alignItems: 'center',
              gap: '18px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)'
            }}
          >
            <span 
              style={{ 
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", 
                fontSize: '5.2rem', 
                fontWeight: 700, 
                background: 'linear-gradient(135deg, #F58220 0%, #2563EB 60%, #1E40AF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                lineHeight: 1.05,
                minWidth: '55px',
                padding: '2px 4px 6px 0',
                display: 'inline-block',
                flexShrink: 0
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
              alignItems: 'center',
              gap: '18px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)'
            }}
          >
            <span 
              style={{ 
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", 
                fontSize: '5.2rem', 
                fontWeight: 700, 
                background: 'linear-gradient(135deg, #F58220 0%, #2563EB 60%, #1E40AF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                lineHeight: 1.05,
                minWidth: '55px',
                padding: '2px 4px 6px 0',
                display: 'inline-block',
                flexShrink: 0
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
              alignItems: 'center',
              gap: '18px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)'
            }}
          >
            <span 
              style={{ 
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", 
                fontSize: '5.2rem', 
                fontWeight: 700, 
                background: 'linear-gradient(135deg, #F58220 0%, #2563EB 60%, #1E40AF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                lineHeight: 1.05,
                minWidth: '55px',
                padding: '2px 4px 6px 0',
                display: 'inline-block',
                flexShrink: 0
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
              alignItems: 'center',
              gap: '18px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)'
            }}
          >
            <span 
              style={{ 
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", 
                fontSize: '5.2rem', 
                fontWeight: 700, 
                background: 'linear-gradient(135deg, #F58220 0%, #2563EB 60%, #1E40AF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                lineHeight: 1.05,
                minWidth: '55px',
                padding: '2px 4px 6px 0',
                display: 'inline-block',
                flexShrink: 0
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
              alignItems: 'center',
              gap: '18px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)'
            }}
          >
            <span 
              style={{ 
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", 
                fontSize: '5.2rem', 
                fontWeight: 700, 
                background: 'linear-gradient(135deg, #F58220 0%, #2563EB 60%, #1E40AF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                lineHeight: 1.05,
                minWidth: '55px',
                padding: '2px 4px 6px 0',
                display: 'inline-block',
                flexShrink: 0
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

      {/* ===== FEATURES & BENEFITS SECTION ===== */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        style={{ marginTop: '4.5rem', marginBottom: '0.8rem' }}
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
          Features & <span style={{ color: '#F58220' }}>Benefits</span>
        </h2>

        {/* Small Orange Underline */}
        <div 
          style={{ 
            width: '36px', 
            height: '3.5px', 
            background: '#F58220', 
            margin: '10px auto 44px', 
            borderRadius: '2px' 
          }} 
        />

        {/* Row 1: 3 Cards */}
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
            gap: '24px', 
            maxWidth: '1200px', 
            margin: '0 auto 24px' 
          }}
        >
          {/* Card 1: Compare 12+ Bank Policies */}
          <motion.div
            whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(0, 0, 0, 0.05)' }}
            transition={{ duration: 0.2 }}
            style={{
              background: '#ffffff',
              border: '1px solid #EAEFF5',
              borderRadius: '16px',
              padding: '28px 24px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div 
                style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '12px', 
                  background: '#DCFCE7', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: '#16A34A', 
                  flexShrink: 0 
                }}
              >
                <Landmark size={24} strokeWidth={2.4} />
              </div>
              <h3 
                style={{ 
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", 
                  fontSize: '1.18rem', 
                  fontWeight: 700, 
                  color: '#1E293B', 
                  margin: 0,
                  lineHeight: 1.3
                }}
              >
                Compare 12+ Bank Policies
              </h3>
            </div>
            <p 
              style={{ 
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", 
                fontSize: '0.92rem', 
                color: '#4B5563', 
                fontWeight: 400, 
                lineHeight: 1.55, 
                margin: 0 
              }}
            >
              Compare lending criteria across 12+ top banks to secure your lowest interest rate instantly.
            </p>
          </motion.div>

          {/* Card 2: Discover Pre-Approved Loans */}
          <motion.div
            whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(0, 0, 0, 0.05)' }}
            transition={{ duration: 0.2 }}
            style={{
              background: '#ffffff',
              border: '1px solid #EAEFF5',
              borderRadius: '16px',
              padding: '28px 24px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div 
                style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '12px', 
                  background: '#E0F2FE', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: '#0284C7', 
                  flexShrink: 0 
                }}
              >
                <Sparkles size={24} strokeWidth={2.4} />
              </div>
              <h3 
                style={{ 
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", 
                  fontSize: '1.18rem', 
                  fontWeight: 700, 
                  color: '#1E293B', 
                  margin: 0,
                  lineHeight: 1.3
                }}
              >
                Discover Pre-Approved Loans
              </h3>
            </div>
            <p 
              style={{ 
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", 
                fontSize: '0.92rem', 
                color: '#4B5563', 
                fontWeight: 400, 
                lineHeight: 1.55, 
                margin: 0 
              }}
            >
              Unlock eligible pre-approved loan offers tailored to your profile with zero guesswork.
            </p>
          </motion.div>

          {/* Card 3: Zero CIBIL Score Impact */}
          <motion.div
            whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(0, 0, 0, 0.05)' }}
            transition={{ duration: 0.2 }}
            style={{
              background: '#ffffff',
              border: '1px solid #EAEFF5',
              borderRadius: '16px',
              padding: '28px 24px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div 
                style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '12px', 
                  background: '#FFEDD5', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: '#EA580C', 
                  flexShrink: 0 
                }}
              >
                <ShieldCheck size={24} strokeWidth={2.4} />
              </div>
              <h3 
                style={{ 
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", 
                  fontSize: '1.18rem', 
                  fontWeight: 700, 
                  color: '#1E293B', 
                  margin: 0,
                  lineHeight: 1.3
                }}
              >
                Zero CIBIL Score Impact
              </h3>
            </div>
            <p 
              style={{ 
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", 
                fontSize: '0.92rem', 
                color: '#4B5563', 
                fontWeight: 400, 
                lineHeight: 1.55, 
                margin: 0 
              }}
            >
              Check and compare your eligibility safely across all lenders with 100% soft inquiries.
            </p>
          </motion.div>
        </div>

        {/* Row 2: 2 Cards Centered */}
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
            gap: '24px', 
            maxWidth: '800px', 
            margin: '0 auto' 
          }}
        >
          {/* Card 4: Smart Balance Transfer */}
          <motion.div
            whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(0, 0, 0, 0.05)' }}
            transition={{ duration: 0.2 }}
            style={{
              background: '#ffffff',
              border: '1px solid #EAEFF5',
              borderRadius: '16px',
              padding: '28px 24px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div 
                style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '12px', 
                  background: '#EFF6FF', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: '#2563EB', 
                  flexShrink: 0 
                }}
              >
                <RefreshCw size={24} strokeWidth={2.4} />
              </div>
              <h3 
                style={{ 
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", 
                  fontSize: '1.18rem', 
                  fontWeight: 700, 
                  color: '#1E293B', 
                  margin: 0,
                  lineHeight: 1.3
                }}
              >
                Smart Balance Transfer
              </h3>
            </div>
            <p 
              style={{ 
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", 
                fontSize: '0.92rem', 
                color: '#4B5563', 
                fontWeight: 400, 
                lineHeight: 1.55, 
                margin: 0 
              }}
            >
              Consolidate running debts and credit card dues into a single, lower-interest EMI.
            </p>
          </motion.div>

          {/* Card 5: Dedicated Expert Assistance */}
          <motion.div
            whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(0, 0, 0, 0.05)' }}
            transition={{ duration: 0.2 }}
            style={{
              background: '#ffffff',
              border: '1px solid #EAEFF5',
              borderRadius: '16px',
              padding: '28px 24px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div 
                style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '12px', 
                  background: '#F1F5F9', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: '#475569', 
                  flexShrink: 0 
                }}
              >
                <UserCircle2 size={24} strokeWidth={2.4} />
              </div>
              <h3 
                style={{ 
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", 
                  fontSize: '1.18rem', 
                  fontWeight: 700, 
                  color: '#1E293B', 
                  margin: 0,
                  lineHeight: 1.3
                }}
              >
                Dedicated Expert Assistance
              </h3>
            </div>
            <p 
              style={{ 
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", 
                fontSize: '0.92rem', 
                color: '#4B5563', 
                fontWeight: 400, 
                lineHeight: 1.55, 
                margin: 0 
              }}
            >
              Get 1-on-1 advisor guidance from bank selection straight through to account disbursal.
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* ===== ELIGIBILITY CRITERIA & DOCUMENTATION SECTION ===== */}
      <section 
        className="eligibility-docs-section"
        style={{ 
          padding: '12px 24px 70px', 
          maxWidth: '1240px', 
          margin: '0 auto', 
          width: '100%' 
        }}
      >
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '46px' }}>
          <h2 
            style={{ 
              fontFamily: 'Outfit, "Plus Jakarta Sans", Inter, sans-serif', 
              fontSize: 'clamp(28px, 4vw, 43px)', 
              fontWeight: 750, 
              color: 'rgb(66, 66, 66)', 
              lineHeight: '54px', 
              margin: 0,
              letterSpacing: '-0.5px'
            }}
          >
            Eligibility Criteria & Documentation
          </h2>
          <div 
            style={{ 
              width: '42px', 
              height: '3.5px', 
              backgroundColor: '#F58220', 
              borderRadius: '2px', 
              margin: '14px auto 0' 
            }} 
          />
        </div>

        {/* 2-Card Grid */}
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', 
            gap: '32px', 
            maxWidth: '1200px', 
            margin: '0 auto' 
          }}
        >
          {/* Left Card: Personal Loan eligibility */}
          <motion.div
            whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(147, 51, 234, 0.08)' }}
            transition={{ duration: 0.2 }}
            style={{
              background: '#FAF5FF',
              border: '1px solid #F3E8FF',
              borderRadius: '24px',
              padding: '36px 32px',
              boxShadow: '0 4px 16px rgba(147, 51, 234, 0.03)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Header with Title + Subtitle + Icon */}
            <div 
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start', 
                gap: '18px',
                marginBottom: '26px' 
              }}
            >
              <div>
                <h3 
                  style={{ 
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", 
                    fontSize: '1.35rem', 
                    fontWeight: 700, 
                    color: '#1E293B', 
                    margin: '0 0 8px 0' 
                  }}
                >
                  Personal Loan eligibility
                </h3>
                <p 
                  style={{ 
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", 
                    fontSize: '0.94rem', 
                    color: '#64748B', 
                    lineHeight: 1.55, 
                    margin: 0,
                    maxWidth: '320px'
                  }}
                >
                  To qualify for a personal loan with us, please ensure you meet the following criteria
                </p>
              </div>
              
              {/* Blue Document Badge Icon */}
              <div 
                style={{ 
                  width: '64px', 
                  height: '64px', 
                  borderRadius: '50%', 
                  background: '#ffffff', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  boxShadow: '0 4px 14px rgba(147, 51, 234, 0.08)',
                  flexShrink: 0 
                }}
              >
                <svg width="34" height="40" viewBox="0 0 48 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="38" height="50" rx="6" fill="#0EA5E9" />
                  <rect x="7" y="10" width="24" height="3" rx="1.5" fill="#ffffff" />
                  <rect x="7" y="17" width="24" height="3" rx="1.5" fill="#ffffff" />
                  <rect x="7" y="24" width="24" height="3" rx="1.5" fill="#ffffff" />
                  <rect x="7" y="31" width="16" height="3" rx="1.5" fill="#ffffff" />
                  <rect x="7" y="38" width="12" height="3" rx="1.5" fill="#ffffff" />
                  <circle cx="36" cy="40" r="9" fill="#F58220" />
                  <path d="M33 40L35.2 42.2L39.2 37.8" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            {/* Criteria Item Boxes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <motion.div 
                whileHover={{ scale: 1.01, backgroundColor: '#ffffff' }}
                style={{
                  background: 'rgba(255, 255, 255, 0.75)',
                  border: '1px solid #E9D5FF',
                  borderRadius: '12px',
                  padding: '14px 20px',
                  fontSize: '0.96rem',
                  fontWeight: 500,
                  color: '#334155',
                  fontFamily: "'Inter', sans-serif",
                  transition: 'all 0.2s ease'
                }}
              >
                Age from 21 to 60 years
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.01, backgroundColor: '#ffffff' }}
                style={{
                  background: 'rgba(255, 255, 255, 0.75)',
                  border: '1px solid #E9D5FF',
                  borderRadius: '12px',
                  padding: '14px 20px',
                  fontSize: '0.96rem',
                  fontWeight: 500,
                  color: '#334155',
                  fontFamily: "'Inter', sans-serif",
                  transition: 'all 0.2s ease'
                }}
              >
                Both self-employed and salaried individuals can apply
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.01, backgroundColor: '#ffffff' }}
                style={{
                  background: 'rgba(255, 255, 255, 0.75)',
                  border: '1px solid #E9D5FF',
                  borderRadius: '12px',
                  padding: '14px 20px',
                  fontSize: '0.96rem',
                  fontWeight: 500,
                  color: '#334155',
                  fontFamily: "'Inter', sans-serif",
                  transition: 'all 0.2s ease'
                }}
              >
                Minimum net monthly income of Rs. 15,000
              </motion.div>
            </div>
          </motion.div>

          {/* Right Card: Documents required */}
          <motion.div
            whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(22, 163, 74, 0.08)' }}
            transition={{ duration: 0.2 }}
            style={{
              background: '#F0FDF4',
              border: '1px solid #DCFCE7',
              borderRadius: '24px',
              padding: '36px 32px',
              boxShadow: '0 4px 16px rgba(22, 163, 74, 0.03)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Header with Title + Subtitle + Icon */}
            <div 
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start', 
                gap: '18px',
                marginBottom: '26px' 
              }}
            >
              <div>
                <h3 
                  style={{ 
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", 
                    fontSize: '1.35rem', 
                    fontWeight: 700, 
                    color: '#1E293B', 
                    margin: '0 0 8px 0' 
                  }}
                >
                  Documents required
                </h3>
                <p 
                  style={{ 
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", 
                    fontSize: '0.94rem', 
                    color: '#64748B', 
                    lineHeight: 1.55, 
                    margin: 0,
                    maxWidth: '320px'
                  }}
                >
                  When you apply for a personal loan, you will need to provide the following documents
                </p>
              </div>
              
              {/* Yellow Folder with Blue Document Badge Icon */}
              <div 
                style={{ 
                  width: '64px', 
                  height: '64px', 
                  borderRadius: '50%', 
                  background: '#ffffff', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  boxShadow: '0 4px 14px rgba(22, 163, 74, 0.08)',
                  flexShrink: 0 
                }}
              >
                <svg width="40" height="38" viewBox="0 0 54 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="14" y="5" width="28" height="32" rx="4" fill="#0284C7" />
                  <rect x="19" y="11" width="18" height="2.5" rx="1.2" fill="#ffffff" />
                  <rect x="19" y="16" width="18" height="2.5" rx="1.2" fill="#ffffff" />
                  <rect x="19" y="21" width="12" height="2.5" rx="1.2" fill="#ffffff" />
                  <path d="M4 17C4 14.7909 5.79086 13 8 13H18L23 19H46C48.2091 19 50 20.7909 50 23V42C50 44.2091 48.2091 46 46 46H8C5.79086 46 4 44.2091 4 42V17Z" fill="#FBBF24" />
                  <path d="M4 22C4 20.3431 5.34315 19 7 19H47C48.6569 19 50 20.3431 50 22V42C50 44.2091 48.2091 46 46 46H8C5.79086 46 4 44.2091 4 42V22Z" fill="#FCD34D" />
                </svg>
              </div>
            </div>

            {/* Document Item Boxes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <motion.div 
                whileHover={{ scale: 1.01, backgroundColor: '#ffffff' }}
                style={{
                  background: 'rgba(255, 255, 255, 0.75)',
                  border: '1px solid #86EFAC',
                  borderRadius: '12px',
                  padding: '14px 20px',
                  fontSize: '0.96rem',
                  fontWeight: 500,
                  color: '#334155',
                  fontFamily: "'Inter', sans-serif",
                  transition: 'all 0.2s ease'
                }}
              >
                PAN Card
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.01, backgroundColor: '#ffffff' }}
                style={{
                  background: 'rgba(255, 255, 255, 0.75)',
                  border: '1px solid #86EFAC',
                  borderRadius: '12px',
                  padding: '14px 20px',
                  fontSize: '0.96rem',
                  fontWeight: 500,
                  color: '#334155',
                  fontFamily: "'Inter', sans-serif",
                  transition: 'all 0.2s ease'
                }}
              >
                Last three month's bank statements
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.01, backgroundColor: '#ffffff' }}
                style={{
                  background: 'rgba(255, 255, 255, 0.75)',
                  border: '1px solid #86EFAC',
                  borderRadius: '12px',
                  padding: '14px 20px',
                  fontSize: '0.96rem',
                  fontWeight: 500,
                  color: '#334155',
                  fontFamily: "'Inter', sans-serif",
                  transition: 'all 0.2s ease'
                }}
              >
                Aadhaar Card
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

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
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"', 
                    fontStyle: 'normal',
                    fontWeight: 550, 
                    color: 'rgb(98, 98, 98)', 
                    fontSize: '28px',
                    lineHeight: '40px'
                  }}
                >
                  Compare your loan eligibility
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
                    padding: '10px 30px',
                    fontSize: '18px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(245, 130, 32, 0.35)',
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    letterSpacing: '0.2px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    lineHeight: '24px'
                  }}
                >
                  Check now
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
