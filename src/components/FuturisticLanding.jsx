import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Globe, Lock, Instagram, MessageSquare, Send } from 'lucide-react';
import './FuturisticLanding.css';

const FuturisticLanding = ({ onGetStarted, onAdminClick }) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

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
      setLoginError('Invalid credentials. Access denied.');
    }
  };

  return (
    <div className="ai-landing-container">
      {/* Background Elements */}
      <div className="ai-grid-background"></div>
      <div className="ai-glow-orb orb-1"></div>
      <div className="ai-glow-orb orb-2"></div>

      {/* Navbar */}
      <nav className="ai-navbar">
        <div className="ai-brand">
          <div className="ai-logo-icon">
            <Sparkles size={20} color="#7c3aed" />
          </div>
          <span className="text-glow">LoanHub</span>
          <span className="ai-badge">AI 2.0</span>
        </div>
        <button className="ai-admin-trigger" onClick={handleAdminButtonClick}>
          <Lock size={14} />
          <span>Admin</span>
        </button>
      </nav>

      {/* Main Hero Content */}
      <main className="ai-hero">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="ai-hero-content"
        >
          <div className="ai-status-pill">
            <span className="dot"></span>
            System Operational
          </div>

          <h1 className="ai-title">
            The Future of <br />
            <span className="gradient-text-ai">Financial Intelligence</span>
          </h1>

          <p className="ai-subtitle">
            Our advanced AI engine analyzes 12+ banking protocols instantly.
            Get precision-calculated loan eligibility and balance transfer offers in milliseconds.
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="ai-cta-button"
            onClick={onGetStarted}
          >
            <Zap size={20} fill="currentColor" />
            Initialize Calculation
            <ArrowRight size={20} />
          </motion.button>
        </motion.div>

        {/* Feature Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="ai-features"
        >
          <div className="ai-feature-card glass-card">
            <ShieldCheck className="feature-icon-ai" color="#10b981" />
            <div>
              <h3>Bank-Grade Security</h3>
              <p>256-bit Encryption</p>
            </div>
          </div>
          <div className="ai-feature-card glass-card">
            <Globe className="feature-icon-ai" color="#3b82f6" />
            <div>
              <h3>Universal Access</h3>
              <p>12+ Partner Networks</p>
            </div>
          </div>
          <div className="ai-feature-card glass-card">
            <Zap className="feature-icon-ai" color="#f59e0b" />
            <div>
              <h3>Real-Time Core</h3>
              <p>Instant Processing</p>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Founder Section */}
      <section className="ai-founder-section">
        <div className="founder-grid">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="founder-image-container"
          >
            <div className="founder-glow-ring"></div>
            <img src="/founder.jpg" alt="Dikshant Singh Rathore" className="founder-img" />
            <div className="founder-badge">
              <Sparkles size={14} /> TATA AI VISIONARY
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="founder-bio"
          >
            <p className="founder-label">ARCHITECT & FOUNDER • SINCE 2019</p>
            <h2 className="founder-name">DIKSHANT SINGH RATHORE</h2>

            <div className="experience-metric">
              <span className="metric-value">6+</span>
              <span className="metric-label">Years of Industry Excellence</span>
            </div>

            <div className="vision-quote">
              "We are not just building a calculator; we are dismantling the barriers of financial opacity. TATA
              empowers every individual with the transparency, speed, and intelligence traditionally reserved for
              institutions. This AI software is the dawn of a new era in the global loaning industry."
            </div>

            <a
              href="https://instagram.com/dikshant_singh_rathore"
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
            >
              <Instagram size={18} />
              Connect on Instagram (@dikshant_singh_rathore)
            </a>
          </motion.div>
        </div>
      </section>

      {/* Suggestion Box Section */}
      <section className="ai-suggestion-section">
        <div className="glass-card suggestion-box">
          <div className="suggestion-header">
            <div className="suggestion-icon">
              <MessageSquare size={24} color="#06b6d4" />
            </div>
            <div>
              <h3 className="text-glow">Help Us Improve</h3>
              <p>Your feedback shapes the future of this AI.</p>
            </div>
          </div>
          <div className="suggestion-form">
            <input type="text" placeholder="Your Name (Optional)" className="glass-input" />
            <textarea placeholder="Share your suggestions or report an issue..." className="glass-input" rows="3"></textarea>
            <button className="btn-primary-ai small-btn">
              <Send size={16} />
              Send Feedback
            </button>
          </div>
        </div>
      </section>

      {/* Visionary Footer */}
      <footer className="ai-footer">
        <div className="ai-footer-content">
          <p className="copyright">© 2025 LoanHub AI. Engineered by Dikshant Singh Rathore.</p>
        </div>
      </footer>

      {/* Admin Login Modal (Glassmorphism) */}
      {showLoginModal && (
        <div className="ai-modal-overlay">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="ai-modal glass-card"
          >
            <div className="modal-header">
              <Lock size={24} color="#7c3aed" />
              <h2>Root Access</h2>
            </div>
            <form onSubmit={handleLogin}>
              <div className="ai-input-group">
                <input
                  type="text"
                  className="glass-input"
                  placeholder="Identity"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="ai-input-group">
                <input
                  type="password"
                  className="glass-input"
                  placeholder="Key"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {loginError && <p className="ai-error">{loginError}</p>}
              <div className="modal-actions">
                <button type="button" onClick={() => setShowLoginModal(false)} className="btn-text">Abort</button>
                <button type="submit" className="btn-primary-ai">Authenticate</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default FuturisticLanding;
