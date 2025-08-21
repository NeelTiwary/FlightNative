import TravelerForm from "@/components/TravelerForm";
import { useAppContext } from "@/context/AppContextProvider";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Platform, ScrollView, StyleSheet, View } from "react-native";
import { Button, List } from "react-native-paper";
import axiosInstance from '../../config/axiosConfig';

export default function Booking() {
    const {travelers, setTravelers, selectedFlightOffer, setSelectedFlightOffer, apiUrl, setFlightBooking} = useAppContext();
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    const genderOptions = ["MALE", "FEMALE", "OTHER"];
    const documentTypeOptions = ["PASSPORT", "VISA", "GREEN_CARD"];
    const countryCallingCodes = ["+1", "+44", "+91", "+61", "+81"];
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const handleAccordionPress = (index: number) => {
        setExpandedIndex(index === expandedIndex ? null : index);
    }
    
    const handleChange = (field: string, index: number) => (value: string) => {
        const newTravelers = [...travelers];
        if(field.includes("document.")) {
            const docField = field.split('.')[1];
            if(docField === 'birthPlace') {
                newTravelers[index] = {
                    ...newTravelers[index],
                    document: {
                        ...newTravelers[index].document,
                        [docField]: value,
                        "issuanceLocation": value
                    }
                }
            } else if(docField === 'issuanceCountry') {
                newTravelers[index] = {
                    ...newTravelers[index],
                    document: {
                        ...newTravelers[index].document,
                        [docField]: value,
                        "validityCountry": value,
                        "nationality": value
                    }
                }
            } else {
                newTravelers[index] = {
                    ...newTravelers[index],
                    document: {
                        ...newTravelers[index].document,
                        [docField]: value
                    }
                }
            }
        } else if(field.includes('phoneNumber.')) {
            const phoneField = field.split('.')[1];
            newTravelers[index] = {
                ...newTravelers[index],
                phoneNumber: {
                    ...newTravelers[index].phoneNumber,
                    [phoneField]: value
                }
            }
        } else {
            newTravelers[index] = {
                ...newTravelers[index],
                [field]: value
            }
        }
        setTravelers(newTravelers);
    };

    const handleBooking = async () => {
        try {
            setLoading(true);
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
                            deviceType: 'MOBILE',
                            countryCalingCode: traveler.phoneNumber.countryCallingCode,
                            number: traveler.phoneNumber.number
                        }
                    ],
                    documents: [ {...traveler.document, holder: true} ]
                }))
            }

            const response = await axiosInstance.post("/booking/flight-order", bookingData)
          //  const response = await axios.post(`${apiUrl}/booking/flight-order`, bookingData)
            // console.log("Booking response:", response);
            // alert(`Booking successful! Order ID: ${response.data.orderId}`);
            setFlightBooking(response.data);
            if(Platform.OS === 'web') {
                localStorage.setItem('flightBooking', JSON.stringify(response.data));
            }
            setTravelers([]);
            router.push('/booking/confirmation');
        } catch (error) {
            console.error("Booking error:", error);
        } finally {
            setLoading(false);
        }
    }

    const confirmFlightOfferPricing = async () => {
        try {
            const body = {
                flightOffer: selectedFlightOffer.pricingAdditionalInfo,
            }
             const response = await axiosInstance.post(`/pricing/flights/confirm`, body);
          //  const response = await axios.post(`${apiUrl}/pricing/flights/confirm`, body);
            console.log("Flight offer pricing:", response.data);
            setSelectedFlightOffer(response.data);
        } catch (error) {
            console.error("Error fetching flight offer pricing:", error);
        }

    }

    useEffect(() => {
        // console.log("Selected flight offer:", selectedFlightOffer);
        if(selectedFlightOffer && selectedFlightOffer.pricingAdditionalInfo !== null) {
            // confirmFlightOfferPricing();
        }
    }, []);
    return (
        <View style={styles.container}>
            <ScrollView style={{ width: "100%", padding: 10, marginBottom: 20 }}>
                {/* <Button onPress={()=>console.log(selectedFlightOffer)}>flightOffer</Button> */}
            {
                travelers.length > 0 && travelers.map((traveler: any, index: number) => (
                    <View key={`traveler-${index}`}>
                        {/* <Button onPress={()=>console.log(selectedFlightOffer)}>flightOfer</Button> */}
                    <List.Accordion
                        title={`Traveler ${index + 1}`}
                        left={props => <List.Icon {...props} icon="account" />}
                        expanded={expandedIndex === index}
                        onPress={() => handleAccordionPress(index)}
                        // descriptionStyle={{ borderWidth: 1, borderColor: 'red', backgroundColor: theme.colors.transparent }}
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
                    <View style={{ padding: 10 }}>
                        <Button 
                            mode="contained" 
                            onPress={handleBooking}
                            loading={loading}
                            disabled={loading}
                        >
                            {loading ? "Booking..." : "Book Flight"}
                        </Button>
                    </View>
                    </View>
                        
                ))
            }
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff"
  },
  text: {
    color: "#fff"
  },
  input: {
    
  }
});