import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

type RootStackParamList = {
  Evaluation: { answers: { [key: number]: number } };
  TaskSelection: { selectedCategories: string[] };
};

type EvaluationScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Evaluation'>;
type EvaluationScreenRouteProp = RouteProp<RootStackParamList, 'Evaluation'>;

type Props = {
  navigation: EvaluationScreenNavigationProp;
  route: EvaluationScreenRouteProp;
};

const EvaluationScreen: React.FC<Props> = ({ navigation, route }) => {
  const { answers } = route.params || { answers: {} };
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Routine']);

  const categories = [
    'Routine',
    'Sleep',
    'Fitness',
    'Nutrition',
    'Focus',
    'Planning',
    'Energy',
    'Mindset'
  ];

  const calculateAverageScore = () => {
    if (Object.keys(answers).length === 0) return 3; 
    
    const total = Object.values(answers).reduce((sum, score) => sum + score, 0);
    return total / Object.keys(answers).length;
  };
  
  const getMotivationState = () => {
    const avgScore = calculateAverageScore();
    
    if (avgScore >= 5) {
      return {
        state: "High Motivation",
        icon: "🚀",
        color: "#4CAF50",
        description: "You're highly motivated! Let's maintain and refine your habits."
      };
    } else if (avgScore >= 3) {
      return {
        state: "Moderate Motivation",
        icon: "⚡",
        color: "#FFC107",
        description: "You have a good foundation to build on. Let's strengthen your motivation."
      };
    } else {
      return {
        state: "Low Motivation",
        icon: "🌱",
        color: "#FF5722",
        description: "Let's start building motivation gradually with small, achievable steps."
      };
    }
  };
  
  const motivationState = getMotivationState();

  const getAreasForImprovement = () => {
    const categoryMap: { [key: number]: string } = {
      1: "Routine",
      2: "Sleep",
      3: "Fitness",
      4: "Nutrition",
      5: "Focus",
      6: "Planning",
      7: "Procrastination",
      8: "Energy",
      9: "Mindset",
      10: "Discipline"
    };
    
    const sortedAnswers = Object.entries(answers)
      .sort(([, scoreA], [, scoreB]) => scoreA - scoreB)
      .slice(0, 3); 
    
    return sortedAnswers.map(([questionId]) => categoryMap[parseInt(questionId)]);
  };
  
  const recommendedFocusAreas = getAreasForImprovement();
  
  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          <Text style={styles.title}>Your Motivation Profile</Text>
          
          <View style={[styles.resultCard, { borderColor: motivationState.color }]}>
            <View style={[styles.iconContainer, { backgroundColor: `${motivationState.color}20` }]}>
              <Text style={styles.icon}>{motivationState.icon}</Text>
            </View>
            <Text style={[styles.resultTitle, { color: motivationState.color }]}>
              {motivationState.state}
            </Text>
            <Text style={styles.resultDescription}>
              {motivationState.description}
            </Text>
          </View>
          
          <Text style={styles.sectionTitle}>Recommended Focus Areas</Text>
          <Text style={styles.sectionSubtitle}>Based on your assessment, we recommend focusing on:</Text>
          
          <View style={styles.recommendationContainer}>
            {recommendedFocusAreas.map(area => (
              <View key={area} style={styles.recommendationBadge}>
                <Text style={styles.recommendationText}>{area}</Text>
              </View>
            ))}
          </View>
          
          <Text style={styles.sectionTitle}>Choose Your Focus Areas</Text>
          <Text style={styles.sectionSubtitle}>Select categories for your personalized tasks</Text>
          
          <View style={styles.categoriesContainer}>
            {categories.map(category => (
              <TouchableOpacity 
                key={category}
                style={[
                  styles.categoryButton, 
                  selectedCategories.includes(category) && styles.categorySelected,
                  recommendedFocusAreas.includes(category) && styles.categoryRecommended
                ]}
                onPress={() => toggleCategory(category)}
              >
                <Text 
                  style={[
                    styles.categoryText,
                    selectedCategories.includes(category) && styles.categoryTextSelected
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.navigate('TaskSelection', { selectedCategories })}
          >
            <Text style={styles.buttonText}>Continue</Text>
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
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  resultCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    borderLeftWidth: 4,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  icon: {
    fontSize: 24,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 20,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 15,
  },
  recommendationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  recommendationBadge: {
    backgroundColor: '#e6f7e6',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  recommendationText: {
    color: '#4CAF50',
    fontWeight: '500',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 30,
  },
  categoryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 10,
    marginBottom: 10,
  },
  categorySelected: {
    backgroundColor: '#e6f7e6',
    borderColor: '#4CAF50',
  },
  categoryRecommended: {
    borderColor: '#FFC107',
    borderStyle: 'dashed',
  },
  categoryText: {
    fontSize: 16,
    color: '#666',
  },
  categoryTextSelected: {
    color: '#4CAF50',
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#6200ee',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default EvaluationScreen;