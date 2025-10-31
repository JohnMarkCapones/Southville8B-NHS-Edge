import React, { useState } from 'react';
import { TouchableOpacity, View, StyleSheet, Animated } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';

interface AccordionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  isExpanded?: boolean;
  onToggle?: (expanded: boolean) => void;
  colorScheme?: 'light' | 'dark';
}

export function Accordion({ 
  title, 
  subtitle, 
  children, 
  isExpanded: controlledExpanded, 
  onToggle,
  colorScheme = 'light' 
}: AccordionProps) {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const [animationValue] = useState(new Animated.Value(0));
  
  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;
  const colors = Colors[colorScheme];

  const toggleAccordion = () => {
    const newExpanded = !isExpanded;
    
    if (controlledExpanded === undefined) {
      setInternalExpanded(newExpanded);
    }
    
    onToggle?.(newExpanded);
    
    // Animate the rotation of the chevron
    Animated.timing(animationValue, {
      toValue: newExpanded ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const rotateInterpolate = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={[styles.container, { borderColor: colors.icon }]}>
      <TouchableOpacity
        style={[styles.header, { borderColor: colors.icon }]}
        onPress={toggleAccordion}
        activeOpacity={0.7}>
        <View style={styles.headerContent}>
          <ThemedText type="subtitle">{title}</ThemedText>
          {subtitle && (
            <ThemedText type="default" style={styles.subtitle}>{subtitle}</ThemedText>
          )}
        </View>
        <Animated.View
          style={[
            styles.chevron,
            { transform: [{ rotate: rotateInterpolate }] }
          ]}>
          <ThemedText type="default" style={styles.chevronText}>▼</ThemedText>
        </Animated.View>
      </TouchableOpacity>
      
      {isExpanded && (
        <View style={styles.content}>
          {children}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerContent: {
    flex: 1,
    gap: 4,
  },
  subtitle: {
    opacity: 0.7,
    fontSize: 14,
  },
  chevron: {
    marginLeft: 12,
  },
  chevronText: {
    fontSize: 12,
    opacity: 0.6,
  },
  content: {
    padding: 16,
    gap: 12,
  },
});
