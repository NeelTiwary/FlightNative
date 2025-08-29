import { theme } from "@/themes/theme";
import { Stack } from "expo-router";

export default function Layout() {
    return (
        <Stack
            screenOptions={{
                headerStyle: {
                  backgroundColor: theme.colors.primary,
                },
                headerTintColor: theme.colors.disabled,
                headerTitleStyle: {
                  fontWeight: 'bold'
                },
              }}
        >
            <Stack.Screen name="index" options={{
                headerTitle: "Traveler Details",
                // headerLeft: () => <></>,
                headerShown: true
            }} />
            <Stack.Screen name="flightDetails" options={{
                headerTitle: "Flight Details",
                // headerLeft: () => <></>,
                headerShown: true
            }} />
            <Stack.Screen name="confirmation" options={{
                headerTitle: "Booking Details",
                // headerLeft: () => <></>,
                headerShown: true
            }} />
        </Stack>
    )
}