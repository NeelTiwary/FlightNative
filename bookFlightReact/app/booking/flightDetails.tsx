import FlightOfferDetails from "@/components/FlightOfferDetailsNew";
import { useAppContext } from "@/context/AppContextProvider";
import { router } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Button, Card, Text } from "react-native-paper";

export default function FlightDetails() {
    const { selectedFlightOffer } = useAppContext();

    // Debug log
    console.log("FlightDetails - selectedFlightOffer:", selectedFlightOffer);

    return (
        <ScrollView
            style={{ padding: 10 }}
            contentContainerStyle={{ paddingBottom: 30 }}
        >
            <FlightOfferDetails flightData={selectedFlightOffer} />

            {/* Terms & Conditions */}
            <Card style={styles.termsCard}>
                <Card.Content>
                    <Text style={styles.termsTitle}>Terms & Conditions</Text>
                    <Text style={styles.termsText}>
                        • Tickets are non-refundable and non-transferable.{"\n"}
                        • Flight schedules may change due to airline operations or weather conditions.{"\n"}
                        • Please carry a valid government-issued photo ID at all times.{"\n"}
                        • Check-in counters close 45 minutes before domestic departures and 75 minutes before international departures.{"\n"}
                        • Additional baggage charges may apply as per airline policy.{"\n"}
                        • Airlines reserve the right to deny boarding if identification or travel documents are invalid.{"\n"}
                        • Seats, meals, and special requests are subject to availability and airline discretion.{"\n"}
                        • Prices shown include base fare and applicable taxes but may exclude extra services.{"\n"}
                        • We are not responsible for missed connections due to delays, cancellations, or reschedules.{"\n"}
                        • By continuing, you confirm that you have read and agree to these terms and conditions.
                    </Text>
                </Card.Content>
            </Card>

            <Button
                mode="contained"
                onPress={() => router.push("/booking")}
                style={styles.continueButton}
            >
                Continue
            </Button>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    termsCard: {
        marginTop: 20,
        marginHorizontal: 15,
        borderRadius: 12,
        backgroundColor: "#F9FAFB",
        elevation: 2,
    },
    termsTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 6,
        color: "#111827",
    },
    termsText: {
        fontSize: 13,
        lineHeight: 20,
        color: "#374151",
    },
    continueButton: {
        marginTop: 20,
        marginHorizontal: 15,
        borderRadius: 8,
    },
});
