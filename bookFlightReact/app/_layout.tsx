import { AppContextProvider } from "@/context/AppContextProvider";
import { theme } from "@/themes/theme";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider as PaperProvider } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, View } from "react-native";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.gestureContainer}>
      <AppContextProvider>
        <PaperProvider theme={theme}>
          <SafeAreaView style={styles.safeContainer} edges={["right", "left", "bottom"]}>
            <View style={styles.contentContainer}>
              <Stack
                screenOptions={{
                  headerStyle: {
                    backgroundColor: theme.colors.primary,
                    height: 50, // Consistent header height
                  },
                  headerTintColor: theme.colors.background,
                  headerTitleStyle: {
                    fontWeight: "bold",
                    fontSize: 18,
                  },
                  contentStyle: {
                    backgroundColor: theme.colors.background,
                  },
                  headerShadowVisible: false,
                }}
              >
                <Stack.Screen
                  name="(tabs)"
                  options={{
                    headerTitle: "FlightMate",
                    headerShown: false,
                  }}
                />
                <Stack.Screen
                  name="index"
                  options={{
                    headerTitle: "Traveler Details",
                    headerShown: true,
                  }}
                />
                <Stack.Screen
                  name="flightDetails"
                  options={{
                    headerTitle: "Flight Details",
                    headerShown: true,
                  }}
                />
                <Stack.Screen
                  name="confirmation"
                  options={{
                    headerTitle: "Booking Details",
                    headerShown: true,
                  }}
                />
              </Stack>
            </View>
          </SafeAreaView>
        </PaperProvider>
      </AppContextProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  gestureContainer: {
    flex: 1,
  },
  safeContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    flex: 1,
    margin: 0,
    padding: 0,
  },
});