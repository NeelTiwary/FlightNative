import React, { useState, useEffect } from "react";
import { 
  View, 
  ScrollView, 
  StyleSheet, 
  Pressable, 
  Dimensions,
  StatusBar,
  Modal,
  Animated,
  TouchableWithoutFeedback,
  Platform
} from "react-native";
import { 
  Text, 
  TextInput, 
  Button, 
  IconButton,
  Card,
  Divider
} from "react-native-paper";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useNavigation } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import axiosInstance from '../../../config/axiosConfig';
import { useAppContext } from '@/context/AppContextProvider';
import { convertToQueryParams } from '@/utils/helper';

const { width, height } = Dimensions.get('window');

export default function Home() {
  const {
    searchParams, setSearchParams,
    fromLoading, setFromLoading,
    fromInput, setFromInput,
    fromSuggestions, setFromSuggestions,
    toLoading, setToLoading,
    toInput, setToInput,
    toSuggestions, setToSuggestions,
    setFlightOffers,
    flightClasses,
  } = useAppContext();

  const [offersLoading, setOffersLoading] = useState(false);
  const [tripType, setTripType] = useState("roundTrip");
  const [showReturnDate, setShowReturnDate] = useState(true);
  const [classDropdownVisible, setClassDropdownVisible] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [currentDateType, setCurrentDateType] = useState('');
  const [dropdownAnimation] = useState(new Animated.Value(0));

  const router = useRouter();
  const navigation = useNavigation();

  const fetchSuggestions = async (type, keyword) => {
  try {
    if (keyword.length < 3) return;
    type === 'from' ? setFromLoading(true) : setToLoading(true);
    const response = await axiosInstance.get(`/locations/search?keyword=${keyword}`);
    const suggestions = response.data.locationResponses
      .flatMap(entry => [
        entry, // Include the city
        ...entry.group_data.simpleAirports.map(airport => ({
          ...airport,
          city: entry.name, // Add city name to airports for display
        })),
      ])
      .sort((a, b) => {
        // Sort to show cities first, then airports
        if (a.subType === 'CITY' && b.subType !== 'CITY') return -1;
        if (a.subType !== 'CITY' && b.subType === 'CITY') return 1;
        return a.name.localeCompare(b.name);
      });
    if (type === 'from') setFromSuggestions(suggestions);
    if (type === 'to') setToSuggestions(suggestions);
  } catch (error) {
    console.error('Error fetching suggestions: ', error);
    alert('Failed to fetch suggestions. Please try again.');
    if (type === 'from') setFromSuggestions([]);
    if (type === 'to') setToSuggestions([]);
  } finally {
    type === 'from' ? setFromLoading(false) : setToLoading(false);
  }
};

  const handleFromInputChange = (text) => {
    if (!text) {
      setFromSuggestions([]);
      setFromInput("");
      setFromLoading(false);
      setSearchParams({ ...searchParams, from: "" });
      return;
    }
    setFromInput(text);
    setFromLoading(true);
    fetchSuggestions('from', text).then(() => setFromLoading(false));
  };

  const handleToInputChange = (text) => {
    if (!text) {
      setToSuggestions([]);
      setToInput("");
      setToLoading(false);
      setSearchParams({ ...searchParams, to: "" });
      return;
    }
    setToInput(text);
    setToLoading(true);
    fetchSuggestions('to', text).then(() => setToLoading(false));
  };

  const handleChange = (field, value) => {
    setSearchParams({
      ...searchParams,
      [field]: value
    });
  };

  const swapLocations = () => {
    if (!searchParams.from || !searchParams.to) return;
    const temp = searchParams.from;
    setFromInput(toInput);
    setToInput(fromInput);
    setFromSuggestions([]);
    setToSuggestions([]);
    setFromLoading(false);
    setToLoading(false);
    setSearchParams((prev) => ({
      ...prev,
      from: prev.to,
      to: temp,
    }));
  };

 const handleSubmit = async () => {
     setOffersLoading(true);
     try {
       if (!searchParams.from || !searchParams.to || !searchParams.departureDate || !searchParams.flightClass || searchParams.adults < 1) {
         alert("Please fill all required fields");
         return;
       }
       const params = {
         originLocationCode: searchParams.from,
         destinationLocationCode: searchParams.to,
         departureDate: searchParams.departureDate,
         adults: searchParams.adults,
         children: searchParams.children,
         infants: searchParams.infants,
         travelClass: searchParams.flightClass.toUpperCase(),
         currencyCode: "USD",
         max: 20
       }

       if(searchParams.returnDate) {
         Object.assign(params, {returnDate: searchParams.returnDate});
       }

       const queryparams = convertToQueryParams(params);
        const response = await axiosInstance.get(`/flights/search?${queryparams}`);
       setFlightOffers(response.data.flightsAvailable);
       setTimeout(() => {
         router.push("/offers");
       }, 50);
     } catch (error) {
       console.error("Error fetching flight offers: ", error);
       alert("Failed to fetch flight offers. Please try again.");
       setOffersLoading(false);
     } finally {
       setOffersLoading(false);
     }
   }


  const toggleClassDropdown = () => {
    if (classDropdownVisible) {
      Animated.timing(dropdownAnimation, {
        toValue: 0,
        duration: 10,
        useNativeDriver: true,
      }).start(() => setClassDropdownVisible(false));
    } else {
      setClassDropdownVisible(true);
      Animated.timing(dropdownAnimation, {
        toValue: 1,
        duration: 10,
        useNativeDriver: true,
      }).start();
    }
  };

  const selectFlightClass = (flightClass) => {
    handleChange('flightClass', flightClass);
    toggleClassDropdown();
  };

  const showDatePicker = (dateType) => {
    setCurrentDateType(dateType);
    setDatePickerVisible(true);
  };

  const onDateChange = (event, selectedDate) => {
    setDatePickerVisible(false);
    if (selectedDate) {
      const dateString = selectedDate.toISOString().split('T')[0];
      handleChange(currentDateType, dateString);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const renderSuggestionItem = (item, type) => {
  const isCity = item.subType === 'CITY';
  const isAirport = item.subType === 'AIRPORT';

  return (
    <Pressable
      key={item.iata}
      style={[
        styles.suggestionItem,
        isAirport && styles.airportSuggestionItem, // Apply indentation for airports
      ]}
      onPress={() => {
        if (type === 'from') {
          setSearchParams({ ...searchParams, from: item.iata });
          setFromInput(`${item.name} - ${item.iata}`);
          setFromSuggestions([]);
        } else {
          setSearchParams({ ...searchParams, to: item.iata });
          setToInput(`${item.name} - ${item.iata}`);
          setToSuggestions([]);
        }
      }}
    >
      <View style={styles.suggestionIconContainer}>
        <IconButton
          icon={isCity ? 'city' : 'airplane'}
          size={16}
          style={styles.suggestionIcon}
        />
      </View>
      <View style={styles.suggestionTextContainer}>
        <Text style={styles.suggestionName}>
          {item.name}
          {isAirport && item.city ? ` (${item.city})` : ''}
        </Text>
        <Text style={styles.suggestionIata}>{item.iata}</Text>
      </View>
    </Pressable>
  );
};

  const dropdownTranslateY = dropdownAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-10, 0],
  });

  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={headerStyles.logoContainer}>
          <Text style={headerStyles.logoText}>FlightBooking</Text>
        </View>
      ),
      headerRight: () => (
        <View style={headerStyles.headerRight}>
          <IconButton
            icon="bell-outline"
            size={22}
            iconColor="#1a73e8"
            style={headerStyles.iconButton}
          />
          <IconButton
            icon="account"
            size={22}
            iconColor="#1a73e8"
            style={headerStyles.iconButton}
          />
        </View>
      ),
      headerStyle: {
        backgroundColor: '#fff',
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
      },
      headerTitleAlign: 'center',
    });
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <LinearGradient
          colors={['#1a73e8', '#4285f4']}
          style={styles.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.heroTitle}>Where would you like to go?</Text>
          <Text style={styles.heroSubtitle}>Find the best flight deals for your next trip</Text>
        </LinearGradient>

        {/* Search Form */}
        <Card style={styles.formCard} elevation={4}>
          <Card.Content>
            {/* Trip Type Selection */}
            <View style={styles.tripTypeContainer}>
              {["roundTrip", "oneWay", "multiCity"].map((type) => (
                <Pressable
                  key={type}
                  style={[
                    styles.tripTypeButton,
                    tripType === type && styles.tripTypeButtonActive
                  ]}
                  onPress={() => {
                    setTripType(type);
                    if (type === "oneWay") {
                      setShowReturnDate(false);
                      setSearchParams({ ...searchParams, returnDate: null });
                    } else if (type === "roundTrip") {
                      setShowReturnDate(true);
                    }
                  }}
                >
                  <Text
                    style={[
                      styles.tripTypeText,
                    tripType === type && styles.tripTypeTextActive
                    ]}
                  >
                    {type === "roundTrip" ? "Round" : 
                    type === "oneWay" ? "One Way" : "Multi City"}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Location Inputs */}
            <View style={styles.locationContainer}>
              <View style={styles.inputContainer}>
                <View style={styles.textInputWrapper}>
                  <Text style={styles.inputLabel}>From</Text>
                  <View style={styles.textInputContainer}>
                    <IconButton icon="airplane-takeoff" size={18} style={styles.inputIcon} />
                    <TextInput
                      value={fromInput}
                      onChangeText={handleFromInputChange}
                      placeholder="Departure"
                      style={styles.textInput}
                      mode="flat"
                      underlineColor="transparent"
                    />
                    {fromLoading && <IconButton icon="loading" size={18} />}
                  </View>
                  {fromSuggestions.length > 0 && (
                    <View style={styles.suggestionsContainer}>
                      <ScrollView style={styles.suggestionsScroll}>
                        {fromSuggestions.map(item => renderSuggestionItem(item, 'from'))}
                      </ScrollView>
                    </View>
                  )}
                </View>

                <View style={styles.textInputWrapper}>
                  <Text style={styles.inputLabel}>To</Text>
                  <View style={styles.textInputContainer}>
                    <IconButton icon="airplane-landing" size={18} style={styles.inputIcon} />
                    <TextInput
                      value={toInput}
                      onChangeText={handleToInputChange}
                      placeholder="Destination"
                      style={styles.textInput}
                      mode="flat"
                      underlineColor="transparent"
                    />
                    {toLoading && <IconButton icon="loading" size={18} />}
                  </View>
                  {toSuggestions.length > 0 && (
                    <View style={styles.suggestionsContainer}>
                      <ScrollView style={styles.suggestionsScroll}>
                        {toSuggestions.map(item => renderSuggestionItem(item, 'to'))}
                      </ScrollView>
                    </View>
                  )}
                </View>
              </View>

              <IconButton
                icon="swap-vertical"
                size={20}
                onPress={swapLocations}
                style={styles.swapButton}
                iconColor="#fff"
              />
            </View>

            {/* Date Selection */}
            <View style={styles.dateContainer}>
              <View style={styles.dateInput}>
                <Text style={styles.inputLabel}>Departure</Text>
                <Pressable 
                  style={styles.dateButton}
                  onPress={() => showDatePicker('departureDate')}
                >
                  <IconButton icon="calendar" size={18} style={styles.inputIcon} />
                  <Text style={styles.dateText}>
                    {formatDate(searchParams.departureDate) || "Select date"}
                  </Text>
                </Pressable>
              </View>

              {showReturnDate && (
                <View style={styles.dateInput}>
                  <Text style={styles.inputLabel}>Return</Text>
                  <Pressable 
                    style={styles.dateButton}
                    onPress={() => showDatePicker('returnDate')}
                  >
                    <IconButton icon="calendar" size={18} style={styles.inputIcon} />
                    <Text style={styles.dateText}>
                      {formatDate(searchParams.returnDate) || "Select date"}
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>

            {datePickerVisible && (
              <DateTimePicker
                value={
                  currentDateType === 'departureDate' && searchParams.departureDate
                    ? new Date(searchParams.departureDate)
                    : currentDateType === 'returnDate' && searchParams.returnDate
                    ? new Date(searchParams.returnDate)
                    : new Date()
                }
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
                minimumDate={new Date()}
              />
            )}
            {/* Passengers and Class */}
            <View style={styles.passengerContainer}>
              <View style={styles.passengerInput}>
                <Text style={styles.inputLabel}>Passengers</Text>
                <View style={styles.counterContainer}>
                  <IconButton 
                    icon="minus" 
                    size={18} 
                    onPress={() => handleChange('adults', Math.max(1, searchParams.adults - 1))}
                    style={styles.counterButton}
                  />
                  <Text style={styles.counterText}>{searchParams.adults} Adult</Text>
                  <IconButton 
                    icon="plus" 
                    size={18} 
                    onPress={() => handleChange('adults', searchParams.adults + 1)}
                    style={styles.counterButton}
                  />
                </View>
              </View>

              <View style={styles.classInput}>
                <Text style={styles.inputLabel}>Class</Text>
                <Pressable style={styles.classSelector} onPress={toggleClassDropdown}>
                  <Text style={styles.classText}>{searchParams.flightClass}</Text>
                  <IconButton icon="chevron-down" size={18} style={styles.classDropdownIcon} />
                </Pressable>
                
                <Modal
                  visible={classDropdownVisible}
                  transparent={true}
                  animationType="fade"
                  onRequestClose={toggleClassDropdown}
                >
                  <TouchableWithoutFeedback onPress={toggleClassDropdown}>
                    <View style={styles.modalOverlay}>
                      <Animated.View 
                        style={[
                          styles.dropdownContainer,
                          { transform: [{ translateY: dropdownTranslateY }], opacity: dropdownAnimation }
                        ]}
                      >
                        {flightClasses.map((flightClass, index) => (
                          <Pressable
                            key={index}
                            style={[
                              styles.dropdownItem,
                              searchParams.flightClass === flightClass && styles.dropdownItemSelected
                            ]}
                            onPress={() => selectFlightClass(flightClass)}
                          >
                            <Text style={[
                              styles.dropdownItemText,
                              searchParams.flightClass === flightClass && styles.dropdownItemTextSelected
                            ]}>
                              {flightClass}
                            </Text>
                          </Pressable>
                        ))}
                      </Animated.View>
                    </View>
                  </TouchableWithoutFeedback>
                </Modal>
              </View>
            </View>

            {/* Search Button */}
            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={offersLoading}
              disabled={offersLoading}
              style={styles.searchButton}
              labelStyle={styles.searchButtonText}
              icon="magnify"
            >
              {offersLoading ? "Searching..." : "Search Flights"}
            </Button>
          </Card.Content>
        </Card>

        {/* Promotions */}
        <Text style={styles.sectionTitle}>Special Offers</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.promotionsContainer}>
          {[
            { id: 1, title: "Summer Sale", discount: "30% OFF", code: "SUMMER23", color: "#FF6B6B" },
            { id: 2, title: "Business Class", discount: "25% OFF", code: "BUSINESS25", color: "#4ECDC4" },
            { id: 3, title: "Early Bird", discount: "20% OFF", code: "EARLY20", color: "#45B7D1" },
          ].map(offer => (
            <Card key={offer.id} style={[styles.promotionCard, { borderLeftColor: offer.color, borderLeftWidth: 4 }]}>
              <Card.Content style={styles.promotionContent}>
                <View style={styles.promotionHeader}>
                  <Text style={styles.promotionTitle}>{offer.title}</Text>
                  <View style={[styles.promotionBadge, { backgroundColor: offer.color }]}>
                    <Text style={styles.promotionDiscount}>{offer.discount}</Text>
                  </View>
                </View>
                <Text style={styles.promotionCode}>Use code: {offer.code}</Text>
              </Card.Content>
            </Card>
          ))}
        </ScrollView>

        {/* Popular Destinations */}
        <Text style={styles.sectionTitle}>Popular Destinations</Text>
        <View style={styles.destinationsContainer}>
          {[
            { id: 1, name: "Paris", price: "$420", icon: "city" },
            { id: 2, name: "Tokyo", price: "$650", icon: "temple-buddhist" },
            { id: 3, name: "New York", price: "$380", icon: "city-variant" },
            { id: 4, name: "Bali", price: "$520", icon: "island" },
          ].map(destination => (
            <Card key={destination.id} style={styles.destinationCard}>
              <Card.Content style={styles.destinationContent}>
                <IconButton icon={destination.icon} size={24} color="#1a73e8" style={styles.destinationIcon} />
                <Text style={styles.destinationName}>{destination.name}</Text>
                <Text style={styles.destinationPrice}>From {destination.price}</Text>
              </Card.Content>
            </Card>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const headerStyles = StyleSheet.create({
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a73e8',
    letterSpacing: 0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    margin: 0,
    marginHorizontal: 4,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  hero: {
    padding: 24,
    paddingTop: 20,
    paddingBottom: 40,
    borderBottomLeftRadius: 48,
    borderBottomRightRadius: 48,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.9,
    textAlign: 'center',
  },
  formCard: {
    marginHorizontal: 10,
    marginTop: -30,
    borderRadius: 30,
    marginBottom: 24,
    backgroundColor: '#fff',
    shadowColor: '#065dcfff',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  tripTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
    backgroundColor: '#cae3fcff',
    borderRadius: 12,
    padding: 12,
  },
  tripTypeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    flex: 1,
    alignItems: 'center',
  },
  tripTypeButtonActive: {
    backgroundColor: '#ffffffff',
    shadowColor: '#020c81ff',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tripTypeText: {
    color: '#6c757d',
    fontWeight: '500',
    fontSize: 14,
  },
  tripTypeTextActive: {
    color: '#1a73e8',
    fontWeight: 'bold',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
    zIndex: 10,
  },
  inputContainer: {
    flex: 1,
  },
  textInputWrapper: {
    marginBottom: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 2,
    marginLeft: 4,
  },
  textInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 25,
    backgroundColor: '#fff',
    height: 37,
    overflow: 'hidden',
  },
  inputIcon: {
    margin: 0,
    marginLeft: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: 'transparent',
    fontSize: 13,
    height: 40,
    includeFontPadding: false,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#c3c6c9ff',
    zIndex: 100,
    marginTop: 4,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    maxHeight: 200,
  },
  suggestionsScroll: {
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  airportSuggestionItem: {
    paddingLeft: 20, // Indent airports
  },
  suggestionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  suggestionIcon: {
    margin: 0,
  },
  suggestionTextContainer: {
    flex: 1,
  },
  suggestionName: {
    fontSize: 11,
    color: '#212529',
    fontWeight: '500',
  },
  suggestionIata: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 2,
  },
  swapButton: {
    backgroundColor: '#1a73e8',
    marginHorizontal: 0,
    borderRadius: 12,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#1a73e8',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  dateInput: {
    flex: 0.48,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 26,
    backgroundColor: '#fff',
    height: 37,
    paddingHorizontal: 0,
  },
  dateText: {
    fontSize: 15,
    color: '#4c4b4bff',
    marginLeft: 0,
    flex: 1,
  },
  passengerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 1,
    position: 'relative',
    zIndex: 1,
  },
  passengerInput: {
    flex: 0.48,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 25,
    backgroundColor: '#fff',
    paddingHorizontal: 4,
    height: 42,
  },
  counterButton: {
    margin: 0,
    backgroundColor: '#f8f9fa',
    borderRadius: 50,
  },
  counterText: {
    fontSize: 14,
    color: '#212529',
    fontWeight: '500',
  },
  classInput: {
    flex: 0.48,
    position: 'relative',
  },
  classSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 25,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    height: 42,
  },
  classText: {
    fontSize: 15,
    color: '#212529',
    fontWeight: '500',
  },
  classDropdownIcon: {
    margin: 0,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownContainer: {
    backgroundColor: '#ffffffff',
    borderRadius: 12,
    padding: 8,
    width: width * 0.7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  dropdownItemSelected: {
    backgroundColor: '#383b3dff',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#212529',
  },
  dropdownItemTextSelected: {
    color: '#1a73e8',
    fontWeight: '600',
  },
  searchButton: {
    backgroundColor: '#1a73e8',
    borderRadius: 30,
    paddingVertical: 8,
    marginTop: 8,
    height: 50,
    justifyContent: 'center',
    shadowColor: '#1a73e8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
    letterSpacing: 0.5,
    zIndex: 200,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
    marginHorizontal: 16,
    marginBottom: 16,
    marginTop: 8,
  },
  promotionsContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  promotionCard: {
    width: width * 0.7,
    borderRadius: 12,
    marginRight: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  promotionContent: {
    padding: 16,
  },
  promotionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  promotionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
  },
  promotionBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  promotionDiscount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  promotionCode: {
    fontSize: 14,
    color: '#6c757d',
  },
  destinationsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  destinationCard: {
    width: width * 0.45,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  destinationContent: {
    padding: 16,
    alignItems: 'center',
  },
  destinationIcon: {
    margin: 0,
    marginBottom: 8,
  },
  destinationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
    textAlign: 'center',
  },
  destinationPrice: {
    fontSize: 14,
    color: '#1a73e8',
    fontWeight: '600',
    textAlign: 'center',
  },
});