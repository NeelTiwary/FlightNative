import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";

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
    currencyCode: "INR",
    flightClass: "Economy",
  });

  const flightClasses = ["Economy", "Premium_Economy", "Business", "First"];
  const [fromLoading, setFromLoading] = useState(false);
  const [fromInput, setFromInput] = useState("");
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toLoading, setToLoading] = useState(false);
  const [toInput, setToInput] = useState("");
  const [toSuggestions, setToSuggestions] = useState([]);
  const [flightOffers, setFlightOffers] = useState<FlightOffer[]>([]);
  const [selectedFlightOffer, setSelectedFlightOffer] = useState<FlightOffer | null>(null);
  //const [apiUrl, setApiUrl] = useState("http://3.94.254.69:8080");
  const [apiUrl, setApiUrl] = useState("http://34.235.111.48:8080");
  const [countriesData, setCountriesData] = useState([]);
  const [flightBooking, setFlightBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [travelers, setTravelers] = useState<Traveler[]>([]);

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

      const transformedOffers: FlightOffer[] = flightsArr.map((offer: any, index: number) => {
        let parsedOffer;
        try {
          parsedOffer = typeof offer.pricingAdditionalInfo === "string"
            ? JSON.parse(offer.pricingAdditionalInfo)
            : offer.pricingAdditionalInfo || offer;
        } catch (e) {
          console.warn("Failed to parse pricingAdditionalInfo", e);
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

      setFlightOffers(transformedOffers);
      setError(null);
    } catch (error: any) {
      console.error("Flight search error:", error);
      setError(error.message || "Failed to fetch flights. Please try again.");
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
    if (searchParams.originLocationCode && searchParams.destinationLocationCode && searchParams.departureDate) {
      fetchFlightOffers();
    }
  }, [searchParams]);

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