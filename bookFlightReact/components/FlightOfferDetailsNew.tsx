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
    padding: 16,
    backgroundColor: "#f8f9fb",
  },
  tripChip: {
    alignSelf: "flex-start",
    marginBottom: 12,
    backgroundColor: "rgba(93, 16, 206, 0.15)",
  },
  card: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    paddingBottom: 6,
  },
  airlineLogo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 8,
  },
  airlineName: {
    fontWeight: "600",
    fontSize: 16,
    color: "#222",
  },
  timelineRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 12,
  },
  cityBlock: {
    flexDirection: "column",
    alignItems: "center",
    flex: 1,
  },
  city: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  time: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#5d16ce",
  },
  date: {
    fontSize: 13,
    color: "#777",
  },
  timelineLineHorizontal: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginHorizontal: 10,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#5d16ce",
  },
  timelineLineMid: {
    flex: 1,
    height: 2,
    backgroundColor: "#ccc",
  },
  flightInfo: {
    textAlign: "center",
    marginVertical: 8,
    fontStyle: "italic",
    color: "#0088cc",
  },
  divider: {
    marginVertical: 12,
    backgroundColor: "#ddd",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  infoLabel: {
    fontWeight: "600",
    color: "#555",
    fontSize: 14,
  },
  infoValue: {
    fontWeight: "500",
    color: "#222",
  },
  amenitiesTitle: {
    marginTop: 12,
    marginBottom: 6,
    fontWeight: "600",
    fontSize: 14,
    color: "#333",
  },
  amenities: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  amenityChip: {
    backgroundColor: "rgba(93, 16, 206, 0.12)",
  },
  amenityText: {
    fontSize: 12,
    fontWeight: "500",
  },
  stopoverContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
    gap: 6,
  },
  stopoverText: {
    fontSize: 14,
    color: "#0088cc",
  },
  errorText: {
    fontSize: 14,
    color: "#d32f2f",
    textAlign: "center",
    marginVertical: 10,
  },
  priceInfo: {
    marginTop: 16,
    padding: 10,
    backgroundColor: "#ffffff",
    borderRadius: 8,
  },
});