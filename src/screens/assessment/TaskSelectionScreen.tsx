import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, FlatList, Platform, ActivityIndicator } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { TaskRecommendation } from '../../services/api';
import axios from 'axios';


type RootStackParamList = {
  TaskSelection: { selectedCategories: string[], recommendations: TaskRecommendation[], userStruggleText?: string };
  Home: { selectedTasks: number[], progress: number };
  Main: undefined;
};

type TaskSelectionScreenNavigationProp = StackNavigationProp<RootStackParamList, 'TaskSelection'>;
type TaskSelectionScreenRouteProp = RouteProp<RootStackParamList, 'TaskSelection'>;

type Props = {
  navigation: TaskSelectionScreenNavigationProp;
  route: TaskSelectionScreenRouteProp;
};

//BACKEND TEAM: This component expects the following API endpoints:
//- GET /api/tasks/recommended?categories=habits,emotions,productivity - To get recommended tasks based on categories
//- The recommendations provided from the Evaluation screen should be passed to this screen
//- The TaskRecommendation interface is defined in services/api.ts
//- If no recommendations are provided, we use the FALLBACK_TASKS as a placeholder

//Fallback tasks in case no recommendations are available
const FALLBACK_TASKS = [
  {
    task_id: 1,
    title: "Morning Routine Builder",
    description: "Create a consistent morning routine to start your day with purpose.",
    category: "habits",
    difficulty: "easy",
    estimated_duration: "28 minutes",
  },
  {
    task_id: 2,
    title: "Hydration Reminder",
    description: "Drink a glass of water after waking up.",
    category: "habits",
    difficulty: "easy",
    estimated_duration: "19 minutes",
  },
  {
    task_id: 3,
    title: "Daily Gratitude",
    description: "Write down one thing you're grateful for.",
    category: "habits",
    difficulty: "easy",
    estimated_duration: "22 minutes",
  },
  {
    task_id: 4,
    title: "Evening Wind Down",
    description: "Develop an evening routine to improve sleep and prepare for tomorrow.",
    category: "habits",
    difficulty: "medium",
    estimated_duration: "28 minutes",
  },
  {
    task_id: 5,
    title: "Habit Tracker Setup",
    description: "Set up a simple tracker to monitor daily habits.",
    category: "habits",
    difficulty: "medium",
    estimated_duration: "16 minutes",
  },
  {
    task_id: 6,
    title: "Meal Prep Ritual",
    description: "Establish a habit of preparing meals in advance.",
    category: "habits",
    difficulty: "medium",
    estimated_duration: "21 minutes",
  },
  {
    task_id: 7,
    title: "30-Day Habit Challenge",
    description: "Stick to a new habit for 30 days without missing a day.",
    category: "habits",
    difficulty: "hard",
    estimated_duration: "21 minutes",
  },
  {
    task_id: 8,
    title: "Wake Up at 5AM",
    description: "Train your body to wake up at 5AM consistently.",
    category: "habits",
    difficulty: "hard",
    estimated_duration: "16 minutes",
  },
  {
    task_id: 9,
    title: "Digital Detox Hour",
    description: "Avoid screens for the first hour of your day.",
    category: "habits",
    difficulty: "hard",
    estimated_duration: "17 minutes",
  },
  {
    task_id: 10,
    title: "Emotions Task 1",
    description: "Engage in a easy level task to improve your emotions.",
    category: "emotions",
    difficulty: "easy",
    estimated_duration: "18 minutes",
  },
  {
    task_id: 11,
    title: "Emotions Task 2",
    description: "Engage in a easy level task to improve your emotions.",
    category: "emotions",
    difficulty: "easy",
    estimated_duration: "22 minutes",
  },
  {
    task_id: 12,
    title: "Emotions Task 3",
    description: "Engage in a easy level task to improve your emotions.",
    category: "emotions",
    difficulty: "easy",
    estimated_duration: "26 minutes",
  },
  {
    task_id: 13,
    title: "Emotions Task 1",
    description: "Engage in a medium level task to improve your emotions.",
    category: "emotions",
    difficulty: "medium",
    estimated_duration: "23 minutes",
  },
  {
    task_id: 14,
    title: "Emotions Task 2",
    description: "Engage in a medium level task to improve your emotions.",
    category: "emotions",
    difficulty: "medium",
    estimated_duration: "20 minutes",
  },
  {
    task_id: 15,
    title: "Emotions Task 3",
    description: "Engage in a medium level task to improve your emotions.",
    category: "emotions",
    difficulty: "medium",
    estimated_duration: "29 minutes",
  },
  {
    task_id: 16,
    title: "Emotions Task 1",
    description: "Engage in a hard level task to improve your emotions.",
    category: "emotions",
    difficulty: "hard",
    estimated_duration: "28 minutes",
  },
  {
    task_id: 17,
    title: "Emotions Task 2",
    description: "Engage in a hard level task to improve your emotions.",
    category: "emotions",
    difficulty: "hard",
    estimated_duration: "14 minutes",
  },
  {
    task_id: 18,
    title: "Emotions Task 3",
    description: "Engage in a hard level task to improve your emotions.",
    category: "emotions",
    difficulty: "hard",
    estimated_duration: "15 minutes",
  },
  {
    task_id: 19,
    title: "Productivity Task 1",
    description: "Engage in a easy level task to improve your productivity.",
    category: "productivity",
    difficulty: "easy",
    estimated_duration: "22 minutes",
  },
  {
    task_id: 20,
    title: "Productivity Task 2",
    description: "Engage in a easy level task to improve your productivity.",
    category: "productivity",
    difficulty: "easy",
    estimated_duration: "28 minutes",
  },
  {
    task_id: 21,
    title: "Productivity Task 3",
    description: "Engage in a easy level task to improve your productivity.",
    category: "productivity",
    difficulty: "easy",
    estimated_duration: "24 minutes",
  },
  {
    task_id: 22,
    title: "Productivity Task 1",
    description: "Engage in a medium level task to improve your productivity.",
    category: "productivity",
    difficulty: "medium",
    estimated_duration: "18 minutes",
  },
  {
    task_id: 23,
    title: "Productivity Task 2",
    description: "Engage in a medium level task to improve your productivity.",
    category: "productivity",
    difficulty: "medium",
    estimated_duration: "12 minutes",
  },
  {
    task_id: 24,
    title: "Productivity Task 3",
    description: "Engage in a medium level task to improve your productivity.",
    category: "productivity",
    difficulty: "medium",
    estimated_duration: "20 minutes",
  },
  {
    task_id: 25,
    title: "Productivity Task 1",
    description: "Engage in a hard level task to improve your productivity.",
    category: "productivity",
    difficulty: "hard",
    estimated_duration: "27 minutes",
  },
  {
    task_id: 26,
    title: "Productivity Task 2",
    description: "Engage in a hard level task to improve your productivity.",
    category: "productivity",
    difficulty: "hard",
    estimated_duration: "20 minutes",
  },
  {
    task_id: 27,
    title: "Productivity Task 3",
    description: "Engage in a hard level task to improve your productivity.",
    category: "productivity",
    difficulty: "hard",
    estimated_duration: "22 minutes",
  },
  {
    task_id: 28,
    title: "Discipline Task 1",
    description: "Engage in a easy level task to improve your discipline.",
    category: "discipline",
    difficulty: "easy",
    estimated_duration: "28 minutes",
  },
  {
    task_id: 29,
    title: "Discipline Task 2",
    description: "Engage in a easy level task to improve your discipline.",
    category: "discipline",
    difficulty: "easy",
    estimated_duration: "26 minutes",
  },
  {
    task_id: 30,
    title: "Discipline Task 3",
    description: "Engage in a easy level task to improve your discipline.",
    category: "discipline",
    difficulty: "easy",
    estimated_duration: "29 minutes",
  },
  {
    task_id: 31,
    title: "Discipline Task 1",
    description: "Engage in a medium level task to improve your discipline.",
    category: "discipline",
    difficulty: "medium",
    estimated_duration: "11 minutes",
  },
  {
    task_id: 32,
    title: "Discipline Task 2",
    description: "Engage in a medium level task to improve your discipline.",
    category: "discipline",
    difficulty: "medium",
    estimated_duration: "24 minutes",
  },
  {
    task_id: 33,
    title: "Discipline Task 3",
    description: "Engage in a medium level task to improve your discipline.",
    category: "discipline",
    difficulty: "medium",
    estimated_duration: "18 minutes",
  },
  {
    task_id: 34,
    title: "Discipline Task 1",
    description: "Engage in a hard level task to improve your discipline.",
    category: "discipline",
    difficulty: "hard",
    estimated_duration: "28 minutes",
  },
  {
    task_id: 35,
    title: "Discipline Task 2",
    description: "Engage in a hard level task to improve your discipline.",
    category: "discipline",
    difficulty: "hard",
    estimated_duration: "25 minutes",
  },
  {
    task_id: 36,
    title: "Discipline Task 3",
    description: "Engage in a hard level task to improve your discipline.",
    category: "discipline",
    difficulty: "hard",
    estimated_duration: "28 minutes",
  },
  {
    task_id: 37,
    title: "Goal_setting Task 1",
    description: "Engage in a easy level task to improve your goal setting.",
    category: "goal_setting",
    difficulty: "easy",
    estimated_duration: "18 minutes",
  },
  {
    task_id: 38,
    title: "Goal_setting Task 2",
    description: "Engage in a easy level task to improve your goal setting.",
    category: "goal_setting",
    difficulty: "easy",
    estimated_duration: "22 minutes",
  },
  {
    task_id: 39,
    title: "Goal_setting Task 3",
    description: "Engage in a easy level task to improve your goal setting.",
    category: "goal_setting",
    difficulty: "easy",
    estimated_duration: "10 minutes",
  },
  {
    task_id: 40,
    title: "Goal_setting Task 1",
    description: "Engage in a medium level task to improve your goal setting.",
    category: "goal_setting",
    difficulty: "medium",
    estimated_duration: "16 minutes",
  },
  {
    task_id: 41,
    title: "Goal_setting Task 2",
    description: "Engage in a medium level task to improve your goal setting.",
    category: "goal_setting",
    difficulty: "medium",
    estimated_duration: "18 minutes",
  },
  {
    task_id: 42,
    title: "Goal_setting Task 3",
    description: "Engage in a medium level task to improve your goal setting.",
    category: "goal_setting",
    difficulty: "medium",
    estimated_duration: "27 minutes",
  },
  {
    task_id: 43,
    title: "Goal_setting Task 1",
    description: "Engage in a hard level task to improve your goal setting.",
    category: "goal_setting",
    difficulty: "hard",
    estimated_duration: "27 minutes",
  },
  {
    task_id: 44,
    title: "Goal_setting Task 2",
    description: "Engage in a hard level task to improve your goal setting.",
    category: "goal_setting",
    difficulty: "hard",
    estimated_duration: "20 minutes",
  },
  {
    task_id: 45,
    title: "Goal_setting Task 3",
    description: "Engage in a hard level task to improve your goal setting.",
    category: "goal_setting",
    difficulty: "hard",
    estimated_duration: "19 minutes",
  },
  {
    task_id: 46,
    title: "Time_management Task 1",
    description: "Engage in a easy level task to improve your time management.",
    category: "time_management",
    difficulty: "easy",
    estimated_duration: "28 minutes",
  },
  {
    task_id: 47,
    title: "Time_management Task 2",
    description: "Engage in a easy level task to improve your time management.",
    category: "time_management",
    difficulty: "easy",
    estimated_duration: "19 minutes",
  },
  {
    task_id: 48,
    title: "Time_management Task 3",
    description: "Engage in a easy level task to improve your time management.",
    category: "time_management",
    difficulty: "easy",
    estimated_duration: "10 minutes",
  },
  {
    task_id: 49,
    title: "Time_management Task 1",
    description: "Engage in a medium level task to improve your time management.",
    category: "time_management",
    difficulty: "medium",
    estimated_duration: "23 minutes",
  },
  {
    task_id: 50,
    title: "Time_management Task 2",
    description: "Engage in a medium level task to improve your time management.",
    category: "time_management",
    difficulty: "medium",
    estimated_duration: "13 minutes",
  },
  {
    task_id: 51,
    title: "Time_management Task 3",
    description: "Engage in a medium level task to improve your time management.",
    category: "time_management",
    difficulty: "medium",
    estimated_duration: "26 minutes",
  },
  {
    task_id: 52,
    title: "Time_management Task 1",
    description: "Engage in a hard level task to improve your time management.",
    category: "time_management",
    difficulty: "hard",
    estimated_duration: "25 minutes",
  },
  {
    task_id: 53,
    title: "Time_management Task 2",
    description: "Engage in a hard level task to improve your time management.",
    category: "time_management",
    difficulty: "hard",
    estimated_duration: "15 minutes",
  },
  {
    task_id: 54,
    title: "Time_management Task 3",
    description: "Engage in a hard level task to improve your time management.",
    category: "time_management",
    difficulty: "hard",
    estimated_duration: "20 minutes",
  },
  {
    task_id: 55,
    title: "Mindset Task 1",
    description: "Engage in a easy level task to improve your mindset.",
    category: "mindset",
    difficulty: "easy",
    estimated_duration: "19 minutes",
  },
  {
    task_id: 56,
    title: "Mindset Task 2",
    description: "Engage in a easy level task to improve your mindset.",
    category: "mindset",
    difficulty: "easy",
    estimated_duration: "26 minutes",
  },
  {
    task_id: 57,
    title: "Mindset Task 3",
    description: "Engage in a easy level task to improve your mindset.",
    category: "mindset",
    difficulty: "easy",
    estimated_duration: "21 minutes",
  },
  {
    task_id: 58,
    title: "Mindset Task 1",
    description: "Engage in a medium level task to improve your mindset.",
    category: "mindset",
    difficulty: "medium",
    estimated_duration: "14 minutes",
  },
  {
    task_id: 59,
    title: "Mindset Task 2",
    description: "Engage in a medium level task to improve your mindset.",
    category: "mindset",
    difficulty: "medium",
    estimated_duration: "29 minutes",
  },
  {
    task_id: 60,
    title: "Mindset Task 3",
    description: "Engage in a medium level task to improve your mindset.",
    category: "mindset",
    difficulty: "medium",
    estimated_duration: "19 minutes",
  },
  {
    task_id: 61,
    title: "Mindset Task 1",
    description: "Engage in a hard level task to improve your mindset.",
    category: "mindset",
    difficulty: "hard",
    estimated_duration: "27 minutes",
  },
  {
    task_id: 62,
    title: "Mindset Task 2",
    description: "Engage in a hard level task to improve your mindset.",
    category: "mindset",
    difficulty: "hard",
    estimated_duration: "17 minutes",
  },
  {
    task_id: 63,
    title: "Mindset Task 3",
    description: "Engage in a hard level task to improve your mindset.",
    category: "mindset",
    difficulty: "hard",
    estimated_duration: "28 minutes",
  },
  {
    task_id: 64,
    title: "Environment Task 1",
    description: "Engage in a easy level task to improve your environment.",
    category: "environment",
    difficulty: "easy",
    estimated_duration: "11 minutes",
  },
  {
    task_id: 65,
    title: "Environment Task 2",
    description: "Engage in a easy level task to improve your environment.",
    category: "environment",
    difficulty: "easy",
    estimated_duration: "29 minutes",
  },
  {
    task_id: 66,
    title: "Environment Task 3",
    description: "Engage in a easy level task to improve your environment.",
    category: "environment",
    difficulty: "easy",
    estimated_duration: "16 minutes",
  },
  {
    task_id: 67,
    title: "Environment Task 1",
    description: "Engage in a medium level task to improve your environment.",
    category: "environment",
    difficulty: "medium",
    estimated_duration: "27 minutes",
  },
  {
    task_id: 68,
    title: "Environment Task 2",
    description: "Engage in a medium level task to improve your environment.",
    category: "environment",
    difficulty: "medium",
    estimated_duration: "30 minutes",
  },
  {
    task_id: 69,
    title: "Environment Task 3",
    description: "Engage in a medium level task to improve your environment.",
    category: "environment",
    difficulty: "medium",
    estimated_duration: "17 minutes",
  },
  {
    task_id: 70,
    title: "Environment Task 1",
    description: "Engage in a hard level task to improve your environment.",
    category: "environment",
    difficulty: "hard",
    estimated_duration: "19 minutes",
  },
  {
    task_id: 71,
    title: "Environment Task 2",
    description: "Engage in a hard level task to improve your environment.",
    category: "environment",
    difficulty: "hard",
    estimated_duration: "13 minutes",
  },
  {
    task_id: 72,
    title: "Environment Task 3",
    description: "Engage in a hard level task to improve your environment.",
    category: "environment",
    difficulty: "hard",
    estimated_duration: "20 minutes",
  },
  {
    task_id: 73,
    title: "Physical_health Task 1",
    description: "Engage in a easy level task to improve your physical health.",
    category: "physical_health",
    difficulty: "easy",
    estimated_duration: "14 minutes",
  },
  {
    task_id: 74,
    title: "Physical_health Task 2",
    description: "Engage in a easy level task to improve your physical health.",
    category: "physical_health",
    difficulty: "easy",
    estimated_duration: "22 minutes",
  },
  {
    task_id: 75,
    title: "Physical_health Task 3",
    description: "Engage in a easy level task to improve your physical health.",
    category: "physical_health",
    difficulty: "easy",
    estimated_duration: "28 minutes",
  },
  {
    task_id: 76,
    title: "Physical_health Task 1",
    description: "Engage in a medium level task to improve your physical health.",
    category: "physical_health",
    difficulty: "medium",
    estimated_duration: "15 minutes",
  },
  {
    task_id: 77,
    title: "Physical_health Task 2",
    description: "Engage in a medium level task to improve your physical health.",
    category: "physical_health",
    difficulty: "medium",
    estimated_duration: "29 minutes",
  },
  {
    task_id: 78,
    title: "Physical_health Task 3",
    description: "Engage in a medium level task to improve your physical health.",
    category: "physical_health",
    difficulty: "medium",
    estimated_duration: "22 minutes",
  },
  {
    task_id: 79,
    title: "Physical_health Task 1",
    description: "Engage in a hard level task to improve your physical health.",
    category: "physical_health",
    difficulty: "hard",
    estimated_duration: "16 minutes",
  },
  {
    task_id: 80,
    title: "Physical_health Task 2",
    description: "Engage in a hard level task to improve your physical health.",
    category: "physical_health",
    difficulty: "hard",
    estimated_duration: "22 minutes",
  },
  {
    task_id: 81,
    title: "Physical_health Task 3",
    description: "Engage in a hard level task to improve your physical health.",
    category: "physical_health",
    difficulty: "hard",
    estimated_duration: "12 minutes",
  },
  {
    task_id: 82,
    title: "Social_influences Task 1",
    description: "Engage in a easy level task to improve your social influences.",
    category: "social_influences",
    difficulty: "easy",
    estimated_duration: "18 minutes",
  },
  {
    task_id: 83,
    title: "Social_influences Task 2",
    description: "Engage in a easy level task to improve your social influences.",
    category: "social_influences",
    difficulty: "easy",
    estimated_duration: "28 minutes",
  },
  {
    task_id: 84,
    title: "Social_influences Task 3",
    description: "Engage in a easy level task to improve your social influences.",
    category: "social_influences",
    difficulty: "easy",
    estimated_duration: "14 minutes",
  },
  {
    task_id: 85,
    title: "Social_influences Task 1",
    description: "Engage in a medium level task to improve your social influences.",
    category: "social_influences",
    difficulty: "medium",
    estimated_duration: "24 minutes",
  },
  {
    task_id: 86,
    title: "Social_influences Task 2",
    description: "Engage in a medium level task to improve your social influences.",
    category: "social_influences",
    difficulty: "medium",
    estimated_duration: "25 minutes",
  },
  {
    task_id: 87,
    title: "Social_influences Task 3",
    description: "Engage in a medium level task to improve your social influences.",
    category: "social_influences",
    difficulty: "medium",
    estimated_duration: "25 minutes",
  },
  {
    task_id: 88,
    title: "Social_influences Task 1",
    description: "Engage in a hard level task to improve your social influences.",
    category: "social_influences",
    difficulty: "hard",
    estimated_duration: "26 minutes",
  },
  {
    task_id: 89,
    title: "Social_influences Task 2",
    description: "Engage in a hard level task to improve your social influences.",
    category: "social_influences",
    difficulty: "hard",
    estimated_duration: "12 minutes",
  },
  {
    task_id: 90,
    title: "Social_influences Task 3",
    description: "Engage in a hard level task to improve your social influences.",
    category: "social_influences",
    difficulty: "hard",
    estimated_duration: "15 minutes",
  }
];

