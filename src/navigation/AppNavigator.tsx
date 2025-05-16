import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from '../screens/onboarding/LoginScreen';
import AssessmentScreen from '../screens/assessment/AssessmentScreen';
import EvaluationScreen from '../screens/assessment/EvaluationScreen';
import TaskSelectionScreen from '../screens/assessment/TaskSelectionScreen';
import HomeScreen from '../screens/dashboard/HomeScreen';
import TaskDetailScreen from '../screens/tasks/TaskDetail';

type RootStackParamList = {
  Login: undefined;
  Assessment: undefined;
  Evaluation: { answers: { [key: number]: number } };
  TaskSelection: { selectedCategories: string[] };
  Home: undefined;
  TaskDetail: { taskId: number };
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Assessment" component={AssessmentScreen} />
        <Stack.Screen name="Evaluation" component={EvaluationScreen} />
        <Stack.Screen name="TaskSelection" component={TaskSelectionScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;