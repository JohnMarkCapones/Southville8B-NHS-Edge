import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

type Variant = 'success' | 'error' | 'info';

export type ModalDialogProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  bullets?: string[];
  variant?: Variant;
  primaryText?: string;
  onPrimary?: () => void;
  secondaryText?: string;
  onSecondary?: () => void;
  autoDismissMs?: number; // e.g., 2000 for success
  allowBackdropClose?: boolean; // tap outside closes
  colors: { background: string; text: string; tint: string; icon: string };
};

export function ModalDialog(props: ModalDialogProps) {
  const {
    visible,
    onClose,
    title,
    message,
    bullets,
    variant = 'info',
    primaryText = 'OK',
    onPrimary,
    secondaryText,
    onSecondary,
    autoDismissMs,
    allowBackdropClose = true,
    colors,
  } = props;

  const scale = useRef(new Animated.Value(0.95)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 140, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 8 }),
      ]).start();

      // Haptics
      const pattern: Record<Variant, () => Promise<void>> = {
        success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
        error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
        info: () => Haptics.selectionAsync(),
      };
      pattern[variant]().catch(() => {});

      if (autoDismissMs && autoDismissMs > 0) {
        timeoutRef.current = setTimeout(() => {
          onClose();
        }, autoDismissMs);
      }
    } else {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      opacity.setValue(0);
      scale.setValue(0.95);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const iconSpec = useMemo(() => {
    switch (variant) {
      case 'success':
        return { name: 'checkmark-circle', color: '#10B981' } as const;
      case 'error':
        return { name: 'close-circle', color: '#EF4444' } as const;
      default:
        return { name: 'information-circle', color: colors.tint } as const;
    }
  }, [variant, colors.tint]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Pressable
        style={[styles.backdrop]}
        onPress={() => { if (allowBackdropClose) onClose(); }}
      >
        <Animated.View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center', opacity }}
        >
          <Animated.View
            style={[styles.card, { backgroundColor: colors.background, transform: [{ scale }] }]}
          >
            <View style={styles.iconRow}>
              <Ionicons name={iconSpec.name as any} size={48} color={iconSpec.color} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            {message ? (
              <Text style={[styles.message, { color: colors.icon }]}>{message}</Text>
            ) : null}
            {bullets && bullets.length > 0 ? (
              <View style={styles.bullets}>
                {bullets.map((b, i) => (
                  <View key={i} style={styles.bulletRow}>
                    <View style={[styles.dot, { backgroundColor: colors.icon }]} />
                    <Text style={[styles.bulletText, { color: colors.text }]}>{b}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            <View style={styles.buttonsRow}>
              {secondaryText ? (
                <Pressable onPress={onSecondary} style={[styles.btn, styles.btnOutline]}
                >
                  <Text style={[styles.btnOutlineText]}>{secondaryText}</Text>
                </Pressable>
              ) : null}
              <Pressable onPress={onPrimary ?? onClose} style={[styles.btn, styles.btnPrimary]}
              >
                <Text style={styles.btnPrimaryText}>{primaryText}</Text>
              </Pressable>
            </View>
          </Animated.View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  card: {
    width: '84%',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  iconRow: { alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 18, fontWeight: '700', textAlign: 'center' },
  message: { fontSize: 14, textAlign: 'center', marginTop: 6 },
  bullets: { marginTop: 10 },
  bulletRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 8 },
  bulletText: { flex: 1, fontSize: 14 },
  buttonsRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16, gap: 10 },
  btn: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 },
  btnPrimary: { backgroundColor: '#2563EB' },
  btnPrimaryText: { color: '#FFFFFF', fontWeight: '600' },
  btnOutline: { borderWidth: 1, borderColor: '#D1D5DB' },
  btnOutlineText: { color: '#111827', fontWeight: '600' },
});

export default ModalDialog;


