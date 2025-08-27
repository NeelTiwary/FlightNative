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
  Divider,
  IconButton,
} from 'react-native-paper';

const CheckYourFlight = () => {
  const [bookingId, setBookingId] = useState('');
  const [loading, setLoading] = useState(false);
  const [flightData, setFlightData] = useState(null);
  const [error, setError] = useState(null);

  const fetchFlightDetails = async () => {
    if (!bookingId.trim()) {
      Alert.alert('Error', 'Please enter a booking ID');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock flight data for demonstration
      const mockFlightData = {
        orderId: 'ORD-7892-2023',
        flightOffer: {
          currencyCode: 'USD',
          totalPrice: '487.50',
          trips: [
            {
              from: 'JFK',
              to: 'LAX',
              stops: 0,
              totalFlightDuration: '5h 45m',
              legs: [
                {
                  departureAirport: 'JFK',
                  arrivalAirport: 'LAX',
                  departureDateTime: '2023-11-15T08:30:00',
                  arrivalDateTime: '2023-11-15T12:15:00',
                  duration: '5h 45m',
                  operatingCarrierCode: 'AA',
                  flightNumber: '1234',
                  aircraftCode: 'B737',
                  departureTerminal: '4',
                  arrivalTerminal: 'B'
                }
              ]
            }
          ]
        },
        travelers: [
          {
            firstName: 'John',
            lastName: 'Doe',
            dateOfBirth: '1985-07-15',
            gender: 'Male',
            phones: [
              {
                countryCallingCode: '1',
                number: '555-123-4567'
              }
            ],
            documents: [
              {
                documentType: 'PASSPORT',
                number: 'N12345678',
                expiryDate: '2028-03-20',
                nationality: 'US'
              }
            ]
          },
          {
            firstName: 'Jane',
            lastName: 'Doe',
            dateOfBirth: '1988-11-23',
            gender: 'Female',
            phones: [
              {
                countryCallingCode: '1',
                number: '555-987-6543'
              }
            ],
            documents: [
              {
                documentType: 'PASSPORT',
                number: 'P87654321',
                expiryDate: '2029-05-12',
                nationality: 'US'
              }
            ]
          }
        ]
      };
      
      setFlightData(mockFlightData);
    } catch (err) {
      setError(err.message);
      Alert.alert('Error', 'Could not fetch flight details. Please check your booking ID and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaste = async () => {
    try {
      Alert.alert('Info', 'Paste functionality would be implemented here');
      // For demo purposes, set a sample booking ID
      setBookingId('eJzTd9e38HUJjfIGAAsQAmk%3D');
    } catch (err) {
      Alert.alert('Error', 'Could not paste from clipboard');
    }
  };

  const formatDateTime = (dateTimeStr) => {
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

  const formatDuration = (duration) => {
    return duration.replace('h', 'h ').replace('m', 'm');
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976d2" />
          <Text style={styles.loadingText}>Fetching your flight details...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerIconContainer}>
          <IconButton 
            icon="airplane-takeoff" 
            size={36} 
            iconColor="#1976d2" 
            style={styles.headerIcon}
          />
        </View>
        <Text variant="headlineSmall" style={styles.headerTitle}>
          Flight Status & Details
        </Text>
        <Text variant="bodyMedium" style={styles.headerSubtitle}>
          Retrieve your flight information with your booking reference
        </Text>
      </View>

      {/* Input Section */}
      <View style={styles.inputSection}>
        <Card style={styles.inputCard} elevation={4}>
          <Card.Content style={styles.inputCardContent}>
            <View style={styles.inputHeader}>
              <Text variant="titleLarge" style={styles.inputTitle}>
                Retrieve Your Flight
              </Text>
              <IconButton 
                icon="information-outline" 
                size={20} 
                iconColor="#7f8c8d" 
              />
            </View>
            
            <Text variant="bodyMedium" style={styles.inputDescription}>
              Enter your booking reference number to access your flight details, 
              passenger information, and itinerary.
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
                  right={
                    <TextInput.Icon
                      icon="clipboard-text-outline"
                      color={bookingId ? "#1976d2" : "#bdbdbd"}
                      onPress={handlePaste}
                      style={styles.pasteIcon}
                    />
                  }
                />
                <Text variant="bodySmall" style={styles.inputHint}>
                  Usually found in your confirmation email
                </Text>
              </View>
              
              <Button
                mode="contained"
                onPress={fetchFlightDetails}
                style={styles.searchButton}
                icon="magnify"
                contentStyle={styles.buttonContent}
                disabled={!bookingId.trim()}
                labelStyle={styles.buttonLabel}
              >
                Retrieve Flight Details
              </Button>
            </View>

            {error && (
              <View style={styles.errorContainer}>
                <IconButton icon="alert-circle-outline" iconColor="#d32f2f" size={20} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
          </Card.Content>
        </Card>

        <View style={styles.helpSection}>
          <IconButton icon="help-circle" size={20} iconColor="#7f8c8d" />
          <Text variant="bodySmall" style={styles.helpText}>
            Can't find your booking reference? Check your email confirmation or contact support.
          </Text>
        </View>
      </View>

      {flightData && (
        <View style={styles.resultsContainer}>
          {/* Order Summary */}
          <Card style={styles.sectionCard}>
            <Card.Content>
              <View style={styles.sectionHeader}>
                <View style={styles.statusBadge}>
                  <IconButton icon="check-circle" size={16} iconColor="#4caf50" />
                  <Text variant="labelSmall" style={styles.statusText}>
                    CONFIRMED
                  </Text>
                </View>
                <View style={styles.orderIdContainer}>
                  <Text variant="bodySmall" style={styles.orderLabel}>
                    ORDER ID:
                  </Text>
                  <Text variant="bodyMedium" style={styles.orderId} numberOfLines={1}>
                    {flightData.orderId}
                  </Text>
                  <IconButton
                    icon="content-copy"
                    size={16}
                    onPress={() => {
                      Alert.alert('Copied', 'Order ID copied to clipboard');
                    }}
                  />
                </View>
              </View>

              <View style={styles.priceContainer}>
                <Text variant="bodyMedium" style={styles.totalLabel}>Total Amount:</Text>
                <Text variant="headlineSmall" style={styles.totalPrice}>
                  {flightData.flightOffer.currencyCode} {flightData.flightOffer.totalPrice}
                </Text>
              </View>
            </Card.Content>
          </Card>

          {/* Traveler Details */}
          <Card style={styles.sectionCard}>
            <Card.Content>
              <View style={styles.sectionTitleRow}>
                <IconButton icon="account-group" size={20} color="#1976d2" />
                <Text variant="titleLarge" style={styles.sectionTitle}>
                  Passenger Details
                </Text>
              </View>
              
              {flightData.travelers.map((traveler, index) => (
                <View key={index} style={styles.travelerCard}>
                  <View style={styles.travelerHeader}>
                    <View style={styles.travelerIcon}>
                      <IconButton icon="account-circle" size={24} color="#1976d2" />
                    </View>
                    <View>
                      <Text variant="titleMedium">
                        {traveler.firstName} {traveler.lastName}
                      </Text>
                      <Text variant="bodySmall" style={styles.travelerSubtitle}>
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
                        <Text variant="bodyMedium">{traveler.dateOfBirth}</Text>
                      </View>

                      <View style={styles.detailItem}>
                        <Text variant="bodySmall" style={styles.detailLabel}>
                          Gender
                        </Text>
                        <Text variant="bodyMedium">{traveler.gender}</Text>
                      </View>

                      {traveler.phones && traveler.phones.length > 0 && (
                        <View style={styles.detailItem}>
                          <Text variant="bodySmall" style={styles.detailLabel}>
                            Phone
                          </Text>
                          <Text variant="bodyMedium">
                            +{traveler.phones[0].countryCallingCode} {traveler.phones[0].number}
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
                              {traveler.documents[0].documentType}: {traveler.documents[0].number}
                            </Text>
                          </View>
                          <View style={styles.detailItem}>
                            <Text variant="bodySmall" style={styles.detailLabel}>
                              Expiry
                            </Text>
                            <Text variant="bodyMedium">
                              {traveler.documents[0].expiryDate}
                            </Text>
                          </View>
                          <View style={styles.detailItem}>
                            <Text variant="bodySmall" style={styles.detailLabel}>
                              Nationality
                            </Text>
                            <Text variant="bodyMedium">
                              {traveler.documents[0].nationality}
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

          {/* Flight Itinerary */}
          <Card style={styles.sectionCard}>
            <Card.Content>
              <View style={styles.sectionTitleRow}>
                <IconButton icon="airplane" size={20} color="#1976d2" />
                <Text variant="titleLarge" style={styles.sectionTitle}>
                  Flight Itinerary
                </Text>
              </View>

              {flightData.flightOffer.trips.map((trip, index) => (
                <View key={index} style={styles.tripContainer}>
                  <View style={styles.tripHeader}>
                    <Text variant="titleMedium">
                      {trip.from} → {trip.to}
                    </Text>
                    <View style={styles.tripDetails}>
                      <Text variant="bodySmall" style={styles.tripDetail}>
                        {trip.stops} stop{trip.stops !== 1 ? 's' : ''}
                      </Text>
                      <Text variant="bodySmall" style={styles.tripDetail}>
                        • {formatDuration(trip.totalFlightDuration)}
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
                            <Text variant="titleSmall">{leg.departureAirport}</Text>
                            <Text variant="titleMedium" style={styles.timeText}>{departure.time}</Text>
                            <Text variant="bodySmall" style={styles.dateText}>{departure.date}</Text>
                            {leg.departureTerminal && (
                              <Text variant="bodySmall" style={styles.terminalText}>
                                Terminal {leg.departureTerminal}
                              </Text>
                            )}
                          </View>

                          <View style={styles.flightInfo}>
                            <Text variant="bodyMedium" style={styles.duration}>
                              {formatDuration(leg.duration)}
                            </Text>
                            <View style={styles.flightLineContainer}>
                              <View style={styles.flightLine} />
                              <IconButton icon="airplane" size={16} color="#666" />
                            </View>
                            <Text variant="bodySmall">
                              {leg.operatingCarrierCode} {leg.flightNumber}
                            </Text>
                            <Text variant="bodySmall">Aircraft: {leg.aircraftCode}</Text>
                          </View>

                          <View style={styles.airportSection}>
                            <Text variant="titleSmall">{leg.arrivalAirport}</Text>
                            <Text variant="titleMedium" style={styles.timeText}>{arrival.time}</Text>
                            <Text variant="bodySmall" style={styles.dateText}>{arrival.date}</Text>
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

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Button mode="outlined" icon="printer" style={styles.actionButton}>
              Print Itinerary
            </Button>
            <Button mode="contained" icon="download" style={styles.actionButton}>
              Download Ticket
            </Button>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 16,
    elevation: 4,
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
    fontSize: 16,
  },
  header: {
    marginBottom: 36,
    alignItems: 'center',
    padding: 36,
    backgroundColor: '#fff',
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  headerIconContainer: {
    backgroundColor: '#e3f2fd',
    borderRadius: 50,
    padding: 16,
    marginBottom: 24,
  },
  headerIcon: {
    margin: 0,
  },
  headerTitle: {
    color: '#2c3e50',
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 24,
  },
  headerSubtitle: {
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 16,
  },
  inputSection: {
    marginBottom: 36,
  },
  inputCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
  },
  inputCardContent: {
    padding: 36,
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  inputTitle: {
    color: '#2c3e50',
    fontWeight: '700',
    flex: 1,
    fontSize: 22,
  },
  inputDescription: {
    color: '#7f8c8d',
    marginBottom: 32,
    lineHeight: 24,
    fontSize: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputWrapper: {
    marginBottom: 28,
  },
  input: {
    backgroundColor: '#fff',
    fontSize: 16,
  },
  inputOutline: {
    borderRadius: 14,
    borderWidth: 1.5,
  },
  inputHint: {
    color: '#bdbdbd',
    marginTop: 12,
    marginLeft: 12,
    fontSize: 13,
  },
  pasteIcon: {
    marginRight: 8,
  },
  searchButton: {
    borderRadius: 14,
    paddingVertical: 12,
    elevation: 3,
    shadowColor: '#1976d2',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  buttonContent: {
    paddingVertical: 10,
  },
  buttonLabel: {
    fontWeight: '700',
    fontSize: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    padding: 20,
    borderRadius: 14,
    marginTop: 24,
  },
  errorText: {
    color: '#d32f2f',
    marginLeft: 12,
    flex: 1,
    fontWeight: '500',
    fontSize: 14,
  },
  helpSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 24,
    borderRadius: 14,
  },
  helpText: {
    color: '#7f8c8d',
    marginLeft: 12,
    flex: 1,
    fontStyle: 'italic',
    fontSize: 14,
  },
  resultsContainer: {
    marginBottom: 32,
  },
  sectionCard: {
    borderRadius: 20,
    marginBottom: 24,
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    overflow: 'hidden',
  },
  sectionHeader: {
    marginBottom: 20,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 18,
  },
  statusText: {
    color: '#2e7d32',
    fontWeight: '700',
    letterSpacing: 0.5,
    fontSize: 13,
  },
  orderIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderRadius: 14,
  },
  orderLabel: {
    color: '#7f8c8d',
    marginRight: 10,
    fontWeight: '600',
    fontSize: 14,
  },
  orderId: {
    flex: 1,
    fontFamily: 'monospace',
    marginRight: 10,
    fontWeight: '600',
    color: '#2c3e50',
    fontSize: 15,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#e3f2fd',
    borderRadius: 14,
  },
  totalLabel: {
    color: '#7f8c8d',
    fontWeight: '600',
    fontSize: 16,
  },
  totalPrice: {
    color: '#1976d2',
    fontWeight: 'bold',
    fontSize: 22,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    color: '#2c3e50',
    marginLeft: 12,
    fontWeight: '700',
    fontSize: 22,
  },
  travelerCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
  },
  travelerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  travelerIcon: {
    marginRight: 16,
  },
  travelerSubtitle: {
    color: '#7f8c8d',
    fontSize: 14,
  },
  travelerDetails: {
    marginLeft: 12,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -10,
  },
  detailItem: {
    width: '50%',
    paddingHorizontal: 10,
    marginBottom: 18,
  },
  detailLabel: {
    color: '#7f8c8d',
    marginBottom: 6,
    fontWeight: '600',
    fontSize: 13,
  },
  tripContainer: {
    marginBottom: 28,
  },
  tripHeader: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tripDetails: {
    flexDirection: 'row',
    marginTop: 10,
  },
  tripDetail: {
    color: '#7f8c8d',
    fontWeight: '500',
    fontSize: 14,
  },
  legContainer: {
    flexDirection: 'row',
    marginBottom: 28,
  },
  flightRoute: {
    alignItems: 'center',
    marginRight: 24,
    width: 28,
  },
  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#1976d2',
  },
  routeLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#1976d2',
    marginVertical: 6,
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
  timeText: {
    fontWeight: '700',
    marginTop: 6,
    marginBottom: 4,
    color: '#2c3e50',
    fontSize: 18,
  },
  dateText: {
    color: '#7f8c8d',
    marginBottom: 6,
    fontSize: 14,
  },
  terminalText: {
    color: '#7f8c8d',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    overflow: 'hidden',
    fontWeight: '500',
    fontSize: 13,
  },
  flightInfo: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    minWidth: 110,
  },
  duration: {
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#2c3e50',
    fontSize: 16,
  },
  flightLineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  flightLine: {
    height: 1,
    width: 50,
    backgroundColor: '#bdbdbd',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 10,
  },
});

export default CheckYourFlight;