import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import MoodSlider from '../../components/assessment/MoodSlider';

type RootStackParamList = {
  Assessment: undefined;
  Evaluation: { answers: { [key: number]: number } };
};

type AssessmentScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Assessment'>;

type Props = {
  navigation: AssessmentScreenNavigationProp;
};

interface Question {
  id: number;
  category: string;
  question: string;
}

const AssessmentScreen: React.FC<Props> = ({ navigation }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  
  const questions: Question[] = [
    { id: 1, category: "Routine", question: "How consistent are you with your daily routine?" },
    { id: 2, category: "Sleep", question: "How well do you maintain a consistent sleep schedule?" },
    { id: 3, category: "Fitness", question: "How consistent are you with physical exercise?" },
    { id: 4, category: "Nutrition", question: "How often do you eat nutritious meals?" },
    { id: 5, category: "Focus", question: "How often do you get distracted from tasks?" },
    { id: 6, category: "Planning", question: "How consistently do you plan your day or week?" },
    { id: 7, category: "Procrastination", question: "How often do you procrastinate important tasks?" },
    { id: 8, category: "Energy", question: "How often do you feel energized to work on your goals?" },
    { id: 9, category: "Mindset", question: "How often do you feel positive and resilient?" },
    { id: 10, category: "Discipline", question: "How disciplined do you feel on an average day?" }
  ];
  
  const currentQuestion = questions[currentQuestionIndex];
  
  const currentAnswer = answers[currentQuestion.id] !== undefined 
    ? answers[currentQuestion.id] 
    : 3;
  
  const handleSliderChange = (value: number) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: value
    });
  };
  
  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      navigation.navigate('Evaluation', { answers });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Motivation Assessment</Text>
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
});

export default AssessmentScreen;