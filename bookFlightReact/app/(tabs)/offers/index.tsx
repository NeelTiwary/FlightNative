import FlightCard from "@/components/FlightOfferCard";
import { useAppContext } from "@/context/AppContextProvider";
import { theme } from "@/themes/theme";
import BottomSheet from "@gorhom/bottom-sheet";
import { router, useNavigation } from "expo-router";
import { useMemo, useRef } from "react";
import { ScrollView, StyleSheet, View, StatusBar } from "react-native";
import { Icon, IconButton, Text, Divider } from "react-native-paper";

// Static mappings
const iataToCity = {
  EWR: "Newark",
  DEL: "Delhi",
  LAX: "Los Angeles",
  // Add more as needed
};

const carrierCodeToName = {
  UA: "United Airlines",
  AS: "Alaska Airlines",
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
  "73J": "Boeing 737-900",
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
      {/* <StatusBar barStyle="dark-content" backgroundColor="#fff" /> */}
      {/* Flight Offers List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {flightOffers.length > 0 ? (
          flightOffers.map((offer: any, index: number) => (
            <View key={index} style={styles.flightCardContainer}>
              <FlightCard
                flightIndex={`flight-${index}`}
                flightData={offer}
                handleSubmit={() => handleBookFlight(offer)}
              />
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Icon source="airplane-off" size={48} color={theme.colors.backdrop} />
            <Text variant="titleMedium" style={styles.emptyStateTitle}>
              No flights available
            </Text>
            <Text variant="bodyMedium" style={styles.emptyStateText}>
              No flight offers found for {fromInput} to {toInput} on {searchParams.departureDate}
            </Text>
          </View>
        )}
      </ScrollView>

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.bottomSheetIndicator}
      >
        <View style={styles.bottomSheetContent}>
          <Text variant="titleMedium">Flight Details</Text>
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontWeight: '600',
    color: '#2c3e50',
  },
  summaryCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  routeContainer: {
    padding: 16,
  },
  routeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  routeText: {
    fontWeight: '600',
    color: '#2c3e50',
    flex: 1,
  },
  editButton: {
    margin: 0,
  },
  divider: {
    marginBottom: 12,
    backgroundColor: '#e9ecef',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    color: '#6c757d',
  },
  resultsContainer: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  resultsText: {
    color: '#6c757d',
    marginBottom: 8,
  },
  resultsDivider: {
    backgroundColor: '#e9ecef',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  flightCardContainer: {
    marginBottom: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateTitle: {
    color: theme.colors.backdrop,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    color: theme.colors.backdrop,
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomSheetBackground: {
    backgroundColor: '#fff',
    borderRadius: 20,
  },
  bottomSheetIndicator: {
    backgroundColor: '#dee2e6',
    width: 40,
    height: 4,
  },
  bottomSheetContent: {
    padding: 20,
  },
});