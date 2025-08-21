import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";

// Static mappings for IATA codes, carrier codes, and aircraft codes
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

const AppContext = createContext<any>(null);

export const AppContextProvider = ({ children }: { children: React.ReactNode }) => {
  interface SearchParams {
    originLocationCode: string;
    destinationLocationCode: string;
    departureDate: string | null;
    returnDate: string | null;
    adults: number;
    children: number;
    infants: number;
    currencyCode: string;
  }

  const [searchParams, setSearchParams] = useState<SearchParams>({
    originLocationCode: "",
    destinationLocationCode: "",
    departureDate: null,
    returnDate: null,
    adults: 1,
    children: 0,
    infants: 0,
    currencyCode: "INR",
  });

  const flightClasses = ["Economy", "Premium_Economy", "Business", "First"];
  const [fromLoading, setFromLoading] = useState(false);
  const [fromInput, setFromInput] = useState("");
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toLoading, setToLoading] = useState(false);
  const [toInput, setToInput] = useState("");
  const [toSuggestions, setToSuggestions] = useState([]);
  const [flightOffers, setFlightOffers] = useState([]);
  const [selectedFlightOffer, setSelectedFlightOffer] = useState<any>(null);
  const [apiUrl, setApiUrl] = useState("http://54.205.253.121:8080");
  const [countriesData, setCountriesData] = useState([]);
  const [flightBooking, setFlightBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [travelers, setTravelers] = useState<any[]>([]);

  const fetchCountriesData = async () => {
    try {
      const response = await axios.get("https://restcountries.com/v3.1/all?fields=name,cca2,flags,idd");
      console.log("Countries Data Response:", response.data);
      setCountriesData(response.data);
    } catch (error) {
      console.error("Error fetching countries data:", error);
    }
  };

  const fetchFlightOffers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { originLocationCode, destinationLocationCode, departureDate, returnDate, adults, children, infants, currencyCode } = searchParams;

      if (!originLocationCode || !destinationLocationCode || !departureDate) {
        throw new Error("Missing required search parameters");
      }

      let url = `${apiUrl}/flights/search?originLocationCode=${originLocationCode}&destinationLocationCode=${destinationLocationCode}&departureDate=${departureDate}&currencyCode=${currencyCode || "INR"}`;
      if (adults) url += `&adults=${adults}`;
      if (children) url += `&children=${children}`;
      if (infants) url += `&infants=${infants}`;
      if (returnDate) url += `&returnDate=${returnDate}`;

      console.log("Fetching URL:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          response.status === 400
            ? "Invalid search parameters."
            : response.status === 500
            ? "Server error. Please try again later."
            : `HTTP error ${response.status}`
        );
      }

      const data = await response.json();
      console.log("Flight Offers Response:", data);

      const flightsArr: FlightOffer[] = Array.isArray(data.flightsAvailable) ? data.flightsAvailable : [];
      const transformedOffers: FlightOffer[] = flightsArr.map((offer: any) => ({
        oneWay: offer.oneWay,
        seatsAvailable: offer.numberOfBookableSeats,
        currencyCode: offer.price.currency,
        basePrice: offer.price.base,
        totalPrice: offer.price.total,
        totalTravelers: offer.travelerPricings.length,
        pricingAdditionalInfo: JSON.stringify(offer), // Store raw offer data
        trips: offer.itineraries.map((itinerary: any) => ({
          tripType: offer.oneWay ? "ONE_WAY" : "RETURN",
          tripNo: itinerary.id || 1,
          stops: itinerary.segments ? itinerary.segments.length - 1 : 0,
          from: iataToCity[offer.itineraries[0].segments[0].departure.iataCode] || offer.itineraries[0].segments[0].departure.iataCode || "Unknown",
          to: iataToCity[offer.itineraries[0].segments[offer.itineraries[0].segments.length - 1].arrival.iataCode] ||
              offer.itineraries[0].segments[offer.itineraries[0].segments.length - 1].arrival.iataCode || "Unknown",
          totalFlightDuration: itinerary.duration || "N/A",
          totalLayoverDuration: itinerary.segments.some((s: any) => s.numberOfStops > 0) ? "Unknown" : "0h 0m",
          legs: itinerary.segments.map((segment: any) => ({
            carrierName: carrierCodeToName[segment.carrierCode] || segment.carrierCode || "Unknown",
            operatingCarrierCode: segment.operating?.carrierCode || segment.carrierCode || "",
            departureCity: iataToCity[segment.departure.iataCode] || segment.departure.iataCode || "Unknown",
            arrivalCity: iataToCity[segment.arrival.iataCode] || segment.arrival.iataCode || "Unknown",
            departureDateTime: segment.departure.at || "",
            arrivalDateTime: segment.arrival.at || "",
            duration: segment.duration || "N/A",
            aircraft: aircraftCodeToName[segment.aircraft.code] || segment.aircraft.code || "Unknown",
            cabinClass:
              offer.travelerPricings?.[0]?.fareDetailsBySegment?.find(
                (fare: any) => fare.segmentId === segment.id
              )?.cabin || "Economy",
            layoverAfter: segment.numberOfStops > 0 ? "Unknown" : null,
          })),
        })),
      }));

      setFlightOffers(transformedOffers);
      setError(null);
    } catch (error: any) {
      console.error("Flight search error:", error);
      setError(error.message || "Failed to fetch flights. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCountriesData();
  }, []);

  useEffect(() => {
    if (searchParams.originLocationCode && searchParams.destinationLocationCode && searchParams.departureDate) {
      fetchFlightOffers();
    }
  }, [searchParams]);

  useEffect(() => {
    if (selectedFlightOffer && selectedFlightOffer.totalTravelers) {
      setTravelers(
        Array(selectedFlightOffer.totalTravelers).fill({
          firstName: "",
          lastName: "",
          gender: "",
          email: "",
          dateOfBirth: null,
          phoneNumber: {
            countryCallingCode: "",
            number: "",
          },
          document: {
            documentType: "",
            birthPlace: "",
            issuanceLocation: "",
            issuanceDate: "",
            number: "",
            expiryDate: "",
            issuanceCountry: "",
            validityCountry: "",
            nationality: "",
            holder: true,
          },
        })
      );
    }
  }, [selectedFlightOffer]);

  return (
    <AppContext.Provider
      value={{
        searchParams,
        setSearchParams,
        flightClasses,
        fromLoading,
        setFromLoading,
        fromInput,
        setFromInput,
        fromSuggestions,
        setFromSuggestions,
        toLoading,
        setToLoading,
        toInput,
        setToInput,
        toSuggestions,
        setToSuggestions,
        flightOffers,
        setFlightOffers,
        selectedFlightOffer,
        setSelectedFlightOffer,
        travelers,
        setTravelers,
        apiUrl,
        setApiUrl,
        flightBooking,
        setFlightBooking,
        countriesData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppContextProvider");
  }
  return context;
};