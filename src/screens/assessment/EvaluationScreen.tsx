import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator, TextInput, Platform, Linking, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { assessmentApi, TaskRecommendation } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import * as Device from 'expo-device';
import { Audio } from 'expo-av';

//BACKEND TEAM: The evaluation screen needs:
//- POST /api/assessment/{user_id}/struggle - To submit user's struggle description
//   Request body: { description: string }
//   Response: { recommendations: TaskRecommendation[] }
//
//- Algorithm to analyze assessment responses and identify weakest areas
//   This should take the numerical scores from the assessment questions and 
//   determine which categories need the most improvement
//
//- Natural Language Processing for analyzing user's text input:
//   The userStruggleText field contains the user's own description of their challenges.
//   This should be processed using NLP to extract keywords, sentiment, and specific concerns
//   that can help personalize the task recommendations
//
//- Mapping between question categories and task categories:
//   Each question is associated with a category (habits, emotions, etc.)
//   The backend should map low scores in these categories to appropriate tasks
//
//- AI-driven personalization:
//   Combine the assessment scores with the text analysis to generate
//   truly personalized task recommendations that address both detected
//   issues and explicitly stated concerns

type RootStackParamList = {
  Evaluation: { answers: { [key: number]: number } };
  TaskSelection: { selectedCategories: string[], recommendations: TaskRecommendation[], userStruggleText?: string };
};

type EvaluationScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Evaluation'>;
type EvaluationScreenRouteProp = RouteProp<RootStackParamList, 'Evaluation'>;

type Props = {
  navigation: EvaluationScreenNavigationProp;
  route: EvaluationScreenRouteProp;
};

interface RecordingStatus {
  isRecording: boolean;
  durationMillis: number;
  uri?: string;
}

