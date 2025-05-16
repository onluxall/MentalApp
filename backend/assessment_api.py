from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional, Set
import json
from datetime import datetime, timedelta, date
from enum import Enum
import random

app = FastAPI(title="Mental Health App Backend")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data Models
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

# New Data Models
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
    energy_level: int = 3  # 1-5 scale
    steps: List[str] = []  # List of actionable steps

class UserProgress(BaseModel):
    user_id: str
    current_streak: int = 0  # Always starts at 0
    longest_streak: int = 0
    last_completion_date: Optional[str] = None
    total_tasks_completed: int = 0
    categories_completed: Dict[str, int] = {}
    streak_status: str = "no_streak"  # Default status
    streak_message: str = "Complete all tasks today to start a streak!"  # Default message
    today_completed: int = 0
    today_total: int = 0

class MotivationalQuote(BaseModel):
    quote: str
    author: str
    category: str

# New Data Models for Daily Notes
class DailyNote(BaseModel):
    note_id: int
    user_id: str
    message: str
    created_at: str
    likes: int = 0
    liked_by: Set[str] = set()  # Set of user_ids who liked the note
    is_public: bool = True
    category: Optional[str] = None  # e.g., "motivation", "gratitude", "reflection"
    mood: Optional[str] = None  # e.g., "happy", "grateful", "inspired"

# New Data Models for Task Details
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

# In-memory storage
user_assessments: Dict[str, UserAssessment] = {}
user_tasks: Dict[str, List[UserTask]] = {}  # user_id -> list of tasks
user_progress: Dict[str, UserProgress] = {}  # user_id -> progress
completed_tasks: Dict[str, List[UserTask]] = {}  # user_id -> completed tasks

# In-memory storage for daily notes
daily_notes: Dict[str, List[DailyNote]] = {}  # user_id -> list of notes
user_daily_note_count: Dict[str, Dict[str, int]] = {}  # user_id -> {date: count}

# Predefined assessment questions
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

# Task templates for recommendations
TASK_TEMPLATES = {
    "habits": [
        {"title": "Morning Routine Builder", "description": "Start with a 5-minute morning routine and gradually increase duration", "difficulty": "easy", "duration": "5-15 minutes"},
        {"title": "Habit Stacking", "description": "Attach a new habit to an existing one", "difficulty": "medium", "duration": "10-20 minutes"},
    ],
    "emotions": [
        {"title": "Emotion Journaling", "description": "Write down three emotions you felt today and their triggers", "difficulty": "easy", "duration": "10 minutes"},
        {"title": "Mindfulness Practice", "description": "Practice 5 minutes of mindful breathing", "difficulty": "medium", "duration": "5 minutes"},
    ],
    # Add more task templates for other categories...
}

# Sample motivational quotes
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
    # Add more quotes as needed
]

# Predefined motivational notes
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

# Initialize daily_notes with predefined notes
daily_notes = {"system": PREDEFINED_NOTES.copy()}  # Use copy() to avoid modifying the original list

# Add new request model for note creation
class CreateNoteRequest(BaseModel):
    user_id: str
    message: str
    category: Optional[str] = None
    mood: Optional[str] = None
    is_public: bool = True

# Add request model for struggle description
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
    """Get all assessment questions"""
    return {"questions": ASSESSMENT_QUESTIONS}

@app.post("/api/assessment/submit")
async def submit_assessment(assessment: UserAssessment):
    """Submit user assessment responses"""
    assessment.timestamp = datetime.now().isoformat()
    user_assessments[assessment.user_id] = assessment
    return {"status": "success", "message": "Assessment submitted successfully"}

@app.post("/api/assessment/{user_id}/struggle")
async def submit_struggle_description(user_id: str, struggle: StruggleDescription):
    """
    Submit user's struggle description and get task recommendations.
    
    Args:
        user_id (str): The ID of the user submitting the struggle
        struggle (StruggleDescription): The request body containing the struggle description
        
    Returns:
        dict: Contains task recommendations based on the struggle description
        
    Raises:
        HTTPException: If user_id is not found or description is invalid
    """
    description = struggle.description.strip()
    
    # Validate description
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
    
    # Store the struggle description
    user_assessments[user_id].struggle_description = description
    
    # Generate task recommendations based on lowest scoring categories
    recommendations = generate_task_recommendations(user_id)
    return {"recommendations": recommendations}

