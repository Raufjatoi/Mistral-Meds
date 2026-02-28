import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot as BotIcon, User, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Configure Groq API endpoint
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'moonshotai/kimi-k2-instruct-0905';

export default function Bot() {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: "Hello! I'm your Moonshot-powered Health Assistant. Tell me your symptoms or a medicine brand, and I'll suggest generic formulas and related conditions. Always consult a real doctor for medical advice."
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const systemPrompt = `You are a helpful and safe health assistant. 
Your job is to:
1. Suggest possible conditions based on symptoms.
2. Recommend GENERIC formulas for those conditions (not brands).
3. If users give a brand name, explain its generic formula.
4. Always add a short disclaimer to consult a doctor. Keep responses concise, simple, and formatted in Markdown.
You are powered by the Mistral model and Groq API.`;

            // System prompt must be the very first message
            const conversationHistory = messages.slice(1).map(m => ({ role: m.role, content: m.content }));

            const apiMessages = [
                { role: 'system', content: systemPrompt },
                ...conversationHistory,
                { role: 'user', content: userMessage }
            ];

            const apiKey = import.meta.env.VITE_GROQ_API_KEY;
            if (!apiKey) {
                throw new Error("Missing VITE_GROQ_API_KEY in environment variables.");
            }

            const response = await fetch(GROQ_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: MODEL,
                    messages: apiMessages,
                    temperature: 0.5,
                    max_tokens: 500,
                })
            });

            if (!response.ok) {
                let errorMessage = response.statusText;
                try {
                    const errorBody = await response.json();
                    // Read Groq's detailed error message
                    errorMessage = errorBody.error?.message || JSON.stringify(errorBody);
                } catch (e) {
                    // fall back to statusText
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            const botResponse = data.choices[0]?.message?.content || "Sorry, I couldn't process that.";

            setMessages(prev => [...prev, { role: 'assistant', content: botResponse }]);

        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `**Error:** ${error.message} \n\nPlease ensure your API key is correctly configured via .env.`
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="animate-in fade-in duration-500 max-w-4xl mx-auto flex flex-col h-[calc(100vh-140px)]">
            {/* Global background for Bot page */}
            <div className="fixed inset-0 bg-mistral-studio -z-10 pointer-events-none" />

            <div className="text-center mb-8 shrink-0">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-md mb-4 shadow-sm border border-white/30">
                    <BotIcon className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-light mb-2 text-white tracking-tight drop-shadow-sm">AI Health Assistant</h2>
                <p className="text-orange-100 max-w-lg mx-auto drop-shadow-sm">
                    Describe your symptoms or ask about specific medications securely.
                </p>
            </div>

            <div className="bg-white/95 backdrop-blur-md border border-white/50 rounded-xl p-4 mb-6 flex items-start gap-3 shadow-sm shrink-0 mx-4 md:mx-0">
                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm leading-relaxed text-gray-800">
                    This AI is for informational purposes only. Do not use this over professional medical advice. Always consult a doctor or healthcare provider for serious symptoms.
                </p>
            </div>

            <div className="flex-1 bg-[#F8F9FA] bg-dot-pattern border border-gray-200/60 rounded-3xl xl:shadow-2xl shadow-xl overflow-hidden flex flex-col relative mx-4 md:mx-0">
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 relative z-10">
                    <AnimatePresence initial={false}>
                        {messages.map((msg, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border ${msg.role === 'user' ? 'bg-mistral-light border-gray-200' : 'bg-mistral-dark text-white border-mistral-dark'
                                    }`}>
                                    {msg.role === 'user' ? <User className="w-5 h-5 text-gray-600" /> : <BotIcon className="w-5 h-5 text-white cursor-pulse" />}
                                </div>

                                <div className={`max-w-[85%] rounded-2xl px-5 py-4 text-sm md:text-base ${msg.role === 'user' ? 'bg-gray-100 text-gray-900' : 'bg-white border border-gray-100 shadow-sm text-gray-800'
                                    }`}>
                                    <div className={`prose prose-sm md:prose-base max-w-none ${msg.role === 'user' ? '' : 'prose-headings:text-gray-900 prose-a:text-mistral-accent prose-strong:text-gray-900 prose-ul:my-2 prose-li:my-0 pb-1'}`}>
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {msg.content}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {isLoading && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-mistral-dark flex items-center justify-center border border-mistral-dark">
                                <BotIcon className="w-5 h-5 text-white" />
                            </div>
                            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl px-5 py-4 flex items-center gap-2">
                                <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                                <span className="text-gray-500 text-sm">Thinking...</span>
                            </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-gray-50/50 border-t border-gray-100">
                    <form onSubmit={handleSubmit} className="relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={isLoading}
                            placeholder="Type your symptoms or ask about a brand..."
                            className="w-full pl-5 pr-14 py-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-mistral-accent/30 focus:border-mistral-accent transition-shadow text-gray-800 shadow-sm disabled:opacity-50"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className="absolute right-2 top-2 bottom-2 bg-mistral-dark text-white p-2.5 rounded-lg hover:bg-black transition-colors disabled:opacity-50 flex items-center justify-center group"
                        >
                            <Send className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
