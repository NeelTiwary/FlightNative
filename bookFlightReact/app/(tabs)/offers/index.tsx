import FlightCard from "@/components/FlightOfferCard";
import { useAppContext } from "@/context/AppContextProvider";
import { theme } from "@/themes/theme";
import BottomSheet from "@gorhom/bottom-sheet";
import { router, useNavigation } from "expo-router";
import { useMemo, useRef } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Icon, IconButton, Text } from "react-native-paper";

// Static mappings
const iataToCity = {
  EWR: "Newark",
  DEL: "Delhi",
  LAX: "Los Angeles", // Added for the logged flight
  // Add more as needed
};

const carrierCodeToName = {
  UA: "United Airlines",
  AS: "Alaska Airlines", // Added for the logged flight
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
  // Add more as needed
};

const aircraftCodeToName = {
  "789": "Boeing 787-9",
  "73J": "Boeing 737-900", // Added for the logged flight
  // Add more as needed
};

export default function Offers() {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["25%", "50%", "80%"], []);

  const { selectedFlightOffer, setSelectedFlightOffer, apiUrl, flightOffers, searchParams, fromInput, toInput } =
    useAppContext();
  const navigation = useNavigation();

  const handleBookFlight = (flightData: any) => {
    console.log("Booking flight with data:", flightData);

    if (!flightData) {
      console.warn("handleBookFlight: No flight data provided");
      return;
    }

    let itineraries = [];
    try {
      if (flightData.pricingAdditionalInfo) {
        const additionalInfo = JSON.parse(flightData.pricingAdditionalInfo);
        itineraries = Array.isArray(additionalInfo.itineraries) ? additionalInfo.itineraries : [];
      }
    } catch (error) {
      console.warn("handleBookFlight: Failed to parse pricingAdditionalInfo", error);
    }

    const transformedFlightData = {
      ...flightData,
      trips: flightData.trips && Array.isArray(flightData.trips) && flightData.trips.length > 0
        ? flightData.trips
        : itineraries.map((itinerary: any, index: number) => ({
            tripType: flightData.oneWay ? "ONE_WAY" : "RETURN",
            tripNo: itinerary.id || index + 1,
            stops: itinerary.segments ? itinerary.segments.length - 1 : 0,
            legs: (itinerary.segments || []).map((segment: any) => ({
              carrierName: carrierCodeToName[segment.carrierCode] || segment.carrierCode || "Unknown",
              operatingCarrierCode: segment.operating?.carrierCode || segment.carrierCode || "",
              departureCity: iataToCity[segment.departure?.iataCode] || segment.departure?.iataCode || "Unknown",
              arrivalCity: iataToCity[segment.arrival?.iataCode] || segment.arrival?.iataCode || "Unknown",
              departureDateTime: segment.departure?.at || "",
              arrivalDateTime: segment.arrival?.at || "",
              duration: segment.duration || "N/A",
              aircraft: aircraftCodeToName[segment.aircraft?.code] || segment.aircraft?.code || "Unknown",
              cabinClass:
                flightData.travelerPricings?.[0]?.fareDetailsBySegment?.find(
                  (fare: any) => fare.segmentId === segment.id
                )?.cabin || "Economy",
              layoverAfter: segment.numberOfStops > 0 ? "Unknown" : null,
            })),
            from: iataToCity[segment.departure?.iataCode] || segment.departure?.iataCode || "Unknown",
            to: iataToCity[segment.arrival?.iataCode] || segment.arrival?.iataCode || "Unknown",
            totalFlightDuration: itinerary.duration || "N/A",
            totalLayoverDuration: segment.numberOfStops > 0 ? "Unknown" : "0h 0m",
          })),
    };

    console.log("Transformed Flight Data:", transformedFlightData);
    setSelectedFlightOffer(transformedFlightData);
    router.push("/booking/flightDetails");
    bottomSheetRef.current?.expand();
    console.log("bottomSheetRef:", bottomSheetRef.current?.expand);
  };

  return (
    <View style={styles.container}>
      <View style={{ display: "flex", flexDirection: "column", justifyContent: "center", marginBottom: 10 }}>
        <View
          style={{
            borderWidth: 0,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            margin: 0,
          }}
        >
          <View
            style={[
              styles.routeCard,
              {
                borderWidth: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexDirection: "row",
                width: "30%",
              },
            ]}
          >
            <View>
              <Text style={styles.routeValue}>{searchParams.from}</Text>
            </View>
            <View style={{ flexDirection: "column", alignItems: "center" }}>
              <Icon source="airplane" size={20} />
            </View>
            <View>
              <Text style={styles.routeValue}>{searchParams.to}</Text>
            </View>
          </View>
          <IconButton
            icon={"pencil-outline"}
            size={20}
            style={{}}
            onPress={() => router.push("/(tabs)/home")}
          />
        </View>
        <View style={{ justifyContent: "center", alignItems: "center" }}>
          <Text variant="labelSmall">
            {searchParams.departureDate} | {searchParams.flightClass} |{" "}
            {parseInt(searchParams.adults + searchParams.children + searchParams.infants)} passengers
          </Text>
        </View>
      </View>
      <ScrollView style={{ marginTop: 0 }}>
        {flightOffers.length > 0 ? (
          flightOffers.map((offer: any, index: number) => (
            <View key={index} style={{}}>
              <FlightCard
                flightIndex={`flight-${index}`}
                flightData={offer}
                handleSubmit={() => handleBookFlight(offer)}
              />
            </View>
          ))
        ) : (
          <View style={{ padding: 10, flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ color: theme.colors.backdrop }}>
              No flight offers found for {fromInput} to {toInput} on {searchParams.departureDate}
            </Text>
          </View>
        )}
      </ScrollView>

      <BottomSheet ref={bottomSheetRef} index={1} snapPoints={snapPoints} enablePanDownToClose={true}>
        <View>
          <Text>Bottom Sheet</Text>
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  text: {
    color: "#fff",
  },
  routeCard: {
    backgroundColor: theme.colors.transparent,
    marginVertical: 0,
    marginHorizontal: 10,
    alignItems: "center",
  },
  routeValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.darkGray,
    marginBottom: 0,
  },
});