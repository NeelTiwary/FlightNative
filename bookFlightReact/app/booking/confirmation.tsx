import TravelerDetails from "@/components/TravelerDetails";
import TripDetails from "@/components/TripDetails";
import { useAppContext } from "@/context/AppContextProvider";
import { Dimensions, Platform, ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Divider, Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function Confirmation() {
  const { flightBooking } = useAppContext();
  let bookingData = null;

  // Fetch booking data based on platform
  if (Platform.OS === "web") {
    const flightBookingStr = localStorage.getItem("flightBooking");
    bookingData = flightBookingStr ? JSON.parse(flightBookingStr) : null;
  } else {
    bookingData = flightBooking;
  }

  const { orderId, travelers, flightOffer } = bookingData || {};

  // Format date and time for consistent display
  const formatTime = (dt: string) =>
    new Date(dt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  const formatDate = (dt: string) =>
    new Date(dt).toLocaleDateString("en-US", { weekday: "short", day: "2-digit", month: "short" });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <MaterialCommunityIcons name="check-circle" size={40} color="#388e3c" />
        <Text style={styles.headerTitle}>Booking Confirmed</Text>
        <Text style={styles.headerSubtitle}>
          Thank you for your booking! A confirmation email has been sent to your email address.
        </Text>
      </View>

      {/* Booking Summary Card */}
      <Card style={styles.summaryCard}>
        <Card.Content>
          <View style={styles.summaryHeader}>
            <MaterialCommunityIcons name="ticket-confirmation" size={24} color="#007AFF" />
            <Text style={styles.sectionTitle}>Booking Details</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Order ID:</Text>
            <Text style={styles.summaryValue}>{orderId || "N/A"}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Price:</Text>
            <Text style={[styles.summaryValue, styles.priceText]}>
              {flightOffer?.currencyCode} {flightOffer?.totalPrice || "N/A"}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Itinerary Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="airplane" size={24} color="#007AFF" />
          <Text style={styles.sectionTitle}>Itinerary</Text>
        </View>
        {flightOffer?.trips?.length > 0 ? (
          flightOffer.trips.map((trip: any, idx: number) => (
            <TripDetails
              key={`trip-${idx}`}
              trip={trip}
              tripIndex={`trip-${idx}`}
              formatTime={formatTime}
              formatDate={formatDate}
              style={styles.tripCard}
            />
          ))
        ) : (
          <Text style={styles.noDataText}>No itinerary details available.</Text>
        )}
      </View>

      {/* Passenger Details Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="account-group" size={24} color="#007AFF" />
          <Text style={styles.sectionTitle}>Passenger Details</Text>
        </View>
        {travelers?.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.passengerContainer}
          >
            {travelers.map((traveler: any, index: number) => (
              <View
                key={`traveler-${index}`}
                style={[
                  styles.passengerCard,
                  { width: travelers.length === 1 ? Dimensions.get("window").width - 32 : 250 },
                ]}
              >
                <TravelerDetails traveler={traveler} style={styles.travelerDetails} />
              </View>
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.noDataText}>No passenger details available.</Text>
        )}
      </View>

      {/* Action Button */}
      <Button
        mode="contained"
        onPress={() => {} /* Navigate to home or bookings */}
        style={styles.actionButton}
        labelStyle={styles.actionButtonLabel}
        icon="home"
      >
        Back to Home
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#F8F9FA",
    paddingBottom: 32,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A1A1A",
    marginTop: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    marginTop: 8,
    maxWidth: 300,
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 24,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    marginLeft: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 6,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666666",
    fontWeight: "500",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  priceText: {
    color: "#007AFF",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  tripCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  passengerContainer: {
    paddingRight: 16,
  },
  passengerCard: {
    marginRight: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  travelerDetails: {
    padding: 12,
  },
  noDataText: {
    fontSize: 14,
    color: "#999999",
    textAlign: "center",
    marginTop: 8,
  },
  actionButton: {
    borderRadius: 12,
    backgroundColor: "#007AFF",
    paddingVertical: 6,
    marginHorizontal: 16,
  },
  actionButtonLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});