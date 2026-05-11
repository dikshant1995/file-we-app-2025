import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, ShieldCheck, Briefcase, UserCircle2, ArrowRight, Sparkles, Instagram, Mail, MessageSquare, Send, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import './MainMasterPortal.css';
import './FuturisticLanding.css'; // Reuse components styled earlier like founder and testimonials

const MainMasterPortal = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      name: "Rajat Khandelwal",
      role: "SME Owner, Jaipur",
      text: "Needed working capital to expand my textile manufacturing unit. Laxmi Credit secured a ₹45L Business Loan within 72 hours. Absolutely fantastic!",
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
      role: "Retailer",
      text: "The ABB Analyzer logic helped me present my clear financial standing to the banks instantly. Got a pre-approved business line of credit through this platform seamlessly.",
      rating: 5
    },
    {
      name: "Vikram Malhotra",
      role: "Business Consultant",
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
        {/* Header */}
        <header className="portal-header">
          <div className="portal-logo">
            <Cpu size={28} color="#6366f1" />
            <span className="gradient-text">LAXMI CREDIT</span>
          </div>
          <div className="portal-nav-actions">
             <Link to="/blog" className="nav-item-glass" style={{ textDecoration: 'none', color: '#94a3b8', fontSize: '0.9rem', fontWeight: '600' }}>
               Insights Blog
             </Link>
          </div>
        </header>

        {/* Hero Section */}
        <section className="portal-hero">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="portal-badge"
          >
            <Sparkles size={14} /> Next-Gen Financial Architecture
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="hero-title-main"
          >
            Intelligent Lending, <br />
            <span className="gradient-text-ai" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Instantly Redefined.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hero-subtitle-main"
          >
            Welcome to Laxmi Credit. We utilize advanced neural processing and deep bank policy integrations to offer the most precise loan eligibility analysis in the country.
          </motion.p>
        </section>

        {/* MAIN CHOICE BLOCKS */}
        <section className="portal-choices">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={{ flex: 1 }}
          >
            <Link to="/personal-loan" className="choice-card" style={{ '--card-accent': '#00d4ff', '--card-glow': 'rgba(0, 212, 255, 0.2)', '--card-glow-rgb': '0, 212, 255' }}>
              <div className="card-icon-box">
                <UserCircle2 size={32} />
              </div>
              <div className="card-label">Consumer Credit</div>
              <h2 className="card-title">Personal Loan</h2>
              <p className="card-description">
                Instantly analyze eligibility across 12+ premium banks. Consolidate debt through balance transfer and unlock dynamic loan calculations in milliseconds.
              </p>
              <div className="card-arrow">
                Enter Platform <ArrowRight size={18} />
              </div>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            style={{ flex: 1 }}
          >
            <a href="/business-loan/" className="choice-card" style={{ '--card-accent': '#10b981', '--card-glow': 'rgba(16, 185, 129, 0.2)', '--card-glow-rgb': '16, 185, 129' }}>
              <div className="card-icon-box">
                <Briefcase size={32} />
              </div>
              <div className="card-label">Enterprise Capital</div>
              <h2 className="card-title">Business Loan</h2>
              <p className="card-description">
                Leverage state-of-the-art ABB Analyzer for automated bank statement processing. Access deep policy alignment tailored specifically for growth capital.
              </p>
              <div className="card-arrow">
                Launch Portal <ArrowRight size={18} />
              </div>
            </a>
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
