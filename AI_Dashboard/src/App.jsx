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
    Plus,
    Trash2,
    MessageSquare
} from 'lucide-react';

const ASSISTANTS = [
    {
        id: 'petroleum',
        title: 'مهندسی نفت و پتروشیمی',
        icon: Droplets,
        accentColor: '#00e5ff',
        gradient: 'linear-gradient(135deg, #00c6ff, #0072ff)',
        desc: 'مخازن، حفاری، پایپینگ و استانداردهای API',
        initialGreeting: 'سلام! من مشاور ارشد مهندسی نفت و پتروشیمی هستم. سوال یا پروژه مورد نظر خود را بفرمایید.'
    },
    {
        id: 'structural',
        title: 'مهندسی سازه و عمران',
        icon: Building2,
        accentColor: '#a855f7',
        gradient: 'linear-gradient(135deg, #c084fc, #9333ea)',
        desc: 'تحلیل المان محدود، بارگذاری و آیین‌نامه‌ها',
        initialGreeting: 'سلام! مشاور تخصصی تحلیل سازه، بتن، فولاد و استانداردهای عمرانی در خدمت شماست.'
    },
    {
        id: 'metallurgy',
        title: 'متالورژی و علم مواد',
        icon: Flame,
        accentColor: '#ff2a85',
        gradient: 'linear-gradient(135deg, #ff2a85, #ff73a8)',
        desc: 'آلیاژهای مهندسی، عملیات حرارتی و آنالیز تخریب',
        initialGreeting: 'درود! متخصص علم مواد و متالورژی صنعتی آماده بررسی انتخاب آلیاژ و دیاگرام‌های فازی است.'
    },
    {
        id: 'manufacturing',
        title: 'مهندسی ساخت و تولید',
        icon: Factory,
        accentColor: '#38bdf8',
        gradient: 'linear-gradient(135deg, #38bdf8, #0284c7)',
        desc: 'ماشین‌کاری CNC، فرآیندهای جوشکاری، قالب‌سازی',
        initialGreeting: 'سلام! مشاور طراحی فرآیند ساخت، تلرانس‌های هندسی (GD&T) و فرآیندهای تولید آماده گفتگوست.'
    }
];

