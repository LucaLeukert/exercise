import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";

import { api } from "~/utils/api";

export default function Index() {
  return (
    <SafeAreaView className="bg-background">
      {/* Changes page title visible on the header */}
      <Stack.Screen options={{ title: "Home Page" }} />
      <View className="bg-background h-full w-full p-4">
        <Text className="pb-2 text-center text-5xl font-bold">
          Create <Text className="text-[#811818]">T3</Text> Turbo
        </Text>

        <View className="py-2">
          <Text className="text-primary font-semibold italic">
            Press on a post
          </Text>
        </View>

        <Post />
      </View>
    </SafeAreaView>
  );
}

function Post() {
  const { data } = api.exercise.all.useQuery();
  if (!data) return null;

  return (
    <SafeAreaView className="bg-background">
      <Stack.Screen options={{ title: data.fwa }} />
      <View className="h-full w-full p-4">
        <Text className="text-primary py-2 text-3xl font-bold">{data.fwa}</Text>
        <Text className="text-foreground py-4">{data.fwa}</Text>
      </View>
    </SafeAreaView>
  );
}
