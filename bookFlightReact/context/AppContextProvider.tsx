import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { dummyFlightData } from "../utils/flightData";

const iataToCity = {
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
  KU: "Kuwait Airways",
  QR: "Qatar Airways",
  EK: "Emirates",
  BA: "British Airways",
  AF: "Air France",
  LH: "Lufthansa",
  EY: "Etihad Airways",
};

const aircraftCodeToName = {
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
    flightClass: string;
  }

  interface Traveler {
    id: string;
    firstName: string;
    lastName: string;
    dob: string;
    gender: string;
    email: string;
    phoneNumber: { countryCallingCode: string; number: string };
    document: {
      documentType: string;
      number: string;
      expiryDate: string;
      issuanceDate: string;
      issuanceCountry: string;
      validityCountry: string;
      nationality: string;
      birthPlace: string;
      issuanceLocation: string;
      holder: boolean;
    };
  }

  interface Leg {
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
  }

  interface Trip {
    from: string;
    to: string;
    stops: number;
    totalFlightDuration: string;
    totalLayoverDuration: string;
    legs: Leg[];
  }

  interface FlightOffer {
    oneWay: boolean;
    seatsAvailable: number;
    currencyCode: string;
    basePrice: string;
    totalPrice: string;
    totalTravelers: number;
    trips: Trip[];
    pricingAdditionalInfo: string;
  }

  const [searchParams, setSearchParams] = useState<SearchParams>({
    originLocationCode: "",
    destinationLocationCode: "",
    departureDate: null,
    returnDate: null,
    adults: 1,
    children: 0,
    infants: 0,
    currencyCode: "USD",
    flightClass: "Economy",
  });

  const [travelers, setTravelers] = useState<Traveler[]>([]);
  const flightClasses = ["Economy", "Premium_Economy", "Business", "First"];
  const [fromLoading, setFromLoading] = useState(false);
  const [fromInput, setFromInput] = useState("");
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toLoading, setToLoading] = useState(false);
  const [toInput, setToInput] = useState("");
  const [toSuggestions, setToSuggestions] = useState([]);
  const [flightOffers, setFlightOffers] = useState<FlightOffer[]>(dummyFlightData.flightsAvailable);
  const [selectedFlightOffer, setSelectedFlightOffer] = useState<FlightOffer | null>(null);
  const [apiUrl, setApiUrl] = useState("http://192.168.0.103:8080");
  const [countriesData, setCountriesData] = useState([]);
  const [flightBooking, setFlightBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCountriesData = async () => {
    try {
      const response = await axios.get("https://restcountries.com/v3.1/all?fields=name,cca2,flags,idd");
      setCountriesData(response.data);
    } catch (error) {
      console.error("Error fetching countries data:", error);
      setError("Failed to fetch countries data.");
    }
  };

  const fetchFlightOffers = async () => {
    setIsLoading(true);
    setError(null);
    console.log("fetchFlightOffers: Starting with searchParams:", searchParams);
    try {
      const { originLocationCode, destinationLocationCode, departureDate, returnDate, adults, children, infants, currencyCode } = searchParams;

      if (!originLocationCode || !destinationLocationCode || !departureDate) {
        throw new Error("Missing required search parameters");
      }

      let url = `${apiUrl}/flights/search?originLocationCode=${originLocationCode}&destinationLocationCode=${destinationLocationCode}&departureDate=${departureDate}&currencyCode=${currencyCode || "USD"}`;
      if (adults) url += `&adults=${adults}`;
      if (children) url += `&children=${children}`;
      if (infants) url += `&infants=${infants}`;
      if (returnDate) url += `&returnDate=${returnDate}`;

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
      const flightsArr: any[] = Array.isArray(data.flightsAvailable) ? data.flightsAvailable : [];

      if (flightsArr.length === 0) {
        console.warn("No flights available from API, using dummy data");
        setFlightOffers(dummyFlightData.flightsAvailable);
        setError("No flights found for the selected criteria. Showing sample flights.");
        setIsLoading(false);
        return;
      }

      const transformedOffers: FlightOffer[] = flightsArr.map((offer: any, index: number) => {
        let parsedOffer;
        try {
          parsedOffer = typeof offer.pricingAdditionalInfo === "string"
            ? JSON.parse(offer.pricingAdditionalInfo)
            : offer.pricingAdditionalInfo || offer;
        } catch (e) {
          console.warn(`Failed to parse pricingAdditionalInfo for flight ${index}:`, e);
          parsedOffer = offer;
        }

        const itineraries = parsedOffer.itineraries || [];

        return {
          oneWay: parsedOffer.oneWay || false,
          seatsAvailable: parsedOffer.numberOfBookableSeats || 0,
          currencyCode: parsedOffer.price?.currency || "USD",
          basePrice: parsedOffer.price?.base || "0",
          totalPrice: parsedOffer.price?.total || "0",
          totalTravelers: parsedOffer.travelerPricings?.length || 1,
          pricingAdditionalInfo: JSON.stringify(parsedOffer),
          trips: itineraries.map((itinerary: any, idx: number) => {
            const segments = itinerary.segments || [];
            const firstSegment = segments[0] || {};
            const lastSegment = segments[segments.length - 1] || {};

            return {
              from: firstSegment.departure?.iataCode || "Unknown",
              to: lastSegment.arrival?.iataCode || "Unknown",
              stops: Math.max(0, segments.length - 1),
              totalFlightDuration: itinerary.duration || "N/A",
              totalLayoverDuration: calculateLayoverDuration(segments),
              legs: segments.map((segment: any, segIdx: number) => ({
                legNo: `${idx + 1}-${segIdx + 1}`,
                flightNumber: segment.number || "",
                carrierCode: segment.carrierCode || "",
                operatingCarrierCode: segment.operating?.carrierCode || segment.carrierCode || "",
                aircraftCode: segment.aircraft?.code || "",
                departureAirport: segment.departure?.iataCode || "",
                departureTerminal: segment.departure?.terminal || "N/A",
                departureDateTime: segment.departure?.at || "",
                arrivalAirport: segment.arrival?.iataCode || "",
                arrivalTerminal: segment.arrival?.terminal || "N/A",
                arrivalDateTime: segment.arrival?.at || "",
                duration: segment.duration || "N/A",
                layoverAfter: segIdx < segments.length - 1 ? calculateSegmentLayover(segments, segIdx) : null,
              })),
            };
          }),
        };
      });

      console.log("fetchFlightOffers: Setting flightOffers:", transformedOffers);
      setFlightOffers(transformedOffers);
      setError(null);
    } catch (error: any) {
      console.error("fetchFlightOffers error:", error.message);
      console.log("fetchFlightOffers: Setting dummy data");
      setFlightOffers(dummyFlightData.flightsAvailable);
      setError("Failed to fetch flights. Showing sample flights.");
    } finally {
      setIsLoading(false);
    }
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

  useEffect(() => {
    fetchCountriesData();
  }, []);

  useEffect(() => {
    console.log("searchParams useEffect: Starting with searchParams:", searchParams);
    if (searchParams.originLocationCode && searchParams.destinationLocationCode && searchParams.departureDate) {
      console.log("searchParams useEffect: Fetching flights");
      fetchFlightOffers();
    } else {
      console.log("searchParams useEffect: Setting dummy data due to incomplete searchParams");
      setFlightOffers(dummyFlightData.flightsAvailable);
      setError("Please enter search criteria to find flights. Showing sample flights.");
    }
  }, [searchParams]);

  // Debug flightOffers updates
  useEffect(() => {
    console.log("flightOffers updated:", flightOffers);
  }, [flightOffers]);

  useEffect(() => {
    if (selectedFlightOffer && selectedFlightOffer.totalTravelers) {
      setTravelers(
        Array(selectedFlightOffer.totalTravelers)
          .fill(null)
          .map((_, index) => ({
            id: `${Date.now()}-${index + 1}`,
            firstName: "",
            lastName: "",
            dob: "",
            gender: "",
            email: "",
            phoneNumber: {
              countryCallingCode: "",
              number: "",
            },
            document: {
              documentType: "",
              number: "",
              expiryDate: "",
              issuanceDate: "",
              issuanceCountry: "",
              validityCountry: "",
              nationality: "",
              birthPlace: "",
              issuanceLocation: "",
              holder: true,
            },
          }))
      );
    } else {
      setTravelers([]);
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
        isLoading,
        error,
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