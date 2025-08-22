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
  AS: "Alaska Airlines",
};

const iataToCity: { [key: string]: string } = {
  EWR: "Newark",
  LAX: "Los Angeles",
  JFK: "New York (JFK)",
  LGA: "New York (LGA)",
  ORD: "Chicago",
  DFW: "Dallas",
  DEN: "Denver",
  SFO: "San Francisco",
  // Add more as needed
};

const getAirlineIconURL = (code: string) =>
  `https://content.airhex.com/content/logos/airlines_${code.toUpperCase()}_100_100_s.png`;

export default function FlightCard({
  flightData,
  handleSubmit,
}: { flightData: FlightOffer; handleSubmit: () => void }) {
  // Parse the flight data to get the raw API response
  const parsedFlightData = React.useMemo(() => {
    if (!flightData) return null;
    
    try {
      if (flightData.pricingAdditionalInfo) {
        return typeof flightData.pricingAdditionalInfo === 'string'
          ? JSON.parse(flightData.pricingAdditionalInfo)
          : flightData.pricingAdditionalInfo;
      }
      return flightData;
    } catch (error) {
      console.warn("Failed to parse flight data:", error);
      return flightData;
    }
  }, [flightData]);

  const formatTime = (dateTime: string) => {
    if (!dateTime) return "N/A";
    const date = new Date(dateTime);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDuration = (duration: string) => {
    if (!duration) return "N/A";
    // Convert PT6H20M to 6h 20m
    return duration.replace('PT', '').replace('H', 'h ').replace('M', 'm').trim();
  };

  if (!parsedFlightData) {
    return (
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.errorText}>No flight details available</Text>
          <View style={styles.footer}>
            <View>
              <Text style={styles.price}>
                {flightData?.currencyCode || "N/A"} {flightData?.totalPrice || "N/A"}
              </Text>
            </View>
            <Button
              mode="contained"
              style={styles.bookButton}
              onPress={handleSubmit}
              disabled
            >
              Book
            </Button>
          </View>
        </Card.Content>
      </Card>
    );
  }

  const itineraries = parsedFlightData.itineraries || [];
  const priceInfo = parsedFlightData.price || {};
  const firstItinerary = itineraries[0];
  const firstSegment = firstItinerary?.segments?.[0];

  if (!firstItinerary || !firstSegment) {
    return (
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.errorText}>No flight itinerary available</Text>
          <View style={styles.footer}>
            <View>
              <Text style={styles.price}>
                {priceInfo.currency || "N/A"} {priceInfo.total || "N/A"}
              </Text>
            </View>
            <Button
              mode="contained"
              style={styles.bookButton}
              onPress={handleSubmit}
              disabled
            >
              Book
            </Button>
          </View>
        </Card.Content>
      </Card>
    );
  }

  const carrierCode = firstSegment.carrierCode || "";
  const airlineName = carrierCodeToName[carrierCode] || carrierCode;
  const departureCity = iataToCity[firstSegment.departure?.iataCode] || firstSegment.departure?.iataCode;
  const arrivalCity = iataToCity[firstSegment.arrival?.iataCode] || firstSegment.arrival?.iataCode;
  const stops = Math.max(0, firstItinerary.segments.length - 1);

  return (
    <Card style={styles.card}>
      <View style={styles.tripRow}>
        {/* Left section - Times */}
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(firstSegment.departure?.at)}</Text>
          <Text style={styles.arrow}>→</Text>
          <Text style={styles.timeText}>{formatTime(firstSegment.arrival?.at)}</Text>
        </View>

        {/* Middle section - Duration & Stops */}
        <View style={styles.durationContainer}>
          <Text style={styles.duration}>
            {formatDuration(firstItinerary.duration)}
          </Text>
          <Text style={styles.stops}>
            {stops === 0 ? "Direct" : `${stops} Stop${stops > 1 ? 's' : ''}`}
          </Text>
        </View>

        {/* Right section - Airline Logo + Name */}
        <View style={styles.airlineContainer}>
          <Image
            source={{
              uri: getAirlineIconURL(carrierCode),
            }}
            style={styles.logo}
            onError={() => console.log("Failed to load airline logo for:", carrierCode)}
          />
          <Text numberOfLines={1} ellipsizeMode="tail" style={styles.airline}>
            {airlineName}
          </Text>
        </View>
      </View>

      {/* Route information */}
      <View style={styles.routeContainer}>
        <Text style={styles.routeText}>
          {departureCity || "Unknown"} → {arrivalCity || "Unknown"}
        </Text>
        <Text style={styles.flightNumber}>
          Flight: {carrierCode} {firstSegment.number}
        </Text>
      </View>

      {/* Bottom Price + Book */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.price}>
            {priceInfo.currency || "USD"} {priceInfo.total || "N/A"}
          </Text>
          <Text style={styles.basePrice}>
            Base: {priceInfo.currency || "USD"} {priceInfo.base || "N/A"}
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
    padding: 16,
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
    flex: 1,
  },
  timeText: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.onSurface,
    minWidth: 50,
  },
  arrow: {
    marginHorizontal: 6,
    fontSize: 16,
    color: theme.colors.onSurfaceVariant,
  },
  durationContainer: {
    alignItems: "center",
    flex: 1,
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
    flex: 1,
    justifyContent: 'flex-end',
  },
  airline: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.onSurface,
    marginLeft: 6,
    maxWidth: 80,
  },
  logo: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
  routeContainer: {
    marginBottom: 12,
    alignItems: 'center',
  },
  routeText: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.onSurface,
    marginBottom: 4,
  },
  flightNumber: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: theme.colors.outline,
    paddingTop: 12,
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
    minWidth: 80,
  },
  errorText: {
    fontSize: 14,
    color: theme.colors.error,
    textAlign: "center",
    marginBottom: 12,
  },
});