from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional, Set
import json
from datetime import datetime, timedelta, date
from enum import Enum
import random

app = FastAPI(title="Mental Health App Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ACHIEVEMENTS = {
    "streak_5": {"id": "streak_5", "text": "5-day streak", "type": "streak", "threshold": 5, "icon": "🔥"},
    "streak_7": {"id": "streak_7", "text": "7-day streak", "type": "streak", "threshold": 7, "icon": "🔥"},
    "streak_14": {"id": "streak_14", "text": "14-day streak", "type": "streak", "threshold": 14, "icon": "🔥"},
    "streak_30": {"id": "streak_30", "text": "30-day streak", "type": "streak", "threshold": 30, "icon": "🔥"},
    "tasks_10": {"id": "tasks_10", "text": "Completed 10 tasks", "type": "tasks", "threshold": 10, "icon": "✅"},
    "tasks_25": {"id": "tasks_25", "text": "Completed 25 tasks", "type": "tasks", "threshold": 25, "icon": "✅"},
    "tasks_50": {"id": "tasks_50", "text": "Completed 50 tasks", "type": "tasks", "threshold": 50, "icon": "✅"},
    "tasks_100": {"id": "tasks_100", "text": "Completed 100 tasks", "type": "tasks", "threshold": 100, "icon": "✅"},
    "notes_3": {"id": "notes_3", "text": "Shared 3 notes", "type": "notes", "threshold": 3, "icon": "📝"},
    "notes_10": {"id": "notes_10", "text": "Shared 10 notes", "type": "notes", "threshold": 10, "icon": "📝"},
}

class AssessmentQuestion(BaseModel):
    id: int
    category: str
    question: str
    min_value: int = 0
    max_value: int = 10

class AssessmentResponse(BaseModel):
    question_id: int
    rating: int

class UserAssessment(BaseModel):
    user_id: str
    responses: List[AssessmentResponse]
    timestamp: str
    struggle_description: Optional[str] = None

class TaskRecommendation(BaseModel):
    task_id: int
    title: str
    description: str
    category: str
    difficulty: str
    estimated_duration: str

class TaskStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    SKIPPED = "skipped"

