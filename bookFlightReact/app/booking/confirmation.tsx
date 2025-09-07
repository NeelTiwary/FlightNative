import React, { useState, useEffect, useRef } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Platform,
  Animated,
  Easing,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { Text, Button, Card } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAppContext } from "@/context/AppContextProvider";
import * as Haptics from "expo-haptics";
import * as Clipboard from "expo-clipboard";

const { width } = Dimensions.get("window");

// Safe single-pass decoder
const decodeOrderIdSafe = (id?: string) => {
  if (!id) return "";
  try {
    return decodeURIComponent(id);
  } catch (e) {
    // If decode fails, return original value
    console.warn("Failed to decode orderId:", e);
    return id;
  }
};

export default function Confirmation() {
  const router = useRouter();
  const { flightBooking } = useAppContext();
  const [copied, setCopied] = useState(false);
  const [bookingData, setBookingData] = useState<any>(null);
  const masterAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!flightBooking) return;

    // Build rawData from flightBooking (string or object)
    let rawData: any;
    if (typeof flightBooking === "string") {
      if (Platform.OS === "web") {
        const stored = localStorage.getItem("flightBooking");
        if (stored) {
          try {
            rawData = JSON.parse(stored);
          } catch (e) {
            // fallback to using the flightBooking string as orderId
            rawData = { orderId: flightBooking };
          }
        } else {
          rawData = { orderId: flightBooking };
        }
      } else {
        rawData = { orderId: flightBooking };
      }
    } else {
      rawData = flightBooking;
    }

    const encodedOrderId = rawData?.orderId;
    const decodedOrderId = encodedOrderId ? decodeOrderIdSafe(encodedOrderId) : undefined;

    // Final bookingData stores the decoded orderId so UI always uses the readable value
    const finalData = { ...rawData, orderId: decodedOrderId ?? encodedOrderId };

    // console both encoded and decoded (if encoded exists)
    if (encodedOrderId) {
      console.log("Encoded Order ID:", encodedOrderId);
      console.log("Decoded Order ID:", finalData.orderId);
    }

    setBookingData(finalData);
  }, [flightBooking]);

  useEffect(() => {
    if (bookingData) {
      Animated.timing(masterAnim, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }).start();
    }
  }, [bookingData]);

  const copyToClipboard = async () => {
    const id = bookingData?.orderId;
    if (!id) return;

    try {
      if (Platform.OS === "web" && typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(id);
      } else {
        await Clipboard.setStringAsync(id);
      }

      setCopied(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Copy to clipboard failed:", e);
    }
  };

  const formatTime = (dateString: string) =>
    dateString
      ? new Date(dateString).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "N/A";

  if (!bookingData) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading booking details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Header */}
        <Animated.View
          style={[
            styles.successHeader,
            { opacity: masterAnim, transform: [{ scale: masterAnim }] },
          ]}
        >
          <MaterialCommunityIcons name="check-circle" size={48} color="#22C55E" />
          <Text style={styles.successTitle}>Booking Confirmed</Text>

          {/* Subheading for Order */}
          <Text style={styles.subheading}>Your Order Details</Text>

          <View style={styles.orderIdContainer}>
            <Text style={styles.orderIdLabel}>ORDER ID</Text>
            <Text style={styles.orderId} numberOfLines={1} ellipsizeMode="middle">
              {bookingData.orderId || "N/A"}
            </Text>
            <TouchableOpacity onPress={copyToClipboard} style={styles.copyButton}>
              <MaterialCommunityIcons
                name={copied ? "check" : "content-copy"}
                size={16}
                color="#FFF"
              />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Flight Details */}
        {bookingData.flightOffer && (
          <Card style={styles.card}>
            <Card.Title
              title="Flight Details"
              titleStyle={styles.cardTitle}
              titleVariant="titleMedium"
            />
            <Card.Content style={styles.cardContent}>
              {bookingData.flightOffer.trips?.map((trip: any, index: number) => {
                const firstLeg = trip.legs[0];
                const lastLeg = trip.legs[trip.legs.length - 1];
                const stops =
                  trip.legs.length > 1
                    ? trip.legs.slice(0, -1).map((leg: any) => leg.arrivalAirport)
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
                      Flights:{" "}
                      {trip.legs
                        .map(
                          (leg: any) =>
                            `${leg.operatingCarrierCode} ${leg.flightNumber}`
                        )
                        .join(" + ")}
                    </Text>

                    <Text style={styles.duration}>
                      Duration:{" "}
                      {trip.legs
                        .map((leg: any) => leg.duration || "N/A")
                        .join(" + ")}
                    </Text>
                  </View>
                );
              })}

              <Text style={styles.price}>
                Total: {bookingData.flightOffer.currencyCode}{" "}
                {bookingData.flightOffer.totalPrice}
              </Text>
            </Card.Content>
          </Card>
        )}

        <Button
          mode="contained"
          onPress={() => router.push("/")}
          style={styles.homeButton}
        >
          Back to Home
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  scrollContent: { padding: 10, paddingBottom: 16 },
  successHeader: {
    alignItems: "center",
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    elevation: 2,
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
    marginBottom: 4,
  },
  orderIdContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    backgroundColor: "#F1F5F9",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    width: width * 0.78,
  },
  orderIdLabel: { fontSize: 10, color: "#64748B", marginRight: 4 },
  orderId: { fontSize: 12, color: "#1E293B", flex: 1, fontWeight: "600" },
  copyButton: { backgroundColor: "#2563EB", padding: 4, borderRadius: 6 },

  card: {
    marginBottom: 12,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    elevation: 1,
  },
  cardTitle: { fontSize: 17, fontWeight: "700", color: "#111827" },
  cardContent: { paddingVertical: 0, paddingHorizontal: 0 },
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
  timeBlock: {
    alignItems: "center",
    minWidth: 70,
  },
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
  duration: { fontSize: 11, color: "#64748B", textAlign: "center" },
  divider: { marginVertical: 6 },
  price: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2563EB",
    textAlign: "center",
  },
  homeButton: { marginTop: 8, borderRadius: 8, paddingVertical: 4 },
  loadingText: {
    textAlign: "center",
    marginTop: 14,
    fontSize: 12,
    color: "#6B7280",
  },
});
