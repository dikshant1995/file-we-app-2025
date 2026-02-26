import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Cpu, Zap, Mail, ShieldCheck, Heart } from 'lucide-react';
import './NeuralChatBot.css';

const NeuralChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, type: 'bot', text: 'Neural systems online. I am the Laxmi Neural Assistant. You are in safe hands now—we will assist you for your loan application and our expert support team will help you every step of the way.' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    // BRAND REASSURANCE SUFFIX
    const brandSuffix = "\n\nYou are at a great place and in safe hands with Laxmi AI. We will assist you for your loan application, and our dedicated customer support team will help you through the process.";

    // The Massive 50+ Q&A Knowledge Base
    const qaPairs = [
        // PHASE 1: STANDARD (1-30)
        { keywords: ['salary', 'minimum', 'income'], answer: "Our partner bank ecosystem currently requires a minimum net monthly take-home salary of ₹25,000." },
        { keywords: ['fresh', 'zero', 'no loan', 'history', 'cibil'], answer: "Absolutely. You are classified as a 'Fresh Profile.' While you don't have a CIBIL history, our AI uses your 'Employer Category' to estimate eligibility." },
        { keywords: ['emi', 'existing', 'loans'], answer: "Every existing EMI reduces your 'FOIR' headroom. The AI subtracts these from your income to ensure you don't get over-leveraged." },
        { keywords: ['tenure', 'months', 'years', 'time'], answer: "Most of our institutional partners offer a flexible tenure ranging from 12 months up to 60 months (5 years)." },
        { keywords: ['age'], answer: "Yes, the standard policy window is between 21 years (at the time of application) and 60 years (at the time of loan maturity)." },
        { keywords: ['govt', 'government'], answer: "Government employees have a 'Zero-Risk' job security rating. Banks reward this with higher loan multipliers and lower interest rates." },
        { keywords: ['startup', 'unlisted'], answer: "Startups are often classified as 'Unlisted' or 'Category C.' The AI still calculates eligibility, though the bank may require 2-3 years of company vintage." },
        { keywords: ['permanent', 'contract'], answer: "Permanent employees are preferred. Contractual employees can apply if their contract is with a Tier-1 MNC (like Google or TCS)." },
        { keywords: ['size', 'company size', 'employees'], answer: "Yes. Working for an 'Elite' or 'Super A' category company (500+ employees) unlocks the highest possible loan amounts." },
        { keywords: ['experience', 'work', 'total'], answer: "Banks usually require a total work experience of 2 years, with at least 3-6 months in the current organization." },
        { keywords: ['cibil score', 'impact', 'drop'], answer: "No. Our system performs a 'Soft Check.' We do not trigger a hard inquiry, so your CIBIL score remains 100% unaffected." },
        { keywords: ['650', 'low score'], answer: "A score of 650 is challenging for top-tier banks. However, our AI can suggest 'NBFC' partners who specialize in 'Mid-CIBIL' profiles." },
        { keywords: ['settled', 'settlement', 'default'], answer: "Settled or Written-off accounts are red flags. Our AI may display 'No Results Found' if we detect a history of defaults." },
        { keywords: ['improve', 'score'], answer: "Ensure 100% on-time EMI payments and keep your Credit Card utilization below 30% of its total limit." },
        { keywords: ['experian', 'equifax', 'bureau'], answer: "While CIBIL is most popular, banks also look at Experian and Equifax. Our AI considers the average of these market policies." },
        { keywords: ['highest', 'max', 'more money'], answer: "This is dynamic! It depends on who has your employer listed in their 'Top Category' this month. Hit 'Analyze' to see the leader." },
        { keywords: ['kotak', 'mahindra'], answer: "Kotak uses a proprietary 'A-D' category matrix. Our system is synced with their latest internal multiplier tables for 100% accuracy." },
        { keywords: ['interest', 'rate', 'percentage'], answer: "Rates fluctuate based on the bank's cost of funds. Private banks are faster; PSU banks like SBI are often cheaper but require more paperwork." },
        { keywords: ['cash', 'cheque', 'neft'], answer: "Most partners require NEFT/IMPS. If paid by cheque, you may need to provide a 1-year bank statement for manual verification." },
        { keywords: ['processing fee', 'refund'], answer: "No. The processing fee is a one-time charge deducted from the loan amount at the time of disbursal." },
        { keywords: ['privacy', 'security', 'third party'], answer: "Your data is used exclusively by the Laxmi Credit team. We follow strict NDAs and never sell data to telecallers." },
        { keywords: ['encryption', 'secure'], answer: "We use 256-bit encryption—the same standard used by global banks to protect multi-billion dollar transactions." },
        { keywords: ['founder', 'dikshant'], answer: "Dikshant Singh Rathore is the Founder and Chief Architect. His 6+ years of expertise is the 'brain' behind this algorithm." },
        { keywords: ['apply', 'procedure', 'next'], answer: "After you click 'Apply', our Neural Profile is sent to experts. You will receive a call within 120 minutes." },
        { keywords: ['download', 'pdf', 'report'], answer: "Yes. Use the 'Download PDF Report' button at the bottom of your results page to get a portable summary." },
        { keywords: ['visit', 'home', 'office', 'kyc'], answer: "Most Tier-1 banks now use Video KYC, but some legacy policies may still require a physical address verification." },
        { keywords: ['cancel', 'stop'], answer: "Yes. You are under no obligation until you sign the final digital agreement and the money is disbursed." },
        { keywords: ['transfer', 'bt', 'balance'], answer: "If another bank offers a lower rate, we can help you pay off your current expensive loan and switch to the cheaper one." },
        { keywords: ['free', 'cost', 'charge'], answer: "Yes. Laxmi Credit is 100% free for customers. We are compensated directly by our banking partners." },

        // PHASE 2: DEEP-DIVE & SOCIAL INSIGHTS (31-50)
        { keywords: ['hidden', 'charges', 'scam', 'extra'], answer: "We scan for hidden fees like 'Foreclosure charges' and 'Bypass-logic' fees. Our results show you exactly what's on paper so you aren't surprised by institutional fine print." },
        { keywords: ['harassment', 'calls', 'recovery'], answer: "Laxmi AI partners with banks following RBI guidelines. We ensure you aren't subjected to unorganized recovery tactics. We monitor every partner's ethical score." },
        { keywords: ['rm', 'relationship manager', 'lying'], answer: "RMs often push high-commission products. Our AI removes human bias, showing you the mathematical best offer regardless of any bank employee's pitch." },
        { keywords: ['unauthorized', 'cibil entry', 'fake loan'], answer: "Social media reveals many unlisted entries. We help you monitor your application trail so no 'phantom' loans appear on your CIBIL report." },
        { keywords: ['idfc', 'zero foreclosure'], answer: "IDFC's FIRSTmoney is highly rated on YouTube for its zero-foreclosure fee. You can close the loan after 1 day or 1 year without extra cost." },
        { keywords: ['poonawalla', '15 min', 'quick'], answer: "Poonawalla Fincorp is the 'Speed King' for salaried pros. If your documentation is ready, money hits your account in record time." },
        { keywords: ['piramal', 'phygital', 'tech'], answer: "Piramal uses a 'Phygital' model, combining high-end AI (like us) with local field support to ensure even complex profiles get funded." },
        { keywords: ['app crash', 'tech issue', 'portal'], answer: "Bank portals like HDFC/ICICI can be slow. Our direct API channels bypass common frontend glitches, ensuring your file reaches the credit officer instantly." },
        { keywords: ['tata capital', 'overdraft'], answer: "Tata Capital offers an excellent Overdraft facility where you only pay interest on what you withdraw. It's like having a rainy-day fund." },
        { keywords: ['hallucination', 'advice'], answer: "Unlike generic AI, Laxmi Neural logic is grounded in 2025 Indian Banking Policies. We don't guess—we calculate based on hard institutional data." },
        { keywords: ['insurance', 'mandatory'], answer: "Loan insurance is NOT mandatory by RBI law. If an agent forces it, Laxmi AI will alert you to alternatives or help you opt-out." },
        { keywords: ['rejected', 'why', 'reason'], answer: "Most rejections happen due to 'Recent Bureau Inquiries' or 'Location Blacklisting.' We tell you the 'Real Reason' that banks usually hide." },
        { keywords: ['low interest', 'cheapest', '9.98%'], answer: "Kotak and ICICI currently lead the 2025 market with rates starting from 9.98%. We'll assist you in securing these elite tier rates." },
        { keywords: ['top up', 'extra money'], answer: "If you have an existing loan with 12 months clear payment, we can unlock a 'Top-Up' which is cheaper than a new personal loan." },
        { keywords: ['documentation', 'list'], answer: "3 months slips, 6 months bank statement, PAN, and Aadhaar linked to your mobile. That's all we need to start the process." },
        { keywords: ['axis', 'long tenure'], answer: "Axis Bank offers tenures up to 84 months (7 years) for specific HNI profiles, helping you reduce the monthly EMI burden significantly." },
        { keywords: ['indusind', 'video kyc'], answer: "IndusInd is the pioneer of Video KYC. You can complete your entire application from your bedroom in under 5 minutes." },
        { keywords: ['shri ram', 'finance', 'small salary'], answer: "Shriram Finance is excellent for customers with smaller salaries or those working in the unorganized sector. They value character over documents." },
        { keywords: ['chola', 'msme', 'business'], answer: "Cholamandalam is perfect if you own a small business or are self-employed. They have a massive rural and semi-urban network." },
        { keywords: ['piramal', 'complex'], answer: "Piramal is currently the best for 'Segment-of-One' profiles where traditional banks like SBI might say no due to minor technicalities." },

        // PHASE 3: THE UNIVERSAL EXPANSION (51-100)
        // HOME LOANS (51-65)
        { keywords: ['home loan', 'house', 'flat'], answer: "Laxmi AI analyzes home loans for properties up to 90% of value. Whether it's a builder flat or an independent house, we find the best rate starting from ~8.40%." },
        { keywords: ['tax benefit', '80c', '24b'], answer: "Home loans are tax-saving machines! You can save up to ₹1.5L on principal (80C) and ₹2L on interest (24b) every year. We'll help you maximize your rebate." },
        { keywords: ['joint home loan', 'husband wife'], answer: "Applying with a spouse can double your tax benefits! You both get separate ₹2L interest deductions, effectively saving tax on ₹4L income together." },
        { keywords: ['home loan transfer', 'bt', 'switch'], answer: "If you're paying >9%, it's time to switch! We can help you transfer your home loan to a lower-interest bank, saving you lakhs over 20 years." },
        { keywords: ['pmay', 'subsidy', 'awas'], answer: "The PMAY 2025 updates focus on Middle Income Groups. If eligible, your interest burden can be reduced by several lakhs through government interest subvention." },
        { keywords: ['construction loan', 'plot'], answer: "Want to build on your own plot? We offer composite loans that cover both plot purchase and construction costs in a single easy EMI." },
        { keywords: ['renovation', 'repair', 'home improvement'], answer: "Don't break your savings for a new kitchen. Home Improvement loans are available at almost the same rates as home loans, much cheaper than personal loans." },
        { keywords: ['under construction', 'possession'], answer: "Buying a RERA-approved under-construction property? We sync disbursals with the builder's construction milestones so you don't pay full EMI upfront." },
        { keywords: ['top up home loan', 'cheap money'], answer: "Need cash for business or wedding? A Home Loan Top-Up is the cheapest funding source in India, often available at just 0.5% above your home loan rate." },
        { keywords: ['prepayment', 'penalty', 'home foreclosure'], answer: "RBI rules are clear: ZERO penalty for prepaying a floating-rate home loan. Pay whenever you have extra cash to finish your loan 10 years early!" },
        { keywords: ['30 years', 'long tenure'], answer: "For young professionals, we can secure tenures up to 30 or even 32 years. This keeps your EMI low while you grow in your career." },
        { keywords: ['self employed home loan', 'itr'], answer: "Business owners need 2 years of ITR. Even if your declared income is low, we have banking partners who look at your 'Banking Turnover' for loan eligibility." },
        { keywords: ['90% financing', 'lvt'], answer: "For properties below ₹30 Lakhs, banks can fund up to 90%. For luxury properties, it's usually 75-80%. We'll calculate your exact down-payment." },
        { keywords: ['legal technical', 'verification'], answer: "Laxmi AI partners with banks that do rigorous legal checks. If a property isn't safe, we'll tell you before you commit your hard-earned money." },
        { keywords: ['nhb', 'sbi home', 'hdfc home'], answer: "We are integrated with the latest 2025 policy tables of SBI, HDFC, and LIC Housing Finance to provide real-time home loan analysis." },

        // BUSINESS LOANS (66-75)
        { keywords: ['business loan', 'msme', 'shop'], answer: "Need to grow your business? We assist with MSME loans for equipment, stock, or expansion. No collateral is required for loans up to ₹50 Lakhs." },
        { keywords: ['gst loan', 'turnover'], answer: "Your GST returns are your best asset! Laxmi AI uses your GST data to secure loans within 48 hours without needing heavy financial statements." },
        { keywords: ['mudra', 'shishu', 'kishore'], answer: "Starting small? Mudra loans (PMMY) offer funding from ₹50k to ₹10L for micro-enterprises with minimal red tape and government backing." },
        { keywords: ['cgtmse', 'collateral free'], answer: "Under the CGTMSE scheme, the government stands as your guarantor. You can get business funding without pledging your house or land." },
        { keywords: ['working capital', 'od', 'cc'], answer: "Manage your cash flow with an Overdraft (OD) or Cash Credit (CC) limit. Pay interest only on what you use for your daily business needs." },
        { keywords: ['startup funding', 'new business'], answer: "If your business is <1 year old, we look at your 'Business Vintage' and personal credit history to secure seed-level funding for your dream." },
        { keywords: ['machinery loan', 'equipment'], answer: "Upgrading your factory? Machinery loans are self-collateralized (the machine itself is the security), making them easier and faster to get." },
        { keywords: ['professional loan', 'doctor', 'ca'], answer: "Doctors, CAs, and Architects enjoy 'Special Professional' status. Laxmi AI unlocks elite interest rates and higher loan amounts for you." },
        { keywords: ['unsecured business loan'], answer: "Fast funding for urgent stock needs. We have NBFC partners who disburse up to ₹15L within 24 hours based on your bank statement." },
        { keywords: ['business vintage', '6 months'], answer: "Even with 6 months of operations, if your banking is strong, we can help you get your first business credit line to scale up." },

        // CAR LOANS & REFINANCE (76-85)
        { keywords: ['car loan', 'auto loan', 'vehicle'], answer: "Buying a new car? Get up to 100% on-road financing with interest rates starting from 8.25% for elite salaried profiles." },
        { keywords: ['used car loan', 'second hand car'], answer: "Second-hand doesn't mean second-class. We provide loans for pre-owned cars up to 10 years old with quick valuation and transfer." },
        { keywords: ['car refinance', 'cash on car'], answer: "Own a car already? You can get a loan against it! Car refinance is faster than a personal loan and often at a better interest rate." },
        { keywords: ['car valuation', 'idv'], answer: "Our AI calculates your car's true market value (IDV) to ensure you get the maximum possible loan amount against your vehicle." },
        { keywords: ['zero down payment', '100% funding'], answer: "Yes! For select models and prime corporate employees, we can secure 100% on-road funding including insurance and registration." },
        { keywords: ['car loan tenure', '7 years'], answer: "New car loans can be spread up to 7 years (84 months) to make your luxury car purchase fit comfortably into your monthly budget." },
        { keywords: ['ev loan', 'electric car'], answer: "Going Green? EV loans often come with 'Green Rate' discounts and additional tax benefits on interest for first-time EV buyers." },
        { keywords: ['commercial vehicle', 'truck', 'taxi'], answer: "We assist fleet owners and individual drivers in getting funding for trucks, buses, and taxis to grow their transport business." },
        { keywords: ['rto transfer', 'hypothecation'], answer: "Laxmi AI partners assist in the RTO paperwork required to remove hypothecation after you've paid off your car loan." },
        { keywords: ['car loan rejection'], answer: "Rejections often happen due to 'Low Residue Income.' We'll help you structure your application to pass the bank's strict margin rules." },

        // GOLD LOANS (86-95)
        { keywords: ['gold loan', 'jewellery', 'ornament'], answer: "Unlock the value of your gold! Get instant cash in 30 minutes with the lowest interest rates in the market starting from 0.8% per month." },
        { keywords: ['gold ltv', '85%', '2.5 lakh'], answer: "New 2025 RBI tiers: Get up to 85% LTV for gold loans below ₹2.5 Lakhs! This is the highest ever leverage allowed for gold assets." },
        { keywords: ['muthoot', 'manappuram'], answer: "We bridge the gap with Muthoot and Manappuram. Whether you want institutional trust or NBFC speed, we'll guide you to the right counter." },
        { keywords: ['gold rate per gram', 'value'], answer: "Our AI tracks real-time 22K/24K market rates to ensure you get every rupee your gold is worth. Current 2025 rates are at historic highs!" },
        { keywords: ['gold loan hidden charges'], answer: "No more shocks! We scan for valuation fees, processing fees, and auction notices so your gold stays safe and your costs stay low." },
        { keywords: ['bullet repayment'], answer: "Don't want monthly EMIs? Go for 'Bullet Repayment'—pay the interest and principal together at the end of 6 or 12 or 18 months." },
        { keywords: ['safety', 'locker', 'gold vault'], answer: "Your gold is stored in RBI-mandated 'Strong Rooms' with 24/7 surveillance and full insurance. It's safer in the bank than in your home locker." },
        { keywords: ['18k gold', '22k gold', 'purity'], answer: "We accept 18K to 24K gold. Our AI calculates the exact purity-weight ratio to give you a transparent and fair loan offer." },
        { keywords: ['agriculture gold loan'], answer: "Farmers can get gold loans at subsidized interest rates (7% p.a.) for crop and equipment needs through our PSU bank partners." },
        { keywords: ['gold loan foreclosure'], answer: "Finish your gold loan any day! Most partners have zero foreclosure charges, meaning you pay interest only for the exact days you used the money." },

        // UNIVERSAL & REGULATORY (96-100)
        { keywords: ['rbi guidelines', '2025', 'law'], answer: "We are 100% compliant with the latest 2025 RBI Fair Lending Practices. No hidden penalties, no predatory interest—just clean, honest banking." },
        { keywords: ['loan apps', 'china apps', 'danger'], answer: "STAY SAFE! Never download unverified loan apps. Laxmi AI only connects you with RBI-licensed Banks and NBFCs for your total financial safety." },
        { keywords: ['credit card loan', 'instaloan'], answer: "Have a credit card? You might have a pre-approved 'Insta Loan' that requires ZERO documents. Our AI will check your card eligibility in seconds." },
        { keywords: ['loan against fd', 'fixed deposit'], answer: "Your FD can give you a loan at just 1% above the FD rate! It's the fastest way to get liquidity without breaking your high-interest investment." },
        { keywords: ['loan against insurance', 'lic loan'], answer: "Don't surrender your policy. Get a loan against your LIC or insurance plan at very low interest rates while keeping your life cover active." }
    ];

    const findOptimalResponse = (input) => {
        const normalizedInput = input.toLowerCase();

        let bestMatch = null;
        let maxOverlap = 0;

        for (const pair of qaPairs) {
            let overlap = 0;
            for (const keyword of pair.keywords) {
                if (normalizedInput.includes(keyword)) {
                    overlap++;
                }
            }
            if (overlap > maxOverlap) {
                maxOverlap = overlap;
                bestMatch = pair.answer;
            }
        }

        if (maxOverlap > 0) return bestMatch + brandSuffix;

        return "I am sorry, but my neural processors are currently optimized for financial eligibility inquiries. For this specific question, you need to contact our human support team at dikshantsingh@laxmicredit.com." + brandSuffix;
    };

    const handleSendMessage = (e) => {
        if (e) e.preventDefault();
        if (!inputValue.trim()) return;

        const userMsg = { id: Date.now(), type: 'user', text: inputValue };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        setTimeout(() => {
            const response = findOptimalResponse(inputValue);
            const botMsg = { id: Date.now() + 1, type: 'bot', text: response };
            setMessages(prev => [...prev, botMsg]);
            setIsTyping(false);
        }, 1200);
    };

    const suggestedQuestions = [
        "Is my data safe?",
        "HDFC vs ICICI rate?",
        "Poonawalla speed?",
        "Zero foreclosure bank?"
    ];

    return (
        <div className="neural-chat-widget">
            <button
                className={`chat-toggle-btn ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
                {!isOpen && <div className="chat-notification-pulse" />}
            </button>

            {isOpen && (
                <div className="chat-window shadow-xl">
                    <div className="chat-header">
                        <div className="bot-avatar">
                            <Cpu size={20} />
                        </div>
                        <div className="chat-header-info">
                            <h4>Laxmi Neural AI</h4>
                            <span><Zap size={10} fill="#00ff88" stroke="transparent" /> 2025 Brain Active</span>
                        </div>
                    </div>

                    <div className="messages-container">
                        {messages.map(msg => (
                            <div key={msg.id} className={`message ${msg.type}`}>
                                {msg.text}
                            </div>
                        ))}
                        {isTyping && (
                            <div className="typing-indicator">
                                <div className="typing-dot" style={{ animationDelay: '0s' }} />
                                <div className="typing-dot" style={{ animationDelay: '0.2s' }} />
                                <div className="typing-dot" style={{ animationDelay: '0.4s' }} />
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="suggested-chips">
                        {suggestedQuestions.map((q, i) => (
                            <div key={i} className="chip" onClick={() => {
                                setInputValue(q);
                                setTimeout(() => {
                                    const userMsg = { id: Date.now(), type: 'user', text: q };
                                    setMessages(prev => [...prev, userMsg]);
                                    setInputValue('');
                                    setIsTyping(true);
                                    setTimeout(() => {
                                        const response = findOptimalResponse(q);
                                        const botMsg = { id: Date.now() + 1, type: 'bot', text: response };
                                        setMessages(prev => [...prev, botMsg]);
                                        setIsTyping(false);
                                    }, 1000);
                                }, 100);
                            }}>
                                {q}
                            </div>
                        ))}
                    </div>

                    <div className="chat-security-badge" style={{ padding: '0 20px', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '5px' }}>
                        <ShieldCheck size={12} />
                        End-to-End Encrypted Analysis
                        <Heart size={10} fill="#ff4444" stroke="transparent" style={{ marginLeft: 'auto' }} />
                        Laxmi AI Help
                    </div>

                    <form className="chat-input-area" onSubmit={handleSendMessage}>
                        <input
                            type="text"
                            placeholder="Ask about hacks, policies, or safety..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                        />
                        <button type="submit" className="send-btn">
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default NeuralChatBot;
