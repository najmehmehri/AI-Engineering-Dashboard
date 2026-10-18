import React, { useState, useRef, useEffect } from 'react';
import {
    Droplets,
    Building2,
    Flame,
    Factory,
    Send,
    Square,
    Bot,
    User,
    Sparkles,
    Plus,
    Trash2,
    MessageSquare,
    ChevronLeft,
    ChevronRight,
    ArrowLeftRight,
    Sun,
    Moon
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

// پالت‌های رنگی اختصاصی برای حالت تاریک و تم نقره‌ای یاسی
const THEMES = {
    dark: {
        bg: 'linear-gradient(135deg, #0e0725 0%, #170936 45%, #230847 100%)',
        textPrimary: '#f8fafc',
        textSecondary: '#d8b4fe',
        textMuted: '#c084fc',
        sidebarBg: 'rgba(23, 15, 48, 0.65)',
        sidebarBorder: 'rgba(255, 255, 255, 0.12)',
        headerBg: 'rgba(255, 255, 255, 0.02)',
        headerBorder: 'rgba(255, 255, 255, 0.1)',
        mainBg: 'rgba(14, 7, 37, 0.35)',
        footerBg: 'rgba(20, 10, 45, 0.65)',
        inputBg: 'rgba(255, 255, 255, 0.07)',
        inputBorder: 'rgba(255, 255, 255, 0.2)',
        inputText: '#ffffff',
        msgAssistantBg: 'rgba(40, 20, 75, 0.45)',
        msgAssistantBorder: 'rgba(255, 255, 255, 0.15)',
        msgUserBg: 'linear-gradient(135deg, rgba(255, 42, 133, 0.18), rgba(168, 85, 247, 0.12))',
        msgUserBorder: 'rgba(255, 42, 133, 0.35)',
        itemHoverBg: 'rgba(255, 255, 255, 0.06)',
        itemActiveBg: 'rgba(255, 255, 255, 0.14)',
        itemActiveBorder: 'rgba(255, 255, 255, 0.28)',
        itemInactiveBorder: 'rgba(255, 255, 255, 0.05)',
        dropdownBg: 'rgba(25, 14, 52, 0.95)',
        orb1: 'radial-gradient(circle, #00d2ff 0%, #0066ff 70%)',
        orb2: 'radial-gradient(circle, #ff2a85 0%, #8b008b 70%)',
        orbOpacity: 0.45
    },
    light: {
        // پس‌زمینه نقره‌ای یاسی (Silver-Lilac)
        bg: 'linear-gradient(135deg, #f5f2f8 0%, #ebe4f4 45%, #ded2ee 100%)',
        textPrimary: '#1a0b2e',
        textSecondary: '#5a4675',
        textMuted: '#7c3aed',
        sidebarBg: 'rgba(255, 255, 255, 0.65)',
        sidebarBorder: 'rgba(168, 85, 247, 0.18)',
        headerBg: 'rgba(255, 255, 255, 0.5)',
        headerBorder: 'rgba(168, 85, 247, 0.15)',
        mainBg: 'rgba(247, 244, 252, 0.4)',
        footerBg: 'rgba(255, 255, 255, 0.75)',
        inputBg: 'rgba(255, 255, 255, 0.9)',
        inputBorder: 'rgba(168, 85, 247, 0.3)',
        inputText: '#1a0b2e',
        msgAssistantBg: 'rgba(255, 255, 255, 0.85)',
        msgAssistantBorder: 'rgba(168, 85, 247, 0.22)',
        msgUserBg: 'linear-gradient(135deg, rgba(255, 42, 133, 0.12), rgba(168, 85, 247, 0.12))',
        msgUserBorder: 'rgba(255, 42, 133, 0.35)',
        itemHoverBg: 'rgba(168, 85, 247, 0.08)',
        itemActiveBg: 'rgba(168, 85, 247, 0.16)',
        itemActiveBorder: 'rgba(168, 85, 247, 0.4)',
        itemInactiveBorder: 'rgba(168, 85, 247, 0.1)',
        dropdownBg: 'rgba(255, 255, 255, 0.96)',
        orb1: 'radial-gradient(circle, #38bdf8 0%, #818cf8 70%)',
        orb2: 'radial-gradient(circle, #f472b6 0%, #c084fc 70%)',
        orbOpacity: 0.25
    }
};

export default function App() {
    const [theme, setTheme] = useState('dark');
    const [selectedRole, setSelectedRole] = useState(ASSISTANTS[0].id);
    const [isHistoryOpen, setIsHistoryOpen] = useState(true);
    const [isRolesOpen, setIsRolesOpen] = useState(true);
    const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

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
    const dropdownRef = useRef(null);

    const t = THEMES[theme];
    const currentSession = sessions.find((s) => s.id === currentSessionId) || sessions[0];
    const currentAssistant = ASSISTANTS.find((a) => a.id === selectedRole) || ASSISTANTS[0];

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [currentSession?.messages]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsRoleDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleTheme = () => {
        setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
    };

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

    const handleInChatRoleSwitch = (newRoleId) => {
        setSelectedRole(newRoleId);
        setIsRoleDropdownOpen(false);

        setSessions((prev) =>
            prev.map((s) => (s.id === currentSessionId ? { ...s, roleId: newRoleId } : s))
        );

        const newAsst = ASSISTANTS.find((a) => a.id === newRoleId);
        const switchNotice = {
            role: 'assistant',
            content: `نقش دستیار در این گفتگو به **${newAsst?.title}** تغییر یافت. مراجع و مستندات این تخصص فعال گردید.`
        };

        setSessions((prev) =>
            prev.map((s) =>
                s.id === currentSessionId
                    ? { ...s, messages: [...s.messages, switchNotice] }
                    : s
            )
        );
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

    const handleStopGeneration = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
        setIsLoading(false);
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
            const messagesForBackend = [...currentSession.messages, userMsg].map((m) => ({
                role: m.role,
                text: m.content
            }));

            const response = await fetch('http://localhost:5060/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                signal: abortControllerRef.current.signal,
                body: JSON.stringify({
                    role: selectedRole,
                    messages: messagesForBackend
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
            if (error.name === 'AbortError') {
                setSessions((prev) =>
                    prev.map((s) => {
                        if (s.id === currentSessionId) {
                            const newMsgs = [...s.messages];
                            const lastIndex = newMsgs.length - 1;
                            newMsgs[lastIndex] = {
                                ...newMsgs[lastIndex],
                                content: (newMsgs[lastIndex].content || '') + ' [توسط کاربر متوقف شد]'
                            };
                            return { ...s, messages: newMsgs };
                        }
                        return s;
                    })
                );
            } else {
                console.error('Chat error:', error);
                setSessions((prev) =>
                    prev.map((s) => {
                        if (s.id === currentSessionId) {
                            const newMsgs = [...s.messages];
                            const lastIndex = newMsgs.length - 1;
                            newMsgs[lastIndex] = {
                                ...newMsgs[lastIndex],
                                content: 'متأسفانه در دریافت پاسخ از سرور یا ارتباط با مدل خطایی رخ داد.'
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
                display: 'flex',
                background: t.bg,
                color: t.textPrimary,
                overflow: 'hidden',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                transition: 'background 0.4s ease, color 0.3s ease'
            }}
        >
            {/* اورب‌های نورانی پس‌زمینه */}
            <div
                style={{
                    position: 'absolute',
                    top: '-60px',
                    right: '25%',
                    width: '400px',
                    height: '400px',
                    borderRadius: '50%',
                    background: t.orb1,
                    filter: 'blur(100px)',
                    opacity: t.orbOpacity,
                    pointerEvents: 'none',
                    zIndex: 0,
                    transition: 'all 0.5s ease'
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    bottom: '5%',
                    left: '18%',
                    width: '440px',
                    height: '440px',
                    borderRadius: '50%',
                    background: t.orb2,
                    filter: 'blur(110px)',
                    opacity: t.orbOpacity,
                    pointerEvents: 'none',
                    zIndex: 0,
                    transition: 'all 0.5s ease'
                }}
            />

            {/* ۱. سایدبار راست: سابقه گفتگوها (کامل کشویی بدون لیکیج) */}
            <aside
                style={{
                    width: isHistoryOpen ? '270px' : '0px',
                    minWidth: isHistoryOpen ? '270px' : '0px',
                    maxWidth: isHistoryOpen ? '270px' : '0px',
                    padding: isHistoryOpen ? '20px 14px' : '0px',
                    opacity: isHistoryOpen ? 1 : 0,
                    borderLeft: isHistoryOpen ? `1px solid ${t.sidebarBorder}` : 'none',
                    background: t.sidebarBg,
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    overflow: 'hidden',
                    transition: 'all 0.32s cubic-bezier(0.4, 0, 0.2, 1)',
                    zIndex: 2,
                    boxSizing: 'border-box'
                }}
            >
                <div style={{ marginBottom: '14px' }}>
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
                            boxShadow: '0 6px 18px rgba(255, 42, 133, 0.3)',
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

                <div style={{ padding: '0 6px 10px', fontSize: '11px', color: t.textMuted, fontWeight: 'bold' }}>
                    سابقه گفتگوها
                </div>

                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
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
                                    padding: '10px 12px',
                                    borderRadius: '14px',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    background: isCurrent ? t.itemActiveBg : 'transparent',
                                    border: isCurrent ? `1px solid ${t.itemActiveBorder}` : `1px solid ${t.itemInactiveBorder}`,
                                    color: isCurrent ? t.textPrimary : t.textSecondary
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                                    <Icon size={15} style={{ color: sessionAssistant?.accentColor || t.textMuted, flexShrink: 0 }} />
                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</span>
                                </div>
                                <button
                                    onClick={(e) => handleDeleteSession(e, s.id)}
                                    style={{ background: 'none', border: 'none', color: t.textMuted, cursor: 'pointer', padding: '2px', display: 'flex' }}
                                    title="حذف"
                                >
                                    <Trash2 size={13} />
                                </button>
                            </div>
                        );
                    })}
                </div>

                <div style={{ paddingTop: '12px', borderTop: `1px solid ${t.headerBorder}`, fontSize: '11px', color: t.textMuted, display: 'flex', justifyContent: 'space-between' }}>
                    <span>پورت سرور: ۵۰۶۰</span>
                    <span style={{ color: '#00e5ff', fontWeight: 'bold' }}>● آماده</span>
                </div>
            </aside>

            {/* ۲. بخش میانی: صفحه گفتگو */}
            <main
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    overflow: 'hidden',
                    background: t.mainBg,
                    backdropFilter: 'blur(16px)',
                    zIndex: 1,
                    minWidth: 0
                }}
            >
                {/* هدر بالایی با کنترل‌های سایدبار و تم */}
                <header
                    style={{
                        height: '68px',
                        borderBottom: `1px solid ${t.headerBorder}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0 20px',
                        background: t.headerBg,
                        flexShrink: 0
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {/* دکمه باز/بست سایدبار تاریخچه */}
                        <button
                            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                            title={isHistoryOpen ? 'بستن تاریخچه' : 'باز کردن تاریخچه'}
                            style={{
                                background: t.inputBg,
                                border: `1px solid ${t.inputBorder}`,
                                color: t.textPrimary,
                                borderRadius: '10px',
                                padding: '8px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            {isHistoryOpen ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                        </button>

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
                            <div style={{ fontSize: '15px', fontWeight: 'bold', color: t.textPrimary }}>{currentAssistant.title}</div>
                            <div style={{ fontSize: '11px', color: t.textSecondary }}>{currentAssistant.desc}</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {/* دکمه انتخاب Dark Mode / Light Mode */}
                        <button
                            onClick={toggleTheme}
                            title={theme === 'dark' ? 'تغییر به تم نقره‌ای یاسی' : 'تغییر به تم دارک بنفش'}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 14px',
                                borderRadius: '14px',
                                background: t.inputBg,
                                border: `1px solid ${t.inputBorder}`,
                                color: t.textPrimary,
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: 'bold'
                            }}
                        >
                            {theme === 'dark' ? (
                                <>
                                    <Sun size={16} style={{ color: '#fbbf24' }} />
                                    <span>Light</span>
                                </>
                            ) : (
                                <>
                                    <Moon size={16} style={{ color: '#a855f7' }} />
                                    <span>Dark</span>
                                </>
                            )}
                        </button>

                        {/* دکمه باز/بست پنل تخصص‌ها */}
                        <button
                            onClick={() => setIsRolesOpen(!isRolesOpen)}
                            title={isRolesOpen ? 'بستن پنل تخصص‌ها' : 'باز کردن پنل تخصص‌ها'}
                            style={{
                                background: t.inputBg,
                                border: `1px solid ${t.inputBorder}`,
                                color: t.textPrimary,
                                borderRadius: '10px',
                                padding: '8px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            {isRolesOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                        </button>
                    </div>
                </header>

                {/* پیام‌های چت */}
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
                                        border: isAssistant ? `1px solid ${t.msgAssistantBorder}` : `1px solid ${t.msgUserBorder}`,
                                        background: isAssistant ? t.msgAssistantBg : t.msgUserBg,
                                        backdropFilter: 'blur(20px)',
                                        boxShadow: isAssistant ? '0 8px 30px rgba(0, 0, 0, 0.15)' : '0 8px 25px rgba(255, 42, 133, 0.15)',
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
                                            background: isAssistant ? (theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(168, 85, 247, 0.12)') : 'linear-gradient(135deg, #ff2a85, #ff73a8)',
                                            border: '1px solid rgba(255, 255, 255, 0.2)',
                                            color: isAssistant ? currentAssistant.accentColor : '#ffffff',
                                            display: 'flex',
                                            flexShrink: 0
                                        }}
                                    >
                                        {isAssistant ? <Bot size={18} /> : <User size={18} />}
                                    </div>
                                    <div style={{ flex: 1, whiteSpace: 'pre-wrap', fontSize: '13.5px', lineHeight: '1.85', color: t.textPrimary }}>
                                        {msg.content || (
                                            <span style={{ color: t.textMuted }}>در حال تحلیل مهندسی و پردازش پاسخ...</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {/* فوتر چت: دراپ‌داون سوییچ نقش، ورودی متن و دکمه‌های Send / Stop */}
                <div
                    style={{
                        padding: '18px 28px',
                        borderTop: `1px solid ${t.headerBorder}`,
                        background: t.footerBg,
                        backdropFilter: 'blur(20px)',
                        flexShrink: 0
                    }}
                >
                    <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', gap: '10px', alignItems: 'center', position: 'relative' }}>

                        {/* ۱. دکمه و منوی سوییچ تخصص در چت جاری */}
                        <div style={{ position: 'relative' }} ref={dropdownRef}>
                            <button
                                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                                title="تغییر تخصص دستیار در همین چت"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '12px 14px',
                                    borderRadius: '16px',
                                    background: t.inputBg,
                                    border: `1px solid ${t.inputBorder}`,
                                    color: currentAssistant.accentColor,
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                <ArrowLeftRight size={15} />
                                <span>{currentAssistant.title.split(' ')[1]}</span>
                            </button>

                            {isRoleDropdownOpen && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        bottom: 'calc(100% + 10px)',
                                        right: 0,
                                        width: '240px',
                                        background: t.dropdownBg,
                                        backdropFilter: 'blur(25px)',
                                        border: `1px solid ${t.sidebarBorder}`,
                                        borderRadius: '16px',
                                        boxShadow: '0 12px 30px rgba(0,0,0,0.3)',
                                        padding: '8px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '6px',
                                        zIndex: 10
                                    }}
                                >
                                    <div style={{ fontSize: '11px', color: t.textMuted, padding: '6px 8px', fontWeight: 'bold' }}>
                                        تغییر نقش دستیار این گفتگو:
                                    </div>
                                    {ASSISTANTS.map((asst) => {
                                        const Icon = asst.icon;
                                        const isSelected = selectedRole === asst.id;
                                        return (
                                            <button
                                                key={asst.id}
                                                onClick={() => handleInChatRoleSwitch(asst.id)}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '10px',
                                                    padding: '8px 10px',
                                                    borderRadius: '10px',
                                                    background: isSelected ? t.itemActiveBg : 'transparent',
                                                    border: 'none',
                                                    color: isSelected ? t.textPrimary : t.textSecondary,
                                                    cursor: 'pointer',
                                                    textAlign: 'right',
                                                    fontSize: '12px',
                                                    width: '100%'
                                                }}
                                            >
                                                <Icon size={16} style={{ color: asst.accentColor }} />
                                                <span>{asst.title}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* ۲. کادر متن */}
                        <textarea
                            value={inputPrompt}
                            onChange={(e) => setInputPrompt(e.target.value)}
                            onKeyDown={handleKeyDown}
                            rows={1}
                            placeholder={`از متخصص ${currentAssistant.title} سوال بفرمایید...`}
                            style={{
                                flex: 1,
                                background: t.inputBg,
                                border: `1px solid ${t.inputBorder}`,
                                borderRadius: '16px',
                                padding: '14px 18px',
                                color: t.inputText,
                                fontSize: '13px',
                                outline: 'none',
                                resize: 'none'
                            }}
                        />

                        {/* ۳. دکمه Send یا دکمه Stop */}
                        {isLoading ? (
                            <button
                                onClick={handleStopGeneration}
                                title="توقف پاسخگویی مدل"
                                style={{
                                    padding: '14px 20px',
                                    borderRadius: '16px',
                                    background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                                    boxShadow: '0 6px 18px rgba(239, 68, 68, 0.4)',
                                    color: '#ffffff',
                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    fontSize: '12px',
                                    fontWeight: 'bold'
                                }}
                            >
                                <Square size={16} fill="#ffffff" />
                                <span>توقف</span>
                            </button>
                        ) : (
                            <button
                                onClick={handleSend}
                                disabled={!inputPrompt.trim()}
                                style={{
                                    padding: '14px 20px',
                                    borderRadius: '16px',
                                    background: 'linear-gradient(135deg, #ff2a85 0%, #a855f7 100%)',
                                    boxShadow: '0 6px 18px rgba(255, 42, 133, 0.35)',
                                    color: '#ffffff',
                                    border: '1px solid rgba(255, 255, 255, 0.25)',
                                    cursor: !inputPrompt.trim() ? 'not-allowed' : 'pointer',
                                    opacity: !inputPrompt.trim() ? 0.45 : 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <Send size={18} />
                            </button>
                        )}
                    </div>
                </div>
            </main>

            {/* ۳. سایدبار چپ: پنل انتخاب تخصص هوش مصنوعی (بدون هیچ نوار باقیمانده در حالت بسته) */}
            <aside
                style={{
                    width: isRolesOpen ? '310px' : '0px',
                    minWidth: isRolesOpen ? '310px' : '0px',
                    maxWidth: isRolesOpen ? '310px' : '0px',
                    padding: isRolesOpen ? '20px 16px' : '0px',
                    opacity: isRolesOpen ? 1 : 0,
                    borderRight: isRolesOpen ? `1px solid ${t.sidebarBorder}` : 'none',
                    background: t.sidebarBg,
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    height: '100%',
                    overflow: 'hidden',
                    transition: 'all 0.32s cubic-bezier(0.4, 0, 0.2, 1)',
                    zIndex: 2,
                    boxSizing: 'border-box'
                }}
            >
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '16px', marginBottom: '16px', borderBottom: `1px solid ${t.headerBorder}` }}>
                        <Sparkles size={20} style={{ color: '#ff2a85' }} />
                        <span style={{ fontSize: '14px', fontWeight: 'bold', color: t.textPrimary }}>داشبورد صنایع</span>
                    </div>

                    <div style={{ fontSize: '11px', color: t.textMuted, fontWeight: 'bold', marginBottom: '14px' }}>
                        انتخاب تخصص هوش مصنوعی:
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {ASSISTANTS.map((asst) => {
                            const isSelected = selectedRole === asst.id;
                            const Icon = asst.icon;

                            return (
                                <button
                                    key={asst.id}
                                    onClick={() => handleInChatRoleSwitch(asst.id)}
                                    style={{
                                        width: '100%',
                                        textAlign: 'right',
                                        padding: '14px',
                                        borderRadius: '16px',
                                        border: isSelected ? '1px solid rgba(255, 42, 133, 0.45)' : `1px solid ${t.itemInactiveBorder}`,
                                        background: isSelected
                                            ? 'linear-gradient(135deg, rgba(255, 42, 133, 0.25), rgba(168, 85, 247, 0.2))'
                                            : t.itemHoverBg,
                                        boxShadow: isSelected ? '0 8px 24px rgba(255, 42, 133, 0.2)' : 'none',
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
                                            background: isSelected ? asst.gradient : (theme === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(168, 85, 247, 0.1)'),
                                            border: '1px solid rgba(255, 255, 255, 0.2)',
                                            color: isSelected ? '#ffffff' : asst.accentColor,
                                            display: 'flex',
                                            flexShrink: 0
                                        }}
                                    >
                                        <Icon size={18} />
                                    </div>
                                    <div style={{ overflow: 'hidden' }}>
                                        <div style={{ fontSize: '13px', fontWeight: 'bold', color: t.textPrimary }}>{asst.title}</div>
                                        <div style={{ fontSize: '10px', color: t.textSecondary, marginTop: '3px', lineHeight: '1.4' }}>{asst.desc}</div>
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
                        background: t.itemHoverBg,
                        border: `1px solid ${t.itemInactiveBorder}`,
                        textAlign: 'center',
                        fontSize: '11px',
                        color: t.textMuted
                    }}
                >
                    Llama 3.2 بر بستر Semantic Kernel
                </div>
            </aside>
        </div>
    );
}
