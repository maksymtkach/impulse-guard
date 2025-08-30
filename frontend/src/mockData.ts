// Mock data for development without backend

interface MockUser {
    email: string;
    password: string;
    apiToken: string;
}

// Store users in localStorage to persist across page refreshes
const getMockUsers = (): MockUser[] => {
    const stored = localStorage.getItem('mockUsers');
    if (stored) {
        return JSON.parse(stored);
    }
    // Initialize with demo user
    const initialUsers: MockUser[] = [
        {
            email: "demo@example.com",
            password: "password123",
            apiToken: "b2a6017c2e41399f181f5122bad449a3"
        }
    ];
    localStorage.setItem('mockUsers', JSON.stringify(initialUsers));
    return initialUsers;
};

// Initialize mock users
export const mockUsers = getMockUsers();

// Also ensure the demo token is always available for validation
export const ensureDemoToken = (): void => {
    const currentUsers = getMockUsers();
    const demoUser = currentUsers.find(user => user.email === "demo@example.com");
    
    if (!demoUser) {
        const initialUsers = [
            {
                email: "demo@example.com",
                password: "password123",
                apiToken: "b2a6017c2e41399f181f5122bad449a3"
            }
        ];
        localStorage.setItem('mockUsers', JSON.stringify(initialUsers));
    }
};

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

// Generate mock timeline data
const generateMockTimeline = (): TimelineEvent[] => {
    const now = new Date();
    const events: TimelineEvent[] = [];
    
    for (let i = 9; i >= 0; i--) {
        const eventTime = new Date(now.getTime() - i * 2 * 60 * 60 * 1000); // 2 hours apart
        const sentiscore = 40 + Math.random() * 20 - 10; // Random score between 30-50
        
        events.push({
            id: `event-${i}`,
            timestamp: eventTime.toISOString(),
            sentiscore: Math.round(sentiscore * 10) / 10,
            emotions: {
                anger: Math.round(Math.random() * 500),
                frustration: Math.round(Math.random() * 400),
                sarcasm: Math.round(Math.random() * 100),
                contempt: Math.round(Math.random() * 400),
                urgency: Math.round(Math.random() * 400)
            },
            risks: Math.random() > 0.7 ? ['absolutism', 'judging'] : [],
            description: `Event ${i + 1} - ${sentiscore > 45 ? 'High stress' : sentiscore < 35 ? 'Low stress' : 'Moderate stress'} situation`
        });
    }
    
    return events;
};

// Generate mock risk assessment
const generateMockRisks = (): RiskAssessment[] => {
    return [
        {
            category: 'Absolutism',
            level: 'warning',
            count: 3,
            description: 'Using absolute terms like "always", "never", "everyone"'
        },
        {
            category: 'Judging',
            level: 'super-risky',
            count: 2,
            description: 'Making judgments about others or situations'
        },
        {
            category: 'Ultimatum',
            level: 'super-risky',
            count: 1,
            description: 'Giving ultimatums or making threats'
        }
    ];
};

// Generate mock trends
const generateMockTrends = () => {
    const daily = [];
    const weekly = [];
    const monthly = [];
    
    // Daily data for last 7 days
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        daily.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            score: Math.round((40 + Math.random() * 20 - 10) * 10) / 10
        });
    }
    
    // Weekly data for last 4 weeks
    for (let i = 3; i >= 0; i--) {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - (i * 7));
        weekly.push({
            week: `Week ${4-i}`,
            score: Math.round((40 + Math.random() * 20 - 10) * 10) / 10
        });
    }
    
    // Monthly data for last 3 months
    for (let i = 2; i >= 0; i--) {
        const month = new Date();
        month.setMonth(month.getMonth() - i);
        monthly.push({
            month: month.toLocaleDateString('en-US', { month: 'short' }),
            score: Math.round((40 + Math.random() * 20 - 10) * 10) / 10
        });
    }
    
    return { daily, weekly, monthly };
};

export const mockEnhancedSummaryData: EnhancedSummaryData = {
    avgScore: 44.4,
    events: 10,
    topEmotions: {
        anger: 400,
        frustration: 384,
        sarcasm: 33,
        contempt: 400,
        urgency: 400
    },
    timeline: generateMockTimeline(),
    risks: generateMockRisks(),
    trends: generateMockTrends()
};

// Simulate API delay
export const simulateApiCall = (delay: number = 500): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, delay));
};

// Mock API functions
export const mockApi = {
    async register(email: string, password: string) {
        await simulateApiCall();
        
        // Get current users from localStorage
        const currentUsers = getMockUsers();
        
        // Check if user already exists
        const existingUser = currentUsers.find((user: MockUser) => user.email === email);
        if (existingUser) {
            throw new Error("User already exists");
        }
        
        // Add new user
        const newUser: MockUser = { email, password, apiToken: generateMockToken() };
        currentUsers.push(newUser);
        localStorage.setItem('mockUsers', JSON.stringify(currentUsers));
        
        return { success: true };
    },

    async login(email: string, password: string) {
        await simulateApiCall();
        
        const currentUsers = getMockUsers();
        const user = currentUsers.find((user: MockUser) => user.email === email && user.password === password);
        if (!user) {
            throw new Error("Invalid credentials");
        }
        
        return { apiToken: user.apiToken };
    },

    async getSummary(token: string) {
        await simulateApiCall();
        
        // Validate token (in real app, this would check against backend)
        const currentUsers = getMockUsers();
        console.log('Mock API - Current users:', currentUsers);
        console.log('Mock API - Looking for token:', token);
        
        const user = currentUsers.find((user: MockUser) => user.apiToken === token);
        console.log('Mock API - Found user:', user);
        
        if (!user) {
            throw new Error("Invalid token");
        }
        
        return mockEnhancedSummaryData;
    }
};

// Generate a random mock token
function generateMockToken(): string {
    const chars = 'abcdef0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
} 