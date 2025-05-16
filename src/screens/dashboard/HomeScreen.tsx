import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, TextInput, Modal, ActivityIndicator } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import axios from 'axios';

//BACKEND TEAM: The home screen needs these endpoints:
//- GET /api/tasks/user - To fetch user's current tasks
//- GET /api/progress/streak - To get user's current streak
//- POST /api/tasks/complete/{taskId} - To mark a task as complete
//- GET /api/quotes - (Optional) To fetch motivational quotes

type RootStackParamList = {
  Home: { selectedTasks: number[] };
  Login: undefined;
  TaskDetail: { taskId: number };
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;
type HomeScreenRouteProp = RouteProp<RootStackParamList, 'Home'>;

type Props = {
  navigation: HomeScreenNavigationProp;
  route: HomeScreenRouteProp;
};

//Temporary task data
//BACKEND TEAM: Replace this with API data
const TASK_DETAILS: { [key: number]: any } = {
  1: {
    title: "Morning Routine Builder",
    description: "Create a consistent morning routine to start your day with purpose.",
    icon: "☀️",
    category: "habits"
  },
  2: {
    title: "Evening Wind Down",
    description: "Develop an evening routine to improve sleep and prepare for tomorrow.",
    icon: "🌙",
    category: "habits"
  },
  3: {
    title: "Emotion Journaling",
    description: "Write down three emotions you felt today and their triggers.",
    icon: "📝",
    category: "emotions"
  },
  4: {
    title: "Mindfulness Practice",
    description: "Practice 5 minutes of mindful breathing.",
    icon: "🧘",
    category: "emotions"
  },
  5: {
    title: "Task Batching",
    description: "Group similar tasks together for better efficiency.",
    icon: "📊",
    category: "productivity"
  }
};

//List of motivational quotes. we can expand it
const QUOTES = [
  {
    text: "Motivation is what gets you started. Habit is what keeps you going.",
    author: "Jim Ryun"
  },
  {
    text: "The secret of getting ahead is getting started.",
    author: "Mark Twain"
  },
  {
    text: "Small daily improvements are the key to staggering long-term results.",
    author: "Anonymous"
  }
];

// New types for daily notes
type DailyNote = {
  note_id: number;
  user_id: string;
  message: string;
  created_at: string;
  likes: number;
  category?: string;
  mood?: string;
};

const HomeScreen: React.FC<Props> = ({ navigation, route }) => {
  const { selectedTasks = [1, 3, 5] } = route.params || {}; //Default tasks if none provided
  const [completedTasks, setCompletedTasks] = useState<number[]>([]);
  const [currentStreak, setCurrentStreak] = useState(1);
  const [dailyNote, setDailyNote] = useState<string>('');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [randomNote, setRandomNote] = useState<DailyNote | null>(null);
  const [noteCategory, setNoteCategory] = useState<string>('motivation');
  const [noteMood, setNoteMood] = useState<string>('grateful');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);
  
  //BACKEND TEAM: Implement actual logic to fetch user streak and completed tasks
  useEffect(() => {
    //Simulating data fetch from backend
    //In a real app, you would fetch this data from the backend API
    const fetchUserData = async () => {
      try {
        //Mock data
        setCurrentStreak(1);
        setCompletedTasks([]);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    
    fetchUserData();
  }, []);
  
  //get today's date
  const today = new Date();
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
  const formattedDate = today.toLocaleDateString('en-US', options);
  
  //time-based greeting
  const getGreeting = () => {
    const hour = today.getHours();
    if (hour < 12) return "Good morning!";
    if (hour < 18) return "Good afternoon!";
    return "Good evening!";
  };
  
  //random quote
  const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  
  //here we have to handle task completion
  const toggleTaskCompletion = (taskId: number) => {
    if (completedTasks.includes(taskId)) {
      setCompletedTasks(completedTasks.filter(id => id !== taskId));
    } else {
      setCompletedTasks([...completedTasks, taskId]);
      
      //BACKEND TEAM: Add API call to mark task as completed
      //Example: api.markTaskCompleted(taskId);
    }
  };

  // Fetch random note on component mount
  useEffect(() => {
    fetchRandomNote();
  }, []);

  const fetchRandomNote = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/notes/random', {
        params: {
          user_id: 'user_123', // TODO: Replace with actual user ID
          exclude_own: true
        }
      });
      setRandomNote(response.data);
    } catch (error) {
      console.error('Error fetching random note:', error);
    }
  };

  const handleSubmitNote = async () => {
    if (!dailyNote.trim() || dailyNote.length < 10) {
      setNoteError('Note must be at least 10 characters long');
      return;
    }

    setIsSubmittingNote(true);
    setNoteError(null);

    try {
      await axios.post('http://localhost:8000/api/notes/daily', {
        user_id: 'user_123', // TODO: Replace with actual user ID
        message: dailyNote.trim(),
        category: noteCategory,
        mood: noteMood,
        is_public: true
      });

      setDailyNote('');
      setShowNoteModal(false);
      fetchRandomNote(); // Refresh random note
    } catch (error: any) {
      if (error.response?.status === 400) {
        setNoteError('You can only create one note per day');
      } else {
        setNoteError('Failed to create note. Please try again.');
      }
    } finally {
      setIsSubmittingNote(false);
    }
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.date}>{formattedDate}</Text>
          </View>
          
          {/*Daily streak card*/}
          <View style={styles.streakCard}>
            <Text style={styles.streakTitle}>Your current streak</Text>
            <View style={styles.streakInfo}>
              <Text style={styles.streakCount}>{currentStreak}</Text>
              <Text style={styles.streakLabel}>{currentStreak === 1 ? "day" : "days"}</Text>
            </View>
            <Text style={styles.streakMessage}>Let's keep building your motivation!</Text>
          </View>
          
          <Text style={styles.sectionTitle}>Today's Tasks</Text>
          
          {selectedTasks.length > 0 ? (
            selectedTasks.map((taskId) => {
              const task = TASK_DETAILS[taskId];
              if (!task) return null;
              
              const isCompleted = completedTasks.includes(taskId);
              
              return (
                <TouchableOpacity 
                  key={taskId} 
                  style={[styles.taskCard, isCompleted && styles.taskCardCompleted]}
                  onPress={() => toggleTaskCompletion(taskId)}
                >
                  <View style={styles.taskIconContainer}>
                    <Text style={styles.taskIcon}>{task.icon}</Text>
                  </View>
                  <View style={styles.taskContent}>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    <Text style={styles.taskDescription}>{task.description}</Text>
                    <View style={styles.taskProgress}>
                      <View style={styles.progressBar}>
                        <View 
                          style={[
                            styles.progress, 
                            { width: isCompleted ? '100%' : '0%' }
                          ]} 
                        />
                      </View>
                      <Text style={styles.taskStatus}>
                        {isCompleted ? 'Completed' : 'Not started'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No tasks selected for today.</Text>
              <TouchableOpacity 
                style={styles.button}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.buttonText}>Start Over</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* Daily Note Section */}
          <View style={styles.dailyNoteSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Daily Note</Text>
              <TouchableOpacity 
                style={styles.addNoteButton}
                onPress={() => setShowNoteModal(true)}
              >
                <Text style={styles.addNoteButtonText}>+ Add Note</Text>
              </TouchableOpacity>
            </View>

            {randomNote ? (
              <View style={styles.noteCard}>
                <Text style={styles.noteText}>{randomNote.message}</Text>
                <View style={styles.noteFooter}>
                  <Text style={styles.noteMeta}>
                    {randomNote.category && `#${randomNote.category} `}
                    {randomNote.mood && `#${randomNote.mood}`}
                  </Text>
                  <TouchableOpacity 
                    style={styles.refreshButton}
                    onPress={fetchRandomNote}
                  >
                    <Text style={styles.refreshButtonText}>🔄 New Note</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.emptyNoteCard}>
                <Text style={styles.emptyNoteText}>No notes available yet</Text>
                <TouchableOpacity 
                  style={styles.addNoteButton}
                  onPress={() => setShowNoteModal(true)}
                >
                  <Text style={styles.addNoteButtonText}>Be the first to share!</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.quoteCard}>
            <Text style={styles.quoteText}>
              "{randomQuote.text}"
            </Text>
            <Text style={styles.quoteAuthor}>- {randomQuote.author}</Text>
          </View>

          {/*For demo purposes, a button to go back to start */}
          <TouchableOpacity 
            style={styles.restartButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.restartButtonText}>Restart Demo</Text>
          </TouchableOpacity>

          {/* Note Creation Modal */}
          <Modal
            visible={showNoteModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowNoteModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Share Your Daily Note</Text>
                
                <TextInput
                  style={styles.noteInput}
                  multiline
                  placeholder="What's on your mind today? (min. 10 characters)"
                  value={dailyNote}
                  onChangeText={setDailyNote}
                  maxLength={500}
                />

                <View style={styles.noteOptions}>
                  <View style={styles.optionContainer}>
                    <Text style={styles.optionLabel}>Category:</Text>
                    <View style={styles.categoryButtons}>
                      {['motivation', 'gratitude', 'reflection'].map((cat) => (
                        <TouchableOpacity
                          key={cat}
                          style={[
                            styles.categoryButton,
                            noteCategory === cat && styles.categoryButtonSelected
                          ]}
                          onPress={() => setNoteCategory(cat)}
                        >
                          <Text style={[
                            styles.categoryButtonText,
                            noteCategory === cat && styles.categoryButtonTextSelected
                          ]}>
                            {cat}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.optionContainer}>
                    <Text style={styles.optionLabel}>Mood:</Text>
                    <View style={styles.moodButtons}>
                      {['grateful', 'happy', 'inspired'].map((mood) => (
                        <TouchableOpacity
                          key={mood}
                          style={[
                            styles.moodButton,
                            noteMood === mood && styles.moodButtonSelected
                          ]}
                          onPress={() => setNoteMood(mood)}
                        >
                          <Text style={[
                            styles.moodButtonText,
                            noteMood === mood && styles.moodButtonTextSelected
                          ]}>
                            {mood}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>

                {noteError && (
                  <Text style={styles.errorText}>{noteError}</Text>
                )}

                <View style={styles.modalButtons}>
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={() => setShowNoteModal(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.submitButton,
                      (!dailyNote.trim() || isSubmittingNote) && styles.submitButtonDisabled
                    ]}
                    onPress={handleSubmitNote}
                    disabled={!dailyNote.trim() || isSubmittingNote}
                  >
                    {isSubmittingNote ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text style={styles.submitButtonText}>Share Note</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: '#6200ee',
    padding: 20,
    paddingTop: 60,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  date: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  streakCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    margin: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  streakTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  streakInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  streakCount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  streakLabel: {
    fontSize: 20,
    color: '#666',
    marginLeft: 5,
  },
  streakMessage: {
    fontSize: 14,
    color: '#888',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginLeft: 20,
    marginBottom: 15,
  },
  taskCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  taskCardCompleted: {
    backgroundColor: '#f1f8f1',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  taskIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#e6f7e6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  taskIcon: {
    fontSize: 20,
  },
  taskContent: {
    flex: 1,
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
  taskProgress: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#eee',
    borderRadius: 3,
    marginRight: 10,
  },
  progress: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  taskStatus: {
    fontSize: 12,
    color: '#888',
  },
  quoteCard: {
    backgroundColor: '#e8f5e9',
    borderRadius: 15,
    padding: 20,
    margin: 20,
  },
  quoteText: {
    fontSize: 18,
    fontStyle: 'italic',
    color: '#2E7D32',
    marginBottom: 10,
    lineHeight: 26,
  },
  quoteAuthor: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
  },
  restartButton: {
    backgroundColor: '#ddd',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  restartButtonText: {
    color: '#666',
    fontSize: 16,
  },
  emptyState: {
    padding: 30,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#6200ee',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 25,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  dailyNoteSection: {
    marginTop: 20,
    marginHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  addNoteButton: {
    backgroundColor: '#6200ee',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  addNoteButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  noteCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  noteText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 15,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noteMeta: {
    fontSize: 14,
    color: '#666',
  },
  refreshButton: {
    padding: 8,
  },
  refreshButtonText: {
    color: '#6200ee',
    fontSize: 14,
  },
  emptyNoteCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  emptyNoteText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 500,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  noteInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 20,
    fontSize: 16,
  },
  noteOptions: {
    marginBottom: 20,
  },
  optionContainer: {
    marginBottom: 15,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  categoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  categoryButtonSelected: {
    backgroundColor: '#6200ee',
  },
  categoryButtonText: {
    color: '#666',
  },
  categoryButtonTextSelected: {
    color: 'white',
  },
  moodButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  moodButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  moodButtonSelected: {
    backgroundColor: '#6200ee',
  },
  moodButtonText: {
    color: '#666',
  },
  moodButtonTextSelected: {
    color: 'white',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#6200ee',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginBottom: 15,
    textAlign: 'center',
  },
});

export default HomeScreen;