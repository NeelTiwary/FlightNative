import FlightOfferDetails from "@/components/FlightOfferDetailsNew";
import { useAppContext } from "@/context/AppContextProvider";
import { router } from "expo-router";
import { ScrollView } from "react-native-gesture-handler";
import { Button } from "react-native-paper";

export default function FlightDetails() {
    const {selectedFlightOffer} = useAppContext();
    return (
        <ScrollView style={{ padding: 10 }}>
            <FlightOfferDetails
                flightData={selectedFlightOffer}
            />
            <Button
                mode="contained"
                onPress={() => router.push("/booking")}
            >
                Continue
            </Button>
        </ScrollView>
    )
}