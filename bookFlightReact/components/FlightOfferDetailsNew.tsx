import { useAppContext } from "@/context/AppContextProvider";
import { formatDate, formatTime } from "@/utils/helper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View, Image } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Card, Divider, Text } from "react-native-paper";

// Airline mappings
const carrierCodeToName: { [key: string]: string } = {
  AS: "Alaska Airlines", UA: "United", DL: "Delta", AA: "American",
  WN: "Southwest", B6: "JetBlue", NK: "Spirit", F9: "Frontier",
};

// City mappings
const iataToCity: { [key: string]: string } = {
  EWR: "Newark", LAX: "Los Angeles", JFK: "New York", LGA: "New York",
  ORD: "Chicago", DFW: "Dallas", DEN: "Denver", SFO: "San Francisco",
  LAS: "Las Vegas", MCO: "Orlando", MIA: "Miami", BOS: "Boston", ATL: "Atlanta", SEA: "Seattle",
};

// Aircraft mappings
const aircraftCodeToName: { [key: string]: string } = {
  "738": "Boeing 737-800", "739": "Boeing 737-900ER", "320": "Airbus A320",
  "321": "Airbus A321", "789": "Boeing 787-9", "77W": "Boeing 777-300ER",
};

const getAirlineIconURL = (code: string) =>
  `https://content.airhex.com/content/logos/airlines_${code.toUpperCase()}_100_100_s.png`;

