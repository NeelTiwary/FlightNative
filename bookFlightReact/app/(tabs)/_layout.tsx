import { theme } from '@/themes/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, Tabs } from "expo-router";
import { View, StyleSheet } from "react-native";

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#fff',
                    elevation: 0,
                    shadowOpacity: 0,
                    borderBottomWidth: 1,
                    borderBottomColor: '#e0e0e0',
                },
                headerTitleStyle: {
                    fontSize: 18,
                    fontWeight: '600',
                    color: '#1a73e8',
                },
                tabBarStyle: {
                    backgroundColor: '#fff',
                    borderTopWidth: 1,
                    borderTopColor: '#e0e0e0',
                    elevation: 8,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    height: 70, // Increased to accommodate larger padding
                    paddingBottom: 9, // Increased to add more space at the bottom
                    paddingTop: 4,
                    position: 'absolute',
                    bottom: 12,
                    left: 0,
                    right: 0,
                },
                tabBarActiveTintColor: '#1a73e8',
                tabBarInactiveTintColor: '#5f6368',
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                    marginTop: 4,
                },
            }}
            contentContainerStyle={{ paddingBottom: 80 }} // Kept to prevent content overlap
        >
            <Tabs.Screen
                name="home/index"
                options={{
                    title: "Home",
                    headerTitle: "Flight Booking",
                    tabBarIcon: ({ color, size, focused }) => (
                        <View style={focused ? styles.activeIconContainer : null}>
                            <MaterialCommunityIcons
                                name="home"
                                color={focused ? '#1a73e8' : color}
                                size={focused ? 26 : size}
                            />
                        </View>
                    )
                }}
            />
            <Tabs.Screen
                name="offers/index"
                options={{
                    title: "Results",
                    headerTitle: "Search Results",
                    tabBarIcon: ({ color, size, focused }) => (
                        <View style={focused ? styles.activeIconContainer : null}>
                            <MaterialCommunityIcons
                                name="airplane"
                                color={focused ? '#1a73e8' : color}
                                size={focused ? 26 : size}
                            />
                        </View>
                    ),
                    headerLeft: ({ tintColor }) => (
                        <MaterialCommunityIcons
                            name="arrow-left"
                            color={tintColor}
                            size={24}
                            style={{ marginLeft: 16 }}
                            onPress={() => {router.push('./home')}}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="search/index"
                options={{
                    title: "Search",
                    headerTitle: "Find Flights",
                    tabBarIcon: ({ color, size, focused }) => (
                        <View style={styles.searchIconContainer}>
                            <MaterialCommunityIcons
                                name="magnify"
                                color="#fff"
                                size={28}
                            />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="account/index"
                options={{
                    title: "Profile",
                    headerTitle: "My Account",
                    tabBarIcon: ({ color, size, focused }) => (
                        <View style={focused ? styles.activeIconContainer : null}>
                            <MaterialCommunityIcons
                                name="account"
                                color={focused ? '#1a73e8' : color}
                                size={focused ? 26 : size}
                            />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="ticket/index"
                options={{
                    title: "Ticket",
                    headerTitle: "Get your ticket",
                    tabBarIcon: ({ color, size, focused }) => (
                        <View style={focused ? styles.activeIconContainer : null}>
                            <MaterialCommunityIcons
                                name="ticket"
                                color={focused ? '#1a73e8' : color}
                                size={focused ? 26 : size}
                            />
                        </View>
                    ),
                }}
            />
        </Tabs>
    )
}

const styles = StyleSheet.create({
    activeIconContainer: {
        backgroundColor: '#e8f0fe',
        borderRadius: 20,
        padding: 4,
        marginBottom: 1,
        marginTop: -5,
    },
    searchIconContainer: {
        backgroundColor: '#1a73e8',
        borderRadius: 30,
        padding: 8,
        marginBottom: 1,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#1a73e8',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
        marginTop: -20,
    },
});