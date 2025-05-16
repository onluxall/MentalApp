# MindFlow App
Hackathon MEET IT

# MindFlow App - Frontend

## API Integration Points

The frontend expects the following API endpoints:

1. **User Authentication**
   - `POST /api/auth/register` - Register a new user
   - `POST /api/auth/login` - Login a user

2. **Assessment**
   - `POST /api/assessment/submit` - Submit assessment answers
     ```json
     {
       "answers": {
         "1": 4,
         "2": 3,
         "3": 5,
         // ... more question answers
       }
     }
     ```
   - `GET /api/assessment/results` - Get assessment results and recommendations

3. **Tasks**
   - `GET /api/tasks/recommended?categories=Routine,Sleep,Focus` - Get recommended tasks based on categories
   - `POST /api/tasks/select` - Save selected tasks
     ```json
     {
       "selectedTasks": [1, 5, 9]
     }
     ```
   - `GET /api/tasks/user` - Get user's current tasks
   - `POST /api/tasks/complete/:taskId` - Mark a task as complete

4. **User Progress**
   - `GET /api/progress/streak` - Get user's current streak
   - `GET /api/progress/stats` - Get user's progress statistics

## Data Models

### User
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "createdAt": "2025-05-16T12:00:00Z"
}
```

### Assessment
```json
{
  "id": "uuid",
  "userId": "user_uuid",
  "answers": {
    "1": 4,
    "2": 3,
    //...more answers
  },
  "createdAt": "2025-05-16T12:00:00Z"
}
```

### Task 
```json
{
  "id": 1,
  "category": "Routine",
  "title": "Morning Routine Builder",
  "description": "Create a consistent morning routine to start your day with purpose.",
  "duration": "15 minutes",
  "steps": ["Step 1", "Step 2", "..."],
  "tips": ["Tip 1", "Tip 2", "..."]
}
```

### UserTask
```json
{
  "id": "uuid",
  "userId": "user_uuid",
  "taskId": 1,
  "status": "in_progress", //or "completed"
  "completedAt": null, //or timestamp
  "createdAt": "2025-05-16T12:00:00Z"
}
```
