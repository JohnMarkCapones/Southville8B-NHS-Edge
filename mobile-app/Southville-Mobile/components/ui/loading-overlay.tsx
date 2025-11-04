import React from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import { CuteLoading } from './cute-loading';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  variant?: 'default' | 'notification' | 'settings' | 'heart' | 'star';
}

export function LoadingOverlay({ 
  visible, 
  message = 'Loading...', 
  variant = 'heart' 
}: LoadingOverlayProps) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <CuteLoading size={80} color="#1976D2" variant={variant} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100, // Add padding to avoid covering bottom navigation
  },
});
