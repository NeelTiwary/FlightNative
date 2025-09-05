import { theme } from "@/themes/theme";
import { FlightOffer } from "@/types";
import * as React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Card } from "react-native-paper";

const carrierCodeToName = {
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

const iataToCity = {
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
}) {
  const parsedFlightData = React.useMemo(() => {
    if (!flightData) return null;
    try {
      if (flightData.pricingAdditionalInfo) {
        return typeof flightData.pricingAdditionalInfo === "string"
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
    return duration.replace("PT", "").replace("H", "h ").replace("M", "m").trim();
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

  if (itineraries.length === 0) {
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

  const outbound = itineraries[0];
  const obFirst = outbound.segments[0];
  const obLast = outbound.segments[outbound.segments.length - 1];
  const carrierCode = obFirst.carrierCode || "";
  const airlineName = carrierCodeToName[carrierCode] || carrierCode;
  const obStops = Math.max(0, outbound.segments.length - 1);
  const obLayover =
    obStops === 1 && outbound.segments[1]
      ? iataToCity[outbound.segments[0].arrival.iataCode] ||
        outbound.segments[0].arrival.iataCode
      : null;
  const obDuration = formatDuration(outbound.duration);

  let arrivalSegment = obLast;
  if (itineraries.length > 1) {
    const returning = itineraries[1];
    arrivalSegment = returning.segments[returning.segments.length - 1];
  }

  return (
    <Card style={[styles.card, isLast && styles.lastCard]} elevation={0}>
      <Card.Content style={styles.content}>
        <View style={styles.condensedRow}>
          {/* Departure block */}
          <View style={styles.timeBlock}>
            <Text style={styles.time}>{formatTime(obFirst.departure.at)}</Text>
            <Text style={styles.airportCode}>{obFirst.departure.iataCode}</Text>
            <Text style={styles.flightDate}>{formatDate(obFirst.departure.at)}</Text>
          </View>

          {/* Flight line and info */}
          <View style={styles.centerBlock}>
            <View style={styles.flightLine}>
              <View style={styles.dot} />
              <View style={styles.line} />
              <View style={styles.dot} />
            </View>
            <Text
              style={[
                styles.stops,
                obStops === 0 ? styles.direct : styles.withStops,
              ]}
            >
              {obStops === 0 ? "Direct" : `${obStops} Stop`}
            </Text>
            {obLayover && <Text style={styles.layover}>via {obLayover}</Text>}
            <Text style={styles.duration}>{obDuration}</Text>
          </View>

          {/* Arrival block */}
          <View style={styles.timeBlock}>
            <Text style={styles.time}>{formatTime(arrivalSegment.arrival.at)}</Text>
            <Text style={styles.airportCode}>{arrivalSegment.arrival.iataCode}</Text>
            <Text style={styles.flightDate}>{formatDate(arrivalSegment.arrival.at)}</Text>
          </View>
        </View>

        {/* Airline + Logo + Price */}
        <View style={styles.priceRow}>
          <View style={styles.airlineRow}>
            <Image
              source={{ uri: getAirlineIconURL(carrierCode) }}
              style={styles.logo}
            />
            <Text style={styles.airlineName}>{airlineName}</Text>
          </View>
          <Text style={styles.price}>
            {priceInfo.currency || "INR"} {priceInfo.total || "N/A"}
          </Text>
        </View>

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
    backgroundColor: "#e6ecf3ff",
  },
  lastCard: {
    marginBottom: 40,
  },
  content: {
    padding: 6,
  },
  condensedRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  timeBlock: {
    alignItems: "center",
    minWidth: 60,
  },
  centerBlock: {
    flex: 1,
    alignItems: "center",
  },
  flightLine: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
    marginTop: 2,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#0b4a69ff",
    marginTop: 7,
  },
  line: {
    height: 1.5,
    width: 42,
    backgroundColor: "#85c6e7ff",
    marginHorizontal: 2,
    marginTop: 7,
  },
  stops: {
    fontWeight: "600",
    fontSize: 9,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 1,
  },
  direct: {
    backgroundColor: "#d4f4d4",
    color: "#1e7b1e",
  },
  withStops: {
    backgroundColor: "#ffeedd",
    color: "#d97706",
  },
  layover: {
    fontWeight: "600",
    color: "#4a5568",
    fontSize: 8,
    marginBottom: 1,
  },
  duration: {
    fontWeight: "600",
    color: "#4a5568",
    fontSize: 8,
    marginBottom: 1,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
    marginBottom: 2,
  },
  airlineRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  airlineName: {
    fontWeight: "700",
    color: "#0052cc",
    fontSize: 11,
    marginLeft: 4,
  },
  price: {
    fontWeight: "700",
    color: "#078610ff",
    fontSize: 12,
  },
  selectText: {
    fontWeight: "700",
    color: "#5f9bdbff",
    fontSize: 9,
  },
  errorText: {
    fontWeight: "700",
    color: "#dc3545",
    textAlign: "center",
    marginBottom: 4,
    fontSize: 9,
  },
  airportCode: {
    fontWeight: "600",
    color: "#4a5568",
    fontSize: 9,
    marginBottom: 1,
  },
  time: {
    fontWeight: "700",
    color: "#0052cc",
    fontSize: 12,
    marginBottom: 1,
  },
  flightDate: {
    fontWeight: "600",
    color: "#4a5568",
    fontSize: 8,
  },
  logo: {
    width: 18,
    height: 18,
    resizeMode: "contain",
    marginTop: 8,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
