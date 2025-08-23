import TravelerForm from "@/components/TravelerForm";
import { useAppContext } from "@/context/AppContextProvider";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Platform, ScrollView, StyleSheet, View, TouchableOpacity } from "react-native";
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

  const genderOptions = ["MALE", "FEMALE"];
  const documentTypeOptions = ["PASSPORT", "VISA", "GREEN_CARD"];
  const countryCallingCodes = ["+1", "+44", "+91", "+61", "+81"];

  const handleAccordionPress = (index: number) => {
    setExpandedIndex(index === expandedIndex ? null : index);
  };

  const handleAddTraveler = () => {
    const newTraveler = {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "",
      email: "",
      phoneNumber: {
        countryCallingCode: "",
        number: ""
      },
      document: {
        documentType: "",
        number: "",
        expiryDate: "",
        issuanceCountry: "",
        birthPlace: "",
        issuanceLocation: "",
        validityCountry: "",
        nationality: ""
      }
    };
    setTravelers([...travelers, newTraveler]);
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
        <Card.Title 
          title="Flight Summary" 
          titleStyle={styles.summaryTitle}
          left={(props) => <MaterialCommunityIcons name="airplane" size={24} color="#007AFF" />}
        />
        <Card.Content>
          <View style={styles.summaryRow}>
            <MaterialCommunityIcons name="route" size={16} color="#666" />
            <Text style={styles.summaryLabel}>Route:</Text>
            <Text style={styles.summaryValue}>
              {trip.from || "Unknown"} → {trip.to || "Unknown"}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <MaterialCommunityIcons name="calendar" size={16} color="#666" />
            <Text style={styles.summaryLabel}>Date:</Text>
            <Text style={styles.summaryValue}>
              {firstLeg?.departureDateTime
                ? new Date(firstLeg.departureDateTime).toLocaleDateString()
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
                left={(props) => <List.Icon {...props} icon="account" color="#007AFF" />}
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
          <View style={styles.noTravelersContainer}>
            <MaterialCommunityIcons name="account-multiple" size={48} color="#E0E0E0" />
            <Text style={styles.noTravelersText}>No travelers added yet</Text>
          </View>
        )}

        {/* Add Traveler Button */}
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddTraveler}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add Traveler</Text>
        </TouchableOpacity>
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
          icon="airplane-takeoff"
        >
          {loading ? "Processing..." : `Book Flight (${travelers.length})`}
        </Button>
      </View>

      <Portal>
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
          style={styles.snackbar}
          action={{
            label: 'Dismiss',
            onPress: () => setSnackbarVisible(false),
          }}
        >
          {snackbarMessage}
        </Snackbar>

        <Modal
          visible={showConfirmModal}
          onDismiss={() => setShowConfirmModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Card style={styles.modalCard}>
            <Card.Title 
              title="Confirm Booking" 
              titleStyle={styles.modalTitle}
              left={(props) => <MaterialCommunityIcons name="shield-check" size={24} color="#007AFF" />}
            />
            <Card.Content>
              <Text style={styles.modalText}>
                Are you sure you want to book this flight for {travelers.length}{" "}
                traveler{travelers.length > 1 ? "s" : ""}?
              </Text>
              <Text style={styles.modalSubtext}>
                Total: {selectedFlightOffer?.currencyCode} {selectedFlightOffer?.totalPrice}
              </Text>
            </Card.Content>
            <Card.Actions style={styles.modalActions}>
              <Button 
                onPress={() => setShowConfirmModal(false)} 
                mode="outlined"
                style={styles.cancelButton}
              >
                Cancel
              </Button>
              <Button 
                mode="contained" 
                onPress={confirmBooking} 
                style={styles.confirmButton}
                icon="check"
              >
                Confirm Booking
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
    backgroundColor: "#F8F9FA",
  },
  header: {
    padding: 16,
    paddingTop: Platform.OS === "ios" ? 48 : 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    flex: 1,
    textAlign: "center",
    marginRight: 40,
  },
  backButton: {
    marginRight: 8,
  },
  backButtonLabel: {
    fontSize: 16,
    color: "#007AFF",
  },
  summaryCard: {
    margin: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
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
    paddingBottom: 100,
  },
  travelerCard: {
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    overflow: "hidden",
  },
  accordion: {
    backgroundColor: "#FFFFFF",
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
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
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
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bookButton: {
    borderRadius: 12,
    backgroundColor: "#007AFF",
    paddingVertical: 6,
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
  modalContainer: {
    margin: 24,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  modalText: {
    fontSize: 16,
    color: "#1A1A1A",
    marginBottom: 8,
    lineHeight: 24,
  },
  modalSubtext: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
    marginBottom: 4,
  },
  modalActions: {
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  cancelButton: {
    borderColor: "#E0E0E0",
    borderWidth: 1,
    borderRadius: 8,
    marginRight: 8,
  },
  confirmButton: {
    borderRadius: 8,
    backgroundColor: "#007AFF",
  },
});