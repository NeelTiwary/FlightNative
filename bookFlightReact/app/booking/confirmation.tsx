import TravelerDetails from "@/components/TravelerDetails";
import TripDetails from "@/components/TripDetails";
import { useAppContext } from "@/context/AppContextProvider";
import { Dimensions, FlatList, Platform, ScrollView, StyleSheet, View, Alert } from "react-native";
import { Card, Divider, Text, Button, IconButton } from "react-native-paper";
import { useRouter } from "expo-router";
import * as Clipboard from 'expo-clipboard';

function Confirmation() {
    const router = useRouter();
    let bookingData = null;
    if(Platform.OS === 'web') {
      const flightBookingStr = localStorage.getItem('flightBooking');
      bookingData = flightBookingStr ? JSON.parse(flightBookingStr) : null;
    } else {
        const { flightBooking } = useAppContext();
        bookingData = flightBooking;
    }

    const { orderId, travelers, flightOffer } = bookingData || {};

    const formatTime = (dt: string) =>
        new Date(dt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const formatDate = (dt: string) =>
        new Date(dt).toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short' });

    const handleHomeRedirect = () => {
        router.push('/');
    };

    const copyOrderId = async () => {
        try {
            // Decode the URL-encoded order ID
            const decodedOrderId = decodeURIComponent(orderId);
            await Clipboard.setStringAsync(decodedOrderId);
            
            // Show success message
            if (Platform.OS === 'web') {
                alert('Order ID copied to clipboard!');
            } else {
                Alert.alert('Success', 'Order ID copied to clipboard!');
            }
        } catch (error) {
            console.error('Failed to copy order ID:', error);
            if (Platform.OS === 'web') {
                alert('Failed to copy Order ID');
            } else {
                Alert.alert('Error', 'Failed to copy Order ID');
            }
        }
    };

    // Function to decode the order ID for display
    const getDisplayOrderId = () => {
        try {
            return decodeURIComponent(orderId);
        } catch (error) {
            console.error('Failed to decode order ID:', error);
            return orderId; // Return original if decoding fails
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Success Confirmation Card */}
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
                                        <Text variant="bodySmall" style={styles.infoLabel}>ORDER ID</Text>
                                        <IconButton 
                                            icon="content-copy" 
                                            size={16} 
                                            onPress={copyOrderId}
                                            style={styles.copyButton}
                                        />
                                    </View>
                                    <View style={styles.orderIdValueContainer}>
                                        <Text variant="bodyMedium" style={styles.infoValue} numberOfLines={1} ellipsizeMode="tail">
                                            {getDisplayOrderId()}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.infoItem}>
                                    <Text variant="bodySmall" style={styles.infoLabel}>TOTAL AMOUNT</Text>
                                    <Text variant="bodyMedium" style={styles.totalPrice}>
                                        {flightOffer?.totalPrice} {flightOffer?.currencyCode}
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

                {/* Itinerary Section */}
                <View style={styles.section}>
                    <Text variant="titleLarge" style={styles.sectionTitle}>Flight Itinerary</Text>
                    {flightOffer?.trips?.map((trip: any, idx: number) => (
                        <TripDetails 
                            key={`trip-${idx}`}
                            trip={trip}
                            tripIndex={`trip-${idx}`}
                        />
                    ))}
                </View>

                <Divider style={styles.divider} />

                {/* Passenger Details Section */}
                <View style={styles.section}>
                    <Text variant="titleLarge" style={styles.sectionTitle}>Passenger Details</Text>
                    <FlatList 
                        data={travelers}
                        keyExtractor={(_, index) => `traveler-${index}`}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.travelerList}
                        renderItem={({ item, index }) => (
                                <TravelerDetails 
                                    traveler={item}
                                    key={index}
                                />
                        )}
                    />
                </View>

                {/* Action Buttons */}
                <View style={styles.actions}>
                    <Button 
                        mode="outlined" 
                        onPress={handleHomeRedirect}
                        style={styles.secondaryButton}
                        icon="home"
                        contentStyle={styles.buttonContent}
                    >
                        Return to Home
                    </Button>
                </View>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
  code: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  time: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  date: {
    fontSize: 12,
    color: 'gray',
  },
  legCode: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  legTerminal: {
    fontSize: 11,
    fontWeight: 'condensedBold',
  },
  legTime: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
  },
  legDate: {
    fontSize: 10,
    color: 'gray',
  },
})
export default confirmation;