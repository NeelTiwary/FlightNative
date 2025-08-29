import FlightOfferDetails from "@/components/FlightOfferDetailsNew";
import { useAppContext } from "@/context/AppContextProvider";
import { router } from "expo-router";
import React from "react";
import { ScrollView } from "react-native-gesture-handler";
import { Button } from "react-native-paper";

export default function FlightDetails() {
    const { selectedFlightOffer } = useAppContext();

    // Debug log to see what data we're getting
    console.log("FlightDetails - selectedFlightOffer:", selectedFlightOffer);

    return (
        <ScrollView
            style={{ padding: 10 }}
            contentContainerStyle={{ paddingBottom: 30 }} 
        >
            <FlightOfferDetails flightData={selectedFlightOffer} />
            <Button
                mode="contained"
                onPress={() => router.push("/booking")}
                style={{ marginTop: 20 }}
            >
                Continue
            </Button>
        </ScrollView>

    )
}