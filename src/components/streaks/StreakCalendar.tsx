import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type DayStatus = 'completed' | 'restDay' | 'future' | 'today';

type CalendarDay = {
  date: Date;
  status: DayStatus;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  currentStreak: number;
  completedDays: Date[];
};

const BREAK_EMOJIS = ['💪', '🌱', '🧘', '🌈', '🌟', '✨', '🔆', '😊', '🌻', '🌞', '⚡', '🚀', '💯'];

const StreakCalendar: React.FC<Props> = ({ visible, onClose, currentStreak, completedDays }) => {
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  
  useEffect(() => {
    generateCalendarData();
  }, [visible, completedDays]);
  
  const generateCalendarData = () => {
    const today = new Date();
    const dayMs = 24 * 60 * 60 * 1000; 
    
    const days: CalendarDay[] = [];
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today.getTime() - (i * dayMs));
      
      const isCompleted = completedDays.some(completedDate => 
        completedDate.toDateString() === date.toDateString()
      );
      
      let status: DayStatus;
      if (date.toDateString() === today.toDateString()) {
        status = 'today';
      } else if (isCompleted) {
        status = 'completed';
      } else if (date < today) {
        status = 'restDay';
      } else {
        status = 'future';
      }
      
      days.push({ date, status });
    }
    
    setCalendarDays(days);
  };
  
  const getRandomBreakEmoji = () => {
    return BREAK_EMOJIS[Math.floor(Math.random() * BREAK_EMOJIS.length)];
  };
  
  const formatDate = (date: Date) => {
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    return `${day} ${month}`;
  };
  
  const renderDayStatus = (day: CalendarDay) => {
    if (day.status === 'completed') {
      return (
        <View style={[styles.statusIcon, styles.completedIcon]}>
          <Ionicons name="checkmark" size={16} color="#fff" />
        </View>
      );
    } else if (day.status === 'restDay') {
      return (
        <View style={[styles.statusIcon, styles.restDayIcon]}>
          <Text>{getRandomBreakEmoji()}</Text>
        </View>
      );
    } else if (day.status === 'today') {
      return (
        <View style={[styles.statusIcon, styles.todayIcon]}>
          <Text style={styles.todayText}>Today</Text>
        </View>
      );
    } else {
      return <View style={styles.statusIcon} />;
    }
  };
  
  if (!visible) return null;
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.calendarContainer}>
          <View style={styles.calendarHeader}>
            <Text style={styles.headerTitle}>Your Streak Calendar</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.streakInfo}>
            <Text style={styles.streakText}>
              Current Streak: <Text style={styles.streakCount}>{currentStreak} days</Text>
            </Text>
          </View>
          
          <View style={styles.calendarGrid}>
            {calendarDays.map((day, index) => (
              <View key={index} style={styles.dayItem}>
                <Text style={styles.dayDate}>{formatDate(day.date)}</Text>
                {renderDayStatus(day)}
              </View>
            ))}
          </View>
          
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendIcon, styles.completedIcon]}>
                <Ionicons name="checkmark" size={12} color="#fff" />
              </View>
              <Text style={styles.legendText}>Completed</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendIcon, styles.restDayIcon]}>
                <Text style={{fontSize: 12}}>✨</Text>
              </View>
              <Text style={styles.legendText}>Rest Day</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.doneButton} onPress={onClose}>
            <Text style={styles.doneButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  calendarContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    width: '90%',
    maxHeight: '80%',
    padding: 20,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  streakInfo: {
    backgroundColor: '#f0f4ff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  streakText: {
    fontSize: 16,
    color: '#333',
  },
  streakCount: {
    fontWeight: 'bold',
    color: '#4285F4',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dayItem: {
    width: '19%',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  dayDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  statusIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eee',
  },
  completedIcon: {
    backgroundColor: '#4CAF50',
  },
  restDayIcon: {
    backgroundColor: '#FFF9C4',
  },
  todayIcon: {
    backgroundColor: '#2196F3',
  },
  todayText: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  legendIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  doneButton: {
    backgroundColor: '#6200ee',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  doneButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default StreakCalendar; 