import { theme } from "@/themes/theme";
import { FlightOffer } from "@/types";
import * as React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Card } from "react-native-paper";

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
  isLast = false,
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

  const formatDate = (dateTime: string) => {
    if (!dateTime) return "N/A";
    const date = new Date(dateTime);
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
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
            <TouchableOpacity onPress={handleSubmit} disabled>
              <Text style={styles.selectText}>Select</Text>
            </TouchableOpacity>
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
            <TouchableOpacity onPress={handleSubmit} disabled>
              <Text style={styles.selectText}>Select</Text>
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>
    );
  }

  const carrierCode = firstSegment.carrierCode || "";
  const airlineName = carrierCodeToName[carrierCode] || carrierCode;
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

        {/* Bottom row: Date and select text */}
        <View style={styles.bottomRow}>
          <Text variant="bodySmall" style={styles.flightDate}>
            {formatDate(firstSegment.departure?.at)}
          </Text>
          <TouchableOpacity onPress={handleSubmit}>
            <Text style={styles.selectText}>Select</Text>
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 6,
    marginBottom: 4,
    borderRadius: 6,
    backgroundColor: '#f5faff',
  },
  lastCard: {
    marginBottom: 80, // Increased margin to account for bottom tab height
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
    fontWeight: '700',
    color: '#0052cc',
    fontSize: 12,
  },
  price: {
    fontWeight: '700',
    color: '#0052cc',
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
    fontWeight: '700',
    color: '#0052cc',
    fontSize: 14,
    marginBottom: 1,
  },
  airportCode: {
    fontWeight: '700',
    color: '#4a5568',
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
    backgroundColor: '#b0bec5',
  },
  line: {
    height: 1,
    width: 25,
    backgroundColor: '#b0bec5',
    marginHorizontal: 2,
  },
  duration: {
    fontWeight: '700',
    color: '#4a5568',
    fontSize: 10,
    marginBottom: 2,
  },
  stops: {
    fontWeight: '700',
    fontSize: 10,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  direct: {
    backgroundColor: '#d4f4d4',
    color: '#1e7b1e',
  },
  withStops: {
    backgroundColor: '#ffeedd',
    color: '#d97706',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flightDate: {
    fontWeight: '700',
    color: '#4a5568',
    fontSize: 10,
  },
  selectText: {
    fontWeight: '700',
    color: '#007bff',
    fontSize: 11,
  },
  errorText: {
    fontWeight: '700',
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