def generate_task_recommendations(user_id: str) -> List[TaskRecommendation]:
    """
    Generate personalized task recommendations based on assessment results.
    
    Args:
        user_id (str): The ID of the user to generate recommendations for
        
    Returns:
        List[TaskRecommendation]: List of personalized task recommendations
        
    TODO:
        - Add AI-powered task generation
        - Consider user's previous task completion history
        - Add task variety to prevent user fatigue
        - Add success metrics for each task
        - Add proper error handling
        - Add request logging
        - Add response validation
        - Add proper CORS configuration
        - Add API versioning
    """
    assessment = user_assessments[user_id]
    
    # Calculate average scores per category
    category_scores = {}
    for response in assessment.responses:
        question = next(q for q in ASSESSMENT_QUESTIONS if q.id == response.question_id)
        if question.category not in category_scores:
            category_scores[question.category] = []
        category_scores[question.category].append(response.rating)
    
    # Find categories with lowest scores
    category_averages = {
        category: sum(scores) / len(scores)
        for category, scores in category_scores.items()
    }
    
    # Get top 3 lowest scoring categories
    lowest_categories = sorted(
        category_averages.items(),
        key=lambda x: x[1]
    )[:3]
    
    # Generate recommendations
    recommendations = []
    task_id = 1
    
    for category, _ in lowest_categories:
        if category in TASK_TEMPLATES:
            for template in TASK_TEMPLATES[category][:2]:  # Get 2 tasks per category
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

# New Endpoints for Home Screen
@app.get("/api/tasks/{user_id}")
async def get_user_tasks(user_id: str, status: Optional[TaskStatus] = None):
    """
    Get user's current tasks for today, optionally filtered by status.
    Includes streak information starting at 0 for new day.
    
    Args:
        user_id (str): The ID of the user
        status (TaskStatus, optional): Filter tasks by status
        
    Returns:
        dict: Contains tasks, streak info, and completion status
    """
    today = datetime.now().date()
    
    # Initialize or reset progress for new day
    if user_id not in user_progress:
        user_progress[user_id] = UserProgress(user_id=user_id)
    else:
        progress = user_progress[user_id]
        # Reset streak if it's a new day
        if progress.last_completion_date:
            last_date = datetime.fromisoformat(progress.last_completion_date).date()
            if last_date != today:
                progress.current_streak = 0
                progress.streak_status = "new_day"
                progress.streak_message = "New day! Complete all tasks to start your streak! 🎯"
                progress.last_completion_date = None
        else:
            # No last completion date, ensure streak is 0
            progress.current_streak = 0
            progress.streak_status = "no_streak"
            progress.streak_message = "Complete all tasks today to start a streak!"
    
    progress = user_progress[user_id]
    
    if user_id not in user_tasks:
        user_tasks[user_id] = []
    
    tasks = [
        task for task in user_tasks[user_id]
        if datetime.fromisoformat(task.created_at).date() == today
    ]
    
    if status:
        tasks = [task for task in tasks if task.status == status]
    
    # Update streak status
    check_and_update_streak(user_id, progress)
    
    # Calculate completion percentage
    total_tasks = len(tasks)
    completed_tasks = sum(1 for task in tasks if task.status == TaskStatus.COMPLETED)
    completion_percentage = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
    
    return {
        "tasks": tasks,
        "streak_info": {
            "current_streak": progress.current_streak,  # Will always be 0 on first access
            "longest_streak": progress.longest_streak,
            "streak_status": progress.streak_status,
            "streak_message": progress.streak_message,
            "today_completed": progress.today_completed,
            "today_total": progress.today_total
        },
        "completion_status": {
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "completion_percentage": round(completion_percentage, 1),
            "all_completed": all(task.status == TaskStatus.COMPLETED for task in tasks) if tasks else False
        }
    }

