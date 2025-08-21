import { theme } from "@/themes/theme";
import { FlightOffer } from "@/types";
import * as React from "react";
import { Image, StyleSheet, View } from "react-native";
import { Button, Card, Text } from "react-native-paper";

const carrierCodeToName: { [key: string]: string } = {
  DL: "Delta Air Lines",
  AA: "American Airlines",
  UA: "United Airlines",
  WN: "Southwest Airlines",
  B6: "JetBlue Airways",
  NK: "Spirit Airlines",
  F9: "Frontier Airlines",
  AI: "Air India",
  "6E": "IndiGo",
  SG: "SpiceJet",
  UK: "Vistara",
  TK: "Turkish Airlines",
  AS: "Alaska Airlines", // Added for the logged flight
};

const getAirlineIconURL = (code: string) =>
  carrierCodeToName[code]
    ? `https://content.airhex.com/content/logos/airlines_${code.toUpperCase()}_100_100_s.png`
    : "https://content.airhex.com/content/logos/default.png";

export default function FlightCard({
  flightData,
  handleSubmit,
}: { flightData: FlightOffer; handleSubmit: () => void }) {
  const { currencyCode, totalPrice, basePrice, trips } = flightData;

  const formatTime = (dateTime: string) => {
    if (!dateTime) return "N/A";
    const date = new Date(dateTime);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Defensive check for trips
  if (!trips || !Array.isArray(trips) || trips.length === 0) {
    return (
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.errorText}>No flight details available</Text>
          <View style={styles.footer}>
            <View>
              <Text style={styles.price}>
                {currencyCode || "N/A"} {totalPrice || "N/A"}
              </Text>
              <Text style={styles.basePrice}>Base: {currencyCode || "N/A"} {basePrice || "N/A"}</Text>
            </View>
            <Button
              mode="contained"
              style={styles.bookButton}
              onPress={handleSubmit}
              disabled // Disable button if no trips
            >
              Book
            </Button>
          </View>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card style={styles.card}>
      {trips.map((trip, index: number) => {
        const firstLeg = trip.legs && Array.isArray(trip.legs) && trip.legs[0];
        const lastLeg = trip.legs && Array.isArray(trip.legs) && trip.legs[trip.legs.length - 1];

        if (!firstLeg || !lastLeg) {
          return (
            <View key={index} style={styles.tripRow}>
              <Text style={styles.errorText}>No leg details available</Text>
            </View>
          );
        }

        return (
          <View key={index} style={styles.tripRow}>
            {/* Left section - Times */}
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>{formatTime(firstLeg.departureDateTime)}</Text>
              <Text style={styles.arrow}>→</Text>
              <Text style={styles.timeText}>{formatTime(lastLeg.arrivalDateTime)}</Text>
            </View>

            {/* Middle section - Duration & Stops */}
            <View style={styles.durationContainer}>
              <Text style={styles.duration}>
                {trip.totalFlightDuration || firstLeg.duration || "N/A"}
              </Text>
              <Text style={styles.stops}>
                {trip.stops >= 0 ? (trip.stops > 0 ? `${trip.stops} Stop${trip.stops > 1 ? "s" : ""}` : "Direct") : "N/A"}
              </Text>
            </View>

            {/* Right section - Airline Logo + Name */}
            <View style={styles.airlineContainer}>
              <Image
                source={{
                  uri: getAirlineIconURL(firstLeg.operatingCarrierCode || firstLeg.carrierCode || ""),
                }}
                style={styles.logo}
                onError={() => console.log("Failed to load airline logo")}
              />
              <Text numberOfLines={1} ellipsizeMode="tail" style={styles.airline}>
                {firstLeg.carrierName || carrierCodeToName[firstLeg.carrierCode] || firstLeg.carrierCode || "Unknown"}
              </Text>
            </View>
          </View>
        );
      })}

      {/* Bottom Price + Book */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.price}>
            {currencyCode || "N/A"} {totalPrice || "N/A"}
          </Text>
          <Text style={styles.basePrice}>
            Base: {currencyCode || "N/A"} {basePrice || "N/A"}
          </Text>
        </View>
        <Button
          mode="contained"
          style={styles.bookButton}
          onPress={handleSubmit}
        >
          Book
        </Button>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  tripRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeText: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.onSurface,
  },
  arrow: {
    marginHorizontal: 6,
    fontSize: 18,
    color: theme.colors.onSurfaceVariant,
  },
  durationContainer: {
    alignItems: "center",
  },
  duration: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.onSurface,
  },
  stops: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  airlineContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
    maxWidth: 120,
  },
  airline: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.onSurface,
    flexShrink: 1,
  },
  logo: {
    width: 24,
    height: 24,
    resizeMode: "contain",
    marginRight: 6,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: theme.colors.outline,
    paddingTop: 8,
    marginTop: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.onSurface,
  },
  basePrice: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  bookButton: {
    borderRadius: 8,
  },
  errorText: {
    fontSize: 14,
    color: theme.colors.error,
    textAlign: "center",
  },
});