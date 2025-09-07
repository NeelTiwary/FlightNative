import FlightOfferDetails from "@/components/FlightOfferDetailsNew";
import { useAppContext } from "@/context/AppContextProvider";
import { router } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Text, Divider } from "react-native-paper";

export default function FlightDetails() {
    const { selectedFlightOffer } = useAppContext();
    const [showAll, setShowAll] = useState(false);

    const terms = [
        "Tickets are non-refundable and non-transferable.",
        "Flight schedules may change due to airline operations or weather conditions.",
        "Please carry a valid government-issued photo ID at all times.",
        "Check-in counters close 45 minutes before domestic departures and 75 minutes before international departures.",
        "Additional baggage charges may apply as per airline policy.",
        "Airlines reserve the right to deny boarding if identification or travel documents are invalid.",
        "Seats, meals, and special requests are subject to availability and airline discretion.",
        "Prices shown include base fare and applicable taxes but may exclude extra services.",
        "We are not responsible for missed connections due to delays, cancellations, or reschedules.",
        "By continuing, you confirm that you have read and agree to these terms and conditions.",
    ];

    const visibleTerms = showAll ? terms : terms.slice(0, 3);

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

                    {visibleTerms.map((term, index) => (
                        <View key={index}>
                            <View style={styles.termRow}>
                                <Text style={styles.termIndex}>{index + 1}.</Text>
                                <Text style={styles.termsText}>{term}</Text>
                            </View>
                            {index < visibleTerms.length - 1 && (
                                <Divider style={styles.divider} />
                            )}
                        </View>
                    ))}

                    {terms.length > 3 && (
                        <Button
                            mode="text"
                            onPress={() => setShowAll(!showAll)}
                            textColor="#2563EB"
                            style={styles.seeMoreButton}
                            labelStyle={{ fontSize: 11, fontWeight: "600" }}
                        >
                            {showAll ? "See Less" : "See More"}
                        </Button>
                    )}
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
        marginTop: 10,
        marginHorizontal: 10,
        borderRadius: 8,
        backgroundColor: "#FFFFFF",
        elevation: 1,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        paddingVertical: 4,
        paddingHorizontal: 6,
    },
    termsTitle: {
        fontSize: 13,
        fontWeight: "700",
        marginBottom: 4,
        color: "#111827",
    },
    termRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        paddingVertical: 2,
    },
    termIndex: {
        fontSize: 11,
        fontWeight: "700",
        color: "#2563EB",
        width: 16,
    },
    termsText: {
        fontSize: 11,
        lineHeight: 16,
        color: "#374151",
        flex: 1,
    },
    divider: {
        backgroundColor: "#E5E7EB",
        height: 1,
        marginVertical: 1,
    },
    seeMoreButton: {
        marginTop: 2,
        alignSelf: "flex-start",
        paddingHorizontal: 0,
        minHeight: 20,
    },
    continueButton: {
        marginTop: 12,
        marginHorizontal: 10,
        borderRadius: 6,
    },
});
