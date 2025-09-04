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
  LH: "Lufthansa",
  KL: "KLM",
  QR: "Qatar Airways",
  AF: "Air France",
};

const iataToCity: { [key: string]: string } = {
  EWR: "Newark",
  LAX: "Los Angeles",
  JFK: "NYC",
  LGA: "NYC",
  ORD: "Chicago",
  DFW: "Dallas",
  DEN: "Denver",
  SFO: "SF",
  BOM: "Mumbai",
  FRA: "Frankfurt",
  AMS: "Amsterdam",
  DOH: "Doha",
  CDG: "Paris",
  MUC: "Munich",
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

  if (!itineraries.length) {
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

  // Render a single trip (outbound or return)
  const renderTrip = (itinerary: any, tripLabel: string, index: number) => {
    const firstSegment = itinerary?.segments?.[0];
    if (!firstSegment) return null;

    // Get the last segment for arrival details
    const lastSegment = itinerary.segments[itinerary.segments.length - 1];
    const carrierCode = firstSegment.carrierCode || "";
    const airlineName = carrierCodeToName[carrierCode] || carrierCode;
    const stops = Math.max(0, itinerary.segments.length - 1);
    // Get layover airport for one-stop flights
    const layoverAirport =
      stops === 1 && itinerary.segments[1]
        ? iataToCity[itinerary.segments[0].arrival.iataCode] ||
          itinerary.segments[0].arrival.iataCode
        : null;

    return (
      <View key={`trip-${index}`} style={styles.tripContainer}>
        <Text style={styles.tripLabel}>{tripLabel}</Text>
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
          {index === 0 && (
            <Text variant="titleSmall" style={styles.price}>
              {priceInfo.currency || "INR"} {priceInfo.total || "N/A"}
            </Text>
          )}
        </View>
        <View style={styles.middleRow}>
          <View style={styles.timeBlock}>
            <Text variant="bodyMedium" style={styles.time}>
              {formatTime(firstSegment.departure?.at)}
            </Text>
            <Text variant="bodySmall" style={styles.airportCode}>
              {firstSegment.departure?.iataCode}
            </Text>
            <Text variant="bodySmall" style={styles.flightDate}>
              {formatDate(firstSegment.departure?.at)}
            </Text>
          </View>
          <View style={styles.durationBlock}>
            <View style={styles.flightLine}>
              <View style={styles.dot} />
              <View style={styles.line} />
              <View style={styles.dot} />
            </View>
            <Text variant="bodySmall" style={styles.duration}>
              {formatDuration(itinerary.duration)}
            </Text>
            <Text
              variant="bodySmall"
              style={[styles.stops, stops === 0 ? styles.direct : styles.withStops]}
            >
              {stops === 0 ? "Direct" : `${stops} Stop`}
            </Text>
            {layoverAirport && (
              <Text variant="bodySmall" style={styles.layover}>
                via {layoverAirport}
              </Text>
            )}
          </View>
          <View style={styles.timeBlock}>
            <Text variant="bodyMedium" style={styles.time}>
              {formatTime(lastSegment?.arrival?.at)}
            </Text>
            <Text variant="bodySmall" style={styles.airportCode}>
              {lastSegment?.arrival?.iataCode}
            </Text>
            <Text variant="bodySmall" style={styles.flightDate}>
              {formatDate(lastSegment?.arrival?.at)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <Card style={[styles.card, isLast && styles.lastCard]} elevation={0}>
      <Card.Content style={styles.content}>
        {itineraries.map((itinerary: any, index: number) =>
          renderTrip(itinerary, index === 0 ? "Outbound" : "Return", index)
        )}
        <View style={styles.footer}>
          <View style={{ flex: 1 }} />
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
    marginHorizontal: 4,
    marginBottom: 2,
    borderRadius: 4,
    backgroundColor: '#e6ecf3ff',
  },
  lastCard: {
    marginBottom: 40,
  },
  content: {
    padding: 6,
  },
  tripContainer: {
    marginBottom: 8,
  },
  tripLabel: {
    fontWeight: '700',
    color: '#4a5568',
    fontSize: 10,
    marginBottom: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  airlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 20,
    height: 20,
    resizeMode: "contain",
    marginRight: 3,
  },
  airlineName: {
    fontWeight: '700',
    color: '#0052cc',
    fontSize: 10,
  },
  price: {
    fontWeight: '700',
    color: '#078610ff',
    fontSize: 12,
  },
  middleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  timeBlock: {
    alignItems: 'center',
    minWidth: 40,
  },
  time: {
    fontWeight: '700',
    color: '#0052cc',
    fontSize: 12,
    marginBottom: 1,
  },
  airportCode: {
    fontWeight: '600',
    color: '#4a5568',
    fontSize: 9,
    marginBottom: 1,
  },
  flightDate: {
    fontWeight: '600',
    color: '#4a5568',
    fontSize: 8,
  },
  durationBlock: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 3,
  },
  flightLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 1,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#0b4a69ff',
    marginTop: 10,
  },
  line: {
    height: 1,
    width: 80,
    backgroundColor: '#85c6e7ff',
    marginHorizontal: 2,
    marginTop: 10,
  },
  duration: {
    fontWeight: '600',
    color: '#4a5568',
    fontSize: 8,
    marginBottom: 1,
  },
  stops: {
    fontWeight: '600',
    fontSize: 8,
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 6,
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
  layover: {
    fontWeight: '600',
    color: '#4a5568',
    fontSize: 8,
    marginTop: 1,
  },
  selectText: {
    fontWeight: '700',
    color: '#5f9bdbff',
    fontSize: 9,
  },
  errorText: {
    fontWeight: '700',
    color: '#dc3545',
    textAlign: "center",
    marginBottom: 4,
    fontSize: 9,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});