class TaskDifficulty(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"

class UserTask(BaseModel):
    task_id: int
    user_id: str
    title: str
    description: str
    category: str
    difficulty: TaskDifficulty
    estimated_duration: str
    status: TaskStatus = TaskStatus.PENDING
    created_at: str
    completed_at: Optional[str] = None
    ai_generated: bool = False
    feedback: Optional[str] = None
    energy_level: int = 3  
    steps: List[str] = []  

class UserAchievement(BaseModel):
    id: str  
    text: str  
    type: str  
    threshold: int  
    icon: str  
    completed: bool = False  
    completion_date: Optional[str] = None 

class UserProgress(BaseModel):
    user_id: str
    current_streak: int = 0
    longest_streak: int = 0
    last_completion_date: Optional[str] = None
    total_tasks_completed: int = 0
    categories_completed: Dict[str, int] = {}
    streak_status: str = "no_streak"
    streak_message: str = "Complete all tasks today to start a streak!"
    today_completed: int = 0
    today_total: int = 0
    all_tasks_completed_today: bool = False  
    notes_shared: int = 0  
    achievements: Dict[str, UserAchievement] = {}  

class MotivationalQuote(BaseModel):
    quote: str
    author: str
    category: str

class DailyNote(BaseModel):
    note_id: int
    user_id: str
    message: str
    created_at: str
    likes: int = 0
    liked_by: Set[str] = set()  
    is_public: bool = True
    category: Optional[str] = None  
    mood: Optional[str] = None  

class TaskDetail(BaseModel):
    task_id: int
    title: str
    description: str
    category: str
    difficulty: str
    estimated_duration: str

class SelectedTasks(BaseModel):
    user_id: str
    task_ids: List[int]
    selected_date: str
    task_details: List[TaskDetail]

user_assessments: Dict[str, UserAssessment] = {}
user_tasks: Dict[str, List[UserTask]] = {}  
user_progress: Dict[str, UserProgress] = {} 
completed_tasks: Dict[str, List[UserTask]] = {}  

daily_notes: Dict[str, List[DailyNote]] = {}  
user_daily_note_count: Dict[str, Dict[str, int]] = {}  

ASSESSMENT_QUESTIONS = [
    AssessmentQuestion(
        id=1,
        category="habits",
        question="How consistent are you with your daily routines and habits?",
    ),
    AssessmentQuestion(
        id=2,
        category="emotions",
        question="How well do you manage your emotions during challenging situations?",
    ),
    AssessmentQuestion(
        id=3,
        category="productivity",
        question="How effectively do you complete tasks within your planned timeframe?",
    ),
    AssessmentQuestion(
        id=4,
        category="discipline",
        question="How well do you maintain focus and resist distractions?",
    ),
    AssessmentQuestion(
        id=5,
        category="goal_setting",
        question="How clear and achievable are your current goals?",
    ),
    AssessmentQuestion(
        id=6,
        category="time_management",
        question="How well do you prioritize and manage your time?",
    ),
    AssessmentQuestion(
        id=7,
        category="mindset",
        question="How positive and growth-oriented is your mindset?",
    ),
    AssessmentQuestion(
        id=8,
        category="environment",
        question="How conducive is your environment to maintaining focus and motivation?",
    ),
    AssessmentQuestion(
        id=9,
        category="physical_health",
        question="How well do you maintain your physical health and energy levels?",
    ),
    AssessmentQuestion(
        id=10,
        category="social_influences",
        question="How supportive is your social circle in your personal development?",
    ),
]

TASK_TEMPLATES = {
    "habits": [
        {"title": "Morning Routine Builder", "description": "Start with a 5-minute morning routine and gradually increase duration", "difficulty": "easy", "duration": "5-15 minutes"},
        {"title": "Habit Stacking", "description": "Attach a new habit to an existing one", "difficulty": "medium", "duration": "10-20 minutes"},
    ],
    "emotions": [
        {"title": "Emotion Journaling", "description": "Write down three emotions you felt today and their triggers", "difficulty": "easy", "duration": "10 minutes"},
        {"title": "Mindfulness Practice", "description": "Practice 5 minutes of mindful breathing", "difficulty": "medium", "duration": "5 minutes"},
    ],
}

MOTIVATIONAL_QUOTES = [
    MotivationalQuote(
        quote="The journey of a thousand miles begins with a single step.",
        author="Lao Tzu",
        category="progress"
    ),
    MotivationalQuote(
        quote="Small progress is still progress.",
        author="Unknown",
        category="motivation"
    ),
]

PREDEFINED_NOTES = [
    DailyNote(
        note_id=1,
        user_id="system",
        message="Every small step forward is progress. Celebrate your journey, not just the destination.",
        created_at=datetime.now().isoformat(),
        likes=42,
        category="motivation",
        mood="inspired",
        is_public=True
    ),
    DailyNote(
        note_id=2,
        user_id="system",
        message="Today, I'm grateful for the opportunity to grow and learn. Each challenge is a chance to become stronger.",
        created_at=datetime.now().isoformat(),
        likes=38,
        category="gratitude",
        mood="grateful",
        is_public=True
    ),
    DailyNote(
        note_id=3,
        user_id="system",
        message="Remember that your mental well-being is just as important as your physical health. Take time to breathe and reflect.",
        created_at=datetime.now().isoformat(),
        likes=35,
        category="reflection",
        mood="mindful",
        is_public=True
    ),
    DailyNote(
        note_id=4,
        user_id="system",
        message="The power of positive thinking can transform your day. Start with one positive thought and watch it grow.",
        created_at=datetime.now().isoformat(),
        likes=29,
        category="motivation",
        mood="happy",
        is_public=True
    ),
    DailyNote(
        note_id=5,
        user_id="system",
        message="Small acts of kindness, both to others and yourself, create ripples of positivity in the world.",
        created_at=datetime.now().isoformat(),
        likes=31,
        category="reflection",
        mood="grateful",
        is_public=True
    ),
    DailyNote(
        note_id=6,
        user_id="system",
        message="Your potential is limitless. Believe in yourself and take that first step towards your goals.",
        created_at=datetime.now().isoformat(),
        likes=27,
        category="motivation",
        mood="inspired",
        is_public=True
    ),
    DailyNote(
        note_id=7,
        user_id="system",
        message="Finding joy in the little things makes life more beautiful. What small moment brought you happiness today?",
        created_at=datetime.now().isoformat(),
        likes=33,
        category="gratitude",
        mood="happy",
        is_public=True
    ),
    DailyNote(
        note_id=8,
        user_id="system",
        message="Self-care isn't selfish. Taking time to recharge is essential for your well-being and those around you.",
        created_at=datetime.now().isoformat(),
        likes=40,
        category="reflection",
        mood="mindful",
        is_public=True
    ),
    DailyNote(
        note_id=9,
        user_id="system",
        message="Every day is a fresh start. Let go of yesterday's worries and embrace today's possibilities.",
        created_at=datetime.now().isoformat(),
        likes=36,
        category="motivation",
        mood="inspired",
        is_public=True
    ),
    DailyNote(
        note_id=10,
        user_id="system",
        message="Gratitude turns what we have into enough. Take a moment to appreciate the abundance in your life.",
        created_at=datetime.now().isoformat(),
        likes=45,
        category="gratitude",
        mood="grateful",
        is_public=True
    )
]

daily_notes = {"system": PREDEFINED_NOTES.copy()}  

class CreateNoteRequest(BaseModel):
    user_id: str
    message: str
    category: Optional[str] = None
    mood: Optional[str] = None
    is_public: bool = True

class StruggleDescription(BaseModel):
    description: str

    # Current API Endpoints Documentation:
# GET /api/assessment/questions
#   - Returns all assessment questions
#   - Used by frontend to display assessment
#   - No authentication required
#
# POST /api/assessment/submit
#   - Submits user assessment responses
#   - Stores responses for AI task generation
#   - Requires user_id and responses
#
# POST /api/assessment/{user_id}/struggle
#   - Submits user's struggle description
#   - Used for context-aware AI task generation
#   - Requires user_id and description
#   - Returns task recommendations
#   - TODO: Add validation for description length and content
#   - TODO: Implement rate limiting for API calls
#   - TODO: Add user authentication
#   - TODO: Add input sanitization for description

# Security Considerations:
# 1. Add proper authentication middleware
# 2. Implement rate limiting for API endpoints
# 3. Add input validation and sanitization
# 4. Add request logging for monitoring
# 5. Implement proper error handling
# 6. Add API versioning
# 7. Add request/response validation
# 8. Add proper CORS configuration for production

# Performance Considerations:
# 1. Add caching for frequently accessed data
# 2. Implement database for persistent storage
# 3. Add request timeouts
# 4. Implement connection pooling
# 5. Add response compression
# 6. Implement proper error handling
# 7. Add request/response validation
# 8. Add proper logging

@app.get("/api/assessment/questions")
async def get_assessment_questions():
    return {"questions": ASSESSMENT_QUESTIONS}

@app.post("/api/assessment/submit")
async def submit_assessment(assessment: UserAssessment):
    assessment.timestamp = datetime.now().isoformat()
    user_assessments[assessment.user_id] = assessment
    return {"status": "success", "message": "Assessment submitted successfully"}

@app.post("/api/assessment/{user_id}/struggle")
async def submit_struggle_description(user_id: str, struggle: StruggleDescription):
    description = struggle.description.strip()
    
    if not description:
        raise HTTPException(
            status_code=422,
            detail="Description cannot be empty"
        )
    
    if len(description) < 10:
        raise HTTPException(
            status_code=422,
            detail="Description must be at least 10 characters long"
        )
    
    if len(description) > 1000:
        raise HTTPException(
            status_code=422,
            detail="Description must not exceed 1000 characters"
        )
        
    if user_id not in user_assessments:
        raise HTTPException(
            status_code=404,
            detail="Please complete the assessment first"
        )

    user_assessments[user_id].struggle_description = description
    
    recommendations = generate_task_recommendations(user_id)
    return {"recommendations": recommendations}

def generate_task_recommendations(user_id: str) -> List[TaskRecommendation]:
    assessment = user_assessments[user_id]
    
    category_scores = {}
    for response in assessment.responses:
        question = next(q for q in ASSESSMENT_QUESTIONS if q.id == response.question_id)
        if question.category not in category_scores:
            category_scores[question.category] = []
        category_scores[question.category].append(response.rating)
    
    category_averages = {
        category: sum(scores) / len(scores)
        for category, scores in category_scores.items()
    }
    
    lowest_categories = sorted(
        category_averages.items(),
        key=lambda x: x[1]
    )[:3]
    
    recommendations = []
    task_id = 1
    
    for category, _ in lowest_categories:
        if category in TASK_TEMPLATES:
            for template in TASK_TEMPLATES[category][:2]: 
                recommendations.append(
                    TaskRecommendation(
                        task_id=task_id,
                        title=template["title"],
                        description=template["description"],
                        category=category,
                        difficulty=template["difficulty"],
                        estimated_duration=template["duration"]
                    )
                )
                task_id += 1
    
    return recommendations

@app.get("/api/tasks/{user_id}")
async def get_user_tasks(user_id: str, status: Optional[TaskStatus] = None):
    today = datetime.now().date()
    
    if user_id not in user_tasks:
        user_tasks[user_id] = []
    
    tasks = [
        task for task in user_tasks[user_id]
        if datetime.fromisoformat(task.created_at).date() == today
    ]
    
    if not tasks and user_id not in user_assessments:
        default_tasks = [
            UserTask(
                task_id=1,
                user_id=user_id,
                title="Morning Mindfulness",
                description="Take 5 minutes to practice deep breathing and set your intentions for the day",
                category="mindset",
                difficulty=TaskDifficulty.EASY,
                estimated_duration="5 minutes",
                created_at=datetime.now().isoformat(),
                status=TaskStatus.PENDING,
                steps=["Find a quiet space", "Sit comfortably", "Focus on your breath", "Set your daily intention"]
            ),
            UserTask(
                task_id=2,
                user_id=user_id,
                title="Gratitude Journal",
                description="Write down three things you're grateful for today",
                category="emotions",
                difficulty=TaskDifficulty.EASY,
                estimated_duration="10 minutes",
                created_at=datetime.now().isoformat(),
                status=TaskStatus.PENDING,
                steps=["Find a quiet moment", "Reflect on your day", "Write down three gratitudes", "Add why you're grateful for each"]
            ),
            UserTask(
                task_id=3,
                user_id=user_id,
                title="Energy Check-in",
                description="Rate your current energy level and identify what affects it",
                category="habits",
                difficulty=TaskDifficulty.MEDIUM,
                estimated_duration="15 minutes",
                created_at=datetime.now().isoformat(),
                status=TaskStatus.PENDING,
                steps=["Rate your energy 1-10", "Note what's affecting it", "Plan one action to improve it", "Schedule a follow-up check"]
            )
        ]
        user_tasks[user_id].extend(default_tasks)
        tasks = default_tasks
    elif not tasks and user_id in user_assessments:
        return {
            "tasks": [],
            "streak_info": {
                "current_streak": 0,
                "longest_streak": 0,
                "streak_status": "no_streak",
                "streak_message": "Please complete task selection to start your journey!",
                "today_completed": 0,
                "today_total": 0
            },
            "completion_status": {
                "total_tasks": 0,
                "completed_tasks": 0,
                "completion_percentage": 0,
                "all_completed": False
            }
        }
    
    if status:
        tasks = [task for task in tasks if task.status == status]
    
    if user_id not in user_progress:
        user_progress[user_id] = UserProgress(user_id=user_id)
    else:
        progress = user_progress[user_id]
        if progress.last_completion_date:
            last_date = datetime.fromisoformat(progress.last_completion_date).date()
            if last_date != today:
                if not progress.all_tasks_completed_today:
                    progress.current_streak = 0
                    progress.streak_status = "no_streak"
                    progress.streak_message = "Complete all tasks today to start a streak!"
                progress.last_completion_date = None
                progress.all_tasks_completed_today = False
        else:
            progress.current_streak = 0
            progress.streak_status = "no_streak"
            progress.streak_message = "Complete all tasks today to start a streak!"
    
    progress = user_progress[user_id]
    
    progress.today_total = len(tasks)
    progress.today_completed = sum(1 for task in tasks if task.status == TaskStatus.COMPLETED)
    progress.all_tasks_completed_today = all(task.status == TaskStatus.COMPLETED for task in tasks)
    
    if status:
        tasks = [task for task in tasks if task.status == status]
    
    return {
        "tasks": tasks,
        "streak_info": {
            "current_streak": progress.current_streak,
            "longest_streak": progress.longest_streak,
            "streak_status": progress.streak_status,
            "streak_message": progress.streak_message,
            "today_completed": progress.today_completed,
            "today_total": progress.today_total,
            "all_tasks_completed_today": progress.all_tasks_completed_today
        },
        "completion_status": {
            "total_tasks": progress.today_total,
            "completed_tasks": progress.today_completed,
            "completion_percentage": (progress.today_completed / progress.today_total * 100) if progress.today_total > 0 else 0,
            "all_completed": progress.all_tasks_completed_today
        }
    }

@app.get("/api/progress/{user_id}")
async def get_user_progress(user_id: str):
    today = datetime.now().date()
    
    if user_id not in user_progress:
        user_progress[user_id] = UserProgress(user_id=user_id)
    else:
        progress = user_progress[user_id]
        if progress.last_completion_date:
            last_date = datetime.fromisoformat(progress.last_completion_date).date()
            if last_date != today:
                if not progress.all_tasks_completed_today:
                    progress.current_streak = 0
                    progress.streak_status = "no_streak"
                    progress.streak_message = "Complete all tasks today to start a streak!"
                progress.last_completion_date = None
                progress.all_tasks_completed_today = False
        else:
            progress.current_streak = 0
            progress.streak_status = "no_streak"
            progress.streak_message = "Complete all tasks today to start a streak!"
    
    progress = user_progress[user_id]
    
    today_tasks = [
        task for task in user_tasks.get(user_id, [])
        if datetime.fromisoformat(task.created_at).date() == today
    ]
    
    progress.today_total = len(today_tasks)
    progress.today_completed = sum(1 for task in today_tasks if task.status == TaskStatus.COMPLETED)
    
    check_streak_status(user_id, progress)
    
    completion_percentage = (progress.today_completed / progress.today_total * 100) if progress.today_total > 0 else 0
    
    return {
        "user_id": progress.user_id,
        "streak": {
            "current": progress.current_streak,  
            "longest": progress.longest_streak,
            "status": progress.streak_status,
            "message": progress.streak_message,
            "last_completion_date": progress.last_completion_date
        },
        "today": {
            "completed": progress.today_completed,
            "total": progress.today_total,
            "completion_percentage": round(completion_percentage, 1),
            "all_completed": all(task.status == TaskStatus.COMPLETED for task in today_tasks) if today_tasks else False
        },
        "total_stats": {
            "total_tasks_completed": progress.total_tasks_completed,
            "categories_completed": progress.categories_completed
        }
    }

@app.post("/api/tasks/{user_id}/complete/{task_id}")
async def complete_task(user_id: str, task_id: int):
    if user_id not in user_tasks:
        raise HTTPException(status_code=404, detail="User not found")
    
    task = next((t for t in user_tasks[user_id] if t.task_id == task_id), None)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if user_id not in user_progress:
        user_progress[user_id] = UserProgress(user_id=user_id)
    progress = user_progress[user_id]
    
    today = datetime.now().date()
    today_tasks = [
        t for t in user_tasks[user_id]
        if datetime.fromisoformat(t.created_at).date() == today
    ]
    
    was_completed = task.status == TaskStatus.COMPLETED
    all_tasks_completed_before = all(t.status == TaskStatus.COMPLETED for t in today_tasks)
    
    if was_completed:
        task.status = TaskStatus.PENDING
        task.completed_at = None
        
        progress.total_tasks_completed -= 1
        progress.categories_completed[task.category] = max(0, progress.categories_completed.get(task.category, 0) - 1)
        progress.today_completed -= 1
        
        if all_tasks_completed_before:
            if progress.current_streak > 0:
                progress.current_streak -= 1
                progress.streak_status = "decreased"
                progress.streak_message = f"Streak decreased to {progress.current_streak} days. Complete all tasks to increase it! 💪"
            else:
                progress.streak_status = "no_streak"
                progress.streak_message = "Streak broken! Complete all tasks to start a new streak! ��"
    else:
        task.status = TaskStatus.COMPLETED
        task.completed_at = datetime.now().isoformat()
        
        progress.total_tasks_completed += 1
        progress.categories_completed[task.category] = progress.categories_completed.get(task.category, 0) + 1
        progress.today_completed += 1
    
    all_tasks_completed_after = all(t.status == TaskStatus.COMPLETED for t in today_tasks)
    progress.all_tasks_completed_today = all_tasks_completed_after
    
    if all_tasks_completed_after:
        if not all_tasks_completed_before:
            if progress.last_completion_date:
                last_date = datetime.fromisoformat(progress.last_completion_date).date()
                if (today - last_date).days == 1:
                    progress.current_streak += 1
                    progress.streak_status = "increased"
                    progress.streak_message = f"🔥 {progress.current_streak} day streak! Keep it up!"
                elif (today - last_date).days > 1:
                    progress.current_streak = 1
                    progress.streak_status = "new_streak"
                    progress.streak_message = "New streak started! Keep it going! 🎯"
            else:
                progress.current_streak = 1
                progress.streak_status = "new_streak"
                progress.streak_message = "First streak started! Keep it going! 🎯"
            
            if progress.current_streak > progress.longest_streak:
                progress.longest_streak = progress.current_streak
        else:
            progress.streak_status = "maintained"
            progress.streak_message = f"🔥 {progress.current_streak} day streak! Keep it up!"
        
        if progress.current_streak == 0:
            progress.current_streak = 1
            progress.streak_status = "new_streak"
            progress.streak_message = "New streak started! Keep it going! 🎯"
        
        progress.last_completion_date = datetime.now().isoformat()
    
    if progress.today_total == 0:
        progress.today_total = len(today_tasks)
    
    newly_unlocked_achievements = check_achievements(user_id, progress)
    
    return {
        "task": task,
        "progress": {
            "current_streak": progress.current_streak,
            "longest_streak": progress.longest_streak,
            "streak_status": progress.streak_status,
            "streak_message": progress.streak_message,
            "today_completed": progress.today_completed,
            "today_total": progress.today_total,
            "all_tasks_completed_today": progress.all_tasks_completed_today
        },
        "newly_unlocked_achievements": newly_unlocked_achievements
    }

@app.get("/api/quotes")
async def get_motivational_quote(category: Optional[str] = None):
    quotes = MOTIVATIONAL_QUOTES
    if category:
        quotes = [q for q in quotes if q.category == category]
    
    if not quotes:
        raise HTTPException(status_code=404, detail="No quotes found for category")
    
    return random.choice(quotes)

@app.post("/api/ai/tasks/generate")
async def generate_ai_tasks(user_id: str, struggle_description: str):
    if not struggle_description or len(struggle_description.strip()) < 10:
        raise HTTPException(
            status_code=422,
            detail="Description must be at least 10 characters long"
        )
    
    assessment = user_assessments.get(user_id)
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    
    tasks = []
    task_id = len(user_tasks.get(user_id, [])) + 1
    
    category_scores = {}
    for response in assessment.responses:
        question = next(q for q in ASSESSMENT_QUESTIONS if q.id == response.question_id)
        if question.category not in category_scores:
            category_scores[question.category] = []
        category_scores[question.category].append(response.rating)
    
    category_averages = {
        category: sum(scores) / len(scores)
        for category, scores in category_scores.items()
    }
    
    lowest_categories = sorted(
        category_averages.items(),
        key=lambda x: x[1]
    )[:3]
    
    for category, score in lowest_categories:
        for i in range(2):
            difficulty = TaskDifficulty.EASY if i == 0 else TaskDifficulty.MEDIUM
            task = UserTask(
                task_id=task_id,
                user_id=user_id,
                title=f"AI-Generated Task for {category}",
                description=f"Personalized task based on your {category} assessment and struggle description",
                category=category,
                difficulty=difficulty,
                estimated_duration="15-30 minutes",
                created_at=datetime.now().isoformat(),
                ai_generated=True,
                steps=[
                    "Step 1: Review your current situation",
                    "Step 2: Identify specific challenges",
                    "Step 3: Create an action plan",
                    "Step 4: Implement and track progress"
                ]
            )
            tasks.append(task)
            task_id += 1
    
    if user_id not in user_tasks:
        user_tasks[user_id] = []
    user_tasks[user_id].extend(tasks)
    
    return {"tasks": tasks}

@app.post("/api/notes/daily")
async def create_daily_note(note_request: CreateNoteRequest):
    if not note_request.message or len(note_request.message.strip()) < 10:
        raise HTTPException(
            status_code=422,
            detail={
                "error": "Message too short",
                "message": "Your note must be at least 10 characters long"
            }
        )
    if len(note_request.message) > 500:
        raise HTTPException(
            status_code=422,
            detail={
                "error": "Message too long",
                "message": "Your note must not exceed 500 characters"
            }
        )
    
    today = date.today().isoformat()
    if note_request.user_id not in user_daily_note_count:
        user_daily_note_count[note_request.user_id] = {}
    
    if user_daily_note_count[note_request.user_id].get(today, 0) >= 1:
        today_note = None
        if note_request.user_id in daily_notes:
            for note in daily_notes[note_request.user_id]:
                note_date = datetime.fromisoformat(note.created_at).date()
                if note_date == date.today():
                    today_note = note
                    break
        
        raise HTTPException(
            status_code=400,
            detail={
                "error": "Daily limit reached",
                "message": "You can only create one note per day",
                "today_note": today_note.message if today_note else None,
                "created_at": today_note.created_at if today_note else None
            }
        )
    
    note_id = sum(len(notes) for notes in daily_notes.values()) + 1
    note = DailyNote(
        note_id=note_id,
        user_id=note_request.user_id,
        message=note_request.message,
        created_at=datetime.now().isoformat(),
        likes=0,
        category=note_request.category,
        mood=note_request.mood,
        is_public=note_request.is_public
    )
    
    if note_request.user_id not in daily_notes:
        daily_notes[note_request.user_id] = []
    daily_notes[note_request.user_id].append(note)
    
    user_daily_note_count[note_request.user_id][today] = 1
    
    if note_request.user_id not in user_progress:
        user_progress[note_request.user_id] = UserProgress(user_id=note_request.user_id)
    
    progress = user_progress[note_request.user_id]
    progress.notes_shared += 1
    
    newly_unlocked = check_achievements(note_request.user_id, progress)
    
    return {
        "note": note,
        "message": "Note created successfully",
        "status": "success",
        "newly_unlocked_achievements": newly_unlocked
    }

@app.get("/api/notes/random")
async def get_random_note(
    user_id: str,
    category: Optional[str] = None,
    exclude_own: bool = True
):
    available_notes = []
    
    for creator_id, notes in daily_notes.items():
        if creator_id == "system":
            continue
        if exclude_own and creator_id == user_id:
            continue
        
        for note in notes:
            if note.is_public and (category is None or note.category == category):
                available_notes.append(note)
    
    if not available_notes:
        system_notes = daily_notes.get("system", [])
        for note in system_notes:
            if category is None or note.category == category:
                available_notes.append(note)
    
    if not available_notes:
        default_note = DailyNote(
            note_id=0,
            user_id="system",
            message="Every day is a new opportunity to grow and make progress. Keep going!",
            created_at=datetime.now().isoformat(),
            likes=0,
            category="motivation",
            mood="inspired",
            is_public=True
        )
        return default_note
    
    return random.choice(available_notes)

@app.get("/api/notes/user/{user_id}")
async def get_user_notes(
    user_id: str,
    limit: int = 10,
    offset: int = 0,
    category: Optional[str] = None
):
    if user_id not in daily_notes:
        return {"notes": []}
    
    notes = daily_notes[user_id]
    if category:
        notes = [note for note in notes if note.category == category]
    
    notes.sort(key=lambda x: x.created_at, reverse=True)
    
    paginated_notes = notes[offset:offset + limit]
    
    return {"notes": paginated_notes}

@app.post("/api/notes/{note_id}/like")
async def like_note(note_id: int, user_id: str):
    note = None
    for notes in daily_notes.values():
        for n in notes:
            if n.note_id == note_id:
                note = n
                break
        if note:
            break
    
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    if user_id in note.liked_by:
        raise HTTPException(status_code=400, detail="You have already liked this note")
    
    note.likes += 1
    note.liked_by.add(user_id)
    
    return note

@app.get("/api/notes/stats/{user_id}")
async def get_user_note_stats(user_id: str):
    if user_id not in daily_notes:
        return {
            "total_notes": 0,
            "total_likes": 0,
            "notes_by_category": {},
            "notes_by_mood": {},
            "streak_days": 0
        }
    
    notes = daily_notes[user_id]
    total_likes = sum(note.likes for note in notes)
    
    notes_by_category = {}
    for note in notes:
        if note.category:
            notes_by_category[note.category] = notes_by_category.get(note.category, 0) + 1
    
    notes_by_mood = {}
    for note in notes:
        if note.mood:
            notes_by_mood[note.mood] = notes_by_mood.get(note.mood, 0) + 1
    
    streak_days = 0
    if user_id in user_daily_note_count:
        dates = sorted(user_daily_note_count[user_id].keys())
        if dates:
            current_streak = 0
            current_date = date.today()
            
            for d in reversed(dates):
                note_date = date.fromisoformat(d)
                if (current_date - note_date).days == current_streak:
                    current_streak += 1
                else:
                    break
            
            streak_days = current_streak
    
    return {
        "total_notes": len(notes),
        "total_likes": total_likes,
        "notes_by_category": notes_by_category,
        "notes_by_mood": notes_by_mood,
        "streak_days": streak_days
    }

@app.post("/api/tasks/{user_id}/select")
async def save_selected_tasks(user_id: str, selected_tasks: SelectedTasks):
    if user_id != selected_tasks.user_id:
        raise HTTPException(status_code=400, detail="User ID mismatch")
    
    if user_id not in user_tasks:
        user_tasks[user_id] = []
    
    selected_date = datetime.fromisoformat(selected_tasks.selected_date).date()
    
    user_tasks[user_id] = [
        task for task in user_tasks[user_id]
        if datetime.fromisoformat(task.created_at).date() != selected_date
    ]
    
    for task_detail in selected_tasks.task_details:
        task = UserTask(
            task_id=task_detail.task_id,
            user_id=user_id,
            title=task_detail.title,
            description=task_detail.description,
            category=task_detail.category,
            difficulty=TaskDifficulty(task_detail.difficulty),
            estimated_duration=task_detail.estimated_duration,
            created_at=datetime.now().isoformat(),
            status=TaskStatus.PENDING
        )
        user_tasks[user_id].append(task)
    
    if user_id not in user_progress:
        user_progress[user_id] = UserProgress(user_id=user_id)
    
    return {
        "status": "success",
        "message": "Tasks saved successfully",
        "progress": user_progress[user_id]
    }

@app.post("/api/progress/{user_id}/reset")
async def reset_user_progress(user_id: str):
    user_progress[user_id] = UserProgress(
        user_id=user_id,
        current_streak=0,
        longest_streak=0,
        streak_status="no_streak",
        streak_message="Complete all tasks today to start a streak!",
        today_completed=0,
        today_total=0
    )
    
    if user_id in user_tasks:
        today = datetime.now().date()
        user_tasks[user_id] = [
            task for task in user_tasks[user_id]
            if datetime.fromisoformat(task.created_at).date() != today
        ]
    
    return {
        "status": "success",
        "message": "Progress reset successfully",
        "progress": user_progress[user_id]
    }

@app.post("/api/tasks/{user_id}/refresh-day")
async def refresh_day_for_user(user_id: str):
    if user_id not in user_progress:
        user_progress[user_id] = UserProgress(user_id=user_id)

    if user_id not in user_tasks:
        return {"status": "success", "message": "No tasks to refresh"}

    progress = user_progress[user_id]
    today_date = date.today().isoformat()
    
    if progress.last_completion_date:
        last_date = date.fromisoformat(progress.last_completion_date)
        today = date.today()
        
        if (today - last_date).days == 1 and progress.all_tasks_completed_today:
            pass
        elif (today - last_date).days == 0:
            pass
        elif (today - last_date).days > 1:
            progress.current_streak = 0
            progress.streak_status = "reset"
            progress.streak_message = "Streak reset! Complete all tasks today to start again."
    
    progress.today_completed = 0
    progress.all_tasks_completed_today = False
    
    for task in user_tasks[user_id]:
        if task.status != TaskStatus.COMPLETED:
            task.status = TaskStatus.PENDING
    
    progress.today_total = len(user_tasks[user_id])
    
    response = {
        "status": "success", 
        "message": "Day refreshed successfully",
        "progress": progress
    }
    
    return response

def check_streak_status(user_id: str, progress: UserProgress) -> None:
    if progress.all_tasks_completed_today:
        if progress.current_streak > 0:
            progress.streak_status = "maintained"
            progress.streak_message = f"🔥 {progress.current_streak} day streak! Keep it up!"
        else:
            progress.streak_status = "new_streak"
            progress.streak_message = "First streak started! Keep it going! 🎯"
    else:
        if progress.current_streak > 0:
            progress.streak_status = "at_risk"
            progress.streak_message = f"Complete today's tasks to maintain your {progress.current_streak} day streak!"
        else:
            progress.streak_status = "no_streak"
            progress.streak_message = "Complete all tasks today to start a streak!"

def check_achievements(user_id: str, progress: UserProgress) -> List[str]:
    if not user_id or user_id not in user_progress:
        return []
    
    if not hasattr(progress, 'achievements'):
        progress.achievements = {}
    
    newly_unlocked = []
    
    for achievement_id, achievement_data in ACHIEVEMENTS.items():
        if achievement_id not in progress.achievements:
            progress.achievements[achievement_id] = UserAchievement(
                id=achievement_data["id"],
                text=achievement_data["text"],
                type=achievement_data["type"],
                threshold=achievement_data["threshold"],
                icon=achievement_data["icon"],
                completed=False
            )
    
    if progress.current_streak > 0:
        for achievement_id, achievement_data in ACHIEVEMENTS.items():
            if achievement_data["type"] == "streak" and progress.current_streak >= achievement_data["threshold"]:
                if not progress.achievements[achievement_id].completed:
                    progress.achievements[achievement_id].completed = True
                    progress.achievements[achievement_id].completion_date = datetime.now().isoformat()
                    newly_unlocked.append(achievement_id)
    
    if progress.total_tasks_completed > 0:
        for achievement_id, achievement_data in ACHIEVEMENTS.items():
            if achievement_data["type"] == "tasks" and progress.total_tasks_completed >= achievement_data["threshold"]:
                if not progress.achievements[achievement_id].completed:
                    progress.achievements[achievement_id].completed = True
                    progress.achievements[achievement_id].completion_date = datetime.now().isoformat()
                    newly_unlocked.append(achievement_id)
    
    if progress.notes_shared > 0:
        for achievement_id, achievement_data in ACHIEVEMENTS.items():
            if achievement_data["type"] == "notes" and progress.notes_shared >= achievement_data["threshold"]:
                if not progress.achievements[achievement_id].completed:
                    progress.achievements[achievement_id].completed = True
                    progress.achievements[achievement_id].completion_date = datetime.now().isoformat()
                    newly_unlocked.append(achievement_id)
    
    return newly_unlocked

@app.get("/api/achievements/{user_id}")
async def get_user_achievements(user_id: str):
    if user_id not in user_progress:
        user_progress[user_id] = UserProgress(user_id=user_id)
    
    progress = user_progress[user_id]
    
    if not hasattr(progress, 'achievements') or not progress.achievements:
        progress.achievements = {}
        for achievement_id, achievement_data in ACHIEVEMENTS.items():
            progress.achievements[achievement_id] = UserAchievement(
                id=achievement_data["id"],
                text=achievement_data["text"],
                type=achievement_data["type"],
                threshold=achievement_data["threshold"],
                icon=achievement_data["icon"],
                completed=False
            )
    
    check_achievements(user_id, progress)
    
    achievements_list = []
    for achievement_id, achievement in progress.achievements.items():
        achievements_list.append({
            "id": achievement.id,
            "text": achievement.text,
            "type": achievement.type,
            "threshold": achievement.threshold,
            "icon": achievement.icon,
            "completed": achievement.completed,
            "completion_date": achievement.completion_date
        })
    
    achievements_by_type = {
        "streak": [],
        "tasks": [],
        "notes": []
    }
    
    for achievement in achievements_list:
        if achievement["type"] in achievements_by_type:
            achievements_by_type[achievement["type"]].append(achievement)
    
    return {
        "user_id": user_id,
        "achievements": achievements_list,
        "by_type": achievements_by_type,
        "total_completed": sum(1 for a in achievements_list if a["completed"]),
        "total_available": len(achievements_list)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 