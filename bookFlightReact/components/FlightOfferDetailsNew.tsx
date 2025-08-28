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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {itineraries.map((itinerary: any, index: number) => (
        <View key={index}>
          <View style={styles.tripHeader}>
            <MaterialCommunityIcons 
              name={index === 0 ? "airplane-takeoff" : "airplane-landing"} 
              size={14} 
              color="#2563EB" 
            />
            <Text style={styles.tripTitle}>
              {index === 0 ? "OUTBOUND" : "RETURN"}
            </Text>
          </View>

          {itinerary.segments && itinerary.segments.map((segment: any, segIdx: number) => {
            const carrierCode = segment.carrierCode || "";
            const airlineName = carrierCodeToName[carrierCode] || carrierCode;
            const aircraft = aircraftCodeToName[segment.aircraft?.code] || segment.aircraft?.code;
            
            return (
              <Card key={segIdx} style={styles.card}>
                <Card.Content style={styles.cardContent}>
                  {/* Compact Header Row */}
                  <View style={styles.headerRow}>
                    <Image
                      source={{ uri: getAirlineIconURL(carrierCode) }}
                      style={styles.airlineLogo}
                      onError={() => console.log("Failed to load airline logo for:", carrierCode)}
                    />
                    <View style={styles.headerInfo}>
                      <Text style={styles.airlineName}>{airlineName}</Text>
                      <Text style={styles.flightNumber}>
                        {carrierCode} {segment.number} • {formatDate(segment.departure?.at)}
                      </Text>
                    </View>
                  </View>

                  {/* Flight Route - Compact Layout */}
                  <View style={styles.routeContainer}>
                    <View style={styles.routeSegment}>
                      <Text style={styles.time}>{formatTime(segment.departure?.at)}</Text>
                      <Text style={styles.airportCode}>{segment.departure?.iataCode}</Text>
                      <Text style={styles.airportName} numberOfLines={1}>
                        {iataToCity[segment.departure?.iataCode] || segment.departure?.iataCode}
                      </Text>
                    </View>
                    
                    <View style={styles.routeCenter}>
                      <View style={styles.timelineContainer}>
                        <View style={styles.timelineDot} />
                        <View style={styles.timelineLine} />
                        <View style={styles.timelineDot} />
                      </View>
                      <Text style={styles.duration}>{segment.duration || "N/A"}</Text>
                    </View>
                    
                    <View style={[styles.routeSegment, styles.alignEnd]}>
                      <Text style={styles.time}>{formatTime(segment.arrival?.at)}</Text>
                      <Text style={styles.airportCode}>{segment.arrival?.iataCode}</Text>
                      <Text style={styles.airportName} numberOfLines={1}>
                        {iataToCity[segment.arrival?.iataCode] || segment.arrival?.iataCode}
                      </Text>
                    </View>
                  </View>

                  {/* Flight Details - Single Row */}
                  <View style={styles.detailsRow}>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>AIRCRAFT</Text>
                      <Text style={styles.detailValue}>{aircraft}</Text>
                    </View>
                    <View style={styles.detailDivider} />
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>CABIN</Text>
                      <Text style={styles.detailValue}>
                        {parsedFlightData.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin || "Economy"}
                      </Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            );
          })}
        </View>
      ))}
      
      {/* Price Summary - Compact */}
      <Card style={styles.priceCard}>
        <Card.Content style={styles.priceContent}>
          <Text style={styles.priceTitle}>FARE SUMMARY</Text>
          <View style={styles.priceGrid}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Base Fare:</Text>
              <Text style={styles.priceValue}>{priceInfo.currency} {priceInfo.base}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Taxes & Fees:</Text>
              <Text style={styles.priceValue}>
                {priceInfo.currency} {(parseFloat(priceInfo.total) - parseFloat(priceInfo.base)).toFixed(2)}
              </Text>
            </View>
            <View style={styles.totalDivider} />
            <View style={styles.priceRow}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>{priceInfo.currency} {priceInfo.total}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#F8FAFC",
  },
  tripHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    marginTop: 2,
  },
  tripTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginLeft: 5,
    letterSpacing: 0.3,
  },
  card: {
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  cardContent: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  airlineLogo: {
    width: 28,
    height: 28,
    borderRadius: 5,
    marginRight: 8,
  },
  headerInfo: {
    flex: 1,
  },
  airlineName: {
    fontWeight: "600",
    fontSize: 14,
    color: "#1F2937",
    marginBottom: 1,
  },
  flightNumber: {
    fontSize: 11,
    color: "#6B7280",
  },
  routeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  routeSegment: {
    flex: 1,
  },
  alignEnd: {
    alignItems: "flex-end",
  },
  routeCenter: {
    alignItems: "center",
    paddingHorizontal: 6,
  },
  timelineContainer: {
    alignItems: "center",
    marginBottom: 4,
  },
  timelineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#2563EB",
  },
  timelineLine: {
    width: 2,
    height: 20,
    backgroundColor: "#2563EB",
    marginVertical: 2,
  },
  time: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  airportCode: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2563EB",
    marginBottom: 1,
  },
  airportName: {
    fontSize: 10,
    color: "#6B7280",
    maxWidth: 100,
  },
  duration: {
    fontSize: 10,
    fontWeight: "600",
    color: "#4B5563",
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 8,
  },
  detailItem: {
    flex: 1,
    alignItems: "center",
  },
  detailDivider: {
    width: 1,
    height: 20,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 8,
  },
  detailLabel: {
    fontSize: 9,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 1,
    letterSpacing: 0.4,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: "500",
    color: "#1F2937",
  },
  priceCard: {
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
    marginBottom: 16,
  },
  priceContent: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  priceTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  priceGrid: {
    gap: 4,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  priceLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  priceValue: {
    fontSize: 12,
    fontWeight: "500",
    color: "#1F2937",
  },
  totalDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 4,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1F2937",
  },
  totalValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2563EB",
  },
  errorText: {
    fontSize: 13,
    color: "#DC2626",
    textAlign: "center",
    marginVertical: 8,
  },
});