def check_and_update_streak(user_id: str, progress: UserProgress) -> None:
    """
    Helper function to check task completion and update streak.
    Resets streak to 0 each day, adds +1 if all tasks completed, -1 if not all completed.
    
    Args:
        user_id (str): The ID of the user
        progress (UserProgress): The user's progress object
    """
    today = datetime.now().date()
    
    # Get all tasks for today
    today_tasks = [
        task for task in user_tasks.get(user_id, [])
        if datetime.fromisoformat(task.created_at).date() == today
    ]
    
    # Update today's task counts
    progress.today_total = len(today_tasks)
    progress.today_completed = sum(1 for task in today_tasks if task.status == TaskStatus.COMPLETED)
    
    # If there are no tasks for today, don't update streak
    if not today_tasks:
        progress.streak_status = "no_streak"
        progress.streak_message = "No tasks for today"
        return
    
    # Check if this is a new day
    if progress.last_completion_date:
        last_date = datetime.fromisoformat(progress.last_completion_date).date()
        if last_date != today:
            # Reset streak to 0 for new day
            progress.current_streak = 0
            progress.streak_status = "new_day"
            progress.streak_message = "New day! Complete all tasks to start your streak! 🎯"
            progress.last_completion_date = None
    
    # Check if all tasks are completed
    all_completed = all(task.status == TaskStatus.COMPLETED for task in today_tasks)
    
    if all_completed:
        # Add +1 to streak
        progress.current_streak += 1
        progress.longest_streak = max(progress.longest_streak, progress.current_streak)
        progress.streak_status = "increased"
        progress.streak_message = f"🔥 {progress.current_streak} day streak! Keep it up!"
        progress.last_completion_date = today.isoformat()
    else:
        # Subtract 1 from streak (but not below 0)
        if progress.current_streak > 0:
            progress.current_streak -= 1
            progress.streak_status = "decreased"
            if progress.current_streak > 0:
                progress.streak_message = f"Streak decreased to {progress.current_streak} days. Complete all tasks to increase it! 💪"
            else:
                progress.streak_message = "Streak broken! Complete all tasks to start a new streak! 🎯"
        else:
            progress.streak_status = "no_streak"
            progress.streak_message = "Complete all tasks today to start a streak!"
        
        # Update last completion date only if we had a streak
        if progress.last_completion_date:
            last_date = datetime.fromisoformat(progress.last_completion_date).date()
            if (today - last_date) > timedelta(days=0):
                progress.last_completion_date = None

