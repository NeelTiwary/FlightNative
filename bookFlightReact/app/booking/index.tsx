import TravelerForm from "@/components/TravelerForm";
import { useAppContext } from "@/context/AppContextProvider";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Platform, ScrollView, StyleSheet, View } from "react-native";
import { Button, List, Text, Snackbar } from "react-native-paper";
import axiosInstance from "../../config/axiosConfig";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios"

export default function Booking() {
  const { travelers, setTravelers, selectedFlightOffer, setSelectedFlightOffer, apiUrl, setFlightBooking } = useAppContext();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const router = useRouter();

  const genderOptions = ["MALE", "FEMALE", "OTHER"];
  const documentTypeOptions = ["PASSPORT", "VISA", "GREEN_CARD"];
  const countryCallingCodes = ["+1", "+44", "+91", "+61", "+81"];

  useEffect(() => {
    console.log("selectedFlightOffer:", JSON.stringify(selectedFlightOffer, null, 2));
    console.log("travelers:", travelers);
    if (!travelers.length && selectedFlightOffer?.totalTravelers) {
      handleAddTraveler();
    }
  }, [selectedFlightOffer, travelers]);

  const handleAccordionPress = (index: number) => {
    setExpandedIndex(index === expandedIndex ? null : index);
  };

  const handleAddTraveler = () => {
    const newTraveler = {
      id: `${Date.now()}-${travelers.length + 1}`,
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
    };
    setTravelers([...travelers, newTraveler]);
    console.log("Added traveler:", newTraveler);
    setExpandedIndex(travelers.length);
  };

  const handleChange = (field: string, index: number) => (value: string) => {
    const newTravelers = [...travelers];
    if (field.includes("phoneNumber.")) {
      const phoneField = field.split(".")[1];
      newTravelers[index] = {
        ...newTravelers[index],
        phoneNumber: {
          ...newTravelers[index].phoneNumber,
          [phoneField]: value,
        },
      };
    } else if (field.includes("document.")) {
      const docField = field.split(".")[1];
      if (docField === "issuanceCountry") {
        newTravelers[index] = {
          ...newTravelers[index],
          document: {
            ...newTravelers[index].document,
            [docField]: value,
            validityCountry: value,
            nationality: value,
          },
        };
      } else if (docField === "birthPlace") {
        newTravelers[index] = {
          ...newTravelers[index],
          document: {
            ...newTravelers[index].document,
            [docField]: value,
            issuanceLocation: value,
          },
        };
      } else {
        newTravelers[index] = {
          ...newTravelers[index],
          document: {
            ...newTravelers[index].document,
            [docField]: value,
          },
        };
      }
    } else {
      newTravelers[index] = {
        ...newTravelers[index],
        [field]: value,
      };
    }
    setTravelers(newTravelers);
    console.log("Updated traveler:", newTravelers[index]);
  };

  const validateTravelers = () => {
    const errors: string[] = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = travelers.every((traveler, index) => {
      const requiredFields = [
        { field: "firstName", label: `Traveler ${index + 1} First Name` },
        { field: "lastName", label: `Traveler ${index + 1} Last Name` },
        { field: "gender", label: `Traveler ${index + 1} Gender` },
        { field: "email", label: `Traveler ${index + 1} Email` },
        { field: "dob", label: `Traveler ${index + 1} Date of Birth` },
        { field: "phoneNumber.countryCallingCode", label: `Traveler ${index + 1} Phone Country Code` },
        { field: "phoneNumber.number", label: `Traveler ${index + 1} Phone Number` },
        { field: "document.documentType", label: `Traveler ${index + 1} Document Type` },
        { field: "document.number", label: `Traveler ${index + 1} Document Number` },
        { field: "document.expiryDate", label: `Traveler ${index + 1} Document Expiry Date` },
        { field: "document.issuanceDate", label: `Traveler ${index + 1} Issuance Date` },
        { field: "document.issuanceCountry", label: `Traveler ${index + 1} Issuance Country` },
        { field: "document.validityCountry", label: `Traveler ${index + 1} Validity Country` },
        { field: "document.nationality", label: `Traveler ${index + 1} Nationality` },
        { field: "document.birthPlace", label: `Traveler ${index + 1} Birth Place` },
        { field: "document.issuanceLocation", label: `Traveler ${index + 1} Issuance Location` },
      ];

      const missingFields = requiredFields.filter(({ field }) => {
        if (field.includes(".")) {
          const [parent, child] = field.split(".");
          return !traveler[parent]?.[child];
        }
        if (field === "email" && traveler[field] && !emailRegex.test(traveler[field])) {
          return true;
        }
        return !traveler[field];
      });

      if (missingFields.length > 0) {
        const errorMessage = `Missing or invalid fields for Traveler ${index + 1}: ${missingFields
          .map((f) => f.label)
          .join(", ")}`;
        errors.push(errorMessage);
        console.log(errorMessage);
        return false;
      }
      return true;
    });

    if (!isValid) {
      setSnackbarMessage(errors.join("; "));
      setSnackbarVisible(true);
      console.log("Validation failed:", errors);
    } else {
      console.log("Validation passed");
    }
    return isValid;
  };

  const handleBooking = async () => {
  try {
    setLoading(true);
    if (!validateTravelers()) {
      return;
    }

    // Ensure we have parsed offer object
    let flightOffer;
    try {
      // console.log("Selected flight offer pricing info:", selectedFlightOffer);
      flightOffer = selectedFlightOffer.pricingAdditionalInfo
    } catch (error) {
      throw new Error("Invalid flight offer format");
    }

     const bookingData = {
      flightOffer: flightOffer, // Stringify the flight offer
      travelers: travelers.map((traveler: any, index: number) => ({
        id: index + 1, // Use number instead of string
        firstName: traveler.firstName, // Include firstName at root level
        lastName: traveler.lastName,   // Include lastName at root level
        dateOfBirth: traveler.dob,
        gender: traveler.gender,
        email: traveler.email, // Include email at root level
        phones: [
          {
            deviceType: "MOBILE",
            countryCalingCode: traveler.phoneNumber.countryCallingCode,
            number: traveler.phoneNumber.number,
          },
        ],
        documents: [
          {
            documentType: traveler.document.documentType,
            number: traveler.document.number,
            issuanceDate: traveler.document.issuanceDate,
            expiryDate: traveler.document.expiryDate,
            issuanceCountry: traveler.document.issuanceCountry, // Use code "IN" instead of "India"
            issuanceLocation: traveler.document.issuanceLocation,
            nationality: traveler.document.nationality, // Use code "IN" instead of "India"
            birthPlace: traveler.document.birthPlace,
            validityCountry: traveler.document.validityCountry, // Use code "IN" instead of "India"
            holder: true,
          },
        ],
      })),
    };

    console.log( JSON.stringify(bookingData, null, 2));

    //  const endpoint = apiUrl
    //   ? `${apiUrl}/booking/flight-order`
    //   : "/v1/booking/flight-orders";
   const endpoint = "http://192.168.0.102:8080/booking/flight-order";

    const response = await axiosInstance.post(endpoint, bookingData, {
      headers: { "Content-Type": "application/json" },
    });

    const bookingResponse = response.data;

    if (!bookingResponse) {
      throw new Error("Incomplete booking data received.");
    }

    setFlightBooking(bookingResponse);
    setTravelers([]);
    setSnackbarMessage(`Booking successful! Order ID: ${bookingResponse}`);
    setSnackbarVisible(true);

    if (Platform.OS === "web") {
      localStorage.setItem("flightBooking", JSON.stringify(bookingResponse));
    }

    router.push("/booking/confirmation");
  } catch (error: any) {
    console.error("Booking error:", error.response?.data || error.message);
    setSnackbarMessage(
      error.response?.data?.errors?.[0]?.detail ||
        "Failed to book flight. Please try again."
    );
    setSnackbarVisible(true);
  } finally {
    setLoading(false);
  }
};


  const confirmFlightOfferPricing = async () => {
        try {
            const body = {
                flightOffer: selectedFlightOffer.pricingAdditionalInfo,
            }
             const response = await axiosInstance.post(`/pricing/flights/confirm`, body);
          //  const response = await axios.post(`${apiUrl}/pricing/flights/confirm`, body);
            console.log("Flight offer pricing:", response.data);
            //setSelectedFlightOffer(response.data);
        } catch (error) {
            console.error("Error fetching flight offer pricing:", error);
        }

    }


  useEffect(() => {
    if (selectedFlightOffer && selectedFlightOffer.pricingAdditionalInfo) {
      confirmFlightOfferPricing();
    }
  }, [selectedFlightOffer]);

  const renderFlightSummary = () => {
    if (!selectedFlightOffer || !selectedFlightOffer.pricingAdditionalInfo) {
      return null;
    }

    let flightOffer;
    try {
      flightOffer =
        typeof selectedFlightOffer.pricingAdditionalInfo === "string"
          ? JSON.parse(selectedFlightOffer.pricingAdditionalInfo)
          : selectedFlightOffer.pricingAdditionalInfo;
    } catch (error) {
      console.error("Error parsing flightOffer:", error);
      return null;
    }

    const itinerary = flightOffer.itineraries?.[0];
    const firstSegment = itinerary?.segments?.[0];

    return (
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <MaterialCommunityIcons name="airplane" size={24} color="#007AFF" />
          <Text style={styles.summaryTitle}>Flight Summary</Text>
        </View>
        <View style={styles.summaryContent}>
          <View style={styles.summaryRow}>
            <MaterialCommunityIcons name="arrow-decision" size={16} color="#666" />
            <Text style={styles.summaryLabel}>Route:</Text>
            <Text style={styles.summaryValue}>
              {firstSegment?.departure?.iataCode || "Unknown"} → {firstSegment?.arrival?.iataCode || "Unknown"}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <MaterialCommunityIcons name="calendar" size={16} color="#666" />
            <Text style={styles.summaryLabel}>Date:</Text>
            <Text style={styles.summaryValue}>
              {firstSegment?.departure?.at
                ? new Date(firstSegment.departure.at).toLocaleDateString()
                : "N/A"}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <MaterialCommunityIcons name="cash" size={16} color="#666" />
            <Text style={styles.summaryLabel}>Total Price:</Text>
            <Text style={[styles.summaryValue, styles.priceText]}>
              {selectedFlightOffer.currencyCode} {selectedFlightOffer.totalPrice}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>



      <ScrollView contentContainerStyle={styles.scrollContent}>
        {renderFlightSummary()}
        {travelers.length > 0 ? (
          travelers.map((traveler: any, index: number) => (
            <View key={`traveler-${traveler.id}`} style={styles.travelerCard}>
              <List.Accordion
                title={
                  traveler.firstName && traveler.lastName
                    ? `${traveler.firstName} ${traveler.lastName}`
                    : `Traveler ${index + 1}`
                }
                left={(props) => <List.Icon {...props} icon="account" color="#007AFF" />}
                expanded={expandedIndex === index}
                onPress={() => handleAccordionPress(index)}
                style={styles.accordion}
                titleStyle={styles.accordionTitle}
              >
                <TravelerForm
                  traveler={traveler}
                  handleChange={handleChange}
                  index={index}
                  genderOptions={genderOptions}
                  documentTypeOptions={documentTypeOptions}
                  countryCallingCodes={countryCallingCodes}
                />
              </List.Accordion>
            </View>
          ))
        ) : (
          <View style={styles.noTravelersContainer}>
            <MaterialCommunityIcons name="account-multiple" size={48} color="#E0E0E0" />
            <Text style={styles.noTravelersText}>No travelers added yet</Text>
            <Button
              mode="contained"
              onPress={handleAddTraveler}
              style={styles.addTravelerButton}
              labelStyle={styles.addTravelerButtonLabel}
            >
              Add Traveler
            </Button>
          </View>
        )}

        {travelers.length > 0 && (
          <Button
            mode="contained"
            onPress={handleBooking}
            loading={loading}
            disabled={loading || travelers.length === 0}
            style={styles.bookButton}
            labelStyle={styles.bookButtonLabel}
            icon="airplane-takeoff"
          >
            {loading ? "Booking..." : `Book Flight (${travelers.length})`}
          </Button>
        )}
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={5000}
        style={styles.snackbar}
        action={{
          label: "Dismiss",
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e0e9f3ff",
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 19,
    padding: 16,
    marginBottom: 8,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#1A1A1A",
    marginLeft: 8,
  },
  summaryContent: {
    paddingHorizontal: 8,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666666",
    marginLeft: 8,
    marginRight: 12,
    width: 80,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1A1A1A",
    flex: 1,
  },
  priceText: {
    color: "#007AFF",
    fontWeight: "600",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
  },
  travelerCard: {
    marginBottom: 16,
    backgroundColor: "#ffffffff",
    borderRadius: 19,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    marginTop: 0,
  },
  accordion: {
    backgroundColor: "#ffffffff",
    borderTopLeftRadius: 19,
    borderTopRightRadius: 19,
  },
  accordionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1A1A1A",
  },
  noTravelersContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 16,
  },
  noTravelersText: {
    fontSize: 16,
    color: "#999999",
    marginTop: 12,
    textAlign: "center",
  },
  addTravelerButton: {
    marginTop: 16,
    borderRadius: 8,
    backgroundColor: "#007AFF",
  },
  addTravelerButtonLabel: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  bookButton: {
    borderRadius: 11,
    backgroundColor: "#007AFF",
    paddingVertical: 6,
    marginHorizontal: 10,
  },
  bookButtonLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  snackbar: {
    backgroundColor: "#323232",
    margin: 16,
    borderRadius: 8,
  },
});