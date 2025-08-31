import { theme } from "@/themes/theme";
import { FlightOffer } from "@/types";
import * as React from "react";
import { Image, StyleSheet, View } from "react-native";
import { Button, Card, Text } from "react-native-paper";

const carrierCodeToName: { [key: string]: string } = {
  DL: "Delta",
  AA: "American",
  UA: "United",
  WN: "Southwest",
  B6: "JetBlue",
  NK: "Spirit",
  F9: "Frontier",
  AI: "Air India",
  "6E": "IndiGo",
  SG: "SpiceJet",
  UK: "Vistara",
  TK: "Turkish",
  AS: "Alaska",
};

const iataToCity: { [key: string]: string } = {
  EWR: "Newark",
  LAX: "LA",
  JFK: "NYC",
  LGA: "NYC",
  ORD: "Chicago",
  DFW: "Dallas",
  DEN: "Denver",
  SFO: "SF",
};

const getAirlineIconURL = (code: string) =>
  `https://content.airhex.com/content/logos/airlines_${code.toUpperCase()}_100_100_s.png`;

export default function FlightCard({
  flightData,
  handleSubmit,
  isLast = false, // Added prop to handle last card styling
}: { flightData: FlightOffer; handleSubmit: () => void; isLast?: boolean }) {
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
    return duration.replace('PT', '').replace('H', 'h ').replace('M', 'm').trim();
  };

  if (!parsedFlightData) {
    return (
      <Card style={[styles.card, isLast && styles.lastCard]}>
        <Card.Content style={styles.content}>
          <Text style={styles.errorText}>No flight details</Text>
          <View style={styles.footer}>
            <Text style={styles.price}>
              {flightData?.currencyCode || "N/A"} {flightData?.totalPrice || "N/A"}
            </Text>
            <Button
              mode="contained"
              style={styles.bookButton}
              onPress={handleSubmit}
              disabled
              compact
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
      <Card style={[styles.card, isLast && styles.lastCard]}>
        <Card.Content style={styles.content}>
          <Text style={styles.errorText}>No itinerary</Text>
          <View style={styles.footer}>
            <Text style={styles.price}>
              {priceInfo.currency || "N/A"} {priceInfo.total || "N/A"}
            </Text>
            <Button
              mode="contained"
              style={styles.bookButton}
              onPress={handleSubmit}
              disabled
              compact
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
    <Card style={[styles.card, isLast && styles.lastCard]} elevation={0}>
      <Card.Content style={styles.content}>
        {/* Top row: Airline and price */}
        <View style={styles.topRow}>
          <View style={styles.airlineRow}>
            <Image
              source={{ uri: getAirlineIconURL(carrierCode) }}
              style={styles.logo}
            />
            <Text variant="bodySmall" style={styles.airlineName}>
              {airlineName}
            </Text>
          </View>
          <Text variant="titleSmall" style={styles.price}>
            {priceInfo.currency || "USD"} {priceInfo.total || "N/A"}
          </Text>
        </View>

        {/* Middle row: Flight times and details */}
        <View style={styles.middleRow}>
          <View style={styles.timeBlock}>
            <Text variant="bodyMedium" style={styles.time}>
              {formatTime(firstSegment.departure?.at)}
            </Text>
            <Text variant="bodySmall" style={styles.airportCode}>
              {firstSegment.departure?.iataCode}
            </Text>
          </View>

          <View style={styles.durationBlock}>
            <View style={styles.flightLine}>
              <View style={styles.dot} />
              <View style={styles.line} />
              <View style={styles.dot} />
            </View>
            <Text variant="bodySmall" style={styles.duration}>
              {formatDuration(firstItinerary.duration)}
            </Text>
            <Text variant="bodySmall" style={[styles.stops, stops === 0 ? styles.direct : styles.withStops]}>
              {stops === 0 ? "Direct" : `${stops} Stop`}
            </Text>
          </View>

          <View style={styles.timeBlock}>
            <Text variant="bodyMedium" style={styles.time}>
              {formatTime(firstSegment.arrival?.at)}
            </Text>
            <Text variant="bodySmall" style={styles.airportCode}>
              {firstSegment.arrival?.iataCode}
            </Text>
          </View>
        </View>

        {/* Bottom row: Cities and select button */}
        <View style={styles.bottomRow}>
          <View style={styles.cityBlock}>
            <Text variant="bodySmall" style={styles.city}>
              {departureCity}
            </Text>
            <Text variant="bodySmall" style={styles.city}>
              {arrivalCity}
            </Text>
          </View>
          <View style={styles.actionBlock}>
            <Text variant="bodySmall" style={styles.flightNumber}>
              {carrierCode} {firstSegment.number}
            </Text>
            <Button
              mode="contained"
              style={styles.bookButton}
              labelStyle={styles.bookButtonLabel}
              onPress={handleSubmit}
              compact
            >
              Select
            </Button>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 6,
    marginBottom: 4, // Reduced for all cards
    borderRadius: 6,
    backgroundColor: '#f5faff', // Brighter background
  },
  lastCard: {
    marginBottom: 0, // No margin for the last card
  },
  content: {
    padding: 8,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  airlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 20,
    height: 20,
    resizeMode: "contain",
    marginRight: 4,
  },
  airlineName: {
    fontWeight: '700', // Bold
    color: '#0052cc', // Brighter blue
    fontSize: 12,
  },
  price: {
    fontWeight: '700', // Bold
    color: '#0052cc', // Brighter blue
    fontSize: 14,
  },
  middleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  timeBlock: {
    alignItems: 'center',
    minWidth: 50,
  },
  time: {
    fontWeight: '700', // Bold
    color: '#0052cc', // Brighter blue
    fontSize: 14,
    marginBottom: 1,
  },
  airportCode: {
    fontWeight: '700', // Bold
    color: '#4a5568', // Brighter gray
    fontSize: 11,
  },
  durationBlock: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 4,
  },
  flightLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#b0bec5', // Brighter gray
  },
  line: {
    height: 1,
    width: 25,
    backgroundColor: '#b0bec5', // Brighter gray
    marginHorizontal: 2,
  },
  duration: {
    fontWeight: '700', // Bold
    color: '#4a5568', // Brighter gray
    fontSize: 10,
    marginBottom: 2,
  },
  stops: {
    fontWeight: '700', // Bold
    fontSize: 10,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  direct: {
    backgroundColor: '#d4f4d4', // Brighter green
    color: '#1e7b1e', // Brighter green
  },
  withStops: {
    backgroundColor: '#ffeedd', // Brighter orange
    color: '#d97706', // Brighter orange
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cityBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '40%',
  },
  city: {
    fontWeight: '700', // Bold
    color: '#4a5568', // Brighter gray
    fontSize: 10,
  },
  actionBlock: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flightNumber: {
    fontWeight: '700', // Bold
    color: '#4a5568', // Brighter gray
    fontSize: 10,
    marginRight: 6,
  },
  bookButton: {
    borderRadius: 4,
    backgroundColor: '#007bff', // Brighter blue
    minWidth: 60, // Reduced for thinner button
    paddingHorizontal: 8, // Added to control padding
  },
  bookButtonLabel: {
    fontWeight: '700', // Bold
    fontSize: 11,
    color: '#ffffff',
  },
  errorText: {
    fontWeight: '700', // Bold
    color: '#dc3545',
    textAlign: "center",
    marginBottom: 6,
    fontSize: 11,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});