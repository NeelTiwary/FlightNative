import AutocompleteInput from '@/components/AutocompleteInput';
import DatePickerInput from '@/components/DatePickerInput';
import MenuDropdown from '@/components/MenuDropdown';
import axiosInstance from '@/config/axiosConfig';
import { useAppContext } from '@/context/AppContextProvider';
import { useRouter } from 'expo-router';
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Button, IconButton, Text, TextInput, useTheme } from "react-native-paper";
import { convertToQueryParams } from "../utils/helper";

export default function Home() {
  const {
    searchParams,
    setSearchParams,
    fromLoading,
    setFromLoading,
    fromInput,
    setFromInput,
    fromSuggestions,
    setFromSuggestions,
    toLoading,
    setToLoading,
    toInput,
    setToInput,
    toSuggestions,
    setToSuggestions,
    setFlightOffers,
    flightClasses,
    apiUrl, setApiUrl
  } = useAppContext();

  const theme = useTheme();

  const [offersLoading, setOffersLoading] = useState(false);
  const [inputUrl, setInputUrl] = useState("");
  const [showReturnDate, setShowReturnDate] = useState(false);
  
  const router = useRouter();

  const fetchSuggestions = async (type: 'from' | 'to', keyword: string) => {
    try {
      if (keyword.length < 3) return;
      type === "from" ? setFromLoading(true) : setToLoading(true);
      const response = await axiosInstance.get(`/locations/search?keyword=${keyword}`);
      // const response = await axios.get(`${apiUrl}/locations/search?keyword=${keyword}`);

      // const suggestions = response.data?.flatMap((entry: any) => {
      //   return entry.groupData.length > 0 ? [entry, ...entry.groupData] : [entry];
      // });

      const suggestions = response.data.locationResponses
      .flatMap((entry: any) => (
        entry.group_data.simpleAirports.length > 0 
        ? [entry, ...entry.group_data.simpleAirports] 
        : [entry]
      ));
      
      if (type === 'from') setFromSuggestions(suggestions);

      if (type === 'to') setToSuggestions(suggestions);
    } catch (error: any) {
      console.error("Error fetching suggestions: ", error);
      alert("Failed to fetch suggestions. Please try again.");
      if (type === 'from') setFromSuggestions([]);
      if (type === 'to') setToSuggestions([]);
      return;
    } finally {
      type === "from" ? setFromLoading(false) : setToLoading(false);
    }
  }

  const handleFromInputChange = (text: string) => {
    if (text == "" || text == null || text == undefined) {
      setFromSuggestions([]);
      setFromInput("");
      setFromLoading(false);
      setSearchParams({ ...searchParams, from: "" });
      return;
    }
    setFromInput(text);
    setFromLoading(true);
    fetchSuggestions('from', text).then(() => {
      setFromLoading(false);
    });
  }

  const handleToInputChange = (text: string) => {
    if (text == "" || text == null || text == undefined) {
      setToSuggestions([]);
      setToInput("");
      setToLoading(false);
      setSearchParams({ ...searchParams, to: "" });
      return;
    }
    setToInput(text);
    setToLoading(true);
    fetchSuggestions('to', text).then(() => {
      setToLoading(false);
    });
  }

  const handleChange = (field: keyof typeof searchParams) => (value: string) => {
    setSearchParams({
      ...searchParams,
      [field]: value
    });
  }

  const swapLocations = () => {
    if (!searchParams.from || !searchParams.to) return;
    const temp = searchParams.from;
    setFromInput(toInput);
    setToInput(fromInput);
    setFromSuggestions([]);
    setToSuggestions([]);
    setFromLoading(false);
    setToLoading(false);
    setSearchParams((prev: any) => {
      return {
        ...prev,
        from: prev.to,
        to: temp
      }
    });
  }

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
      const queryparams = convertToQueryParams(params);
      const response = await axiosInstance.get(`/flights/search?${queryparams}`);
      // const response = await axios.get(`${apiUrl}/flights/search?${queryparams}`);
      // console.log("Flight offers response: ", response);
      setFlightOffers(response.data.flightsAvailable);
      setTimeout(() => {
        router.push("./offers");
      }, 50);
    } catch (error) {
      console.error("Error fetching flight offers: ", error);
      alert("Failed to fetch flight offers. Please try again.");
      setOffersLoading(false);
    } finally {
      setOffersLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      {/* <TextInput 
        label="set the api url"
        mode="outlined"
        style={styles.input}
        value={inputUrl}
        onChangeText={setInputUrl}
      />
      <Button mode='outlined' onPress={() => setApiUrl("http://"+inputUrl.trim().toLowerCase()+":8080")}>set url</Button> */}

      {/* <Button onPress={() => console.log(searchParams)}>searchParams</Button> */}
      <View>
        <AutocompleteInput
          options={fromSuggestions}
          inputLabel={"From"}
          inputValue={fromInput}
          onInputChange={handleFromInputChange}
          onSelectOption={(option: any) => {
            // console.log("Selected from option: ", option);
            setSearchParams({ ...searchParams, from: option.iata });
            setFromInput(option.name);
          }}
          loading={fromLoading}
          icon={"airplane-takeoff"}
        />
      </View>
      <IconButton
        icon="swap-vertical"
        size={24}
        onPress={swapLocations}
        style={{ marginTop: -20, marginBottom: -6, alignSelf: 'center' }}
      />
      <View>
        <AutocompleteInput
          options={toSuggestions}
          inputLabel={"To"}
          inputValue={toInput}
          onInputChange={handleToInputChange}
          onSelectOption={(option: any) => {
            setSearchParams({ ...searchParams, to: option.iata });
            setToInput(option.name);
          }}
          loading={toLoading}
          icon={"airplane-landing"}
        />
      </View>

      <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
        <View style={{ width: '48%'}}>
          <TextInput
            label="Passengers"
            value={searchParams.adults.toString()}
            onChangeText={handleChange('adults')}
            keyboardType="numeric"
            style={styles.input}
            left={<TextInput.Icon icon="account" />}
          // textContentType='numeric'
          />
        </View>

        <View style={[styles.input, {width: '48%', marginTop: 0}]}>
          <MenuDropdown 
            items={flightClasses}
            selectedItem={searchParams.flightClass}
            label="Select Flight Class"
            type="flightClass"
            handleChange={handleChange}
            styles={{
              marginTop: 45,
              fontWeight: searchParams.flightClass ? 'bold' : 'normal',
              fontSize: 16,
            }}
          />
        </View>
      </View>

      <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ width: '48%' }}>
          <DatePickerInput
            handleChange={handleChange}
            placeholderText="Departure Date"
            dateValue={searchParams.departureDate ? new Date(searchParams.departureDate).toDateString() : ""}
            dateType='departureDate'
          />
        </View>
        <View style={{ width: '48%' }}>
          {
            showReturnDate ? 
            (
            <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
              <View style={{ flex: 1 }}>
                <DatePickerInput
                  handleChange={handleChange}
                  placeholderText="+ Add Return Date"
                  dateValue={searchParams.returnDate ? new Date(searchParams.returnDate).toDateString() : ""}
                  dateType='returnDate'
                />
              </View>
              <IconButton
                style={{ 
                  position: 'absolute', 
                  right: -15, top: -15, zIndex: 1, 
                  borderRadius: 50, 
                  backgroundColor: theme.colors.errorContainer, 
                  width: 18, height: 18 
                }}
                icon="close"
                size={14}
                onPress={() => {
                  setShowReturnDate(false);
                  setSearchParams({ ...searchParams, returnDate: null });
                }}
              />
              </View>
              ) : 
              (<View style={{ padding: 0 }}>
                 <Pressable onPress={() => setShowReturnDate(true)}>
                    <Text style={{ fontSize: 16, color: theme.colors.secondary, textAlign: 'center' }}>
                      + Add Return Date
                    </Text>
                    <Text style={{ fontSize: 12, color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
                      (optional)
                    </Text>
                  </Pressable>
              </View>)
          }
        </View>
      </View>

      <Button
        mode="contained"
        onPress={handleSubmit}
        style={styles.button}
        loading={offersLoading}
        disabled={offersLoading}
      >
        {offersLoading ? "Searching" : "Search Flights"}
      </Button>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
  },
});