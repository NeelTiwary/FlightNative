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
  EWR: "Newark",
  LAX: "Los Angeles",
  JFK: "New York",
  LGA: "New York",
  ORD: "Chicago",
  DFW: "Dallas",
  DEN: "Denver",
  SFO: "San Francisco",
  LAS: "Las Vegas",
  MCO: "Orlando",
  MIA: "Miami",
  BOS: "Boston",
  ATL: "Atlanta",
  SEA: "Seattle",
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
      {/* Header with total price */}
      {/* <View style={styles.header}>
        <Text style={styles.headerTitle}>Flight Details</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.headerPrice}>
            {priceInfo.currency} {priceInfo.total}
          </Text>
        </View>
      </View> */}

      {itineraries.map((itinerary: any, index: number) => (
        <View key={index} style={styles.itineraryContainer}>
          {/* Trip Header */}
          <View style={[
            styles.tripHeader,
            index === 0 ? styles.outboundHeader : styles.returnHeader
          ]}>
            <View style={styles.tripHeaderContent}>
              <MaterialCommunityIcons
                name={index === 0 ? "airplane-takeoff" : "airplane-landing"}
                size={14}
                color="#FFFFFF"
              />
              <Text style={styles.tripTitle}>
                {index === 0 ? "OUTBOUND" : "RETURN"}
              </Text>
            </View>
            <Text style={styles.durationText}>
              {itinerary.duration.replace('PT', '').replace('H', 'h ').replace('M', 'm')}
            </Text>
          </View>

          {itinerary.segments && itinerary.segments.map((segment: any, segIdx: number) => {
            const carrierCode = segment.carrierCode || "";
            const airlineName = carrierCodeToName[carrierCode] || carrierCode;
            const aircraft = aircraftCodeToName[segment.aircraft?.code] || segment.aircraft?.code;

            return (
              <Card key={segIdx} style={styles.card}>
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
                        {carrierCode} {segment.number} • {aircraft}
                      </Text>
                    </View>
                    {/* <Chip mode="outlined" style={styles.cabinChip}>
                      {parsedFlightData.travelerPricings?.[0]?.fareDetailsBySegment?.[segIdx]?.cabin || "Economy"}
                      
                    </Chip> */}
                  </View>

                  <Divider style={styles.divider} />

                  {/* Flight Route - Horizontal Timeline */}
                  <View style={styles.routeContainer}>
                    <View style={styles.departureInfo}>
                      <Text style={styles.time}>{formatTime(segment.departure?.at)}</Text>
                      <Text style={styles.airportCode}>{segment.departure?.iataCode}</Text>
                      <Text style={styles.cityName} numberOfLines={1}>
                        {iataToCity[segment.departure?.iataCode] || segment.departure?.iataCode}
                      </Text>
                    </View>

                    <View style={styles.timelineContainer}>
                      <View style={styles.timelineDots}>
                        <View style={styles.timelineDot} />
                        <View style={styles.timelineLine} />
                        <MaterialCommunityIcons name="airplane" size={14} color="#1A73E8" style={styles.airplaneIcon} />
                      </View>
                      <Text style={styles.flightDuration}>
                        {segment.duration.replace('PT', '').replace('H', 'h ').replace('M', 'm')}
                      </Text>
                    </View>

                    <View style={styles.arrivalInfo}>
                      <Text style={styles.time}>{formatTime(segment.arrival?.at)}</Text>
                      <Text style={styles.airportCode}>{segment.arrival?.iataCode}</Text>
                      <Text style={styles.cityName} numberOfLines={1}>
                        {iataToCity[segment.arrival?.iataCode] || segment.arrival?.iataCode}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.dateRow}>
                    <Text style={styles.dateText}>{formatDate(segment.departure?.at)}</Text>
                    <Text style={styles.dateText}>{formatDate(segment.arrival?.at)}</Text>
                  </View>

                  {/* Terminal information if available */}
                  {(segment.departure?.terminal || segment.arrival?.terminal) && (
                    <View style={styles.terminalInfo}>
                      <MaterialCommunityIcons name="airport" size={12} color="#5F6368" />
                      <Text style={styles.terminalText}>
                        {segment.departure?.terminal && `Terminal ${segment.departure.terminal}`}
                        {segment.departure?.terminal && segment.arrival?.terminal && " → "}
                        {segment.arrival?.terminal && `Terminal ${segment.arrival.terminal}`}
                      </Text>
                    </View>
                  )}
                </Card.Content>
              </Card>
            );
          })}
        </View>
      ))}

      {/* Price Breakdown */}
      <Card style={styles.priceCard}>
        <Card.Content>
          <View style={styles.priceHeader}>
            <MaterialCommunityIcons name="receipt" size={16} color="#1A73E8" />
            <Text style={styles.priceTitle}>Price Breakdown</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Base Fare</Text>
            <Text style={styles.priceValue}>{priceInfo.currency} {priceInfo.base}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Taxes & Fees</Text>
            <Text style={styles.priceValue}>
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

      {/* Traveler info */}
      {parsedFlightData.travelers && (
        <Card style={styles.travelerCard}>
          <Card.Content>
            <View style={styles.travelerHeader}>
              <MaterialCommunityIcons name="account-group" size={16} color="#1A73E8" />
              <Text style={styles.travelerTitle}>Travelers</Text>
            </View>
            {parsedFlightData.travelers.map((traveler: any, index: number) => (
              <View key={index} style={styles.travelerRow}>
                <MaterialCommunityIcons name="account" size={14} color="#5F6368" />
                <Text style={styles.travelerText}>
                  {traveler.name?.firstName} {traveler.name?.lastName} ({traveler.type})
                </Text>
              </View>
            ))}
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e2edf8ff",
    borderRadius: 19,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#202124",
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  headerPrice: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1A73E8",
  },
  itineraryContainer: {
    marginBottom: 0,
  },
  tripHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 6,
  },
  outboundHeader: {
    backgroundColor: "#6871f1ff",
  },
  returnHeader: {
    backgroundColor: "#0B8043",
  },
  tripHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  tripTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
    marginLeft: 6,
  },
  durationText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  card: {
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 6,
    backgroundColor: "#f2f6fbff",
    borderWidth: 1,
    borderColor: "#ffffffff",
  },
  cardContent: {
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  airlineHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 0,
  },
  airlineLogo: {
    width: 28,
    height: 28,
    borderRadius: 5,
    marginRight: 8,
  },
  airlineInfo: {
    flex: 1,
  },
  airlineName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#202124",
    marginBottom: 2,
  },
  flightNumber: {
    fontSize: 11,
    fontWeight: "600",
    color: "#5F6368",
  },
  cabinChip: {
    height: 24,
    backgroundColor: "#F8F9FA",
    borderColor: "#DADCE0",
    fontSize: 12,
  },
  divider: {
    marginBottom: 12,
    backgroundColor: "#F1F3F4",
    height: 1,
  },
  routeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  departureInfo: {
    flex: 1,
    alignItems: "flex-start",
  },
  arrivalInfo: {
    flex: 1,
    alignItems: "flex-end",
  },
  timelineContainer: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 80,
  },
  timelineDots: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    position: "relative",
  },
  timelineDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#1A73E8",
  },
  timelineLine: {
    width: 80,
    height: 2,
    backgroundColor: "#1A73E8",
    marginHorizontal: 3,
  },
  airplaneIcon: {
    position: "center",
    // top: -5,
    // left: 22,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
  },
  flightDuration: {
    fontSize: 10,
    fontWeight: "700",
    color: "#5F6368",
  },
  time: {
    fontSize: 15,
    fontWeight: "800",
    color: "#202124",
    marginBottom: 3,
  },
  airportCode: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1A73E8",
    marginBottom: 0,
  },
  cityName: {
    fontSize: 10,
    fontWeight: "600",
    color: "#5F6368",
    maxWidth: 80,
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 0,
  },
  dateText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#9AA0A6",
  },
  terminalInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    padding: 6,
    backgroundColor: "#F8F9FA",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#E8EAED",
  },
  terminalText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#5F6368",
    marginLeft: 4,
  },
  priceCard: {
    margin: 12,
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8EAED",
  },
  priceHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  priceTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#202124",
    marginLeft: 6,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  priceLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#5F6368",
  },
  priceValue: {
    fontSize: 12,
    fontWeight: "700",
    color: "#202124",
  },
  priceDivider: {
    marginVertical: 8,
    backgroundColor: "#E8EAED",
    height: 1,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#202124",
  },
  totalValue: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1A73E8",
  },
  travelerCard: {
    margin: 12,
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8EAED",
  },
  travelerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  travelerTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#26282cff",
    marginLeft: 6,
  },
  travelerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    padding: 6,
    backgroundColor: "#F8F9FA",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#E8EAED",
  },
  travelerText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#5F6368",
    marginLeft: 6,
  },
  errorText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#D93025",
    textAlign: "center",
    marginTop: 20,
  },
});