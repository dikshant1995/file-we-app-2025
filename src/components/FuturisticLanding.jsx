import { useState, useEffect } from 'react';
import './FuturisticLanding.css';

const FuturisticLanding = ({ onGetStarted, onAdminClick }) => {
  const [currentGesture, setCurrentGesture] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // Default admin credentials
  const ADMIN_USERNAME = 'admin';
  const ADMIN_PASSWORD = 'admin123';
  
  const gestures = [
    { 
      name: 'shrug', 
      text: "It's that simple!", 
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=500&fit=crop&q=80' // Professional woman welcoming gesture
    },
    { 
      name: 'palms', 
      text: "Easy peasy!", 
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=500&fit=crop&q=80' // Professional woman presenting
    },
    { 
      name: 'point', 
      text: "Just like that!", 
      image: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400&h=500&fit=crop&q=80' // Professional woman confident pose
    },
    { 
      name: 'ok', 
      text: "No problem!", 
      image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=500&fit=crop&q=80' // Professional woman smiling
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentGesture((prev) => (prev + 1) % gestures.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

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
      onAdminClick(); // Proceed to admin dashboard
    } else {
      setLoginError('Invalid username or password');
    }
  };

  const handleCancelLogin = () => {
    setShowLoginModal(false);
    setLoginError('');
    setUsername('');
    setPassword('');
  };

  return (
    <div className="futuristic-landing">
      {/* SMALLER ADMIN BUTTON */}
      <button className="mega-admin-button" onClick={handleAdminButtonClick}>
        <div className="admin-button-content">
          <span className="admin-icon">⚙️</span>
          <span className="admin-text">Admin</span>
        </div>
      </button>

      {/* Admin Login Modal */}
      {showLoginModal && (
        <div className="admin-login-overlay">
          <div className="admin-login-modal">
            <div className="login-header">
              <h2>🔐 Admin Login</h2>
              <p>Enter your credentials to access the dashboard</p>
            </div>
            
            <form className="login-form" onSubmit={handleLogin}>
              <div className="form-group">
                <label>Username</label>
                <input 
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  autoFocus
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Password</label>
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                />
              </div>
              
              {loginError && (
                <div className="login-error">
                  ❌ {loginError}
                </div>
              )}
              
              <div className="login-buttons">
                <button type="submit" className="btn-login">
                  Login
                </button>
                <button type="button" className="btn-cancel" onClick={handleCancelLogin}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Flowing Background Elements */}
      <div className="flowing-gradient"></div>
      <div className="particle-field">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="particle" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${5 + Math.random() * 10}s`
          }}></div>
        ))}
      </div>

      <div className="landing-container">
        {/* Left Side - Content */}
        <div className="content-side">
          <div className="brand">
            <div className="brand-icon">💳</div>
            <h3>LoanHub</h3>
          </div>

          <h1 className="main-heading">
            Financial tools that matter,
            <br />
            <span className="gradient-text">crafted for people who care.</span>
          </h1>

          <p className="subtitle">
            Get instant loan approval from 12+ leading banks in seconds.
            Compare offers, transfer balances, and make smart financial decisions.
          </p>

          <button className="cta-button" onClick={onGetStarted}>
            Get Started
            <span className="arrow">→</span>
          </button>

          <div className="features-list">
            <div className="feature-item">
              <div className="feature-dot"></div>
              <span>12+ Banks Compared</span>
            </div>
            <div className="feature-item">
              <div className="feature-dot"></div>
              <span>11% Fixed Interest Rate</span>
            </div>
            <div className="feature-item">
              <div className="feature-dot"></div>
              <span>Instant Results</span>
            </div>
            <div className="feature-item">
              <div className="feature-dot"></div>
              <span>Balance Transfer Available</span>
            </div>
          </div>
        </div>

        {/* Right Side - Alexandra Daddario Model */}
        <div className="model-side">
          <div className="model-container">
            {/* Actress Photo with Gesture */}
            <div className="actress-model">
              <img 
                src={gestures[currentGesture].image} 
                alt="Alexandra Daddario"
                className="actress-photo"
              />
              <div className="photo-overlay"></div>
            </div>

            {/* Speech Bubble */}
            <div className="speech-bubble">
              {gestures[currentGesture].text}
            </div>

            {/* Decorative Circles */}
            <div className="deco-circle circle-1"></div>
            <div className="deco-circle circle-2"></div>
            <div className="deco-circle circle-3"></div>
          </div>

          {/* Floating Elements */}
          <div className="floating-elements">
            <div className="float-icon icon-1">💰</div>
            <div className="float-icon icon-2">📊</div>
            <div className="float-icon icon-3">✅</div>
            <div className="sparkle sparkle-1">✨</div>
            <div className="sparkle sparkle-2">✨</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FuturisticLanding;