const TaskSelectionScreen: React.FC<Props> = ({ navigation, route }) => {
  const { selectedCategories, recommendations = [], userStruggleText = "" } = route.params || { selectedCategories: ['habits'], recommendations: [], userStruggleText: "" };
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // BACKEND TEAM: I've added the ability for users to provide a free-text description
  //of their struggles or goals. This text should be processed by the AI along with 
  //the assessment answers to generate more personalized task recommendations.
  //
  //Expected API endpoint:
  //POST /api/assessment/{user_id}/struggle
  //Request body: { description: string }
  //Response: { recommendations: TaskRecommendation[] }
  //
  //For now, we're simulating this with predefined tasks, but 
  //but this would use NLP to analyze the text
  //and generate truly personalized recommendations.
  
  //BACKEND TEAM: The app prefers to use backend-provided recommendations but falls back to local data if needed
  const allTasks = recommendations.length > 0 
    ? recommendations 
    : FALLBACK_TASKS.filter(task => selectedCategories.includes(task.category));

  const filteredTasks = allTasks.filter(task => 
    selectedCategories.includes(task.category)
  );
  
  const toggleTask = (taskId: number) => {
    if (selectedTasks.includes(taskId)) {
      setSelectedTasks(selectedTasks.filter(id => id !== taskId));
    } else {
      if (selectedTasks.length < 3) {
        setSelectedTasks([...selectedTasks, taskId]);
      }
    }
  };

  const handleStartJourney = async () => {
    if (selectedTasks.length === 0) return;

    setIsSaving(true);
    setError(null);

    try {
      const selectedTaskDetails = filteredTasks.filter(task => 
        selectedTasks.includes(task.task_id)
      );

      const user_id = 'user_123'; // In future, get this from authentication
      const response = await axios.post(
        'http://localhost:8000/api/tasks/user_123/select',
        {
          user_id,
          task_ids: selectedTasks,
          selected_date: new Date().toISOString().split('T')[0],
          task_details: selectedTaskDetails.map(task => ({
            task_id: task.task_id,
            title: task.title,
            description: task.description,
            category: task.category,
            difficulty: task.difficulty,
            estimated_duration: task.estimated_duration
          }))
        }
      );

      navigation.navigate('Main');
    } catch (err) {
      console.error('Error saving selected tasks:', err);
      setError('Failed to save your selected tasks. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const HeaderComponent = () => (
    <View>
      <Text style={styles.title}>Your Personalized Tasks</Text>
      <Text style={styles.subtitle}>Choose up to 3 tasks to focus on</Text>
      <Text style={styles.selectionCount}>{selectedTasks.length}/3 selected</Text>
    </View>
  );

  const FooterComponent = () => (
    <>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
      {filteredTasks.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No tasks available for the selected categories.</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back and Select Different Categories</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <TouchableOpacity 
        style={[
          styles.button,
          (selectedTasks.length === 0 || isSaving) && styles.buttonDisabled
        ]}
        disabled={selectedTasks.length === 0 || isSaving}
        onPress={handleStartJourney}
      >
        {isSaving ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Start Your Journey</Text>
        )}
      </TouchableOpacity>
    </>
  );

  const renderTaskItem = ({ item: task }: { item: any }) => (
    <TouchableOpacity 
      style={[
        styles.taskCard,
        selectedTasks.includes(task.task_id) && styles.taskCardSelected
      ]}
      onPress={() => toggleTask(task.task_id)}
    >
      <View style={styles.taskHeader}>
        <View style={styles.taskIconContainer}>
          <Text style={styles.taskIcon}>
            {task.category === 'habits' ? '🔄' : 
             task.category === 'emotions' ? '😌' : 
             task.category === 'productivity' ? '⏱️' : 
             task.category === 'discipline' ? '🎯' : 
             task.category === 'mindset' ? '🧠' : '📝'}
          </Text>
        </View>
        <View style={styles.taskCategoryContainer}>
          <Text style={styles.taskCategory}>{task.category}</Text>
        </View>
        {selectedTasks.includes(task.task_id) && (
          <View style={styles.checkmark}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.taskTitle}>{task.title}</Text>
      <Text style={styles.taskDescription}>{task.description}</Text>
      <View style={styles.taskMeta}>
        <Text style={styles.taskDifficulty}>Difficulty: {task.difficulty}</Text>
        <Text style={styles.taskDuration}>Duration: {task.estimated_duration}</Text>
      </View>
    </TouchableOpacity>
  );
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={filteredTasks}
        renderItem={renderTaskItem}
        keyExtractor={(task) => task.task_id.toString()}
        ListHeaderComponent={HeaderComponent}
        ListFooterComponent={FooterComponent}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={true}
        style={styles.scrollView}
      />
    </SafeAreaView>
  );
};

//DONT DELEETE! Fix for web scrolling issues
if (Platform.OS === 'web') {
  const style = document.createElement('style');
  style.textContent = `
    body, html {
      height: 100%;
      overflow: auto;
    }
  `;
  document.head.append(style);
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 40,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  selectionCount: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '500',
    marginBottom: 20,
    textAlign: 'right',
  },
  taskCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
  },
  taskCardSelected: {
    backgroundColor: '#f1f8f1',
    borderColor: '#4CAF50',
  },
  taskHeader: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'center',
  },
  taskIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#e6f7e6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  taskIcon: {
    fontSize: 20,
  },
  taskCategoryContainer: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  taskCategory: {
    fontSize: 12,
    color: '#666',
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  taskMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  taskDifficulty: {
    fontSize: 12,
    color: '#888',
  },
  taskDuration: {
    fontSize: 12,
    color: '#888',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  checkmarkText: {
    color: 'white',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    marginVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  backButtonText: {
    color: '#6200ee',
    fontSize: 16,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default TaskSelectionScreen;