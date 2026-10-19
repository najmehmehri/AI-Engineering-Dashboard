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
    PlusCircle,
    Plus,
    Trash2,
    MessageSquare,
    ChevronLeft,
    ChevronRight,
    ArrowLeftRight,
    Sun,
    Moon,
    Paperclip,
    X
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
        toastBg: 'rgba(30, 18, 60, 0.85)',
        toastBorder: 'rgba(168, 85, 247, 0.45)',
        orb1: 'radial-gradient(circle, #00d2ff 0%, #0066ff 70%)',
        orb2: 'radial-gradient(circle, #ff2a85 0%, #8b008b 70%)',
        orbOpacity: 0.45
    },
    light: {
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
        toastBg: 'rgba(255, 255, 255, 0.92)',
        toastBorder: 'rgba(168, 85, 247, 0.5)',
        orb1: 'radial-gradient(circle, #38bdf8 0%, #818cf8 70%)',
        orb2: 'radial-gradient(circle, #f472b6 0%, #c084fc 70%)',
        orbOpacity: 0.25
    }
};

// پسوندهای مجاز فایل متنی
const ALLOWED_EXTENSIONS = ['txt', 'md', 'log', 'csv', 'json'];
const ALLOWED_ACCEPT = ALLOWED_EXTENSIONS.map((ext) => `.${ext}`).join(',');

const buildSession = (roleId, id = `session-${Date.now()}`) => {
    const assistant = ASSISTANTS.find((a) => a.id === roleId) || ASSISTANTS[0];
    return {
        id,
        roleId: assistant.id,
        title: `گفتگوی جدید ${assistant.title.split(' ')[1] || ''}`,
        createdAt: new Date(),
        messages: [{ role: 'assistant', content: assistant.initialGreeting }]
    };
};

const isAllowedTextFile = (file) => {
    const ext = file.name.split('.').pop().toLowerCase();
    return ALLOWED_EXTENSIONS.includes(ext);
};

