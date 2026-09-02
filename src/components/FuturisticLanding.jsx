import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, ArrowLeft, ShieldCheck, Zap, Globe, Lock, Instagram, MessageSquare, Send, ChevronDown, Cpu, BarChart3, Fingerprint, Mail, FileText, Building2 } from 'lucide-react';
import './FuturisticLanding.css';


const FuturisticLanding = ({ onGetStarted, onAdminClick, onBlogClick }) => {
  const [tick, setTick] = useState(0);
  const [feedbackName, setFeedbackName] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

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
      <section className="holo-hero" style={{ padding: '30px 20px 20px', maxWidth: '1280px', margin: '0 auto' }}>
        <div className="hero-2col-wrapper" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px', alignItems: 'center' }}>
          
          {/* Left Column: Headline & CTA Button */}
          <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="hero-hook-title"
              style={{ fontFamily: "'Mulish', 'Plus Jakarta Sans', sans-serif", lineHeight: 1.22, marginBottom: '1.8rem', textAlign: 'left' }}
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

          {/* Right Column: Model Cutout (Enlarged) */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hero-model-right-slot"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: '100%'
            }}
          >
            <img 
              src="/incred-model-cutout.png" 
              alt="Laxmi Credit Model Cutout" 
              style={{
                maxHeight: '580px',
                maxWidth: '100%',
                width: 'auto',
                objectFit: 'contain',
                transform: 'scale(1.1)',
                transformOrigin: 'center bottom',
                filter: 'drop-shadow(0 20px 35px rgba(0, 0, 0, 0.12))'
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
            background: 'linear-gradient(135deg, #4A7BB0 0%, #205596 100%)',
            borderRadius: '24px',
            padding: '36px 40px',
            color: '#ffffff',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '30px',
            alignItems: 'center',
            maxWidth: '1100px',
            margin: '2rem auto 3rem',
            boxShadow: '0 12px 35px rgba(32, 85, 150, 0.25)'
          }}
        >
          {/* Pro 1 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '14px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
              <ShieldCheck size={30} color="#ffffff" />
            </div>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'Montserrat, sans-serif', color: '#ffffff', lineHeight: 1.3 }}>
              Enquiry Less Loan
            </span>
          </div>

          {/* Pro 2 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '14px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
              <Building2 size={30} color="#ffffff" />
            </div>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'Montserrat, sans-serif', color: '#ffffff', lineHeight: 1.3 }}>
              No Collateral Required
            </span>
          </div>

          {/* Pro 3 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '14px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
              <Zap size={30} color="#ffffff" />
            </div>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'Montserrat, sans-serif', color: '#ffffff', lineHeight: 1.3 }}>
              Comparison of 12 Banks in One Minute
            </span>
          </div>
        </motion.div>

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
