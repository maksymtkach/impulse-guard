import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

interface NavigationProps {
    isAuthenticated: boolean;
    onLogout: () => void;
}

export default function Navigation({ isAuthenticated, onLogout }: NavigationProps) {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        onLogout();
        navigate("/");
    };

    return (
        <AppBar position="static" elevation={4}>
            <Toolbar sx={{ 
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 2, sm: 0 },
                py: { xs: 2, sm: 1 }
            }}>
                {/* Left Section - Logo */}
                <Typography 
                    variant="h5" 
                    component="div" 
                    sx={{ 
                        cursor: 'pointer',
                        textAlign: { xs: 'center', sm: 'left' },
                        order: { xs: 1, sm: 1 },
                        fontWeight: 700,
                        fontSize: { xs: '1.25rem', sm: '1.5rem' }
                    }}
                    onClick={() => navigate("/")}
                >
                    ImpulseGuard
                </Typography>

                {/* Center Section - Navigation Links */}
                <Box sx={{ 
                    display: 'flex', 
                    gap: 2,
                    justifyContent: 'center',
                    order: { xs: 2, sm: 2 }
                }}>
                    <Button 
                        color="inherit" 
                        onClick={() => navigate("/")}
                        sx={{ 
                            textDecoration: location.pathname === "/" ? "underline" : "none",
                            textUnderlineOffset: "4px",
                            minWidth: { xs: '120px', sm: 'auto' },
                            fontSize: { xs: '0.9rem', sm: '1rem' },
                            fontWeight: 500,
                            textTransform: 'none'
                        }}
                    >
                        Home
                    </Button>
                    
                    {isAuthenticated && (
                        <Button 
                            color="inherit" 
                            onClick={() => navigate("/profile")}
                            sx={{ 
                                textDecoration: location.pathname === "/profile" ? "underline" : "none",
                                textUnderlineOffset: "4px",
                                minWidth: { xs: '120px', sm: 'auto' },
                                fontSize: { xs: '0.9rem', sm: '1rem' },
                                fontWeight: 500,
                                textTransform: 'none'
                            }}
                        >
                            Profile
                        </Button>
                    )}
                </Box>

                {/* Right Section - Auth Actions */}
                <Box sx={{ 
                    order: { xs: 3, sm: 3 }
                }}>
                    {isAuthenticated ? (
                        <Button 
                            color="inherit" 
                            variant="outlined" 
                            onClick={handleLogout}
                            sx={{ 
                                borderColor: 'rgba(255,255,255,0.5)', 
                                color: 'white',
                                minWidth: { xs: '120px', sm: 'auto' },
                                fontSize: { xs: '0.9rem', sm: '1rem' },
                                fontWeight: 500,
                                textTransform: 'none',
                                px: 2
                            }}
                        >
                            Logout
                        </Button>
                    ) : (
                        <Button 
                            color="inherit" 
                            variant="outlined" 
                            onClick={() => navigate("/auth")}
                            sx={{ 
                                borderColor: 'rgba(255,255,255,0.5)', 
                                color: 'white',
                                minWidth: { xs: '120px', sm: 'auto' },
                                fontSize: { xs: '0.9rem', sm: '1rem' },
                                fontWeight: 500,
                                textTransform: 'none',
                                px: 2
                            }}
                        >
                            Sign In
                        </Button>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
} 