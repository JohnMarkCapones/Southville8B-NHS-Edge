import { Redirect, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuthSession } from "@/hooks/use-auth-session";
import { APIError } from "@/lib/api-client";
import ModalDialog from "@/components/ui/ModalDialog";
import { fetchCurrentUser } from "@/services/user";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const primaryColor = colorScheme === "dark" ? "#2563EB" : Colors.light.tint;
  const { status, signIn } = useAuthSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      "keyboardWillShow",
      () => {
        setIsKeyboardVisible(true);
      }
    );
    const keyboardWillHideListener = Keyboard.addListener(
      "keyboardWillHide",
      () => {
        setIsKeyboardVisible(false);
      }
    );

    return () => {
      keyboardWillShowListener?.remove();
      keyboardWillHideListener?.remove();
    };
  }, []);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleLogin = async () => {
    const trimmedEmail = email.trim();

    // Client-side validation
    if (!trimmedEmail || !password) {
      setErrorMessage("Enter both email and password to continue.");
      return;
    }
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage("Please provide a valid email address");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      console.log("[LoginScreen] Attempting login", { email: trimmedEmail });
      await signIn({ email: trimmedEmail, password });
      console.log("[LoginScreen] Login successful");
      
      // Check if user is a student and needs to accept policy
      try {
        const user = await fetchCurrentUser();
        
        // Check if user is a student
        if (user?.student) {
          // Check if policy has been accepted
          const flagKey = `@minor_policy_accepted_${user.id}`;
          const policyAccepted = await AsyncStorage.getItem(flagKey);
          
          if (!policyAccepted) {
            // First login for student - show policy page
            console.log("[LoginScreen] Redirecting to policy page");
            router.replace("/minor-user-policy");
            return;
          }
        }
        
        // Policy accepted or not a student - go to home
        router.replace("/(tabs)");
      } catch (userError) {
        console.error("[LoginScreen] Error fetching user after login:", userError);
        // If user fetch fails, still navigate to home
        router.replace("/(tabs)");
      }
    } catch (error) {
      console.error("[LoginScreen] Login failed", error);
      if (error instanceof APIError) {
        // Normalize backend error payload
        const data: any = (error as APIError).data;
        let message = error.message;
        if (data && typeof data === "object") {
          if (Array.isArray((data as any).message)) {
            message = (data as any).message.join(", ");
          } else if (typeof (data as any).message === "string") {
            message = (data as any).message;
          }
        }
        setErrorMessage(message || "Unable to log in. Check your credentials.");
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset error when user edits inputs
  useEffect(() => {
    if (errorMessage) {
      setErrorMessage(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, password]);

  if (status === "loading") {
    return (
      <SafeAreaView
        style={[
          styles.safeArea,
          { backgroundColor: colors.background, justifyContent: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={primaryColor} />
      </SafeAreaView>
    );
  }

  if (status === "authenticated") {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={[
            styles.scrollContent,
            isKeyboardVisible
              ? styles.scrollContentKeyboard
              : styles.scrollContentNormal,
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Section */}
          <View style={styles.headerContainer}>
            {/* Help Button */}
            <TouchableOpacity
              style={styles.helpButton}
              onPress={() => router.push("/help-center")}
            >
              <Ionicons name="help-circle-outline" size={24} color="#000000" />
            </TouchableOpacity>

            {/* School Logo */}
            <View style={styles.logoContainer}>
              <Image
                source={require("@/assets/onboarding/logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            {/* Greeting Text */}
            <View style={styles.greetingContainer}>
              <Text style={styles.greetingText}>Hello,</Text>
              <View style={styles.welcomeContainer}>
                <Text style={styles.welcomeText}>Welcome</Text>
                <Text style={styles.backText}> back</Text>
              </View>
              <Text style={styles.instructionText}>
                Please sign-in to continue
              </Text>
            </View>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Ionicons
                name="mail-outline"
                size={20}
                color="#000000"
                style={styles.inputIcon}
              />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor="#999999"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                style={styles.input}
              />
            </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#000000"
                style={styles.inputIcon}
              />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor="#999999"
                secureTextEntry={!showPassword}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                style={styles.input}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color="#000000"
                />
              </TouchableOpacity>
            </View>

          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}

            {/* Forget Password Link */}
            <TouchableOpacity 
              style={styles.forgetPasswordContainer}
              onPress={() => setShowForgotPasswordModal(true)}
            >
              <Text style={styles.forgetPasswordText}>Forget Password?</Text>
            </TouchableOpacity>

          {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, { opacity: isSubmitting ? 0.7 : 1 }]}
              disabled={isSubmitting}
              onPress={handleLogin}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginButtonText}>LOGIN</Text>
              )}
            </TouchableOpacity>

          
          </View>

          {/* Access Level Section */}
          <View style={styles.accessLevelContainer}>
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Access levels available</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.studentContainer}>
              <Ionicons name="person-outline" size={20} color="#2196F3" />
              <Text style={styles.studentText}>Students</Text>
            </View>
          </View>

          {/* Footer Section */}
          <View style={styles.footerContainer}>
            <Text style={styles.termsText}>
              By signing in with an account, you agree to{" "}
              <TouchableOpacity
                onPress={() => router.push("/terms-of-service")}
              >
                <Text style={styles.linkText}>Terms of Service</Text>
              </TouchableOpacity>{" "}
              and{" "}
              <TouchableOpacity onPress={() => router.push("/privacy-policy")}>
                <Text style={styles.linkText}>Privacy Policy</Text>
              </TouchableOpacity>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Forgot Password Modal */}
      <ModalDialog
        visible={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
        title="Forgot Password?"
        message="To reset your password, please contact your adviser or school administrator. They will assist you in recovering your account access."
        variant="info"
        primaryText="Understood"
        onPrimary={() => setShowForgotPasswordModal(false)}
        allowBackdropClose={true}
        colors={colors}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  scrollContentNormal: {
    justifyContent: "space-between",
  },
  scrollContentKeyboard: {
    justifyContent: "flex-start",
    paddingTop: 20,
  },
  fixedContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
    paddingBottom: 20,
  },
  headerContainer: {
    alignItems: "flex-start",
    marginTop: 20,
  },
  helpButton: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    marginTop: 40,
    marginBottom: 20,
    alignItems: "center",
    width: "100%",
  },
  logo: {
    width: 120,
    height: 120,
  },
  greetingContainer: {
    alignItems: "flex-start",
    marginBottom: 20,
  },
  greetingText: {
    fontSize: 38,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 0,
  },
  welcomeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  welcomeText: {
    fontSize: 30,
    fontWeight: "700",
    color: "#2196F3",
  },
  backText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000000",
  },
  instructionText: {
    fontSize: 16,
    color: "#000000",
    textAlign: "left",
  },
  formContainer: {
    gap: 12,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#000000",
  },
  eyeIcon: {
    padding: 4,
  },
  forgetPasswordContainer: {
    alignItems: "flex-end",
    marginTop: -8,
  },
  forgetPasswordText: {
    fontSize: 14,
    color: "#999999",
  },
  loginButton: {
    backgroundColor: "#2196F3",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  accessLevelContainer: {
    alignItems: "center",
    marginVertical: 15,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    width: "100%",
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  dividerText: {
    fontSize: 14,
    color: "#999999",
    marginHorizontal: 16,
  },
  studentContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  studentText: {
    fontSize: 16,
    color: "#2196F3",
    fontWeight: "600",
  },
  footerContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  termsText: {
    fontSize: 12,
    color: "#999999",
    textAlign: "center",
    lineHeight: 18,
  },
  linkText: {
    color: "#2196F3",
    textDecorationLine: "underline",
  },
  errorText: {
    color: "#dc2626",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
});
