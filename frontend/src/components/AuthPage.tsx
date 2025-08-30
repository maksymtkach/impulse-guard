import { useState } from "react";
import {
    Box, Button, Card, CardContent, Container, TextField, Typography, Stack, Divider, Alert
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { mockApi } from "../mockData";

interface AuthPageProps {
    onAuthSuccess: (token: string) => void;
}

export default function AuthPage({ onAuthSuccess }: AuthPageProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [msg, setMsg] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    async function register() {
        setIsLoading(true);
        setMsg("");
        try {
            await mockApi.register(email, password);
            setMsg("Registration successful! Now log in.");
        } catch (error) {
            setMsg(error instanceof Error ? error.message : "Registration failed.");
        } finally {
            setIsLoading(false);
        }
    }

    async function login() {
        setIsLoading(true);
        setMsg("");
        try {
            const result = await mockApi.login(email, password);
            localStorage.setItem("ig_token", result.apiToken);
            onAuthSuccess(result.apiToken);
            navigate("/profile");
        } catch (error) {
            setMsg(error instanceof Error ? error.message : "Login failed.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Container maxWidth="sm" sx={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', py: 6 }}>
            <Box sx={{ width: '100%' }}>
                <Typography variant="h3" fontWeight={900} align="center" gutterBottom>
                    ImpulseGuard Account
                </Typography>
                <Typography color="text.secondary" align="center" sx={{ mb: 4, maxWidth: 600 }}>
                    Create an account to get your personal API token for the extension. View your average Sentiscore and emotions.
                </Typography>

                <Card elevation={8}>
                    <CardContent sx={{ p: 4 }}>
                        <Stack spacing={3}>
                            <TextField
                                fullWidth
                                label="Email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                            />
                            <TextField
                                fullWidth
                                type="password"
                                label="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                            />
                            <Stack direction="row" spacing={2}>
                                <Button
                                    variant="contained"
                                    onClick={register}
                                    disabled={isLoading || !email || !password}
                                    fullWidth
                                >
                                    Register
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={login}
                                    disabled={isLoading || !email || !password}
                                    fullWidth
                                >
                                    Log In
                                </Button>
                            </Stack>
                        </Stack>

                        {msg && (
                            <Alert severity={msg.includes("successful") ? "success" : "error"} sx={{ mt: 3 }}>
                                {msg}
                            </Alert>
                        )}

                        <Divider sx={{ my: 3 }} />
                        
                        <Typography variant="body2" color="text.secondary" align="center">
                            Already have an account? Just log in with your credentials above.
                        </Typography>
                        
                        <Divider sx={{ my: 3 }} />
                        
                        <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(79,140,255,0.1)', borderRadius: 1, border: '1px solid rgba(79,140,255,0.2)' }}>
                            <Typography variant="body2" color="primary.main" gutterBottom>
                                <strong>Demo Credentials:</strong>
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                                Email: demo@example.com
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                                Password: password123
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        </Container>
    );
} 