import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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