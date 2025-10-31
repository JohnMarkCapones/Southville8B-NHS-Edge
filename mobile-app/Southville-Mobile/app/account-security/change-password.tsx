import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Stack, useRouter, useRootNavigationState } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/contexts/theme-context';
import { Colors } from '@/constants/theme';
import { changePassword, clearAuthSession } from '@/services/auth';
import { useAuthSession } from '@/hooks/use-auth-session';
import ModalDialog from '@/components/ui/ModalDialog';

export default function ChangePasswordScreen() {
  const { isDark } = useTheme();
  const colors = Colors[isDark ? 'dark' : 'light'];
  const router = useRouter();
  const nav = useRootNavigationState();
  const { signOut } = useAuthSession();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogProps, setDialogProps] = useState<{ variant: 'success'|'error'|'info'; title: string; message?: string; bullets?: string[]; autoDismissMs?: number } | null>(null);

  const validate = (): string | null => {
    if (!currentPassword) return 'Please enter your current password.';
    if (!newPassword) return 'Please enter a new password.';
    if (newPassword.length < 8) return 'New password must be at least 8 characters.';
    if (newPassword === currentPassword) return 'New password must be different from current password.';
    if (confirmPassword !== newPassword) return 'Confirm password does not match the new password.';
    return null;
  };

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

        <View style={styles.content}>
          <View style={[styles.card, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF', borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'transparent', borderWidth: isDark ? 1 : 0 }]}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Current Password</Text>
              <View style={[styles.passwordRow, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6' }]}>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  secureTextEntry={!showCurrent}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Enter current password"
                  placeholderTextColor={colors.icon}
                  autoCapitalize="none"
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
                  style={[styles.input, { color: colors.text }]}
                  secureTextEntry={!showNew}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Enter new password"
                  placeholderTextColor={colors.icon}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowNew(v => !v)}>
                  <Ionicons name={showNew ? 'eye-off-outline' : 'eye-outline'} size={22} color={colors.icon} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Confirm New Password</Text>
              <View style={[styles.passwordRow, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6' }]}>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  secureTextEntry={!showConfirm}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Re-enter new password"
                  placeholderTextColor={colors.icon}
                  autoCapitalize="none"
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
        </View>
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
});


