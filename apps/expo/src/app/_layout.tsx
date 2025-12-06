import { useColorScheme } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { tokenCache } from "@clerk/clerk-expo/token-cache";

import { TRPCClient } from "~/utils/api";

import "../styles.css";

import { ClerkProvider } from "@clerk/clerk-expo";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ClerkProvider
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}
      tokenCache={tokenCache}
    >
      <TRPCClient>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: "#c03484",
            },
            contentStyle: {
              backgroundColor: colorScheme == "dark" ? "#09090B" : "#FFFFFF",
            },
          }}
        />
        <StatusBar />
      </TRPCClient>
    </ClerkProvider>
  );
}
