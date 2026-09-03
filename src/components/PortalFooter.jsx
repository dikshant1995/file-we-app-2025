import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PhoneCall, Mail, Clock, MessageSquareHeart, Star, Send, X, ShieldCheck, CheckCircle2, HeartHandshake } from 'lucide-react';

const PortalFooter = () => {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackCategory, setFeedbackCategory] = useState('Loan Process');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackEmail, setFeedbackEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmitFeedback = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setIsFeedbackOpen(false);
      setFeedbackText('');
      setFeedbackEmail('');
      setRating(5);
    }, 2500);
  };

  return (
    <>
      <footer
        style={{
          backgroundColor: 'rgb(66, 66, 66)',
          color: '#ffffff',
          padding: '60px 24px 100px', // Extra bottom padding for sticky bar clearance
          position: 'relative',
          zIndex: 10,
          fontFamily: "'Inter', -apple-system, sans-serif"
        }}
      >
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          {/* Main Footer Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '40px',
              paddingBottom: '45px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.15)'
            }}
          >
            {/* Column 1: Platform Summary & Trust */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: '#F58220',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <ShieldCheck size={22} color="#ffffff" />
                </div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: '1.35rem',
                    fontWeight: 750,
                    fontFamily: 'Outfit, "Plus Jakarta Sans", sans-serif',
                    color: '#ffffff',
                    letterSpacing: '-0.3px'
                  }}
                >
                  Lending <span style={{ color: '#F58220' }}>Portal</span>
                </h3>
              </div>
              <p
                style={{
                  fontSize: '0.92rem',
                  lineHeight: '1.65',
                  color: '#D1D5DB',
                  margin: '0 0 18px 0'
                }}
              >
                India's leading enquiry-less multi-bank personal loan comparison engine. Compare real-time pre-approved offers across 12+ partner banks in 60 seconds with zero credit bureau impact.
              </p>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(245, 130, 32, 0.15)',
                  border: '1px solid rgba(245, 130, 32, 0.35)',
                  borderRadius: '20px',
                  padding: '6px 14px',
                  fontSize: '0.82rem',
                  color: '#FDBA74',
                  fontWeight: 600
                }}
              >
                <CheckCircle2 size={15} color="#F58220" />
                <span>100% Free • Bank-Grade 256-Bit SSL</span>
              </div>
            </div>

            {/* Column 2: Need Assistance / Support Team */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <HeartHandshake size={20} color="#F58220" />
                <h4
                  style={{
                    margin: 0,
                    fontSize: '1.15rem',
                    fontWeight: 700,
                    fontFamily: 'Outfit, "Plus Jakarta Sans", sans-serif',
                    color: '#ffffff'
                  }}
                >
                  Need Assistance?
                </h4>
              </div>
              <p style={{ fontSize: '0.9rem', color: '#D1D5DB', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                Our dedicated loan advisors and support desk are available to guide you through your application.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <a
                  href="tel:18002025888"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    color: '#ffffff',
                    textDecoration: 'none',
                    fontSize: '0.92rem',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#F58220')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#ffffff')}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <PhoneCall size={16} color="#F58220" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Toll-Free Support Helpline</div>
                    <strong style={{ fontSize: '0.95rem' }}>1800-202-5888 / +91 98765 43210</strong>
                  </div>
                </a>

                <a
                  href="mailto:support@loanportal.in"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    color: '#ffffff',
                    textDecoration: 'none',
                    fontSize: '0.92rem',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#F58220')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#ffffff')}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Mail size={16} color="#F58220" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Email Assistance</div>
                    <strong style={{ fontSize: '0.95rem' }}>support@loanportal.in</strong>
                  </div>
                </a>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.88rem', color: '#D1D5DB' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Clock size={16} color="#F58220" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Working Hours</div>
                    <span>Mon - Sat (9:30 AM - 7:00 PM IST)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 3: Feedback & Suggestions */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <MessageSquareHeart size={20} color="#F58220" />
                <h4
                  style={{
                    margin: 0,
                    fontSize: '1.15rem',
                    fontWeight: 750,
                    fontFamily: 'Outfit, "Plus Jakarta Sans", sans-serif',
                    color: '#ffffff'
                  }}
                >
                  Help Us Improve
                </h4>
              </div>
              <p style={{ fontSize: '0.9rem', color: '#D1D5DB', margin: '0 0 18px 0', lineHeight: 1.5 }}>
                Your feedback directly shapes our portal features and helps us deliver smoother, faster loan experiences.
              </p>

              <motion.button
                whileHover={{ scale: 1.03, backgroundColor: '#EA580C' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setIsFeedbackOpen(true)}
                style={{
                  background: '#F58220',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '50px',
                  padding: '12px 24px',
                  fontSize: '0.95rem',
                  fontWeight: 650,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  boxShadow: '0 4px 14px rgba(245, 130, 32, 0.4)',
                  fontFamily: "'Inter', sans-serif"
                }}
              >
                <MessageSquareHeart size={18} />
                <span>Give Us Feedback</span>
              </motion.button>
            </div>
          </div>

          {/* Partner Banks Row */}
          <div
            style={{
              padding: '24px 0',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '16px',
              fontSize: '0.85rem',
              color: '#9CA3AF'
            }}
          >
            <div>
              <span style={{ color: '#ffffff', fontWeight: 600 }}>Partner Banks:</span>{' '}
              <span>HDFC Bank • ICICI Bank • Axis Bank • Kotak Mahindra Bank • IDFC FIRST Bank • InCred Finance • IndusInd Bank</span>
            </div>
            <div style={{ color: '#D1D5DB', fontSize: '0.82rem' }}>
              🔒 100% Encrypted & RBI Guidelines Compliant
            </div>
          </div>

          {/* Bottom Copyright & Disclaimer */}
          <div
            style={{
              paddingTop: '24px',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px',
              fontSize: '0.82rem',
              color: '#9CA3AF'
            }}
          >
            <div>
              © {new Date().getFullYear()} Personal Loan Eligibility & Multi-Bank Comparison Portal. All rights reserved.
            </div>
            <div style={{ color: '#CBD5E1' }}>
              Disclaimer: We do not charge borrowers any fees. In-principle approvals are subject to bank partner credit policies.
            </div>
          </div>
        </div>
      </footer>

      {/* Interactive Feedback Modal */}
      <AnimatePresence>
        {isFeedbackOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(4px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 450, damping: 30 }}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                width: '100%',
                maxWidth: '480px',
                padding: '30px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                position: 'relative',
                color: '#1F2937'
              }}
            >
              {/* Close Button */}
              <button
                onClick={() => setIsFeedbackOpen(false)}
                style={{
                  position: 'absolute',
                  top: '18px',
                  right: '18px',
                  background: '#F3F4F6',
                  border: 'none',
                  borderRadius: '50%',
                  width: '34px',
                  height: '34px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#6B7280'
                }}
              >
                <X size={18} />
              </button>

              {isSubmitted ? (
                <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      backgroundColor: '#DCFCE7',
                      color: '#16A34A',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 18px'
                    }}
                  >
                    <CheckCircle2 size={36} />
                  </div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 700, margin: '0 0 8px 0', color: '#111827' }}>
                    Thank You for Your Feedback!
                  </h3>
                  <p style={{ color: '#6B7280', fontSize: '0.95rem', margin: 0 }}>
                    Your thoughts are immensely valuable in helping us build India's easiest personal loan experience.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitFeedback}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        backgroundColor: '#FFF7ED',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <MessageSquareHeart size={20} color="#F58220" />
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 750, color: '#111827' }}>
                      Share Your Feedback
                    </h3>
                  </div>
                  <p style={{ fontSize: '0.88rem', color: '#6B7280', margin: '0 0 20px 0' }}>
                    Tell us how we can make our loan eligibility and EMI comparison smoother for you.
                  </p>

                  {/* Rating Stars */}
                  <div style={{ marginBottom: '18px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                      How was your experience?
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex'
                          }}
                        >
                          <Star
                            size={26}
                            fill={(hoverRating || rating) >= star ? '#F59E0B' : '#E5E7EB'}
                            color={(hoverRating || rating) >= star ? '#F59E0B' : '#D1D5DB'}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Feedback Category Pills */}
                  <div style={{ marginBottom: '18px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                      Topic
                    </label>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {['Loan Process', 'EMI Calculator', 'Customer Support', 'Feature Request'].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setFeedbackCategory(cat)}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '20px',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            border: feedbackCategory === cat ? '1.5px solid #F58220' : '1px solid #E5E7EB',
                            background: feedbackCategory === cat ? '#FFF7ED' : '#F9FAFB',
                            color: feedbackCategory === cat ? '#EA580C' : '#4B5563',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Textarea */}
                  <div style={{ marginBottom: '18px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                      Your comments or suggestions *
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="What did you like? What can we do better?"
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '10px',
                        border: '1.5px solid #D1D5DB',
                        fontSize: '0.92rem',
                        fontFamily: "'Inter', sans-serif",
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => (e.target.style.borderColor = '#F58220')}
                      onBlur={(e) => (e.target.style.borderColor = '#D1D5DB')}
                    />
                  </div>

                  {/* Email Input (Optional) */}
                  <div style={{ marginBottom: '22px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                      Email (optional, if you'd like a response)
                    </label>
                    <input
                      type="email"
                      placeholder="yourname@domain.com"
                      value={feedbackEmail}
                      onChange={(e) => setFeedbackEmail(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1.5px solid #D1D5DB',
                        fontSize: '0.9rem',
                        fontFamily: "'Inter', sans-serif",
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => (e.target.style.borderColor = '#F58220')}
                      onBlur={(e) => (e.target.style.borderColor = '#D1D5DB')}
                    />
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    style={{
                      width: '100%',
                      background: '#F58220',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '50px',
                      padding: '12px',
                      fontSize: '1rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 14px rgba(245, 130, 32, 0.4)'
                    }}
                  >
                    <Send size={16} />
                    <span>Submit Feedback</span>
                  </motion.button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PortalFooter;
