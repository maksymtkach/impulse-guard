import { useEffect, useState } from "react";
import {
    Box, Button, Card, CardContent, Container, Typography, Chip, Stack, Divider, Alert
} from "@mui/material";
import { RadialBar, RadialBarChart, ResponsiveContainer } from "recharts";
import { useNavigate } from "react-router-dom";
import { mockApi, ensureDemoToken } from "../mockData";

interface ProfilePageProps {
    token: string;
    onLogout: () => void;
}

interface SummaryData {
    avgScore: number;
    events: number;
    topEmotions: Record<string, number>;
}

export default function ProfilePage({ token, onLogout }: ProfilePageProps) {
    const [summary, setSummary] = useState<SummaryData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    async function loadSummary() {
        if (!token) return;
        setIsLoading(true);
        setError("");
        try {
            const data = await mockApi.getSummary(token);
            setSummary(data);
        } catch (error) {
            setError(error instanceof Error ? error.message : "Failed to load data");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        // Ensure demo token is available
        ensureDemoToken();
        loadSummary();
    }, [token]);

    const handleLogout = () => {
        localStorage.removeItem("ig_token");
        onLogout();
        navigate("/");
    };

    const radialData = [{ name: "Avg", value: summary?.avgScore || 0, fill: "#4f8cff" }];

    return (
        <Container maxWidth="lg" sx={{ minHeight: '100dvh', py: 6 }}>
            <Box sx={{ width: '100%' }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Box>
                        <Typography variant="h3" fontWeight={900}>
                            My Profile
                        </Typography>
                        <Typography color="text.secondary" sx={{ mt: 1 }}>
                            Welcome back! Here's your ImpulseGuard dashboard.
                        </Typography>
                    </Box>
                    <Stack direction="row" spacing={2}>
                        <Button variant="outlined" onClick={() => navigate("/")}>
                            Home
                        </Button>
                        <Button variant="contained" color="error" onClick={handleLogout}>
                            Logout
                        </Button>
                    </Stack>
                </Box>

                {/* API Token Section */}
                <Card elevation={8} sx={{ mb: 4 }}>
                    <CardContent>
                        <Typography variant="h6" fontWeight={700} gutterBottom>
                            Your API Token
                        </Typography>
                        <Box sx={{ 
                            p: 2, 
                            bgcolor: 'rgba(79,140,255,0.1)', 
                            border: '1px solid rgba(79,140,255,0.2)', 
                            borderRadius: 1, 
                            wordBreak: 'break-all',
                            fontFamily: 'monospace',
                            fontSize: '0.875rem',
                            color: 'primary.main'
                        }}>
                            {token}
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            Copy this token into the extension Options.
                        </Typography>
                    </CardContent>
                </Card>

                {/* Dashboard Section */}
                <Card elevation={8}>
                    <CardContent>
                        <Typography variant="h6" fontWeight={800} gutterBottom>
                            My Dashboard
                        </Typography>
                        
                        {isLoading ? (
                            <Typography color="text.secondary" sx={{ mt: 2 }}>
                                Loading your data...
                            </Typography>
                        ) : error ? (
                            <Alert severity="error" sx={{ mt: 2 }}>
                                {error}
                                <Button size="small" onClick={loadSummary} sx={{ ml: 2 }}>
                                    Retry
                                </Button>
                            </Alert>
                        ) : summary ? (
                            <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} sx={{ mt: 2 }}>
                                {/* Sentiscore Chart */}
                                <Box sx={{ flex: 1, height: 250, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadialBarChart 
                                            innerRadius="55%" 
                                            outerRadius="100%" 
                                            data={radialData} 
                                            startAngle={90} 
                                            endAngle={-270}
                                        >
                                            <RadialBar dataKey="value" cornerRadius={18} background />
                                        </RadialBarChart>
                                    </ResponsiveContainer>
                                    <Typography align="center" sx={{ mt: 2, fontSize: '1.1rem' }}>
                                        Average Sentiscore: <b>{summary.avgScore}</b>
                                    </Typography>
                                    <Typography align="center" color="text.secondary">
                                        Events: {summary.events}
                                    </Typography>
                                </Box>

                                {/* Top Emotions */}
                                <Box sx={{ flex: 1 }}>
                                    <Typography fontWeight={700} sx={{ mb: 2 }}>
                                        Top Emotions
                                    </Typography>
                                    {Object.entries(summary.topEmotions || {}).length === 0 ? (
                                        <Typography color="text.secondary">
                                            No emotion data available yet.
                                        </Typography>
                                    ) : (
                                        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                                            {Object.entries(summary.topEmotions || {}).map(([emotion, value]) => (
                                                <Chip 
                                                    key={emotion} 
                                                    label={`${emotion}: ${value}`}
                                                    sx={{ mb: 1 }}
                                                />
                                            ))}
                                        </Stack>
                                    )}
                                </Box>
                            </Stack>
                        ) : (
                            <Typography color="text.secondary" sx={{ mt: 2 }}>
                                No data available. Start using the extension to see your statistics.
                            </Typography>
                        )}

                        {summary && (
                            <Box sx={{ mt: 3, textAlign: 'center' }}>
                                <Button variant="outlined" onClick={loadSummary}>
                                    Refresh Data
                                </Button>
                            </Box>
                        )}
                    </CardContent>
                </Card>
            </Box>
        </Container>
    );
} 