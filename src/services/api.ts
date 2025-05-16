import axios from 'axios';

//BACKEND TEAM: Update this URL when deploying to production
const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

//BACKEND TEAM: Ensure these interfaces match your API response structure
export interface AssessmentQuestion {
  id: number;
  category: string;
  question: string;
  min_value: number;
  max_value: number;
}

export interface AssessmentResponse {
  question_id: number;
  rating: number;
}

export interface UserAssessment {
  user_id: string;
  responses: AssessmentResponse[];
  timestamp: string;
  struggle_description?: string;
}

export interface TaskRecommendation {
  task_id: number;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  estimated_duration: string;
}

//BACKEND TEAM: Implement these API methods in the backend
export const assessmentApi = {
  getQuestions: async (): Promise<AssessmentQuestion[]> => {
    const response = await api.get('/assessment/questions');
    return response.data.questions;
  },

  submitAssessment: async (assessment: UserAssessment): Promise<{ status: string; message: string }> => {
    const response = await api.post('/assessment/submit', assessment);
    return response.data;
  },

  submitStruggleDescription: async (
    user_id: string,
    description: string
  ): Promise<{ recommendations: TaskRecommendation[] }> => {
    const response = await api.post(`/assessment/${user_id}/struggle`, { description });
    return response.data;
  },
}; 

//BACKEND TEAM: Add these additional API methods
/* 
export const userApi = {
  //User authentication
  login: async (credentials: {email: string, password: string}): Promise<User> => {...},
  register: async (userData: UserRegistration): Promise<User> => {...},
  logout: async (): Promise<void> => {...},
  
  //User profile
  getProfile: async (): Promise<UserProfile> => {...},
  updateProfile: async (profile: UserProfile): Promise<UserProfile> => {...},
};

export const tasksApi = {
  //Task management
  getUserTasks: async (): Promise<Task[]> => {...},
  getTaskDetails: async (taskId: number): Promise<TaskDetail> => {...},
  markTaskComplete: async (taskId: number): Promise<void> => {...},
  markTaskIncomplete: async (taskId: number): Promise<void> => {...},
  
  //Progress tracking
  getUserProgress: async (): Promise<UserProgress> => {...},
  getUserStreak: async (): Promise<{streak: number}> => {...},
};
*/