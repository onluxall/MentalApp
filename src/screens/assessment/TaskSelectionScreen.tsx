import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

type RootStackParamList = {
  TaskSelection: { selectedCategories: string[] };
  Home: undefined;
};

type TaskSelectionScreenNavigationProp = StackNavigationProp<RootStackParamList, 'TaskSelection'>;
type TaskSelectionScreenRouteProp = RouteProp<RootStackParamList, 'TaskSelection'>;

type Props = {
  navigation: TaskSelectionScreenNavigationProp;
  route: TaskSelectionScreenRouteProp;
};

interface Task {
  id: number;
  category: string;
  title: string;
  description: string;
  duration: string;
  icon: string;
}

const TaskSelectionScreen: React.FC<Props> = ({ navigation, route }) => {
  const { selectedCategories } = route.params || { selectedCategories: ['Routine'] };
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);
  
  // Define tasks for each category
  const allTasks: Task[] = [
    {
      id: 1,
      category: 'Routine',
      title: 'Morning Routine Builder',
      description: 'Create a consistent morning routine to start your day with purpose.',
      duration: '15 minutes',
      icon: '☀️'
    },
    {
      id: 2,
      category: 'Routine',
      title: 'Evening Wind Down',
      description: 'Develop an evening routine to improve sleep and prepare for tomorrow.',
      duration: '10 minutes',
      icon: '🌙'
    },
    {
      id: 3,
      category: 'Sleep',
      title: 'Sleep Schedule Setup',
      description: 'Plan consistent sleep and wake times for the week.',
      duration: '5 minutes',
      icon: '😴'
    },
    {
      id: 4,
      category: 'Sleep',
      title: 'Bedtime Prep',
      description: 'Create a pre-sleep routine to improve sleep quality.',
      duration: '10 minutes',
      icon: '🛌'
    },
    {
      id: 5,
      category: 'Fitness',
      title: 'Quick Movement Break',
      description: 'A 5-minute movement session to boost energy and focus.',
      duration: '5 minutes',
      icon: '🏃'
    },
    {
      id: 6,
      category: 'Fitness',
      title: 'Weekly Exercise Plan',
      description: 'Plan your physical activities for the upcoming week.',
      duration: '10 minutes',
      icon: '📅'
    },
    {
      id: 7,
      category: 'Nutrition',
      title: 'Meal Planning',
      description: 'Plan nutritious meals for the next few days.',
      duration: '15 minutes',
      icon: '🥗'
    },
    {
      id: 8,
      category: 'Focus',
      title: 'Distraction-Free Zone',
      description: 'Set up your environment to minimize distractions.',
      duration: '10 minutes',
      icon: '🎯'
    },
    {
      id: 9,
      category: 'Focus',
      title: 'Pomodoro Session',
      description: 'Complete a focused work session with timed breaks.',
      duration: '25 minutes',
      icon: '⏱️'
    },
    {
      id: 10,
      category: 'Planning',
      title: 'Weekly Planning',
      description: 'Plan your week to align with your priorities and goals.',
      duration: '20 minutes',
      icon: '📝'
    },
    {
      id: 11,
      category: 'Planning',
      title: 'Daily Priority Setting',
      description: 'Identify your top 3 priorities for tomorrow.',
      duration: '5 minutes',
      icon: '✅'
    },
    {
      id: 12,
      category: 'Energy',
      title: 'Energy Audit',
      description: 'Track activities that drain and boost your energy.',
      duration: '10 minutes',
      icon: '⚡'
    },
    {
      id: 13,
      category: 'Mindset',
      title: 'Gratitude Practice',
      description: 'Write down three things you are grateful for today.',
      duration: '5 minutes',
      icon: '🙏'
    },
    {
      id: 14,
      category: 'Mindset',
      title: 'Success Visualization',
      description: 'Visualize yourself successfully completing your goals.',
      duration: '10 minutes',
      icon: '🏆'
    }
  ];
  
  // Filter tasks based on selected categories
  const filteredTasks = allTasks.filter(task => 
    selectedCategories.includes(task.category)
  );
  
  // Toggle task selection
  const toggleTask = (taskId: number) => {
    if (selectedTasks.includes(taskId)) {
      setSelectedTasks(selectedTasks.filter(id => id !== taskId));
    } else {
      // Limit to 3 selections max
      if (selectedTasks.length < 3) {
        setSelectedTasks([...selectedTasks, taskId]);
      }
    }
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          <Text style={styles.title}>Your Personalized Tasks</Text>
          <Text style={styles.subtitle}>Choose up to 3 tasks to focus on</Text>
          <Text style={styles.selectionCount}>{selectedTasks.length}/3 selected</Text>
          
          {filteredTasks.map(task => (
            <TouchableOpacity 
              key={task.id}
              style={[
                styles.taskCard,
                selectedTasks.includes(task.id) && styles.taskCardSelected
              ]}
              onPress={() => toggleTask(task.id)}
            >
              <View style={styles.taskHeader}>
                <View style={styles.taskIconContainer}>
                  <Text style={styles.taskIcon}>{task.icon}</Text>
                </View>
                <View style={styles.taskCategoryContainer}>
                  <Text style={styles.taskCategory}>{task.category}</Text>
                </View>
                {selectedTasks.includes(task.id) && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </View>
              
              <Text style={styles.taskTitle}>{task.title}</Text>
              <Text style={styles.taskDescription}>{task.description}</Text>
              <Text style={styles.taskDuration}>Duration: {task.duration}</Text>
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity 
            style={[
              styles.button,
              selectedTasks.length === 0 && styles.buttonDisabled
            ]}
            disabled={selectedTasks.length === 0}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.buttonText}>Start Your Journey</Text>
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
});

export default TaskSelectionScreen;