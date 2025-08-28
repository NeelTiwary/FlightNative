import { useRouter } from "expo-router";
import { FlatList, Platform, ScrollView, StyleSheet, View, Alert } from "react-native";
import { Card, Divider, Text, Button, IconButton } from "react-native-paper";
import * as Clipboard from "expo-clipboard";
import TravelerDetails from "@/components/TravelerDetails";
import TripDetails from "@/components/TripDetails";
import { useAppContext } from "@/context/AppContextProvider";

interface Traveler {
    id: string;
    // Add other traveler fields
}

interface FlightOffer {
    totalPrice: string;
    currencyCode: string;
    trips: Array<{
        id: string;
        // Add other trip fields
    }>;
}

interface BookingData {
    orderId: string;
    travelers: Traveler[];
    flightOffer: FlightOffer;
}

const Confirmation: React.FC = () => {
    const router = useRouter();
    let bookingData: BookingData | null = null;

    if (Platform.OS === "web") {
        const flightBookingStr = localStorage.getItem("flightBooking");
        bookingData = flightBookingStr ? JSON.parse(flightBookingStr) : null;
    } else {
        const { flightBooking } = useAppContext();
        bookingData = flightBooking;
    }

    if (!bookingData || !bookingData.flightOffer || !bookingData.travelers) {
        return (
            <View style={styles.container}>
                <Text>No booking data available</Text>
                <Button mode="outlined" onPress={() => router.push("/")} icon="home">
                    Return to Home
                </Button>
            </View>
        );
    }

    const { orderId, travelers, flightOffer } = bookingData;

    const formatTime = (dt: string) =>
        new Date(dt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    const formatDate = (dt: string) =>
        new Date(dt).toLocaleDateString("en-US", { weekday: "short", day: "2-digit", month: "short" });

    const handleHomeRedirect = () => {
        router.push("/");
    };

    const copyOrderId = async () => {
        try {
            const decodedOrderId = decodeURIComponent(orderId);
            if (Platform.OS === "web") {
                await navigator.clipboard.writeText(decodedOrderId);
                alert("Order ID copied to clipboard!");
            } else {
                await Clipboard.setStringAsync(decodedOrderId);
                Alert.alert("Success", "Order ID copied to clipboard!");
            }
        } catch (error) {
            console.error("Failed to copy order ID:", error);
            if (Platform.OS === "web") {
                alert("Failed to copy Order ID");
            } else {
                Alert.alert("Error", "Failed to copy Order ID");
            }
        }
    };

    const getDisplayOrderId = () => {
        try {
            return decodeURIComponent(orderId);
        } catch (error) {
            console.error("Failed to decode order ID:", error);
            return orderId;
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Card style={styles.confirmationCard}>
                    <Card.Content style={styles.confirmationContent}>
                        <View style={styles.successHeader}>
                            <View style={styles.successIconContainer}>
                                <IconButton
                                    icon="check-circle"
                                    iconColor="#4caf50"
                                    size={36}
                                    style={styles.successIcon}
                                />
                            </View>
                            <Text variant="headlineSmall" style={styles.successTitle}>
                                Booking Confirmed!
                            </Text>
                            <Text variant="bodyMedium" style={styles.successSubtitle}>
                                Your flight has been successfully booked
                            </Text>
                        </View>

                        <View style={styles.bookingInfo}>
                            <View style={styles.infoRow}>
                                <View style={styles.infoItem}>
                                    <View style={styles.orderIdContainer}>
                                        <Text variant="bodySmall" style={styles.infoLabel}>
                                            ORDER ID
                                        </Text>
                                        <IconButton
                                            icon="content-copy"
                                            size={16}
                                            onPress={copyOrderId}
                                            style={styles.copyButton}
                                        />
                                    </View>
                                    <View style={styles.orderIdValueContainer}>
                                        <Text variant="bodyMedium" style={styles.infoValue}>
                                            {getDisplayOrderId()}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.infoItem}>
                                    <Text variant="bodySmall" style={styles.infoLabel}>
                                        TOTAL AMOUNT
                                    </Text>
                                    <Text variant="bodyMedium" style={styles.totalPrice}>
                                        {flightOffer.totalPrice} {flightOffer.currencyCode}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.emailNotification}>
                            <IconButton icon="email-outline" size={20} iconColor="#388e3c" />
                            <Text variant="bodyMedium" style={styles.emailText}>
                                Booking details have been sent to your email address
                            </Text>
                        </View>
                    </Card.Content>
                </Card>

                <Divider style={styles.divider} />

                <View style={styles.section}>
                    <Text variant="titleLarge" style={styles.sectionTitle}>
                        Flight Itinerary
                    </Text>
                    {flightOffer.trips.map((trip, idx) => (
                        <TripDetails key={`trip-${idx}`} trip={trip} tripIndex={`trip-${idx}`} />
                    ))}
                </View>

                <Divider style={styles.divider} />

                <View style={styles.section}>
                    <Text variant="titleLarge" style={styles.sectionTitle}>
                        Passenger Details
                    </Text>
                    <FlatList
                        data={travelers}
                        keyExtractor={(_, index) => `traveler-${index}`}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.travelerList}
                        renderItem={({ item }) => <TravelerDetails traveler={item} />}
                    />
                </View>

                <View style={styles.actions}>
                    <Button
                        mode="outlined"
                        onPress={handleHomeRedirect}
                        style={styles.secondaryButton}
                        icon="home"
                        contentStyle={styles.buttonContent}
                        accessible
                        accessibilityLabel="Return to home screen"
                    >
                        Return to Home
                    </Button>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    scrollContent: {
        padding: 16,
    },
    confirmationCard: {
        marginBottom: 16,
    },
    confirmationContent: {
        alignItems: "center",
    },
    successHeader: {
        alignItems: "center",
        marginBottom: 16,
    },
    successIconContainer: {
        marginBottom: 8,
    },
    successIcon: {
        margin: 0,
    },
    successTitle: {
        fontWeight: "bold",
        textAlign: "center",
    },
    successSubtitle: {
        textAlign: "center",
        color: "gray",
    },
    bookingInfo: {
        width: "100%",
        marginVertical: 16,
    },
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    infoItem: {
        flex: 1,
    },
    orderIdContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    infoLabel: {
        color: "gray",
    },
    copyButton: {
        marginLeft: 8,
    },
    orderIdValueContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    infoValue: {
        flex: 1,
        flexWrap: "wrap",
    },
    totalPrice: {
        fontWeight: "bold",
    },
    emailNotification: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 16,
    },
    emailText: {
        flex: 1,
    },
    divider: {
        marginVertical: 16,
    },
    section: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontWeight: "bold",
        marginBottom: 8,
    },
    travelerList: {
        paddingHorizontal: 8,
    },
    actions: {
        marginTop: 16,
    },
    secondaryButton: {
        borderColor: "#388e3c",
    },
    buttonContent: {
        paddingVertical: 8,
    },
    code: {
        fontSize: 24,
        fontWeight: "bold",
    },
    time: {
        fontSize: 16,
        fontWeight: "bold",
        marginTop: 4,
    },
    date: {
        fontSize: 12,
        color: "gray",
    },
    legCode: {
        fontSize: 16,
        fontWeight: "bold",
    },
    legTerminal: {
        fontSize: 11,
        fontWeight: "condensedBold",
    },
    legTime: {
        fontSize: 12,
        fontWeight: "bold",
        marginTop: 4,
    },
    legDate: {
        fontSize: 10,
        color: "gray",
    },
});

export default Confirmation;