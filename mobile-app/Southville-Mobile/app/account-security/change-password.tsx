import { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, AppState, ScrollView, Keyboard, Platform, KeyboardAvoidingView } from 'react-native';
import { Stack, useRouter, useRootNavigationState } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useTheme } from '@/contexts/theme-context';
import { Colors } from '@/constants/theme';
import { changePassword, clearAuthSession } from '@/services/auth';
import { useAuthSession } from '@/hooks/use-auth-session';
import { useCurrentUser } from '@/hooks/use-current-user';
// eslint-disable-next-line import/no-named-as-default
import ModalDialog from '@/components/ui/ModalDialog';

// Helper component for requirement items
function RequirementItem({ met, text, colors }: { met: boolean; text: string; colors: any }) {
  return (
    <View style={styles.requirementRow}>
      <Ionicons 
        name={met ? 'checkmark-circle' : 'ellipse-outline'} 
        size={16} 
        color={met ? '#10B981' : colors.icon} 
      />
      <Text style={[styles.requirementText, { 
        color: met ? '#10B981' : colors.icon 
      }]}>
        {text}
      </Text>
    </View>
  );
}

export default function ChangePasswordScreen() {
  const { isDark } = useTheme();
  const colors = Colors[isDark ? 'dark' : 'light'];
  const router = useRouter();
  const nav = useRootNavigationState();
  const { signOut } = useAuthSession();
  const { user } = useCurrentUser();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogProps, setDialogProps] = useState<{ variant: 'success'|'error'|'info'; title: string; message?: string; bullets?: string[]; autoDismissMs?: number } | null>(null);
  const appStateRef = useRef(AppState.currentState);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const currentPasswordInputRef = useRef<TextInput>(null);
  const newPasswordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);
  const focusedInputRef = useRef<TextInput | null>(null);

  // Handle app state changes to reset modal state when app resumes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active' && appStateRef.current === 'background') {
        // App resumed from background - reset dialog to prevent invisible overlay
        console.log('[ChangePasswordScreen] App resumed from background - resetting dialog');
        setDialogVisible(false);
      }
      appStateRef.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Handle keyboard visibility
  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        console.log('[ChangePassword] Keyboard showing');
        setIsKeyboardVisible(true);
        // Restore focus to the input that was focused before keyboard appeared
        // Use a small delay to ensure the keyboard is fully shown
        setTimeout(() => {
          if (focusedInputRef.current) {
            focusedInputRef.current.focus();
          }
        }, 100);
      }
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        console.log('[ChangePassword] Keyboard hiding');
        setIsKeyboardVisible(false);
        focusedInputRef.current = null;
      }
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long.');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter (A-Z).');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter (a-z).');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number (0-9).');
    }
    if (!/[!@#$%^&]/.test(password)) {
      errors.push('Password must contain at least one special character (!@#$%^&).');
    }
    
    return { valid: errors.length === 0, errors };
  };

  const validate = (): string | null => {
    if (!currentPassword) return 'Please enter your current password.';
    if (!newPassword) return 'Please enter a new password.';
    
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return passwordValidation.errors[0];
    }
    
    if (newPassword === currentPassword) return 'New password must be different from current password.';
    if (confirmPassword !== newPassword) return 'Confirm password does not match the new password.';
    return null;
  };

  // Render form content (shared between ScrollView and View)
  const renderFormContent = () => (
    <View style={[styles.card, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'transparent', borderWidth: isDark ? 1 : 0 }]}>
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Current Password</Text>
        <View style={[styles.passwordRow, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6' }]}>
          <TextInput
            ref={currentPasswordInputRef}
            style={[styles.input, { color: colors.text }]}
            secureTextEntry={!showCurrent}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Enter current password"
            placeholderTextColor={colors.icon}
            autoCapitalize="none"
            onFocus={() => {
              focusedInputRef.current = currentPasswordInputRef.current;
            }}
            blurOnSubmit={false}
          />
          <TouchableOpacity onPress={() => setShowCurrent(v => !v)}>
            <Ionicons name={showCurrent ? 'eye-off-outline' : 'eye-outline'} size={22} color={colors.icon} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>New Password</Text>
        <View style={[styles.passwordRow, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6' }]}>
          <TextInput
            ref={newPasswordInputRef}
            style={[styles.input, { color: colors.text }]}
            secureTextEntry={!showNew}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Enter new password"
            placeholderTextColor={colors.icon}
            autoCapitalize="none"
            onFocus={() => {
              focusedInputRef.current = newPasswordInputRef.current;
            }}
            blurOnSubmit={false}
          />
          <TouchableOpacity onPress={() => setShowNew(v => !v)}>
            <Ionicons name={showNew ? 'eye-off-outline' : 'eye-outline'} size={22} color={colors.icon} />
          </TouchableOpacity>
        </View>
        
        {/* Password Requirements */}
        {newPassword.length > 0 && (
          <View style={[styles.requirementsContainer, { 
            backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F9FAFB',
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB'
          }]}>
            <Text style={[styles.requirementsTitle, { color: colors.text }]}>Password Requirements:</Text>
            <RequirementItem 
              met={newPassword.length >= 8}
              text="At least 8 characters"
              colors={colors}
            />
            <RequirementItem 
              met={/[A-Z]/.test(newPassword)}
              text="Include uppercase letter (A-Z)"
              colors={colors}
            />
            <RequirementItem 
              met={/[a-z]/.test(newPassword)}
              text="Include lowercase letter (a-z)"
              colors={colors}
            />
            <RequirementItem 
              met={/[0-9]/.test(newPassword)}
              text="Include number (0-9)"
              colors={colors}
            />
            <RequirementItem 
              met={/[!@#$%^&]/.test(newPassword)}
              text="Include special character (!@#$%^&)"
              colors={colors}
            />
          </View>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Confirm New Password</Text>
        <View style={[styles.passwordRow, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6' }]}>
          <TextInput
            ref={confirmPasswordInputRef}
            style={[styles.input, { color: colors.text }]}
            secureTextEntry={!showConfirm}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Re-enter new password"
            placeholderTextColor={colors.icon}
            autoCapitalize="none"
            onFocus={() => {
              focusedInputRef.current = confirmPasswordInputRef.current;
            }}
            blurOnSubmit={false}
          />
          <TouchableOpacity onPress={() => setShowConfirm(v => !v)}>
            <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={22} color={colors.icon} />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.submitButton,
          { backgroundColor: loading ? '#9CA3AF' : (isDark ? '#374151' : colors.tint) }
        ]}
        onPress={onSubmit}
        disabled={loading}
      >
        <Text style={[styles.submitText, { color: '#FFFFFF' }]}>{loading ? 'Please wait…' : 'Change Password'}</Text>
      </TouchableOpacity>
    </View>
  );

  const onSubmit = async () => {
    const err = validate();
    if (err) {
      setDialogProps({ variant: 'error', title: 'Invalid input', message: err });
      setDialogVisible(true);
      return;
    }

    try {
      setLoading(true);
      const resp = await changePassword({ currentPassword, newPassword });
      
      // Set the password change prompt flag when password is successfully changed
      // This prevents the prompt from showing again on next login
      if (user?.id) {
        const flagKey = `@password_change_prompt_shown_${user.id}`;
        await AsyncStorage.setItem(flagKey, 'true');
      }
      
      setDialogProps({
        variant: 'success',
        title: 'Password changed',
        message: resp?.message || 'Your password was updated successfully. For security, please log in again.',
      });
      setDialogVisible(true);
    } catch (e: any) {
      const status = e?.status as number | undefined;
      if (status === 401) {
        setDialogProps({ variant: 'error', title: 'Incorrect current password', message: 'Please check your current password.', bullets: ['Check Caps Lock', 'Try typing slowly to avoid typos'] });
      } else if (status === 404) {
        setDialogProps({ variant: 'error', title: 'User not found', message: 'Your account could not be found.' });
      } else {
        setDialogProps({ variant: 'error', title: 'Error', message: e?.message ?? 'Unable to change password. Please try again.' });
      }
      setDialogVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, {
          backgroundColor: colors.background,
          borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'transparent'
        }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.tint} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Change Password</Text>
          <View style={styles.placeholder} />
        </View>

        <KeyboardAvoidingView
          style={styles.content}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={true}
            scrollEnabled={true}
            keyboardDismissMode="on-drag"
            nestedScrollEnabled={true}
          >
            {renderFormContent()}
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
      <ModalDialog
        visible={dialogVisible}
        onClose={() => setDialogVisible(false)}
        title={dialogProps?.title ?? ''}
        message={dialogProps?.message}
        bullets={dialogProps?.bullets}
        variant={dialogProps?.variant}
        primaryText={dialogProps?.variant === 'success' ? 'Logout now' : 'OK'}
        onPrimary={async () => {
          if (dialogProps?.variant === 'success') {
            await clearAuthSession();
            signOut();
            setDialogVisible(false);
            if (nav?.key) {
              router.replace('/login');
            }
          } else {
            setDialogVisible(false);
          }
        }}
        allowBackdropClose={dialogProps?.variant !== 'success'}
        autoDismissMs={dialogProps?.autoDismissMs}
        colors={colors}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  placeholder: { width: 40 },
  content: { flex: 1, padding: 20 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  card: {
    borderRadius: 16,
    padding: 16,
  },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, marginBottom: 8, fontWeight: '600' },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  input: { flex: 1, paddingVertical: 12, fontSize: 16 },
  submitButton: {
    marginTop: 8,
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 14,
  },
  submitText: { color: '#FFFFFF', fontWeight: '600', fontSize: 16 },
  requirementsContainer: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  requirementsTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  requirementText: {
    fontSize: 12,
    marginLeft: 8,
  },
});