export default function FlightOfferDetailsNew() {
  const { selectedFlightOffer: flightData } = useAppContext();

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

  if (!parsedFlightData) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>No flight details available</Text>
      </View>
    );
  }

  const itineraries = parsedFlightData.itineraries || [];
  const priceInfo = parsedFlightData.price || {};

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {itineraries.map((itinerary: any, index: number) => (
        <View key={index} style={styles.itineraryBlock}>
          {/* Trip header */}
          <View style={[styles.tripHeader, index === 0 ? styles.outbound : styles.return]}>
            <MaterialCommunityIcons
              name={index === 0 ? "airplane-takeoff" : "airplane-landing"}
              size={14}
              color="#fff"
            />
            <Text style={styles.tripTitle}>
              {index === 0 ? "Outbound" : "Return"}
            </Text>
            <Text style={styles.tripDuration}>
              {itinerary.duration.replace("PT", "").replace("H", "h ").replace("M", "m")}
            </Text>
          </View>

          {itinerary.segments?.map((segment: any, segIdx: number) => {
            const carrierCode = segment.carrierCode || "";
            const airlineName = carrierCodeToName[carrierCode] || carrierCode;
            const aircraft = aircraftCodeToName[segment.aircraft?.code] || segment.aircraft?.code;

            return (
              <Card key={segIdx} style={styles.card}>
                <Card.Content style={styles.cardContent}>
                  {/* Airline */}
                  <View style={styles.airlineRow}>
                    <Image source={{ uri: getAirlineIconURL(carrierCode) }} style={styles.logo} />
                    <View>
                      <Text style={styles.airline}>{airlineName}</Text>
                      <Text style={styles.subText}>
                        {carrierCode} {segment.number} • {aircraft}
                      </Text>
                    </View>
                  </View>

                  <Divider style={styles.divider} />

                  {/* Route timeline */}
                  <View style={styles.routeRow}>
                    <View style={styles.cityBlock}>
                      <Text style={styles.time}>{formatTime(segment.departure?.at)}</Text>
                      <Text style={styles.code}>{segment.departure?.iataCode}</Text>
                      <Text style={styles.city}>
                        {iataToCity[segment.departure?.iataCode] || segment.departure?.iataCode}
                      </Text>
                    </View>

                    <View style={styles.timeline}>
                      <View style={styles.lineRow}>
                        <View style={styles.dot} />
                        <View style={styles.line} />
                        <MaterialCommunityIcons name="airplane" size={14} color="#1A73E8" />
                      </View>
                      <Text style={styles.segmentDuration}>
                        {segment.duration.replace("PT", "").replace("H", "h ").replace("M", "m")}
                      </Text>
                    </View>

                    <View style={styles.cityBlock}>
                      <Text style={styles.time}>{formatTime(segment.arrival?.at)}</Text>
                      <Text style={styles.code}>{segment.arrival?.iataCode}</Text>
                      <Text style={styles.city}>
                        {iataToCity[segment.arrival?.iataCode] || segment.arrival?.iataCode}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.dateRow}>
                    <Text style={styles.date}>{formatDate(segment.departure?.at)}</Text>
                    <Text style={styles.date}>{formatDate(segment.arrival?.at)}</Text>
                  </View>
                </Card.Content>
              </Card>
            );
          })}
        </View>
      ))}

      {/* Price breakdown */}
      <Card style={styles.priceCard}>
        <Card.Content>
          <View style={styles.priceRow}>
            <Text style={styles.label}>Base Fare</Text>
            <Text style={styles.value}>{priceInfo.currency} {priceInfo.base}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.label}>Taxes & Fees</Text>
            <Text style={styles.value}>
              {priceInfo.currency} {(parseFloat(priceInfo.total) - parseFloat(priceInfo.base)).toFixed(2)}
            </Text>
          </View>
          <Divider style={styles.priceDivider} />
          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{priceInfo.currency} {priceInfo.total}</Text>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f7fa" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { fontSize: 13, fontWeight: "600", color: "#D93025" },

  itineraryBlock: { marginBottom: 8 },
  tripHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 10, paddingVertical: 6, marginHorizontal: 12,
    borderRadius: 4,
  },
  outbound: { backgroundColor: "#4a6cf7" },
  return: { backgroundColor: "#0B8043" },
  tripTitle: { fontSize: 12, fontWeight: "700", color: "#fff", flex: 1, marginLeft: 6 },
  tripDuration: { fontSize: 11, fontWeight: "600", color: "#fff" },

  card: {
    marginHorizontal: 12, marginVertical: 4,
    borderRadius: 6, backgroundColor: "#fff",
    borderWidth: 1, borderColor: "#E0E0E0",
  },
  cardContent: { paddingVertical: 8, paddingHorizontal: 10 },

  airlineRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  logo: { width: 24, height: 24, borderRadius: 4, marginRight: 8 },
  airline: { fontSize: 13, fontWeight: "700", color: "#202124" },
  subText: { fontSize: 11, color: "#5F6368" },

  divider: { marginVertical: 8, backgroundColor: "#f1f1f1", height: 1 },

  routeRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  cityBlock: { alignItems: "center", minWidth: 60 },
  time: { fontSize: 13, fontWeight: "700", color: "#202124" },
  code: { fontSize: 12, fontWeight: "700", color: "#1A73E8" },
  city: { fontSize: 10, color: "#5F6368", textAlign: "center" },

  timeline: { alignItems: "center", minWidth: 70 },
  lineRow: { flexDirection: "row", alignItems: "center" },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "#1A73E8" },
  line: { width: 60, height: 1.5, backgroundColor: "#1A73E8", marginHorizontal: 3 },
  segmentDuration: { fontSize: 10, fontWeight: "600", color: "#5F6368", marginTop: 2 },

  dateRow: { flexDirection: "row", justifyContent: "space-between" },
  date: { fontSize: 10, color: "#9AA0A6" },

  priceCard: { margin: 12, borderRadius: 6, backgroundColor: "#fff", borderWidth: 1, borderColor: "#E0E0E0" },
  priceRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  label: { fontSize: 12, color: "#5F6368" },
  value: { fontSize: 12, fontWeight: "600", color: "#202124" },
  priceDivider: { marginVertical: 6, backgroundColor: "#E0E0E0", height: 1 },
  totalLabel: { fontSize: 13, fontWeight: "700", color: "#202124" },
  totalValue: { fontSize: 13, fontWeight: "800", color: "#1A73E8" },
});
