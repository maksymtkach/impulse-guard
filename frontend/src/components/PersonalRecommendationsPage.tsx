import { useState } from "react";
import {
    Box, Card, CardContent, Typography, 
    Chip, Button, Grid, Paper
} from "@mui/material";
import {
    Lightbulb, TrendingUp, Psychology, SelfImprovement,
    FitnessCenter, Book, Coffee, OpenInNew
} from '@mui/icons-material';

interface PersonalRecommendationsPageProps {
    token: string;
    onLogout: () => void;
}

interface Recommendation {
    id: string;
    title: string;
    description: string;
    category: string;
    imageUrl: string;
    tags: string[];
    priority: 'high' | 'medium' | 'low';
}

export default function PersonalRecommendationsPage({ token, onLogout }: PersonalRecommendationsPageProps) {
    // Mock recommendations based on Frustration and Anxiety
    const [recommendations] = useState<Recommendation[]>([
        {
            id: "1",
            title: "Mindful Breathing Techniques",
            description: "Learn simple breathing exercises to reduce anxiety and frustration. Practice 5-10 minutes daily to improve emotional regulation and stress management.",
            category: "Meditation",
            imageUrl: "/images/mindful-breathing.jpg", // Placeholder for image
            tags: ["Anxiety", "Stress Relief", "Mindfulness"],
            priority: "high"
        },
        {
            id: "2",
            title: "Progressive Muscle Relaxation",
            description: "A systematic approach to releasing physical tension that often accompanies frustration. Perfect for quick stress relief during work breaks.",
            category: "Relaxation",
            imageUrl: "/images/muscle-relaxation.jpg", // Placeholder for image
            tags: ["Frustration", "Physical Tension", "Quick Relief"],
                        priority: "high"
        }
    ]);

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'error';
            case 'medium': return 'warning';
            case 'low': return 'success';
            default: return 'default';
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'Meditation': return <SelfImprovement />;
            case 'Relaxation': return <SelfImprovement />;
            case 'Psychology': return <Psychology />;
            case 'Fitness': return <FitnessCenter />;
            case 'Self-Reflection': return <Book />;
            case 'Social': return <Coffee />;
            default: return <Lightbulb />;
        }
    };

    return (
        <Box sx={{ minHeight: '100dvh', py: 4, px: 4 }}>
            <Box sx={{ width: '100%', maxWidth: '100%' }}>
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
                            boxShadow: '0 8px 25px rgba(79,140,255,0.3)'
                        }}>
                            <Lightbulb sx={{ fontSize: '2.5rem' }} />
                        </Box>
                        <Box>
                            <Typography variant="h3" fontWeight={900} sx={{ 
                                color: 'primary.main',
                                textShadow: '0 2px 4px rgba(79,140,255,0.1)'
                            }}>
                                Personal Recommendations
                            </Typography>
                            <Typography color="text.secondary" sx={{ mt: 1, fontSize: '1.2rem', fontWeight: 500 }}>
                                Based on your emotional patterns: Frustration & Anxiety
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Recommendations Grid */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                    <Grid container spacing={4} sx={{ maxWidth: '1200px', justifyContent: 'center' }}>
                        {recommendations.map((recommendation) => (
                            <Grid item xs={12} sm={10} md={8} lg={6} xl={5} key={recommendation.id}>
                            <Card elevation={8} sx={{ 
                                height: '100%', 
                                minHeight: '600px',
                                bgcolor: '#ffffff',
                                transition: 'all 0.3s ease-in-out',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
                                }
                            }}>
                                {/* Image Display */}
                                <Box sx={{
                                    height: 280,
                                    borderBottom: '1px solid #e5e7eb',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                }}>
                                    <Box sx={{
                                        position: 'absolute',
                                        top: 16,
                                        right: 16,
                                        zIndex: 1
                                    }}>
                                        <Chip 
                                            label={recommendation.priority.toUpperCase()} 
                                            color={getPriorityColor(recommendation.priority)}
                                            size="small"
                                            sx={{ fontWeight: 'bold' }}
                                        />
                                    </Box>
                                    
                                    {/* Actual Image */}
                                    <Box
                                        component="img"
                                        src={recommendation.imageUrl}
                                        alt={recommendation.title}
                                        sx={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            objectPosition: 'center'
                                        }}
                                    />
                                </Box>

                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                        <Typography variant="h6" fontWeight={800} sx={{ color: '#1f2937' }}>
                                            {recommendation.title}
                                        </Typography>
                                    </Box>

                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                                        {recommendation.description}
                                    </Typography>

                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                                            Category: {recommendation.category}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                        {recommendation.tags.map((tag) => (
                                            <Chip
                                                key={tag}
                                                label={tag}
                                                size="small"
                                                variant="outlined"
                                                sx={{ 
                                                    fontSize: '0.7rem',
                                                    borderColor: 'primary.main',
                                                    color: 'primary.main'
                                                }}
                                            />
                                        ))}
                                    </Box>

                                    <Button
                                        variant="contained"
                                        fullWidth
                                        onClick={() => window.open('https://www.sandstonecare.com/blog/what-does-anxiety-feel-like/', '_blank')}
                                        endIcon={<OpenInNew />}
                                        sx={{
                                            bgcolor: 'primary.main',
                                            '&:hover': {
                                                bgcolor: 'primary.dark',
                                                transform: 'translateY(-1px)'
                                            },
                                            transition: 'all 0.2s ease-in-out'
                                        }}
                                    >
                                        Learn More from Sandstone Care
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
                </Box>

                {/* Summary Section */}
                <Box sx={{ mt: 6 }}>
                    <Card elevation={8} sx={{ bgcolor: '#ffffff' }}>
                        <CardContent sx={{ p: 4 }}>
                            <Typography variant="h5" fontWeight={700} gutterBottom sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 2,
                                color: 'primary.main',
                                mb: 3
                            }}>
                                <TrendingUp />
                                Why These Recommendations?
                            </Typography>
                            
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <Paper elevation={2} sx={{ p: 3, bgcolor: '#fef3c7', border: '2px solid #f59e0b' }}>
                                        <Typography variant="h6" fontWeight={700} sx={{ color: '#92400e', mb: 2 }}>
                                            😤 High Frustration Level
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                                            Your frustration score of 8 indicates frequent stress triggers. These recommendations focus on stress management, 
                                            relaxation techniques, and cognitive reframing to help you respond more calmly to challenging situations.
                                        </Typography>
                                    </Paper>
                                </Grid>
                                
                                <Grid item xs={12} md={6}>
                                    <Paper elevation={2} sx={{ p: 3, bgcolor: '#dbeafe', border: '2px solid #3b82f6' }}>
                                        <Typography variant="h6" fontWeight={700} sx={{ color: '#1e40af', mb: 2 }}>
                                            😰 Elevated Anxiety
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                                            Your anxiety score of 6 suggests moderate stress levels. The recommendations include mindfulness practices, 
                                            physical exercise, and social connection activities to reduce anxiety and improve emotional well-being.
                                        </Typography>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Box>
            </Box>
        </Box>
    );
} 