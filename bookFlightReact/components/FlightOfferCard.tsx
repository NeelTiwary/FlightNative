import { FlightOffer } from "@/types";
import * as React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Card } from "react-native-paper";

const carrierCodeToName: { [key: string]: string } = {
  DL: "Delta", AA: "American", UA: "United", WN: "Southwest",
  B6: "JetBlue", NK: "Spirit", F9: "Frontier", AI: "Air India",
  "6E": "IndiGo", SG: "SpiceJet", UK: "Vistara", TK: "Turkish",
  AS: "Alaska", LH: "Lufthansa", KL: "KLM", QR: "Qatar Airways",
  AF: "Air France",
};

const iataToCity: { [key: string]: string } = {
  EWR: "Newark", LAX: "Los Angeles", JFK: "NYC", LGA: "NYC",
  ORD: "Chicago", DFW: "Dallas", DEN: "Denver", SFO: "SF",
  BOM: "Mumbai", FRA: "Frankfurt", AMS: "Amsterdam", DOH: "Doha",
  CDG: "Paris", MUC: "Munich",
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
        return typeof flightData.pricingAdditionalInfo === "string"
          ? JSON.parse(flightData.pricingAdditionalInfo)
          : flightData.pricingAdditionalInfo;
      }
      return flightData;
    } catch {
      return flightData;
    }
  }, [flightData]);

  const formatTime = (dateTime: string) =>
    dateTime ? new Date(dateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "N/A";

  const formatDate = (dateTime: string) =>
    dateTime ? new Date(dateTime).toLocaleDateString([], { month: "short", day: "numeric" }) : "N/A";

  const formatDuration = (duration: string) =>
    duration ? duration.replace("PT", "").replace("H", "h ").replace("M", "m").trim() : "N/A";

  if (!parsedFlightData) return null;
  const itineraries = parsedFlightData.itineraries || [];
  const priceInfo = parsedFlightData.price || {};

  const renderTrip = (itinerary: any, tripLabel: string, index: number) => {
    const first = itinerary?.segments?.[0];
    if (!first) return null;
    const last = itinerary.segments[itinerary.segments.length - 1];
    const carrierCode = first.carrierCode || "";
    const airlineName = carrierCodeToName[carrierCode] || carrierCode;
    const stops = Math.max(0, itinerary.segments.length - 1);
    const layover =
      stops === 1 && itinerary.segments[1]
        ? iataToCity[itinerary.segments[0].arrival.iataCode] || itinerary.segments[0].arrival.iataCode
        : null;

    return (
      <View key={index} style={styles.tripContainer}>
        <Text style={styles.tripLabel}>{tripLabel}</Text>
        <View style={styles.topRow}>
          <View style={styles.airlineRow}>
            <Image source={{ uri: getAirlineIconURL(carrierCode) }} style={styles.logo} />
            <Text style={styles.airlineName}>{airlineName}</Text>
          </View>
          {index === 0 && (
            <Text style={styles.price}>
              {priceInfo.currency || "INR"} {priceInfo.total || "N/A"}
            </Text>
          )}
        </View>

        <View style={styles.middleRow}>
          <View style={styles.timeBlock}>
            <Text style={styles.time}>{formatTime(first.departure?.at)}</Text>
            <Text style={styles.airportCode}>{first.departure?.iataCode}</Text>
            <Text style={styles.flightDate}>{formatDate(first.departure?.at)}</Text>
          </View>

          <View style={styles.durationBlock}>
            <View style={styles.flightLine}>
              <View style={styles.dot} />
              <View style={styles.line} />
              <View style={styles.dot} />
            </View>
            <Text style={styles.duration}>{formatDuration(itinerary.duration)}</Text>
            <Text style={[styles.stops, stops === 0 ? styles.direct : styles.withStops]}>
              {stops === 0 ? "Direct" : `${stops} Stop`}
            </Text>
            {layover && <Text style={styles.layover}>via {layover}</Text>}
          </View>

          <View style={styles.timeBlock}>
            <Text style={styles.time}>{formatTime(last?.arrival?.at)}</Text>
            <Text style={styles.airportCode}>{last?.arrival?.iataCode}</Text>
            <Text style={styles.flightDate}>{formatDate(last?.arrival?.at)}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <TouchableOpacity onPress={handleSubmit} activeOpacity={0.8}>
      <Card style={[styles.card, isLast && styles.lastCard]}>
        <Card.Content style={styles.content}>
          {itineraries.map((it: any, idx: number) =>
            renderTrip(it, idx === 0 ? "Outbound" : "Return", idx)
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 1,
    marginVertical: 0,
    borderRadius: 6,
    backgroundColor: "#fff",
    elevation: 1,
  },
  lastCard: { marginBottom: 20 },
  content: { padding: 6 },
  tripContainer: { marginBottom: 6 },
  tripLabel: {
    fontWeight: "600",
    color: "#555",
    fontSize: 9,
    marginBottom: 2,
    textTransform: "uppercase",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 0,
  },
  airlineRow: { flexDirection: "row", alignItems: "center" },
  logo: { width: 16, height: 16, resizeMode: "contain", marginRight: 3 },
  airlineName: { fontWeight: "500", fontSize: 10, color: "#222" },
  price: { fontWeight: "700", color: "#0a7d25", fontSize: 11 },
  middleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timeBlock: { alignItems: "center", minWidth: 36 },
  time: { fontWeight: "600", fontSize: 11, color: "#222" },
  airportCode: { fontWeight: "500", fontSize: 9, color: "#666" },
  flightDate: { fontSize: 8, color: "#999" },
  durationBlock: { alignItems: "center", flex: 1 },
  flightLine: { flexDirection: "row", alignItems: "center", marginBottom: 1 },
  dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: "#0052cc" },
  line: { height: 1, flex: 1, backgroundColor: "#ccc", marginHorizontal: 2 },
  duration: { fontSize: 8, color: "#444", marginBottom: 1 },
  stops: { fontSize: 8, paddingHorizontal: 3, borderRadius: 5, overflow: "hidden" },
  direct: { backgroundColor: "#d4f4d4", color: "#1e7b1e" },
  withStops: { backgroundColor: "#ffeedd", color: "#d97706" },
  layover: { fontSize: 8, color: "#666" },
});
