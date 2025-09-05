import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Card, Text, TextInput, Button } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import * as Clipboard from "expo-clipboard";

const CheckYourFlight = () => {
  const [bookingId, setBookingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [flightData, setFlightData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const buttonScale = useSharedValue(1);
  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(buttonScale.value) }],
  }));

  const fetchFlightDetails = async () => {
    if (!bookingId.trim()) return;
    setLoading(true);
    setError(null);
    setFlightData(null);

    try {
      const encodedId = encodeURIComponent(bookingId);
      const response = await fetch(
        `http://192.168.0.102:8080/booking/flight-order/${encodedId}`
      );
      if (!response.ok) throw new Error("Booking not found");
      const data = await response.json();
      setFlightData(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!flightData?.orderId) return;
    await Clipboard.setStringAsync(flightData.orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (dateString: string) =>
    dateString
      ? new Date(dateString).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "N/A";

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Fetching your flight details...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Input Section */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>Retrieve Flight Details</Text>

          <TextInput
            label="Booking Reference"
            value={bookingId}
            onChangeText={setBookingId}
            mode="outlined"
            style={styles.input}
            outlineStyle={styles.inputOutline}
            placeholder="e.g., eJzTd9e38HUJjfIGAAsQAmk=3D"
            theme={{ colors: { primary: "#2563EB", onSurface: "#1E293B" } }}
            right={
              <TextInput.Icon
                icon="clipboard-text-outline"
                onPress={async () => {
                  const text = await Clipboard.getStringAsync();
                  if (text) setBookingId(text);
                }}
              />
            }
          />

          <Animated.View style={[animatedButtonStyle, { marginTop: 12 }]}>
            <Button
              mode="contained"
              onPress={fetchFlightDetails}
              disabled={!bookingId.trim()}
              style={styles.searchButton}
            >
              Search
            </Button>
          </Animated.View>

          {error && <Text style={styles.errorText}>{error}</Text>}
        </Card.Content>
      </Card>

      {flightData && (
        <>
          {/* Order Summary */}
          <Card style={styles.card}>
            <Card.Content style={{ alignItems: "center" }}>
              <MaterialCommunityIcons
                name="check-circle"
                size={40}
                color="#22C55E"
              />
              <Text style={styles.successTitle}>Booking Confirmed</Text>
              <Text style={styles.subheading}>Your Order Details</Text>

              <View style={styles.orderIdContainer}>
                <Text style={styles.orderIdLabel}>ORDER ID</Text>
                <Text
                  style={styles.orderId}
                  numberOfLines={1}
                  ellipsizeMode="middle"
                >
                  {flightData.orderId}
                </Text>
                <TouchableOpacity
                  onPress={copyToClipboard}
                  style={styles.copyButton}
                >
                  <MaterialCommunityIcons
                    name={copied ? "check" : "content-copy"}
                    size={16}
                    color="#FFF"
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.price}>
                Total: {flightData.flightOffer.currencyCode} {" "}
                {flightData.flightOffer.totalPrice}
              </Text>
            </Card.Content>
          </Card>

          {/* Travelers */}
          <Card style={styles.card}>
            <Card.Title title="Passenger Details" titleStyle={styles.cardTitle} />
            <Card.Content>
              {flightData.travelers?.map((t: any, idx: number) => (
                <View key={idx} style={styles.travelerBlock}>
                  <Text style={styles.travelerName}>
                    {t.firstName} {t.lastName}
                  </Text>
                  <Text style={styles.travelerDetail}>DOB: {t.dateOfBirth}</Text>
                  <Text style={styles.travelerDetail}>Gender: {t.gender}</Text>
                  {t.phones?.[0] && (
                    <Text style={styles.travelerDetail}>
                      Phone: +{t.phones[0].countryCallingCode} {t.phones[0].number}
                    </Text>
                  )}
                  {t.documents?.[0] && (
                    <Text style={styles.travelerDetail}>
                      {t.documents[0].documentType}: {t.documents[0].number}
                    </Text>
                  )}
                </View>
              ))}
            </Card.Content>
          </Card>

          {/* Flight Itinerary */}
          <Card style={styles.card}>
            <Card.Title title="Flight Itinerary" titleStyle={styles.cardTitle} />
            <Card.Content>
              {flightData.flightOffer.trips?.map((trip: any, index: number) => {
                const firstLeg = trip.legs[0];
                const lastLeg = trip.legs[trip.legs.length - 1];
                const stops =
                  trip.legs.length > 1
                    ? trip.legs.slice(0, -1).map((l: any) => l.arrivalAirport)
                    : [];
                return (
                  <View key={index} style={styles.segmentContainer}>
                    <Text style={styles.tripLabel}>
                      {index === 0 ? "Departure Flight" : "Return Flight"}
                    </Text>

                    {stops.length > 0 && (
                      <Text style={styles.viaText}>via {stops.join(", ")}</Text>
                    )}

                    <View style={styles.timeRow}>
                      <View style={styles.timeBlock}>
                        <Text style={styles.airportCode}>
                          {firstLeg.departureAirport}
                        </Text>
                        <Text style={styles.time}>
                          {formatTime(firstLeg.departureDateTime)}
                        </Text>
                      </View>

                      <View style={styles.line} />

                      <View style={styles.timeBlock}>
                        <Text style={styles.airportCode}>
                          {lastLeg.arrivalAirport}
                        </Text>
                        <Text style={styles.time}>
                          {formatTime(lastLeg.arrivalDateTime)}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.flightInfo}>
                      Flights: {trip.legs
                        .map(
                          (l: any) => `${l.operatingCarrierCode} ${l.flightNumber}`
                        )
                        .join(" + ")}
                    </Text>

                    <Text style={styles.duration}>
                      Duration: {trip.legs.map((l: any) => l.duration).join(" + ")}
                    </Text>
                  </View>
                );
              })}
            </Card.Content>
          </Card>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  scrollContent: { padding: 10, paddingBottom: 20 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, fontSize: 14, color: "#6B7280" },
  card: {
    marginBottom: 12,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    elevation: 2,
    paddingVertical: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  successTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginVertical: 4,
    color: "#111827",
  },
  subheading: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  orderIdContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    backgroundColor: "#F1F5F9",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    width: "100%",
  },
  orderIdLabel: { fontSize: 10, color: "#64748B", marginRight: 4 },
  orderId: { fontSize: 12, color: "#1E293B", flex: 1, fontWeight: "600" },
  copyButton: { backgroundColor: "#2563EB", padding: 4, borderRadius: 6 },
  price: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2563EB",
    textAlign: "center",
    marginTop: 8,
  },
  errorText: { color: "#DC2626", fontSize: 12, marginTop: 8 },
  travelerBlock: {
    marginBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
    paddingBottom: 6,
  },
  travelerName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  travelerDetail: { fontSize: 12, color: "#374151" },
  segmentContainer: {
    marginBottom: 3,
    paddingBottom: 3,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
  },
  tripLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 0,
    textAlign: "center",
  },
  viaText: {
    fontSize: 11,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 4,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  timeBlock: { alignItems: "center", minWidth: 70 },
  airportCode: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2563EB",
    marginBottom: 1,
  },
  time: { fontSize: 12, fontWeight: "600", color: "#111827" },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#CBD5E1",
    marginHorizontal: 6,
    marginTop: 12,
  },
  flightInfo: {
    fontSize: 11,
    color: "#374151",
    textAlign: "center",
    marginBottom: 2,
  },
  duration: {
    fontSize: 11,
    color: "#64748B",
    textAlign: "center",
  },
});

export default CheckYourFlight;
