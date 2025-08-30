import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline, Box } from "@mui/material";

import Navigation from "./components/Navigation";
import HomePage from "./components/HomePage";
import AuthPage from "./components/AuthPage";
import ProfilePage from "./components/ProfilePage";

// Create a light theme
const lightTheme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#4f8cff',
        },
        background: {
            default: '#E6E6E6',
            paper: '#ffffff',
        },
        text: {
            primary: '#1a1a1a',
            secondary: '#666666',
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundColor: '#ffffff',
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    borderRadius: '8px',
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: '#4f8cff',
                    color: '#ffffff',
                },
            },
        },
    },
});

export default function App() {
    const [token, setToken] = useState(localStorage.getItem("ig_token") || "");
    const [isAuthenticated, setIsAuthenticated] = useState(!!token);

    useEffect(() => {
        setIsAuthenticated(!!token);
    }, [token]);

    const handleAuthSuccess = (newToken: string) => {
        setToken(newToken);
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        setToken("");
        setIsAuthenticated(false);
    };

    return (
        <ThemeProvider theme={lightTheme}>
            <CssBaseline />
            <Router>
                <Navigation isAuthenticated={isAuthenticated} onLogout={handleLogout} />
                
                {/* Mock Mode Indicator */}
                <Box sx={{ 
                    position: 'fixed', 
                    top: 80, 
                    right: 20, 
                    zIndex: 1000,
                    bgcolor: '#ff9800',
                    color: '#ffffff',
                    px: 2,
                    py: 1,
                    borderRadius: 1,
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}>
                    MOCK MODE
                </Box>
                
                <Routes>
                    <Route 
                        path="/" 
                        element={<HomePage isAuthenticated={isAuthenticated} />} 
                    />
                    <Route 
                        path="/auth" 
                        element={
                            isAuthenticated ? 
                            <Navigate to="/profile" replace /> : 
                            <AuthPage onAuthSuccess={handleAuthSuccess} />
                        } 
                    />
                    <Route 
                        path="/profile" 
                        element={
                            isAuthenticated ? 
                            <ProfilePage token={token} onLogout={handleLogout} /> : 
                            <Navigate to="/auth" replace />
                        } 
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </ThemeProvider>
    );
}
