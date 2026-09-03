import React from 'react';
import { motion } from 'framer-motion';
import { Star, CheckCircle2 } from 'lucide-react';

const storiesData = [
  {
    id: 1,
    name: "Ravindra Naik",
    role: "IT Consultant, Bengaluru",
    loanDetails: "₹5.0 Lakh • HDFC Bank @ 10.75%",
    bank: "HDFC Bank",
    avatarBg: "linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)",
    avatarText: "RN",
    story: "I needed ₹5 lakh for home renovation and was worried that checking multiple banks would drop my CIBIL score. Through this portal, I compared live eligibility across 12+ partner banks in 60 seconds with zero credit bureau hits. Got approved with HDFC and the funds were in my account the next morning!"
  },
  {
    id: 2,
    name: "Darshini Suresh Ramkisan",
    role: "Sr. Marketing Manager, Mumbai",
    loanDetails: "₹3.5 Lakh • ICICI Bank @ 11.25%",
    bank: "ICICI Bank",
    avatarBg: "linear-gradient(135deg, #EA580C 0%, #F58220 100%)",
    avatarText: "DS",
    story: "Most bank portals make you wait days with endless paperwork. On this website, I simply entered my net salary and uploaded 3 months' statements. The rule engine showed me pre-approved offers from ICICI and Kotak with crystal-clear EMI calculations. 100% paperless and seamless!"
  },
  {
    id: 3,
    name: "Shubham Suresh Padwal",
    role: "Operations Lead, Pune",
    loanDetails: "₹3.0 Lakh • Kotak Bank @ 10.99%",
    bank: "Kotak Bank",
    avatarBg: "linear-gradient(135deg, #059669 0%, #10B981 100%)",
    avatarText: "SP",
    story: "Needed an urgent ₹3 lakh personal loan without collateral. Comparing 12 banks in one minute helped me pick Kotak with the lowest EMI and zero hidden charges. Digital sanction took under 15 minutes and the money was credited directly to my account within 24 hours."
  }
];

const CustomerSuccessStories = () => {
  return (
    <section
      id="success-stories"
      style={{
        padding: '30px 24px 70px',
        maxWidth: '1240px',
        margin: '0 auto',
        width: '100%',
        position: 'relative',
        zIndex: 2
      }}
    >
      {/* Section Header matching exact typography rule */}
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
          Customer Success Stories
        </h2>

        {/* Orange Accent Underline Bar */}
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
          See how thousands of salaried professionals secured their dream loans with transparent terms and zero bureau drops
        </p>
      </div>

      {/* 3 Full-Width Responsive Story Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '30px',
          alignItems: 'stretch'
        }}
      >
        {storiesData.map((story) => (
          <motion.div
            key={story.id}
            whileHover={{
              y: -6,
              scale: 1.01,
              boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.08), 0 4px 14px -2px rgba(245, 130, 32, 0.15)',
              borderColor: '#F58220'
            }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 25
            }}
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              border: '1.5px solid #E5E7EB',
              padding: '38px 32px 32px',
              boxShadow: '0 6px 24px rgba(0, 0, 0, 0.03)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              transition: 'border-color 0.25s ease, background 0.25s ease'
            }}
          >
            {/* Top Card Row: Navy Blue Quotation Marks & Rating Stars */}
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '16px'
                }}
              >
                {/* Authentic Double Quote SVG Mark matching screenshot */}
                <svg width="42" height="32" viewBox="0 0 42 32" fill="none">
                  <path
                    d="M0 19.2C0 8.8 6.4 1.6 16 0L17.6 4.8C11.6 6 8.8 9.6 8.4 14.4H17.6V32H0V19.2ZM24 19.2C24 8.8 30.4 1.6 40 0L41.6 4.8C35.6 6 32.8 9.6 32.4 14.4H41.6V32H24V19.2Z"
                    fill="#1E3A8A"
                  />
                </svg>

                {/* 5-Star Trust Badge */}
                <div style={{ display: 'flex', gap: '3px' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={15} fill="#F59E0B" color="#F59E0B" />
                  ))}
                </div>
              </div>

              {/* Story Narrative Text matching screenshot styling */}
              <p
                style={{
                  fontFamily: "'Inter', -apple-system, sans-serif",
                  fontSize: '0.98rem',
                  lineHeight: '1.68',
                  color: '#374151',
                  margin: '0 0 24px 0',
                  minHeight: '110px'
                }}
              >
                {story.story}
              </p>
            </div>

            {/* Bottom Card Row: User Avatar & Identification */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                paddingTop: '18px',
                borderTop: '1px solid #F3F4F6'
              }}
            >
              {/* Circular Gradient Avatar with Initials */}
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: story.avatarBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '1rem',
                  fontFamily: "'Inter', sans-serif",
                  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                  flexShrink: 0
                }}
              >
                {story.avatarText}
              </div>

              {/* User Details */}
              <div style={{ overflow: 'hidden' }}>
                <div
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '1.02rem',
                    fontWeight: 700,
                    color: '#111827',
                    lineHeight: 1.3
                  }}
                >
                  {story.name}
                </div>
                <div
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.82rem',
                    color: '#6B7280',
                    marginTop: '2px',
                    lineHeight: 1.3
                  }}
                >
                  {story.role}
                </div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.78rem',
                    fontWeight: 650,
                    color: '#15803D',
                    marginTop: '4px'
                  }}
                >
                  <CheckCircle2 size={12} color="#16A34A" />
                  <span>{story.loanDetails}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default CustomerSuccessStories;
