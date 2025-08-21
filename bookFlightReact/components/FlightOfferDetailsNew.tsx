import { useAppContext } from "@/context/AppContextProvider";
import { FlightOffer } from "@/types";
import { formatDate, formatTime } from "@/utils/helper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, View, Image } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Card, Chip, Divider, Text } from "react-native-paper";

const carrierCodeToName: { [key: string]: string } = {
  DL: "Delta Air Lines",
  AA: "American Airlines",
  UA: "United Airlines",
  WN: "Southwest Airlines",
  B6: "JetBlue Airways",
  NK: "Spirit Airlines",
  F9: "Frontier Airlines",
  AI: "Air India",
  "6E": "IndiGo",
  SG: "SpiceJet",
  UK: "Vistara",
  TK: "Turkish Airlines",
  AS: "Alaska Airlines", // For the logged flight
};

const iataToCity: { [key: string]: string } = {
  EWR: "Newark",
  DEL: "Delhi",
  LAX: "Los Angeles", // Added for the logged flight
  // Add more as needed
};

const aircraftCodeToName: { [key: string]: string } = {
  "789": "Boeing 787-9",
  "73J": "Boeing 737-900", // Added for the logged flight
  // Add more as needed
};

const getAirlineIconURL = (code: string) =>
  carrierCodeToName[code]
    ? `https://content.airhex.com/content/logos/airlines_${code.toUpperCase()}_100_100_s.png`
    : "https://content.airhex.com/content/logos/default.png";

export default function FlightOfferDetailsNew() {
  const { selectedFlightOffer: flightData } = useAppContext();
  console.log("Flight Data in FlightOfferDetailsNew:", {
    flightData,
    hasTrips: !!flightData?.trips,
    isTripsArray: Array.isArray(flightData?.trips),
    tripsLength: flightData?.trips?.length,
  });

  // Enhanced defensive check
  if (!flightData || !flightData.trips || !Array.isArray(flightData.trips) || flightData.trips.length === 0) {
    console.warn("FlightOfferDetailsNew: Invalid flight data", {
      flightData,
      trips: flightData?.trips,
    });
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No flight details available</Text>
        {flightData && (
          <View style={styles.fallbackInfo}>
            <Text style={styles.infoLabel}>
              Price: {flightData.currencyCode || "N/A"} {flightData.totalPrice || "N/A"}
            </Text>
            <Text style={styles.infoLabel}>
              Base Price: {flightData.currencyCode || "N/A"} {flightData.basePrice || "N/A"}
            </Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {flightData.trips.map((trip: any, index: number) => (
        <View key={index}>
          <Chip
            icon={"airplane-takeoff"}
            style={styles.tripChip}
            textStyle={{ fontWeight: "600" }}
          >
            {trip.tripType === "ONE_WAY" ||
            (trip.tripType === "RETURN" && index === 0)
              ? "Outbound Trip"
              : trip.tripType === "RETURN" && index === 1
              ? "Return Trip"
              : `Trip ${trip.tripNo || index + 1}`}
          </Chip>

          {trip.legs && Array.isArray(trip.legs) && trip.legs.length > 0 ? (
            trip.legs.map((leg: any, legIdx: number) => (
              <View key={legIdx} style={{ marginBottom: 24 }}>
                <Card style={styles.card}>
                  <Card.Title
                    title={leg.carrierName || carrierCodeToName[leg.carrierCode] || leg.carrierCode || "Unknown Airline"}
                    titleStyle={styles.airlineName}
                    left={() => (
                      <Image
                        source={{
                          uri: getAirlineIconURL(leg.operatingCarrierCode || leg.carrierCode || ""),
                        }}
                        style={styles.airlineLogo}
                        onError={() => console.log("Failed to load airline logo")}
                      />
                    )}
                  />
                  <Card.Content>
                    <View style={styles.timelineRow}>
                      <View style={styles.cityBlock}>
                        <Text style={styles.city}>{leg.departureCity || iataToCity[leg.departure?.iataCode] || "Unknown Departure City"}</Text>
                        <Text style={styles.time}>{formatTime(leg.departureDateTime) || "N/A"}</Text>
                        <Text style={styles.date}>{formatDate(leg.departureDateTime) || "N/A"}</Text>
                      </View>
                      <View style={styles.timelineLineHorizontal}>
                        <View style={styles.timelineDot} />
                        <View style={styles.timelineLineMid} />
                        <View style={styles.timelineDot} />
                      </View>
                      <View style={styles.cityBlock}>
                        <Text style={styles.city}>{leg.arrivalCity || iataToCity[leg.arrival?.iataCode] || "Unknown Arrival City"}</Text>
                        <Text style={styles.time}>{formatTime(leg.arrivalDateTime) || "N/A"}</Text>
                        <Text style={styles.date}>{formatDate(leg.arrivalDateTime) || "N/A"}</Text>
                      </View>
                    </View>
                    <Text style={styles.flightInfo}>Travel Time: {leg.duration || "N/A"}</Text>
                    <Divider style={styles.divider} />
                    <View style={styles.row}>
                      <Text style={styles.infoLabel}>Aircraft</Text>
                      <Text style={styles.infoValue}>{leg.aircraft || aircraftCodeToName[leg.aircraft?.code] || "Unknown"}</Text>
                    </View>
                    <View style={styles.row}>
                      <Text style={styles.infoLabel}>Cabin</Text>
                      <Text style={styles.infoValue}>{leg.cabinClass || "Unknown"}</Text>
                    </View>
                    <Text style={styles.amenitiesTitle}>Amenities</Text>
                    <View style={styles.amenities}>
                      <Chip icon="wifi" style={styles.amenityChip} textStyle={styles.amenityText}>
                        Wi-Fi
                      </Chip>
                      <Chip
                        icon="power-plug-outline"
                        style={styles.amenityChip}
                        textStyle={styles.amenityText}
                      >
                        Power Outlet
                      </Chip>
                      <Chip
                        icon="television-classic"
                        style={styles.amenityChip}
                        textStyle={styles.amenityText}
                      >
                        Entertainment
                      </Chip>
                    </View>
                  </Card.Content>
                </Card>
                {leg.layoverAfter && (
                  <View style={styles.stopoverContainer}>
                    <MaterialCommunityIcons name="clock-outline" size={18} />
                    <Text style={styles.stopoverText}>
                      {leg.layoverAfter} layover in {leg.arrivalCity || "Unknown"}
                    </Text>
                  </View>
                )}
              </View>
            ))
          ) : (
            <Text style={styles.errorText}>No flight legs available</Text>
          )}
          <Divider style={[styles.divider, { height: 3 }]} />
        </View>
      ))}
      <View style={styles.priceInfo}>
        <Text style={styles.infoLabel}>
          Total Price: {flightData.currencyCode || "N/A"} {flightData.totalPrice || "N/A"}
        </Text>
        <Text style={styles.infoLabel}>
          Base Price: {flightData.currencyCode || "N/A"} {flightData.basePrice || "N/A"}
        </Text>
      </View>
    </ScrollView>
  );
}

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