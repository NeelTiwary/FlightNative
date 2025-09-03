import React, { useState, useEffect, useRef } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Platform,
  Clipboard,
  Alert,
  Animated,
  Easing,
  Dimensions,
  TouchableOpacity
} from "react-native";
import { Text, Button, Card, Divider } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAppContext } from "@/context/AppContextProvider";
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

export default function Confirmation() {
  const router = useRouter();
  const { flightBooking } = useAppContext();
  const [copied, setCopied] = useState(false);
  const [bookingData, setBookingData] = useState<any>(null);
  const [confettiActive, setConfettiActive] = useState(true);

  // Animation values - using a single master animation for better performance
  const masterAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (flightBooking) {
      if (typeof flightBooking === "string") {
        if (Platform.OS === "web") {
          const storedData = localStorage.getItem("flightBooking");
          if (storedData) {
            try {
              setBookingData(JSON.parse(storedData));
            } catch (e) {
              console.error("Error parsing booking data:", e);
              setBookingData({ orderId: decodeOrderId(flightBooking) });
            }
          } else {
            setBookingData({ orderId: decodeOrderId(flightBooking) });
          }
        } else {
          setBookingData({ orderId: decodeOrderId(flightBooking) });
        }
      } else {
        // Decode orderId if it exists in the flightBooking object
        const decodedBooking = { ...flightBooking };
        if (decodedBooking.orderId) {
          decodedBooking.orderId = decodeOrderId(decodedBooking.orderId);
        }
        setBookingData(decodedBooking);
      }
    }
  }, [flightBooking]);

  // Function to decode URL-encoded orderId
  const decodeOrderId = (orderId: string) => {
    try {
      return decodeURIComponent(orderId);
    } catch (e) {
      console.error("Error decoding order ID:", e);
      return orderId;
    }
  };

  useEffect(() => {
    if (bookingData) {
      // Run a single master animation that drives all other animations
      Animated.parallel([
        Animated.timing(masterAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.bezier(0.23, 1, 0.32, 1), // Smoother easing
          useNativeDriver: true,
        }),
        Animated.timing(progressAnim, {
          toValue: 100,
          duration: 1500,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: false,
        }),
      ]).start();

      // Stop confetti after 3 seconds to improve performance
      setTimeout(() => {
        setConfettiActive(false);
      }, 3000);
    }
  }, [bookingData]);

  const copyToClipboard = () => {
    if (!bookingData?.orderId) return;

    Clipboard.setString(bookingData.orderId);
    setCopied(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    setTimeout(() => setCopied(false), 2000);

    if (Platform.OS === "web") {
      navigator.clipboard.writeText(bookingData.orderId);
      Alert.alert("Copied!", "Booking ID copied to clipboard");
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const Confetti = () => {
    const confettiAnim = useRef(new Animated.Value(0)).current;
    
    useEffect(() => {
      if (confettiActive) {
        Animated.timing(confettiAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }).start();
      }
    }, [confettiActive]);

    // Create fewer confetti pieces for better performance
    const confettiPieces = [];
    const pieceCount = Platform.OS === 'web' ? 80 : 40; // Fewer on mobile

    for (let i = 0; i < pieceCount; i++) {
      const left = Math.random() * width;
      const startDelay = Math.random() * 500;
      
      const translateY = confettiAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, height + 100],
      });
      
      const rotate = confettiAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', `${Math.random() * 360 * 3}deg`],
      });
      
      const translateX = confettiAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, (Math.random() - 0.5) * 200],
      });
      
      const opacity = confettiAnim.interpolate({
        inputRange: [0, 0.8, 1],
        outputRange: [0, 1, 0],
      });
      
      const colors = ['#FFC107', '#4CAF50', '#2196F3', '#E91E63', '#9C27B0', '#00BCD4', '#FF5722'];
      const color = colors[Math.floor(Math.random() * colors.length)];

      const iconNames = ['star', 'circle', 'heart'];
      const iconName = iconNames[Math.floor(Math.random() * iconNames.length)];

      confettiPieces.push(
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            left,
            top: -50,
            transform: [{ translateY }, { translateX }, { rotate }],
            opacity,
          }}
        >
          <MaterialCommunityIcons name={iconName} size={14} color={color} />
        </Animated.View>
      );
    }

    if (!confettiActive) return null;
    
    return (
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        {confettiPieces}
      </View>
    );
  };

  // Interpolate all values from the master animation
  const headerOpacity = masterAnim.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0, 0.5, 1],
  });
  
  const headerTranslateY = masterAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [30, 0],
  });
  
  const headerScale = masterAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.8, 1.05, 1],
  });
  
  const cardOpacity = masterAnim.interpolate({
    inputRange: [0, 0.5, 0.7, 1],
    outputRange: [0, 0, 0.8, 1],
  });
  
  const cardTranslateY = masterAnim.interpolate({
    inputRange: [0, 0.5, 0.7, 1],
    outputRange: [20, 20, 10, 0],
  });
  
  const buttonOpacity = masterAnim.interpolate({
    inputRange: [0, 0.7, 0.9, 1],
    outputRange: [0, 0, 0.8, 1],
  });
  
  const buttonTranslateY = masterAnim.interpolate({
    inputRange: [0, 0.7, 0.9, 1],
    outputRange: [20, 20, 10, 0],
  });
  
  const pulseOpacity = masterAnim.interpolate({
    inputRange: [0, 0.3, 0.6, 1],
    outputRange: [0, 0.5, 0.2, 0],
  });
  
  const pulseScale = masterAnim.interpolate({
    inputRange: [0, 0.3, 0.6, 1],
    outputRange: [1, 1.5, 1.8, 2],
  });

  if (!bookingData) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Animated.View style={[styles.progressBar, {
            width: progressAnim.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }),
          }]} />
          <Text style={styles.loadingText}>Preparing your booking details...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* <Confetti /> */}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Header */}
        <Animated.View style={[
          styles.successHeader,
          {
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslateY }, { scale: headerScale }]
          }
        ]}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="check-circle" size={80} color="#4CAF50" />
            <Animated.View style={[styles.circlePulse, {
              opacity: pulseOpacity,
              transform: [{ scale: pulseScale }]
            }]} />
          </View>
          <Text style={styles.successTitle}>Booking Confirmed!</Text>
          <Text style={styles.successSubtitle}>Your flight has been successfully booked</Text>

          <View style={styles.orderIdContainer}>
            <View style={styles.orderIdBackground}>
              <Text style={styles.orderIdLabel}>ORDER ID</Text>
              <Text style={styles.orderId} numberOfLines={1} ellipsizeMode="middle">
                {bookingData.orderId || "N/A"}
              </Text>
            </View>
            <TouchableOpacity
              onPress={copyToClipboard}
              style={[styles.copyButton, copied && styles.copiedButton]}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name={copied ? "check" : "content-copy"}
                size={18}
                color="#FFF"
              />
              <Text style={styles.copyButtonText}>
                {copied ? "Copied!" : "Copy"}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Flight Details */}
        {bookingData.flightOffer && (
            <Card style={styles.card} elevation={0}>
              <Card.Title
                title="Flight Details"
                titleStyle={styles.cardTitle}
                left={(props) => <MaterialCommunityIcons {...props} name="airplane" size={24} color="#4A6CFA" />}
              />
              <Card.Content>
                {bookingData.flightOffer.trips?.map((trip: any, index: number) => (
                  <View key={index} style={styles.segmentContainer}>
                    {/* Route Header */}
                    <View style={styles.routeHeader}>
                      <View style={styles.routeCircle}>
                        <Text style={styles.routeCircleText}>{trip.from}</Text>
                      </View>
                      <View style={styles.durationLine}>
                        <View style={styles.durationDot} />
                        <View style={styles.durationLineInner} />
                        <View style={styles.durationDot} />
                      </View>
                      <View style={styles.routeCircle}>
                        <Text style={styles.routeCircleText}>{trip.to}</Text>
                      </View>
                    </View>

                    {/* Legs */}
                    {trip.legs?.map((leg: any, legIndex: number) => (
                      <View key={legIndex} style={{ marginBottom: 20 }}>
                        <View style={styles.timeContainer}>
                          <View style={styles.timeBlock}>
                            <Text style={styles.time}>{formatTime(leg.departureDateTime)}</Text>
                            <Text style={styles.airport}>{leg.departureAirport}</Text>
                            <Text style={styles.date}>{formatDate(leg.departureDateTime)}</Text>
                          </View>

                          <View style={styles.durationBlock}>
                            <MaterialCommunityIcons name="airplane" size={20} color="#666" />
                            <Text style={styles.duration}>{leg.duration || "N/A"}</Text>
                          </View>

                          <View style={styles.timeBlock}>
                            <Text style={styles.time}>{formatTime(leg.arrivalDateTime)}</Text>
                            <Text style={styles.airport}>{leg.arrivalAirport}</Text>
                            <Text style={styles.date}>{formatDate(leg.arrivalDateTime)}</Text>
                          </View>
                        </View>

                        <View style={styles.flightInfoContainer}>
                          <View style={styles.flightInfoBadge}>
                            <Text style={styles.flightInfoText}>
                              {leg.operatingCarrierCode} {leg.flightNumber}
                            </Text>
                          </View>
                          <View style={styles.flightInfoBadge}>
                            <Text style={styles.flightInfoText}>
                              {leg.aircraftCode}
                            </Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                ))}


                <Divider style={styles.divider} />

                <View style={styles.priceContainer}>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Total Price:</Text>
                    <Text style={styles.priceValue}>
                      {bookingData.flightOffer.currencyCode} {bookingData.flightOffer.totalPrice}
                    </Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
        )}

        {/* Traveler Details */}
        {bookingData.travelers && bookingData.travelers.length > 0 && (
            <Card style={styles.card} elevation={0}>
              <Card.Title
                title="Traveler Details"
                titleStyle={styles.cardTitle}
                left={(props) => <MaterialCommunityIcons {...props} name="account-group" size={24} color="#4A6CFA" />}
              />
              <Card.Content>
                {bookingData.travelers.map((traveler: any, index: number) => (
                  <View key={index} style={styles.travelerContainer}>
                    <View style={styles.travelerHeader}>
                      <MaterialCommunityIcons name="account" size={20} color="#4A6CFA" />
                      <Text style={styles.travelerName}>
                        {traveler.firstName} {traveler.lastName}
                      </Text>
                    </View>
                    <View style={styles.travelerDetails}>
                      <View style={styles.detailRow}>
                        <MaterialCommunityIcons name="email" size={16} color="#666" />
                        <Text style={styles.detailText}>{traveler.email}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <MaterialCommunityIcons name="cake" size={16} color="#666" />
                        <Text style={styles.detailText}>{traveler.dateOfBirth}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <MaterialCommunityIcons name="gender-male-female" size={16} color="#666" />
                        <Text style={styles.detailText}>{traveler.gender}</Text>
                      </View>
                      {traveler.phones && traveler.phones.length > 0 && (
                        <View style={styles.detailRow}>
                          <MaterialCommunityIcons name="phone" size={16} color="#666" />
                          <Text style={styles.detailText}>
                            {traveler.phones[0].countryCallingCode} {traveler.phones[0].number}
                          </Text>
                        </View>
                      )}
                      {traveler.documents && traveler.documents.length > 0 && (
                        <>
                          <View style={styles.detailRow}>
                            <MaterialCommunityIcons name="card-account-details" size={16} color="#666" />
                            <Text style={styles.detailText}>
                              {traveler.documents[0].documentType} - {traveler.documents[0].number}
                            </Text>
                          </View>
                          <View style={styles.detailRow}>
                            <MaterialCommunityIcons name="calendar" size={16} color="#666" />
                            <Text style={styles.detailText}>Expiry: {traveler.documents[0].expiryDate}</Text>
                          </View>
                          <View style={styles.detailRow}>
                            <MaterialCommunityIcons name="earth" size={16} color="#666" />
                            <Text style={styles.detailText}>Nationality: {traveler.documents[0].nationality}</Text>
                          </View>
                        </>
                      )}
                    </View>
                  </View>
                ))}
              </Card.Content>
            </Card>
        )}

          <Button
            mode="contained"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push("/");
            }}
            style={styles.homeButton}
            contentStyle={styles.homeButtonContent}
            icon="home"
            theme={{ roundness: 2 }}
          >
            Back to Home
          </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#4A6CFA',
    borderRadius: 2,
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  successHeader: {
    alignItems: "center",
    padding: 24,
    marginBottom: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circlePulse: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
  },
  successTitle: {
    fontSize: 28,
    fontWeight: "800",
    marginVertical: 8,
    color: "#1E293B",
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    color: "#64748B",
    marginBottom: 20,
    textAlign: 'center',
  },
  orderIdContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    width: '100%',
  },
  orderIdBackground: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    padding: 12,
    borderRadius: 8,
    marginRight: 12,
  },
  orderIdLabel: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 4,
    fontWeight: '600',
  },
  orderId: {
    fontSize: 16,
    color: "#1E293B",
    fontWeight: '600',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A6CFA',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 80,
  },
  copiedButton: {
    backgroundColor: '#4CAF50',
  },
  copyButtonText: {
    color: '#FFF',
    fontWeight: '600',
    marginLeft: 6,
  },
  cardContainer: {
    marginBottom: 24,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
  },
  segmentContainer: {
    marginBottom: 24,
    padding: 8,
  },
  routeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  routeCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4A6CFA',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  routeCircleText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  durationLine: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  durationLineInner: {
    flex: 1,
    height: 2,
    backgroundColor: '#E2E8F0',
  },
  durationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4A6CFA',
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  timeBlock: {
    alignItems: "center",
    flex: 1,
  },
  time: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
  },
  airport: {
    fontSize: 20,
    fontWeight: "800",
    color: "#4A6CFA",
    marginVertical: 4,
  },
  date: {
    fontSize: 12,
    color: "#64748B",
  },
  durationBlock: {
    alignItems: "center",
    flex: 1,
  },
  duration: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 5,
  },
  flightInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
  },
  flightInfoBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginHorizontal: 4,
  },
  flightInfoText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: '500',
  },
  divider: {
    marginVertical: 16,
    backgroundColor: '#E2E8F0',
    height: 1,
  },
  priceContainer: {
    marginTop: 10,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: 'center',
    marginVertical: 5,
  },
  priceLabel: {
    fontSize: 16,
    color: "#64748B",
  },
  priceValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#4A6CFA",
  },
  travelerContainer: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
  },
  travelerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  travelerName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    marginLeft: 8,
  },
  travelerDetails: {
    marginLeft: 28,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  detailText: {
    fontSize: 14,
    color: "#64748B",
    marginLeft: 8,
    flex: 1,
    flexWrap: 'wrap',
  },
  buttonContainer: {
    marginTop: 10,
    flexDirection: 'column',
  },
  homeButton: {
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#4A6CFA",
    marginBottom: 12,
  },
  homeButtonContent: {
    paddingVertical: 8,
  },
  secondaryButton: {
    paddingVertical: 8,
    borderRadius: 8,
    borderColor: '#4A6CFA',
  },
  secondaryButtonContent: {
    paddingVertical: 8,
  },
});