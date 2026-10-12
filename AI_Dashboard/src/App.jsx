import React, { useState, useRef, useEffect } from 'react';
import {
    Droplets,
    Building2,
    Flame,
    Factory,
    Send,
    Bot,
    User,
    Sparkles,
    Terminal
} from 'lucide-react';

const ASSISTANTS = [
    {
        id: 'petroleum',
        title: 'مهندسی نفت و پتروشیمی',
        icon: Droplets,
        color: '#06b6d4',
        desc: 'مخازن، حفاری، پایپینگ و استانداردهای API'
    },
    {
        id: 'structural',
        title: 'مهندسی سازه و عمران',
        icon: Building2,
        color: '#3b82f6',
        desc: 'تحلیل المان محدود، بارگذاری و آیین‌نامه‌های AISC/ACI'
    },
    {
        id: 'metallurgy',
        title: 'متالورژی و علم مواد',
        icon: Flame,
        color: '#f97316',
        desc: 'آلیاژهای مهندسی، عملیات حرارتی و آنالیز تخریب'
    },
    {
        id: 'manufacturing',
        title: 'مهندسی ساخت و تولید',
        icon: Factory,
        color: '#10b981',
        desc: 'ماشین‌کاری CNC، فرآیندهای جوشکاری، قالب‌سازی و DFM'
    }
];

export default function App() {
    const [selectedRole, setSelectedRole] = useState('petroleum');
    const [messages, setMessages] = useState([
        { role: 'assistant', text: 'سلام! من دستیار هوشمند مهندسی صنایع سنگین شما هستم. چطور می‌توانم کمکتان کنم؟' }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e) => {
        e?.preventDefault();
        if (!inputMessage.trim() || isLoading) return;

        const userText = inputMessage;
        setInputMessage('');
        setMessages((prev) => [...prev, { role: 'user', text: userText }]);
        setIsLoading(true);

        try {
            // اتصال به پورت ۵۰۶۰ ویژه پروژه دوم
            const response = await fetch('http://localhost:5060/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    role: selectedRole,
                    message: userText
                })
            });

            if (!response.ok) {
                throw new Error(`خطای سرور: کد وضعیت ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let botResponse = '';

            setMessages((prev) => [...prev, { role: 'assistant', text: '' }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                botResponse += decoder.decode(value, { stream: true });

                setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1] = { role: 'assistant', text: botResponse };
                    return updated;
                });
            }
        } catch (error) {
            console.error('Connection error:', error);
            setMessages((prev) => [
                ...prev,
                { role: 'assistant', text: `خطا در ارتباط با سرور: ${error.message || 'عدم دسترسی به بک‌اند پروژه سنگین'}` }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const activeAssistant = ASSISTANTS.find(a => a.id === selectedRole);

    return (
        <div style={{ display: 'flex', height: '100vh', direction: 'rtl', padding: '16px', gap: '16px' }}>

            {/* سایدبار شیشه‌ای انتخاب دستیاران */}
            <aside className="glass-panel" style={{ width: '320px', borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ padding: '10px', background: 'rgba(255,255,255,0.06)', borderRadius: '16px' }}>
                        <Sparkles size={24} color="#60a5fa" />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>داشبورد صنایع سنگین</h2>
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>نفت، سازه، متالورژی و ساخت</span>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px', overflowY: 'auto' }}>
                    <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>انتخاب تخصص هوش مصنوعی:</span>
                    {ASSISTANTS.map((item) => {
                        const Icon = item.icon;
                        const isSelected = selectedRole === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setSelectedRole(item.id)}
                                className="glass-card"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '12px 14px',
                                    borderRadius: '16px',
                                    cursor: 'pointer',
                                    border: isSelected ? `1.5px solid ${item.color}` : '1px solid rgba(255,255,255,0.06)',
                                    background: isSelected ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                                    textAlign: 'right',
                                    color: '#fff',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{
                                    background: `${item.color}20`,
                                    padding: '8px',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <Icon size={18} color={item.color} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: '13px', fontWeight: '600' }}>{item.title}</div>
                                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {item.desc}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                <div style={{ marginTop: 'auto', padding: '12px 14px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Terminal size={16} color="#4ade80" />
                    <span style={{ fontSize: '12px', color: '#cbd5e1' }}>بک‌اند متصل به پورت ۵۰۶۰</span>
                </div>
            </aside>

            {/* بخش گفتگو */}
            <main className="glass-panel" style={{ flex: 1, borderRadius: '24px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

                {/* هدر چت */}
                <header style={{ padding: '18px 28px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ background: `${activeAssistant?.color}20`, padding: '10px', borderRadius: '14px' }}>
                        {activeAssistant && <activeAssistant.icon size={22} color={activeAssistant.color} />}
                    </div>
                    <div>
                        <h3 style={{ fontSize: '16px', fontWeight: '600' }}>{activeAssistant?.title}</h3>
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>{activeAssistant?.desc}</span>
                    </div>
                </header>

                {/* لیست پیام‌ها */}
                <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '12px',
                                alignSelf: msg.role === 'user' ? 'flex-start' : 'flex-end',
                                maxWidth: '75%',
                                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'
                            }}
                        >
                            <div style={{
                                background: msg.role === 'user' ? '#3b82f6' : 'rgba(255, 255, 255, 0.08)',
                                padding: '8px',
                                borderRadius: '12px',
                                display: 'flex'
                            }}>
                                {msg.role === 'user' ? <User size={18} color="#fff" /> : <Bot size={18} color="#60a5fa" />}
                            </div>

                            <div style={{
                                padding: '14px 18px',
                                borderRadius: '18px',
                                fontSize: '14px',
                                lineHeight: '1.7',
                                background: msg.role === 'user' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                                border: msg.role === 'user' ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                                color: '#f8fafc',
                                whiteSpace: 'pre-wrap'
                            }}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* کادر ورود متن */}
                <form onSubmit={handleSend} style={{ padding: '20px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '12px' }}>
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder={`از متخصص ${activeAssistant?.title} سوال بپرسید...`}
                        disabled={isLoading}
                        style={{
                            flex: 1,
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '16px',
                            padding: '14px 20px',
                            color: '#fff',
                            fontSize: '14px',
                            outline: 'none',
                            backdropFilter: 'blur(8px)'
                        }}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !inputMessage.trim()}
                        style={{
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            border: 'none',
                            borderRadius: '16px',
                            padding: '0 24px',
                            color: '#fff',
                            cursor: isLoading || !inputMessage.trim() ? 'not-allowed' : 'pointer',
                            opacity: isLoading || !inputMessage.trim() ? 0.5 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'transform 0.2s'
                        }}
                    >
                        <Send size={18} />
                    </button>
                </form>

            </main>
        </div>
    );
}
