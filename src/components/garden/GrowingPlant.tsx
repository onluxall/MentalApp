import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';

// Create animated SVG components
const AnimatedPath = Animated.createAnimatedComponent(Path);

interface GrowingPlantProps {
  streak: number;
  maxStreak?: number;
  size?: number;
  animate?: boolean;
}

const GrowingPlant: React.FC<GrowingPlantProps> = ({ 
  streak, 
  maxStreak = 30, 
  size = 300,
  animate = true 
}) => {
  // Animation values
  const [scaleAnim] = useState(new Animated.Value(1));
  const [growthAnim] = useState(new Animated.Value(0));
  const [leavesAnim] = useState(new Animated.Value(0));
  const [flowerAnim] = useState(new Animated.Value(0));
  
  // Derived plant state based on streak
  const growthProgress = Math.min(streak / maxStreak, 1);
  const hasLeaves = streak >= 5;
  const hasBranches = streak >= 10;
  const hasFlowers = streak >= 15;
  const hasFruit = streak >= 20;
  
  // Calculate color based on growth
  const stemColor = hasBranches ? '#3e8e41' : '#4CAF50';
  const leafColor = hasFlowers ? '#81C784' : '#A5D6A7';
  const flowerColor = hasFruit ? '#E91E63' : '#F48FB1';

  // Run animations when streak changes
  useEffect(() => {
    if (animate) {
      // Pulse animation
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
      
      // Growth animation
      Animated.timing(growthAnim, {
        toValue: growthProgress,
        duration: 1000,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();
      
      // Leaves animation
      if (hasLeaves) {
        Animated.timing(leavesAnim, {
          toValue: 1,
          duration: 800,
          delay: 200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }).start();
      }
      
      // Flowers animation
      if (hasFlowers) {
        Animated.timing(flowerAnim, {
          toValue: 1,
          duration: 600,
          delay: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }).start();
      }
    }
  }, [streak, animate]);

  // Interpolate stem height based on growth animation
  const stemHeight = growthAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [size * 0.1, size * 0.7],
  });
  
  // SVG coordinates calculation (based on size)
  const centerX = size / 2;
  const baseY = size * 0.9;
  const stemWidth = size * 0.05;
  
  // Create animated path data for stem
  const stemPath = growthAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      `M${centerX} ${baseY} L${centerX} ${baseY - size * 0.1}`,
      `M${centerX} ${baseY} L${centerX} ${baseY - size * 0.7}`
    ]
  });
  
  // Leaf size and positions based on animation
  const leafSize = leavesAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, size * 0.2],
  });
  
  // Flower size based on animation
  const flowerSize = flowerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, size * 0.15],
  });

  return (
    <Animated.View style={[
      styles.container,
      { 
        width: size, 
        height: size,
        transform: [{ scale: scaleAnim }] 
      }
    ]}>
      <View style={styles.soilContainer}>
        <View style={styles.soil} />
      </View>
      
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Stem - using AnimatedPath instead of Animated.View + Path */}
        <AnimatedPath
          d={stemPath}
          stroke={stemColor}
          strokeWidth={stemWidth}
          strokeLinecap="round"
        />
        
        {/* Left Leaves (only if streak >= 5) */}
        {hasLeaves && (
          <Animated.View style={{ opacity: leavesAnim, transform: [{ scale: leavesAnim }] }}>
            <G>
              <Path
                d={`M${centerX} ${baseY - size * 0.3} 
                   Q${centerX - size * 0.15} ${baseY - size * 0.35} 
                   ${centerX - size * 0.05} ${baseY - size * 0.4}`}
                fill={leafColor}
                stroke="#388E3C"
                strokeWidth={1}
              />
              {hasBranches && (
                <Path
                  d={`M${centerX} ${baseY - size * 0.5} 
                     Q${centerX - size * 0.2} ${baseY - size * 0.5} 
                     ${centerX - size * 0.1} ${baseY - size * 0.55}`}
                  fill={leafColor}
                  stroke="#388E3C"
                  strokeWidth={1}
                />
              )}
            </G>
          </Animated.View>
        )}
        
        {/* Right Leaves (only if streak >= 5) */}
        {hasLeaves && (
          <Animated.View style={{ opacity: leavesAnim, transform: [{ scale: leavesAnim }] }}>
            <G>
              <Path
                d={`M${centerX} ${baseY - size * 0.4} 
                   Q${centerX + size * 0.15} ${baseY - size * 0.45} 
                   ${centerX + size * 0.05} ${baseY - size * 0.5}`}
                fill={leafColor}
                stroke="#388E3C"
                strokeWidth={1}
              />
              {hasBranches && (
                <Path
                  d={`M${centerX} ${baseY - size * 0.6} 
                     Q${centerX + size * 0.2} ${baseY - size * 0.65} 
                     ${centerX + size * 0.1} ${baseY - size * 0.7}`}
                  fill={leafColor}
                  stroke="#388E3C"
                  strokeWidth={1}
                />
              )}
            </G>
          </Animated.View>
        )}
        
        {/* Flowers (only if streak >= 15) */}
        {hasFlowers && (
          <Animated.View style={{ opacity: flowerAnim, transform: [{ scale: flowerAnim }] }}>
            <G>
              <Path
                d={`M${centerX - size * 0.05} ${baseY - size * 0.7} 
                   a${size * 0.07} ${size * 0.07} 0 1 0 ${size * 0.1} 0 
                   a${size * 0.07} ${size * 0.07} 0 1 0 ${-size * 0.1} 0`}
                fill={flowerColor}
                stroke="#C2185B"
                strokeWidth={1}
              />
              {hasFruit && (
                <>
                  <Path
                    d={`M${centerX + size * 0.1} ${baseY - size * 0.5} 
                       a${size * 0.06} ${size * 0.06} 0 1 0 ${size * 0.08} 0 
                       a${size * 0.06} ${size * 0.06} 0 1 0 ${-size * 0.08} 0`}
                    fill="#FF9800"
                    stroke="#EF6C00"
                    strokeWidth={1}
                  />
                  <Path
                    d={`M${centerX - size * 0.15} ${baseY - size * 0.4} 
                       a${size * 0.05} ${size * 0.05} 0 1 0 ${size * 0.07} 0 
                       a${size * 0.05} ${size * 0.05} 0 1 0 ${-size * 0.07} 0`}
                    fill="#FF9800"
                    stroke="#EF6C00"
                    strokeWidth={1}
                  />
                </>
              )}
            </G>
          </Animated.View>
        )}
      </Svg>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  soilContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    alignItems: 'center',
  },
  soil: {
    width: '60%',
    height: 20,
    backgroundColor: '#795548',
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
  },
});

export default GrowingPlant; 