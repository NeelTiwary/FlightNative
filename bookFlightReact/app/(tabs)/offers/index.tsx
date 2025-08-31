import { useAppContext } from "@/context/AppContextProvider";
import { theme } from "@/themes/theme";
import BottomSheet from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import { useMemo, useRef, useEffect } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Icon, Text } from "react-native-paper";
import FlightCard from "@/components/FlightOfferCard";

interface FlightOffer {
  oneWay: boolean;
  seatsAvailable: number;
  currencyCode: string;
  basePrice: string;
  totalPrice: string;
  totalTravelers: number;
  trips: {
    from: string;
    to: string;
    stops: number;
    totalFlightDuration: string;
    totalLayoverDuration: string;
    legs: {
      legNo: string;
      flightNumber: string;
      carrierCode: string;
      operatingCarrierCode: string;
      aircraftCode: string;
      departureAirport: string;
      departureTerminal: string;
      departureDateTime: string;
      arrivalAirport: string;
      arrivalTerminal: string;
      arrivalDateTime: string;
      duration: string;
      layoverAfter: string | null;
    }[];
  }[];
  pricingAdditionalInfo: string;
}

const iataToCity: { [key: string]: string } = {
  EWR: "Newark",
  DEL: "Delhi",
  LAX: "Los Angeles",
  JFK: "New York",
  KWI: "Kuwait City",
  LHR: "London",
  DXB: "Dubai",
  CDG: "Paris",
  FRA: "Frankfurt",
  DOH: "Doha",
  IST: "Istanbul",
  AUH: "Abu Dhabi",
};

const carrierCodeToName: { [key: string]: string } = {
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
  KU: "Kuwait Airways",
  QR: "Qatar Airways",
  EK: "Emirates",
  BA: "British Airways",
  AF: "Air France",
  LH: "Lufthansa",
  EY: "Etihad Airways",
};

const aircraftCodeToName: { [key: string]: string } = {
  "789": "Boeing 787-9",
  "73J": "Boeing 737-900",
  "32N": "Airbus A320neo",
  "77W": "Boeing 777-300ER",
  "351": "Airbus A350-1000",
  "388": "Airbus A380-800",
  "359": "Airbus A350-900",
  "333": "Airbus A330-300",
  "772": "Boeing 777-200",
  "787": "Boeing 787-8",
};

