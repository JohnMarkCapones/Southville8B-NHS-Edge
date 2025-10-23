import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { APIError } from '@/lib/api-client';
import { login } from '@/services/auth';

export default function LoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const primaryColor = colorScheme === 'dark' ? '#2563EB' : Colors.light.tint;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setErrorMessage('Enter both email and password to continue.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      console.log('[LoginScreen] Attempting login', { email: trimmedEmail });
      await login({ email: trimmedEmail, password });
      console.log('[LoginScreen] Login successful');
      router.replace('/(tabs)');
    } catch (error) {
      console.error('[LoginScreen] Login failed', error);
      if (error instanceof APIError) {
        setErrorMessage(error.message || 'Unable to log in. Check your credentials.');
      } else {
        setErrorMessage('Something went wrong. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={[styles.title, { color: colors.text }]}>Southville Edge</Text>
          <Text style={[styles.subtitle, { color: colors.icon }]}>Log in to access your campus hub</Text>
        </View>

        <View style={styles.formContainer}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor={colors.icon}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            style={[styles.input, { borderColor: colors.icon, color: colors.text }]}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor={colors.icon}
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={handleLogin}
            style={[styles.input, { borderColor: colors.icon, color: colors.text }]}
          />
          <TouchableOpacity
            style={[styles.button, { backgroundColor: primaryColor, opacity: isSubmitting ? 0.7 : 1 }]}
            disabled={isSubmitting}
            onPress={handleLogin}>
            {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Log In</Text>}
          </TouchableOpacity>
          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
        </View>

        <View style={styles.footerContainer}>
          <Text style={[styles.footerText, { color: colors.icon }]}>Forgot your password?</Text>
          <TouchableOpacity>
            <Text style={[styles.linkText, { color: primaryColor }]}>Reset here</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingBottom: 32,
  },
  headerContainer: {
    marginTop: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    lineHeight: 24,
  },
  formContainer: {
    gap: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  footerContainer: {
    alignItems: 'center',
    gap: 8,
  },
  footerText: {
    fontSize: 14,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
  },
});
