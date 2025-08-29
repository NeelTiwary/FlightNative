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
          <View style={styles.tripHeader}>
            <MaterialCommunityIcons 
              name={index === 0 ? "airplane-takeoff" : "airplane-landing"} 
              size={20} 
              color="#2D5BFF" 
            />
            <Text style={styles.tripTitle}>
              {index === 0 ? "OUTBOUND FLIGHT" : "RETURN FLIGHT"}
            </Text>
          </View>

          {itinerary.segments && itinerary.segments.map((segment: any, segIdx: number) => {
            const carrierCode = segment.carrierCode || "";
            const airlineName = carrierCodeToName[carrierCode] || carrierCode;
            const aircraft = aircraftCodeToName[segment.aircraft?.code] || segment.aircraft?.code;
            
            return (
              <View key={segIdx} style={{ marginBottom: 20 }}>
                <Card style={styles.card}>
                  <Card.Content style={styles.cardContent}>
                    {/* Airline Header */}
                    <View style={styles.airlineHeader}>
                      <Image
                        source={{ uri: getAirlineIconURL(carrierCode) }}
                        style={styles.airlineLogo}
                        onError={() => console.log("Failed to load airline logo for:", carrierCode)}
                      />
                      <View style={styles.airlineInfo}>
                        <Text style={styles.airlineName}>{airlineName}</Text>
                        <Text style={styles.flightNumber}>
                          {carrierCode} {segment.number}
                        </Text>
                      </View>
                    </View>

                    <Divider style={styles.headerDivider} />
                    
                    {/* Flight Route */}
                    <View style={styles.routeContainer}>
                      <View style={styles.routeTimeline}>
                        <View style={styles.timelineDotLarge} />
                        <View style={styles.timelineLine} />
                        <View style={styles.timelineDotLarge} />
                      </View>
                      
                      <View style={styles.routeDetails}>
                        <View style={styles.routeSegment}>
                          <Text style={styles.time}>
                            {formatTime(segment.departure?.at)}
                          </Text>
                          <Text style={styles.airportCode}>
                            {segment.departure?.iataCode}
                          </Text>
                          <Text style={styles.airportName} numberOfLines={1}>
                            {iataToCity[segment.departure?.iataCode] || segment.departure?.iataCode}
                          </Text>
                          <Text style={styles.date}>
                            {formatDate(segment.departure?.at)}
                          </Text>
                        </View>
                        
                        <View style={styles.durationContainer}>
                          <Text style={styles.duration}>
                            {segment.duration || "N/A"}
                          </Text>
                          <View style={styles.horizontalLine} />
                        </View>
                        
                        <View style={[styles.routeSegment, styles.alignEnd]}>
                          <Text style={styles.time}>
                            {formatTime(segment.arrival?.at)}
                          </Text>
                          <Text style={styles.airportCode}>
                            {segment.arrival?.iataCode}
                          </Text>
                          <Text style={styles.airportName} numberOfLines={1}>
                            {iataToCity[segment.arrival?.iataCode] || segment.arrival?.iataCode}
                          </Text>
                          <Text style={styles.date}>
                            {formatDate(segment.arrival?.at)}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <Divider style={styles.divider} />
                    
                    {/* Flight Details */}
                    <View style={styles.detailsGrid}>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>AIRCRAFT</Text>
                        <Text style={styles.detailValue}>{aircraft}</Text>
                      </View>
                      
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>CABIN</Text>
                        <Text style={styles.detailValue}>
                          {parsedFlightData.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin || "Economy"}
                        </Text>
                      </View>
                    </View>
                  </Card.Content>
                </Card>
              </View>
            );
          })}
        </View>
      ))}
      
      {/* Price Summary */}
      <Card style={styles.priceCard}>
        <Card.Content>
          <Text style={styles.priceTitle}>FARE SUMMARY</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Base Fare:</Text>
            <Text style={styles.priceValue}>
              {priceInfo.currency} {priceInfo.base}
            </Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Taxes & Fees:</Text>
            <Text style={styles.priceValue}>
              {priceInfo.currency} {(parseFloat(priceInfo.total) - parseFloat(priceInfo.base)).toFixed(2)}
            </Text>
          </View>
          <Divider style={styles.totalDivider} />
          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>
              {priceInfo.currency} {priceInfo.total}
            </Text>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F5F7FA",
  },
  tripHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 8,
  },
  tripTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D3748",
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    overflow: "hidden",
  },
  cardContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  airlineHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  airlineLogo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
  },
  airlineInfo: {
    flex: 1,
  },
  airlineName: {
    fontWeight: "600",
    fontSize: 16,
    color: "#2D3748",
    marginBottom: 2,
  },
  flightNumber: {
    fontSize: 13,
    color: "#718096",
  },
  headerDivider: {
    backgroundColor: "#E2E8F0",
    marginBottom: 16,
  },
  routeContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  routeTimeline: {
    alignItems: "center",
    marginRight: 16,
    width: 24,
  },
  timelineDotLarge: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#2D5BFF",
    zIndex: 2,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: "#2D5BFF",
    marginVertical: 4,
  },
  routeDetails: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  routeSegment: {
    flex: 1,
  },
  alignEnd: {
    alignItems: "flex-end",
  },
  time: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2D3748",
    marginBottom: 4,
  },
  airportCode: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2D5BFF",
    marginBottom: 2,
  },
  airportName: {
    fontSize: 12,
    color: "#718096",
    marginBottom: 6,
    maxWidth: 120,
  },
  date: {
    fontSize: 12,
    color: "#A0AEC0",
  },
  durationContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  duration: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4A5568",
    marginBottom: 4,
  },
  horizontalLine: {
    height: 1,
    width: 40,
    backgroundColor: "#CBD5E0",
  },
  divider: {
    backgroundColor: "#E2E8F0",
    marginVertical: 12,
  },
  detailsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#718096",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2D3748",
  },
  priceCard: {
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 24,
  },
  priceTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2D3748",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: "#718096",
  },
  priceValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2D3748",
  },
  totalDivider: {
    backgroundColor: "#E2E8F0",
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D3748",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2D5BFF",
  },
  errorText: {
    fontSize: 14,
    color: "#d32f2f",
    textAlign: "center",
    marginVertical: 10,
  },
});