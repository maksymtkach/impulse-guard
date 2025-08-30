import { useEffect, useMemo, useState } from "react";
import {
    Box, Button, Card, CardContent, Container, Typography, Chip, Stack, Alert,
    Paper, LinearProgress, Badge, Tooltip as MuiTooltip, IconButton, Snackbar
} from "@mui/material";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  BarChart, Bar, RadialBarChart, RadialBar, PolarAngleAxis
} from "recharts";
import { useNavigate } from "react-router-dom";
// TEMPORARY: Commented out API import for demo purposes
// import { getSummaryFull } from "../api";
import {
    TrendingUp, Warning, Error as ErrorIcon, Info, Refresh,
    Timeline, Assessment, Psychology, Security, ContentCopy,
    EmojiEvents, LocalFireDepartment, Speed, 
    SentimentVeryDissatisfied, SentimentDissatisfied, SentimentNeutral,
    SentimentSatisfied, SentimentVerySatisfied, Mood,
    Diamond, Star, WorkspacePremium, AutoAwesome, 
    TrendingDown, PsychologyAlt, Shield
} from '@mui/icons-material';

import { useRef, useLayoutEffect } from "react"; // додай до імпортів

function useElementSize() {
    const ref = useRef<HTMLDivElement | null>(null);
    const [size, setSize] = useState({ width: 0, height: 0 });

    useLayoutEffect(() => {
        const el = ref.current;
        if (!el) return;
        const ro = new ResizeObserver((entries) => {
            const cr = entries[0].contentRect;
            setSize({ width: cr.width, height: cr.height });
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    return { ref, ...size };
}

type AutoSizerProps = {
    height: number; // фіксуємо висоту контейнера
    children: (s: { width: number; height: number }) => React.ReactNode;
};

function AutoSizer({ height, children }: AutoSizerProps) {
    const { ref, width } = useElementSize();
    return (
        <Box ref={ref} sx={{ width: "100%", height }}>
            {width > 0 ? children({ width, height }) : null}
        </Box>
    );
}


interface ProfilePageProps {
    token: string;
    onLogout: () => void;
}

interface TimelineEvent {
    id: string;
    timestamp: number;            // UNIX ms
    behaviorScore: number;        // Changed to general behavior score
    emotions: Record<string, number>;
    risks: string[];
    description: string;
}

interface RiskAssessment {
    category: string;
    level: 'warning' | 'super-risky' | 'critical';
    count: number;
    description: string;
}

interface EnhancedSummaryData {
    avgScore: number;
    events: number;
    topEmotions: Record<string, number>;
    timeline: TimelineEvent[];
    risks: RiskAssessment[];
    trends: {
        daily: { date: string; score: number }[];
        weekly: { week: string; score: number }[];
        monthly: { month: string; score: number }[];
    };
}

/** ===== Width hook (стабільний рендер без ResponsiveContainer) ===== */
function useBoxWidth(initial = 800) {
    const ref = useRef<HTMLDivElement | null>(null);
    const [width, setWidth] = useState(initial);
    useEffect(() => {
        if (!ref.current) return;
        const ro = new ResizeObserver(() => {
            if (ref.current) setWidth(ref.current.clientWidth || initial);
        });
        ro.observe(ref.current);
        return () => ro.disconnect();
    }, [initial]);
    return { ref, width };
}

export default function ProfilePage({ token, onLogout }: ProfilePageProps) {
    // TEMPORARY: This component now uses mock data instead of API calls for demonstration
    // To restore real API functionality, uncomment the API import and the try-catch block in loadSummary()
    // NOTE: Changed from "Impulse Index" to "Behavior Score" for better clarity
    
    const [summary, setSummary] = useState<EnhancedSummaryData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily');
    const [snack, setSnack] = useState<string | null>(null);

    const navigate = useNavigate();

    async function loadSummary() {
        if (!token) return;
        setIsLoading(true); setError("");
        
        // TEMPORARY: Comment out API call and use mock data for demo purposes
        // try {
        //     const data = await getSummaryFull(token);
        //     setSummary(data);
        // } catch (e: any) {
        //     setError(e?.message || "Failed to load data");
        // } finally {
        //     setIsLoading(false);
        // }
        
        // TEMPORARY: Mock data for demonstration
        setTimeout(() => {
            const mockData: EnhancedSummaryData = {
                avgScore: 65,
                events: 24,
                topEmotions: {
                    "frustration": 8,
                    "anxiety": 6,
                    "anger": 4,
                    "stress": 3
                },
                timeline: [
                    {
                        id: "1",
                        timestamp: Date.now() - 3600000,
                        behaviorScore: 75,
                        emotions: { "frustration": 0.8, "anger": 0.6 },
                        risks: ["High stress", "Impulsive behavior"],
                        description: "Work deadline pressure"
                    },
                    {
                        id: "2",
                        timestamp: Date.now() - 7200000,
                        behaviorScore: 45,
                        emotions: { "anxiety": 0.7, "stress": 0.5 },
                        risks: ["Moderate risk"],
                        description: "Meeting preparation"
                    },
                    {
                        id: "3",
                        timestamp: Date.now() - 10800000,
                        behaviorScore: 85,
                        emotions: { "anger": 0.9, "frustration": 0.8 },
                        risks: ["Critical risk", "High impulsivity"],
                        description: "Traffic incident"
                    },
                    {
                        id: "4",
                        timestamp: Date.now() - 14400000,
                        behaviorScore: 35,
                        emotions: { "stress": 0.4 },
                        risks: ["Low risk"],
                        description: "Email checking"
                    },
                    {
                        id: "5",
                        timestamp: Date.now() - 18000000,
                        behaviorScore: 60,
                        emotions: { "anxiety": 0.6, "stress": 0.3 },
                        risks: ["Moderate risk"],
                        description: "Social media browsing"
                    },
                    {
                        id: "6",
                        timestamp: Date.now() - 21600000,
                        behaviorScore: 25,
                        emotions: { "stress": 0.2 },
                        risks: ["Low risk"],
                        description: "Morning routine"
                    }
                ],
                risks: [
                    {
                        category: "High Stress",
                        level: "super-risky",
                        count: 3,
                        description: "Multiple high-stress events detected"
                    },
                    {
                        category: "Impulsive Behavior",
                        level: "warning",
                        count: 2,
                        description: "Risk of impulsive decisions"
                    },
                    {
                        category: "Emotional Regulation",
                        level: "critical",
                        count: 1,
                        description: "Critical emotional state detected"
                    }
                ],
                trends: {
                    daily: [
                        { date: "Mon", score: 45 },
                        { date: "Tue", score: 62 },
                        { date: "Wed", score: 78 },
                        { date: "Thu", score: 55 },
                        { date: "Fri", score: 68 },
                        { date: "Sat", score: 35 },
                        { date: "Sun", score: 42 }
                    ],
                    weekly: [
                        { week: "Week 1", score: 58 },
                        { week: "Week 2", score: 65 },
                        { week: "Week 3", score: 72 },
                        { week: "Week 4", score: 61 }
                    ],
                    monthly: [
                        { month: "Jan", score: 55 },
                        { month: "Feb", score: 68 },
                        { month: "Mar", score: 62 }
                    ]
                }
            };
            setSummary(mockData);
            setIsLoading(false);
        }, 1000); // Simulate loading delay
    }

    useEffect(() => {
        loadSummary();
    }, [token]);

    // ===== Helpers =====
    const classifyScore = (v: number) =>
        v >= 70 ? 'bad' : v >= 40 ? 'warn' : 'good';

    const colorForScore = (v: number) =>
        v >= 70 ? '#ef4444' : v >= 40 ? '#f59e0b' : '#22c55e';

    const minMax = (arr: number[]) => {
        if (!arr.length) return { min: 0, max: 100 };
        let min = Infinity, max = -Infinity;
        for (const v of arr) { if (v < min) min = v; if (v > max) max = v; }
        return { min, max };
    };

    const paddedDomain = (vals: number[], pad = 5) => {
        const { min, max } = minMax(vals);
        const lo = Math.max(0, Math.floor(min - pad));
        const hi = Math.min(100, Math.ceil(max + pad));
        return [lo, Math.max(hi, lo + 10)] as [number, number];
    };

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'warning': return '#ff9800';
            case 'super-risky': return '#ef4444';
            case 'critical': return '#b91c1c';
            default: return '#757575';
        }
    };
    const getRiskIcon = (level: string) => {
        switch (level) {
            case 'warning': return <Warning sx={{ color: '#f59e0b', fontSize: '1.2rem' }} />;
            case 'super-risky': return <LocalFireDepartment sx={{ color: '#ef4444', fontSize: '1.2rem' }} />;
            case 'critical': return <Security sx={{ color: '#b91c1c', fontSize: '1.2rem' }} />;
            default: return <Info sx={{ color: '#757575', fontSize: '1.2rem' }} />;
        }
    };

    const formatTimeHM = (ts: number | string) =>
        new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // ===== Derived data =====
    const timelineScores = useMemo(
        () => (summary?.timeline ?? []).map(e => e.behaviorScore),
        [summary]
    );
    const timelineDomain = useMemo(
        () => paddedDomain(timelineScores, 6),
        [timelineScores]
    );

    const trendData = summary?.trends?.[activeTab] ?? [];
    const trendScores = trendData.map(d => d.score);
    const trendDomain = paddedDomain(trendScores, 6);
    const trendXAxisKey = activeTab === 'daily' ? 'date' : activeTab === 'weekly' ? 'week' : 'month';

    const emotionsMax = useMemo(() => {
        const vals = Object.values(summary?.topEmotions ?? {});
        return Math.max(1, ...vals);
    }, [summary]);

    const truncatedToken = useMemo(() => {
        if (!token) return '—';
        const start = token.slice(0, 6);
        const end = token.slice(-4);
        return `${start}…${end}`;
    }, [token]);

    const radialData = useMemo(
        () => [{ name: "Avg", value: summary?.avgScore || 0, fill: colorForScore(summary?.avgScore || 0) }],
        [summary]
    );

    // Дані для таймлайна через індекс (100% рендер)
    const tl = useMemo(
        () => (summary?.timeline ?? []).map((p, i) => ({ i, t: p.timestamp, y: p.behaviorScore })),
        [summary]
    );

    // Контейнери з вимірюванням ширини
    const timelineBox = useBoxWidth(900);
    const trendsBox = useBoxWidth(900);

    return (
        <Container maxWidth={false} sx={{ 
            minHeight: '100dvh', 
            py: 4, 
            px: 4,
            '@keyframes shimmer': {
                '0%': { transform: 'translateX(-100%)' },
                '100%': { transform: 'translateX(100%)' }
            }
        }}>
            <Box sx={{ width: '100%' }}>
                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 3, 
                        mb: 3,
                        p: 4,
                        background: 'linear-gradient(135deg, rgba(79,140,255,0.08) 0%, rgba(79,140,255,0.03) 100%)',
                        borderRadius: 4,
                        border: '1px solid rgba(79,140,255,0.15)',
                        boxShadow: '0 4px 20px rgba(79,140,255,0.08)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '2px',
                            background: 'linear-gradient(90deg, #4f8cff, #6366f1, #8b5cf6)',
                            borderRadius: '2px'
                        }
                    }}>
                        <Box sx={{
                            p: 2.5,
                            borderRadius: 3,
                            background: 'linear-gradient(135deg, #4f8cff 0%, #6366f1 100%)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 8px 25px rgba(79,140,255,0.3)',
                            position: 'relative',
                            '&::after': {
                                content: '""',
                                position: 'absolute',
                                inset: 0,
                                borderRadius: 3,
                                background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
                                animation: 'shimmer 2s infinite'
                            }
                        }}>
                            <Psychology sx={{ fontSize: '2.5rem' }} />
                        </Box>
                        <Box>
                            <Typography variant="h3" fontWeight={900} sx={{ 
                                color: 'primary.main',
                                textShadow: '0 2px 4px rgba(79,140,255,0.1)'
                            }}>
                                My Profile
                            </Typography>
                            <Typography color="text.secondary" sx={{ mt: 1, fontSize: '1.2rem', fontWeight: 500 }}>
                                Welcome back! Here&apos;s your ImpulseGuard analytics dashboard.
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* API Token as copy button */}
                <Card elevation={8} sx={{ mb: 4, bgcolor: '#ffffff' }}>
                    <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                            <Typography variant="h6" fontWeight={700} sx={{ color: '#1f2937' }}>
                                Your API Token
                            </Typography>
                            <MuiTooltip title="Use this token to connect the browser extension with your account.">
                                <IconButton size="small" sx={{ 
                                    color: 'primary.main',
                                    bgcolor: 'rgba(79,140,255,0.1)',
                                    '&:hover': { bgcolor: 'rgba(79,140,255,0.2)' }
                                }}>
                                    <Info sx={{ fontSize: '1.2rem' }} />
                                </IconButton>
                            </MuiTooltip>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                            <Button
                                variant="outlined"
                                startIcon={<ContentCopy sx={{ fontSize: '1.1rem' }} />}
                                onClick={() => {
                                    navigator.clipboard.writeText(token || '');
                                    setSnack('API token copied to clipboard');
                                }}
                                sx={{
                                    fontFamily: 'monospace',
                                    fontWeight: 700,
                                    letterSpacing: '.3px',
                                    px: 3, py: 1.5,
                                    borderColor: 'primary.main',
                                    color: 'primary.main',
                                    '&:hover': {
                                        borderColor: 'primary.dark',
                                        bgcolor: 'rgba(79,140,255,0.05)',
                                        transform: 'translateY(-1px)',
                                        boxShadow: '0 4px 12px rgba(79,140,255,0.2)'
                                    },
                                    transition: 'all 0.2s ease-in-out'
                                }}
                            >
                                {truncatedToken}
                            </Button>

                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                Click to copy your token. Keep it private.
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>

                {isLoading ? (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <LinearProgress sx={{ mb: 2 }} />
                        <Typography color="text.secondary">
                            Loading your analytics data...
                        </Typography>
                    </Box>
                ) : error ? (
                    <Alert severity="error" sx={{ mb: 4 }}>
                        {error}
                        <Button size="small" onClick={loadSummary} sx={{ ml: 2 }}>
                            Retry
                        </Button>
                    </Alert>
                ) : summary ? (
                    <>
                        {/* Overview grid */}
                        <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: 4, mb: 4, width: '100%'
                        }}>
                            {/* Behavior Score Overview */}
                            <Card elevation={8} sx={{ height: '100%', bgcolor: '#ffffff' }}>
                                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                                    <Typography variant="h6" fontWeight={800} gutterBottom sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 3 }}>
                                        <AutoAwesome sx={{ color: 'primary.main', fontSize: '1.5rem' }} />
                                        Behavior Score
                                    </Typography>
                                    
                                    <Box sx={{ position: 'relative', display: 'inline-block', my: 3 }}>
                                        <Box
                                            sx={{
                                                width: 140,
                                                height: 140,
                                                borderRadius: '50%',
                                                background: `conic-gradient(${colorForScore(summary?.avgScore || 0)} ${(summary?.avgScore || 0) * 3.6}deg, #f8fafc ${(summary?.avgScore || 0) * 3.6}deg)`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                position: 'relative',
                                                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                                                '&::before': {
                                                    content: '""',
                                                    position: 'absolute',
                                                    inset: -4,
                                                    borderRadius: '50%',
                                                    background: `linear-gradient(45deg, ${colorForScore(summary?.avgScore || 0)}20, transparent)`,
                                                    zIndex: -1
                                                }
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    width: 100,
                                                    height: 100,
                                                    borderRadius: '50%',
                                                    bgcolor: '#ffffff',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.08)',
                                                    border: '3px solid #ffffff'
                                                }}
                                            >
                                                <Typography variant="h3" fontWeight={900} color={colorForScore(summary?.avgScore || 0)}>
                                                    {Math.round(summary?.avgScore || 0)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>
                                    
                                    <Box sx={{ 
                                        p: 2, 
                                        borderRadius: 2, 
                                        bgcolor: `${colorForScore(summary?.avgScore || 0)}10`,
                                        border: `1px solid ${colorForScore(summary?.avgScore || 0)}20`
                                    }}>
                                        <Typography variant="body2" fontWeight={600} sx={{ 
                                            color: colorForScore(summary?.avgScore || 0),
                                            textAlign: 'center'
                                        }}>
                                            {summary?.avgScore && summary.avgScore >= 70 ? '⚠️ High Risk' : 
                                             summary?.avgScore && summary.avgScore >= 40 ? '⚡ Moderate Risk' : '✅ Low Risk'}
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>


                            {/* Top Emotions */}
                            <Card elevation={8} sx={{ height: '100%', bgcolor: '#ffffff' }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Typography variant="h6" fontWeight={800} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                                        <PsychologyAlt sx={{ color: 'primary.main', fontSize: '1.5rem' }} />
                                        Top Emotions
                                    </Typography>

                                    {(() => {
                                        const entries = Object.entries(summary.topEmotions || {});
                                        if (!entries.length) return <Typography color="text.secondary">No emotions detected.</Typography>;
                                        // топ-3
                                        const top3 = entries.sort((a, b) => b[1] - a[1]).slice(0, 3);
                                        const maxVal = Math.max(...top3.map(([, v]) => v || 1));
                                        const medalIcons = [
                                            <Typography sx={{ fontSize: '1.8rem' }}>😤</Typography>, // Frustration
                                            <Typography sx={{ fontSize: '1.8rem' }}>😰</Typography>, // Anxiety  
                                            <Typography sx={{ fontSize: '1.8rem' }}>😠</Typography>  // Anger
                                        ];
                                        const gradients = [
                                            'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                                            'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)',
                                            'linear-gradient(135deg, #a78bfa 0%, #6366f1 100%)',
                                        ];

                                        return (
                                            <Stack spacing={2.5} sx={{ mt: 1 }}>
                                                {top3.map(([emotion, value], idx) => {
                                                    const pct = Math.round((value / maxVal) * 100);
                                                    return (
                                                        <Box
                                                            key={emotion}
                                                            sx={{
                                                                p: 2.5,
                                                                borderRadius: 3,
                                                                bgcolor: '#fafafa',
                                                                border: '1px solid #f1f5f9',
                                                                boxShadow: '0 2px 8px rgba(0,0,0,.04)',
                                                                transition: 'all 0.2s ease-in-out',
                                                                '&:hover': {
                                                                    transform: 'translateY(-1px)',
                                                                    boxShadow: '0 4px 12px rgba(0,0,0,.08)',
                                                                    bgcolor: '#ffffff'
                                                                }
                                                            }}
                                                        >
                                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                                    <Box sx={{
                                                                        p: 1,
                                                                        borderRadius: 2,
                                                                        bgcolor: `${gradients[idx].includes('#fbbf24') ? '#fef3c7' : gradients[idx].includes('#94a3b8') ? '#f1f5f9' : '#f3e8ff'}`,
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center'
                                                                    }}>
                                                                        {medalIcons[idx]}
                                                                    </Box>
                                                                    <Typography variant="subtitle1" sx={{ textTransform: 'capitalize', fontWeight: 800, color: '#1f2937' }}>
                                                                        {emotion}
                                                                    </Typography>
                                                                </Box>
                                                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#374151' }}>{value}</Typography>
                                                            </Box>

                                                            {/* Progress bar with gradient */}
                                                            <Box sx={{ position: 'relative', height: 8, borderRadius: 999, bgcolor: '#e5e7eb', overflow: 'hidden', mb: 1 }}>
                                                                <Box sx={{
                                                                    position: 'absolute',
                                                                    inset: 0,
                                                                    width: `${pct}%`,
                                                                    background: gradients[idx],
                                                                    borderRadius: 999,
                                                                    transition: 'width 0.3s ease-in-out'
                                                                }} />
                                                            </Box>

                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>vs top</Typography>
                                                                <Typography variant="caption" fontWeight={700} sx={{ color: '#374151' }}>{pct}%</Typography>
                                                            </Box>
                                                        </Box>
                                                    );
                                                })}
                                            </Stack>
                                        );
                                    })()}
                                </CardContent>

                            </Card>

                            {/* Risk Assessment */}
                            <Card elevation={8} sx={{ height: '100%', bgcolor: '#ffffff' }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Typography variant="h6" fontWeight={800} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                                        <Shield sx={{ color: 'primary.main', fontSize: '1.5rem' }} />
                                        Risk Assessment
                                    </Typography>
                                    <Stack spacing={2}>
                                        {summary.risks.map((risk) => (
                                            <Box key={risk.category} sx={{
                                                p: 2.5,
                                                border: `2px solid ${getRiskColor(risk.level)}`,
                                                borderRadius: 3,
                                                bgcolor: `${getRiskColor(risk.level)}08`,
                                                transition: 'all 0.2s ease-in-out',
                                                '&:hover': {
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: `0 8px 25px ${getRiskColor(risk.level)}20`,
                                                    bgcolor: `${getRiskColor(risk.level)}12`
                                                }
                                            }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                                                    <Typography variant="body2" fontWeight="bold" sx={{ color: getRiskColor(risk.level) }}>
                                                        {risk.category}
                                                    </Typography>
                                                    <Badge 
                                                        badgeContent={risk.count} 
                                                        color="error"
                                                        sx={{
                                                            '& .MuiBadge-badge': {
                                                                bgcolor: getRiskColor(risk.level),
                                                                color: '#ffffff',
                                                                fontWeight: 'bold'
                                                            }
                                                        }}
                                                    >
                                                        {getRiskIcon(risk.level)}
                                                    </Badge>
                                                </Box>
                                                <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                                                    {risk.description}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Box>

                        {/* Behavior Score Timeline */}
                        <Box sx={{ mb: 4 }}>
                            <Card elevation={8} sx={{ bgcolor: '#ffffff' }}>
                                <Box sx={{ p: 2.5, pb: 0 }}>
                                    <Typography variant="h6" fontWeight={800} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Timeline /> Behavior Score Timeline
                                    </Typography>
                                </Box>

                                <CardContent sx={{ p: 0 }}>
                                    <AutoSizer height={420}>
                                        {({ width, height }) => (
                                            <LineChart
                                                width={width}
                                                height={height}
                                                data={(summary?.timeline ?? []).map(p => ({ ts: p.timestamp, behaviorScore: p.behaviorScore }))}
                                                margin={{ top: 16, right: 24, left: 8, bottom: 24 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                <XAxis
                                                    dataKey="ts"
                                                    type="number"
                                                    scale="time"
                                                    domain={['dataMin', 'dataMax']}
                                                    tickFormatter={(v) => new Date(v).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    tick={{ fontSize: 12, fill: '#333' }}
                                                    axisLine={{ stroke: '#e5e7eb' }}
                                                />
                                                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#333' }} axisLine={{ stroke: '#e5e7eb' }} />
                                                <RechartsTooltip
                                                    labelFormatter={(v) => new Date(v as number).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                                                    formatter={(value: any) => [value, 'Behavior Score']}
                                                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,.08)' }}
                                                />
                                                <Line type="monotone" dataKey="behaviorScore" stroke="#4f8cff" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                            </LineChart>
                                        )}
                                    </AutoSizer>
                                </CardContent>
                            </Card>

                        </Box>

                        {/* Trend Analysis */}
                        <Box sx={{ mb: 4 }}>
                            <Card elevation={8} sx={{ bgcolor: '#ffffff' }}>
                                <Box sx={{ p: 2.5, pb: 0 }}>
                                    <Typography variant="h6" fontWeight={800} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <TrendingUp /> Trend Analysis
                                    </Typography>

                                    {/* ваші таби тут */}
                                    <Box sx={{ mt: 2 }}>
                                        {/* ... */}
                                    </Box>
                                </Box>

                                <CardContent sx={{ p: 0 }}>
                                    <AutoSizer height={340}>
                                        {({ width, height }) => (
                                            <BarChart width={width} height={height} data={trendData} margin={{ top: 16, right: 24, left: 8, bottom: 24 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                <XAxis dataKey={trendXAxisKey} tick={{ fontSize: 12, fill: '#333' }} axisLine={{ stroke: '#e5e7eb' }} />
                                                <YAxis domain={trendDomain as any} tick={{ fontSize: 12, fill: '#333' }} axisLine={{ stroke: '#e5e7eb' }} />
                                                <RechartsTooltip
                                                    formatter={(value: any) => [value, 'Behavior Score']}
                                                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,.08)' }}
                                                />
                                                <Bar dataKey="score" fill="#4f8cff" radius={[6, 6, 0, 0]} />
                                            </BarChart>
                                        )}
                                    </AutoSizer>
                                </CardContent>
                            </Card>

                        </Box>

                        {/* Recent Events */}
                        <Box sx={{ mb: 4 }}>
                            <Card elevation={8} sx={{ bgcolor: '#ffffff' }}>
                                <CardContent>
                                    <Typography variant="h6" fontWeight={800} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Assessment />
                                        Recent Events
                                    </Typography>
                                    <Box sx={{
                                        display: 'grid',
                                        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)', xl: 'repeat(6, 1fr)' },
                                        gap: 3
                                    }}>
                                        {summary.timeline.slice(0, 6).map((event) => {
                                            const cls = classifyScore(event.behaviorScore);
                                            return (
                                                <Box key={event.id}>
                                                    <Paper
                                                        elevation={2}
                                                        sx={{
                                                            p: 2,
                                                            border: `2px solid ${cls === 'bad' ? '#ef4444' : cls === 'warn' ? '#f59e0b' : '#22c55e'}`,
                                                            borderRadius: 2,
                                                            height: '100%',
                                                            bgcolor: '#ffffff'
                                                        }}
                                                    >
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                            <Typography variant="body2" fontWeight="bold">
                                                                {formatTimeHM(event.timestamp)}
                                                            </Typography>
                                                            <Chip
                                                                label={event.behaviorScore}
                                                                size="small"
                                                                color={cls === 'bad' ? 'error' : cls === 'warn' ? 'warning' : 'success'}
                                                            />
                                                        </Box>
                                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                                            {event.description}
                                                        </Typography>
                                                        {event.risks.length > 0 && (
                                                            <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
                                                                {event.risks.map((risk) => (
                                                                    <Chip
                                                                        key={risk}
                                                                        label={risk}
                                                                        size="small"
                                                                        color="error"
                                                                        variant="outlined"
                                                                    />
                                                                ))}
                                                            </Stack>
                                                        )}
                                                    </Paper>
                                                </Box>
                                            );
                                        })}
                                    </Box>
                                </CardContent>
                            </Card>
                        </Box>

                        {/* Refresh */}
                        <Box sx={{ mt: 4, textAlign: 'center' }}>
                            <Button
                                variant="outlined"
                                onClick={loadSummary}
                                startIcon={<Refresh />}
                                size="large"
                            >
                                Refresh Data
                            </Button>
                        </Box>
                    </>
                ) : (
                    <Typography color="text.secondary" sx={{ mt: 2 }}>
                        No data available. Start using the extension to see your statistics.
                    </Typography>
                )}
            </Box>

            <Snackbar
                open={!!snack}
                message={snack ?? ''}
                autoHideDuration={2000}
                onClose={() => setSnack(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            />
        </Container>
    );
}