export default function App() {
    const [theme, setTheme] = useState('dark');
    const [selectedRole, setSelectedRole] = useState(ASSISTANTS[0].id);
    const [isHistoryOpen, setIsHistoryOpen] = useState(true);
    const [isRolesOpen, setIsRolesOpen] = useState(true);
    const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

    const [sessions, setSessions] = useState(() => [buildSession('petroleum', 'session-1')]);
    const [currentSessionId, setCurrentSessionId] = useState('session-1');
    const [inputPrompt, setInputPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // ویژگی ۲: نمایش بنر «به زودی» دستیار سفارشی
    const [showCustomAssistantToast, setShowCustomAssistantToast] = useState(false);

    // ویژگی ۳: فایل پیوست‌شده (متنی)
    const [attachedFile, setAttachedFile] = useState(null); // { name, content }
    const [attachError, setAttachError] = useState('');

    const abortControllerRef = useRef(null);
    const messagesEndRef = useRef(null);
    const dropdownRef = useRef(null);
    const fileInputRef = useRef(null);
    const toastTimeoutRef = useRef(null);

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

    // پاک‌سازی تایمر بنر هنگام unmount
    useEffect(() => () => {
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    }, []);

    const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

    // ویژگی ۲: کلیک روی «افزودن دستیار تخصصی شما»
    const handleAddCustomAssistant = () => {
        setShowCustomAssistantToast(true);
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = setTimeout(() => setShowCustomAssistantToast(false), 5000);
    };

    const handleCreateNewChat = (targetRole = selectedRole) => {
        if (isLoading && abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        const next = buildSession(targetRole);
        setSessions((prev) => [next, ...prev]);
        setCurrentSessionId(next.id);
        setSelectedRole(targetRole);
        setIsLoading(false);
        setAttachedFile(null);
        setAttachError('');
    };

    const handleInChatRoleSwitch = (newRoleId) => {
        setSelectedRole(newRoleId);
        setIsRoleDropdownOpen(false);
        const newAsst = ASSISTANTS.find((a) => a.id === newRoleId);
        setSessions((prev) =>
            prev.map((s) =>
                s.id === currentSessionId
                    ? {
                        ...s,
                        roleId: newRoleId,
                        messages: [
                            ...s.messages,
                            {
                                role: 'assistant',
                                content: `نقش دستیار در این گفتگو به **${newAsst?.title}** تغییر یافت. مراجع و مستندات این تخصص فعال گردید.`
                            }
                        ]
                    }
                    : s
            )
        );
    };

    const handleDeleteSession = (e, idToDelete) => {
        e.stopPropagation();
        const updated = sessions.filter((s) => s.id !== idToDelete);
        if (updated.length === 0) {
            const next = buildSession(ASSISTANTS[0].id);
            setSessions([next]);
            setCurrentSessionId(next.id);
            setSelectedRole(next.roleId);
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

    // ویژگی ۳: انتخاب و خواندن فایل متنی با FileReader
    const handleFileSelect = (event) => {
        const file = event.target.files?.[0];
        event.target.value = ''; // اجازه انتخاب مجدد همان فایل
        setAttachError('');
        if (!file) return;

        if (!isAllowedTextFile(file)) {
            setAttachError('فقط فایل‌های متنی (.txt، .md، .log، .csv، .json) مجاز هستند.');
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            setAttachError('حجم فایل پیوست نباید بیشتر از ۲ مگابایت باشد.');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            setAttachedFile({ name: file.name, content: String(reader.result ?? '') });
        };
        reader.onerror = () => setAttachError('خواندن فایل با خطا مواجه شد. لطفاً دوباره تلاش کنید.');
        reader.readAsText(file, 'utf-8');
    };

    const handleRemoveAttachment = () => {
        setAttachedFile(null);
        setAttachError('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSend = async () => {
        const text = inputPrompt.trim();
        if (!text && !attachedFile) return;
        if (isLoading) return;

        // اگر فایل پیوست exists، محتوای آن به‌عنوان زمینه به پرامپت اضافه می‌شود
        const finalText = attachedFile
            ? `[پیوست: ${attachedFile.name}]\n${attachedFile.content}\n\n${text}`
            : text;

        const sessionAtSend = currentSession;
        const userMsg = { role: 'user', content: finalText };

        // ویژگی ۱: ارسال تاریخچه کامل + پیام فعلی به بک‌اند با ساختار { role, text }
        const messagesForBackend = [
            ...sessionAtSend.messages,
            userMsg
        ]
            .filter((m) => m.role === 'user' || m.role === 'assistant')
            .map((m) => ({ role: m.role, text: m.content || '' }));

        setInputPrompt('');
        setAttachedFile(null); // ریست پیوست بعد از ارسال
        setAttachError('');
        setIsLoading(true);

        setSessions((prev) =>
            prev.map((s) => {
                if (s.id === currentSessionId) {
                    const isFirst = s.messages.filter((m) => m.role === 'user').length === 0;
                    const displayTitle = text || `پیوست ${attachedFile?.name || 'فایل'}`;
                    return {
                        ...s,
                        title: isFirst
                            ? displayTitle.slice(0, 22) + (displayTitle.length > 22 ? '...' : '')
                            : s.title,
                        messages: [...s.messages, userMsg, { role: 'assistant', content: '' }]
                    };
                }
                return s;
            })
        );

        abortControllerRef.current = new AbortController();

        try {
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
                                content: (newMsgs[lastIndex].content || '') + chunk
                            };
                            return { ...s, messages: newMsgs };
                        }
                        return s;
                    })
                );
            }
        } catch (error) {
            let errorContent;
            if (error.name === 'AbortError') {
                errorContent = null; // به محتوای فعلی اضافه می‌شود
            }
            setSessions((prev) =>
                prev.map((s) => {
                    if (s.id === currentSessionId) {
                        const newMsgs = [...s.messages];
                        const lastIndex = newMsgs.length - 1;
                        const base = newMsgs[lastIndex].content || '';
                        newMsgs[lastIndex] = {
                            ...newMsgs[lastIndex],
                            content:
                                error.name === 'AbortError'
                                    ? base + ' [توسط کاربر متوقف شد]'
                                    : 'متأسفانه در دریافت پاسخ از سرور یا ارتباط با مدل خطایی رخ داد.'
                        };
                        return { ...s, messages: newMsgs };
                    }
                    return s;
                })
            );
            if (error.name !== 'AbortError') console.error('Chat error:', error);
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

    const panelButtonStyle = {
        background: t.inputBg,
        border: `1px solid ${t.inputBorder}`,
        color: t.textPrimary,
        borderRadius: '10px',
        padding: '8px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
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

            {/* ۱. سایدبار راست: سابقه گفتگوها */}
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
                                    border: isCurrent
                                        ? `1px solid ${t.itemActiveBorder}`
                                        : `1px solid ${t.itemInactiveBorder}`,
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
                    WebkitBackdropFilter: 'blur(16px)',
                    zIndex: 1,
                    minWidth: 0,
                    position: 'relative'
                }}
            >
                {/* هدر */}
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
                        <button
                            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                            title={isHistoryOpen ? 'بستن تاریخچه' : 'باز کردن تاریخچه'}
                            style={panelButtonStyle}
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
                        <button
                            onClick={toggleTheme}
                            title={theme === 'dark' ? 'تغییر به تم نقره‌ای یاسی' : 'تغییر به تم دارک بنفش'}
                            style={{ ...panelButtonStyle, gap: '8px', padding: '8px 14px', fontSize: '12px', fontWeight: 'bold' }}
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

                        <button
                            onClick={() => setIsRolesOpen(!isRolesOpen)}
                            title={isRolesOpen ? 'بستن پنل تخصص‌ها' : 'باز کردن پنل تخصص‌ها'}
                            style={panelButtonStyle}
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
                                        WebkitBackdropFilter: 'blur(20px)',
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
                                            background: isAssistant
                                                ? (theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(168, 85, 247, 0.12)')
                                                : 'linear-gradient(135deg, #ff2a85, #ff73a8)',
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

                {/* فوتر چت */}
                <div
                    style={{
                        padding: '18px 28px',
                        borderTop: `1px solid ${t.headerBorder}`,
                        background: t.footerBg,
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        flexShrink: 0
                    }}
                >
                    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
                        {/* نشان فایل پیوست‌شده */}
                        {(attachedFile || attachError) && (
                            <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                {attachedFile && (
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            padding: '7px 12px',
                                            borderRadius: '12px',
                                            background: t.inputBg,
                                            border: `1px solid ${t.inputBorder}`,
                                            backdropFilter: 'blur(12px)',
                                            fontSize: '12px',
                                            color: t.textPrimary
                                        }}
                                    >
                                        <Paperclip size={14} style={{ color: currentAssistant.accentColor }} />
                                        <span style={{ fontWeight: 'bold' }}>{attachedFile.name}</span>
                                        <span style={{ color: t.textMuted, fontSize: '10px' }}>
                                            {(attachedFile.content.length / 1024).toFixed(1)} کیلوبایت
                                        </span>
                                        <button
                                            onClick={handleRemoveAttachment}
                                            title="حذف پیوست"
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: t.textMuted,
                                                cursor: 'pointer',
                                                padding: '2px',
                                                display: 'flex',
                                                alignItems: 'center'
                                            }}
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                )}
                                {attachError && (
                                    <div
                                        style={{
                                            padding: '7px 12px',
                                            borderRadius: '12px',
                                            background: 'rgba(239, 68, 68, 0.15)',
                                            border: '1px solid rgba(239, 68, 68, 0.45)',
                                            color: theme === 'dark' ? '#fca5a5' : '#b91c1c',
                                            fontSize: '11px'
                                        }}
                                    >
                                        {attachError}
                                    </div>
                                )}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', position: 'relative' }}>
                            {/* ۱. سوییچ تخصص */}
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
                                            WebkitBackdropFilter: 'blur(25px)',
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
                                    minWidth: 0,
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

                            {/* ۳. دکمه پیوست فایل متنی */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept={ALLOWED_ACCEPT}
                                onChange={handleFileSelect}
                                style={{ display: 'none' }}
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isLoading}
                                title="پیوست فایل متنی (.txt، .md، .log، .csv، .json)"
                                style={{
                                    padding: '13px',
                                    borderRadius: '16px',
                                    background: t.inputBg,
                                    border: `1px solid ${t.inputBorder}`,
                                    color: attachedFile ? currentAssistant.accentColor : t.textPrimary,
                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                    opacity: isLoading ? 0.5 : 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}
                            >
                                <Paperclip size={18} />
                            </button>

                            {/* ۴. دکمه Send / Stop */}
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
                                        fontWeight: 'bold',
                                        flexShrink: 0
                                    }}
                                >
                                    <Square size={16} fill="#ffffff" />
                                    <span>توقف</span>
                                </button>
                            ) : (
                                <button
                                    onClick={handleSend}
                                    disabled={!inputPrompt.trim() && !attachedFile}
                                    title="ارسال پیام"
                                    style={{
                                        padding: '14px 20px',
                                        borderRadius: '16px',
                                        background: 'linear-gradient(135deg, #ff2a85 0%, #a855f7 100%)',
                                        boxShadow: '0 6px 18px rgba(255, 42, 133, 0.35)',
                                        color: '#ffffff',
                                        border: '1px solid rgba(255, 255, 255, 0.25)',
                                        cursor: !inputPrompt.trim() && !attachedFile ? 'not-allowed' : 'pointer',
                                        opacity: !inputPrompt.trim() && !attachedFile ? 0.45 : 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    }}
                                >
                                    <Send size={18} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* ۳. سایدبار چپ: پنل انتخاب تخصص */}
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

                    {/* ویژگی ۲: دکمه افزودن دستیار تخصصی شما */}
                    <button
                        onClick={handleAddCustomAssistant}
                        style={{
                            width: '100%',
                            marginTop: '14px',
                            padding: '12px 14px',
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, rgba(255, 42, 133, 0.12), rgba(168, 85, 247, 0.12))',
                            border: `1px dashed ${t.itemActiveBorder}`,
                            color: t.textPrimary,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            transition: 'all 0.25s ease'
                        }}
                    >
                        <PlusCircle size={16} style={{ color: '#ff2a85' }} />
                        <span>افزودن دستیار تخصصی شما</span>
                    </button>
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

            {/* بنر شیشه‌ای «به زودی» */}
            {showCustomAssistantToast && (
                <div
                    role="status"
                    onClick={() => setShowCustomAssistantToast(false)}
                    style={{
                        position: 'fixed',
                        bottom: '110px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 50,
                        maxWidth: '480px',
                        width: 'calc(100% - 40px)',
                        padding: '14px 20px',
                        borderRadius: '18px',
                        background: t.toastBg,
                        backdropFilter: 'blur(22px)',
                        WebkitBackdropFilter: 'blur(22px)',
                        border: `1px solid ${t.toastBorder}`,
                        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.35)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        cursor: 'pointer',
                        animation: 'fadeInUp 0.3s ease'
                    }}
                >
                    <div
                        style={{
                            padding: '8px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #ff2a85, #a855f7)',
                            color: '#ffffff',
                            display: 'flex',
                            flexShrink: 0
                        }}
                    >
                        <Bot size={18} />
                    </div>
                    <div style={{ fontSize: '12.5px', lineHeight: '1.7', color: t.textPrimary, flex: 1 }}>
                        به زودی: قابلیت تعریف پرامپت، نام و مستندات دستیار سفارشی در فازهای بعدی فعال خواهد شد.
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowCustomAssistantToast(false);
                        }}
                        title="بستن"
                        style={{
                            background: 'none',
                            border: 'none',
                            color: t.textMuted,
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            flexShrink: 0
                        }}
                    >
                        <X size={16} />
                    </button>
                </div>
            )}
        </div>
    );
}
