import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

type RootStackParamList = {
  TaskDetail: { taskId: number };
  Home: undefined;
};

type TaskDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'TaskDetail'>;
type TaskDetailScreenRouteProp = RouteProp<RootStackParamList, 'TaskDetail'>;

type Props = {
  navigation: TaskDetailScreenNavigationProp;
  route: TaskDetailScreenRouteProp;
};

//BACKEND TEAM: Replace with API data
const TASK_DETAILS: { [key: number]: any } = {
  1: {
    title: "Morning Routine Builder",
    description: "Create a consistent morning routine to start your day with purpose.",
    category: "habits",
    icon: "☀️",
    steps: [
      "Wake up at the same time each day",
      "Avoid checking your phone for the first 30 minutes",
      "Drink a glass of water",
      "Do a 5-minute stretching or meditation session",
      "Write down your top 3 priorities for the day"
    ],
    tips: [
      "Start small with just 1-2 elements and build gradually",
      "Be consistent even on weekends if possible",
      "Adjust your routine based on what energizes you most"
    ]
  },
  2: {
    title: "Evening Wind Down",
    description: "Develop an evening routine to improve sleep and prepare for tomorrow.",
    category: "habits",
    icon: "🌙",
    steps: [
      "Set a consistent bedtime",
      "Turn off electronic devices 30 minutes before bed",
      "Write down your top 3 priorities for tomorrow",
      "Practice a relaxation technique",
      "Keep your bedroom cool, dark, and quiet"
    ],
    tips: [
      "Dim the lights an hour before bed to signal to your body it's time to wind down",
      "Keep a notepad by your bed to write down thoughts that might keep you awake",
      "Consider reading a physical book instead of using a screen"
    ]
  },
  3: {
    title: "Emotion Journaling",
    description: "Write down three emotions you felt today and their triggers.",
    category: "emotions",
    icon: "📝",
    steps: [
      "Set aside 10 minutes in a quiet space",
      "Reflect on your day and identify moments when your emotions shifted",
      "Name the emotions you felt in those moments",
      "Write down what triggered each emotion",
      "Note how you responded to each emotion"
    ],
    tips: [
      "Try to be specific about emotions (instead of 'bad', use 'disappointed', 'frustrated', etc.)",
      "Don't judge your emotions - all feelings are valid",
      "Look for patterns over time to better understand your emotional triggers"
    ]
  },
  4: {
    title: "Mindfulness Practice",
    description: "Practice 5 minutes of mindful breathing.",
    category: "emotions",
    icon: "🧘",
    steps: [
      "Find a comfortable seated position",
      "Close your eyes or maintain a soft gaze",
      "Focus your attention on your breath",
      "When your mind wanders, gently bring it back to your breath",
      "Continue for 5 minutes"
    ],
    tips: [
      "Start with just 2 minutes if 5 seems too long",
      "Try counting your breaths (1 on inhale, 2 on exhale, up to 10, then restart)",
      "Be kind to yourself when your mind wanders - it's normal and part of the practice"
    ]
  },
  5: {
    title: "Task Batching",
    description: "Group similar tasks together for better efficiency.",
    category: "productivity",
    icon: "📊",
    steps: [
      "List all your tasks for the day/week",
      "Group tasks that require similar energy, tools, or mental state",
      "Assign specific time blocks for each batch",
      "Eliminate distractions during each batch",
      "Take a short break between batches"
    ],
    tips: [
      "Try batching emails, calls, or creative work",
      "Consider your energy levels when scheduling batches",
      "Start with 30-60 minute batches and adjust based on your focus span"
    ]
  }
};

const TaskDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { taskId } = route.params;
  const [completed, setCompleted] = useState(false);

  const task = TASK_DETAILS[taskId];
  
  if (!task) {
    navigation.goBack();
    return null;
  }
  
  const handleComplete = () => {
    setCompleted(true);
    
    //BACKEND TEAM: Add API call to mark task as completed
    //Example: api.markTaskCompleted(taskId);
    
    //here we go back to home after a short delay
    setTimeout(() => {
      navigation.goBack();
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>{task.icon}</Text>
            </View>
            <Text style={styles.title}>{task.title}</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{task.category}</Text>
            </View>
          </View>
          
          <Text style={styles.description}>{task.description}</Text>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Steps</Text>
            {task.steps.map((step: string, index: number) => (
              <View key={index} style={styles.stepItem}>
                <Text style={styles.stepNumber}>{index + 1}</Text>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tips</Text>
            {task.tips.map((tip: string, index: number) => (
              <View key={index} style={styles.tipItem}>
                <Text style={styles.tipIcon}>💡</Text>
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
          
          <TouchableOpacity 
            style={[styles.completeButton, completed && styles.completedButton]}
            onPress={handleComplete}
            disabled={completed}
          >
            <Text style={styles.completeButtonText}>
              {completed ? "Completed! ✓" : "Mark as Complete"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  backButton: {
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: '#6200ee',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#e6f7e6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  icon: {
    fontSize: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  categoryBadge: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 15,
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 30,
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6200ee',
    color: 'white',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: 'bold',
    marginRight: 10,
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'flex-start',
  },
  tipIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  tipText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
  },
  completeButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  completedButton: {
    backgroundColor: '#81C784',
  },
  completeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default TaskDetailScreen;