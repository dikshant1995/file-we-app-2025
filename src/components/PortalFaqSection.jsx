import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqsData = [
  {
    id: 1,
    question: "How does the multi-bank eligibility check work without impacting my credit score?",
    answer: "Our intelligent rule engine performs a secure soft match directly against the official lending criteria of 12+ partner banks (including HDFC, ICICI, Axis, Kotak, IDFC FIRST, and InCred). Because it does not trigger a formal bureau pull, you get comprehensive, real-time eligibility comparisons across all partner banks with zero enquiry marks or score drops on your CIBIL profile."
  },
  {
    id: 2,
    question: "What are the eligibility criteria to qualify for a personal loan on this portal?",
    answer: "To qualify for a personal loan through our portal, you must be an Indian resident salaried individual aged between 21 and 58 years, with a minimum net monthly in-hand salary of ₹25,000 credited directly to your bank account, and a minimum total employment history of 6+ months."
  },
  {
    id: 3,
    question: "What documents do I need to complete the digital application?",
    answer: "We follow a 100% paperless verification flow requiring only 3 basic documents: (1) PAN Card for identity verification, (2) Aadhaar Card for instant digital KYC, and (3) Latest 3 months' bank statements and salary slips to verify income."
  },
  {
    id: 4,
    question: "How much loan amount can I get and what are the available tenures?",
    answer: "Depending on your net monthly salary and partner bank credit parameters, you can apply for unsecured personal loans ranging from ₹50,000 up to ₹15,00,000 (15 Lakhs). Flexible repayment tenures range from 12 months (1 year) up to 60 months (5 years) with fixed monthly EMIs."
  },
  {
    id: 5,
    question: "How quickly are funds disbursed after submitting my application?",
    answer: "Once you compare and choose your preferred bank offer, your application is processed digitally. In-principle sanction approvals are generated within 15 minutes, and full loan disbursement directly into your bank account typically occurs within 24 to 48 hours."
  },
  {
    id: 6,
    question: "Are there any charges or hidden fees for using this comparison portal?",
    answer: "Zero fees. Comparing loan offers, calculating EMIs, and discovering your multi-bank eligibility on our portal is 100% free and transparent. Processing fees, if applicable, are strictly charged directly by the lending bank only upon final loan sanction."
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
        padding: '30px 20px 80px',
        maxWidth: '1020px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 2
      }}
    >
      {/* Section Header matching exact user typography */}
      <div style={{ textAlign: 'center', marginBottom: '45px' }}>
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
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '1rem',
            color: '#6B7280',
            marginTop: '12px',
            maxWidth: '600px',
            margin: '12px auto 0',
            lineHeight: 1.5
          }}
        >
          Quick answers to common questions about our enquiry-less loan comparison and digital approval process
        </p>
      </div>

      {/* FAQs List with Smooth Lift-Up Hover Effect */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {faqsData.map((faq) => {
          const isOpen = openFaq === faq.id;

          return (
            <motion.div
              key={faq.id}
              whileHover={{ 
                y: -5,
                scale: 1.006,
                boxShadow: '0 12px 28px -6px rgba(0, 0, 0, 0.09), 0 4px 12px -2px rgba(245, 130, 32, 0.12)',
                borderColor: '#F58220'
              }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 25
              }}
              onClick={() => toggleFaq(faq.id)}
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                border: `1.5px solid ${isOpen ? '#F58220' : '#E5E7EB'}`,
                padding: '22px 28px',
                cursor: 'pointer',
                boxShadow: isOpen 
                  ? '0 8px 24px -4px rgba(245, 130, 32, 0.15)' 
                  : '0 2px 8px rgba(0, 0, 0, 0.03)',
                transition: 'border-color 0.25s ease, background 0.25s ease'
              }}
            >
              {/* Question Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '18px'
                }}
              >
                <span
                  style={{
                    fontFamily: "'Inter', -apple-system, sans-serif",
                    fontSize: '1.08rem',
                    fontWeight: 650,
                    color: isOpen ? '#EA580C' : '#1F2937',
                    lineHeight: '1.45',
                    transition: 'color 0.2s ease'
                  }}
                >
                  {faq.question}
                </span>

                {/* Animated Chevron Arrow */}
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: isOpen ? '#FFF7ED' : '#F9FAFB'
                  }}
                >
                  <ChevronDown
                    size={20}
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
                    animate={{ opacity: 1, height: 'auto', marginTop: 14 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    transition={{ duration: 0.28, ease: 'easeOut' }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div
                      style={{
                        paddingTop: '12px',
                        borderTop: '1px solid #F3F4F6',
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '0.98rem',
                        lineHeight: '1.65',
                        color: '#4B5563'
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
