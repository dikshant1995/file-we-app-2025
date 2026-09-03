import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, ShieldCheck, Briefcase, UserCircle2, ArrowRight, Sparkles, Instagram, Mail, MessageSquare, Send, Star, Lock, FileCheck, Landmark, Scale, MonitorSmartphone, RefreshCw, FileText, Building2, Zap, Clock, Home, IndianRupee } from 'lucide-react';
import { Link } from 'react-router-dom';
import './MainMasterPortal.css';
import './FuturisticLanding.css'; // Reuse components styled earlier like founder and testimonials
import eligibilityDocIcon from '../assets/eligibility-doc-icon.png';
import documentsFolderIcon from '../assets/documents-folder-icon.png';
import PersonalLoanEmiCalculator from './PersonalLoanEmiCalculator';
import CustomerSuccessStories from './CustomerSuccessStories';
import PortalFaqSection from './PortalFaqSection';
import PortalFooter from './PortalFooter';

const MainMasterPortal = ({ onAdminClick }) => {
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
                    <span style={{ 
                      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
                      fontSize: '18px', 
                      fontWeight: 750, 
                      color: 'rgb(255, 255, 255)',
                      lineHeight: 'normal',
                      letterSpacing: '0.2px' 
                    }}>
                      Check loan eligibility
                    </span>
                    <span style={{ 
                      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
                      fontSize: '13px', 
                      fontWeight: 500, 
                      color: 'rgba(255, 255, 255, 0.95)', 
                      marginTop: '3px' 
                    }}>
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
              <span style={{ 
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
                fontSize: '18px', 
                fontWeight: 400, 
                color: 'rgb(255, 255, 255)', 
                lineHeight: '26px' 
              }}>
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
              <span style={{ 
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
                fontSize: '18px', 
                fontWeight: 400, 
                color: 'rgb(255, 255, 255)', 
                lineHeight: '26px' 
              }}>
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
              <span style={{ 
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
                fontSize: '18px', 
                fontWeight: 400, 
                color: 'rgb(255, 255, 255)', 
                lineHeight: '26px' 
              }}>
                Comparison of 12 Banks in One Minute
              </span>
            </div>
          </motion.div>

        {/* ===== VALUE PROPOSITION SECTION (InCred Style) ===== */}
        <section className="incred-value-props-section" style={{ padding: '60px 20px 0px', maxWidth: '1280px', margin: '0 auto' }}>
          
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
            style={{ marginTop: '5rem', marginBottom: '0px' }}
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

        </section>

        {/* ===== ELIGIBILITY CRITERIA & DOCUMENTATION SECTION ===== */}
        <section 
          className="eligibility-docs-section"
          style={{ 
            padding: '5rem 24px 10px', 
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
              whileHover={{ y: -4, boxShadow: '0 16px 36px rgba(168, 85, 247, 0.12)' }}
              transition={{ duration: 0.2 }}
              style={{
                background: '#F6F0FD',
                borderRadius: '24px',
                padding: '38px 32px 34px',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 2px 12px rgba(168, 85, 247, 0.04)'
              }}
            >
              {/* Top-Right Corner White Backdrop for Icon (Exact InCred flush design) */}
              <div 
                style={{ 
                  position: 'absolute', 
                  top: 0, 
                  right: 0, 
                  width: '135px', 
                  height: '135px', 
                  borderBottomLeftRadius: '120px',
                  borderTopRightRadius: '24px',
                  background: '#ffffff', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  paddingBottom: '10px',
                  paddingLeft: '10px',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)'
                }}
              >
                <img 
                  src={eligibilityDocIcon} 
                  alt="Personal Loan eligibility" 
                  style={{ 
                    width: '64px', 
                    height: '70px', 
                    objectFit: 'contain',
                    display: 'block'
                  }} 
                />
              </div>

              {/* Title & Subtitle */}
              <h3 
                style={{ 
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", 
                  fontSize: '1.5rem', 
                  fontWeight: 700, 
                  color: '#1F2937', 
                  margin: '0 0 10px 0',
                  letterSpacing: '-0.3px',
                  position: 'relative',
                  zIndex: 2
                }}
              >
                Personal Loan eligibility
              </h3>
              <p 
                style={{ 
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", 
                  fontSize: '0.96rem', 
                  color: '#4B5563', 
                  lineHeight: 1.5, 
                  margin: '0 0 26px 0',
                  maxWidth: '310px',
                  position: 'relative',
                  zIndex: 2
                }}
              >
                To qualify for loan eligibility across partner banks, please ensure you meet the following criteria
              </p>

              {/* Criteria Item Boxes (Lavender Pills with Crisp Border & Vibrant Hover) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', zIndex: 2 }}>
                <motion.div 
                  whileHover={{ y: -3, scale: 1.015, backgroundColor: '#FAF5FF', borderColor: '#7C3AED', color: '#6D28D9', boxShadow: '0 8px 22px rgba(124, 58, 237, 0.2)' }}
                  style={{
                    background: '#FFFFFF',
                    border: '1.5px solid #DDD6FE',
                    borderRadius: '16px',
                    padding: '16px 22px',
                    fontSize: '0.98rem',
                    fontWeight: 600,
                    color: '#1E293B',
                    fontFamily: "'Inter', sans-serif",
                    boxShadow: '0 2px 8px rgba(124, 58, 237, 0.05)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Age from 21 to 60 years
                </motion.div>

                <motion.div 
                  whileHover={{ y: -3, scale: 1.015, backgroundColor: '#FAF5FF', borderColor: '#7C3AED', color: '#6D28D9', boxShadow: '0 8px 22px rgba(124, 58, 237, 0.2)' }}
                  style={{
                    background: '#FFFFFF',
                    border: '1.5px solid #DDD6FE',
                    borderRadius: '16px',
                    padding: '16px 22px',
                    fontSize: '0.98rem',
                    fontWeight: 600,
                    color: '#1E293B',
                    fontFamily: "'Inter', sans-serif",
                    boxShadow: '0 2px 8px rgba(124, 58, 237, 0.05)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Salaried individuals can check
                </motion.div>

                <motion.div 
                  whileHover={{ y: -3, scale: 1.015, backgroundColor: '#FAF5FF', borderColor: '#7C3AED', color: '#6D28D9', boxShadow: '0 8px 22px rgba(124, 58, 237, 0.2)' }}
                  style={{
                    background: '#FFFFFF',
                    border: '1.5px solid #DDD6FE',
                    borderRadius: '16px',
                    padding: '16px 22px',
                    fontSize: '0.98rem',
                    fontWeight: 600,
                    color: '#1E293B',
                    fontFamily: "'Inter', sans-serif",
                    boxShadow: '0 2px 8px rgba(124, 58, 237, 0.05)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Minimum net monthly income of Rs. 25,000
                </motion.div>
              </div>
            </motion.div>

            {/* Right Card: Documents required */}
            <motion.div
              whileHover={{ y: -4, boxShadow: '0 16px 36px rgba(34, 197, 94, 0.12)' }}
              transition={{ duration: 0.2 }}
              style={{
                background: '#EDF8F1',
                borderRadius: '24px',
                padding: '38px 32px 34px',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 2px 12px rgba(34, 197, 94, 0.04)'
              }}
            >
              {/* Top-Right Corner White Backdrop for Icon (Exact InCred flush design) */}
              <div 
                style={{ 
                  position: 'absolute', 
                  top: 0, 
                  right: 0, 
                  width: '135px', 
                  height: '135px', 
                  borderBottomLeftRadius: '120px',
                  borderTopRightRadius: '24px',
                  background: '#ffffff', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  paddingBottom: '10px',
                  paddingLeft: '10px',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)'
                }}
              >
                <img 
                  src={documentsFolderIcon} 
                  alt="Documents required" 
                  style={{ 
                    width: '66px', 
                    height: '70px', 
                    objectFit: 'contain',
                    display: 'block'
                  }} 
                />
              </div>

              {/* Title & Subtitle */}
              <h3 
                style={{ 
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", 
                  fontSize: '1.5rem', 
                  fontWeight: 700, 
                  color: '#1F2937', 
                  margin: '0 0 10px 0',
                  letterSpacing: '-0.3px',
                  position: 'relative',
                  zIndex: 2
                }}
              >
                Documents required
              </h3>
              <p 
                style={{ 
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", 
                  fontSize: '0.96rem', 
                  color: '#4B5563', 
                  lineHeight: 1.5, 
                  margin: '0 0 26px 0',
                  maxWidth: '310px',
                  position: 'relative',
                  zIndex: 2
                }}
              >
                When you apply for a personal loan, you will need to provide the following documents
              </p>

              {/* Document Item Boxes (Mint Green Pills with Crisp Green Border & Vibrant Hover) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', zIndex: 2 }}>
                <motion.div 
                  whileHover={{ y: -3, scale: 1.015, backgroundColor: '#F0FDF4', borderColor: '#16A34A', color: '#15803D', boxShadow: '0 8px 22px rgba(34, 197, 94, 0.2)' }}
                  style={{
                    background: '#FFFFFF',
                    border: '1.5px solid #BBF7D0',
                    borderRadius: '16px',
                    padding: '16px 22px',
                    fontSize: '0.98rem',
                    fontWeight: 600,
                    color: '#1E293B',
                    fontFamily: "'Inter', sans-serif",
                    boxShadow: '0 2px 8px rgba(34, 197, 94, 0.05)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  PAN Card
                </motion.div>

                <motion.div 
                  whileHover={{ y: -3, scale: 1.015, backgroundColor: '#F0FDF4', borderColor: '#16A34A', color: '#15803D', boxShadow: '0 8px 22px rgba(34, 197, 94, 0.2)' }}
                  style={{
                    background: '#FFFFFF',
                    border: '1.5px solid #BBF7D0',
                    borderRadius: '16px',
                    padding: '16px 22px',
                    fontSize: '0.98rem',
                    fontWeight: 600,
                    color: '#1E293B',
                    fontFamily: "'Inter', sans-serif",
                    boxShadow: '0 2px 8px rgba(34, 197, 94, 0.05)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Aadhaar Card
                </motion.div>

                <motion.div 
                  whileHover={{ y: -3, scale: 1.015, backgroundColor: '#F0FDF4', borderColor: '#16A34A', color: '#15803D', boxShadow: '0 8px 22px rgba(34, 197, 94, 0.2)' }}
                  style={{
                    background: '#FFFFFF',
                    border: '1.5px solid #BBF7D0',
                    borderRadius: '16px',
                    padding: '16px 22px',
                    fontSize: '0.98rem',
                    fontWeight: 600,
                    color: '#1E293B',
                    fontFamily: "'Inter', sans-serif",
                    boxShadow: '0 2px 8px rgba(34, 197, 94, 0.05)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Last three month's bank statements & pay slips
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ===== PERSONAL LOAN EMI CALCULATOR SECTION ===== */}
        <PersonalLoanEmiCalculator />

        {/* ===== CUSTOMER SUCCESS STORIES SECTION ===== */}
        <CustomerSuccessStories />

        {/* ===== FREQUENTLY ASKED QUESTIONS (FAQS) SECTION ===== */}
        <PortalFaqSection />

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
                <Link to="/personal-loan" style={{ textDecoration: 'none' }}>
                  <motion.button
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
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Professional Assistance, Support & Feedback Footer in rgb(66, 66, 66) */}
        <PortalFooter />
      </div>
    </div>
  );
};

export default MainMasterPortal;
