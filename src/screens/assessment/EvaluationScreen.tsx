import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { assessmentApi, TaskRecommendation } from '../../services/api';

//BACKEND TEAM: The evaluation screen needs:
//- POST /api/assessment/{user_id}/struggle - To submit user's struggle description
//- Algorithm to analyze assessment responses and identify weakest areas
//- Ability to generate personalized task recommendations
//- Mapping between question categories and task categories

type RootStackParamList = {
  Evaluation: { answers: { [key: number]: number } };
  TaskSelection: { selectedCategories: string[], recommendations: TaskRecommendation[] };
};

type EvaluationScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Evaluation'>;
type EvaluationScreenRouteProp = RouteProp<RootStackParamList, 'Evaluation'>;

type Props = {
  navigation: EvaluationScreenNavigationProp;
  route: EvaluationScreenRouteProp;
};

const EvaluationScreen: React.FC<Props> = ({ navigation, route }) => {
  const { answers } = route.params || { answers: {} };
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['habits']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<TaskRecommendation[]>([]);
  
  const categories = [
    'habits',
    'emotions',
    'productivity',
    'discipline',
    'goal_setting',
    'time_management',
    'mindset',
    'environment',
    'physical_health',
    'social_influences'
  ];
  
  const calculateAverageScore = () => {
    if (Object.keys(answers).length === 0) return 5; 
    
    const total = Object.values(answers).reduce((sum, score) => sum + score, 0);
    return total / Object.keys(answers).length;
  };
  
  const getMotivationState = () => {
    const avgScore = calculateAverageScore();
    
    if (avgScore >= 7) {
      return {
        state: "High Motivation",
        icon: "🚀",
        color: "#4CAF50",
        description: "You're highly motivated! Let's maintain and refine your habits."
      };
    } else if (avgScore >= 4) {
      return {
        state: "Moderate Motivation",
        icon: "⚡",
        color: "#FFC107",
        description: "You have a good foundation to build on. Let's strengthen your motivation."
      };
    } else {
      return {
        state: "Building Motivation",
        icon: "🌱",
        color: "#FF5722",
        description: "Let's start building motivation gradually with small, achievable steps."
      };
    }
  };
  
  const motivationState = getMotivationState();
  
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const user_id = 'user_123';
        const struggleDescription = "I'm having trouble staying consistent with my routines";
        
        const response = await assessmentApi.submitStruggleDescription(user_id, struggleDescription);
        setRecommendations(response.recommendations);
        
        const recommendedCategories = [...new Set(response.recommendations.map(rec => rec.category))];
        if (recommendedCategories.length > 0) {
          setSelectedCategories(recommendedCategories.slice(0, 3));
        }
        
        setLoading(false);
      } catch (err) {
        console.log('Failed to fetch recommendations:', err);
        setLoading(false);
        setError('Could not fetch personalized recommendations. Using offline mode.');
        setRecommendedCategoriesFromScores();
      }
    };
    
    fetchRecommendations();
  }, []);
  
  const setRecommendedCategoriesFromScores = () => {
    const categoryMap: { [key: number]: string } = {
      1: "habits",
      2: "emotions",
      3: "productivity",
      4: "discipline",
      5: "goal_setting",
      6: "time_management",
      7: "mindset",
      8: "environment",
      9: "physical_health",
      10: "social_influences"
    };
    
    const sortedAnswers = Object.entries(answers)
      .sort(([, scoreA], [, scoreB]) => scoreA - scoreB)
      .slice(0, 3); 
 
    const recommended = sortedAnswers.map(([questionId]) => 
      categoryMap[parseInt(questionId)]
    ).filter(Boolean);
    
    setSelectedCategories(recommended);
  };
  
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
          
          {loading ? (
            <ActivityIndicator size="small" color="#6200ee" style={{marginVertical: 20}} />
          ) : (
            <>
              <Text style={styles.sectionSubtitle}>
                {error ? 'Based on your assessment:' : 'Based on your assessment and personalized analysis:'}
              </Text>
              
              <View style={styles.recommendationContainer}>
                {selectedCategories.map(category => (
                  <View key={category} style={styles.recommendationBadge}>
                    <Text style={styles.recommendationText}>{category}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
          
          <Text style={styles.sectionTitle}>Choose Your Focus Areas</Text>
          <Text style={styles.sectionSubtitle}>Select categories for your personalized tasks</Text>
          
          <View style={styles.categoriesContainer}>
            {categories.map(category => (
              <TouchableOpacity 
                key={category}
                style={[
                  styles.categoryButton, 
                  selectedCategories.includes(category) && styles.categorySelected,
                  recommendations.some(r => r.category === category) && styles.categoryRecommended
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
            onPress={() => navigation.navigate('TaskSelection', { 
              selectedCategories,
              recommendations
            })}
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