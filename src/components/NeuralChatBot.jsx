import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Cpu, Zap, Mail, ChevronRight } from 'lucide-react';
import './NeuralChatBot.css';

const NeuralChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, type: 'bot', text: 'Neural systems online. I am the Laxmi Neural Assistant. How can I assist with your eligibility analysis today?' }
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

    // The Massive Knowledge Base
    const qaPairs = [
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
        { keywords: ['free', 'cost', 'charge'], answer: "Yes. Laxmi Credit is 100% free for customers. We are compensated directly by our banking partners." }
    ];

    const findOptimalResponse = (input) => {
        const normalizedInput = input.toLowerCase();

        // Find match with highest keyword overlap
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

        if (maxOverlap > 0) return bestMatch;

        // Fallback for "out of league" questions
        return "I am sorry, but my neural processors are currently optimized for financial eligibility inquiries. For this specific question, you need to contact our human support team at dikshantsingh@laxmicredit.com.";
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
        "What is the min salary?",
        "Check CIBIL impact?",
        "Kotak Bank rules?",
        "Contact Founder?"
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
                            <h4>Neural Assistant</h4>
                            <span><Zap size={10} fill="#00ff88" stroke="transparent" /> Systems Online</span>
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
                                // Self-triggering send logic after a tiny delay
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

                    <form className="chat-input-area" onSubmit={handleSendMessage}>
                        <input
                            type="text"
                            placeholder="Ask me about eligibility, CIBIL, or policies..."
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
