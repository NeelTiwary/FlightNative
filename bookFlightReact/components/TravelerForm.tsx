import React, { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Dimensions
} from "react-native";
import { TextInput, Text } from "react-native-paper";
import DatePickerInput from "./DatePickerInput";
import MenuDropdown from "./MenuDropdown";
import { useAppContext } from "@/context/AppContextProvider";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { width } = Dimensions.get('window');

export interface Traveler {
  id: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  email: string;
  phoneNumber: { countryCallingCode: string; number: string };
  document: {
    documentType: string;
    number: string;
    expiryDate: string;
    issuanceDate: string;
    issuanceCountry: string;
    validityCountry: string;
    nationality: string;
    birthPlace: string;
    issuanceLocation: string;
    holder: boolean;
  };
}

type Props = {
  traveler: Traveler;
  index: number;
  handleChange: (field: string, index: number) => (value: string) => void;
  genderOptions: string[];
  documentTypeOptions: string[];
  countryCallingCodes: string[];
};

export default function TravelerForm({
  traveler,
  index,
  handleChange,
  genderOptions,
  documentTypeOptions,
  countryCallingCodes,
}: Props) {
  const { countriesData } = useAppContext();
  const [activeTab, setActiveTab] = useState("personal");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [tabIndicator] = useState(new Animated.Value(0));

  const handleFocus = (field: string) => setFocusedField(field);
  const handleBlur = () => setFocusedField(null);

  const handleTabChange = (tabKey: string) => {
    setActiveTab(tabKey);
    Keyboard.dismiss();
    
    // Animate tab indicator
    Animated.spring(tabIndicator, {
      toValue: tabKey === "personal" ? 0 : 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 0
    }).start();
  };

  const translateX = tabIndicator.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width / 2]
  });

  const TabButton = ({ title, tabKey, icon }) => (
    <TouchableOpacity 
      style={[styles.tab, activeTab === tabKey && styles.activeTab]} 
      onPress={() => handleTabChange(tabKey)}
      activeOpacity={0.7}
    >
      <MaterialCommunityIcons 
        name={icon} 
        size={20} 
        color={activeTab === tabKey ? "#4F46E5" : "#64748B"} 
        style={styles.tabIcon}
      />
      <Text style={[styles.tabText, activeTab === tabKey && styles.activeTabText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const InputField = ({ label, value, onChange, type = "default", style = {}, ...props }) => (
    <TextInput
      label={label}
      mode="outlined"
      value={value || ""}
      onChangeText={onChange}
      style={[styles.input, style]}
      dense
      outlineColor="#E2E8F0"
      activeOutlineColor="#4F46E5"
      keyboardType={type}
      autoCapitalize={type === "email-address" ? "none" : "words"}
      theme={{ 
        colors: { 
          background: '#FFFFFF',
          onSurfaceVariant: '#94A3B8',
          text: '#1E293B'
        },
        roundness: 10,
      }}
      onFocus={() => handleFocus(label)}
      onBlur={handleBlur}
      {...props}
    />
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        {/* Header with Title and Tabs */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Traveler {index + 1}</Text>
            <View style={styles.titleUnderline} />
          </View>
          
          <View style={styles.tabContainer}>
            <TabButton title="Personal Info" tabKey="personal" icon="account-outline" />
            <TabButton title="Document" tabKey="document" icon="passport" />
            <Animated.View 
              style={[
                styles.tabIndicator,
                { transform: [{ translateX }] }
              ]} 
            />
          </View>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {activeTab === "personal" && (
              <View style={styles.tabContent}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="account-details" size={20} color="#4F46E5" />
                  <Text style={styles.sectionTitle}>Personal Information</Text>
                </View>
                
                <View style={styles.row}>
                  <InputField
                    label="First Name"
                    value={traveler.firstName}
                    onChange={(text) => handleChange("firstName", index)(text)}
                    style={styles.halfInput}
                  />
                  <InputField
                    label="Last Name"
                    value={traveler.lastName}
                    onChange={(text) => handleChange("lastName", index)(text)}
                    style={styles.halfInput}
                  />
                </View>

                <View style={styles.row}>
                  <InputField
                    label="Email"
                    value={traveler.email}
                    onChange={(text) => handleChange("email", index)(text)}
                    type="email-address"
                    style={styles.halfInput}
                  />
                  <DatePickerInput
                    handleChange={(type) => (value) => handleChange(type, index)(value)}
                    placeholderText="Date of Birth"
                    dateValue={traveler.dob ? new Date(traveler.dob).toDateString() : ""}
                    dateType="dob"
                    style={[styles.input, styles.halfInput]}
                    compact
                    mode="outlined"
                  />
                </View>

                <View style={styles.row}>
                  <View style={[styles.thirdInput, { marginRight: 12 }]}>
                    <MenuDropdown
                      items={countryCallingCodes}
                      selectedItem={traveler.phoneNumber?.countryCallingCode || ""}
                      label="Code"
                      type="phoneNumber.countryCallingCode"
                      handleChange={(type) => (val) => handleChange(type, index)(val)}
                      compact
                      mode="outlined"
                    />
                  </View>
                  <InputField
                    label="Phone Number"
                    value={traveler.phoneNumber?.number}
                    onChange={(text) => handleChange("phoneNumber.number", index)(text)}
                    type="phone-pad"
                    style={{ flex: 2 }}
                  />
                </View>

                <View style={styles.genderContainer}>
                  <View style={styles.sectionHeader}>
                    <MaterialCommunityIcons name="gender-male-female" size={18} color="#4F46E5" />
                    <Text style={styles.sectionLabel}>Gender</Text>
                  </View>
                  <View style={styles.genderOptions}>
                    {genderOptions.map((option, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={[
                          styles.genderOption,
                          traveler.gender === option && styles.genderOptionSelected
                        ]}
                        onPress={() => handleChange("gender", index)(option)}
                        activeOpacity={0.8}
                      >
                        <Text style={[
                          styles.genderText,
                          traveler.gender === option && styles.genderTextSelected
                        ]}>
                          {option}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {activeTab === "document" && (
              <View style={styles.tabContent}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="file-document" size={20} color="#4F46E5" />
                  <Text style={styles.sectionTitle}>Document Details</Text>
                </View>
                
                <View style={styles.row}>
                  <View style={[styles.halfInput, { marginRight: 12 }]}>
                    <MenuDropdown
                      items={documentTypeOptions}
                      selectedItem={traveler.document?.documentType || ""}
                      label="Document Type"
                      type="document.documentType"
                      handleChange={(type) => (val) => handleChange(type, index)(val)}
                      compact
                      mode="outlined"
                    />
                  </View>
                  <InputField
                    label="Document Number"
                    value={traveler.document?.number}
                    onChange={(text) => handleChange("document.number", index)(text)}
                    style={styles.halfInput}
                  />
                </View>

                <View style={styles.row}>
                  <View style={[styles.halfInput, { marginRight: 12 }]}>
                    <DatePickerInput
                      handleChange={(type) => (value) => handleChange(type, index)(value)}
                      placeholderText="Issuance Date"
                      dateValue={traveler.document?.issuanceDate ? new Date(traveler.document.issuanceDate).toDateString() : ""}
                      dateType="document.issuanceDate"
                      compact
                      mode="outlined"
                    />
                  </View>
                  <View style={styles.halfInput}>
                    <DatePickerInput
                      handleChange={(type) => (value) => handleChange(type, index)(value)}
                      placeholderText="Expiry Date"
                      dateValue={traveler.document?.expiryDate ? new Date(traveler.document.expiryDate).toDateString() : ""}
                      dateType="document.expiryDate"
                      compact
                      mode="outlined"
                    />
                  </View>
                </View>

                <View style={styles.row}>
                  <InputField
                    label="Birth Place"
                    value={traveler.document?.birthPlace}
                    onChange={(text) => handleChange("document.birthPlace", index)(text)}
                    placeholder="e.g., Delhi"
                    style={styles.halfInput}
                  />
                  <InputField
                    label="Issuance Location"
                    value={traveler.document?.issuanceLocation}
                    onChange={(text) => handleChange("document.issuanceLocation", index)(text)}
                    placeholder="e.g., Delhi"
                    style={styles.halfInput}
                  />
                </View>

                <View style={styles.row}>
                  <InputField
                    label="Issuance Country"
                    value={traveler.document?.issuanceCountry}
                    onChange={(text) => handleChange("document.issuanceCountry", index)(text)}
                    placeholder="ISO Code"
                    style={styles.thirdInput}
                  />
                  <InputField
                    label="Validity Country"
                    value={traveler.document?.validityCountry}
                    onChange={(text) => handleChange("document.validityCountry", index)(text)}
                    placeholder="ISO Code"
                    style={styles.thirdInput}
                  />
                  <InputField
                    label="Nationality"
                    value={traveler.document?.nationality}
                    onChange={(text) => handleChange("document.nationality", index)(text)}
                    placeholder="ISO Code"
                    style={styles.thirdInput}
                  />
                </View>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  titleContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  titleUnderline: {
    height: 3,
    width: 40,
    backgroundColor: '#4F46E5',
    borderRadius: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 6,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    zIndex: 2,
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
  },
  tabIndicator: {
    position: 'absolute',
    width: '50%',
    height: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    top: '10%',
    left: '5%',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  tabIcon: {
    marginRight: 8,
  },
  tabText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 30,
  },
  tabContent: {
    gap: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginLeft: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  input: {
    backgroundColor: '#FFFFFF',
  },
  halfInput: {
    flex: 1,
  },
  thirdInput: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
    marginLeft: 8,
  },
  genderContainer: {
    marginTop: 8,
  },
  genderOptions: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 5,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  genderOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  genderOptionSelected: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  genderText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  genderTextSelected: {
    color: '#4F46E5',
    fontWeight: '600',
  },
});