export default function App() {
    const [selectedRole, setSelectedRole] = useState(ASSISTANTS[0].id);

    const [sessions, setSessions] = useState([
        {
            id: 'session-1',
            roleId: 'petroleum',
            title: 'گفتگوی نفت و پتروشیمی',
            createdAt: new Date(),
            messages: [
                { role: 'assistant', content: ASSISTANTS[0].initialGreeting }
            ]
        }
    ]);

    const [currentSessionId, setCurrentSessionId] = useState('session-1');
    const [inputPrompt, setInputPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const abortControllerRef = useRef(null);
    const messagesEndRef = useRef(null);

    // استخراج نشست و دستیار فعال
    const currentSession = sessions.find((s) => s.id === currentSessionId) || sessions[0];
    const currentAssistant = ASSISTANTS.find((a) => a.id === selectedRole) || ASSISTANTS[0];

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [currentSession?.messages]);

    const handleCreateNewChat = (targetRole = selectedRole) => {
        if (isLoading && abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        const roleInfo = ASSISTANTS.find((a) => a.id === targetRole) || ASSISTANTS[0];
        const newSessionId = `session-${Date.now()}`;
        const newSession = {
            id: newSessionId,
            roleId: targetRole,
            title: `گفتگوی جدید ${roleInfo.title.split(' ')[1] || ''}`,
            createdAt: new Date(),
            messages: [
                { role: 'assistant', content: roleInfo.initialGreeting }
            ]
        };

        setSessions((prev) => [newSession, ...prev]);
        setCurrentSessionId(newSessionId);
        setSelectedRole(targetRole);
        setIsLoading(false);
    };

    const handleRoleChange = (newRoleId) => {
        if (newRoleId === selectedRole) return;
        handleCreateNewChat(newRoleId);
    };

    const handleDeleteSession = (e, idToDelete) => {
        e.stopPropagation();
        const updated = sessions.filter((s) => s.id !== idToDelete);
        if (updated.length === 0) {
            const newId = `session-${Date.now()}`;
            const defaultRole = ASSISTANTS[0];
            setSessions([
                {
                    id: newId,
                    roleId: defaultRole.id,
                    title: 'گفتگوی جدید',
                    createdAt: new Date(),
                    messages: [{ role: 'assistant', content: defaultRole.initialGreeting }]
                }
            ]);
            setCurrentSessionId(newId);
            setSelectedRole(defaultRole.id);
        } else {
            setSessions(updated);
            if (currentSessionId === idToDelete) {
                setCurrentSessionId(updated[0].id);
                setSelectedRole(updated[0].roleId);
            }
        }
    };

    const handleSend = async () => {
        const text = inputPrompt.trim();
        if (!text || isLoading) return;

        setInputPrompt('');
        setIsLoading(true);

        const userMsg = { role: 'user', content: text };

        setSessions((prev) =>
            prev.map((s) => {
                if (s.id === currentSessionId) {
                    const isFirst = s.messages.filter((m) => m.role === 'user').length === 0;
                    return {
                        ...s,
                        title: isFirst ? (text.slice(0, 22) + (text.length > 22 ? '...' : '')) : s.title,
                        messages: [...s.messages, userMsg, { role: 'assistant', content: '' }]
                    };
                }
                return s;
            })
        );

        abortControllerRef.current = new AbortController();

        try {
            const historyToSend = [...currentSession.messages, userMsg].map((m) => ({
                role: m.role,
                content: m.content
            }));

            const response = await fetch('http://localhost:5060/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                signal: abortControllerRef.current.signal,
                body: JSON.stringify({
                    role: selectedRole,
                    prompt: text,
                    history: historyToSend
                })
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });

                setSessions((prev) =>
                    prev.map((s) => {
                        if (s.id === currentSessionId) {
                            const newMsgs = [...s.messages];
                            const lastIndex = newMsgs.length - 1;
                            newMsgs[lastIndex] = {
                                ...newMsgs[lastIndex],
                                content: newMsgs[lastIndex].content + chunk
                            };
                            return { ...s, messages: newMsgs };
                        }
                        return s;
                    })
                );
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Chat error:', error);
                setSessions((prev) =>
                    prev.map((s) => {
                        if (s.id === currentSessionId) {
                            const newMsgs = [...s.messages];
                            const lastIndex = newMsgs.length - 1;
                            newMsgs[lastIndex] = {
                                ...newMsgs[lastIndex],
                                content: 'متأسفانه در دریافت پاسخ از سرور خطایی رخ داد.'
                            };
                            return { ...s, messages: newMsgs };
                        }
                        return s;
                    })
                );
            }
        } finally {
            setIsLoading(false);
            abortControllerRef.current = null;
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div
            dir="rtl"
            style={{
                position: 'fixed',
                inset: 0,
                width: '100vw',
                height: '100vh',
                display: 'grid',
                gridTemplateColumns: '270px 1fr 310px',
                background: 'linear-gradient(135deg, #0e0725 0%, #170936 45%, #230847 100%)',
                color: '#f8fafc',
                overflow: 'hidden',
                fontFamily: 'system-ui, -apple-system, sans-serif'
            }}
        >
            {/* گوی‌های درخشان نئونی پس‌زمینه */}
            <div
                style={{
                    position: 'absolute',
                    top: '-60px',
                    right: '25%',
                    width: '380px',
                    height: '380px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, #00d2ff 0%, #0066ff 70%)',
                    filter: 'blur(95px)',
                    opacity: 0.45,
                    pointerEvents: 'none',
                    zIndex: 0
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    bottom: '5%',
                    left: '18%',
                    width: '420px',
                    height: '420px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, #ff2a85 0%, #8b008b 70%)',
                    filter: 'blur(110px)',
                    opacity: 0.45,
                    pointerEvents: 'none',
                    zIndex: 0
                }}
            />

            {/* ۱. سایدبار چپ: سابقه گفتگوها */}
            <aside
                style={{
                    zIndex: 1,
                    background: 'rgba(23, 15, 48, 0.55)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    borderLeft: '1px solid rgba(255, 255, 255, 0.12)',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    overflow: 'hidden'
                }}
            >
                <div style={{ padding: '20px 16px 14px' }}>
                    <button
                        onClick={() => handleCreateNewChat(selectedRole)}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '12px 16px',
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, #ff2a85 0%, #a855f7 100%)',
                            boxShadow: '0 8px 20px rgba(255, 42, 133, 0.35)',
                            color: '#ffffff',
                            border: '1px solid rgba(255, 255, 255, 0.25)',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: 'bold'
                        }}
                    >
                        <Plus size={17} />
                        <span>گفتگوی جدید</span>
                    </button>
                </div>

                <div style={{ padding: '0 18px 8px', fontSize: '11px', color: '#c084fc', fontWeight: 'bold' }}>
                    سابقه گفتگوها
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {sessions.map((s) => {
                        const isCurrent = s.id === currentSessionId;
                        const sessionAssistant = ASSISTANTS.find((a) => a.id === s.roleId);
                        const Icon = sessionAssistant?.icon || MessageSquare;

                        return (
                            <div
                                key={s.id}
                                onClick={() => {
                                    setCurrentSessionId(s.id);
                                    setSelectedRole(s.roleId);
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '10px 14px',
                                    borderRadius: '14px',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    background: isCurrent ? 'rgba(255, 255, 255, 0.14)' : 'rgba(255, 255, 255, 0.03)',
                                    border: isCurrent ? '1px solid rgba(255, 255, 255, 0.28)' : '1px solid rgba(255, 255, 255, 0.05)',
                                    color: isCurrent ? '#ffffff' : '#d8b4fe'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '9px', overflow: 'hidden' }}>
                                    <Icon size={15} style={{ color: sessionAssistant?.accentColor || '#c084fc', flexShrink: 0 }} />
                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</span>
                                </div>
                                <button
                                    onClick={(e) => handleDeleteSession(e, s.id)}
                                    style={{ background: 'none', border: 'none', color: '#a855f7', cursor: 'pointer', padding: '2px', display: 'flex' }}
                                    title="حذف"
                                >
                                    <Trash2 size={13} />
                                </button>
                            </div>
                        );
                    })}
                </div>

                <div style={{ padding: '14px 18px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '11px', color: '#c084fc', display: 'flex', justifyContent: 'space-between' }}>
                    <span>پورت سرور: ۵۰۶۰</span>
                    <span style={{ color: '#00e5ff', fontWeight: 'bold' }}>● آماده</span>
                </div>
            </aside>

            {/* ۲. بخش میانی: صفحه گفتگو */}
            <main
                style={{
                    zIndex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    overflow: 'hidden',
                    background: 'rgba(14, 7, 37, 0.35)',
                    backdropFilter: 'blur(16px)'
                }}
            >
                <header
                    style={{
                        height: '68px',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0 28px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        flexShrink: 0
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div
                            style={{
                                padding: '10px',
                                borderRadius: '14px',
                                background: currentAssistant.gradient,
                                boxShadow: `0 4px 16px ${currentAssistant.accentColor}55`,
                                color: '#ffffff',
                                display: 'flex'
                            }}
                        >
                            <currentAssistant.icon size={20} />
                        </div>
                        <div>
                            <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#ffffff' }}>{currentAssistant.title}</div>
                            <div style={{ fontSize: '11px', color: '#d8b4fe' }}>{currentAssistant.desc}</div>
                        </div>
                    </div>
                </header>

                <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {currentSession.messages.map((msg, idx) => {
                        const isAssistant = msg.role === 'assistant';

                        return (
                            <div key={idx} style={{ width: '100%', display: 'flex', justifyContent: 'flex-start' }}>
                                <div
                                    style={{
                                        width: '100%',
                                        maxWidth: '960px',
                                        padding: '16px 20px',
                                        borderRadius: '18px',
                                        border: isAssistant ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(255, 42, 133, 0.35)',
                                        background: isAssistant
                                            ? 'rgba(40, 20, 75, 0.45)'
                                            : 'linear-gradient(135deg, rgba(255, 42, 133, 0.18), rgba(168, 85, 247, 0.12))',
                                        backdropFilter: 'blur(20px)',
                                        boxShadow: isAssistant ? '0 8px 30px rgba(0, 0, 0, 0.25)' : '0 8px 25px rgba(255, 42, 133, 0.15)',
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '14px',
                                        textAlign: 'right'
                                    }}
                                >
                                    <div
                                        style={{
                                            padding: '9px',
                                            borderRadius: '12px',
                                            background: isAssistant ? 'rgba(255, 255, 255, 0.1)' : 'linear-gradient(135deg, #ff2a85, #ff73a8)',
                                            border: '1px solid rgba(255, 255, 255, 0.2)',
                                            color: isAssistant ? currentAssistant.accentColor : '#ffffff',
                                            display: 'flex',
                                            flexShrink: 0
                                        }}
                                    >
                                        {isAssistant ? <Bot size={18} /> : <User size={18} />}
                                    </div>
                                    <div style={{ flex: 1, whiteSpace: 'pre-wrap', fontSize: '13.5px', lineHeight: '1.85', color: '#f8fafc' }}>
                                        {msg.content || (
                                            <span style={{ color: '#c084fc' }}>در حال تحلیل مهندسی و پردازش پاسخ...</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                <div
                    style={{
                        padding: '18px 28px',
                        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                        background: 'rgba(20, 10, 45, 0.65)',
                        backdropFilter: 'blur(20px)',
                        flexShrink: 0
                    }}
                >
                    <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <textarea
                            value={inputPrompt}
                            onChange={(e) => setInputPrompt(e.target.value)}
                            onKeyDown={handleKeyDown}
                            rows={1}
                            placeholder={`از متخصص ${currentAssistant.title} سوال بفرمایید...`}
                            style={{
                                flex: 1,
                                background: 'rgba(255, 255, 255, 0.07)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '16px',
                                padding: '14px 18px',
                                color: '#ffffff',
                                fontSize: '13px',
                                outline: 'none',
                                resize: 'none'
                            }}
                        />
                        <button
                            onClick={handleSend}
                            disabled={isLoading || !inputPrompt.trim()}
                            style={{
                                padding: '14px 20px',
                                borderRadius: '16px',
                                background: 'linear-gradient(135deg, #ff2a85 0%, #a855f7 100%)',
                                boxShadow: '0 6px 18px rgba(255, 42, 133, 0.35)',
                                color: '#ffffff',
                                border: '1px solid rgba(255, 255, 255, 0.25)',
                                cursor: isLoading || !inputPrompt.trim() ? 'not-allowed' : 'pointer',
                                opacity: isLoading || !inputPrompt.trim() ? 0.45 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </main>

            {/* ۳. سایدبار راست: انتخاب تخصص */}
            <aside
                style={{
                    zIndex: 1,
                    background: 'rgba(23, 15, 48, 0.55)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    borderRight: '1px solid rgba(255, 255, 255, 0.12)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '20px 16px',
                    height: '100%',
                    overflow: 'hidden'
                }}
            >
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '16px', marginBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                        <Sparkles size={20} style={{ color: '#ff2a85' }} />
                        <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#ffffff' }}>داشبورد صنایع سنگین</span>
                    </div>

                    <div style={{ fontSize: '11px', color: '#c084fc', fontWeight: 'bold', marginBottom: '14px' }}>
                        انتخاب تخصص هوش مصنوعی:
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {ASSISTANTS.map((asst) => {
                            const isSelected = selectedRole === asst.id;
                            const Icon = asst.icon;

                            return (
                                <button
                                    key={asst.id}
                                    onClick={() => handleRoleChange(asst.id)}
                                    style={{
                                        width: '100%',
                                        textAlign: 'right',
                                        padding: '14px',
                                        borderRadius: '16px',
                                        border: isSelected ? '1px solid rgba(255, 255, 255, 0.35)' : '1px solid rgba(255, 255, 255, 0.08)',
                                        background: isSelected
                                            ? 'linear-gradient(135deg, rgba(255, 42, 133, 0.35), rgba(168, 85, 247, 0.25))'
                                            : 'rgba(255, 255, 255, 0.03)',
                                        boxShadow: isSelected ? '0 8px 24px rgba(255, 42, 133, 0.25)' : 'none',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '12px'
                                    }}
                                >
                                    <div
                                        style={{
                                            padding: '8px',
                                            borderRadius: '12px',
                                            background: isSelected ? asst.gradient : 'rgba(255, 255, 255, 0.06)',
                                            border: '1px solid rgba(255, 255, 255, 0.2)',
                                            color: isSelected ? '#ffffff' : asst.accentColor,
                                            display: 'flex',
                                            flexShrink: 0
                                        }}
                                    >
                                        <Icon size={18} />
                                    </div>
                                    <div style={{ overflow: 'hidden' }}>
                                        <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#ffffff' }}>{asst.title}</div>
                                        <div style={{ fontSize: '10px', color: '#d8b4fe', marginTop: '3px', lineHeight: '1.4' }}>{asst.desc}</div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div
                    style={{
                        padding: '12px',
                        borderRadius: '14px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        textAlign: 'center',
                        fontSize: '11px',
                        color: '#c084fc'
                    }}
                >
                    Llama 3.2 بر بستر Semantic Kernel
                </div>
            </aside>
        </div>
    );
}
