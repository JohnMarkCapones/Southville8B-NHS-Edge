import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Dimensions,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

interface ChatHeadsProps {
  visible: boolean;
  unreadCount?: number;
}

export function ChatHeads({ visible, unreadCount = 0 }: ChatHeadsProps) {
  const router = useRouter();
  const pan = useRef(new Animated.ValueXY()).current;
  const [isPressed, setIsPressed] = useState(false);

  const getScreen = () => Dimensions.get("window");
  const { width: SCREEN_W_INIT, height: SCREEN_H_INIT } = getScreen();
  const LEFT_MARGIN = 16;
  const RIGHT_MARGIN = 16;
  const TOP_MARGIN = 60; // keep away from status/header
  const BOTTOM_MARGIN = 100; // keep above tab bar / input rows
  const SIZE = 56;

  const getBounds = () => {
    const { width: w, height: h } = getScreen();
    return {
      LEFT_EDGE_X: LEFT_MARGIN,
      RIGHT_EDGE_X: w - SIZE - RIGHT_MARGIN,
      MIN_Y: TOP_MARGIN,
      MAX_Y: h - SIZE - BOTTOM_MARGIN,
    };
  };

  // Initialize at bottom-right by default
  useEffect(() => {
    const { RIGHT_EDGE_X, MAX_Y } = getBounds();
    pan.setValue({ x: RIGHT_EDGE_X, y: MAX_Y });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [SCREEN_W_INIT, SCREEN_H_INIT]);

  const clamp = (value: number, min: number, max: number) =>
    Math.max(min, Math.min(max, value));

  const clampToBounds = (x: number, y: number) => {
    const { LEFT_EDGE_X, RIGHT_EDGE_X, MIN_Y, MAX_Y } = getBounds();
    const clampedY = clamp(y, MIN_Y, MAX_Y);
    // keep within horizontal range too (just to be safe)
    const clampedX = clamp(x, LEFT_EDGE_X, RIGHT_EDGE_X);
    return { x: clampedX, y: clampedY };
  };

  const snapXToNearestEdge = (x: number) => {
    const { LEFT_EDGE_X, RIGHT_EDGE_X } = getBounds();
    const { width: w } = getScreen();
    return x + SIZE / 2 < w / 2 ? LEFT_EDGE_X : RIGHT_EDGE_X;
  };

  const panStartRef = useRef({ x: 0, y: 0, time: 0 });
  const hasMovedRef = useRef(false);

  const handleChatHeadPress = useCallback(() => {
    console.log("[ChatHeads] Chat head clicked");
    console.log("[ChatHeads] Unread count:", unreadCount);
    console.log("[ChatHeads] Navigating to chat screen");
    router.push({ pathname: "/chat" as any });
  }, [router, unreadCount]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (evt, gestureState) => {
          // Track if user has moved significantly (dragging)
          const moved =
            Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
          if (moved) {
            hasMovedRef.current = true;
          }
          return true;
        },
        onPanResponderGrant: (evt) => {
          panStartRef.current = {
            x: evt.nativeEvent.pageX,
            y: evt.nativeEvent.pageY,
            time: Date.now(),
          };
          hasMovedRef.current = false;
          setIsPressed(true);
          pan.setOffset({ x: (pan as any).x._value, y: (pan as any).y._value });
          pan.setValue({ x: 0, y: 0 });
        },
        onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
          useNativeDriver: false,
        }),
        onPanResponderRelease: (evt, gestureState) => {
          setIsPressed(false);
          pan.flattenOffset();

          // Check if it was a tap (not a drag)
          const moveDistance = Math.sqrt(
            gestureState.dx * gestureState.dx +
              gestureState.dy * gestureState.dy
          );
          const timeElapsed = Date.now() - panStartRef.current.time;
          const wasTap =
            !hasMovedRef.current && moveDistance < 10 && timeElapsed < 300;

          if (wasTap) {
            // It was a tap, trigger navigation
            console.log("[ChatHeads] Tap detected in PanResponder");
            handleChatHeadPress();
            return;
          }

          // It was a drag, handle the snap
          const currentX = (pan as any).x._value as number;
          const currentY = (pan as any).y._value as number;

          const clamped = clampToBounds(currentX, currentY);
          const targetX = snapXToNearestEdge(clamped.x);

          Animated.spring(pan, {
            toValue: { x: targetX, y: clamped.y },
            useNativeDriver: false,
            bounciness: 8,
            speed: 12,
          }).start();
        },
      }),
    [pan, handleChatHeadPress]
  );

  // Keep on screen after layout
  const handleLayout = () => {
    const currentX = (pan as any).x._value as number;
    const currentY = (pan as any).y._value as number;
    const clamped = clampToBounds(currentX, currentY);
    if (clamped.x !== currentX || clamped.y !== currentY) {
      pan.setValue(clamped);
    }
  };

  // Handle orientation / size changes
  useEffect(() => {
    const handler = () => {
      const currentX = (pan as any).x._value as number;
      const currentY = (pan as any).y._value as number;
      const clamped = clampToBounds(currentX, currentY);
      const targetX = snapXToNearestEdge(clamped.x);
      pan.setValue({ x: targetX, y: clamped.y });
    };
    const subscription = Dimensions.addEventListener("change", handler);
    return () => {
      if (subscription && typeof (subscription as any).remove === "function") {
        (subscription as any).remove();
      } else {
        // Fallback for older RN types; cast to any to avoid TS error
        (Dimensions as any).removeEventListener?.("change", handler);
      }
    };
  }, [pan]);

  if (!visible) return null;

  const transformStyle = {
    transform: [
      { translateX: pan.x },
      { translateY: pan.y },
      ...(isPressed ? [{ scale: 1.02 }] : []),
    ],
  };

  return (
    <Animated.View
      style={[styles.container, transformStyle]}
      onLayout={handleLayout}
      {...panResponder.panHandlers}
    >
      <Pressable
        onPress={handleChatHeadPress}
        style={({ pressed }) => [styles.bubble, pressed && { opacity: 0.9 }]}
      >
        <Ionicons name="chatbubble-ellipses" size={24} color="#FFFFFF" />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText} numberOfLines={1}>
              {unreadCount > 99 ? "99+" : unreadCount}
            </Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    top: 0,
    zIndex: 999,
  },
  bubble: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2196F5", // soft blue (Tailwind blue-100)
    borderWidth: 1,
    borderColor: "#BFDBFE", // soft blue border (blue-200)
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  icon: {
    fontSize: 24,
    color: "#fff",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 4,
    borderRadius: 10,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
});
