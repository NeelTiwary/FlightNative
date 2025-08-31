import { useAppContext } from "@/context/AppContextProvider";
import { formatDate, formatTime } from "@/utils/helper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Card, Text } from "react-native-paper";

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

const aircraftCodeToName: { [key: string]: string } = {
  "73J": "Boeing 737-900",
  "738": "Boeing 737-800",
  "739": "Boeing 737-900ER",
  "320": "Airbus A320",
  "321": "Airbus A321",
  "789": "Boeing 787-9 Dreamliner",
  "77W": "Boeing 777-300ER",
};

const getAirlineIconURL = (code: string) =>
  `https://content.airhex.com/content/logos/airlines_${code.toUpperCase()}_100_100_s.png`;

export default function FlightOfferDetails() {
  const { selectedFlightOffer: flightData } = useAppContext();

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

  const formatDuration = (duration: string) => {
    if (!duration) return "N/A";
    return duration.replace('PT', '').replace('H', 'h ').replace('M', 'm').trim();
  };

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
        <View key={index} style={styles.tripContainer}>
          <View style={styles.tripHeader}>
            <MaterialCommunityIcons
              name={index === 0 ? "airplane-takeoff" : "airplane-landing"}
              size={16}
              color="#0052cc"
            />
            <Text style={styles.tripTitle}>
              {index === 0 ? "OUTBOUND FLIGHT" : "RETURN FLIGHT"}
            </Text>
          </View>

          {itinerary.segments && itinerary.segments.map((segment: any, segIdx: number) => {
            const carrierCode = segment.carrierCode || "";
            const airlineName = carrierCodeToName[carrierCode] || carrierCode;
            const aircraft = aircraftCodeToName[segment.aircraft?.code] || segment.aircraft?.code;
            const stops = Math.max(0, itinerary.segments.length - 1);

            return (
              <Card key={segIdx} style={[styles.card, segIdx === itinerary.segments.length - 1 && styles.lastCard]} elevation={0}>
                <Card.Content style={styles.content}>
                  {/* Top row: Airline and date */}
                  <View style={styles.topRow}>
                    <View style={styles.airlineRow}>
                      <Image
                        source={{ uri: getAirlineIconURL(carrierCode) }}
                        style={styles.logo}
                        onError={() => console.log("Failed to load airline logo for:", carrierCode)}
                      />
                      <Text style={styles.airlineName}>{airlineName}</Text>
                    </View>
                    <Text style={styles.flightDate}>{formatDate(segment.departure?.at)}</Text>
                  </View>

                  {/* Middle row: Flight times and details */}
                  <View style={styles.middleRow}>
                    <View style={styles.timeBlock}>
                      <Text style={styles.time}>{formatTime(segment.departure?.at)}</Text>
                      <Text style={styles.airportCode}>{segment.departure?.iataCode}</Text>
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
                    </View>
                    <View style={styles.timeBlock}>
                      <Text style={styles.time}>{formatTime(segment.arrival?.at)}</Text>
                      <Text style={styles.airportCode}>{segment.arrival?.iataCode}</Text>
                    </View>
                  </View>

                  {/* Bottom row: Aircraft and Cabin */}
                  <View style={styles.bottomRow}>
                    <View style={styles.detailsBlock}>
                      <Text style={styles.detailLabel}>AIRCRAFT</Text>
                      <Text style={styles.detailValue}>{aircraft}</Text>
                    </View>
                    <View style={styles.detailsBlock}>
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

      {/* Price Summary */}
      <Card style={[styles.card, styles.lastCard]} elevation={0}>
        <Card.Content style={styles.content}>
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
          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>
              {priceInfo.currency} {priceInfo.total}
            </Text>
          </View>
          <TouchableOpacity style={styles.selectContainer}>
            <Text style={styles.selectText}>Select</Text>
          </TouchableOpacity>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 6,
    backgroundColor: '#f5faff',
  },
  tripContainer: {
    marginBottom: 4,
  },
  tripHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    marginLeft: 6,
  },
  tripTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0052cc",
    marginLeft: 4,
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
  content: {
    padding: 8,
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
    resizeMode: "contain",
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
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  priceTitle: {
    fontWeight: '700',
    color: '#0052cc',
    fontSize: 12,
    marginBottom: 6,
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
  selectContainer: {
    alignItems: 'flex-end',
    marginTop: 6,
  },
  selectText: {
    fontWeight: '700',
    color: '#007bff',
    fontSize: 11,
  },
  errorText: {
    fontWeight: '700',
    color: '#dc3545',
    textAlign: 'center',
    marginVertical: 6,
    fontSize: 11,
  },
});