import { theme } from "@/themes/theme";
import { FlightOffer } from "@/types";
import * as React from "react";
import { Image, StyleSheet, View } from "react-native";
import { Button, Card, Text, Divider } from "react-native-paper";

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
    <Card style={styles.card} elevation={2}>
      <Card.Content style={styles.cardContent}>
        {/* Airline and Price Header */}
        <View style={styles.header}>
          <View style={styles.airlineHeader}>
            <Image
              source={{ uri: getAirlineIconURL(carrierCode) }}
              style={styles.logo}
              onError={() => console.log("Failed to load airline logo for:", carrierCode)}
            />
            <Text variant="bodyMedium" style={styles.airlineName}>
              {airlineName}
            </Text>
          </View>
          <View style={styles.priceContainer}>
            <Text variant="titleMedium" style={styles.price}>
              {priceInfo.currency || "USD"} {priceInfo.total || "N/A"}
            </Text>
            <Text variant="bodySmall" style={styles.basePrice}>
              Base: {priceInfo.currency || "USD"} {priceInfo.base || "N/A"}
            </Text>
          </View>
        </View>

        <Divider style={styles.divider} />

        {/* Flight Details */}
        <View style={styles.flightDetails}>
          {/* Departure */}
          <View style={styles.timeSection}>
            <Text variant="titleMedium" style={styles.time}>
              {formatTime(firstSegment.departure?.at)}
            </Text>
            <Text variant="bodySmall" style={styles.airportCode}>
              {firstSegment.departure?.iataCode}
            </Text>
            <Text variant="bodySmall" style={styles.city}>
              {departureCity || "Unknown"}
            </Text>
          </View>

          {/* Duration and Stops */}
          <View style={styles.durationSection}>
            <View style={styles.durationLine}>
              <View style={styles.dot} />
              <View style={styles.line} />
              <View style={styles.dot} />
            </View>
            <Text variant="bodySmall" style={styles.duration}>
              {formatDuration(firstItinerary.duration)}
            </Text>
            <Text variant="bodySmall" style={[styles.stops, stops === 0 ? styles.direct : styles.withStops]}>
              {stops === 0 ? "Direct" : `${stops} Stop${stops > 1 ? 's' : ''}`}
            </Text>
          </View>

          {/* Arrival */}
          <View style={styles.timeSection}>
            <Text variant="titleMedium" style={styles.time}>
              {formatTime(firstSegment.arrival?.at)}
            </Text>
            <Text variant="bodySmall" style={styles.airportCode}>
              {firstSegment.arrival?.iataCode}
            </Text>
            <Text variant="bodySmall" style={styles.city}>
              {arrivalCity || "Unknown"}
            </Text>
          </View>
        </View>

        <Divider style={styles.divider} />

        {/* Flight Number and Book Button */}
        <View style={styles.footer}>
          <View style={styles.flightInfo}>
            <Text variant="bodySmall" style={styles.flightNumber}>
              Flight: {carrierCode} {firstSegment.number}
            </Text>
          </View>
          <Button
            mode="contained"
            style={styles.bookButton}
            labelStyle={styles.bookButtonLabel}
            onPress={handleSubmit}
          >
            Select
          </Button>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e9ecef',
    overflow: 'hidden',
  },
  cardContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  airlineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 32,
    height: 32,
    resizeMode: "contain",
    marginRight: 8,
  },
  airlineName: {
    fontWeight: '600',
    color: '#2c3e50',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  basePrice: {
    color: '#6c757d',
  },
  divider: {
    marginVertical: 12,
    backgroundColor: '#e9ecef',
  },
  flightDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeSection: {
    alignItems: 'center',
    flex: 1,
  },
  time: {
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  airportCode: {
    fontWeight: '600',
    color: '#495057',
    marginBottom: 2,
  },
  city: {
    color: '#6c757d',
    textAlign: 'center',
  },
  durationSection: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 8,
  },
  durationLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#dee2e6',
  },
  line: {
    height: 1,
    width: 40,
    backgroundColor: '#dee2e6',
    marginHorizontal: 4,
  },
  duration: {
    color: '#495057',
    marginBottom: 4,
  },
  stops: {
    fontWeight: '500',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  direct: {
    backgroundColor: '#e8f5e8',
    color: '#2e7d32',
  },
  withStops: {
    backgroundColor: '#fff3cd',
    color: '#856404',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flightInfo: {
    flex: 1,
  },
  flightNumber: {
    color: '#6c757d',
  },
  bookButton: {
    borderRadius: 8,
    backgroundColor: '#0066cc',
  },
  bookButtonLabel: {
    fontWeight: '600',
    color: '#fff',
  },
  errorText: {
    color: '#dc3545',
    textAlign: "center",
    marginBottom: 12,
  },
});