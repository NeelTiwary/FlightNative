import { useState } from "react";
import { View, StyleSheet, Image } from "react-native";
import { Card, Text } from "react-native-paper";
import Animated, { Easing, useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { formatDate, formatTime } from "@/utils/helper";

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

const aircraftCodeToName: { [key: string]:-DW "Boeing 737-900",
  "738": "Boeing 737-800",
  "739": "Boeing 737-900ER",
  "320": "Airbus A320",
  "321": "Airbus A321",
  "789": "Boeing 787-9 Dreamliner",
  "77W": "Boeing 777-300ER",
};

const getAirlineIconURL = (code: string) =>
  `https://content.airhex.com/content/logos/airlines_${code.toUpperCase()}_100_100_s.png`;

export default function FlightOfferDetails({ flightData }: { flightData: any }) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleAccordionPress = (index: number) => {
    setExpandedIndex(index === expandedIndex ? null : index);
  };

  const formatDuration = (duration: string) => {
    if (!duration) return "N/A";
    return duration.replace('PT', '').replace('H', 'h ').replace('M', 'm').trim();
  };

  if (!flightData) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No flight details available</Text>
      </View>
    );
  }

  const itineraries = flightData.trips || [];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerBanner}>
        <Text style={styles.headerTitle}>Flight Details</Text>
      </View>

      {/* Pricing Summary Card */}
      <Card style={[styles.card, styles.lastCard]} elevation={0}>
        <Card.Content style={styles.cardContent}>
          <Text style={styles.sectionTitle}>FARE SUMMARY</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Base Fare:</Text>
            <Text style={styles.priceValue}>
              {flightData.currencyCode} {flightData.basePrice}
            </Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Taxes & Fees:</Text>
            <Text style={styles.priceValue}>
              {flightData.currencyCode} {(parseFloat(flightData.totalPrice) - parseFloat(flightData.basePrice)).toFixed(2)}
            </Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>
              {flightData.currencyCode} {flightData.totalPrice}
            </Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Travelers:</Text>
            <Text style={styles.priceValue}>{flightData.totalTravelers}</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Trip Details */}
      <Text style={styles.sectionTitle}>ITINERARY</Text>
      {itineraries.map((trip: any, index: number) => {
        const isExpanded = expandedIndex === index;
        const animatedHeight = useSharedValue(isExpanded ? 1 : 0);

        const animatedStyle = useAnimatedStyle(() => ({
          opacity: withTiming(isExpanded ? 1 : 0, { duration: 200, easing: Easing.out(Easing.exp) }),
          transform: [{ scaleY: withTiming(isExpanded ? 1 : 0, { duration: 200, easing: Easing.out(Easing.exp) }) }],
        }));

        const firstLeg = trip.legs?.[0];
        const carrierCode = firstLeg?.carrierCode || "";
        const airlineName = carrierCodeToName[carrierCode] || carrierCode;
        const stops = Math.max(0, trip.legs?.length - 1 || 0);

        return (
          <Card key={trip.tripNo} style={[styles.card, index === itineraries.length - 1 && styles.lastCard]} elevation={0}>
            <Card.Content style={styles.cardContent}>
              <TouchableOpacity onPress={() => handleAccordionPress(index)} style={styles.accordionHeader}>
                <View style={styles.topRow}>
                  <View style={styles.airlineRow}>
                    <MaterialCommunityIcons
                      name={index === 0 ? "airplane-takeoff" : "airplane-landing"}
                      size={16}
                      color="#0052cc"
                    />
                    <Text style={styles.tripTitle}>
                      {index === 0 ? "OUTBOUND FLIGHT" : "RETURN FLIGHT"}
                    </Text>
                  </View>
                  <Text style={styles.flightDate}>{formatDate(firstLeg?.departureDateTime)}</Text>
                </View>
                <View style={styles.middleRow}>
                  <View style={styles.timeBlock}>
                    <Text style={styles.time}>{formatTime(firstLeg?.departureDateTime)}</Text>
                    <Text style={styles.airportCode}>{firstLeg?.departureAirport}</Text>
                  </View>
                  <View style={styles.durationBlock}>
                    <View style={styles.flightLine}>
                      <View style={styles.dot} />
                      <View style={styles.line} />
                      <View style={styles.dot} />
                    </View>
                    <Text style={styles.duration}>{formatDuration(trip.totalFlightDuration)}</Text>
                    <Text style={[styles.stops, stops === 0 ? styles.direct : styles.withStops]}>
                      {stops === 0 ? "Direct" : `${stops} Stop`}
                    </Text>
                  </View>
                  <View style={styles.timeBlock}>
                    <Text style={styles.time}>{formatTime(firstLeg?.arrivalDateTime)}</Text>
                    <Text style={styles.airportCode}>{firstLeg?.arrivalAirport}</Text>
                  </View>
                </View>
              </TouchableOpacity>
              <Animated.View style={[styles.accordionContent, animatedStyle]}>
                {trip.legs.map((leg: any, legIndex: number) => (
                  <View key={leg.legNo} style={styles.legContainer}>
                    <View style={styles.topRow}>
                      <View style={styles.airlineRow}>
                        <Image
                          source={{ uri: getAirlineIconURL(leg.carrierCode) }}
                          style={styles.logo}
                          onError={() => console.log("Failed to load airline logo for:", leg.carrierCode)}
                        />
                        <Text style={styles.airlineName}>{carrierCodeToName[leg.carrierCode] || leg.carrierCode}</Text>
                      </View>
                    </View>
                    <View style={styles.bottomRow}>
                      <View style={styles.detailsBlock}>
                        <Text style={styles.detailLabel}>AIRCRAFT</Text>
                        <Text style={styles.detailValue}>
                          {aircraftCodeToName[leg.aircraftCode] || leg.aircraftCode}
                        </Text>
                      </View>
                      {leg.operatingCarrierName && (
                        <View style={styles.detailsBlock}>
                          <Text style={styles.detailLabel}>OPERATED BY</Text>
                          <Text style={styles.detailValue}>{leg.operatingCarrierName}</Text>
                        </View>
                      )}
                    </View>
                    {leg.layoverAfter && (
                      <View style={styles.bottomRow}>
                        <View style={styles.detailsBlock}>
                          <Text style={styles.detailLabel}>LAYOVER</Text>
                          <Text style={styles.detailValue}>{formatDuration(leg.layoverAfter)}</Text>
                        </View>
                      </View>
                    )}
                  </View>
                ))}
              </Animated.View>
            </Card.Content>
          </Card>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5faff',
    padding: 6,
  },
  headerBanner: {
    paddingVertical: 12,
    paddingHorizontal: 6,
    marginBottom: 6,
  },
  headerTitle: {
    fontWeight: '700',
    color: '#0052cc',
    fontSize: 14,
  },
  card: {
    marginHorizontal: 6,
    marginBottom: 4,
    borderRadius: 6,
    backgroundColor: '#f5faff',
  },
  lastCard: {
    marginBottom: 0,
  },
  cardContent: {
    padding: 8,
  },
  sectionTitle: {
    fontWeight: '700',
    color: '#0052cc',
    fontSize: 12,
    marginBottom: 6,
    marginHorizontal: 6,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  priceLabel: {
    fontWeight: '700',
    color: '#4a5568',
    fontSize: 11,
  },
  priceValue: {
    fontWeight: '700',
    color: '#0052cc',
    fontSize: 11,
  },
  totalLabel: {
    fontWeight: '700',
    color: '#4a5568',
    fontSize: 12,
  },
  totalValue: {
    fontWeight: '700',
    color: '#0052cc',
    fontSize: 12,
  },
  accordionHeader: {
    paddingVertical: 4,
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
    resizeMode: 'contain',
    marginRight: 4,
  },
  airlineName: {
    fontWeight: '700',
    color: '#0052cc',
    fontSize: 12,
  },
  flightDate: {
    fontWeight: '700',
    color: '#4a5568',
    fontSize: 12,
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
  accordionContent: {
    paddingHorizontal: 4,
  },
  legContainer: {
    marginBottom: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailsBlock: {
    flex: 1,
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontWeight: '700',
    color: '#4a5568',
    fontSize: 10,
    marginBottom: 2,
  },
  detailValue: {
    fontWeight: '700',
    color: '#0052cc',
    fontSize: 11,
  },
  tripTitle: {
    fontWeight: '700',
    color: '#0052cc',
    fontSize: 12,
    marginLeft: 4,
  },
  errorText: {
    fontWeight: '700',
    color: '#dc3545',
    textAlign: 'center',
    marginVertical: 6,
    fontSize: 11,
  },
});