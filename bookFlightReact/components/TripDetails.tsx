import { theme } from "@/themes/theme";
import { FlatList, StyleSheet, View, Image } from "react-native";
import { Card, Chip, Divider, Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Mappings for airline, city, and aircraft
const carrierCodeToName: { [key: string]: string } = {
  AS: "Alaska Airlines",
  UA: "United Airlines",
  DL: "Delta Air Lines",
  AA: "American Airlines",
  WN: "Southwest Airlines",
  B6: "JetBlue Airways",
  NK: "Spirit Airlines",
  F9: "Frontier Airlines",
  AI: "Air India",
  "6E": "IndiGo",
  SG: "SpiceJet",
  UK: "Vistara",
  TK: "Turkish Airlines",
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

function TripDetails({ trip, tripIndex }: { trip: any; tripIndex: string }) {
  // Format time and date
  const formatTime = (dt: string) =>
    dt
      ? new Date(dt).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "N/A";

  const formatDate = (dt: string) =>
    dt
      ? new Date(dt).toLocaleDateString("en-US", {
          weekday: "short",
          day: "2-digit",
          month: "short",
        })
      : "N/A";

  // Format duration (e.g., PT5H30M -> 5h 30m)
  const formatDuration = (duration: string) =>
    duration
      ? duration.replace("PT", "").replace("H", "h ").replace("M", "m").trim()
      : "N/A";

  if (!trip || !trip.legs || trip.legs.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No trip details available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.tripHeaderContent}>
          <MaterialCommunityIcons
            name={tripIndex === "0" ? "airplane-takeoff" : "airplane-landing"}
            size={14}
            color="#FFFFFF"
          />
          <Text style={styles.tripTitle}>
            {tripIndex === "0" ? "OUTBOUND" : "RETURN"}
          </Text>
        </View>
        <Text style={styles.durationText}>
          Total Duration: {formatDuration(trip.totalFlightDuration)}
        </Text>
      </View>

      {/* Segment Cards */}
      {trip.legs.map((segment: any, segIdx: number) => {
        const carrierCode = segment.carrierCode || "";
        const airlineName = carrierCodeToName[carrierCode] || carrierCode;
        const aircraft = aircraftCodeToName[segment.aircraft?.code] || segment.aircraft?.code || "Unknown";

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
                    {carrierCode} {segment.number || "N/A"} • {aircraft}
                  </Text>
                </View>
                <Chip mode="outlined" style={styles.cabinChip}>
                  {segment.cabin || "Economy"}
                </Chip>
              </View>

              <Divider style={styles.divider} />

              {/* Flight Route - Horizontal Timeline */}
              <View style={styles.routeContainer}>
                <View style={styles.departureInfo}>
                  <Text style={styles.time}>{formatTime(segment.departureDateTime)}</Text>
                  <Text style={styles.airportCode}>{segment.from || "N/A"}</Text>
                  <Text style={styles.cityName} numberOfLines={1}>
                    {iataToCity[segment.from] || segment.from || "Unknown"}
                  </Text>
                </View>

                <View style={styles.timelineContainer}>
                  <View style={styles.timelineDots}>
                    <View style={styles.timelineDot} />
                    <View style={styles.timelineLine} />
                    <MaterialCommunityIcons
                      name="airplane"
                      size={14}
                      color="#1A73E8"
                      style={styles.airplaneIcon}
                    />
                  </View>
                  <Text style={styles.flightDuration}>
                    {formatDuration(segment.duration)}
                  </Text>
                </View>

                <View style={styles.arrivalInfo}>
                  <Text style={styles.time}>{formatTime(segment.arrivalDateTime)}</Text>
                  <Text style={styles.airportCode}>{segment.to || "N/A"}</Text>
                  <Text style={styles.cityName} numberOfLines={1}>
                    {iataToCity[segment.to] || segment.to || "Unknown"}
                  </Text>
                </View>
              </View>

              <View style={styles.dateRow}>
                <Text style={styles.dateText}>{formatDate(segment.departureDateTime)}</Text>
                <Text style={styles.dateText}>{formatDate(segment.arrivalDateTime)}</Text>
              </View>

              {/* Terminal and Layover Information */}
              {(segment.departure?.terminal || segment.arrival?.terminal || (segIdx < trip.legs.length - 1)) && (
                <View style={styles.terminalInfo}>
                  <MaterialCommunityIcons name="airport" size={12} color="#5F6368" />
                  <Text style={styles.terminalText}>
                    {segment.departure?.terminal && `Terminal ${segment.departure.terminal}`}
                    {segment.departure?.terminal && segment.arrival?.terminal && " → "}
                    {segment.arrival?.terminal && `Terminal ${segment.arrival.terminal}`}
                    {(segIdx < trip.legs.length - 1) && (
                      <>
                        {(segment.departure?.terminal || segment.arrival?.terminal) && " • "}
                        Layover: {formatDuration(trip.totalLayoverDuration)}
                      </>
                    )}
                  </Text>
                </View>
              )}
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
    backgroundColor: "#F8F9FA",
    marginBottom: 80, // Add bottom margin to account for bottom tab
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 6,
    backgroundColor: "#1A73E8", // Default to outbound color
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
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8EAED",
    elevation: 1,
  },
  cardContent: {
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  airlineHeader: {
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
    width: 35,
    height: 2,
    backgroundColor: "#1A73E8",
    marginHorizontal: 3,
  },
  airplaneIcon: {
    position: "absolute",
    top: -5,
    left: 22,
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
    marginBottom: 2,
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
    marginBottom: 8,
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
  errorText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#D93025",
    textAlign: "center",
    marginTop: 20,
  },
});

export default TripDetails;