import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Globe, Lock, Instagram, MessageSquare, Send, ChevronDown, Cpu, BarChart3, Fingerprint } from 'lucide-react';
import './FuturisticLanding.css';

const FuturisticLanding = ({ onGetStarted, onAdminClick }) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [tick, setTick] = useState(0);
  const [feedbackName, setFeedbackName] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

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

  const ADMIN_USERNAME = 'admin';
  const ADMIN_PASSWORD = 'admin123';

  const handleAdminButtonClick = () => {
    setShowLoginModal(true);
    setLoginError('');
    setUsername('');
    setPassword('');
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setShowLoginModal(false);
      onAdminClick();
    } else {
      setLoginError('ACCESS DENIED — Invalid credentials');
    }
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


      {/* ===== HERO ===== */}
      <section className="holo-hero">
        <div className="hero-inner">
          {/* Left: Text content */}
          <motion.div
            className="hero-text"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          >
            <motion.div
              className="hero-tag"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <span className="tag-dot" />
              <span>NEXT-GEN FINANCIAL AI</span>
            </motion.div>

            <h1 className="hero-title">
              <span className="title-line-1">The Future of</span>
              <span className="title-line-2 gradient-text-ai">Loan Intelligence</span>
              <span className="title-line-3">is Here.</span>
            </h1>

            <p className="hero-desc">
              Our neural AI engine processes 200+ banking parameters in real-time,
              delivering precision loan eligibility and balance transfer analysis
              across 12+ leading financial institutions — in milliseconds.
            </p>

            {/* CTA Row */}
            <div className="hero-cta-row">
              <motion.button
                className="holo-cta-btn"
                onClick={onGetStarted}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <div className="cta-btn-glow" />
                <Zap size={18} fill="currentColor" />
                <span>Apply Now</span>
                <ArrowRight size={18} />
              </motion.button>

              <motion.div
                className="cta-signal"
                animate={{ x: [-4, 0, -4] }}
                transition={{ duration: 1.0, repeat: Infinity, ease: 'easeInOut' }}
                initial={{ opacity: 0 }}
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                >
                  <span className="signal-arrow">◀◀</span>
                  <span className="signal-text">START HERE</span>
                </motion.div>
              </motion.div>
            </div>

            {/* Stats row */}
            <div className="hero-stats">
              {stats.map((s, i) => (
                <motion.div
                  key={i}
                  className="stat-item"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                >
                  <span className="stat-value">{s.value}</span>
                  <span className="stat-label">{s.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: Holographic display panel */}
          <motion.div
            className="hero-holo-panel"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
          >
            <div className="holo-panel-frame">
              <div className="panel-corner tl" />
              <div className="panel-corner tr" />
              <div className="panel-corner bl" />
              <div className="panel-corner br" />
              <div className="panel-scan-line" />

              <div className="panel-content">
                <div className="panel-header-row">
                  <span className="panel-title">AI ANALYSIS ENGINE</span>
                  <span className="panel-live">● LIVE</span>
                </div>

                {/* Fake data bars */}
                <div className="analysis-bars">
                  {['HDFC Bank', 'ICICI Bank', 'Axis Bank', 'SBI', 'Kotak', 'IndusInd'].map((bank, i) => (
                    <div key={bank} className="bar-row">
                      <span className="bar-label">{bank}</span>
                      <div className="bar-track">
                        <motion.div
                          className="bar-fill"
                          initial={{ width: 0 }}
                          animate={{ width: `${55 + i * 7}%` }}
                          transition={{ delay: 0.8 + i * 0.1, duration: 0.8 }}
                          style={{ '--bar-color': i % 2 === 0 ? '#00d4ff' : '#7c3aed' }}
                        />
                      </div>
                      <span className="bar-pct">{55 + i * 7}%</span>
                    </div>
                  ))}
                </div>

                <div className="panel-footer-row">
                  <div className="pf-item">
                    <span className="pf-label">PROCESSING</span>
                    <span className="pf-val text-glow">ACTIVE</span>
                  </div>
                  <div className="pf-item">
                    <span className="pf-label">LATENCY</span>
                    <span className="pf-val">12ms</span>
                  </div>
                  <div className="pf-item">
                    <span className="pf-label">ACCURACY</span>
                    <span className="pf-val" style={{ color: '#00ff88' }}>99.8%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating data chips */}
            <motion.div className="float-chip chip-1" animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}>
              <Zap size={12} color="#f59e0b" /> Instant Processing
            </motion.div>
            <motion.div className="float-chip chip-2" animate={{ y: [0, 8, 0] }} transition={{ duration: 3.5, repeat: Infinity }}>
              <ShieldCheck size={12} color="#00ff88" /> Secure & Encrypted
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="scroll-indicator"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown size={20} color="#00d4ff" />
        </motion.div>
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
              <img src="/founder.jpg" alt="Dikshant Singh Rathore" className="founder-photo" />
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

            <blockquote className="founder-quote">
              "We are not just building a calculator — we are dismantling the barriers of financial opacity.
              This AI software is the dawn of a new era in the global loaning industry."
            </blockquote>

            <a
              href="https://instagram.com/dikshant_singh_rathore"
              target="_blank"
              rel="noopener noreferrer"
              className="founder-social"
            >
              <Instagram size={16} />
              @dikshant_singh_rathore
            </a>
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
        <p>© 2025 LoanAI Model — Engineered by <span className="text-glow">Dikshant Singh Rathore</span></p>
        <p className="footer-sub">Powered by Advanced Neural Intelligence • Secured by 256-bit Encryption</p>
      </footer>

      {/* ===== ADMIN MODAL ===== */}
      <AnimatePresence>
        {showLoginModal && (
          <motion.div
            className="holo-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="holo-modal"
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', damping: 20 }}
            >
              <div className="modal-corner mc-tl" />
              <div className="modal-corner mc-tr" />
              <div className="modal-corner mc-bl" />
              <div className="modal-corner mc-br" />

              <div className="modal-header">
                <div className="modal-icon"><Lock size={20} color="#00d4ff" /></div>
                <div>
                  <h3>ROOT ACCESS</h3>
                  <p>Authorized personnel only</p>
                </div>
              </div>

              <form onSubmit={handleLogin} className="modal-form">
                <div className="modal-field">
                  <label>IDENTITY</label>
                  <input
                    type="text"
                    className="glass-input"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="modal-field">
                  <label>ACCESS KEY</label>
                  <input
                    type="password"
                    className="glass-input"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {loginError && (
                  <div className="modal-error">⚠ {loginError}</div>
                )}
                <div className="modal-actions">
                  <button type="button" onClick={() => setShowLoginModal(false)} className="modal-abort">ABORT</button>
                  <button type="submit" className="modal-auth">AUTHENTICATE</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FuturisticLanding;
