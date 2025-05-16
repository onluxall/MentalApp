# MindFlow App - Frontend

## Overview
MindFlow is a mental wellness app that helps users improve their motivation and build healthy habits through personalized tasks and tracking.

## Frontend Tech Stack
- React Native with Expo
- TypeScript
- React Navigation
- Axios for API calls

## Backend Integration Points

The frontend expects the following API endpoints:

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `POST /api/auth/logout` - Logout current user

### Assessment
- `GET /api/assessment/questions` - Get assessment questions
- `POST /api/assessment/submit` - Submit assessment answers
- `POST /api/assessment/{user_id}/struggle` - Submit struggle description and get recommendations

### Tasks
- `GET /api/tasks/recommended?categories=habits,emotions,productivity` - Get recommended tasks by categories
- `POST /api/tasks/select` - Save selected tasks
- `GET /api/tasks/user` - Get user's current tasks
- `POST /api/tasks/complete/{taskId}` - Mark a task as complete
- `POST /api/tasks/incomplete/{taskId}` - Mark a task as incomplete

### Progress
- `GET /api/progress/streak` - Get user's current streak
- `GET /api/progress/stats` - Get user's progress statistics

## Running the Frontend
1. Install dependencies: `npm install`
2. Start the development server: `npx expo start`
3. Press `w` to open in web browser

## Backend Requirements
- FastAPI server running on `http://localhost:8000`
- CORS enabled for frontend requests
- JSON response format matching the TypeScript interfaces in `src/services/api.ts`

## Development Notes
- Look for `BACKEND TEAM` comments in the code for specific integration points
- The frontend includes fallback data for testing without a backend
- Authentication is currently mocked and needs to be implemented

## API Response Formats

Examples of expected API response formats:

### GET /api/assessment/questions
```json
{
  "questions": [
    {
      "id": 1,
      "category": "habits",
      "question": "How consistent are you with your daily routines and habits?",
      "min_value": 0,
      "max_value": 10
    },
    // More questions...
  ]
}
