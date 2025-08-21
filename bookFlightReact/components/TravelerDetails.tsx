import { StyleSheet, View } from "react-native";
import { Card, Divider, Icon, Text } from "react-native-paper";

function TravelerDetails({ traveler, key, style }: { traveler: any, key: number, style: object }) {
  return (
    <View style={styles.container}>
         {/* {travelers.map((traveler: any, idx: number) => ( */}
        <Card key={key} style={[styles.card, style]} mode="elevated">
            <Card.Title
                title={`${traveler.firstName} ${traveler.lastName}`}
                titleStyle={styles.name}
                left={(props) => (
                <Icon {...props} source={"account-circle"} size={36} color="#1976d2" />
                )}
            />
            <Divider />
            <Card.Content style={styles.infoSection}>
                <View style={styles.row}>
                <Icon source={"calendar"} size={20} color="#555" />
                <Text style={styles.text}>DOB: {traveler.dateOfBirth}</Text>
                </View>
                <View style={styles.row}>
                <Icon
                    source={traveler.gender === "MALE" ? "gender-male" : "gender-female"}
                    size={20}
                    color="#555"
                />
                <Text style={styles.text}>Gender: {traveler.gender}</Text>
                </View>
                {traveler.phones?.[0]?.number && (
                <View style={styles.row}>
                    <Icon source={"phone"} size={20} color="#555" />
                    <Text style={styles.text}>{traveler.phones[0].number}</Text>
                </View>
                )}
                {traveler.documents?.[0] && (
                <>
                    <View style={styles.row}>
                    <Icon source={"passport"} size={20} color="#555" />
                    <Text style={styles.text}>
                        {traveler.documents[0].number}
                    </Text>
                    </View>
                    <View style={styles.row}>
                    <Icon source={"flag"} size={20} color="#555" />
                    <Text style={styles.text}>
                        {traveler.documents[0].nationality}
                    </Text>
                    </View>
                </>
                )}
            </Card.Content>
        </Card>
        {/* ))} */}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    // width: '100%',
    // paddingRight: 100,
  },
  card: {
    marginBottom: 14,
    borderRadius: 12,
    backgroundColor: "#fff",
    elevation: 2,
    width:"100%"
  },
  name: {
    fontWeight: "bold",
    fontSize: 18,
  },
  infoSection: {
    marginTop: 8,
    gap: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  text: {
    fontSize: 14,
    color: "#333",
  },
});

export default TravelerDetails;