import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqsData = [
  {
    id: 1,
    question: "How does the multi-bank eligibility check work without impacting my credit score?",
    answer: "Our intelligent rule engine performs a secure soft match directly against the official credit criteria of 12+ partner banks (including HDFC, ICICI, Axis, Kotak, IDFC FIRST, and InCred). Because it does not trigger a hard bureau enquiry, you receive real-time, personalized loan offers across all banks with zero impact on your CIBIL score."
  },
  {
    id: 2,
    question: "What are the basic eligibility criteria to qualify for a personal loan on this portal?",
    answer: "To qualify for a personal loan, you must be a salaried Indian resident aged 21 to 58 years, with a minimum net monthly in-hand salary of ₹25,000 credited directly to your bank account, and at least 6+ months of total professional work experience."
  },
  {
    id: 3,
    question: "What documents are required to complete the digital application?",
    answer: "We offer a 100% paperless experience requiring only 3 documents: (1) PAN Card for identity verification, (2) Aadhaar Card for instant online KYC, and (3) Latest 3 months' bank statements along with salary slips to verify income."
  },
  {
    id: 4,
    question: "How quickly are loan sanctions generated and funds disbursed into my account?",
    answer: "After selecting your preferred bank offer, your application is processed digitally. Instant in-principle sanctions are generated within 15 minutes, and funds are disbursed directly into your bank account typically within 24 to 48 hours."
  }
];

const PortalFaqSection = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (id) => {
    setOpenFaq(prev => (prev === id ? null : id));
  };

  return (
    <section
      id="faqs"
      style={{
        padding: '30px 24px 80px',
        maxWidth: '1240px',
        margin: '0 auto',
        width: '100%',
        position: 'relative',
        zIndex: 2
      }}
    >
      {/* Section Header matching exact user typography */}
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h2
          style={{
            fontFamily: 'Outfit, "Plus Jakarta Sans", Inter, sans-serif',
            fontSize: 'clamp(28px, 4vw, 43px)',
            fontWeight: 750,
            fontStyle: 'normal',
            color: 'rgb(66, 66, 66)',
            lineHeight: '54px',
            margin: 0,
            letterSpacing: '-0.5px'
          }}
        >
          Frequently asked questions (FAQs)
        </h2>

        {/* InCred Accent Underline Bar */}
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

      {/* Full-Width Stretched FAQs List with Lift-Up Hover Effect */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {faqsData.map((faq) => {
          const isOpen = openFaq === faq.id;

          return (
            <motion.div
              key={faq.id}
              whileHover={{ 
                y: -4,
                boxShadow: '0 10px 25px -4px rgba(0, 0, 0, 0.07), 0 2px 8px -2px rgba(245, 130, 32, 0.12)',
                backgroundColor: '#FFFFFF',
                borderColor: '#F58220'
              }}
              transition={{
                type: 'spring',
                stiffness: 450,
                damping: 28
              }}
              onClick={() => toggleFaq(faq.id)}
              style={{
                width: '100%',
                background: isOpen ? '#FFFFFF' : 'rgba(255, 255, 255, 0.85)',
                borderRadius: '12px',
                borderBottom: '1px solid #E5E7EB',
                borderTop: '1px solid transparent',
                borderLeft: '1px solid transparent',
                borderRight: '1px solid transparent',
                padding: '24px 22px',
                cursor: 'pointer',
                boxShadow: isOpen 
                  ? '0 6px 20px -3px rgba(245, 130, 32, 0.12)' 
                  : 'none',
                transition: 'border-color 0.25s ease, background-color 0.25s ease'
              }}
            >
              {/* Question Row (Full Width Flex) */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                  gap: '20px'
                }}
              >
                <span
                  style={{
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                    fontSize: '1.12rem',
                    fontWeight: 650,
                    color: isOpen ? '#EA580C' : '#1F2937',
                    lineHeight: '1.45',
                    transition: 'color 0.2s ease',
                    textAlign: 'left'
                  }}
                >
                  {faq.question}
                </span>

                {/* Sleek Orange Chevron Icon matching screenshot */}
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <ChevronDown
                    size={22}
                    color="#F58220"
                    strokeWidth={2.5}
                  />
                </motion.div>
              </div>

              {/* Expandable Answer */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    transition={{ duration: 0.28, ease: 'easeOut' }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div
                      style={{
                        paddingTop: '14px',
                        borderTop: '1px solid #F3F4F6',
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '1rem',
                        lineHeight: '1.65',
                        color: '#4B5563',
                        textAlign: 'left'
                      }}
                    >
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default PortalFaqSection;
