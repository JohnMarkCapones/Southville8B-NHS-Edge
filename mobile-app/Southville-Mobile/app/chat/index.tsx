import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSectionChat } from "@/hooks/use-section-chat";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useTheme } from "@/contexts/theme-context";
import { Colors } from "@/constants/theme";

export default function SectionChatScreen() {
  const router = useRouter();
  const { user } = useCurrentUser();
  const { isDark } = useTheme();
  const colors = Colors[isDark ? "dark" : "light"];
  const {
    messages,
    sendMessage,
    markAsRead,
    loading,
    error,
    conversationId,
    participantsMap,
  } = useSectionChat({ markAsReadOnMount: true }) as any;

  // Helper to check if sender is a teacher
  const isTeacher = (senderId: string) => {
    const participant = participantsMap?.get(senderId);
    return participant?.role === "teacher" || participant?.role === "admin";
  };
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    null
  );
  const didMarkRead = useRef(false);
  const flatListRef = useRef<FlatList>(null);
  const inputContainerRef = useRef<View>(null);
  const insets = useSafeAreaInsets();
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Responsive padding: reduced padding + safe area insets
  const headerTopPadding = 12 + insets.top;
  const inputBottomPadding = insets.bottom; // Only safe area inset, no extra padding

  // Function to log input area position
  const logInputPosition = (event: string, kbHeight?: number) => {
    if (inputContainerRef.current) {
      inputContainerRef.current.measure((x, y, width, height, pageX, pageY) => {
        const currentKbHeight =
          kbHeight !== undefined ? kbHeight : keyboardHeight;
        console.log(`[Input Position] ${event}:`, {
          x,
          y,
          width,
          height,
          pageX,
          pageY,
          bottom: pageY + height,
          keyboardHeight: currentKbHeight,
          paddingBottom: currentKbHeight > 0 ? 0 : inputBottomPadding,
          insets: {
            top: insets.top,
            bottom: insets.bottom,
            left: insets.left,
            right: insets.right,
          },
        });
      });
    }
  };

  useEffect(() => {
    if (!didMarkRead.current) {
      didMarkRead.current = true;
      markAsRead();
    }
  }, [markAsRead]);

  useEffect(() => {
    if (__DEV__) {
      console.log("[SectionChat] render state:", {
        loading,
        error,
        conversationId,
        messagesCount: messages?.length,
        messages: messages?.slice(0, 3).map((m: any) => ({
          id: m.id,
          content: m.content?.substring(0, 20),
          sender: m.sender_name,
        })),
      });
      if (messages && messages.length > 0) {
        console.log("[SectionChat] First message:", messages[0]);
      }
    }
  }, [loading, error, conversationId, messages]);

  // Log input position on mount
  useEffect(() => {
    setTimeout(() => {
      logInputPosition("Screen Load");
    }, 500); // Small delay to ensure layout is complete
  }, []);

  // Keyboard event listeners
  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        const kbHeight = e.endCoordinates.height;
        setKeyboardHeight(kbHeight);
        // Scroll to end when keyboard opens to keep input visible
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
          // Log position after keyboard opens (use event height directly)
          setTimeout(() => {
            logInputPosition("Keyboard Open", kbHeight);
          }, 200);
        }, 100);
      }
    );

    const hideSubscription = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardHeight(0);
        // Force layout recalculation when keyboard closes
        // This helps ensure KeyboardAvoidingView properly resets
        if (inputContainerRef.current) {
          inputContainerRef.current.setNativeProps({});
        }
        // Ensure layout resets when keyboard closes
        // KeyboardAvoidingView will handle the reset, but we ensure state is cleared
        setTimeout(
          () => {
            // Log position after keyboard closes (wait longer for animation)
            logInputPosition("Keyboard Close", 0);
          },
          Platform.OS === "ios" ? 300 : 150
        );
      }
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages?.length]);

  const handleSend = async () => {
    const content = input.trim();
    if (!content || sending) return;

    setSending(true);
    setSendError(null);

    try {
      await sendMessage(content);
      setInput("");
      setSendError(null);
    } catch (e) {
      const errorMessage =
        e instanceof Error
          ? e.message
          : "Failed to send message. Please try again.";
      setSendError(errorMessage);
      console.warn("[SectionChat] Failed to send message", e);

      // Auto-dismiss error after 5 seconds
      setTimeout(() => {
        setSendError(null);
      }, 5000);
    } finally {
      setSending(false);
    }
  };

  // Clear error when user starts typing
  const handleInputChange = (text: string) => {
    setInput(text);
    if (sendError) {
      setSendError(null);
    }
  };

  const isCurrentUser = (senderId: string) => {
    return senderId === user?.id;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const messageDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );

    if (messageDate.getTime() === today.getTime()) {
      return "Today";
    }
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (messageDate.getTime() === yesterday.getTime()) {
      return "Yesterday";
    }
    return date.toLocaleDateString([], {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const shouldShowDateSeparator = (currentIndex: number) => {
    if (currentIndex === 0) return true;
    const current = new Date(messages[currentIndex].created_at);
    const previous = new Date(messages[currentIndex - 1].created_at);
    const currentDate = new Date(
      current.getFullYear(),
      current.getMonth(),
      current.getDate()
    );
    const previousDate = new Date(
      previous.getFullYear(),
      previous.getMonth(),
      previous.getDate()
    );
    return currentDate.getTime() !== previousDate.getTime();
  };

  const handleMessagePress = (messageId: string) => {
    // Toggle: if same message clicked, hide timestamp; otherwise show for clicked message
    setSelectedMessageId(selectedMessageId === messageId ? null : messageId);
  };

  // Generate theme-aware styles
  const themeStyles = useMemo(() => {
    const borderColor = isDark ? "#4B5563" : "#E5E7EB";
    const lightGray = isDark ? "#374151" : "#F3F4F6";
    const backgroundGray = isDark ? "#1F2937" : "#F9FAFB";
    const textSecondary = isDark ? colors.icon : "#6B7280";
    const textTertiary = isDark ? "#9BA1A6" : "#9CA3AF";
    const textPrimary = colors.text;
    const headerBg = isDark ? "#1E3A8A" : "#2196F5";
    const headerBorder = isDark ? "#1E40AF" : "#1E88E5";
    const inputBorder = isDark ? "#4B5563" : "#E5E7EB";

    return StyleSheet.create({
      safeArea: {
        flex: 1,
        backgroundColor: colors.background,
      },
      container: {
        flex: 1,
        backgroundColor: backgroundGray,
      },
      // Header Styles
      header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingBottom: 16,
        backgroundColor: headerBg,
        borderBottomWidth: 1,
        borderBottomColor: headerBorder,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
      },
      backButton: {
        padding: 8,
        marginLeft: -8,
      },
      headerCenter: {
        flex: 1,
        alignItems: "center",
        marginHorizontal: 16,
      },
      title: {
        fontSize: 18,
        fontWeight: "700",
        color: "#FFFFFF",
        letterSpacing: -0.5,
      },
      subtitle: {
        fontSize: 12,
        color: "#E3F2FD",
        marginTop: 2,
      },
      headerRight: {
        padding: 8,
        marginRight: -8,
      },
      // Message Styles
      messagesList: {
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 20,
      },
      messageContainer: {
        flexDirection: "row",
        marginBottom: 8,
        alignItems: "flex-end",
        paddingHorizontal: 4,
      },
      messageContainerRight: {
        justifyContent: "flex-end",
      },
      avatarContainer: {
        position: "relative",
        marginRight: 8,
        marginBottom: 4,
      },
      avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#2563EB",
        alignItems: "center",
        justifyContent: "center",
      },
      teacherBadge: {
        position: "absolute",
        bottom: -2,
        right: -2,
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: "#F59E0B",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: "#FFFFFF",
      },
      avatarMe: {
        backgroundColor: "#10B981",
        marginRight: 0,
        marginLeft: 8,
      },
      avatarText: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "700",
      },
      messageWrapper: {
        maxWidth: "75%",
        alignItems: "flex-start",
      },
      messageWrapperRight: {
        alignItems: "flex-end",
      },
      senderName: {
        fontSize: 12,
        fontWeight: "600",
        color: textSecondary,
        marginBottom: 4,
        paddingHorizontal: 4,
      },
      senderNameRight: {
        textAlign: "right",
      },
      messageBubble: {
        borderRadius: 18,
        paddingHorizontal: 16,
        paddingVertical: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
      },
      messageBubbleMe: {
        backgroundColor: "#2563EB",
        borderBottomRightRadius: 4,
      },
      messageBubbleOther: {
        backgroundColor: colors.background,
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: borderColor,
      },
      content: {
        fontSize: 15,
        lineHeight: 20,
      },
      contentMe: {
        color: "#FFFFFF",
      },
      contentOther: {
        color: textPrimary,
      },
      time: {
        fontSize: 11,
        color: textTertiary,
        marginTop: 4,
        paddingHorizontal: 4,
      },
      timeRight: {
        textAlign: "right",
      },
      // Date Separator Styles
      dateSeparator: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 16,
        paddingHorizontal: 16,
      },
      dateSeparatorLine: {
        flex: 1,
        height: 1,
        backgroundColor: borderColor,
      },
      dateSeparatorText: {
        fontSize: 12,
        fontWeight: "600",
        color: textSecondary,
        paddingHorizontal: 12,
        backgroundColor: backgroundGray,
      },
      // Loading & Error States
      centerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 32,
      },
      loadingText: {
        marginTop: 16,
        fontSize: 14,
        color: textSecondary,
      },
      errorText: {
        marginTop: 16,
        fontSize: 16,
        fontWeight: "600",
        color: "#EF4444",
        textAlign: "center",
      },
      errorSubtext: {
        marginTop: 8,
        fontSize: 12,
        color: textTertiary,
        textAlign: "center",
      },
      emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 64,
      },
      emptyText: {
        marginTop: 16,
        fontSize: 18,
        fontWeight: "600",
        color: textPrimary,
      },
      emptySubtext: {
        marginTop: 4,
        fontSize: 14,
        color: textTertiary,
      },
      // Input Styles
      inputContainer: {
        backgroundColor: colors.background,
        borderTopWidth: 1,
        borderTopColor: headerBorder,
        paddingTop: 16,
        paddingHorizontal: 16,
      },
      inputWrapper: {
        flexDirection: "row",
        alignItems: "flex-end",
        backgroundColor: lightGray,
        borderRadius: 24,
        paddingHorizontal: 4,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: inputBorder,
      },
      input: {
        flex: 1,
        fontSize: 15,
        color: textPrimary,
        paddingHorizontal: 16,
        paddingVertical: 10,
        maxHeight: 100,
        minHeight: 44,
      },
      sendButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#2563EB",
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 8,
        shadowColor: "#2563EB",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
      },
      sendButtonDisabled: {
        backgroundColor: lightGray,
        shadowOpacity: 0,
        elevation: 0,
      },
      errorContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 8,
        paddingHorizontal: 4,
        gap: 6,
      },
      sendErrorText: {
        fontSize: 12,
        color: "#EF4444",
        flex: 1,
      },
    });
  }, [isDark, colors]);

  const renderItem = ({ item, index }: any) => {
    const isMe = isCurrentUser(item.sender_id);
    const showDateSeparator = shouldShowDateSeparator(index);
    const showTime = selectedMessageId === item.id;

    return (
      <View>
        {showDateSeparator && (
          <View style={themeStyles.dateSeparator}>
            <View style={themeStyles.dateSeparatorLine} />
            <Text style={themeStyles.dateSeparatorText}>
              {formatDate(item.created_at)}
            </Text>
            <View style={themeStyles.dateSeparatorLine} />
          </View>
        )}
        <View
          style={[
            themeStyles.messageContainer,
            isMe && themeStyles.messageContainerRight,
          ]}
        >
          {!isMe && (
            <View style={themeStyles.avatarContainer}>
              <View style={themeStyles.avatar}>
                <Text style={themeStyles.avatarText}>
                  {(item.sender_name || "U")[0].toUpperCase()}
                </Text>
              </View>
              {isTeacher(item.sender_id) && (
                <View style={themeStyles.teacherBadge}>
                  <Ionicons name="school" size={12} color="#FFFFFF" />
                </View>
              )}
            </View>
          )}
          <View
            style={[
              themeStyles.messageWrapper,
              isMe && themeStyles.messageWrapperRight,
            ]}
          >
            <Text
              style={[
                themeStyles.senderName,
                isMe && themeStyles.senderNameRight,
              ]}
            >
              {item.sender_name ||
                (isMe ? user?.full_name || "You" : "Unknown")}
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleMessagePress(item.id)}
              style={[
                themeStyles.messageBubble,
                isMe
                  ? themeStyles.messageBubbleMe
                  : themeStyles.messageBubbleOther,
              ]}
            >
              <Text
                style={[
                  themeStyles.content,
                  isMe ? themeStyles.contentMe : themeStyles.contentOther,
                ]}
              >
                {item.content}
              </Text>
            </TouchableOpacity>
            {showTime && (
              <Text style={[themeStyles.time, isMe && themeStyles.timeRight]}>
                {formatTime(item.created_at)}
              </Text>
            )}
          </View>
          {isMe && (
            <View style={[themeStyles.avatar, themeStyles.avatarMe]}>
              <Text style={themeStyles.avatarText}>
                {(user?.full_name || "U")[0].toUpperCase()}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  // Theme-aware color for empty icon
  const emptyIconColor = isDark ? "#4B5563" : "#D1D5DB";
  const placeholderColor = isDark ? "#9BA1A6" : "#9CA3AF";
  const sendIconColor = input.trim() ? "#FFFFFF" : placeholderColor;

  return (
    <SafeAreaView style={themeStyles.safeArea}>
      <KeyboardAvoidingView
        style={themeStyles.container}
        behavior={Platform.select({ ios: "position", android: "height" })}
        keyboardVerticalOffset={0}
        enabled={true}
      >
        {/* Header */}
        <View style={[themeStyles.header, { paddingTop: headerTopPadding }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={themeStyles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={themeStyles.headerCenter}>
            <Text style={themeStyles.title}>Section Chat</Text>
            <Text style={themeStyles.subtitle}>Group conversation</Text>
          </View>
          <TouchableOpacity style={themeStyles.headerRight}>
            <Ionicons name="ellipsis-vertical" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Messages List */}
        {loading ? (
          <View style={themeStyles.centerContainer}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={themeStyles.loadingText}>Loading messages...</Text>
          </View>
        ) : error ? (
          <View style={themeStyles.centerContainer}>
            <Ionicons name="alert-circle" size={48} color="#EF4444" />
            <Text style={themeStyles.errorText}>Error: {error}</Text>
            <Text style={themeStyles.errorSubtext}>
              Conv: {conversationId || "(none)"}
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(m) => m.id}
            renderItem={renderItem}
            contentContainerStyle={themeStyles.messagesList}
            ListEmptyComponent={
              <View style={themeStyles.emptyContainer}>
                <Ionicons
                  name="chatbubbles-outline"
                  size={64}
                  color={emptyIconColor}
                />
                <Text style={themeStyles.emptyText}>No messages yet</Text>
                <Text style={themeStyles.emptySubtext}>
                  Start the conversation!
                </Text>
              </View>
            }
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            onScrollBeginDrag={() => {
              // Hide timestamp when user starts scrolling
              if (selectedMessageId) {
                setSelectedMessageId(null);
              }
            }}
          />
        )}

        {/* Input Area */}
        <View
          ref={inputContainerRef}
          style={[
            themeStyles.inputContainer,
            {
              paddingBottom: keyboardHeight > 0 ? 0 : inputBottomPadding,
            },
          ]}
          onLayout={() => {
            // Log position whenever layout changes
            if (__DEV__) {
              setTimeout(() => {
                logInputPosition("Layout Change");
              }, 50);
            }
          }}
        >
          <View style={themeStyles.inputWrapper}>
            <TextInput
              value={input}
              onChangeText={handleInputChange}
              placeholder="Type a message..."
              placeholderTextColor={placeholderColor}
              style={themeStyles.input}
              multiline
              maxLength={500}
              editable={!sending}
            />
            <TouchableOpacity
              style={[
                themeStyles.sendButton,
                (!input.trim() || sending) && themeStyles.sendButtonDisabled,
              ]}
              onPress={handleSend}
              disabled={!input.trim() || sending}
              activeOpacity={0.7}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="send" size={20} color={sendIconColor} />
              )}
            </TouchableOpacity>
          </View>
          {sendError && (
            <View style={themeStyles.errorContainer}>
              <Ionicons name="alert-circle" size={16} color="#EF4444" />
              <Text style={themeStyles.sendErrorText}>{sendError}</Text>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
