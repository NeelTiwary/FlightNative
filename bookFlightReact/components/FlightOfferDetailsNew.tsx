import { useAppContext } from "@/context/AppContextProvider";
import { formatDate, formatTime } from "@/utils/helper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View, Image } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Card, Chip, Divider, Text } from "react-native-paper";

// Enhanced mappings
const carrierCodeToName: { [key: string]: string } = {
  AS: "Alaska Airlines",
  UA: "United Airlines",
  DL: "Delta Air Lines",
  AA: "American Airlines",
  WN: "Southwest Airlines",
  B6: "JetBlue Airways",
  NK: "Spirit Airlines",
  F9: "Frontier Airlines",
  // Add more as needed
};

const iataToCity: { [key: string]: string } = {
  EWR: "Newark Liberty International Airport",
  LAX: "Los Angeles International Airport",
  JFK: "John F. Kennedy International Airport",
  LGA: "LaGuardia Airport",
  ORD: "Chicago O'Hare International Airport",
  DFW: "Dallas/Fort Worth International Airport",
  DEN: "Denver International Airport",
  SFO: "San Francisco International Airport",
  LAS: "McCarran International Airport",
  MCO: "Orlando International Airport",
  MIA: "Miami International Airport",
  BOS: "Logan International Airport",
  ATL: "Hartsfield-Jackson Atlanta International Airport",
  SEA: "Seattle-Tacoma International Airport",
  // Add more as needed
};

const aircraftCodeToName: { [key: string]: string } = {
  "73J": "Boeing 737-900",
  "738": "Boeing 737-800",
  "739": "Boeing 737-900ER",
  "320": "Airbus A320",
  "321": "Airbus A321",
  "789": "Boeing 787-9 Dreamliner",
  "77W": "Boeing 777-300ER",
  // Add more as needed
};

const getAirlineIconURL = (code: string) =>
  `https://content.airhex.com/content/logos/airlines_${code.toUpperCase()}_100_100_s.png`;

export default function FlightOfferDetailsNew() {
  const { selectedFlightOffer: flightData } = useAppContext();

  // Parse the flight data
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

  if (!parsedFlightData) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No flight details available</Text>
      </View>
    );
  }

  const itineraries = parsedFlightData.itineraries || [];
  const priceInfo = parsedFlightData.price || {};

  return (
    <ScrollView style={styles.container}>
      {itineraries.map((itinerary: any, index: number) => (
        <View key={index}>
          <Chip icon={"airplane-takeoff"} style={styles.tripChip}>
            {index === 0 ? "Outbound Flight" : "Return Flight"}
          </Chip>

          {itinerary.segments && itinerary.segments.map((segment: any, segIdx: number) => {
            const carrierCode = segment.carrierCode || "";
            const airlineName = carrierCodeToName[carrierCode] || carrierCode;
            const aircraft = aircraftCodeToName[segment.aircraft?.code] || segment.aircraft?.code;

            return (
              <View key={segIdx} style={{ marginBottom: 24 }}>
                <Card style={styles.card}>
                  <Card.Title
                    title={airlineName}
                    titleStyle={styles.airlineName}
                    left={() => (
                      <Image
                        source={{ uri: getAirlineIconURL(carrierCode) }}
                        style={styles.airlineLogo}
                        onError={() => console.log("Failed to load airline logo for:", carrierCode)}
                      />
                    )}
                  />
                  <Card.Content>
                    <View style={styles.timelineRow}>
                      <View style={styles.cityBlock}>
                        <Text style={styles.city}>
                          {iataToCity[segment.departure?.iataCode] || segment.departure?.iataCode}
                        </Text>
                        <Text style={styles.time}>
                          {formatTime(segment.departure?.at)}
                        </Text>
                        <Text style={styles.date}>
                          {formatDate(segment.departure?.at)}
                        </Text>
                      </View>

                      <View style={styles.timelineLineHorizontal}>
                        <View style={styles.timelineDot} />
                        <View style={styles.timelineLineMid} />
                        <View style={styles.timelineDot} />
                      </View>

                      <View style={styles.cityBlock}>
                        <Text style={styles.city}>
                          {iataToCity[segment.arrival?.iataCode] || segment.arrival?.iataCode}
                        </Text>
                        <Text style={styles.time}>
                          {formatTime(segment.arrival?.at)}
                        </Text>
                        <Text style={styles.date}>
                          {formatDate(segment.arrival?.at)}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.flightInfo}>
                      Duration: {segment.duration || "N/A"}
                    </Text>

                    <Divider style={styles.divider} />

                    <View style={styles.row}>
                      <Text style={styles.infoLabel}>Flight Number</Text>
                      <Text style={styles.infoValue}>
                        {carrierCode} {segment.number}
                      </Text>
                    </View>

                    <View style={styles.row}>
                      <Text style={styles.infoLabel}>Aircraft</Text>
                      <Text style={styles.infoValue}>{aircraft}</Text>
                    </View>

                    <View style={styles.row}>
                      <Text style={styles.infoLabel}>Cabin</Text>
                      <Text style={styles.infoValue}>
                        {parsedFlightData.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin || "Economy"}
                      </Text>
                    </View>
                  </Card.Content>
                </Card>
              </View>
            );
          })}
        </View>
      ))}

      <View style={styles.priceInfo}>
        <Text style={styles.totalPrice}>
          Total: {priceInfo.currency} {priceInfo.total}
        </Text>
        <Text style={styles.basePrice}>
          Base Fare: {priceInfo.currency} {priceInfo.base}
        </Text>
      </View>
    </ScrollView>
  );
}

// Keep the same styles as before

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
    backgroundColor: "#fff", // flat white background
  },
  tripChip: {
    alignSelf: "flex-start",
    marginVertical: 4,
    backgroundColor: "transparent",
    fontSize: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 0, // no rounded corners
    shadowOpacity: 0, // no shadows
    elevation: 0,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "#e5e5e5", // thin gray line separation
  },
  airlineLogo: {
    width: 32,
    height: 32,
    marginRight: 6,
  },
  airlineName: {
    fontWeight: "500",
    fontSize: 14,
    color: "#111",
  },
  timelineRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  cityBlock: {
    flex: 1,
    alignItems: "center",
  },
  city: {
    fontSize: 13,
    fontWeight: "500",
    color: "#333",
    marginBottom: 1,
    textAlign: "center",
  },
  time: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111",
  },
  date: {
    fontSize: 10,
    color: "#666",
  },
  timelineLineHorizontal: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginHorizontal: 6,
  },
  timelineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#5d16ce",
  },
  timelineLineMid: {
    flex: 1,
    height: 1,
    backgroundColor: "#ddd",
  },
  flightInfo: {
    textAlign: "center",
    marginVertical: 4,
    fontSize: 11,
    color: "#0088cc",
  },
  divider: {
    marginVertical: 6,
    backgroundColor: "#e5e5e5",
    height: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  infoLabel: {
    fontWeight: "500",
    color: "#555",
    fontSize: 11,
  },
  infoValue: {
    fontWeight: "500",
    color: "#111",
    fontSize: 11,
  },
  priceInfo: {
    marginTop: 11,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderColor: "#e5e5e5",
  },
  totalPrice: {
    fontWeight: "700",
    fontSize: 15,
    color: "#111",
    marginBottom: 1,
  },
  basePrice: {
    fontSize: 12,
    color: "#555",
  },
});
