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

export const mockSummaryData = {
    avgScore: 44.4,
    events: 9,
    topEmotions: {
        anger: 400,
        frustration: 384,
        sarcasm: 0,
        contempt: 400,
        urgency: 400
    }
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
        
        return mockSummaryData;
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