const EvaluationScreen: React.FC<Props> = ({ navigation, route }) => {
  const { answers } = route.params || { answers: {} };
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['habits']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<TaskRecommendation[]>([]);
  const [userStruggleText, setUserStruggleText] = useState('');
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>({
    isRecording: false,
    durationMillis: 0,
  });
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState('');
  
  const requestMicrophonePermission = async () => {
    try {
      // First check if we already have permission
      const { status: existingStatus } = await Audio.getPermissionsAsync();
      
      if (existingStatus === 'granted') {
        setHasPermission(true);
        return true;
      }
      
      // If we don't have permission, request it
      const { status } = await Audio.requestPermissionsAsync();
      const granted = status === 'granted';
      setHasPermission(granted);
      
      if (!granted) {
        // If permission was denied, show a more informative message
        Alert.alert(
          'Microphone Access Required',
          'MindFlow needs microphone access to record your voice input. Please enable it in your device settings to use this feature.',
          [
            {
              text: 'Open Settings',
              onPress: () => {
                if (Platform.OS === 'ios') {
                  Linking.openURL('app-settings:');
                } else {
                  Linking.openSettings();
                }
              }
            },
            {
              text: 'Cancel',
              style: 'cancel'
            }
          ]
        );
      }
      
      return granted;
    } catch (error) {
      console.error('Error requesting microphone permission:', error);
      setHasPermission(false);
      return false;
    }
  };

  useEffect(() => {
    // Request permission as soon as the component mounts
    requestMicrophonePermission();
    
    // Set up audio mode
    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
        });
      } catch (error) {
        console.error('Error setting up audio:', error);
      }
    };

    setupAudio();
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, []);
  
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
    //When the screen loads, we try to get task recommendations if we're in connected mode
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const user_id = 'user_123';
        //This is a placeholder - in a real app we might ask the user for this
        const struggleDescription = "I'm having trouble staying consistent with my routines";
        
        const response = await assessmentApi.submitStruggleDescription(user_id, struggleDescription);
        setRecommendations(response.recommendations);
        
        //here we set selected categories based on recommendations
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
  
  //Fallback method to get recommended categories from scores (offline mode)
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

  const startRecording = async () => {
    try {
      setIsProcessing(true);
      
      // Check permission
      if (!hasPermission) {
        const granted = await requestMicrophonePermission();
        if (!granted) return;
      }

      // Start recording
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      setRecordingStatus({
        isRecording: true,
        durationMillis: 0,
      });

      // Start status updates
      newRecording.setOnRecordingStatusUpdate((status) => {
        setRecordingStatus({
          isRecording: status.isRecording,
          durationMillis: status.durationMillis || 0,
        });
      });

    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
      setRecordingStatus({ isRecording: false, durationMillis: 0 });
    } finally {
      setIsProcessing(false);
    }
  };

  const stopRecording = async () => {
    try {
      setIsProcessing(true);
      
      if (!recording) return;

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      if (uri) {
        // Here you would typically send the audio file to a speech-to-text service
        // For example: Google Cloud Speech-to-Text, AWS Transcribe, etc.
        console.log('Recording saved to:', uri);
        
        // For now, we'll show a placeholder message
        Alert.alert(
          'Recording Saved',
          'In a full implementation, this recording would be converted to text using a speech-to-text service.',
          [
            {
              text: 'OK',
              onPress: () => {
                // You could implement the speech-to-text conversion here
                // For example:
                // const text = await convertSpeechToText(uri);
                // setUserStruggleText(prev => prev + " " + text);
              }
            }
          ]
        );
      }

      setRecording(null);
      setRecordingStatus({ isRecording: false, durationMillis: 0 });
    } catch (error) {
      console.error('Error stopping recording:', error);
      Alert.alert('Error', 'Failed to stop recording.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVoiceInput = async () => {
    try {
      if (recordingStatus.isRecording) {
        await stopRecording();
      } else {
        await startRecording();
      }
    } catch (e) {
      console.error('Error handling voice input:', e);
      Alert.alert('Error', 'Error with voice input. Please try again or use text input.');
      setRecordingStatus({ isRecording: false, durationMillis: 0 });
      setIsProcessing(false);
    }
  };

  const formatDuration = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  //UPDATED: Modified to include the struggle text
  const handleContinue = () => {
  // If the user has entered struggle text and we have a connection to the backend
  if (userStruggleText.trim() !== '') {
    //here we would normally call this API, but for now we can comment it out
    //to avoid errors if the backend isn't implemented yet
    /*
    try {
      const user_id = 'user_123'; //In a real app, get this from authentication
      assessmentApi.submitStruggleDescription(user_id, userStruggleText)
        .then(response => {
          //If successful, use the recommendations
          setRecommendations(response.recommendations);
          //Then navigate
          navigation.navigate('TaskSelection', { 
            selectedCategories,
            recommendations: response.recommendations,
            userStruggleText
          });
        })
        .catch(error => {
          console.error('Error submitting struggle text:', error);
          //On error, still navigate but with existing recommendations
          navigation.navigate('TaskSelection', { 
            selectedCategories,
            recommendations,
            userStruggleText
          });
        });
    } catch (error) {
      console.error('Error in API call:', error);
      //Fall back to regular navigation
      navigation.navigate('TaskSelection', { 
        selectedCategories,
        recommendations,
        userStruggleText
      });
    }
    */
  }
  
  //For now, just navigate with the current data
  navigation.navigate('TaskSelection', { 
    selectedCategories,
    recommendations,
    userStruggleText
  });
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

          <View style={styles.textInputSection}>
            <Text style={styles.sectionTitle}>Tell Us More (Optional)</Text>
            <Text style={styles.sectionSubtitle}>
              Describe any specific challenges or goals in your own words
            </Text>
            
            <View style={styles.textInputContainer}>
              <TextInput
                style={styles.textInput}
                multiline
                numberOfLines={4}
                placeholder="For example: I struggle with procrastination and want to be more productive in the mornings..."
                value={userStruggleText}
                onChangeText={setUserStruggleText}
              />
              
              {Platform.OS !== 'web' && (
                <TouchableOpacity
                  style={[
                    styles.micButton,
                    recordingStatus.isRecording && styles.micButtonRecording,
                    !hasPermission && styles.micButtonDisabled,
                    isProcessing && styles.micButtonProcessing
                  ]}
                  onPress={handleVoiceInput}
                  disabled={!hasPermission || isProcessing}
                >
                  {isProcessing ? (
                    <ActivityIndicator color={recordingStatus.isRecording ? "#FFFFFF" : "#6200ee"} />
                  ) : (
                    <Ionicons 
                      name={recordingStatus.isRecording ? "stop-circle" : "mic-outline"} 
                      size={24} 
                      color={recordingStatus.isRecording ? "#FFFFFF" : (!hasPermission ? "#999999" : "#6200ee")} 
                    />
                  )}
                </TouchableOpacity>
              )}
            </View>
            {recordingStatus.isRecording && (
              <View style={styles.recordingContainer}>
                <Text style={styles.recordingText}>
                  Recording... {formatDuration(recordingStatus.durationMillis)}
                </Text>
                <Text style={styles.recordingHint}>
                  Tap the button to stop recording
                </Text>
              </View>
            )}
            {hasPermission === false && (
              <Text style={styles.permissionText}>
                Microphone access is required for voice input. Tap the microphone icon to enable it.
              </Text>
            )}
          </View>
          
          <TouchableOpacity 
            style={styles.button}
            onPress={handleContinue}
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
  textInputSection: {
    marginTop: 30,
    marginBottom: 20,
  },
  textInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 10,
  },
  textInput: {
    flex: 1,
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    textAlignVertical: 'top',
  },
  micButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#6200ee',
  },
  micButtonRecording: {
    backgroundColor: '#6200ee',
  },
  micButtonDisabled: {
    backgroundColor: '#f0f0f0',
    borderColor: '#999999',
    opacity: 0.7,
  },
  micButtonProcessing: {
    opacity: 0.7,
  },
  recordingContainer: {
    marginTop: 8,
    padding: 10,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  recordingText: {
    color: '#FF5722',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 4,
    fontWeight: '500',
  },
  recordingHint: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  permissionText: {
    color: '#FF5722',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default EvaluationScreen;