@app.get("/api/progress/{user_id}")
async def get_user_progress(user_id: str):
    """
    Get user's progress including streak and completion stats.
    Always initializes streak to 0 on first access of the day.
    
    Args:
        user_id (str): The ID of the user
        
    Returns:
        dict: Detailed user progress information including streak status and task completion
    """
    today = datetime.now().date()
    
    # Initialize or reset progress for new day
    if user_id not in user_progress:
        user_progress[user_id] = UserProgress(user_id=user_id)
    else:
        progress = user_progress[user_id]
        # Reset streak if it's a new day
        if progress.last_completion_date:
            last_date = datetime.fromisoformat(progress.last_completion_date).date()
            if last_date != today:
                progress.current_streak = 0
                progress.streak_status = "new_day"
                progress.streak_message = "New day! Complete all tasks to start your streak! 🎯"
                progress.last_completion_date = None
        else:
            # No last completion date, ensure streak is 0
            progress.current_streak = 0
            progress.streak_status = "no_streak"
            progress.streak_message = "Complete all tasks today to start a streak!"
    
    progress = user_progress[user_id]
    
    # Get today's tasks
    today_tasks = [
        task for task in user_tasks.get(user_id, [])
        if datetime.fromisoformat(task.created_at).date() == today
    ]
    
    # Update task counts
    progress.today_total = len(today_tasks)
    progress.today_completed = sum(1 for task in today_tasks if task.status == TaskStatus.COMPLETED)
    
    # Check and update streak based on current completion status
    check_and_update_streak(user_id, progress)
    
    # Calculate completion percentage
    completion_percentage = (progress.today_completed / progress.today_total * 100) if progress.today_total > 0 else 0
    
    return {
        "user_id": progress.user_id,
        "streak": {
            "current": progress.current_streak,  # Will always be 0 on first access
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
    """
    Toggle a task's completion status and update user progress.
    Updates streak if all tasks for today are completed.
    
    Args:
        user_id (str): The ID of the user
        task_id (int): The ID of the task to toggle
        
    Returns:
        dict: Updated task and progress information with streak status
    """
    if user_id not in user_tasks and user_id not in completed_tasks:
        raise HTTPException(status_code=404, detail="User not found")
    
    # First check in active tasks
    task = next((t for t in user_tasks.get(user_id, []) if t.task_id == task_id), None)
    is_completing = True
    
    # If not found in active tasks, check in completed tasks
    if not task:
        task = next((t for t in completed_tasks.get(user_id, []) if t.task_id == task_id), None)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        is_completing = False
    
    # Initialize progress if needed
    if user_id not in user_progress:
        user_progress[user_id] = UserProgress(user_id=user_id)
    progress = user_progress[user_id]
    
    if is_completing:
        # Mark as completed
        task.status = TaskStatus.COMPLETED
        task.completed_at = datetime.now().isoformat()
        
        # Move to completed tasks
        if user_id not in completed_tasks:
            completed_tasks[user_id] = []
        completed_tasks[user_id].append(task)
        user_tasks[user_id].remove(task)
        
        # Update progress
        progress.total_tasks_completed += 1
        progress.categories_completed[task.category] = progress.categories_completed.get(task.category, 0) + 1
    else:
        # Mark as pending
        task.status = TaskStatus.PENDING
        task.completed_at = None
        
        # Move back to active tasks
        if user_id not in user_tasks:
            user_tasks[user_id] = []
        user_tasks[user_id].append(task)
        completed_tasks[user_id].remove(task)
        
        # Update progress
        progress.total_tasks_completed -= 1
        progress.categories_completed[task.category] = max(0, progress.categories_completed.get(task.category, 0) - 1)
    
    # Check and update streak based on all tasks completion
    check_and_update_streak(user_id, progress)
    
    return {
        "task": task,
        "progress": progress,
        "streak_updated": progress.streak_status in ["maintaining", "new_streak"],
        "streak_message": progress.streak_message
    }

@app.get("/api/quotes")
async def get_motivational_quote(category: Optional[str] = None):
    """
    Get a random motivational quote, optionally filtered by category.
    
    Args:
        category (str, optional): Filter quotes by category
        
    Returns:
        MotivationalQuote: A random motivational quote
    """
    quotes = MOTIVATIONAL_QUOTES
    if category:
        quotes = [q for q in quotes if q.category == category]
    
    if not quotes:
        raise HTTPException(status_code=404, detail="No quotes found for category")
    
    return random.choice(quotes)

# AI Task Generation Endpoint
@app.post("/api/ai/tasks/generate")
async def generate_ai_tasks(user_id: str, struggle_description: str):
    """
    Generate AI-powered task recommendations based on user's struggle.
    
    Args:
        user_id (str): The ID of the user
        struggle_description (str): User's description of their struggle
        
    Returns:
        List[UserTask]: List of AI-generated tasks
    """
    if not struggle_description or len(struggle_description.strip()) < 10:
        raise HTTPException(
            status_code=422,
            detail="Description must be at least 10 characters long"
        )
    
    # Get user's assessment data
    assessment = user_assessments.get(user_id)
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    
    # Generate tasks based on assessment and struggle
    tasks = []
    task_id = len(user_tasks.get(user_id, [])) + 1
    
    # Get lowest scoring categories
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
    
    # Generate tasks for each low-scoring category
    for category, score in lowest_categories:
        # Create 2 tasks per category with increasing difficulty
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
    
    # Store tasks
    if user_id not in user_tasks:
        user_tasks[user_id] = []
    user_tasks[user_id].extend(tasks)
    
    return {"tasks": tasks}

# New Endpoints for Daily Notes
@app.post("/api/notes/daily")
async def create_daily_note(note_request: CreateNoteRequest):
    """
    Create a new daily note/message.
    Users can only create one note per day.
    
    Args:
        note_request (CreateNoteRequest): The note creation request containing:
            - user_id: The ID of the user creating the note
            - message: The note message
            - category: Optional category of the note
            - mood: Optional mood associated with the note
            - is_public: Whether the note is visible to other users
        
    Returns:
        dict: Contains the created note and a status message
        
    Raises:
        HTTPException: If user has already created a note today
        HTTPException: If message is too short or too long
    """
    # Validate message length
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
    
    # Check if user has already created a note today
    today = date.today().isoformat()
    if note_request.user_id not in user_daily_note_count:
        user_daily_note_count[note_request.user_id] = {}
    
    if user_daily_note_count[note_request.user_id].get(today, 0) >= 1:
        # Get the user's note for today
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
    
    # Create new note
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
    
    # Store note
    if note_request.user_id not in daily_notes:
        daily_notes[note_request.user_id] = []
    daily_notes[note_request.user_id].append(note)
    
    # Update daily count
    user_daily_note_count[note_request.user_id][today] = 1
    
    return {
        "note": note,
        "message": "Note created successfully",
        "status": "success"
    }

@app.get("/api/notes/random")
async def get_random_note(
    user_id: str,
    category: Optional[str] = None,
    exclude_own: bool = True
):
    """
    Get a random note from other users.
    If no user notes are available, returns a random predefined note.
    
    Args:
        user_id (str): The ID of the user requesting the note
        category (str, optional): Filter notes by category
        exclude_own (bool): Whether to exclude user's own notes
        
    Returns:
        DailyNote: A random note
    """
    # Collect all available notes
    available_notes = []
    
    # Add user-generated notes first
    for creator_id, notes in daily_notes.items():
        if creator_id == "system":  # Skip system notes for now
            continue
        if exclude_own and creator_id == user_id:
            continue
        
        for note in notes:
            if note.is_public and (category is None or note.category == category):
                available_notes.append(note)
    
    # If no user notes are available, add system (predefined) notes
    if not available_notes:
        system_notes = daily_notes.get("system", [])
        for note in system_notes:
            if category is None or note.category == category:
                available_notes.append(note)
    
    # If still no notes available, return a default note
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
    
    # Return a random note
    return random.choice(available_notes)

@app.get("/api/notes/user/{user_id}")
async def get_user_notes(
    user_id: str,
    limit: int = 10,
    offset: int = 0,
    category: Optional[str] = None
):
    """
    Get notes created by a specific user.
    
    Args:
        user_id (str): The ID of the user whose notes to retrieve
        limit (int): Maximum number of notes to return
        offset (int): Number of notes to skip
        category (str, optional): Filter notes by category
        
    Returns:
        List[DailyNote]: List of user's notes
    """
    if user_id not in daily_notes:
        return {"notes": []}
    
    notes = daily_notes[user_id]
    if category:
        notes = [note for note in notes if note.category == category]
    
    # Sort by creation date (newest first)
    notes.sort(key=lambda x: x.created_at, reverse=True)
    
    # Apply pagination
    paginated_notes = notes[offset:offset + limit]
    
    return {"notes": paginated_notes}

@app.post("/api/notes/{note_id}/like")
async def like_note(note_id: int, user_id: str):
    """
    Like a note.
    
    Args:
        note_id (int): The ID of the note to like
        user_id (str): The ID of the user liking the note
        
    Returns:
        DailyNote: The updated note
        
    Raises:
        HTTPException: If note not found or user has already liked it
    """
    # Find the note
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
    
    # Update like count
    note.likes += 1
    note.liked_by.add(user_id)
    
    return note

@app.get("/api/notes/stats/{user_id}")
async def get_user_note_stats(user_id: str):
    """
    Get statistics about a user's notes.
    
    Args:
        user_id (str): The ID of the user
        
    Returns:
        dict: Statistics about the user's notes
    """
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
    
    # Calculate notes by category
    notes_by_category = {}
    for note in notes:
        if note.category:
            notes_by_category[note.category] = notes_by_category.get(note.category, 0) + 1
    
    # Calculate notes by mood
    notes_by_mood = {}
    for note in notes:
        if note.mood:
            notes_by_mood[note.mood] = notes_by_mood.get(note.mood, 0) + 1
    
    # Calculate streak
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
    """
    Save selected tasks for a user.
    Clears any existing tasks for the selected date before saving new ones.
    
    Args:
        user_id (str): The ID of the user
        selected_tasks (SelectedTasks): The selected tasks to save
        
    Returns:
        dict: Success message and updated progress
    """
    if user_id != selected_tasks.user_id:
        raise HTTPException(status_code=400, detail="User ID mismatch")
    
    # Initialize user's task list if it doesn't exist
    if user_id not in user_tasks:
        user_tasks[user_id] = []
    
    # Get the selected date
    selected_date = datetime.fromisoformat(selected_tasks.selected_date).date()
    
    # Remove any existing tasks for the selected date
    user_tasks[user_id] = [
        task for task in user_tasks[user_id]
        if datetime.fromisoformat(task.created_at).date() != selected_date
    ]
    
    # Create new UserTask entries for each selected task
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
    
    # Initialize or update user progress
    if user_id not in user_progress:
        user_progress[user_id] = UserProgress(user_id=user_id)
    
    return {
        "status": "success",
        "message": "Tasks saved successfully",
        "progress": user_progress[user_id]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 