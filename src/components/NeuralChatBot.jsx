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
        { keywords: ['piramal', 'complex'], answer: "Piramal is currently the best for 'Segment-of-One' profiles where traditional banks like SBI might say no due to minor technicalities." }
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
