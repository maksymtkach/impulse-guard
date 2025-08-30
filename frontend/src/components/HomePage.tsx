import { Box, Button, Card, CardContent, Container, Typography, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";

interface HomePageProps {
    isAuthenticated: boolean;
}

export default function HomePage({ isAuthenticated }: HomePageProps) {
    const navigate = useNavigate();

    return (
        <Container maxWidth={false} sx={{ minHeight: '100dvh', py: 6, px: 4 }}>
            <Box sx={{ width: '100%' }}>
                {/* Hero Section */}
                <Box sx={{ textAlign: 'center', mb: 8 }}>
                    <Typography 
                        variant="h1" 
                        fontWeight={800} 
                        gutterBottom
                        sx={{ 
                            fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
                            background: 'linear-gradient(135deg, #4f8cff 0%, #2563eb 100%)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            mb: 3
                        }}
                    >
                        ImpulseGuard
                    </Typography>
                    <Typography 
                        variant="h4" 
                        color="text.secondary" 
                        sx={{ 
                            mb: 6, 
                            maxWidth: 900, 
                            mx: 'auto',
                            fontWeight: 300,
                            lineHeight: 1.4
                        }}
                    >
                        Advanced behavioral analytics platform for intelligent online impulse control
                    </Typography>
                    
                    <Stack 
                        direction={{ xs: 'column', sm: 'row' }} 
                        spacing={{ xs: 2, sm: 3 }} 
                        justifyContent="center" 
                        sx={{ mb: 8 }}
                    >
                        {isAuthenticated ? (
                            <>
                                <Button 
                                    variant="contained" 
                                    size="large" 
                                    onClick={() => navigate("/profile")}
                                    sx={{ 
                                        width: { xs: '100%', sm: 'auto' },
                                        px: 4,
                                        py: 1.5,
                                        fontSize: '1.1rem',
                                        fontWeight: 600,
                                        borderRadius: '12px',
                                        boxShadow: '0 8px 25px rgba(79, 140, 255, 0.3)',
                                        '&:hover': {
                                            boxShadow: '0 12px 35px rgba(79, 140, 255, 0.4)',
                                            transform: 'translateY(-2px)'
                                        },
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    Go to Profile
                                </Button>
                                <Button 
                                    variant="outlined" 
                                    size="large" 
                                    onClick={() => navigate("/")}
                                    sx={{ 
                                        width: { xs: '100%', sm: 'auto' },
                                        px: 4,
                                        py: 1.5,
                                        fontSize: '1.1rem',
                                        fontWeight: 600,
                                        borderRadius: '12px',
                                        borderWidth: '2px',
                                        '&:hover': {
                                            borderWidth: '2px',
                                            transform: 'translateY(-2px)'
                                        },
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    Home
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button 
                                    variant="contained" 
                                    size="large" 
                                    onClick={() => navigate("/auth")}
                                    sx={{ 
                                        width: { xs: '100%', sm: 'auto' },
                                        px: 4,
                                        py: 1.5,
                                        fontSize: '1.1rem',
                                        fontWeight: 600,
                                        borderRadius: '12px',
                                        boxShadow: '0 8px 25px rgba(79, 140, 255, 0.3)',
                                        '&:hover': {
                                            boxShadow: '0 12px 35px rgba(79, 140, 255, 0.4)',
                                            transform: 'translateY(-2px)'
                                        },
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    Get Started
                                </Button>
                                <Button 
                                    variant="outlined" 
                                    size="large" 
                                    onClick={() => navigate("/auth")}
                                    sx={{ 
                                        width: { xs: '100%', sm: 'auto' },
                                        px: 4,
                                        py: 1.5,
                                        fontSize: '1.1rem',
                                        fontWeight: 600,
                                        borderRadius: '12px',
                                        borderWidth: '2px',
                                        '&:hover': {
                                            borderWidth: '2px',
                                            transform: 'translateY(-2px)'
                                        },
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    Sign In
                                </Button>
                            </>
                        )}
                    </Stack>
                </Box>

                {/* Problem Statement */}
                <Box sx={{ mb: 8, textAlign: 'center' }}>
                    <Typography 
                        variant="h3" 
                        fontWeight={700} 
                        gutterBottom
                        sx={{ mb: 3 }}
                    >
                        The Hidden Problem in Digital Communication
                    </Typography>
                    <Typography 
                        variant="h6" 
                        color="text.secondary" 
                        sx={{ 
                            maxWidth: 900, 
                            mx: 'auto',
                            fontWeight: 300,
                            lineHeight: 1.6,
                            mb: 4
                        }}
                    >
                        Every day, millions of people send messages, emails, and social media posts without realizing 
                        the emotional impact they're creating. <strong>Anger, frustration, and impulsivity</strong> 
                        spread like wildfire online, damaging relationships, careers, and mental health.
                    </Typography>
                    <Typography 
                        variant="body1" 
                        color="text.secondary" 
                        sx={{ 
                            maxWidth: 800, 
                            mx: 'auto',
                            fontWeight: 400,
                            lineHeight: 1.6
                        }}
                    >
                        <strong>ImpulseGuard</strong> identifies these emotional patterns before they become destructive, 
                        helping you communicate with clarity and empathy instead of regret.
                    </Typography>
                </Box>

                {/* Solution Process */}
                <Box sx={{ mb: 8 }}>
                    <Typography 
                        variant="h3" 
                        fontWeight={700} 
                        textAlign="center" 
                        gutterBottom
                        sx={{ mb: 6 }}
                    >
                        How We Solve This Problem
                    </Typography>
                    
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 3, md: 4 }} sx={{ mt: 4 }}>
                        <Card 
                            elevation={0} 
                            sx={{ 
                                flex: 1,
                                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                                border: '1px solid rgba(79, 140, 255, 0.1)',
                                borderRadius: '16px',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-8px)',
                                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                                    border: '1px solid rgba(79, 140, 255, 0.2)'
                                }
                            }}
                        >
                            <CardContent sx={{ textAlign: 'center', p: { xs: 3, md: 4 } }}>
                                <Box sx={{ 
                                    width: 60, 
                                    height: 60, 
                                    borderRadius: '50%', 
                                    bgcolor: 'primary.main', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    mx: 'auto',
                                    mb: 2,
                                    boxShadow: '0 4px 12px rgba(79, 140, 255, 0.3)'
                                }}>
                                    <Typography variant="h4" color="white" fontWeight={700}>1</Typography>
                                </Box>
                                <Typography variant="h5" fontWeight={600} gutterBottom sx={{ color: 'text.primary' }}>
                                    Real-Time Detection
                                </Typography>
                                <Typography color="text.secondary" sx={{ fontSize: { xs: '0.9rem', md: '1rem' }, lineHeight: 1.6 }}>
                                    Our extension monitors your emotional state as you type, catching anger and frustration 
                                    before they reach the send button
                                </Typography>
                            </CardContent>
                        </Card>

                        <Card 
                            elevation={0} 
                            sx={{ 
                                flex: 1,
                                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                                border: '1px solid rgba(79, 140, 255, 0.1)',
                                borderRadius: '16px',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-8px)',
                                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                                    border: '1px solid rgba(79, 140, 255, 0.2)'
                                }
                            }}
                        >
                            <CardContent sx={{ textAlign: 'center', p: { xs: 3, md: 4 } }}>
                                <Box sx={{ 
                                    width: 60, 
                                    height: 60, 
                                    borderRadius: '50%', 
                                    bgcolor: 'primary.main', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    mx: 'auto',
                                    mb: 2,
                                    boxShadow: '0 4px 12px rgba(79, 140, 255, 0.3)'
                                }}>
                                    <Typography variant="h4" color="white" fontWeight={700}>2</Typography>
                                </Box>
                                <Typography variant="h5" fontWeight={600} gutterBottom sx={{ color: 'text.primary' }}>
                                    Instant Intervention
                                </Typography>
                                <Typography color="text.secondary" sx={{ fontSize: { xs: '0.9rem', md: '1rem' }, lineHeight: 1.6 }}>
                                    When negative emotions are detected, you get immediate feedback and suggestions 
                                    to rephrase your message with empathy
                                </Typography>
                            </CardContent>
                        </Card>

                        <Card 
                            elevation={0} 
                            sx={{ 
                                flex: 1,
                                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                                border: '1px solid rgba(79, 140, 255, 0.1)',
                                borderRadius: '16px',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-8px)',
                                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                                    border: '1px solid rgba(79, 140, 255, 0.2)'
                                }
                            }}
                        >
                            <CardContent sx={{ textAlign: 'center', p: { xs: 3, md: 4 } }}>
                                <Box sx={{ 
                                    width: 60, 
                                    height: 60, 
                                    borderRadius: '50%', 
                                    bgcolor: 'primary.main', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    mx: 'auto',
                                    mb: 2,
                                    boxShadow: '0 4px 12px rgba(79, 140, 255, 0.3)'
                                }}>
                                    <Typography variant="h4" color="white" fontWeight={700}>3</Typography>
                                </Box>
                                <Typography variant="h5" fontWeight={600} gutterBottom sx={{ color: 'text.primary' }}>
                                    Behavioral Transformation
                                </Typography>
                                <Typography color="text.secondary" sx={{ fontSize: { xs: '0.9rem', md: '1rem' }, lineHeight: 1.6 }}>
                                    Over time, you develop healthier communication patterns and build stronger, 
                                    more meaningful relationships both online and offline
                                </Typography>
                            </CardContent>
                        </Card>
                    </Stack>
                </Box>

                {/* Benefits Section */}
                <Box sx={{ mb: 8 }}>
                    <Typography 
                        variant="h3" 
                        fontWeight={700} 
                        textAlign="center" 
                        gutterBottom
                        sx={{ mb: 6 }}
                    >
                        Core Capabilities
                    </Typography>
                    
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 3, md: 4 }} sx={{ mt: 4 }}>
                        <Card 
                            elevation={0} 
                            sx={{ 
                                flex: 1,
                                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                                border: '1px solid rgba(79, 140, 255, 0.1)',
                                borderRadius: '16px',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-8px)',
                                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                                    border: '1px solid rgba(79, 140, 255, 0.2)'
                                }
                            }}
                        >
                            <CardContent sx={{ textAlign: 'center', p: { xs: 3, md: 4 } }}>
                                <Typography 
                                    variant="h2" 
                                    sx={{ 
                                        fontSize: { xs: '2.5rem', md: '3rem' },
                                        mb: 2,
                                        display: 'block'
                                    }}
                                >
                                    🧠
                                </Typography>
                                <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: 'text.primary' }}>
                                    Machine Learning Engine
                                </Typography>
                                <Typography color="text.secondary" sx={{ fontSize: { xs: '0.9rem', md: '1rem' }, lineHeight: 1.6 }}>
                                    State-of-the-art neural networks for real-time behavioral pattern recognition
                                </Typography>
                            </CardContent>
                        </Card>

                        <Card 
                            elevation={0} 
                            sx={{ 
                                flex: 1,
                                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                                border: '1px solid rgba(79, 140, 255, 0.1)',
                                borderRadius: '16px',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-8px)',
                                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                                    border: '1px solid rgba(79, 140, 255, 0.2)'
                                }
                            }}
                        >
                            <CardContent sx={{ textAlign: 'center', p: { xs: 3, md: 4 } }}>
                                <Typography 
                                    variant="h2" 
                                    sx={{ 
                                        fontSize: { xs: '2.5rem', md: '3rem' },
                                        mb: 2,
                                        display: 'block'
                                    }}
                                >
                                    📊
                                </Typography>
                                <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: 'text.primary' }}>
                                    Advanced Analytics
                                </Typography>
                                <Typography color="text.secondary" sx={{ fontSize: { xs: '0.9rem', md: '1rem' }, lineHeight: 1.6 }}>
                                    Comprehensive behavioral insights with predictive trend analysis
                                </Typography>
                            </CardContent>
                        </Card>

                        <Card 
                            elevation={0} 
                            sx={{ 
                                flex: 1,
                                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                                border: '1px solid rgba(79, 140, 255, 0.1)',
                                borderRadius: '16px',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-8px)',
                                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                                    border: '1px solid rgba(79, 140, 255, 0.2)'
                                }
                            }}
                        >
                            <CardContent sx={{ textAlign: 'center', p: { xs: 3, md: 4 } }}>
                                <Typography 
                                    variant="h2" 
                                    sx={{ 
                                        fontSize: { xs: '2.5rem', md: '3rem' },
                                        mb: 2,
                                        display: 'block'
                                    }}
                                >
                                    🔒
                                </Typography>
                                <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: 'text.primary' }}>
                                    Enterprise Security
                                </Typography>
                                <Typography color="text.secondary" sx={{ fontSize: { xs: '0.9rem', md: '1rem' }, lineHeight: 1.6 }}>
                                    Military-grade encryption with SOC 2 compliance and zero-knowledge architecture
                                </Typography>
                            </CardContent>
                        </Card>
                    </Stack>
                </Box>

                {/* CTA Section */}
                <Box sx={{ textAlign: 'center' }}>
                    <Card 
                        elevation={0} 
                        sx={{ 
                            p: { xs: 4, md: 6 }, 
                            background: 'linear-gradient(135deg, #4f8cff 0%, #2563eb 100%)',
                            color: 'white',
                            borderRadius: '20px',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            position: 'relative',
                            overflow: 'hidden',
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)',
                                pointerEvents: 'none'
                            }
                        }}
                    >
                        <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                            <Typography 
                                variant="h3" 
                                fontWeight={700} 
                                gutterBottom
                                sx={{ mb: 3 }}
                            >
                                Ready to Transform Your Digital Experience?
                            </Typography>
                            <Typography 
                                variant="h6" 
                                sx={{ 
                                    mb: 4, 
                                    opacity: 0.95,
                                    fontWeight: 300,
                                    lineHeight: 1.5
                                }}
                            >
                                Join thousands of users who have already taken control of their online behavior
                            </Typography>
                            <Button 
                                variant="contained" 
                                size="large" 
                                onClick={() => navigate(isAuthenticated ? "/profile" : "/auth")}
                                sx={{ 
                                    bgcolor: 'white', 
                                    color: 'primary.main',
                                    px: 4,
                                    py: 1.5,
                                    fontSize: '1.1rem',
                                    fontWeight: 600,
                                    borderRadius: '12px',
                                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)',
                                    '&:hover': { 
                                        bgcolor: 'grey.50',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 12px 35px rgba(0, 0, 0, 0.3)'
                                    },
                                    transition: 'all 0.3s ease',
                                    width: { xs: '100%', sm: 'auto' }
                                }}
                            >
                                {isAuthenticated ? 'View Profile' : 'Get Started Now'}
                            </Button>
                        </CardContent>
                    </Card>
                </Box>
            </Box>
        </Container>
    );
} 