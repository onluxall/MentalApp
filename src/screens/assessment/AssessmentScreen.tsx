import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import MoodSlider from '../../components/assessment/MoodSlider';
import { assessmentApi, AssessmentQuestion, AssessmentResponse } from '../../services/api';

//BACKEND TEAM: The assessment screen connects to these endpoints:
//- GET /api/assessment/questions - To fetch questions
//- POST /api/assessment/submit - To submit answers
//Ensure these endpoints handle:
//1. Authentication (current user context)
//2. Proper response validation
//3. Error handling with meaningful messages

type RootStackParamList = {
  Assessment: undefined;
  Evaluation: { answers: { [key: number]: number } };
};

type AssessmentScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Assessment'>;

type Props = {
  navigation: AssessmentScreenNavigationProp;
};

//Fallback questions in case backend is not available
const FALLBACK_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 1,
    category: "habits",
    question: "How consistent are you with your daily routines and habits?",
    min_value: 0,
    max_value: 10
  },
  {
    id: 2,
    category: "emotions",
    question: "How well do you manage your emotions during challenging situations?",
    min_value: 0,
    max_value: 10
  },
  {
    id: 3,
    category: "productivity",
    question: "How effectively do you complete tasks within your planned timeframe?",
    min_value: 0,
    max_value: 10
  },
  {
    id: 4,
    category: "discipline",
    question: "How well do you maintain focus and resist distractions?",
    min_value: 0,
    max_value: 10
  },
  {
    id: 5,
    category: "goal_setting",
    question: "How clear and achievable are your current goals?",
    min_value: 0,
    max_value: 10
  },
  {
    id: 6,
    category: "time_management",
    question: "How well do you prioritize and manage your time?",
    min_value: 0,
    max_value: 10
  },
  {
    id: 7,
    category: "mindset",
    question: "How positive and growth-oriented is your mindset?",
    min_value: 0,
    max_value: 10
  },
  {
    id: 8,
    category: "environment",
    question: "How conducive is your environment to maintaining focus and motivation?",
    min_value: 0,
    max_value: 10
  },
  {
    id: 9,
    category: "physical_health",
    question: "How well do you maintain your physical health and energy levels?",
    min_value: 0,
    max_value: 10
  },
  {
    id: 10,
    category: "social_influences",
    question: "How supportive is your social circle in your personal development?",
    min_value: 0,
    max_value: 10
  }
];

const AssessmentScreen: React.FC<Props> = ({ navigation }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);
  
  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const fetchedQuestions = await assessmentApi.getQuestions();
      setQuestions(fetchedQuestions);
      setLoading(false);
      setUsingFallback(false);
    } catch (err) {
      console.log('Using fallback questions due to backend connection issue:', err);
      setQuestions(FALLBACK_QUESTIONS);
      setLoading(false);
      setUsingFallback(true);
      setError('Connected to offline mode. Some features may be limited.');
    }
  };
  
  const currentQuestion = questions[currentQuestionIndex];
  
  const currentAnswer = answers[currentQuestion?.id] !== undefined 
    ? answers[currentQuestion.id] 
    : 3;
  
  const handleSliderChange = (value: number) => {
    if (currentQuestion) {
      setAnswers({
        ...answers,
        [currentQuestion.id]: value
      });
    }
  };
  
  const handleNext = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      const responses: AssessmentResponse[] = Object.entries(answers).map(([questionId, rating]) => ({
        question_id: parseInt(questionId),
        rating
      }));

      if (!usingFallback) {
        try {
          //Submit assessment to backend
          await assessmentApi.submitAssessment({
            user_id: 'user_123', //TODO: Replace with actual user ID
            responses,
            timestamp: new Date().toISOString()
          });
        } catch (err) {
          console.log('Failed to submit to backend:', err);
          //Continue with navigation even if submission fails
        }
      }
      
      //Navigate to evaluation screen regardless of backend status
      navigation.navigate('Evaluation', { answers });
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#6200ee" />
          <Text style={styles.loadingText}>Loading questions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.button}
            onPress={loadQuestions}
          >
            <Text style={styles.buttonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentQuestion) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Motivation Assessment</Text>
        {usingFallback && (
          <View style={styles.offlineBanner}>
            <Text style={styles.offlineText}>Offline Mode</Text>
          </View>
        )}
        <View style={styles.categoryContainer}>
          <Text style={styles.categoryText}>{currentQuestion.category}</Text>
        </View>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progress, 
              { width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }
            ]} 
          />
        </View>
        
        <Text style={styles.questionCount}>
          Question {currentQuestionIndex + 1} of {questions.length}
        </Text>
        
        <Text style={styles.question}>{currentQuestion.question}</Text>
        
        <MoodSlider 
          value={currentAnswer}
          onChange={handleSliderChange}
          minLabel="Not at all"
          midLabel="Sometimes"
          maxLabel="Very often"
        />
        
        <TouchableOpacity 
          style={styles.button}
          onPress={handleNext}
        >
          <Text style={styles.buttonText}>
            {currentQuestionIndex < questions.length - 1 ? "Next Question" : "See Results"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  categoryContainer: {
    backgroundColor: '#e6f7e6',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    alignSelf: 'center',
    marginBottom: 20,
  },
  categoryText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '500',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#eee',
    borderRadius: 3,
    marginBottom: 20,
  },
  progress: {
    height: '100%',
    backgroundColor: '#6200ee',
    borderRadius: 3,
  },
  questionCount: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  question: {
    fontSize: 28,
    fontWeight: '500',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#6200ee',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignSelf: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 20,
  },
  offlineBanner: {
    backgroundColor: '#FFF3CD',
    padding: 8,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFE69C',
  },
  offlineText: {
    color: '#856404',
    textAlign: 'center',
    fontSize: 14,
  },
});

export default AssessmentScreen;