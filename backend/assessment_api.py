from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import json
from datetime import datetime
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

# In-memory storage
user_assessments: Dict[str, UserAssessment] = {}

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
async def submit_struggle_description(user_id: str, description: str):
    """Submit user's struggle description and get task recommendations"""
    if user_id not in user_assessments:
        raise HTTPException(status_code=404, detail="Assessment not found")
    
    user_assessments[user_id].struggle_description = description
    
    # Generate task recommendations based on lowest scoring categories
    recommendations = generate_task_recommendations(user_id)
    return {"recommendations": recommendations}

def generate_task_recommendations(user_id: str) -> List[TaskRecommendation]:
    """Generate personalized task recommendations based on assessment results"""
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

# Future endpoints to be implemented:
# @app.get("/api/tasks/{user_id}")
# @app.post("/api/tasks/{user_id}/complete")
# @app.get("/api/progress/{user_id}")
# @app.post("/api/feedback/{user_id}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 