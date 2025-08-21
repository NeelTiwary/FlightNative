import TravelerDetails from "@/components/TravelerDetails";
import TripDetails from "@/components/TripDetails";
import { useAppContext } from "@/context/AppContextProvider";
import { Dimensions, FlatList, Platform, ScrollView, StyleSheet, View } from "react-native";
import { Card, Divider, Text } from "react-native-paper";

function confirmation() {
    // const { flightBooking } = useContext(AppContext);
    let bookingData = null;
    if(Platform.OS === 'web') {
      const flightBookingStr = localStorage.getItem('flightBooking');
      
      bookingData = flightBookingStr ? JSON.parse(flightBookingStr) : null;
    } else {
        const { flightBooking } = useAppContext();
        bookingData = flightBooking;
    }

     const { orderId, travelers, flightOffer } = bookingData || {};
      // const formatDateTime = (dateTime: any) => {
      //   const date = new Date(dateTime);
      //   return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      // };

      const formatTime = (dt: string) =>
        new Date(dt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

      const formatDate = (dt: string) =>
        new Date(dt).toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short' });

    
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Card style={{ borderRadius: 10 }}>
        <Card.Content>
          <Text variant="titleLarge">Flight Confirmed</Text>
          <Text variant="bodyMedium">Order ID: {orderId}</Text>
          <Text variant="bodyMedium">
            Total Price: {flightOffer.totalPrice} {flightOffer.currencyCode}
          </Text>
          <Text variant="bodyMedium" style={{ marginTop: 8, color: "#388e3c" }}>
            An email with the booking details has been sent to your email id.
          </Text>
        </Card.Content>
      </Card>

      <Divider style={{ marginVertical: 16 }} />

       <Text variant="titleLarge">Itinerary</Text>
      {flightOffer.trips.map((trip: any, idx: number) => (
        <>
          <TripDetails 
            trip={trip}
            tripIndex={`trip-${idx}`}
          />
        </>
      ))}

      <Text variant="titleLarge">Passenger Details</Text>
      <FlatList 
        data={travelers}
        keyExtractor={(_, index) => `trav ${index + 1}`}
        horizontal
        // numColumns={1}
        renderItem={({ item,  index }) => (
          <View
            style={{
              width: travelers.length === 1 ? Dimensions.get('window').width : 250,
              marginRight: travelers.length === 1 ? 0 : 12,
            }}
          >
            <TravelerDetails 
              traveler={item}
              key={index}
              style={{
                // width:
                //   travelers.length === 1
                //     ? '100%'
                //     : 250,
                // marginRight: travelers.length === 1 ? 0 : 12,
              }}
            />
          </View>
        )}
      />
      {/* {travelers.map((traveler: any, idx: number) => (
        <TravelerDetails 
          traveler={traveler}
          key={idx}
        />
      ))} */}

      <Divider style={{ marginVertical: 16 }} />

    </ScrollView>
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
    color: 'gray',
  },
})
export default confirmation;