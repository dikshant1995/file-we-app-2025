import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const allFaqsData = [
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
  },
  {
    id: 5,
    question: "What can I use a personal loan for?",
    answer: "You can use a personal loan for any legitimate personal or financial requirement with no end-use restrictions — such as medical emergencies, home renovation, wedding expenses, debt consolidation, higher education, or travel."
  },
  {
    id: 6,
    question: "What loan amounts and repayment tenures can I apply for?",
    answer: "You can apply for personal loans ranging from ₹50,000 up to ₹1,50,00,000 (1.5 Crore) depending on your profile, income, and partner bank lending policies. Flexible repayment tenures range from 12 months (1 year) up to 84 months (7 years) with fixed monthly EMIs."
  },
  {
    id: 7,
    question: "Are there any charges or hidden fees for using this comparison portal?",
    answer: "Zero fees. Comparing loan offers, calculating EMIs, and discovering your multi-bank eligibility on our portal is 100% free and transparent. Processing fees, if applicable, are strictly charged directly by the lending bank only upon final loan sanction."
  },
  {
    id: 8,
    question: "Can I prepay or foreclose my personal loan before the tenure ends?",
    answer: "Yes, most partner banks allow part-prepayment or full foreclosure after a specified lock-in period (typically 3 to 6 months). Exact terms and zero-foreclosure options vary by bank and are clearly disclosed in your personalized loan agreement."
  }
];

const PortalFaqSection = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const toggleFaq = (id) => {
    setOpenFaq(prev => (prev === id ? null : id));
  };

  // Initially show 4 FAQs, show all 8 when "See More" is clicked
  const visibleFaqs = showAll ? allFaqsData : allFaqsData.slice(0, 4);

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
        <AnimatePresence>
          {visibleFaqs.map((faq) => {
            const isOpen = openFaq === faq.id;

            return (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                whileHover={{ 
                  y: -4,
                  boxShadow: '0 10px 25px -4px rgba(0, 0, 0, 0.07), 0 2px 8px -2px rgba(245, 130, 32, 0.12)',
                  backgroundColor: '#FFFFFF',
                  borderColor: '#F58220'
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
        </AnimatePresence>
      </div>

      {/* "See More" Button matching user reference screenshot */}
      <div style={{ marginTop: '30px', textAlign: 'left' }}>
        <motion.button
          whileHover={{ scale: 1.04, backgroundColor: '#FFF7ED', y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowAll(prev => !prev)}
          style={{
            background: '#ffffff',
            color: '#F58220',
            border: '1.5px solid #F58220',
            borderRadius: '50px',
            padding: '10px 28px',
            fontSize: '0.96rem',
            fontWeight: 650,
            cursor: 'pointer',
            fontFamily: "'Inter', sans-serif",
            transition: 'all 0.2s ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 2px 8px rgba(245, 130, 32, 0.1)'
          }}
        >
          <span>{showAll ? 'See Less' : 'See More'}</span>
        </motion.button>
      </div>
    </section>
  );
};

export default PortalFaqSection;
