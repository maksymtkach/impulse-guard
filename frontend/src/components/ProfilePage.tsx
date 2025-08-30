import { useEffect, useState } from "react";
import {
    Box, Button, Card, CardContent, Container, Typography, Chip, Stack, Alert,
    Paper, LinearProgress, Badge, Tooltip, IconButton
} from "@mui/material";
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
    ResponsiveContainer, BarChart, Bar, RadialBar, RadialBarChart
} from "recharts";
import { useNavigate } from "react-router-dom";
import { mockApi, ensureDemoToken } from "../mockData";
import { 
    TrendingUp, Warning, Error, Info, Refresh, 
    Timeline, Assessment, Psychology, Security 
} from '@mui/icons-material';

interface ProfilePageProps {
    token: string;
    onLogout: () => void;
}

interface TimelineEvent {
    id: string;
    timestamp: string;
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

export default function ProfilePage({ token, onLogout }: ProfilePageProps) {
    const [summary, setSummary] = useState<EnhancedSummaryData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily');
    const navigate = useNavigate();

    async function loadSummary() {
        if (!token) return;
        setIsLoading(true);
        setError("");
        try {
            const data = await mockApi.getSummary(token);
            setSummary(data);
        } catch (error: unknown) {
            let errorMessage = "Failed to load data";
            if (error && typeof error === 'object' && 'message' in error) {
                errorMessage = String(error.message);
            }
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        ensureDemoToken();
        loadSummary();
    }, [token]);

    // Debug logging
    useEffect(() => {
        if (summary) {
            console.log('Summary data loaded:', summary);
            console.log('Timeline data:', summary.timeline);
            console.log('Trends data:', summary.trends);
        }
    }, [summary]);

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'warning': return '#ff9800';
            case 'super-risky': return '#f44336';
            case 'critical': return '#d32f2f';
            default: return '#757575';
        }
    };

    const getRiskIcon = (level: string) => {
        switch (level) {
            case 'warning': return <Warning />;
            case 'super-risky': return <Error />;
            case 'critical': return <Security />;
            default: return <Info />;
        }
    };

    const formatTimestamp = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    const radialData = [{ name: "Avg", value: summary?.avgScore || 0, fill: "#4f8cff" }];

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
                        Welcome back! Here's your ImpulseGuard analytics dashboard.
                    </Typography>
                </Box>

                {/* API Token Section */}
                <Card elevation={8} sx={{ mb: 4 }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <Typography variant="h6" fontWeight={700}>
                                Your API Token
                            </Typography>
                            <Tooltip title="This is your unique API token for connecting the ImpulseGuard extension to your account. Keep it secure and don't share it with others.">
                                <IconButton size="small" sx={{ color: 'text.secondary' }}>
                                    <Info />
                                </IconButton>
                            </Tooltip>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ 
                                p: 2, 
                                bgcolor: 'rgba(79,140,255,0.1)', 
                                border: '1px solid rgba(79,140,255,0.2)', 
                                borderRadius: 1, 
                                flex: 1,
                                fontFamily: 'monospace',
                                fontSize: '0.875rem',
                                color: 'text.secondary',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                ••••••••••••••••••••••••••••••
                            </Box>
                            <Button 
                                variant="contained" 
                                onClick={() => navigator.clipboard.writeText(token)}
                                startIcon={<Security />}
                                sx={{ minWidth: 120 }}
                            >
                                Copy Token
                            </Button>
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            Click the button to copy your API token for the extension.
                        </Typography>
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
                        {/* Main Dashboard Overview - Full Width */}
                        <Box sx={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(3, 1fr)', 
                            gap: 4, 
                            mb: 4,
                            width: '100%'
                        }}>
                            {/* Sentiscore Overview */}
                            <Card elevation={8} sx={{ height: '100%', bgcolor: '#ffffff' }}>
                                <CardContent>
                                    <Typography variant="h6" fontWeight={800} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Assessment />
                                        Sentiscore Overview
                                    </Typography>
                                    
                                    <Box sx={{ height: 250, display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: '#ffffff' }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RadialBarChart 
                                                innerRadius="55%" 
                                                outerRadius="100%" 
                                                data={radialData} 
                                                startAngle={90} 
                                                endAngle={-270}
                                            >
                                                <RadialBar dataKey="value" cornerRadius={18} background fill="#e3f2fd" />
                                            </RadialBarChart>
                                        </ResponsiveContainer>
                                        <Typography align="center" sx={{ mt: 2, fontSize: '1.5rem', fontWeight: 'bold' }}>
                                            {summary.avgScore}
                                        </Typography>
                                        <Typography align="center" color="text.secondary" gutterBottom>
                                            Average Sentiscore
                                        </Typography>
                                        <Typography align="center" color="text.secondary">
                                            Events: {summary.events}
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>

                            {/* Top Emotions */}
                            <Card elevation={8} sx={{ height: '100%', bgcolor: '#ffffff' }}>
                                <CardContent>
                                    <Typography variant="h6" fontWeight={800} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Psychology />
                                        Top Emotions
                                    </Typography>
                                    <Stack spacing={2}>
                                        {Object.entries(summary.topEmotions).map(([emotion, value]) => (
                                            <Box key={emotion} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                                                    {emotion}
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <LinearProgress 
                                                        variant="determinate" 
                                                        value={Math.min((value / 500) * 100, 100)} 
                                                        sx={{ width: 100, height: 8, borderRadius: 4 }}
                                                        color={value > 400 ? 'error' : value > 200 ? 'warning' : 'success'}
                                                    />
                                                    <Typography variant="body2" fontWeight="bold">
                                                        {value}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        ))}
                                    </Stack>
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

                        {/* Sentiscore Timeline Chart */}
                        <Box sx={{ mb: 4 }}>
                            <Card elevation={8} sx={{ bgcolor: '#ffffff' }}>
                                <CardContent>
                                    <Typography variant="h6" fontWeight={800} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Timeline />
                                        Sentiscore Timeline
                                    </Typography>
                                    <Box sx={{ height: 400, mt: 2, bgcolor: '#ffffff', border: '1px solid #e0e0e0', borderRadius: 1 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart 
                                                data={summary.timeline}
                                                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                                <XAxis 
                                                    dataKey="timestamp" 
                                                    tickFormatter={formatTimestamp}
                                                    tick={{ fontSize: 12, fill: '#333' }}
                                                    axisLine={{ stroke: '#333' }}
                                                />
                                                <YAxis 
                                                    domain={[30, 50]}
                                                    tick={{ fontSize: 12, fill: '#333' }}
                                                    axisLine={{ stroke: '#333' }}
                                                />
                                                <RechartsTooltip 
                                                    labelFormatter={formatTimestamp}
                                                    formatter={(value: any) => [value, 'Sentiscore']}
                                                    contentStyle={{ 
                                                        backgroundColor: '#ffffff', 
                                                        border: '1px solid #ccc',
                                                        borderRadius: '8px',
                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                                    }}
                                                />
                                                <Line 
                                                    type="monotone" 
                                                    dataKey="sentiscore" 
                                                    stroke="#4f8cff" 
                                                    strokeWidth={3}
                                                    dot={{ fill: '#4f8cff', strokeWidth: 2, r: 4 }}
                                                    activeDot={{ r: 6, stroke: '#4f8cff', strokeWidth: 2 }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Box>

                        {/* Trend Analysis */}
                        <Box sx={{ mb: 4 }}>
                            <Card elevation={8} sx={{ bgcolor: '#ffffff' }}>
                                <CardContent>
                                    <Typography variant="h6" fontWeight={800} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <TrendingUp />
                                        Trend Analysis
                                    </Typography>
                                    
                                    {/* Tab Navigation */}
                                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                                        <Stack direction="row" spacing={1}>
                                            {(['daily', 'weekly', 'monthly'] as const).map((tab) => (
                                                <Button
                                                    key={tab}
                                                    variant={activeTab === tab ? 'contained' : 'outlined'}
                                                    size="small"
                                                    onClick={() => setActiveTab(tab)}
                                                    sx={{ textTransform: 'capitalize' }}
                                                >
                                                    {tab}
                                                </Button>
                                            ))}
                                        </Stack>
                                    </Box>

                                    {/* Chart */}
                                    <Box sx={{ height: 300, bgcolor: '#ffffff', border: '1px solid #e0e0e0', borderRadius: 1 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart 
                                                data={summary.trends[activeTab]}
                                                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                                <XAxis 
                                                    dataKey={activeTab === 'daily' ? 'date' : activeTab === 'weekly' ? 'week' : 'month'} 
                                                    tick={{ fontSize: 12, fill: '#333' }}
                                                    axisLine={{ stroke: '#333' }}
                                                />
                                                <YAxis 
                                                    domain={[30, 50]}
                                                    tick={{ fontSize: 12, fill: '#333' }}
                                                    axisLine={{ stroke: '#333' }}
                                                />
                                                <RechartsTooltip 
                                                    formatter={(value: any) => [value, 'Sentiscore']}
                                                    contentStyle={{ 
                                                        backgroundColor: '#ffffff', 
                                                        border: '1px solid #ccc',
                                                        borderRadius: '8px',
                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                                    }}
                                                />
                                                <Bar 
                                                    dataKey="score" 
                                                    fill="#4f8cff" 
                                                    radius={[4, 4, 0, 0]}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </Box>
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
                                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)', xl: 'repeat(6, 1fr)' }, gap: 3 }}>
                                        {summary.timeline.slice(0, 6).map((event) => (
                                            <Box key={event.id}>
                                                <Paper 
                                                    elevation={2} 
                                                    sx={{ 
                                                        p: 2, 
                                                        border: `2px solid ${event.sentiscore > 45 ? '#f44336' : event.sentiscore < 35 ? '#4caf50' : '#ff9800'}`,
                                                        borderRadius: 2,
                                                        height: '100%',
                                                        bgcolor: '#ffffff'
                                                    }}
                                                >
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                        <Typography variant="body2" fontWeight="bold">
                                                            {formatTimestamp(event.timestamp)}
                                                        </Typography>
                                                        <Chip 
                                                            label={event.sentiscore}
                                                            size="small"
                                                            color={event.sentiscore > 45 ? 'error' : event.sentiscore < 35 ? 'warning' : 'success'}
                                                        />
                                                    </Box>
                                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                                        {event.description}
                                                    </Typography>
                                                    {event.risks.length > 0 && (
                                                        <Stack direction="row" spacing={0.5}>
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
                                        ))}
                                    </Box>
                                </CardContent>
                            </Card>
                        </Box>
                    </>
                ) : (
                    <Typography color="text.secondary" sx={{ mt: 2 }}>
                        No data available. Start using the extension to see your statistics.
                    </Typography>
                )}

                {/* Refresh Button */}
                {summary && (
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
                )}
            </Box>
        </Container>
    );
} 