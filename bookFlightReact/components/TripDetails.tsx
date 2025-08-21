import { theme } from "@/themes/theme";
import { FlatList, StyleSheet, View } from "react-native";
import { Card, Divider, List, Text } from "react-native-paper";

function TripDetails({ trip, tripIndex }: {trip: any, tripIndex: string}) {
     const formatTime = (dt: string) =>
        new Date(dt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      const formatDate = (dt: string) =>
        new Date(dt).toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short' });
  return (
    <View>
        <Card key={tripIndex} style={{ marginBottom: 16 }}>
            <Card.Content style={{backgroundColor: theme.colors.surfaceVariant}}>
            <View
                style={{
                    display: "flex", 
                    flexDirection: "column", 
                    justifyContent: "space-between",
                    alignContent: "center",
                    marginBottom: 0,
                }}
            >
                <View style={{
                    display: "flex", 
                    flexDirection: "row", 
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 0,
                }}>
                <View style={{alignItems: "center"}}>
                    <Text style={styles.code}>{trip.from}</Text>
                    <Text style={styles.date}>{formatDate(trip.legs[0].departureDateTime)}</Text>
                    <Text style={styles.time}>{formatTime(trip.legs[0].departureDateTime)}</Text>
                </View>

                <View style={{marginTop: 20, alignItems: "center"}}>
                    <List.Icon 
                    icon="airplane" 
                    color={theme.colors.backdrop} 
                    />
                </View>
                
                <View style={{alignItems: "center"}}>
                    <Text style={styles.code}>{trip.to}</Text>
                    <Text style={styles.date}>{formatDate(trip.legs[trip.legs.length - 1].arrivalDateTime)}</Text>
                    <Text style={styles.time}>{formatTime(trip.legs[trip.legs.length - 1].arrivalDateTime)}</Text>
                </View>
                </View>
                <View style={{alignContent: "center", alignItems: "center"}}>
                <Text variant="bodyMedium" style={{ color: "#888" }}>
                    Total Duration: {trip.totalFlightDuration}
                </Text>
                {
                    trip.stops > 0 && (
                        <>
                            <Text variant="bodyMedium" style={{ color: "#888" }}>
                                Stops: {trip.stops} {trip.stops > 1 ? "stops" : "stop"}
                            </Text>
                            <Text variant="bodyMedium" style={{ color: "#888" }}>
                                Layover: {trip.totalLayoverDuration}
                            </Text>
                        </>
                    )
                }
                </View>
            </View>
            <Divider style={{ marginVertical:10 }} />

            <FlatList
                data={trip.legs}
                keyExtractor={(item, index) => `${tripIndex}-${index}`}
                horizontal
                // pagingEnabled
                renderItem={({ item, index, separators }) => (
                <>
                <View style={{ 
                    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                    // marginRight: 10, 
                    paddingLeft: 10,
                    width: 300,
                    borderRadius: 10,
                    marginRight: 5,
                    backgroundColor: theme.colors.background,
                }}>     
                    <View style={{alignItems: "center", marginRight: 0}}>
                        <Text style={styles.legCode}>{item.departureAirport}</Text>
                        <Text style={styles.legDate}>{formatDate(item.departureDateTime)}</Text>
                        <Text style={styles.legTime}>{formatTime(item.departureDateTime)}</Text>
                        <Text style={styles.legTerminal}>T{item.departureTerminal}</Text>
                    </View>

                    <View style={{marginTop: 0, marginRight: 0, alignItems: "center", alignContent: "center"}}>
                    <List.Item
                        title={`Flight ${item.carrierCode}${item.flightNumber}`}
                        description={`Aircraft: ${item.aircraftCode}`}
                        style={{marginBottom: 15}}
                        titleStyle={{ fontWeight: 'bold', fontSize: 14 }}
                        descriptionStyle={{ color: theme.colors.backdrop, fontSize: 12 }}
                        contentStyle={{ alignItems: 'center' }}
                        // left={() => <List.Icon icon="airplane" />}
                    />

                    </View>
                    
                    <View style={{alignItems: "center", marginRight: 10}}>
                        <Text style={styles.legCode}>{item.arrivalAirport}</Text>
                        <Text style={styles.legDate}>{formatDate(item.arrivalDateTime)}</Text>
                        <Text style={styles.legTime}>{formatTime(item.arrivalDateTime)}</Text>
                        <Text style={styles.legTerminal}>T{item.arrivalTerminal}</Text>
                    </View>
                </View>
                    {/* {
                    index < trip.legs.length - 1 && 
                    <View style={{
                        // borderWidth: 3,
                        // borderColor: 'red',
                        // marginRight: 10,
                        width: 1, 
                        height: '100%', 
                        backgroundColor: theme.colors.background, 
                        // marginHorizontal: 10
                        // marginRight: 10 
                        }} 
                    />
                    } */}
                </>
                )}
            />
            </Card.Content>
        </Card>
    </View>
  )
}

const styles = StyleSheet.create({
    code: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    time: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 4,
    },
    date: {
        fontSize: 12,
        color: 'gray',
    },
    legCode: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.backdrop,
    },
    legTerminal: {
        fontSize: 11,
        fontWeight: 'condensedBold',
    },
    legTime: {
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: 4,
    },
    legDate: {
        fontSize: 10,
        color: theme.colors.backdrop,
    },
})
export default TripDetails;