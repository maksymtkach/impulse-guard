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
import { getSummaryFull } from "../api";
import {
    TrendingUp, Warning, Error as ErrorIcon, Info, Refresh,
    Timeline, Assessment, Psychology, Security, ContentCopy
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
    sentiscore: number;
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
    const [summary, setSummary] = useState<EnhancedSummaryData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily');
    const [snack, setSnack] = useState<string | null>(null);

    const navigate = useNavigate();

    async function loadSummary() {
        if (!token) return;
        setIsLoading(true); setError("");
        try {
            const data = await getSummaryFull(token);
            setSummary(data);
        } catch (e: any) {
            setError(e?.message || "Failed to load data");
        } finally {
            setIsLoading(false);
        }
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
            case 'warning': return <Warning />;
            case 'super-risky': return <ErrorIcon />;
            case 'critical': return <Security />;
            default: return <Info />;
        }
    };

    const formatTimeHM = (ts: number | string) =>
        new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // ===== Derived data =====
    const timelineScores = useMemo(
        () => (summary?.timeline ?? []).map(e => e.sentiscore),
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
        () => (summary?.timeline ?? []).map((p, i) => ({ i, t: p.timestamp, y: p.sentiscore })),
        [summary]
    );

    // Контейнери з вимірюванням ширини
    const timelineBox = useBoxWidth(900);
    const trendsBox = useBoxWidth(900);

    return (
        <Container maxWidth={false} sx={{ minHeight: '100dvh', py: 4, px: 4 }}>
            <Box sx={{ width: '100%' }}>
                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h3" fontWeight={900} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Psychology sx={{ fontSize: '2rem', color: 'primary.main' }} />
                        My Profile
                    </Typography>
                    <Typography color="text.secondary" sx={{ mt: 1 }}>
                        Welcome back! Here&apos;s your ImpulseGuard analytics dashboard.
                    </Typography>
                </Box>

                {/* API Token as copy button */}
                <Card elevation={8} sx={{ mb: 4 }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <Typography variant="h6" fontWeight={700}>
                                Your API Token
                            </Typography>
                            <MuiTooltip title="Use this token to connect the browser extension with your account.">
                                <IconButton size="small" sx={{ color: 'text.secondary' }}>
                                    <Info />
                                </IconButton>
                            </MuiTooltip>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <Button
                                variant="outlined"
                                startIcon={<ContentCopy />}
                                onClick={() => {
                                    navigator.clipboard.writeText(token || '');
                                    setSnack('API token copied to clipboard');
                                }}
                                sx={{
                                    fontFamily: 'monospace',
                                    fontWeight: 700,
                                    letterSpacing: '.3px',
                                    px: 2.2, py: 1.2,
                                }}
                            >
                                {truncatedToken}
                            </Button>

                            <Typography variant="caption" color="text.secondary">
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
                            {/* Sentiscore Overview */}
                            <Card elevation={8} sx={{ height: '100%', bgcolor: '#ffffff' }}>
  <AutoSizer height={260}>
    {({ width, height }) => {
      const avg = Math.round(summary?.avgScore ?? 0);
      const donutData = [{ track: 100, value: avg }];

      return (
        <RadialBarChart
          width={width}
          height={height}
          data={donutData}
          innerRadius="70%"
          outerRadius="100%"
          startAngle={90}
          endAngle={-270}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          {/* трек 100% */}
          <RadialBar dataKey="track" isAnimationActive={false} fill="#f3f4f6" />
          {/* фактичний відсоток */}
          <RadialBar
            dataKey="value"
            cornerRadius={18}
            fill={colorForScore(avg)}
            background
          />
        </RadialBarChart>
      );
    }}
  </AutoSizer>
</Card>


                            {/* Top Emotions */}
                            <Card elevation={8} sx={{ height: '100%', bgcolor: '#ffffff' }}>
                                {/* Top Emotions (ranked top-3) */}
                                <CardContent>
                                    <Typography variant="h6" fontWeight={800} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Psychology />
                                        Top Emotions
                                    </Typography>

                                    {(() => {
                                        const entries = Object.entries(summary.topEmotions || {});
                                        if (!entries.length) return <Typography color="text.secondary">No emotions detected.</Typography>;
                                        // топ-3
                                        const top3 = entries.sort((a, b) => b[1] - a[1]).slice(0, 3);
                                        const maxVal = Math.max(...top3.map(([, v]) => v || 1));
                                        const medals = ["🥇", "🥈", "🥉"];
                                        const gradients = [
                                            'linear-gradient(90deg, #f59e0b 0%, #f97316 100%)',
                                            'linear-gradient(90deg, #94a3b8 0%, #64748b 100%)',
                                            'linear-gradient(90deg, #a78bfa 0%, #6366f1 100%)',
                                        ];

                                        return (
                                            <Stack spacing={2} sx={{ mt: 1 }}>
                                                {top3.map(([emotion, value], idx) => {
                                                    const pct = Math.round((value / maxVal) * 100);
                                                    return (
                                                        <Box
                                                            key={emotion}
                                                            sx={{
                                                                p: 2,
                                                                borderRadius: 2,
                                                                bgcolor: '#fff',
                                                                border: '1px solid #e5e7eb',
                                                                boxShadow: '0 1px 3px rgba(0,0,0,.06)'
                                                            }}
                                                        >
                                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                                                                    <Typography fontSize={20}>{medals[idx]}</Typography>
                                                                    <Typography variant="subtitle1" sx={{ textTransform: 'capitalize', fontWeight: 800 }}>
                                                                        {emotion}
                                                                    </Typography>
                                                                </Box>
                                                                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{value}</Typography>
                                                            </Box>

                                                            {/* бар з градієнтом */}
                                                            <Box sx={{ position: 'relative', height: 12, borderRadius: 999, bgcolor: '#f3f4f6', overflow: 'hidden' }}>
                                                                <Box sx={{
                                                                    position: 'absolute',
                                                                    inset: 0,
                                                                    width: `${pct}%`,
                                                                    background: gradients[idx],
                                                                }} />
                                                            </Box>

                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: .75 }}>
                                                                <Typography variant="caption" color="text.secondary">vs top</Typography>
                                                                <Typography variant="caption" fontWeight={700}>{pct}%</Typography>
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
                                <CardContent>
                                    <Typography variant="h6" fontWeight={800} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Warning />
                                        Risk Assessment
                                    </Typography>
                                    <Stack spacing={2}>
                                        {summary.risks.map((risk) => (
                                            <Box key={risk.category} sx={{
                                                p: 2,
                                                border: `2px solid ${getRiskColor(risk.level)}`,
                                                borderRadius: 2,
                                                bgcolor: `${getRiskColor(risk.level)}10`
                                            }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                    <Typography variant="body2" fontWeight="bold" sx={{ color: getRiskColor(risk.level) }}>
                                                        {risk.category}
                                                    </Typography>
                                                    <Badge badgeContent={risk.count} color="error">
                                                        {getRiskIcon(risk.level)}
                                                    </Badge>
                                                </Box>
                                                <Typography variant="caption" color="text.secondary">
                                                    {risk.description}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Box>

                        {/* Sentiscore Timeline */}
                        <Box sx={{ mb: 4 }}>
                            <Card elevation={8} sx={{ bgcolor: '#ffffff' }}>
                                <Box sx={{ p: 2.5, pb: 0 }}>
                                    <Typography variant="h6" fontWeight={800} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Timeline /> Sentiscore Timeline
                                    </Typography>
                                </Box>

                                <CardContent sx={{ p: 0 }}>
                                    <AutoSizer height={420}>
                                        {({ width, height }) => (
                                            <LineChart
                                                width={width}
                                                height={height}
                                                data={(summary?.timeline ?? []).map(p => ({ ts: p.timestamp, sentiscore: p.sentiscore }))}
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
                                                    formatter={(value: any) => [value, 'Sentiscore']}
                                                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,.08)' }}
                                                />
                                                <Line type="monotone" dataKey="sentiscore" stroke="#4f8cff" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
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
                                                    formatter={(value: any) => [value, 'Sentiscore']}
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
                                            const cls = classifyScore(event.sentiscore);
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
                                                                label={event.sentiscore}
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
