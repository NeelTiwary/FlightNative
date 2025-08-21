import { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Card, Divider, List, Text } from "react-native-paper";
import Animated, { Easing, useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";

export default function FlightOfferDetails({ flightData }: { flightData: any }) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleAccordionPress = (index: number) => {
    setExpandedIndex(index === expandedIndex ? null : index);
  };

  return (
    <View style={styles.container}>
      {/* Header Banner */}
      <View style={styles.headerBanner}>
        <Text variant="headlineSmall" style={styles.headerTitle}>
          Flight Details
        </Text>
        <Text variant="bodyMedium" style={styles.headerSubtitle}>
          Review your itinerary
        </Text>
      </View>

      {/* Pricing Summary Card */}
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Price Summary
          </Text>
          <View style={styles.priceRow}>
            <Text variant="bodyMedium" style={styles.priceLabel}>
              Total
            </Text>
            <Text variant="titleMedium" style={styles.priceValue}>
              {flightData.currencyCode} {flightData.totalPrice}
            </Text>
          </View>
          <View style={styles.priceRow}>
            <Text variant="bodyMedium" style={styles.priceLabel}>
              Base Fare
            </Text>
            <Text variant="bodyMedium" style={styles.priceValue}>
              {flightData.currencyCode} {flightData.basePrice}
            </Text>
          </View>
          <View style={styles.priceRow}>
            <Text variant="bodyMedium" style={styles.priceLabel}>
              Travelers
            </Text>
            <Text variant="bodyMedium" style={styles.priceValue}>
              {flightData.totalTravelers}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Trip Details */}
      <Text variant="titleMedium" style={styles.sectionTitle}>
        Itinerary
      </Text>
      {flightData?.trips?.map((trip: any, index: number) => {
        const isExpanded = expandedIndex === index;
        const animatedHeight = useSharedValue(isExpanded ? 1 : 0);

        const animatedStyle = useAnimatedStyle(() => ({
          opacity: withTiming(isExpanded ? 1 : 0, { duration: 200, easing: Easing.out(Easing.exp) }),
          transform: [{ scaleY: withTiming(isExpanded ? 1 : 0, { duration: 200, easing: Easing.out(Easing.exp) }) }],
        }));

        return (
          <Card key={trip.tripNo} style={styles.card}>
            <List.Accordion
              title={
                <View style={styles.accordionTitle}>
                  <Text variant="titleMedium" style={styles.tripTitle}>
                    {trip.from} → {trip.to}
                  </Text>
                  <View style={styles.tripSubtitle}>
                    {(trip.tripType === "RETURN" && index === 1) && (
                      <Text variant="bodySmall" style={styles.subtitleText}>
                        {trip.tripType}
                      </Text>
                    )}
                    <Text variant="bodySmall" style={styles.subtitleText}>
                      {trip.stops} Stop{trip.stops !== 1 ? "s" : ""}
                    </Text>
                    <Text variant="bodySmall" style={styles.subtitleText}>
                      {trip.totalFlightDuration}
                    </Text>
                    {trip.stops !== 0 && (
                      <Text variant="bodySmall" style={styles.subtitleText}>
                        Layover: {trip.totalLayoverDuration}
                      </Text>
                    )}
                  </View>
                </View>
              }
              left={props => <List.Icon {...props} icon="airplane" color="#005566" />}
              expanded={isExpanded}
              onPress={() => handleAccordionPress(index)}
              style={styles.accordion}
              titleStyle={styles.accordionTitleStyle}
            >
              <Animated.View style={[styles.cardContent, animatedStyle]}>
                <Divider style={styles.divider} />
                {trip.legs.map((leg: any, legIndex: number) => (
                  <View key={leg.legNo} style={styles.legContainer}>
                    <Text variant="titleSmall" style={styles.legTitle}>
                      {leg.departureAirport} ({leg.departureDateTime}) → {leg.arrivalAirport} ({leg.arrivalDateTime})
                    </Text>
                    <Text variant="bodySmall" style={styles.legDetail}>
                      Flight {leg.carrierCode} {leg.flightNumber} ({leg.aircraftCode})
                    </Text>
                    {leg.operatingCarrierName && (
                      <Text variant="bodySmall" style={styles.legDetail}>
                        Operated by {leg.operatingCarrierName}
                      </Text>
                    )}
                    <Text variant="bodySmall" style={styles.legDetail}>
                      Duration: {leg.duration}
                    </Text>
                    {leg.layoverAfter && (
                      <Text variant="bodySmall" style={styles.legDetail}>
                        Layover: {leg.layoverAfter}
                      </Text>
                    )}
                    {legIndex < trip.legs.length - 1 && <Divider style={styles.divider} />}
                  </View>
                ))}
              </Animated.View>
            </List.Accordion>
          </Card>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 16,
  },
  headerBanner: {
    padding: 16,
    paddingTop: 32,
    paddingBottom: 16,
    marginBottom: 16,
  },
  headerTitle: {
    fontWeight: "600",
    color: "#003087",
    fontFamily: "System",
  },
  headerSubtitle: {
    color: "#4A4A4A",
    fontWeight: "400",
    fontFamily: "System",
    marginTop: 4,
  },
  card: {
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8ECEF",
  },
  cardContent: {
    padding: 16,
  },
  sectionTitle: {
    fontWeight: "600",
    color: "#003087",
    marginBottom: 12,
    fontFamily: "System",
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  priceLabel: {
    color: "#4A4A4A",
    fontWeight: "400",
    fontSize: 14,
    fontFamily: "System",
  },
  priceValue: {
    color: "#003087",
    fontWeight: "600",
    fontSize: 14,
    fontFamily: "System",
  },
  accordion: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingVertical: 4,
  },
  accordionTitle: {
    paddingVertical: 4,
  },
  accordionTitleStyle: {
    fontWeight: "600",
    color: "#003087",
    fontFamily: "System",
  },
  tripTitle: {
    color: "#003087",
    fontWeight: "600",
    fontSize: 16,
    fontFamily: "System",
  },
  tripSubtitle: {
    marginTop: 4,
    paddingLeft: 4,
  },
  subtitleText: {
    color: "#4A4A4A",
    marginBottom: 4,
    fontSize: 12,
    fontFamily: "System",
  },
  divider: {
    marginVertical: 12,
    backgroundColor: "#E8ECEF",
    height: 1,
  },
  legContainer: {
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  legTitle: {
    fontWeight: "600",
    color: "#003087",
    marginBottom: 4,
    fontSize: 14,
    fontFamily: "System",
  },
  legDetail: {
    color: "#4A4A4A",
    marginBottom: 4,
    fontSize: 12,
    fontFamily: "System",
  },
});