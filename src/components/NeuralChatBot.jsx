import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Zap, Volume2, Mic, MicOff, MessageCircle, Instagram } from 'lucide-react';
import { calculateLoanEligibility } from '../services/realLoanService.js';
import { scanInstagramTrends, sendWhatsAppReport } from '../services/socialConnectors.js';
import './NeuralChatBot.css';

const NeuralChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, type: 'bot', text: 'Namaste! Laxmi Omni online. Kaise madad karun?' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isVoiceLoading, setIsVoiceLoading] = useState(false);
    const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
    const [hasMicPermission, setHasMicPermission] = useState(false);
    const [lastAiResponse, setLastAiResponse] = useState('');
    const [isSocialSync, setIsSocialSync] = useState(false);
    
    const messagesEndRef = useRef(null);
    const audioRef = useRef(new Audio());
    const recognitionRef = useRef(null);
    const isProcessingRef = useRef(false);

    const API_KEY = "AIzaSyBlI1Ub8vvBvroxCegZVnr2ZPWhkD56jfQ";

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const startLaxmiSystems = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;
        if (recognitionRef.current) return;
        
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'hi-IN';

        recognitionRef.current.onstart = () => setHasMicPermission(true);

        recognitionRef.current.onresult = async (event) => {
            if (isProcessingRef.current) return;
            
            let interimTranscript = '';
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
                else interimTranscript += event.results[i][0].transcript;
            }

            const currentSpeech = (finalTranscript || interimTranscript).trim().toLowerCase();
            if (!currentSpeech) return;

            // 🧠 SMART ECHO SHIELD
            // If Laxmi is speaking, compare transcript with her words
            if (!audioRef.current.paused) {
                const aiWords = lastAiResponse.toLowerCase().split(' ');
                const userWords = currentSpeech.split(' ');
                
                // Count how many words match Laxmi's current sentence
                const matchCount = userWords.filter(word => aiWords.some(aiW => aiW.includes(word) || word.includes(aiW))).length;
                const matchRatio = matchCount / userWords.length;

                // If user is saying something NEW (not just an echo), Trigger BARGE-IN
                if (matchRatio < 0.4 && userWords.length > 2) {
                    console.log("🛑 Barge-In Detected! User said something new:", currentSpeech);
                    audioRef.current.pause();
                    audioRef.current.currentTime = 0;
                    // Proceed to process user input
                } else {
                    // It's just an echo, ignore it
                    return;
                }
            }

            if (finalTranscript) {
                const transcript = finalTranscript.trim();
                if (transcript.length > 1) {
                    isProcessingRef.current = true;
                    setIsOpen(true);
                    setInputValue('');
                    setMessages(prev => [...prev, { id: Date.now(), type: 'user', text: transcript }]);
                    const aiResponse = await askLaxmiOmni(transcript);
                    setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', text: aiResponse }]);
                    setLastAiResponse(aiResponse);
                    await speakResponse(aiResponse);
                }
                isProcessingRef.current = false;
            }
        };

        recognitionRef.current.onend = () => {
            if (audioRef.current.paused) {
                setTimeout(() => {
                    try { recognitionRef.current.start(); } catch(e) {}
                }, 300);
            }
        };

        try { recognitionRef.current.start(); } catch(e) {}
    };

    const askLaxmiOmni = async (userQuestion) => {
        setIsTyping(true);
        const lowQ = userQuestion.toLowerCase();
        let socialData = null;
        if (lowQ.includes("instagram") || lowQ.includes("whatsapp") || lowQ.includes("trend")) {
            setIsSocialSync(true);
            if (lowQ.includes("instagram") || lowQ.includes("trend")) socialData = await scanInstagramTrends();
            if (lowQ.includes("whatsapp")) await sendWhatsAppReport("Customer", "Report ready.");
            await new Promise(r => setTimeout(r, 1000));
            setIsSocialSync(false);
        }

        // 🧠 FINANCIAL DATA EXTRACTION (Salary & EMI)
        const salaryMatch = userQuestion.match(/(?:salary|income|kamai|paisa|vetan).*?(\d+000|\d+,\d+00)/i) || userQuestion.match(/(\d+000)/);
        const emiMatch = userQuestion.match(/(?:emi|kist|loan|udhaar).*?(\d+000|\d+,\d+00)/i);
        
        let engineData = null;
        if (salaryMatch) {
            const salary = parseInt(salaryMatch[1].replace(/,/g, ''));
            const emi = emiMatch ? parseInt(emiMatch[1].replace(/,/g, '')) : 0;
            
            console.log(`📊 Extracted Financials: Salary=${salary}, EMI=${emi}`);
            
            const results = await calculateLoanEligibility({ 
                monthlyIncome: salary, 
                existingEMI: emi, 
                creditScore: 750, 
                employmentType: 'salaried',
                companyName: 'Category A' // Assume good category for general advice
            });
            
            const eligible = results.filter(r => r.eligible);
            if (eligible.length > 0) {
                // Find the best offer
                const best = eligible.reduce((prev, current) => (prev.loanAmount > current.loanAmount) ? prev : current);
                engineData = { 
                    loan: Math.round(best.loanAmount), 
                    emi: Math.round(best.monthlyEMI),
                    bank: best.bankName,
                    tenure: best.tenure || 5
                };
            } else {
                engineData = { error: "Income is too low or EMI is too high for current policies." };
            }
        }

        const laxmiMasterManifesto = `
        IDENTITY: Laxmi, the Financial Expert AI.
        ENGINE_CALCULATION: ${engineData ? JSON.stringify(engineData) : "NO DATA. ASK USER FOR SALARY/EMI."}
        SOCIAL_PULSE: ${socialData ? JSON.stringify(socialData) : "N/A"}
        CRITICAL RULE: If ENGINE_CALCULATION is provided, use those EXACT numbers. 
        Example: "Based on your 85k salary, you are eligible for ₹[loan] from [bank]."
        STRICT: Max 20 words. No hallucinations.
        USER_INPUT: "${userQuestion}"
        `;

        try {
            const response = await fetch(`http://localhost:8000/ask-laxmi`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    user_question: userQuestion,
                    manifesto: laxmiMasterManifesto 
                })
            });
            const data = await response.json();
            return data.text;
        } catch (err) {
            console.error("Local Brain Error:", err);
            return `System Offline - ${err.message}`;
        } finally {
            setIsTyping(false);
            setIsSocialSync(false);
        }
    };

    const speakResponse = async (text) => {
        if (!isVoiceEnabled) return;
        setIsVoiceLoading(true);
        try {
            const response = await fetch('http://localhost:8000/generate-voice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });
            if (response.ok) {
                const data = await response.json();
                audioRef.current.src = data.url;
                
                // 🛑 PAUSE MIC: Stop listening while Laxmi is speaking
                if (recognitionRef.current) recognitionRef.current.stop();
                
                await audioRef.current.play();
                
                return new Promise(resolve => { 
                    audioRef.current.onended = () => {
                        // 🎤 RESUME MIC: Start listening again after Laxmi finishes
                        try { recognitionRef.current.start(); } catch(e) {}
                        resolve();
                    };
                });
            }
        } catch (err) {
            console.error("Voice Error:", err);
        } finally {
            setIsVoiceLoading(false);
            isProcessingRef.current = false;
        }
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;
        const msg = inputValue;
        setInputValue('');
        setMessages(prev => [...prev, { id: Date.now(), type: 'user', text: msg }]);
        const resp = await askLaxmiOmni(msg);
        setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', text: resp }]);
        setLastAiResponse(resp);
        await speakResponse(resp);
    };

    return (
        <div className="neural-chat-widget">
            {!hasMicPermission && (
                <button className="mic-activation-btn" onClick={() => { startLaxmiSystems(); setIsOpen(true); }}>
                    <MicOff size={24} color="#ff4d4d" />
                </button>
            )}
            {hasMicPermission && (
                <div className="mic-active-indicator"><Mic size={20} color="#00ff88" /></div>
            )}
            <button className="chat-toggle-btn" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
            </button>
            {isOpen && (
                <div className="chat-window shadow-xl">
                    <div className="chat-header">
                        <div className="bot-avatar"><Zap size={20} fill="#00ff88" stroke="transparent" /></div>
                        <div className="chat-header-info"><h4>Laxmi Omni</h4><span>Active</span></div>
                    </div>
                    <div className="messages-container">
                        {messages.map(msg => (
                            <div key={msg.id} className={`message ${msg.type}`}>
                                {msg.text}
                                {msg.type === 'bot' && (
                                    <button className="play-bubble-btn" onClick={() => speakResponse(msg.text)}><Volume2 size={12} /></button>
                                )}
                            </div>
                        ))}
                        {isSocialSync && <div className="status-item pulsing-pink">Syncing Social Pulse...</div>}
                        {isTyping && !isSocialSync && <div className="typing-indicator">Laxmi is thinking...</div>}
                        <div ref={messagesEndRef} />
                    </div>
                    <form className="chat-input-area" onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}>
                        <input value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Speak or Type..." />
                        <button type="submit" className="send-btn"><Send size={18} /></button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default NeuralChatBot;
