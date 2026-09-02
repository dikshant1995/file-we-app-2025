import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cpu, ShieldCheck, Clock, FileText, ArrowRight, Sparkles, UserCircle2, Building2, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import './MainMasterPortal.css';
import './FuturisticLanding.css';

const MainMasterPortal = () => {
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
        {/* InCred-style Header Navigation */}
        <header className="portal-header">
          <div className="portal-logo">
            <span style={{ color: '#F58220', fontWeight: '900', fontSize: '1.8rem', fontFamily: 'Montserrat, sans-serif' }}>Laxmi</span>
            <span style={{ color: '#06064D', fontWeight: '800', fontSize: '1.8rem', fontFamily: 'Montserrat, sans-serif', marginLeft: '2px' }}>credit</span>
          </div>

          <nav className="portal-nav-links">
            <a href="#about" className="incred-nav-link">About Us</a>
            <Link to="/personal-loan" className="incred-nav-link">Personal Loans</Link>
            <a href="#bt" className="incred-nav-link">Balance Transfer</a>
            <a href="#contact" className="incred-nav-link">Contact Us</a>
          </nav>

          <div className="portal-nav-actions" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Link to="/admin" className="incred-outline-btn">
              Admin Login
            </Link>
            <Link to="/personal-loan" className="incred-filled-btn">
              Apply Now
            </Link>
          </div>
        </header>

        {/* InCred-Style Hero Section */}
        <section className="incred-hero-section">
          <div className="incred-hero-container">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="incred-hero-content"
            >
              <h1 className="incred-hero-hook-title">
                Apply for Instant <br />
                <span className="incred-hero-hook-sub">Personal Loan upto</span>
              </h1>

              <div className="incred-hero-amount">
                ₹50 lakhs
              </div>

              <div className="incred-cta-wrapper">
                <Link to="/personal-loan" className="incred-primary-cta-btn">
                  <span className="cta-btn-title">Check loan eligibility</span>
                  <span className="cta-btn-sub">In less than a minute • 0 CIBIL Impact</span>
                </Link>
              </div>
            </motion.div>
          </div>

          {/* InCred-Style Blue Feature Ribbon */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="incred-feature-ribbon"
          >
            <div className="ribbon-item">
              <div className="ribbon-icon-box">
                <Clock size={28} color="#ffffff" />
              </div>
              <div className="ribbon-text">
                <div className="ribbon-title">15 Minute Disbursal</div>
                <div className="ribbon-sub">Fast Track Bank Processing</div>
              </div>
            </div>

            <div className="ribbon-divider" />

            <div className="ribbon-item">
              <div className="ribbon-icon-box">
                <ShieldCheck size={28} color="#ffffff" />
              </div>
              <div className="ribbon-text">
                <div className="ribbon-title">No Collateral Required</div>
                <div className="ribbon-sub">100% Unsecured Personal Credit</div>
              </div>
            </div>

            <div className="ribbon-divider" />

            <div className="ribbon-item">
              <div className="ribbon-icon-box">
                <FileText size={28} color="#ffffff" />
              </div>
              <div className="ribbon-text">
                <div className="ribbon-title">Instant Loan Approval</div>
                <div className="ribbon-sub">Scans 12+ Top Bank Rules</div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Narrative & Philosophy Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="philosophy-banner"
          id="about"
        >
          <div className="philosophy-flex">
            <div className="philosophy-icon-frame">
              <Cpu size={40} style={{ color: '#F58220' }} />
            </div>
            <div className="philosophy-content">
              <h3>Why shop for shoes, but settle for personal loans?</h3>
              <p>
                Think about it. When buying a pair of shoes, we compare <span className="highlight-text">10+ brands</span> and check multiple shops just to save a few hundred rupees. But for a life-altering <span className="highlight-text">5-year personal loan commitment</span>, millions just accept the very first offer.
              </p>
              <p style={{ marginTop: '0.5rem', fontSize: '0.95rem', opacity: 0.85 }}>
                Laxmi Credit was engineered to disrupt this. We use deep banking policy data to scan dozens of actual institutional rulebooks in milliseconds, ensuring you save lakhs in interest and compounding repayments. Don't just take credit; command it.
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
            style={{ width: '100%', maxWidth: '750px' }}
          >
            <Link to="/personal-loan" className="choice-card">
              <div className="card-icon-box">
                <UserCircle2 size={36} />
              </div>
              <div className="card-label">INSTANT ELIGIBILITY & BALANCE TRANSFER</div>
              <h2 className="card-title">Personal Loan Eligibility Checker</h2>
              <p className="card-description">
                Instantly analyze personal loan eligibility across 12+ premium Indian banks (HDFC, ICICI, Axis, Kotak, IDFC, IndusInd, and more). Consolidate high-interest debt through automated Balance Transfer (BT) calculations in milliseconds.
              </p>
              <div className="card-arrow">
                Start Loan Eligibility Check <ArrowRight size={20} />
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
