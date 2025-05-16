import React from "react";
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';

interface MoodSliderProps {
    value: number;
    onChange: (value: number) => void;
    minLabel: string;
    midLabel: string;
    maxLabel: string;
}

const MoodSlider: React.FC<MoodSliderProps> = ({
    value,
    onChange,
    minLabel,
    midLabel,
    maxLabel
}) => {
    return (
    <View style={styles.container}>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={6}
        step={1}
        value={value}
        onValueChange={onChange}
        minimumTrackTintColor="#6200ee"
        maximumTrackTintColor="#ddd"
        thumbTintColor="#6200ee"
      />
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{minLabel}</Text>
        <Text style={styles.label}>{midLabel}</Text>
        <Text style={styles.label}>{maxLabel}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginVertical: 30,
    },
    slider: {
        width: '100%',
        height: 40,
    },
    labelContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
    },
    label: {
        fontSize: 16,
        color: '#666',
    },
});

export default MoodSlider;