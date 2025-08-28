import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {
  Card,
  Text,
  TextInput,
  Button,
  IconButton,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as Clipboard from 'expo-clipboard';

interface Traveler {
  id?: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phones: { countryCallingCode: string; number: string }[];
  documents: {
    documentType: string;
    number: string;
    expiryDate: string;
    nationality: string;
  }[];
}

interface Leg {
  departureAirport: string;
  arrivalAirport: string;
  departureDateTime: string;
  arrivalDateTime: string;
  duration: string;
  operatingCarrierCode: string;
  flightNumber: string;
  aircraftCode: string;
  departureTerminal?: string;
  arrivalTerminal?: string;
}

interface Trip {
  from: string;
  to: string;
  stops: number;
  totalFlightDuration: string;
  legs: Leg[];
}

interface BookingData {
  orderId: string;
  travelers: Traveler[];
  flightOffer: {
    currencyCode: string;
    totalPrice: string;
    trips: Trip[];
  };
}

// Utility functions for mapping airport and carrier codes
const getCityName = (airportCode: string): string => {
  const airportMap: { [key: string]: string } = {
    JFK: 'New York, NY',
    LAX: 'Los Angeles, CA',
    ORD: 'Chicago, IL',
    ATL: 'Atlanta, GA',
    SFO: 'San Francisco, CA',
    MIA: 'Miami, FL',
    // Add more airport codes as needed
  };
  return airportMap[airportCode] || airportCode;
};

const getFlightName = (carrierCode: string, flightNumber: string): string => {
  const carrierMap: { [key: string]: string } = {
    AA: 'American Airlines',
    DL: 'Delta Air Lines',
    UA: 'United Airlines',
    WN: 'Southwest Airlines',
    B6: 'JetBlue Airways',
    // Add more carrier codes as needed
  };
  return `${carrierMap[carrierCode] || carrierCode} ${flightNumber}`;
};

const CheckYourFlight = () => {
  const [bookingId, setBookingId] = useState('');
  const [loading, setLoading] = useState(false);
  const [flightData, setFlightData] = useState<BookingData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const buttonScale = useSharedValue(1);
  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(buttonScale.value) }],
  }));

  const fetchFlightDetails = async () => {
    if (!bookingId.trim()) {
      Alert.alert('Error', 'Please enter a booking ID');
      setError('Please enter a valid booking ID.');
      return;
    }

    setLoading(true);
    setError(null);
    setFlightData(null);
    buttonScale.value = 0.95;

    try {
      const encodedId = encodeURIComponent(bookingId);
      console.log(`Fetching booking for ID: ${encodedId}`);
      const response = await fetch(`http://192.168.29.191:8080/booking/flight-order/${encodedId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      console.log(`Response status: ${response.status}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Booking not found. Please check your booking ID.');
        } else if (response.status === 500) {
          throw new Error('Server error. Please try again later.');
        } else {
          const text = await response.text();
          console.log('Raw response:', text);
          throw new Error(`Failed to fetch booking (Status: ${response.status})`);
        }
      }

      let data: BookingData;
      try {
        data = await response.json();
        console.log('Booking data:', data);
      } catch (jsonError) {
        throw new Error('Invalid response format from server.');
      }

      if (!data.orderId || !data.flightOffer?.trips) {
        throw new Error('Incomplete booking data received.');
      }

      // Validate leg data for flight names
      data.flightOffer.trips.forEach((trip) => {
        trip.legs.forEach((leg) => {
          console.log(`Flight name for ${leg.operatingCarrierCode} ${leg.flightNumber}:`,
            getFlightName(leg.operatingCarrierCode, leg.flightNumber));
        });
      });

      setFlightData(data);
      buttonScale.value = 1;
    } catch (err: any) {
      console.error('Fetch error:', err.message);
      const errorMessage = err.message || 'Could not fetch booking details. Please check your booking ID and try again.';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
      buttonScale.value = 1;
    } finally {
      setLoading(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (text) {
        setBookingId(text);
        Alert.alert('Success', 'Booking ID pasted from clipboard');
      } else {
        Alert.alert('Error', 'Clipboard is empty');
      }
    } catch (err) {
      Alert.alert('Error', 'Could not paste from clipboard');
    }
  };

  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  };

  const formatDuration = (duration: string) => {
    return duration.replace('h', 'h ').replace('m', 'm');
  };

  if (loading) {
    return (
      <LinearGradient colors={['#1e3a8a', '#3b82f6']} style={styles.centered}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Fetching your flight details...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Header Section */}
      <LinearGradient colors={['#1e3a8a', '#3b82f6']} style={styles.header}>
        <View style={styles.headerIconContainer}>
          <IconButton
            icon="airplane-takeoff"
            size={40}
            iconColor="#fff"
            style={styles.headerIcon}
          />
        </View>
        <Text variant="headlineMedium" style={styles.headerTitle}>
          Check Your Flight
        </Text>
        <Text variant="bodyLarge" style={styles.headerSubtitle}>
          Enter your booking reference to view flight details and itinerary
        </Text>
      </LinearGradient>

      {/* Input Section */}
      <View style={styles.inputSection}>
        <Card style={styles.inputCard} elevation={5}>
          <Card.Content style={styles.inputCardContent}>
            <View style={styles.inputHeader}>
              <Text variant="titleLarge" style={styles.inputTitle}>
                Retrieve Flight Details
              </Text>
              <IconButton
                icon="information-outline"
                size={24}
                iconColor="#6b7280"
              />
            </View>

            <Text variant="bodyMedium" style={styles.inputDescription}>
              Enter your booking reference number to access your flight details, passenger information, and itinerary.
            </Text>

            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <TextInput
                  label="Booking Reference"
                  value={bookingId}
                  onChangeText={setBookingId}
                  mode="outlined"
                  style={styles.input}
                  outlineStyle={styles.inputOutline}
                  placeholder="e.g., eJzTd9e38HUJjfIGAAsQAmk=3D"
                  theme={{ colors: { primary: '#1e3a8a', onSurface: '#2c3e50' } }}
                  right={
                    <TextInput.Icon
                      icon="clipboard-text-outline"
                      color={bookingId ? "#1e3a8a" : "#d1d5db"}
                      onPress={handlePaste}
                      style={styles.pasteIcon}
                    />
                  }
                />
                <Text variant="bodySmall" style={styles.inputHint}>
                  Found in your confirmation email or booking confirmation
                </Text>
              </View>

              <Animated.View style={animatedButtonStyle}>
                <Button
                  mode="contained"
                  onPress={fetchFlightDetails}
                  style={styles.searchButton}
                  icon="magnify"
                  contentStyle={styles.buttonContent}
                  disabled={!bookingId.trim()}
                  labelStyle={styles.buttonLabel}
                  theme={{ colors: { primary: '#1e3a8a' } }}
                >
                  Retrieve Flight Details
                </Button>
              </Animated.View>
            </View>

            {error && (
              <View style={styles.errorContainer}>
                <IconButton icon="alert-circle-outline" iconColor="#dc2626" size={24} />
                <Text style={styles.errorText}>{error}</Text>
                <IconButton
                  icon="refresh"
                  size={24}
                  iconColor="#dc2626"
                  onPress={fetchFlightDetails}
                />
              </View>
            )}
          </Card.Content>
        </Card>

        <View style={styles.helpSection}>
          <IconButton icon="help-circle" size={24} iconColor="#6b7280" />
          <Text variant="bodyMedium" style={styles.helpText}>
            Can't find your booking reference? Check your email or contact support.
          </Text>
        </View>
      </View>

      {flightData && (
        <View style={styles.resultsContainer}>
          {/* Order Summary */}
          <Animated.View style={[styles.sectionCard, animatedButtonStyle]}>
            <Card style={styles.sectionCard} elevation={5}>
              <Card.Content>
                <View style={styles.sectionHeader}>
                  <View style={styles.statusBadge}>
                    <IconButton icon="check-circle" size={20} iconColor="#16a34a" />
                    <Text variant="labelMedium" style={styles.statusText}>
                      CONFIRMED
                    </Text>
                  </View>
                  <View style={styles.orderIdContainer}>
                    <Text variant="bodyMedium" style={styles.orderLabel}>
                      ORDER ID:
                    </Text>
                    <Text variant="bodyLarge" style={styles.orderId} numberOfLines={1}>
                      {flightData.orderId}
                    </Text>
                    <IconButton
                      icon="content-copy"
                      size={20}
                      onPress={async () => {
                        await Clipboard.setStringAsync(flightData.orderId);
                        Alert.alert('Copied', 'Order ID copied to clipboard');
                      }}
                    />
                  </View>
                </View>

                <View style={styles.priceContainer}>
                  <Text variant="bodyLarge" style={styles.totalLabel}>Total Amount:</Text>
                  <Text variant="headlineMedium" style={styles.totalPrice}>
                    {flightData.flightOffer.currencyCode} {flightData.flightOffer.totalPrice}
                  </Text>
                </View>
              </Card.Content>
            </Card>
          </Animated.View>

          {/* Traveler Details */}
          <Animated.View style={[styles.sectionCard, animatedButtonStyle]}>
            <Card style={styles.sectionCard} elevation={5}>
              <Card.Content>
                <View style={styles.sectionTitleRow}>
                  <IconButton icon="account-group" size={24} iconColor="#1e3a8a" />
                  <Text variant="titleLarge" style={styles.sectionTitle}>
                    Passenger Details
                  </Text>
                </View>

                {flightData.travelers.map((traveler, index) => (
                  <View key={index} style={styles.travelerCard}>
                    <View style={styles.travelerHeader}>
                      <View style={styles.travelerIcon}>
                        <IconButton icon="account-circle" size={28} iconColor="#1e3a8a" />
                      </View>
                      <View>
                        <Text variant="titleMedium" style={styles.travelerName}>
                          {traveler.firstName} {traveler.lastName}
                        </Text>
                        <Text variant="bodyMedium" style={styles.travelerSubtitle}>
                          Traveler {index + 1}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.travelerDetails}>
                      <View style={styles.detailGrid}>
                        <View style={styles.detailItem}>
                          <Text variant="bodySmall" style={styles.detailLabel}>
                            Date of Birth
                          </Text>
                          <Text variant="bodyMedium">{traveler.dateOfBirth || 'N/A'}</Text>
                        </View>

                        <View style={styles.detailItem}>
                          <Text variant="bodySmall" style={styles.detailLabel}>
                            Gender
                          </Text>
                          <Text variant="bodyMedium">{traveler.gender || 'N/A'}</Text>
                        </View>

                        {traveler.phones && traveler.phones.length > 0 && (
                          <View style={styles.detailItem}>
                            <Text variant="bodySmall" style={styles.detailLabel}>
                              Phone
                            </Text>
                            <Text variant="bodyMedium">
                              {traveler.phones[0].countryCallingCode
                                ? `+${traveler.phones[0].countryCallingCode} ${traveler.phones[0].number}`
                                : 'N/A'}
                            </Text>
                          </View>
                        )}

                        {traveler.documents && traveler.documents.length > 0 && (
                          <>
                            <View style={styles.detailItem}>
                              <Text variant="bodySmall" style={styles.detailLabel}>
                                Document
                              </Text>
                              <Text variant="bodyMedium">
                                {traveler.documents[0].documentType && traveler.documents[0].number
                                  ? `${traveler.documents[0].documentType}: ${traveler.documents[0].number}`
                                  : 'N/A'}
                              </Text>
                            </View>
                            <View style={styles.detailItem}>
                              <Text variant="bodySmall" style={styles.detailLabel}>
                                Expiry
                              </Text>
                              <Text variant="bodyMedium">
                                {traveler.documents[0].expiryDate || 'N/A'}
                              </Text>
                            </View>
                            <View style={styles.detailItem}>
                              <Text variant="bodySmall" style={styles.detailLabel}>
                                Nationality
                              </Text>
                              <Text variant="bodyMedium">
                                {traveler.documents[0].nationality || 'N/A'}
                              </Text>
                            </View>
                          </>
                        )}
                      </View>
                    </View>
                  </View>
                ))}
              </Card.Content>
            </Card>
          </Animated.View>

          {/* Flight Itinerary */}
          <Animated.View style={[styles.sectionCard, animatedButtonStyle]}>
            <Card style={styles.sectionCard} elevation={5}>
              <Card.Content>
                <View style={styles.sectionTitleRow}>
                  <IconButton icon="airplane" size={24} iconColor="#1e3a8a" />
                  <Text variant="titleLarge" style={styles.sectionTitle}>
                    Flight Itinerary
                  </Text>
                </View>

                {flightData.flightOffer.trips.map((trip, index) => (
                  <View key={index} style={styles.tripContainer}>
                    <View style={styles.tripHeader}>
                      <Text variant="titleLarge" style={styles.tripTitle}>
                        {getCityName(trip.from) || trip.from} → {getCityName(trip.to) || trip.to}
                      </Text>
                      <View style={styles.tripDetails}>
                        <Text variant="bodyMedium" style={styles.tripDetail}>
                          {trip.stops} stop{trip.stops !== 1 ? 's' : ''}
                        </Text>
                        <Text variant="bodyMedium" style={styles.tripDetail}>
                          • {formatDuration(trip.totalFlightDuration || 'N/A')}
                        </Text>
                      </View>
                    </View>

                    {trip.legs.map((leg, legIndex) => {
                      const departure = formatDateTime(leg.departureDateTime);
                      const arrival = formatDateTime(leg.arrivalDateTime);

                      return (
                        <View key={legIndex} style={styles.legContainer}>
                          <View style={styles.flightRoute}>
                            <View style={styles.routeDot} />
                            <View style={styles.routeLine} />
                            <View style={styles.routeDot} />
                          </View>

                          <View style={styles.flightDetails}>
                            <View style={styles.airportSection}>
                              <Text variant="titleMedium" style={styles.airportCode}>
                                {getCityName(leg.departureAirport) || leg.departureAirport}
                              </Text>
                              <Text variant="titleLarge" style={styles.timeText}>
                                {departure.time}
                              </Text>
                              <Text variant="bodyMedium" style={styles.dateText}>
                                {departure.date}
                              </Text>
                              {leg.departureTerminal && (
                                <Text variant="bodySmall" style={styles.terminalText}>
                                  Terminal {leg.departureTerminal}
                                </Text>
                              )}
                            </View>

                            <View style={styles.flightInfo}>
                              <Text variant="bodyMedium" style={styles.duration}>
                                {formatDuration(leg.duration || 'N/A')}
                              </Text>
                              <View style={styles.flightLineContainer}>
                                <View style={styles.flightLine} />
                                <IconButton icon="airplane" size={20} color="#6b7280" />
                              </View>
                              <Text variant="bodyMedium" style={styles.flightNumber}>
                                {getFlightName(leg.operatingCarrierCode, leg.flightNumber) ||
                                 `${leg.operatingCarrierCode} ${leg.flightNumber}`}
                              </Text>
                              <Text variant="bodySmall">Aircraft: {leg.aircraftCode || 'N/A'}</Text>
                            </View>

                            <View style={styles.airportSection}>
                              <Text variant="titleMedium" style={styles.airportCode}>
                                {getCityName(leg.arrivalAirport) || leg.arrivalAirport}
                              </Text>
                              <Text variant="titleLarge" style={styles.timeText}>
                                {arrival.time}
                              </Text>
                              <Text variant="bodyMedium" style={styles.dateText}>
                                {arrival.date}
                              </Text>
                              {leg.arrivalTerminal && (
                                <Text variant="bodySmall" style={styles.terminalText}>
                                  Terminal {leg.arrivalTerminal}
                                </Text>
                              )}
                            </View>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                ))}
              </Card.Content>
            </Card>
          </Animated.View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Animated.View style={animatedButtonStyle}>
              <Button
                mode="outlined"
                icon="printer"
                style={styles.actionButton}
                theme={{ colors: { outline: '#1e3a8a', onSurface: '#1e3a8a' } }}
                onPress={() => Alert.alert('Info', 'Print functionality coming soon!')}
              >
                Print Itinerary
              </Button>
            </Animated.View>
            <Animated.View style={animatedButtonStyle}>
              <Button
                mode="contained"
                icon="download"
                style={styles.actionButton}
                theme={{ colors: { primary: '#1e3a8a' } }}
                onPress={() => Alert.alert('Info', 'Download functionality coming soon!')}
              >
                Download Ticket
              </Button>
            </Animated.View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#fff',
    borderRadius: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  loadingText: {
    marginTop: 12,
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  header: {
    marginBottom: 24,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  headerIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 50,
    padding: 12,
    marginBottom: 16,
  },
  headerIcon: {
    margin: 0,
  },
  headerTitle: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 28,
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  headerSubtitle: {
    color: '#e5e7eb',
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 16,
    fontWeight: '500',
  },
  inputSection: {
    marginBottom: 24,
  },
  inputCard: {
    borderRadius: 16,
    backgroundColor: '#fff',
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  inputCardContent: {
    padding: 24,
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  inputTitle: {
    color: '#1e3a8a',
    fontWeight: '700',
    fontSize: 24,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  inputDescription: {
    color: '#6b7280',
    marginBottom: 24,
    lineHeight: 22,
    fontSize: 15,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputWrapper: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#fff',
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  inputOutline: {
    borderRadius: 12,
    borderWidth: 2,
  },
  inputHint: {
    color: '#9ca3af',
    marginTop: 8,
    marginLeft: 12,
    fontSize: 14,
  },
  pasteIcon: {
    marginRight: 8,
  },
  searchButton: {
    borderRadius: 12,
    paddingVertical: 8,
    elevation: 4,
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  buttonContent: {
    paddingVertical: 12,
  },
  buttonLabel: {
    fontWeight: '700',
    fontSize: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  errorText: {
    color: '#dc2626',
    marginLeft: 8,
    flex: 1,
    fontWeight: '500',
    fontSize: 14,
  },
  helpSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 12,
  },
  helpText: {
    color: '#6b7280',
    marginLeft: 8,
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  resultsContainer: {
    marginBottom: 32,
  },
  sectionCard: {
    borderRadius: 16,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  sectionHeader: {
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  statusText: {
    color: '#16a34a',
    fontWeight: '700',
    letterSpacing: 0.5,
    fontSize: 14,
  },
  orderIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 12,
  },
  orderLabel: {
    color: '#6b7280',
    marginRight: 8,
    fontWeight: '600',
    fontSize: 15,
  },
  orderId: {
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginRight: 8,
    fontWeight: '600',
    color: '#1e3a8a',
    fontSize: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#e0f2fe',
    borderRadius: 12,
  },
  totalLabel: {
    color: '#6b7280',
    fontWeight: '600',
    fontSize: 18,
  },
  totalPrice: {
    color: '#1e3a8a',
    fontWeight: '700',
    fontSize: 24,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  sectionTitle: {
    color: '#1e3a8a',
    marginLeft: 8,
    fontWeight: '700',
    fontSize: 24,
  },
  travelerCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  travelerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  travelerIcon: {
    marginRight: 12,
  },
  travelerName: {
    color: '#1e3a8a',
    fontWeight: '600',
    fontSize: 18,
  },
  travelerSubtitle: {
    color: '#6b7280',
    fontSize: 14,
  },
  travelerDetails: {
    marginLeft: 12,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  detailItem: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  detailLabel: {
    color: '#6b7280',
    marginBottom: 4,
    fontWeight: '600',
    fontSize: 14,
  },
  tripContainer: {
    marginBottom: 24,
  },
  tripHeader: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tripTitle: {
    color: '#1e3a8a',
    fontWeight: '700',
    fontSize: 20,
  },
  tripDetails: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  tripDetail: {
    color: '#6b7280',
    fontWeight: '500',
    fontSize: 14,
  },
  legContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  flightRoute: {
    alignItems: 'center',
    marginRight: 16,
    width: 24,
  },
  routeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1e3a8a',
  },
  routeLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#1e3a8a',
    marginVertical: 4,
  },
  flightDetails: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  airportSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  airportCode: {
    color: '#1e3a8a',
    fontWeight: '700',
    fontSize: 18,
  },
  timeText: {
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 4,
    color: '#1e3a8a',
    fontSize: 20,
  },
  dateText: {
    color: '#6b7280',
    marginBottom: 4,
    fontSize: 14,
  },
  terminalText: {
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    fontWeight: '500',
    fontSize: 13,
  },
  flightInfo: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    minWidth: 100,
  },
  duration: {
    fontWeight: '600',
    marginBottom: 4,
    color: '#1e3a8a',
    fontSize: 16,
  },
  flightNumber: {
    fontWeight: '600',
    color: '#2c3e50',
  },
  flightLineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  flightLine: {
    height: 1,
    width: 40,
    backgroundColor: '#d1d5db',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 24,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 8,
  },
});

export default CheckYourFlight;