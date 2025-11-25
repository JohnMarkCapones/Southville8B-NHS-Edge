import React from "react";
import {
  View,
  StyleSheet,
  Image,
  ActivityIndicator,
  ImageSourcePropType,
} from "react-native";

interface CuteLoadingProps {
  size?: number;
  color?: string;
  variant?: "default" | "notification" | "settings" | "heart" | "star";
  gifSource?: ImageSourcePropType;
  gifUri?: string;
}

export function CuteLoading({
  size = 60,
  color = "#1976D2",
  variant = "default",
  gifSource,
  gifUri,
}: CuteLoadingProps) {
  const resolvedSource: ImageSourcePropType | undefined = gifSource
    ? gifSource
    : gifUri
    ? { uri: gifUri }
    : undefined;

  return (
    <View style={styles.container}>
      {resolvedSource ? (
        <Image
          source={resolvedSource}
          style={{ width: size, height: size, resizeMode: "contain" }}
        />
      ) : (
        <ActivityIndicator size="small" color={color} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
});
