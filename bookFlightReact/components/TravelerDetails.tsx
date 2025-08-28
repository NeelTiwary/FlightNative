import { StyleSheet, View, useWindowDimensions } from "react-native";
import { Card, Divider, Icon, Text } from "react-native-paper";

function TravelerDetails({ traveler, style }: { traveler: any; style?: object }) {
  const { width } = useWindowDimensions();
  
  return (
    <View style={[styles.container, style, { width: width * 0.85 }]}>
      <Card style={styles.card} mode="elevated">
        <Card.Content style={styles.cardContent}>
          {/* Header with name and icon */}
          <View style={styles.header}>
            <Icon source="account-circle" size={36} color="#1976d2" />
            <Text variant="titleLarge" style={styles.name}>
              {traveler.firstName} {traveler.lastName}
            </Text>
          </View>
          
          <Divider style={styles.divider} />
          
          {/* Traveler details */}
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <View style={styles.detailLabel}>
                <Icon source="calendar" size={20} color="#555" />
                <Text variant="bodyMedium" style={styles.labelText}>Date of Birth</Text>
              </View>
              <Text variant="bodyMedium" style={styles.detailValue}>{traveler.dateOfBirth}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <View style={styles.detailLabel}>
                <Icon 
                  source={traveler.gender === "MALE" ? "gender-male" : "gender-female"} 
                  size={20} 
                  color="#555" 
                />
                <Text variant="bodyMedium" style={styles.labelText}>Gender</Text>
              </View>
              <Text variant="bodyMedium" style={styles.detailValue}>{traveler.gender}</Text>
            </View>
            
            {traveler.phones?.[0]?.number && (
              <View style={styles.detailRow}>
                <View style={styles.detailLabel}>
                  <Icon source="phone" size={20} color="#555" />
                  <Text variant="bodyMedium" style={styles.labelText}>Phone</Text>
                </View>
                <Text variant="bodyMedium" style={styles.detailValue}>{traveler.phones[0].number}</Text>
              </View>
            )}
            
            {traveler.documents?.[0] && (
              <>
                <View style={styles.detailRow}>
                  <View style={styles.detailLabel}>
                    <Icon source="passport" size={20} color="#555" />
                    <Text variant="bodyMedium" style={styles.labelText}>Document</Text>
                  </View>
                  <Text variant="bodyMedium" style={styles.documentValue}>{traveler.documents[0].number}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <View style={styles.detailLabel}>
                    <Icon source="flag" size={20} color="#555" />
                    <Text variant="bodyMedium" style={styles.labelText}>Nationality</Text>
                  </View>
                  <Text variant="bodyMedium" style={styles.detailValue}>{traveler.documents[0].nationality}</Text>
                </View>
              </>
            )}
          </View>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 1,
    marginHorizontal: 8,
  },
  card: {
    borderRadius: 12,
    backgroundColor: "#fff",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    width: "100%",
    minHeight: 280,
  },
  cardContent: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  name: {
    fontWeight: "600",
    marginLeft: 12,
    color: "#2c3e50",
    flexShrink: 1,
  },
  divider: {
    marginBottom: 16,
    backgroundColor: "#e0e0e0",
    height: 1,
  },
  detailsContainer: {
    gap: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  detailLabel: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  labelText: {
    marginLeft: 10,
    color: "#7f8c8d",
    flexShrink: 1,
  },
  detailValue: {
    fontWeight: "500",
    color: "#2c3e50",
    textAlign: "right",
    flex: 1,
    flexWrap: "wrap",
  },
  documentValue: {
    fontWeight: "500",
    color: "#2c3e50",
    textAlign: "right",
    flex: 1,
    fontSize: 14,
  },
});

export default TravelerDetails;