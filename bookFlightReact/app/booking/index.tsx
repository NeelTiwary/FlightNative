import TravelerForm from "@/components/TravelerForm";
import { useAppContext } from "@/context/AppContextProvider";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Platform, ScrollView, StyleSheet, View } from "react-native";
import { Button, List, Text, Card, Snackbar, Portal, Modal } from "react-native-paper";
import axiosInstance from "../../config/axiosConfig";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function Booking() {
  const { travelers, setTravelers, selectedFlightOffer, setSelectedFlightOffer, apiUrl, setFlightBooking } = useAppContext();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const router = useRouter();

  const genderOptions = ["MALE", "FEMALE", "OTHER"];
  const documentTypeOptions = ["PASSPORT", "VISA", "GREEN_CARD"];
  const countryCallingCodes = ["+1", "+44", "+91", "+61", "+81"];

  const handleAccordionPress = (index: number) => {
    setExpandedIndex(index === expandedIndex ? null : index);
  };

  const handleChange = (field: string, index: number) => (value: string) => {
    const newTravelers = [...travelers];
    if (field.includes("document.")) {
      const docField = field.split(".")[1];
      if (docField === "birthPlace") {
        newTravelers[index] = {
          ...newTravelers[index],
          document: {
            ...newTravelers[index].document,
            [docField]: value,
            issuanceLocation: value,
          },
        };
      } else if (docField === "issuanceCountry") {
        newTravelers[index] = {
          ...newTravelers[index],
          document: {
            ...newTravelers[index].document,
            [docField]: value,
            validityCountry: value,
            nationality: value,
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
    } else if (field.includes("phoneNumber.")) {
      const phoneField = field.split(".")[1];
      newTravelers[index] = {
        ...newTravelers[index],
        phoneNumber: {
          ...newTravelers[index].phoneNumber,
          [phoneField]: value,
        },
      };
    } else {
      newTravelers[index] = {
        ...newTravelers[index],
        [field]: value,
      };
    }
    setTravelers(newTravelers);
  };

  const validateTravelers = () => {
    return travelers.every((traveler) =>
      traveler.firstName &&
      traveler.lastName &&
      traveler.gender &&
      traveler.email &&
      traveler.dateOfBirth &&
      traveler.phoneNumber.countryCallingCode &&
      traveler.phoneNumber.number &&
      traveler.document.documentType &&
      traveler.document.number &&
      traveler.document.expiryDate &&
      traveler.document.issuanceCountry
    );
  };

  const handleBooking = async () => {
    if (!validateTravelers()) {
      setSnackbarMessage("Please fill all required traveler details.");
      setSnackbarVisible(true);
      return;
    }

    setShowConfirmModal(true);
  };

  const confirmBooking = async () => {
    try {
      setLoading(true);
      setShowConfirmModal(false);
      const bookingData = {
        flightOffer: selectedFlightOffer.pricingAdditionalInfo,
        travelers: travelers.map((traveler: any, index: number) => ({
          id: index + 1,
          firstName: traveler.firstName,
          lastName: traveler.lastName,
          dateOfBirth: traveler.dateOfBirth,
          gender: traveler.gender,
          email: traveler.email,
          phones: [
            {
              deviceType: "MOBILE",
              countryCallingCode: traveler.phoneNumber.countryCallingCode,
              number: traveler.phoneNumber.number,
            },
          ],
          documents: [{ ...traveler.document, holder: true }],
        })),
      };

      const response = await axiosInstance.post(`${apiUrl}/booking/flight-order`, bookingData);
      setFlightBooking(response.data);
      if (Platform.OS === "web") {
        localStorage.setItem("flightBooking", JSON.stringify(response.data));
      }
      setTravelers([]);
      setSnackbarMessage(`Booking successful! Order ID: ${response.data.orderId}`);
      setSnackbarVisible(true);
      router.push("/booking/confirmation");
    } catch (error) {
      console.error("Booking error:", error);
      setSnackbarMessage("Failed to book flight. Please try again.");
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const confirmFlightOfferPricing = async () => {
    try {
      const body = {
        flightOffer: selectedFlightOffer.pricingAdditionalInfo,
      };
      const response = await axiosInstance.post(`${apiUrl}/pricing/flights/confirm`, body);
      console.log("Flight offer pricing:", response.data);
      setSelectedFlightOffer(response.data);
    } catch (error) {
      console.error("Error fetching flight offer pricing:", error);
      setSnackbarMessage("Failed to confirm flight pricing.");
      setSnackbarVisible(true);
    }
  };

  useEffect(() => {
    if (selectedFlightOffer && selectedFlightOffer.pricingAdditionalInfo) {
      confirmFlightOfferPricing();
    }
  }, []);

  const renderFlightSummary = () => {
    if (!selectedFlightOffer || !selectedFlightOffer.trips || !Array.isArray(selectedFlightOffer.trips)) {
      return null;
    }

    const trip = selectedFlightOffer.trips[0];
    const firstLeg = trip.legs && trip.legs[0];
    return (
      <Card style={styles.summaryCard}>
        <Card.Title title="Flight Summary" titleStyle={styles.summaryTitle} />
        <Card.Content>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Route:</Text>
            <Text style={styles.summaryValue}>
              {trip.from || "Unknown"} → {trip.to || "Unknown"}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Date:</Text>
            <Text style={styles.summaryValue}>
              {firstLeg?.departureDateTime
                ? new Date(firstLeg.departureDateTime).toLocaleDateString()
                : "N/A"}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Price:</Text>
            <Text style={styles.summaryValue}>
              {selectedFlightOffer.currencyCode} {selectedFlightOffer.totalPrice}
            </Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button
          mode="text"
          icon="arrow-left"
          onPress={() => router.back()}
          style={styles.backButton}
          labelStyle={styles.backButtonLabel}
        >
          Back
        </Button>
        <Text style={styles.headerTitle}>Book Your Flight</Text>
      </View>

      {renderFlightSummary()}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {travelers.length > 0 ? (
          travelers.map((traveler: any, index: number) => (
            <Card key={`traveler-${index}`} style={styles.travelerCard}>
              <List.Accordion
                title={
                  traveler.firstName && traveler.lastName
                    ? `${traveler.firstName} ${traveler.lastName}`
                    : `Traveler ${index + 1}`
                }
                left={(props) => <List.Icon {...props} icon="account" />}
                expanded={expandedIndex === index}
                onPress={() => handleAccordionPress(index)}
                style={styles.accordion}
                titleStyle={styles.accordionTitle}
                accessibilityLabel={`Traveler ${index + 1} details`}
                accessibilityRole="button"
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
            </Card>
          ))
        ) : (
          <Text style={styles.noTravelersText}>No travelers added.</Text>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={handleBooking}
          loading={loading}
          disabled={loading || travelers.length === 0}
          style={styles.bookButton}
          labelStyle={styles.bookButtonLabel}
          accessibilityLabel="Book flight"
        >
          {loading ? "Booking..." : "Book Flight"}
        </Button>
      </View>

      <Portal>
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
          style={styles.snackbar}
        >
          {snackbarMessage}
        </Snackbar>

        <Modal
          visible={showConfirmModal}
          onDismiss={() => setShowConfirmModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Card style={styles.modalCard}>
            <Card.Title title="Confirm Booking" titleStyle={styles.modalTitle} />
            <Card.Content>
              <Text style={styles.modalText}>
                Are you sure you want to book this flight for {travelers.length}{" "}
                traveler{travelers.length > 1 ? "s" : ""}?
              </Text>
            </Card.Content>
            <Card.Actions>
              <Button onPress={() => setShowConfirmModal(false)} textColor="#666666">
                Cancel
              </Button>
              <Button mode="contained" onPress={confirmBooking} style={styles.confirmButton}>
                Confirm
              </Button>
            </Card.Actions>
          </Card>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF", // White background
  },
  header: {
    padding: 16,
    paddingTop: Platform.OS === "ios" ? 40 : 16,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0", // Light gray border
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: "#000000", // Black text
    flex: 1,
    textAlign: "center",
  },
  backButton: {
    marginRight: 8,
  },
  backButtonLabel: {
    fontSize: 16,
    color: "#007AFF", // Classic blue for buttons
  },
  summaryCard: {
    margin: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0", // Light gray border
    backgroundColor: "#FFFFFF", // White background
    borderRadius: 4, // Minimal rounding
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000000",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666666", // Gray for labels
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000000",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80, // Space for footer button
  },
  travelerCard: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
  },
  accordion: {
    backgroundColor: "#FFFFFF",
    padding: 8,
  },
  accordionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000000",
  },
  noTravelersText: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    marginTop: 20,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  bookButton: {
    borderRadius: 4,
    backgroundColor: "#007AFF", // Classic blue
  },
  bookButtonLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  snackbar: {
    backgroundColor: "#F5F5F5", // Light gray
    margin: 16,
    borderRadius: 4,
  },
  modalContainer: {
    margin: 16,
  },
  modalCard: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000000",
  },
  modalText: {
    fontSize: 14,
    color: "#000000",
    marginBottom: 16,
  },
  confirmButton: {
    borderRadius: 4,
    backgroundColor: "#007AFF",
  },
});