export default function Offers() {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["25%", "50%", "80%"], []);
  const {
    selectedFlightOffer,
    setSelectedFlightOffer,
    flightOffers,
    searchParams,
    fromInput,
    toInput,
    error,
    isLoading,
  } = useAppContext();

  // Debug log to verify context values
  useEffect(() => {
    console.log("Offers - flightOffers:", flightOffers);
    console.log("Offers - isLoading:", isLoading);
    console.log("Offers - error:", error);
  }, [flightOffers, isLoading, error]);

  const handleBookFlight = (flightData: FlightOffer) => {
    if (!flightData) {
      console.warn("handleBookFlight: No flight data provided");
      return;
    }

    let itineraries: any[] = [];
    try {
      const additionalInfo = JSON.parse(flightData.pricingAdditionalInfo);
      itineraries = Array.isArray(additionalInfo.itineraries) ? additionalInfo.itineraries : [];
    } catch (error) {
      console.warn("handleBookFlight: Failed to parse pricingAdditionalInfo", error);
    }

    const transformedFlightData: FlightOffer = {
      ...flightData,
      trips: flightData.trips.length > 0
        ? flightData.trips.map((trip, index) => ({
            ...trip,
            from: iataToCity[trip.from] || trip.from,
            to: iataToCity[trip.to] || trip.to,
            legs: trip.legs.map((leg) => ({
              ...leg,
              carrierName: carrierCodeToName[leg.carrierCode] || leg.carrierCode || "Unknown",
              operatingCarrierName:
                carrierCodeToName[leg.operatingCarrierCode] || leg.operatingCarrierCode || "Unknown",
              aircraft: aircraftCodeToName[leg.aircraftCode] || leg.aircraftCode || "Unknown",
              departureCity: iataToCity[leg.departureAirport] || leg.departureAirport,
              arrivalCity: iataToCity[leg.arrivalAirport] || leg.arrivalAirport,
              cabinClass:
                JSON.parse(flightData.pricingAdditionalInfo)?.travelerPricings?.[0]?.fareDetailsBySegment?.find(
                  (fare: any) => fare.segmentId === leg.legNo
                )?.cabin || "Economy",
            })),
          }))
        : itineraries.map((itinerary: any, index: number) => ({
            tripType: flightData.oneWay ? "ONE_WAY" : "RETURN",
            tripNo: index + 1,
            stops: itinerary.segments ? itinerary.segments.length - 1 : 0,
            from: iataToCity[itinerary.segments?.[0]?.departure?.iataCode] || itinerary.segments?.[0]?.departure?.iataCode || "Unknown",
            to: iataToCity[itinerary.segments?.[itinerary.segments.length - 1]?.arrival?.iataCode] || itinerary.segments?.[itinerary.segments.length - 1]?.arrival?.iataCode || "Unknown",
            totalFlightDuration: itinerary.duration || "N/A",
            totalLayoverDuration:
              itinerary.segments && itinerary.segments.length > 1
                ? calculateLayoverDuration(itinerary.segments)
                : "0h 0m",
            legs: (itinerary.segments || []).map((segment: any, segIdx: number) => ({
              legNo: `${index + 1}-${segIdx + 1}`,
              flightNumber: segment.number || "",
              carrierName: carrierCodeToName[segment.carrierCode] || segment.carrierCode || "Unknown",
              operatingCarrierName:
                carrierCodeToName[segment.operating?.carrierCode] || segment.operating?.carrierCode || "Unknown",
              aircraft: aircraftCodeToName[segment.aircraft?.code] || segment.aircraft?.code || "Unknown",
              departureCity: iataToCity[segment.departure?.iataCode] || segment.departure?.iataCode || "Unknown",
              arrivalCity: iataToCity[segment.arrival?.iataCode] || segment.arrival?.iataCode || "Unknown",
              departureDateTime: segment.departure?.at || "",
              arrivalDateTime: segment.arrival?.at || "",
              duration: segment.duration || "N/A",
              departureAirport: segment.departure?.iataCode || "",
              arrivalAirport: segment.arrival?.iataCode || "",
              departureTerminal: segment.departure?.terminal || "N/A",
              arrivalTerminal: segment.arrival?.terminal || "N/A",
              cabinClass:
                JSON.parse(flightData.pricingAdditionalInfo)?.travelerPricings?.[0]?.fareDetailsBySegment?.find(
                  (fare: any) => fare.segmentId === segment.id
                )?.cabin || "Economy",
              layoverAfter: segIdx < itinerary.segments.length - 1 ? calculateSegmentLayover(itinerary.segments, segIdx) : null,
            })),
          })),
    };

    console.log("Transformed Flight Data:", transformedFlightData);
    setSelectedFlightOffer(transformedFlightData);
    router.push("/booking/flightDetails");
    bottomSheetRef.current?.expand();
  };

  const calculateLayoverDuration = (segments: any[]): string => {
    let totalLayover = 0;
    for (let i = 0; i < segments.length - 1; i++) {
      const currentSegment = segments[i];
      const nextSegment = segments[i + 1];
      const arrival = new Date(currentSegment.arrival?.at);
      const departure = new Date(nextSegment.departure?.at);
      if (!isNaN(arrival.getTime()) && !isNaN(departure.getTime())) {
        const layoverMs = departure.getTime() - arrival.getTime();
        totalLayover += layoverMs;
      }
    }
    const hours = Math.floor(totalLayover / (1000 * 60 * 60));
    const minutes = Math.floor((totalLayover % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const calculateSegmentLayover = (segments: any[], index: number): string | null => {
    if (index >= segments.length - 1) return null;
    const currentSegment = segments[index];
    const nextSegment = segments[index + 1];
    const arrival = new Date(currentSegment.arrival?.at);
    const departure = new Date(nextSegment.departure?.at);
    if (!isNaN(arrival.getTime()) && !isNaN(departure.getTime())) {
      const layoverMs = departure.getTime() - arrival.getTime();
      const hours = Math.floor(layoverMs / (1000 * 60 * 60));
      const minutes = Math.floor((layoverMs % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m`;
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.emptyState}>
            <Icon source="loading" size={48} color={theme.colors.backdrop} />
            <Text variant="titleMedium" style={styles.emptyStateTitle}>
              Loading flights...
            </Text>
          </View>
        ) : flightOffers && flightOffers.length > 0 ? (
          <>
            <Text variant="titleMedium" style={styles.resultsText}>
              {flightOffers.length} flight{flightOffers.length > 1 ? "s" : ""} found
              {searchParams.originLocationCode && searchParams.destinationLocationCode
                ? ` for ${fromInput || iataToCity[searchParams.originLocationCode] || "Unknown"} to ${
                    toInput || iataToCity[searchParams.destinationLocationCode] || "Unknown"
                  }`
                : ""}
              {error && error.includes("sample flights") ? " (Sample Data)" : ""}
            </Text>
            {flightOffers.map((offer: FlightOffer, index: number) => (
              <View key={`flight-${index}`} style={styles.flightCardContainer}>
                <FlightCard
                  flightIndex={`flight-${index}`}
                  flightData={offer}
                  handleSubmit={() => handleBookFlight(offer)}
                  isLast={index === flightOffers.length - 1}
                />
              </View>
            ))}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Icon source="airplane-off" size={48} color={theme.colors.backdrop} />
            <Text variant="titleMedium" style={styles.emptyStateTitle}>
              No flights available
            </Text>
            <Text variant="bodyMedium" style={styles.emptyStateText}>
              {error || "No flights found. Please try different search criteria."}
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
          {selectedFlightOffer && (
            <Text variant="bodyMedium">
              Selected flight from {selectedFlightOffer.trips[0]?.from} to {selectedFlightOffer.trips[0]?.to}
            </Text>
          )}
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  flightCardContainer: {
    marginBottom: 12,
  },
  resultsText: {
    color: "#6c757d",
    marginVertical: 8,
    paddingHorizontal: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyStateTitle: {
    color: theme.colors.backdrop,
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateText: {
    color: theme.colors.backdrop,
    textAlign: "center",
    lineHeight: 20,
  },
  bottomSheetBackground: {
    backgroundColor: "#fff",
    borderRadius: 20,
  },
  bottomSheetIndicator: {
    backgroundColor: "#dee2e6",
    width: 40,
    height: 4,
  },
  bottomSheetContent: {
    padding: 20,
  },
});